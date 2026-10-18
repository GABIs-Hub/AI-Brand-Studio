// ────────────────────────────────────────────────────────────────────────────
// GABI Context-Aware AI Director
// Intelligently routes generation requests across models and engines based on
// task modality, reasoning depth, latency requirements, power levels, and
// active circuit breaker state.
// ────────────────────────────────────────────────────────────────────────────

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
  getProviderModelInventory,
} from './aiModels';

export type { TextProvider, ImageProvider, TaskType, PowerLevel };

export interface DirectorDecision {
  taskType: TaskType;
  selectedEngine: 'gemini' | 'openai' | 'anthropic' | 'higgsfield' | 'local';
  modelName: string;
  routingRationale: string;
  modality: 'text' | 'image' | 'vector' | 'deterministic' | 'research';
  powerLevel: PowerLevel;
  estimatedLatencyMs: number;
  fallbackChain: string[];
  circuitBreakerActive: boolean;
  timestamp: string;
}

export interface ProviderHealth {
  provider: 'gemini' | 'openai' | 'anthropic' | 'higgsfield';
  configured: boolean;
  onCooldown: boolean;
  cooldownRemainingSeconds: number;
  activeModel?: string;
  configuredModels?: string[];
}

// In-memory telemetry of recent decisions made by the Director
const recentDecisions: DirectorDecision[] = [];
const MAX_TELEMETRY_ITEMS = 50;

/**
 * Checks if a specific provider has keys configured in environment.
 */
export function isProviderConfigured(provider: 'gemini' | 'openai' | 'anthropic' | 'higgsfield'): boolean {
  switch (provider) {
    case 'gemini':
      return Boolean(process.env.GEMINI_API_KEY?.trim());
    case 'openai':
      return Boolean(process.env.OPENAI_API_KEY?.trim());
    case 'anthropic':
      return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    case 'higgsfield':
      return Boolean(
        process.env.HF_CREDENTIALS?.trim() ||
        (process.env.HF_API_KEY?.trim() && process.env.HF_API_SECRET?.trim())
      );
    default:
      return false;
  }
}

/**
 * Main Autonomous Routing Decision function for the AI Director.
 */
export function routeTask(
  taskType: TaskType,
  options: {
    powerLevel?: PowerLevel;
    userPreferredProvider?: TextProvider | ImageProvider;
    isOfflineForced?: boolean;
  } = {}
): DirectorDecision {
  const powerLevel = options.powerLevel || 'pro';
  const timestamp = new Date().toISOString();

  // 1. Deterministic local tasks bypass all external AI APIs
  if (taskType === 'color_wcag' || taskType === 'svg_transform') {
    const decision: DirectorDecision = {
      taskType,
      selectedEngine: 'local',
      modelName: 'GABI Deterministic Math Engine',
      routingRationale:
        'Routed to local zero-latency mathematical engine for precise WCAG AA/AAA contrast ratios and SVG DOM sanitization.',
      modality: 'deterministic',
      powerLevel: 'legacy',
      estimatedLatencyMs: 2,
      fallbackChain: ['local'],
      circuitBreakerActive: false,
      timestamp,
    };
    recordDecision(decision);
    return decision;
  }

  // 2. GABI Legacy Mode forces offline procedural engine
  if (powerLevel === 'legacy' || options.isOfflineForced) {
    const decision: DirectorDecision = {
      taskType,
      selectedEngine: 'local',
      modelName: 'GABI Procedural Architecture Engine',
      routingRationale:
        'GABI Legacy tier active: Executing deterministic brand synthesis without external network or API dependencies.',
      modality: taskType === 'photorealistic_mockup' ? 'image' : 'text',
      powerLevel: 'legacy',
      estimatedLatencyMs: 15,
      fallbackChain: ['local'],
      circuitBreakerActive: false,
      timestamp,
    };
    recordDecision(decision);
    return decision;
  }

  // 3. Image / Mockup Generation Task Routing
  if (taskType === 'photorealistic_mockup') {
    const hasHF = isProviderConfigured('higgsfield');
    const hasOpenAI = isProviderConfigured('openai');
    const hasGemini = isProviderConfigured('gemini');

    let selectedEngine: 'higgsfield' | 'openai' | 'gemini' | 'local' = 'local';
    let modelName = 'CSS/SVG Procedural Mockup';
    let routingRationale = 'Fallback to procedural SVG mockup rendering.';
    let latency = 50;

    if (hasHF && powerLevel === 'pro') {
      selectedEngine = 'higgsfield';
      modelName = getHiggsfieldEndpoints()[0];
      routingRationale = `Routed to Higgsfield (${modelName}) for cinematic 3D realism, physical materials, and studio lighting.`;
      latency = 9500;
    } else if (hasOpenAI) {
      selectedEngine = 'openai';
      modelName = getOpenAIImageModels()[0];
      routingRationale = `Routed to OpenAI (${modelName}) for high-fidelity raster brand presentation.`;
      latency = 6500;
    } else if (hasGemini) {
      selectedEngine = 'gemini';
      modelName = getGeminiImageModels()[0];
      routingRationale = `Routed to Gemini (${modelName}) for rapid visual asset generation.`;
      latency = 4000;
    }

    const decision: DirectorDecision = {
      taskType,
      selectedEngine,
      modelName,
      routingRationale,
      modality: 'image',
      powerLevel,
      estimatedLatencyMs: latency,
      fallbackChain: ['higgsfield', 'openai', 'gemini', 'local'].filter((e) => e !== selectedEngine),
      circuitBreakerActive: false,
      timestamp,
    };
    recordDecision(decision);
    return decision;
  }

  // 4. Text & Reasoning Tasks Routing (Strategic Brand Generation, Naming, Audit, Social)
  const hasGemini = isProviderConfigured('gemini');
  const hasOpenAI = isProviderConfigured('openai');
  const hasClaude = isProviderConfigured('anthropic');

  let selectedEngine: 'gemini' | 'openai' | 'anthropic' | 'local' = 'gemini';
  let modelName = getGeminiTextModels(powerLevel)[0];
  let routingRationale = '';
  let estimatedLatencyMs = 2800;

  // Custom User Preferred Override (if specified and not auto)
  if (options.userPreferredProvider && options.userPreferredProvider !== 'auto') {
    if (options.userPreferredProvider === 'anthropic' && hasClaude) {
      selectedEngine = 'anthropic';
      modelName = getAnthropicModels(powerLevel, taskType)[0];
      routingRationale = `User explicitly pinned Anthropic Claude (${modelName}) for deep strategic direction.`;
    } else if (options.userPreferredProvider === 'openai' && hasOpenAI) {
      selectedEngine = 'openai';
      modelName = getOpenAITextModels(powerLevel, taskType)[0];
      routingRationale = `User explicitly pinned OpenAI (${modelName}) for brand generation.`;
    } else if (options.userPreferredProvider === 'gemini' && hasGemini) {
      selectedEngine = 'gemini';
      modelName = getGeminiTextModels(powerLevel)[0];
      routingRationale = `User explicitly pinned Google Gemini (${modelName}) for creative direction.`;
    }
  } else {
    // Autonomous Intelligent Routing based on Task Type & Power Level
    switch (taskType) {
      case 'brand_strategy':
      case 'rebrand_analysis':
      case 'brand_audit':
        if (powerLevel === 'lite') {
          selectedEngine = hasGemini ? 'gemini' : hasOpenAI ? 'openai' : 'anthropic';
          modelName = hasGemini
            ? getGeminiTextModels('lite')[0]
            : hasOpenAI
              ? getOpenAITextModels('lite', taskType)[0]
              : getAnthropicModels('lite', taskType)[0];
          routingRationale = `GABI Lite Tier: Routed to high-throughput model (${modelName}) for low-latency strategy synthesis.`;
          estimatedLatencyMs = 1200;
        } else {
          // Pro Mode: Highest cognitive reasoning depth
          if (hasGemini) {
            selectedEngine = 'gemini';
            modelName = getGeminiTextModels('pro')[0];
            routingRationale = `Routed to Google Gemini (${modelName}): Highest cognitive reasoning depth for strategic market positioning and architecture.`;
            estimatedLatencyMs = 2600;
          } else if (hasClaude) {
            selectedEngine = 'anthropic';
            modelName = getAnthropicModels('pro', taskType)[0];
            routingRationale = `Routed to Anthropic Claude (${modelName}) for nuanced brand voice and narrative depth.`;
            estimatedLatencyMs = 3200;
          } else if (hasOpenAI) {
            selectedEngine = 'openai';
            modelName = getOpenAITextModels('pro', taskType)[0];
            routingRationale = `Routed to OpenAI (${modelName}) for comprehensive brand architecture.`;
            estimatedLatencyMs = 3000;
          } else {
            selectedEngine = 'local';
            modelName = 'GABI Procedural Fallback Engine';
            routingRationale = 'No AI API keys configured. Routed to offline procedural brand engine.';
            estimatedLatencyMs = 20;
          }
        }
        break;

      case 'brand_naming':
      case 'social_copy':
      case 'chat_director':
        if (powerLevel === 'lite' && hasGemini) {
          selectedEngine = 'gemini';
          modelName = getGeminiTextModels('lite')[0];
          routingRationale = `Routed to Gemini (${modelName}) for instant creative linguistic ideation.`;
          estimatedLatencyMs = 800;
        } else if (hasGemini) {
          selectedEngine = 'gemini';
          modelName = getGeminiTextModels('pro')[0];
          routingRationale = `Routed to Gemini (${modelName}) for creative resonance and witty, high-converting copy.`;
          estimatedLatencyMs = 1800;
        } else if (hasOpenAI) {
          selectedEngine = 'openai';
          modelName = getOpenAITextModels(powerLevel, taskType)[0];
          routingRationale = `Routed to OpenAI (${modelName}) for creative conversational copy.`;
          estimatedLatencyMs = 2200;
        } else if (hasClaude) {
          selectedEngine = 'anthropic';
          modelName = getAnthropicModels(powerLevel, taskType)[0];
          routingRationale = `Routed to Anthropic Claude (${modelName}) for creative copy.`;
          estimatedLatencyMs = 2400;
        } else {
          selectedEngine = 'local';
          modelName = 'GABI Local Copywriter';
          routingRationale = 'Local offline template copywriter.';
          estimatedLatencyMs = 10;
        }
        break;

      case 'logo_vector':
        // Vector synthesis requires crisp syntactic SVG generation
        if (hasGemini) {
          selectedEngine = 'gemini';
          modelName = getGeminiTextModels('pro')[0];
          routingRationale = `Routed to Gemini (${modelName}) for mathematical vector geometry and SVG <defs> gradient construction.`;
          estimatedLatencyMs = 2100;
        } else if (hasOpenAI) {
          selectedEngine = 'openai';
          modelName = getOpenAITextModels('pro', taskType)[0];
          routingRationale = `Routed to OpenAI (${modelName}) for structured vector generation.`;
          estimatedLatencyMs = 2500;
        } else {
          selectedEngine = 'local';
          modelName = 'GABI Procedural Vector Generator';
          routingRationale = 'Local mathematical vector archetype generator.';
          estimatedLatencyMs = 5;
        }
        break;

      default:
        selectedEngine = hasGemini ? 'gemini' : hasOpenAI ? 'openai' : 'local';
        modelName = hasGemini
          ? getGeminiTextModels(powerLevel)[0]
          : hasOpenAI
            ? getOpenAITextModels(powerLevel, taskType)[0]
            : 'local';
        routingRationale = 'Default strategic routing.';
        break;
    }
  }

  const fallbackChain: string[] = ['gemini', 'openai', 'anthropic', 'local'].filter((e) => e !== selectedEngine);

  const decision: DirectorDecision = {
    taskType,
    selectedEngine,
    modelName,
    routingRationale,
    modality: 'text',
    powerLevel,
    estimatedLatencyMs,
    fallbackChain,
    circuitBreakerActive: false,
    timestamp,
  };

  recordDecision(decision);
  return decision;
}

function recordDecision(decision: DirectorDecision) {
  recentDecisions.unshift(decision);
  if (recentDecisions.length > MAX_TELEMETRY_ITEMS) {
    recentDecisions.pop();
  }
}

/**
 * Returns recent routing decisions for UI telemetry.
 */
export function getRecentDirectorDecisions(): DirectorDecision[] {
  return [...recentDecisions];
}

/**
 * Returns full diagnostic health of all connected AI engines.
 */
export function getDirectorStatus() {
  const modelInventory = getProviderModelInventory();
  const providers: ProviderHealth[] = [
    {
      provider: 'gemini',
      configured: isProviderConfigured('gemini'),
      onCooldown: false,
      cooldownRemainingSeconds: 0,
      activeModel: modelInventory.gemini.activePrimary,
      configuredModels: modelInventory.gemini.textCascade,
    },
    {
      provider: 'openai',
      configured: isProviderConfigured('openai'),
      onCooldown: false,
      cooldownRemainingSeconds: 0,
      activeModel: modelInventory.openai.activePrimary,
      configuredModels: modelInventory.openai.textCascade,
    },
    {
      provider: 'anthropic',
      configured: isProviderConfigured('anthropic'),
      onCooldown: false,
      cooldownRemainingSeconds: 0,
      activeModel: modelInventory.anthropic.activePrimary,
      configuredModels: modelInventory.anthropic.cascade,
    },
    {
      provider: 'higgsfield',
      configured: isProviderConfigured('higgsfield'),
      onCooldown: false,
      cooldownRemainingSeconds: 0,
      activeModel: modelInventory.higgsfield.activeEndpoint,
      configuredModels: modelInventory.higgsfield.endpoints,
    },
  ];

  return {
    status: 'online',
    autonomousDirectorActive: true,
    providers,
    modelInventory,
    recentDecisions: getRecentDirectorDecisions().slice(0, 10),
  };
}
