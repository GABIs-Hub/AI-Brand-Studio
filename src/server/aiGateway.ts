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

import {
  TextProvider,
  ImageProvider,
  TaskType,
  PowerLevel,
  getAnthropicModels,
  getOpenAITextModels,
  getOpenAIImageModels,
  getGeminiTextModels,
  getGeminiImageModels,
  getHiggsfieldEndpoints,
} from './aiModels';

export type { TextProvider, ImageProvider, TaskType, PowerLevel };

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
  const rawKey = process.env.OPENAI_API_KEY?.trim();
  const key = rawKey ? rawKey.replace(/^["']|["']$/g, '') : undefined;
  if (!key) return null;
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: key });
  return openaiClient;
}

let anthropicClient: Anthropic | null = null;
function getAnthropic(): Anthropic | null {
  const rawKey = process.env.ANTHROPIC_API_KEY?.trim();
  const key = rawKey ? rawKey.replace(/^["']|["']$/g, '') : undefined;
  if (!key) return null;
  if (!anthropicClient) anthropicClient = new Anthropic({ apiKey: key });
  return anthropicClient;
}

let geminiClient: GoogleGenAI | null | undefined;
let geminiKeyInvalid = false;

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
function ensureHiggsfieldConfig() {
  if (higgsfieldConfigured) return;
  const creds =
    process.env.HF_CREDENTIALS?.trim() ||
    (process.env.HF_API_KEY?.trim() && process.env.HF_API_SECRET?.trim()
      ? `${process.env.HF_API_KEY.trim()}:${process.env.HF_API_SECRET.trim()}`
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

// ── Gemini helper (moved from server.ts, kept for compatibility) ──────────
const modelCooldowns = new Map<string, number>();

export async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: { contents: any; config?: any },
  models: string[] = getGeminiTextModels()
) {
  let lastError: any = null;
  const now = Date.now();

  for (const model of models) {
    const cooldownUntil = modelCooldowns.get(model) || 0;
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
          modelCooldowns.set(model, Date.now() + COOLDOWN_QUOTA);
          console.log(`[Gemini API] Quota limit reached for ${model}. Cooldown set. Cascading.`);
          break;
        }
        if (kind === 'busy') {
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 350));
            continue;
          }
          modelCooldowns.set(model, Date.now() + COOLDOWN_BUSY);
          console.log(`[Gemini API] Model ${model} remains busy. Cooldown set. Cascading.`);
          break;
        }
        
        if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
          console.log(`[Gemini API] Fatal error for ${model}: API Key is invalid. Aborting provider permanently.`);
          geminiKeyInvalid = true;
          geminiClient = null;
          throw error;
        }

        console.log(`[Gemini API] Notice for ${model}: ${errMsg.slice(0, 100)}... Cascading.`);
        break;
      }
    }
  }

  throw lastError || new Error('All Gemini models were temporarily unreachable.');
}

import { routeTask } from './aiDirector';

// ── Text generation ───────────────────────────────────────────────────────
export interface TextGenerationRequest {
  prompt: string;
  system?: string;
  jsonSchema?: any;
  requireJson?: boolean;
  preferred?: TextProvider;
  temperature?: number;
  maxTokens?: number;
  taskType?: TaskType;
  powerLevel?: PowerLevel;
}

function textOrder(preferred?: TextProvider, taskType?: TaskType, powerLevel?: PowerLevel): TextProvider[] {
  // If user explicitly pinned a provider, respect their preference
  if (preferred && preferred !== 'auto') {
    const base: TextProvider[] = ['gemini', 'openai', 'anthropic'];
    return [preferred, ...base.filter((p) => p !== preferred)];
  }

  // Otherwise, use AI Director's intelligent routing
  if (taskType) {
    const decision = routeTask(taskType, { powerLevel });
    const selected = decision.selectedEngine;
    if (selected === 'gemini' || selected === 'openai' || selected === 'anthropic') {
      const remaining: TextProvider[] = (['gemini', 'openai', 'anthropic'] as TextProvider[]).filter(
        (p) => p !== selected
      );
      return [selected, ...remaining];
    }
  }

  // Default context cascade: Gemini (high speed + 3.7 reasoning) -> OpenAI -> Claude
  return ['gemini', 'openai', 'anthropic'];
}

export async function generateText(req: TextGenerationRequest): Promise<string> {
  let lastError: any = null;
  const order = textOrder(req.preferred, req.taskType, req.powerLevel);
  for (let i = 0; i < order.length; i++) {
    const provider = order[i];
    const key = `text:${provider}`;
    if (onCooldown(key)) {
      console.log(`[Telemetry] Skipping text provider ${provider} (circuit breaker active).`);
      continue;
    }
    try {
      // 15 second timeout for text generation to prevent UI hanging
      const fetchPromise = callTextProvider(provider, req);
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error(`ETIMEDOUT: ${provider} text request timed out after 15s`)), 15000)
      );
      
      const text = await Promise.race([fetchPromise, timeoutPromise]);
      if (text) {
        if (i > 0) {
          console.log(`[Telemetry] AI Director fallback cascade successfully engaged: switched to ${provider}.`);
        }
        return text;
      }
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || String(err);
      const kind = classifyError(msg);
      if (kind === 'quota') setCooldown(key, COOLDOWN_QUOTA);
      else if (kind === 'busy' || msg.includes('ETIMEDOUT')) setCooldown(key, COOLDOWN_BUSY);
      console.log(`[Telemetry] AI Circuit Breaker tripped for ${provider} (text). Error: ${msg.slice(0, 140)}`);
    }
  }
  throw lastError || new Error('All AI text providers are unavailable.');
}

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

async function callOpenAIText(req: TextGenerationRequest): Promise<string | null> {
  const client = getOpenAI();
  if (!client) return null;
  const candidateModels = getOpenAITextModels(req.powerLevel, req.taskType);
  let lastErr: any = null;

  for (const model of candidateModels) {
    const key = `text:openai:${model}`;
    if (onCooldown(key)) continue;

    const isReasoning = model.startsWith('o1') || model.startsWith('o3');
    const messages: any[] = [];
    if (req.system) {
      messages.push({
        role: isReasoning ? 'developer' : 'system',
        content: req.system,
      });
    }
    messages.push({ role: 'user', content: req.prompt });

    const params: any = {
      model,
      messages,
    };

    if (isReasoning) {
      params.max_completion_tokens = req.maxTokens || 4096;
    } else {
      params.max_tokens = req.maxTokens || 4096;
      params.temperature = req.temperature ?? 0.7;
    }

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
      const content = resp.choices?.[0]?.message?.content || null;
      if (content) return content;
    } catch (err: any) {
      lastErr = err;
      const msg = err?.message || String(err);
      console.warn(`[AI Gateway] OpenAI text model ${model} error: ${msg.slice(0, 140)}`);
      const kind = classifyError(msg);
      if (kind === 'quota') setCooldown(key, COOLDOWN_QUOTA);
      else if (kind === 'busy') setCooldown(key, COOLDOWN_BUSY);

      // Some models reject structured-output schemas; retry plain before cascading to next model
      if (req.jsonSchema || req.requireJson) {
        try {
          const retryParams = { ...params };
          delete retryParams.response_format;
          const retryResp = await client.chat.completions.create(retryParams);
          const retryText = retryResp.choices?.[0]?.message?.content || null;
          if (retryText) return retryText;
        } catch {
          // cascade to next candidate model
        }
      }
    }
  }

  if (lastErr) throw lastErr;
  return null;
}

async function callAnthropicText(req: TextGenerationRequest): Promise<string | null> {
  const client = getAnthropic();
  if (!client) return null;
  const candidateModels = getAnthropicModels(req.powerLevel, req.taskType);
  const needsJson = Boolean(req.jsonSchema || req.requireJson);
  const system = req.system
    ? req.system + (needsJson ? '\n\nRespond with valid JSON only. No markdown code fences.' : '')
    : needsJson
      ? 'Respond with valid JSON only. No markdown code fences.'
      : undefined;

  let lastErr: any = null;
  for (const model of candidateModels) {
    const key = `text:anthropic:${model}`;
    if (onCooldown(key)) continue;

    try {
      const resp = await client.messages.create({
        model,
        max_tokens: req.maxTokens || 4096,
        system,
        messages: [{ role: 'user', content: req.prompt }],
        temperature: req.temperature ?? 0.7,
      });
      const text = (resp.content || [])
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('');
      if (text) return text;
    } catch (err: any) {
      lastErr = err;
      const msg = err?.message || String(err);
      console.warn(`[AI Gateway] Anthropic model ${model} error: ${msg.slice(0, 140)}`);
      const kind = classifyError(msg);
      if (kind === 'quota') setCooldown(key, COOLDOWN_QUOTA);
      else if (kind === 'busy') setCooldown(key, COOLDOWN_BUSY);
    }
  }

  if (lastErr) throw lastErr;
  return null;
}

async function callGeminiText(req: TextGenerationRequest): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;
  const needsJson = Boolean(req.jsonSchema || req.requireJson);
  const prompt = `${req.system ? req.system + '\n\n' : ''}${req.prompt}${
    req.requireJson && !req.jsonSchema ? '\nRespond with valid JSON only, no markdown.' : ''
  }`;
  const models = getGeminiTextModels(req.powerLevel);

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
  aspectRatio?: '1:1' | '16:9' | '9:16';
  size?: string;
  preferred?: ImageProvider;
  taskType?: TaskType;
  powerLevel?: PowerLevel;
}

export interface ImageGenerationResult {
  imageUrl: string;
  engine: string;
  format?: string;
}

function imageOrder(preferred?: ImageProvider, taskType?: TaskType, powerLevel?: PowerLevel): ImageProvider[] {
  if (preferred && preferred !== 'auto') {
    const base: ImageProvider[] = ['higgsfield', 'openai', 'gemini'];
    return [preferred, ...base.filter((p) => p !== preferred)];
  }

  if (taskType === 'photorealistic_mockup') {
    const decision = routeTask(taskType, { powerLevel });
    const selected = decision.selectedEngine as ImageProvider;
    if (['higgsfield', 'openai', 'gemini'].includes(selected)) {
      const remaining: ImageProvider[] = (['higgsfield', 'openai', 'gemini'] as ImageProvider[]).filter(
        (p) => p !== selected
      );
      return [selected, ...remaining];
    }
  }

  return ['higgsfield', 'openai', 'gemini'];
}

export async function generateImage(
  req: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  let lastError: any = null;
  const order = imageOrder(req.preferred, req.taskType, req.powerLevel);
  for (let i = 0; i < order.length; i++) {
    const provider = order[i];
    const key = `image:${provider}`;
    if (onCooldown(key)) {
      console.log(`[Telemetry] Skipping image provider ${provider} (circuit breaker active).`);
      continue;
    }
    try {
      // 25 second timeout for image generation
      const fetchPromise = callImageProvider(provider, req);
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error(`ETIMEDOUT: ${provider} image request timed out after 25s`)), 25000)
      );
      
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      if (result) {
        if (i > 0) {
          console.log(`[Telemetry] Successfully fell back to ${provider} for image generation.`);
        }
        return result;
      }
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || String(err);
      const kind = classifyError(msg);
      if (kind === 'quota') setCooldown(key, COOLDOWN_QUOTA);
      else if (kind === 'busy' || msg.includes('ETIMEDOUT')) setCooldown(key, COOLDOWN_BUSY);
      console.log(`[Telemetry] AI Circuit Breaker tripped for ${provider} (image). Error: ${msg.slice(0, 140)}`);
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

async function callOpenAIImage(req: ImageGenerationRequest): Promise<ImageGenerationResult | null> {
  const client = getOpenAI();
  if (!client) return null;
  const sizeMap: Record<string, string> = {
    '1:1': '1024x1024',
    '16:9': '1536x1024',
    '9:16': '1024x1536',
  };
  const models = getOpenAIImageModels();
  let lastErr: any = null;

  for (const model of models) {
    const key = `image:openai:${model}`;
    if (onCooldown(key)) continue;

    try {
      const isDalle2 = model === 'dall-e-2';
      const resp = await client.images.generate({
        model,
        prompt: req.prompt,
        size: (isDalle2 ? '1024x1024' : (sizeMap[req.aspectRatio || '1:1'] || '1024x1024')) as any,
        quality: isDalle2 ? 'standard' : 'high',
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
      else if (kind === 'busy') setCooldown(key, COOLDOWN_BUSY);
    }
  }

  if (lastErr) throw lastErr;
  return null;
}

async function callGeminiImage(req: ImageGenerationRequest): Promise<ImageGenerationResult | null> {
  const ai = getGeminiClient();
  if (!ai) return null;
  const models = getGeminiImageModels();

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
      else if (kind === 'busy') setCooldown(key, COOLDOWN_BUSY);
      else console.warn(`[AI Gateway] Gemini image model ${model}: ${msg.slice(0, 120)}`);
    }
  }
  return null;
}

async function callHiggsfieldImage(req: ImageGenerationRequest): Promise<ImageGenerationResult | null> {
  ensureHiggsfieldConfig();
  if (!higgsfieldConfigured && !process.env.HF_CREDENTIALS) return null;
  const endpoints = getHiggsfieldEndpoints();
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
      else if (kind === 'busy') setCooldown(key, COOLDOWN_BUSY);
    }
  }

  if (lastErr) throw lastErr;
  return null;
}