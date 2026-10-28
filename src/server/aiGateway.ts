// ────────────────────────────────────────────────────────────────────────────
// AI Provider Gateway
// Routes generation across OpenAI (ChatGPT), Anthropic (Claude), Google (Gemini)
// and Higgsfield with automatic fallback cascades and per-provider circuit
// breakers. Providers are opt-in via environment variables; when every provider
// is unavailable the endpoints degrade to their procedural fallbacks.
// ────────────────────────────────────────────────────────────────────────────
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { higgsfield, config as higgsfieldConfig } from '@higgsfield/client/v2';

import { routeTask } from './aiDirector';
import {
  getAnthropicModels, getOpenAITextModels, getGeminiTextModels,
  getOpenAIImageModels, getGeminiImageModels, getHiggsfieldEndpoints,
  type TaskType, type PowerLevel,
} from './aiModels';
export type { TaskType, PowerLevel } from './aiModels';

export type TextProvider = 'auto' | 'openai' | 'anthropic' | 'gemini';
export type ImageProvider = 'auto' | 'openai' | 'gemini' | 'higgsfield';

// ── Model ladders ──────────────────────────────────────────────────────────
// Each text provider exposes a LADDER: biggest/strongest model first, cheapest
// last. Requests declare a task tier ('max' | 'standard' | 'lite') and get the
// strongest slice of the ladder; the per-model cascade walks DOWN the ladder
// when a model is quota-limited/busy, so a small request never gets stuck
// behind a flagship model and a big request always starts with the best one.
//
// Env overrides (comma-separated, strongest first):
//   OPENAI_TEXT_MODELS / ANTHROPIC_TEXT_MODELS / GEMINI_TEXT_MODELS
// The old singular overrides (OPENAI_MODEL / ANTHROPIC_MODEL) still work and
// replace the FIRST rung of their ladder (backward compatible).
export type TaskTier = 'max' | 'standard' | 'lite';

const OPENAI_TEXT_LADDER = ['gpt-5.6-astra', 'gpt-4o', 'gpt-4o-mini'];
const ANTHROPIC_TEXT_LADDER = ['claude-fable-5.1', 'claude-sonnet-4-5', 'claude-3-5-haiku-latest'];
const GEMINI_TEXT_LADDER = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const HIGGSFIELD_ENDPOINT =
  process.env.HIGGSFIELD_ENDPOINT || 'flux-pro/kontext/max/text-to-image';
const GEMINI_IMAGE_MODELS = ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];

/**
 * Parses a comma-separated model list.
 *
 * @param value - The model list to parse.
 * @returns The trimmed, non-empty model names, or an empty array when `value` is unset or empty.
 */
export function parseModelList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((m) => m.trim())
    .filter((m) => m.length > 0);
}

/**
 * Selects the models to try for a task tier, ordered by preference.
 *
 * @param defaults - Default model ladder ordered from strongest to cheapest
 * @param tier - Task tier determining how many models to include
 * @param envLadder - Parsed environment override ladder that replaces `defaults` when provided
 * @param singularEnvModel - Legacy model override pinned to the front of the ladder
 * @returns The deduplicated models selected for the requested tier
 */
export function pickModelsForTier(
  defaults: string[],
  tier: TaskTier,
  envLadder: string[],
  singularEnvModel?: string
): string[] {
  let ladder = envLadder.length > 0 ? [...envLadder] : [...defaults];
  if (singularEnvModel) {
    // Not in the ladder -> replaces the top rung; already present -> pinned to
    // the front. Either way the legacy override is always tried first.
    const without = ladder.filter((m) => m !== singularEnvModel);
    ladder = [
      singularEnvModel,
      ...(ladder.includes(singularEnvModel) ? without : without.slice(1)),
    ];
  }
  const deduped = [...new Set(ladder)];
  if (tier === 'max') return deduped;
  if (tier === 'standard') return deduped.slice(0, Math.max(1, deduped.length - 1));
  return deduped.slice(-1);
}

// Per-model circuit breakers (shared by every provider's ladder walk).
const modelCooldowns = new Map<string, number>();
/**
 * Determines whether a model is currently subject to a cooldown.
 *
 * @param key - The model cooldown key
 * @returns `true` if the cooldown is active, `false` otherwise.
 */
function onModelCooldown(key: string): boolean {
  return Date.now() < (modelCooldowns.get(key) || 0);
}
/**
 * Sets the expiration time for a model cooldown.
 *
 * @param key - The model cooldown key
 * @param ms - The cooldown duration in milliseconds
 */
function setModelCooldown(key: string, ms: number) {
  modelCooldowns.set(key, Date.now() + ms);
}

/**
 * Selects the token budget for a text-generation request.
 *
 * @param tier - The requested task tier.
 * @param requested - An optional positive token budget that takes precedence.
 * @returns The requested budget when positive; otherwise, 8192 for the `max` tier or 4096 for other tiers.
 */
function tierMaxTokens(tier: TaskTier | undefined, requested?: number): number {
  if (requested && requested > 0) return requested;
  return tier === 'max' ? 8192 : 4096;
}

/**
 * Determines whether an error message indicates an authentication or credential failure.
 *
 * @param message - The error message to classify
 * @returns `true` if the message indicates an authentication or credential failure, `false` otherwise.
 */
function isAuthError(message: string): boolean {
  return (
    /\b401\b/.test(message) ||
    /\b403\b/.test(message) ||
    /invalid[ _-]?(api[ _-])?key/i.test(message) ||
    /unauthorized|incorrect api key|authentication/i.test(message)
  );
}

// ── Circuit breakers ──────────────────────────────────────────────────────
const providerCooldowns = new Map<string, number>();
const COOLDOWN_QUOTA = 120_000;
const COOLDOWN_BUSY = 30_000;

function onCooldown(key: string): boolean {
  return Date.now() < (providerCooldowns.get(key) || 0);
}
function setCooldown(key: string, ms: number) {
  providerCooldowns.set(key, Date.now() + ms);
}
function classifyError(message: string): 'quota' | 'busy' | null {
  if (
    message.includes('429') ||
    message.includes('quota') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('limit: 0') ||
    message.includes('insufficient_quota')
  ) {
    return 'quota';
  }
  if (
    message.includes('503') ||
    message.includes('UNAVAILABLE') ||
    message.includes('overloaded') ||
    message.includes('temporar') ||
    message.includes('busy') ||
    message.includes('ECONNRESET') ||
    message.includes('ETIMEDOUT') ||
    message.includes('fetch failed') ||
    message.includes('socket') ||
    message.includes('high demand')
  ) {
    return 'busy';
  }
  return null;
}

// ── Lazy client factories ─────────────────────────────────────────────────
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

let anthropicClient: Anthropic | null = null;
function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropicClient;
}

let geminiClient: GoogleGenAI | null | undefined;
let geminiKeyInvalid = false;
/**
 * Gets the configured Gemini API client.
 *
 * @returns The cached Gemini client, or `null` when no API key is configured or client initialization fails.
 */
export function getGeminiClient(): GoogleGenAI | null {
  if (geminiKeyInvalid) return null;
  const rawKey = process.env.GEMINI_API_KEY?.trim();
  const apiKey = rawKey ? rawKey.replace(/^["']|["']$/g, '') : undefined;
  if (!apiKey) return null;
  if (geminiClient !== undefined) return geminiClient;
  try {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  } catch (err) {
    console.error('[Gemini API] Client initialization error:', err);
    geminiClient = null;
  }
  return geminiClient;
}

let higgsfieldConfigured = false;
/**
 * Configures the Higgsfield client from available environment credentials.
 */
function ensureHiggsfieldConfig() {
  if (higgsfieldConfigured) return;
  const creds =
    process.env.HF_CREDENTIALS ||
    (process.env.HF_API_KEY && process.env.HF_API_SECRET
      ? `${process.env.HF_API_KEY}:${process.env.HF_API_SECRET}`
      : '');
  if (creds) {
    try {
      higgsfieldConfig({ credentials: creds });
      higgsfieldConfigured = true;
    } catch (err) {
      console.warn('[Higgsfield] Config error:', err);
    }
  }
}

/**
 * Generates content using Gemini models in order with retry and cooldown-based fallback.
 *
 * @param params - The content and optional generation configuration for the request.
 * @param models - The Gemini models to try, in fallback order.
 * @returns The first response containing generated text.
 * @throws The last encountered error when all models fail.
 */

export async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: { contents: any; config?: any },
  models: string[] = GEMINI_TEXT_LADDER
) {
  let lastError: any = null;
  const now = Date.now();

  for (const model of models) {
    const key = `gemini:${model}`;
    const cooldownUntil = modelCooldowns.get(key) || 0;
    if (now < cooldownUntil) {
      const remainingSec = Math.ceil((cooldownUntil - now) / 1000);
      console.log(
        `[Gemini API] Model ${model} is on circuit-breaker cooldown (${remainingSec}s remaining). Routing to next model.`
      );
      continue;
    }

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const fetchPromise = ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('ETIMEDOUT: AI request timed out after 25s')), 25000)
        );

        const response: any = await Promise.race([fetchPromise, timeoutPromise]);
        if (response && response.text) {
          return response;
        }
      } catch (error: any) {
        lastError = error;
        const errMsg = error?.message || String(error);
        const kind = classifyError(errMsg);
        if (kind === 'quota') {
          setModelCooldown(key, COOLDOWN_QUOTA);
          console.log(`[Gemini API] Quota limit reached for ${model}. Cooldown set. Cascading.`);
          break;
        }
        if (kind === 'busy') {
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 350));
            continue;
          }
          setModelCooldown(key, COOLDOWN_BUSY);
          console.log(`[Gemini API] Model ${model} remains busy. Cooldown set. Cascading.`);
          break;
        }
        console.log(`[Gemini API] Notice for ${model}: ${errMsg.slice(0, 100)}... Cascading.`);
        break;
      }
    }
  }

  throw lastError || new Error('All Gemini models were temporarily unreachable.');
}

// ── Text generation ───────────────────────────────────────────────────────
export interface TextGenerationRequest {
  prompt: string;
  system?: string;
  jsonSchema?: any;
  requireJson?: boolean;
  preferred?: TextProvider;
  temperature?: number;
  maxTokens?: number;
  /**
   * Task size: 'max' = flagship work (Brand Bible) — start at the top of every
   * ladder; 'standard' = mid-weight tasks; 'lite' = chat/short tasks — the
   * cheapest rung only. Default: 'standard'.
   */
  tier?: TaskTier;
  /** Optional observability hook used by the AI engine; it does not affect execution. */
  onProviderAttempt?: (provider: TextProvider) => void;
  /** When false, an explicitly selected provider is not cascaded to others. */
  allowProviderFallback?: boolean;
  /** Resolved by the AI engine; legacy callers may omit this. */
  providerModelId?: string;
  providerModelProvider?: TextProvider;
  taskType?: TaskType;
  powerLevel?: PowerLevel;
}

/**
 * Determines the text provider order, prioritizing the requested provider when specified.
 *
 * @param preferred - The provider to prioritize; `auto` or an unsupported value uses the default order.
 * @returns The ordered list of text providers.
 */
function textOrder(preferred?: TextProvider, taskType?: TaskType, powerLevel?: PowerLevel): TextProvider[] {
  if ((!preferred || preferred === "auto") && taskType) {
    const selected = routeTask(taskType, { powerLevel }).selectedEngine;
    if (selected === "openai" || selected === "anthropic" || selected === "gemini") preferred = selected;
  }
  const order: TextProvider[] = ['openai', 'anthropic', 'gemini'];
  if (preferred && preferred !== 'auto' && (order as string[]).includes(preferred)) {
    return [preferred, ...order.filter((p) => p !== preferred)];
  }
  return order;
}

async function withProviderTimeout<T>(operation: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('ETIMEDOUT: AI provider request timed out')), milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export async function generateText(req: TextGenerationRequest): Promise<string> {
  let lastError: any = null;
  const providers =
    req.allowProviderFallback === false && req.preferred && req.preferred !== "auto"
      ? [req.preferred]
      : textOrder(req.preferred, req.taskType, req.powerLevel);
  for (const provider of providers) {
    const key = `text:${provider}`;
    if (onCooldown(key)) continue;
    try {
      req.onProviderAttempt?.(provider);
      const text = await withProviderTimeout(callTextProvider(provider, req), 15_000);
      if (text) return text;
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || String(err);
      const kind = classifyError(msg);
      if (kind === 'quota') setCooldown(key, COOLDOWN_QUOTA);
      else if (kind === 'busy' || msg.includes('ETIMEDOUT')) setCooldown(key, COOLDOWN_BUSY);
      console.warn(`[AI Gateway] ${provider} text failed: ${msg.slice(0, 140)}`);
    }
  }
  throw lastError || new Error('All AI text providers are unavailable.');
}

/**
 * Generates text using the selected provider.
 *
 * @param provider - The text-generation provider to use
 * @param req - The text-generation request
 * @returns The generated text, or `null` when the provider is unsupported
 */
async function callTextProvider(provider: TextProvider, req: TextGenerationRequest): Promise<string | null> {
  switch (provider) {
    case 'openai':
      return callOpenAIText(req);
    case 'anthropic':
      return callAnthropicText(req);
    case 'gemini':
      return callGeminiText(req);
    default:
      return null;
  }
}

/**
 * Generates text with OpenAI using the configured model fallback ladder.
 *
 * @param req - Text generation request, including the prompt and optional output constraints.
 * @returns The generated text, or `null` when OpenAI is not configured.
 * @throws The last model error when all configured OpenAI models fail.
 */
async function callOpenAIText(req: TextGenerationRequest): Promise<string | null> {
  const client = getOpenAI();
  if (!client) return null;
  const messages: any[] = [
    ...(req.system ? [{ role: 'system', content: req.system }] : []),
    { role: 'user', content: req.prompt },
  ];
  const ladder = pickModelsForTier(
    req.powerLevel || req.taskType ? getOpenAITextModels(req.powerLevel, req.taskType) : OPENAI_TEXT_LADDER,
    req.powerLevel || req.taskType ? 'max' : req.tier || 'standard',
    parseModelList(process.env.OPENAI_TEXT_MODELS),
    req.providerModelProvider === 'openai' ? req.providerModelId : process.env.OPENAI_MODEL || undefined
  );
  let lastError: any = null;
  for (const model of ladder) {
    const cooldownKey = `openai:${model}`;
    if (onModelCooldown(cooldownKey)) {
      console.log(`[AI Gateway] OpenAI ${model} on cooldown — stepping down the ladder.`);
      continue;
    }
    const isReasoning = /^o[134]/.test(model);
    const params: any = {
      model,
      messages: isReasoning ? messages.map((message) => message.role === 'system' ? { ...message, role: 'developer' } : message) : messages,
      ...(isReasoning
        ? { max_completion_tokens: tierMaxTokens(req.tier, req.maxTokens) }
        : { temperature: req.temperature ?? 0.7, max_tokens: tierMaxTokens(req.tier, req.maxTokens) }),
    };
    if (req.jsonSchema) {
      params.response_format = {
        type: 'json_schema',
        json_schema: { name: 'structured_result', schema: req.jsonSchema, strict: false },
      };
    } else if (req.requireJson) {
      params.response_format = { type: 'json_object' };
    }
    try {
      const resp = await client.chat.completions.create(params);
      return resp.choices?.[0]?.message?.content || null;
    } catch (err: any) {
      // Some models reject structured-output schemas; retry plain before cascading.
      if (req.jsonSchema || req.requireJson) {
        try {
          const retryParams = { ...params };
          delete retryParams.response_format;
          const resp = await client.chat.completions.create(retryParams);
          return resp.choices?.[0]?.message?.content || null;
        } catch (retryErr: any) {
          err = retryErr;
        }
      }
      lastError = err;
      const msg = err?.message || String(err);
      const kind = classifyError(msg);
      if (kind === 'quota') {
        setModelCooldown(cooldownKey, COOLDOWN_QUOTA);
        console.log(`[AI Gateway] OpenAI ${model} quota-limited — stepping down the ladder.`);
      } else if (kind === 'busy') {
        setModelCooldown(cooldownKey, COOLDOWN_BUSY);
        console.log(`[AI Gateway] OpenAI ${model} busy — stepping down the ladder.`);
      } else if (isAuthError(msg)) {
        console.warn(`[AI Gateway] OpenAI auth failed — giving up on the provider.`);
        break;
      } else {
        // Unknown-model / bad-request errors are often model-specific — step down.
        console.log(`[AI Gateway] OpenAI ${model} unavailable (${msg.slice(0, 100)}) — stepping down the ladder.`);
      }
    }
  }
  throw lastError || new Error('All OpenAI text models were unavailable.');
}

/**
 * Generates text with Anthropic using the model ladder selected for the request tier.
 *
 * @param req - The text generation request, including the prompt and optional JSON response requirements
 * @returns The generated text, or `null` if Anthropic is unavailable or produces no text
 * @throws Throws when all configured Anthropic models fail
 */
async function callAnthropicText(req: TextGenerationRequest): Promise<string | null> {
  const client = getAnthropic();
  if (!client) return null;
  const needsJson = Boolean(req.jsonSchema || req.requireJson);
  const system = req.system
    ? req.system + (needsJson ? '\n\nRespond with valid JSON only. No markdown code fences.' : '')
    : needsJson
      ? 'Respond with valid JSON only. No markdown code fences.'
      : undefined;
  const ladder = pickModelsForTier(
    req.powerLevel || req.taskType ? getAnthropicModels(req.powerLevel, req.taskType) : ANTHROPIC_TEXT_LADDER,
    req.powerLevel || req.taskType ? 'max' : req.tier || 'standard',
    parseModelList(process.env.ANTHROPIC_TEXT_MODELS),
    req.providerModelProvider === 'anthropic' ? req.providerModelId : process.env.ANTHROPIC_MODEL || undefined
  );
  let lastError: any = null;
  for (const model of ladder) {
    const cooldownKey = `anthropic:${model}`;
    if (onModelCooldown(cooldownKey)) {
      console.log(`[AI Gateway] Claude ${model} on cooldown — stepping down the ladder.`);
      continue;
    }
    try {
      const resp = await client.messages.create({
        model,
        max_tokens: tierMaxTokens(req.tier, req.maxTokens),
        system,
        messages: [{ role: 'user', content: req.prompt }],
        temperature: req.temperature ?? 0.7,
      });
      const text = (resp.content || [])
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('');
      return text || null;
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || String(err);
      const kind = classifyError(msg);
      if (kind === 'quota') {
        setModelCooldown(cooldownKey, COOLDOWN_QUOTA);
        console.log(`[AI Gateway] Claude ${model} quota-limited — stepping down the ladder.`);
      } else if (kind === 'busy') {
        setModelCooldown(cooldownKey, COOLDOWN_BUSY);
        console.log(`[AI Gateway] Claude ${model} busy — stepping down the ladder.`);
      } else if (isAuthError(msg)) {
        console.warn(`[AI Gateway] Claude auth failed — giving up on the provider.`);
        break;
      } else {
        // Unknown-model / bad-request errors are often model-specific — step down.
        console.log(`[AI Gateway] Claude ${model} unavailable (${msg.slice(0, 100)}) — stepping down the ladder.`);
      }
    }
  }
  throw lastError || new Error('All Claude text models were unavailable.');
}

/**
 * Generates text with Gemini using the requested task tier and output format.
 *
 * @param req - The text generation request, including the prompt and optional JSON configuration.
 * @returns The generated text, or `null` when the Gemini client is unavailable or no text is returned.
 */
async function callGeminiText(req: TextGenerationRequest): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;
  const needsJson = Boolean(req.jsonSchema || req.requireJson);
  const prompt = `${req.system ? req.system + '\n\n' : ''}${req.prompt}${
    req.requireJson && !req.jsonSchema ? '\nRespond with valid JSON only, no markdown.' : ''
  }`;
  const models = pickModelsForTier(
    req.powerLevel || req.taskType ? getGeminiTextModels(req.powerLevel) : GEMINI_TEXT_LADDER,
    req.powerLevel || req.taskType ? 'max' : req.tier || 'standard',
    req.providerModelProvider === 'gemini' && req.providerModelId
      ? [req.providerModelId]
      : parseModelList(process.env.GEMINI_TEXT_MODELS)
  );
  const response = await generateContentWithFallback(
    ai,
    {
      contents: prompt,
      config: {
        responseMimeType: needsJson ? 'application/json' : undefined,
        responseSchema: req.jsonSchema,
        temperature: req.temperature ?? 0.7,
      },
    },
    models
  );
  return response?.text || null;
}

// ── Image generation ──────────────────────────────────────────────────────
export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5' | '3:4';
  size?: string;
  preferred?: ImageProvider;
  /** Optional observability hook used by the AI engine; it does not affect execution. */
  onProviderAttempt?: (provider: ImageProvider) => void;
  /** When false, an explicitly selected provider is not cascaded to others. */
  allowProviderFallback?: boolean;
  /** Resolved by the AI engine; legacy callers may omit this. */
  providerModelId?: string;
  providerModelProvider?: ImageProvider;
  taskType?: TaskType;
  powerLevel?: PowerLevel;
}

export interface ImageGenerationResult {
  imageUrl: string;
  engine: string;
  format?: string;
}

function imageOrder(preferred?: ImageProvider, taskType?: TaskType, powerLevel?: PowerLevel): ImageProvider[] {
  if ((!preferred || preferred === "auto") && taskType) {
    const selected = routeTask(taskType, { powerLevel }).selectedEngine;
    if (selected === "openai" || selected === "gemini" || selected === "higgsfield") preferred = selected;
  }
  const order: ImageProvider[] = ['openai', 'gemini', 'higgsfield'];
  if (preferred && preferred !== 'auto' && (order as string[]).includes(preferred)) {
    return [preferred, ...order.filter((p) => p !== preferred)];
  }
  return order;
}

export async function generateImage(
  req: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  let lastError: any = null;
  const providers =
    req.allowProviderFallback === false && req.preferred && req.preferred !== "auto"
      ? [req.preferred]
      : imageOrder(req.preferred, req.taskType, req.powerLevel);
  for (const provider of providers) {
    const key = `image:${provider}`;
    if (onCooldown(key)) continue;
    try {
      req.onProviderAttempt?.(provider);
      const result = await withProviderTimeout(callImageProvider(provider, req), 25_000);
      if (result) return result;
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || String(err);
      const kind = classifyError(msg);
      if (kind === 'quota') setCooldown(key, COOLDOWN_QUOTA);
      else if (kind === 'busy' || msg.includes('ETIMEDOUT')) setCooldown(key, COOLDOWN_BUSY);
      console.warn(`[AI Gateway] ${provider} image failed: ${msg.slice(0, 140)}`);
    }
  }
  throw lastError || new Error('All AI image providers are unavailable.');
}

async function callImageProvider(
  provider: ImageProvider,
  req: ImageGenerationRequest
): Promise<ImageGenerationResult | null> {
  switch (provider) {
    case 'openai':
      return callOpenAIImage(req);
    case 'gemini':
      return callGeminiImage(req);
    case 'higgsfield':
      return callHiggsfieldImage(req);
    default:
      return null;
  }
}

/**
 * Generates an image with OpenAI using the requested prompt and aspect ratio.
 *
 * @param req - The image generation request containing the prompt and optional aspect ratio
 * @returns The generated image as a data URL or hosted URL, or `null` when OpenAI is unavailable or returns no image
 */
async function callOpenAIImage(req: ImageGenerationRequest): Promise<ImageGenerationResult | null> {
  const client = getOpenAI();
  if (!client) return null;
  const sizeMap: Record<string, string> = {
    '1:1': '1024x1024',
    '16:9': '1536x1024',
    '9:16': '1024x1536',
    '4:5': '1024x1536',
    '3:4': '1024x1536',
  };
  const models = [...new Set([
    ...(req.providerModelProvider === 'openai' && req.providerModelId ? [req.providerModelId] : []),
    ...getOpenAIImageModels(),
  ])];
  let lastErr: any = null;

  for (const model of models) {
    const key = `image:openai:${model}`;
    if (onCooldown(key)) continue;

    try {
      const isDalle2 = model === 'dall-e-2';
      const size = sizeMap[req.aspectRatio || '1:1'] || '1024x1024';
      const dalleSize = size === '1536x1024' ? '1792x1024' : size === '1024x1536' ? '1024x1792' : size;
      const resp = await client.images.generate({
        model,
        prompt: req.prompt,
        size: (isDalle2 ? '1024x1024' : model === 'dall-e-3' ? dalleSize : size) as any,
        quality: model.startsWith('dall-e-') ? 'standard' : 'high',
      });
      const item = resp.data?.[0];
      if (item?.b64_json) {
        return { imageUrl: `data:image/png;base64,${item.b64_json}`, engine: 'openai', format: 'png' };
      }
      if (item?.url) {
        return { imageUrl: item.url, engine: 'openai' };
      }
    } catch (err: any) {
      lastErr = err;
      const msg = err?.message || String(err);
      console.warn(`[AI Gateway] OpenAI image model ${model} error: ${msg.slice(0, 140)}`);
      const kind = classifyError(msg);
      if (kind === 'quota') setCooldown(key, COOLDOWN_QUOTA);
      else if (kind === 'busy' || msg.includes('ETIMEDOUT')) setCooldown(key, COOLDOWN_BUSY);
    }
  }

  if (lastErr) throw lastErr;
  return null;
}

async function callGeminiImage(req: ImageGenerationRequest): Promise<ImageGenerationResult | null> {
  const ai = getGeminiClient();
  if (!ai) return null;
  const models = req.providerModelProvider === 'gemini' && req.providerModelId
    ? [req.providerModelId]
    : parseModelList(process.env.GEMINI_IMAGE_MODELS).length
      ? parseModelList(process.env.GEMINI_IMAGE_MODELS)
      : getGeminiImageModels();

  for (const model of models) {
    const key = `image:gemini:${model}`;
    if (onCooldown(key)) continue;
    try {
      if (model.startsWith('imagen-')) {
        const response = await ai.models.generateImages({
          model,
          prompt: req.prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: (req.aspectRatio as any) || '1:1',
          },
        });
        const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
        if (imageBytes) {
          return {
            imageUrl: `data:image/png;base64,${imageBytes}`,
            engine: 'gemini',
            format: 'png',
          };
        }
      } else {
        const config: any = { imageConfig: { aspectRatio: req.aspectRatio || '1:1' } };
        if (model.includes('flash-image') && req.size && ['512px', '1K', '2K', '4K'].includes(req.size)) {
          config.imageConfig.imageSize = req.size;
        }
        const response = await ai.models.generateContent({
          model,
          contents: { parts: [{ text: req.prompt }] },
          config,
        });
        const candidates = response.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              return {
                imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                engine: 'gemini',
                format: 'png',
              };
            }
          }
        }
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
        console.log(`[Gemini API] Fatal error for ${model}: API Key is invalid. Aborting provider permanently.`);
        geminiKeyInvalid = true;
        geminiClient = null;
        throw err;
      }
      const kind = classifyError(msg);
      if (kind === 'quota') setCooldown(key, COOLDOWN_QUOTA);
      else if (kind === 'busy' || msg.includes('ETIMEDOUT')) setCooldown(key, COOLDOWN_BUSY);
      else console.warn(`[AI Gateway] Gemini image model ${model}: ${msg.slice(0, 120)}`);
    }
  }
  return null;
}

async function callHiggsfieldImage(req: ImageGenerationRequest): Promise<ImageGenerationResult | null> {
  ensureHiggsfieldConfig();
  if (!higgsfieldConfigured && !process.env.HF_CREDENTIALS) return null;
  const endpoints = [...new Set([
    ...(req.providerModelProvider === 'higgsfield' && req.providerModelId ? [req.providerModelId] : []),
    ...getHiggsfieldEndpoints(),
  ])];
  let lastErr: any = null;

  for (const endpoint of endpoints) {
    const key = `image:higgsfield:${endpoint}`;
    if (onCooldown(key)) continue;

    try {
      const response = await higgsfield.subscribe(endpoint, {
        input: {
          prompt: req.prompt,
          aspect_ratio: req.aspectRatio || '1:1',
          safety_tolerance: 2,
        },
        withPolling: true,
      });
      if (response && response.status === 'completed') {
        const url = response.images?.[0]?.url;
        if (url) return { imageUrl: url, engine: 'higgsfield' };
      }
    } catch (err: any) {
      lastErr = err;
      const msg = err?.message || String(err);
      console.warn(`[AI Gateway] Higgsfield endpoint ${endpoint} error: ${msg.slice(0, 140)}`);
      const kind = classifyError(msg);
      if (kind === 'quota') setCooldown(key, COOLDOWN_QUOTA);
      else if (kind === 'busy' || msg.includes('ETIMEDOUT')) setCooldown(key, COOLDOWN_BUSY);
    }
  }

  if (lastErr) throw lastErr;
  return null;
}