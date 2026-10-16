// ────────────────────────────────────────────────────────────────────────────
// GABI AI Model Configuration & Multi-Model Resolution Engine
// Supports dynamic cascades, power-level routing (pro / lite / reasoning),
// and environment overrides for Anthropic, OpenAI, Google Gemini, and Higgsfield.
// ────────────────────────────────────────────────────────────────────────────

export type TextProvider = 'auto' | 'openai' | 'anthropic' | 'gemini';
export type ImageProvider = 'auto' | 'openai' | 'gemini' | 'higgsfield';

export type TaskType =
  | 'brand_strategy'          // Core brand positioning, mission, values, archetypes
  | 'brand_naming'            // Linguistic & creative brand naming
  | 'rebrand_analysis'        // Deep legacy brand diagnostic & evolution strategy
  | 'brand_audit'             // Multi-pillar brand health & maturity score
  | 'social_copy'             // High-converting campaign copy & viral topics
  | 'chat_director'           // Interactive real-time co-pilot
  | 'logo_vector'             // SVG vector geometry synthesis
  | 'photorealistic_mockup'   // High-fidelity 3D/raster photography & mockups
  | 'color_wcag'              // Deterministic sRGB math & WCAG contrast
  | 'svg_transform'           // Deterministic SVG parsing, viewBox, sanitization
  | 'brand_research';         // Archival brand case-study retrieval

export type PowerLevel = 'lite' | 'pro' | 'legacy';

/**
 * Utility to parse comma-separated model lists from environment variables
 */
export function parseModelList(envValue: string | undefined, defaultList: string[]): string[] {
  if (!envValue || !envValue.trim()) return defaultList;
  const parsed = envValue
    .split(',')
    .map((s) => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
  return parsed.length > 0 ? parsed : defaultList;
}

// ── Anthropic Models ────────────────────────────────────────────────────────
export function getAnthropicModels(powerLevel: PowerLevel = 'pro', taskType?: TaskType): string[] {
  const primary = (process.env.ANTHROPIC_MODEL || '').trim() || 'claude-3-7-sonnet-20250219';
  const fast = (process.env.ANTHROPIC_FAST_MODEL || '').trim() || 'claude-3-5-haiku-latest';
  const configuredFallbacks = parseModelList(process.env.ANTHROPIC_FALLBACK_MODELS, [
    primary,
    'claude-3-5-sonnet-latest',
    fast,
    'claude-sonnet-4-5',
    'claude-3-5-haiku-20241022',
  ]);

  let ordered: string[];
  if (powerLevel === 'lite' || taskType === 'chat_director' || taskType === 'social_copy') {
    ordered = [fast, ...configuredFallbacks.filter((m) => m !== fast)];
  } else {
    ordered = [primary, ...configuredFallbacks.filter((m) => m !== primary)];
  }

  return Array.from(new Set(ordered));
}

// ── OpenAI Text Models ──────────────────────────────────────────────────────
export function getOpenAITextModels(powerLevel: PowerLevel = 'pro', taskType?: TaskType): string[] {
  const primary = (process.env.OPENAI_MODEL || '').trim() || 'gpt-4o';
  const fast = (process.env.OPENAI_FAST_MODEL || '').trim() || 'gpt-4o-mini';
  const reasoning = (process.env.OPENAI_REASONING_MODEL || '').trim() || 'o3-mini';
  const configuredFallbacks = parseModelList(process.env.OPENAI_FALLBACK_MODELS, [
    primary,
    fast,
    reasoning,
    'gpt-4o-2024-11-20',
    'gpt-4-turbo',
  ]);

  let ordered: string[];
  if (powerLevel === 'lite') {
    ordered = [fast, ...configuredFallbacks.filter((m) => m !== fast)];
  } else if (taskType === 'brand_strategy' || taskType === 'rebrand_analysis') {
    // For deep reasoning tasks, prioritize the primary flagship or dedicated reasoning model
    ordered = [primary, reasoning, fast, ...configuredFallbacks];
  } else {
    ordered = [primary, fast, ...configuredFallbacks.filter((m) => m !== primary)];
  }

  return Array.from(new Set(ordered));
}

// ── OpenAI Image Models ─────────────────────────────────────────────────────
export function getOpenAIImageModels(): string[] {
  const primary = (process.env.OPENAI_IMAGE_MODEL || '').trim() || 'dall-e-3';
  const configuredFallbacks = parseModelList(process.env.OPENAI_IMAGE_FALLBACK_MODELS, [
    primary,
    'gpt-image-1',
    'dall-e-2',
  ]);
  return Array.from(new Set([primary, ...configuredFallbacks]));
}

// ── Gemini Text Models ──────────────────────────────────────────────────────
export function getGeminiTextModels(powerLevel: PowerLevel = 'pro'): string[] {
  const primary = (process.env.GEMINI_MODEL || '').trim() || 'gemini-2.5-pro';
  const fast = (process.env.GEMINI_FAST_MODEL || '').trim() || 'gemini-2.5-flash';
  const configuredFallbacks = parseModelList(process.env.GEMINI_FALLBACK_MODELS, [
    fast,
    'gemini-3.7-flash',
    primary,
    'gemini-2.0-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ]);

  let ordered: string[];
  if (powerLevel === 'lite') {
    ordered = [fast, ...configuredFallbacks.filter((m) => m !== fast)];
  } else {
    ordered = [primary, fast, ...configuredFallbacks.filter((m) => m !== primary && m !== fast)];
  }

  return Array.from(new Set(ordered));
}

// ── Gemini Image Models ─────────────────────────────────────────────────────
export function getGeminiImageModels(): string[] {
  const primary = (process.env.GEMINI_IMAGE_MODEL || '').trim() || 'gemini-3.1-flash-image';
  const configuredFallbacks = parseModelList(process.env.GEMINI_IMAGE_FALLBACK_MODELS, [
    primary,
    'gemini-3.1-flash-lite-image',
    'imagen-3.0-generate-002',
  ]);
  return Array.from(new Set([primary, ...configuredFallbacks]));
}

// ── Higgsfield / Flux Endpoints ─────────────────────────────────────────────
export function getHiggsfieldEndpoints(): string[] {
  const primary =
    (process.env.HIGGSFIELD_ENDPOINT || '').trim() || 'flux-pro/kontext/max/text-to-image';
  const configuredFallbacks = parseModelList(process.env.HIGGSFIELD_FALLBACK_ENDPOINTS, [
    primary,
    'flux-pro/v1.1',
    'flux-dev',
  ]);
  return Array.from(new Set([primary, ...configuredFallbacks]));
}

// ── All Configured Provider Model Diagnostic Map ────────────────────────────
export function getProviderModelInventory() {
  return {
    anthropic: {
      activePrimary: getAnthropicModels('pro')[0],
      activeFast: getAnthropicModels('lite')[0],
      cascade: getAnthropicModels('pro'),
    },
    openai: {
      activePrimary: getOpenAITextModels('pro')[0],
      activeFast: getOpenAITextModels('lite')[0],
      activeReasoning: (process.env.OPENAI_REASONING_MODEL || '').trim() || 'o3-mini',
      textCascade: getOpenAITextModels('pro'),
      imageCascade: getOpenAIImageModels(),
    },
    gemini: {
      activePrimary: getGeminiTextModels('pro')[0],
      activeFast: getGeminiTextModels('lite')[0],
      textCascade: getGeminiTextModels('pro'),
      imageCascade: getGeminiImageModels(),
    },
    higgsfield: {
      activeEndpoint: getHiggsfieldEndpoints()[0],
      endpoints: getHiggsfieldEndpoints(),
    },
  };
}
