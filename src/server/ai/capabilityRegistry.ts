import type { TaskTier } from "../aiGateway";

export type AiCapability =
  | "brand_generation"
  | "logo_variations"
  | "logo_refinement"
  | "image_generation"
  | "content_generation"
  | "brand_audit"
  | "assistant"
  | "social_post"
  | "social_image"
  | "brand_research";

export type AiModality = "text" | "image";
export type StructuredOutputMode = "json" | "text" | "image";

export interface RetryPolicy {
  /** Retries and provider fallback are currently delegated to the legacy gateway. */
  strategy: "gateway";
  maxProviderAttempts: number;
  fallbackAllowed: boolean;
}

export interface CapabilityDefinition {
  id: AiCapability;
  modality: AiModality;
  defaultModelAlias: "astra" | "fable" | "gemini-pro" | "nano-banana";
  supportedModelAliases: readonly ("astra" | "fable" | "gemini-pro" | "nano-banana")[];
  structuredOutput: StructuredOutputMode;
  tier: TaskTier;
  retry: RetryPolicy;
}

const TEXT_ALIASES = ["astra", "fable", "gemini-pro"] as const;
const IMAGE_ALIASES = ["nano-banana"] as const;

const jsonTextCapability = (
  id: AiCapability,
  defaultModelAlias: "astra" | "fable" | "gemini-pro" = "astra",
  tier: TaskTier = "standard"
): CapabilityDefinition => ({
  id,
  modality: "text",
  defaultModelAlias,
  supportedModelAliases: TEXT_ALIASES,
  structuredOutput: "json",
  tier,
  retry: { strategy: "gateway", maxProviderAttempts: 3, fallbackAllowed: true },
});

export const capabilityRegistry: Readonly<Record<AiCapability, CapabilityDefinition>> = {
  brand_generation: jsonTextCapability("brand_generation", "astra", "max"),
  logo_variations: jsonTextCapability("logo_variations"),
  logo_refinement: jsonTextCapability("logo_refinement"),
  content_generation: jsonTextCapability("content_generation"),
  brand_audit: jsonTextCapability("brand_audit"),
  social_post: jsonTextCapability("social_post"),
  brand_research: jsonTextCapability("brand_research"),
  assistant: {
    ...jsonTextCapability("assistant", "astra", "lite"),
    structuredOutput: "text",
  },
  image_generation: {
    id: "image_generation",
    modality: "image",
    defaultModelAlias: "nano-banana",
    supportedModelAliases: IMAGE_ALIASES,
    structuredOutput: "image",
    tier: "standard",
    retry: { strategy: "gateway", maxProviderAttempts: 3, fallbackAllowed: true },
  },
  social_image: {
    id: "social_image",
    modality: "image",
    defaultModelAlias: "nano-banana",
    supportedModelAliases: IMAGE_ALIASES,
    structuredOutput: "image",
    tier: "standard",
    retry: { strategy: "gateway", maxProviderAttempts: 3, fallbackAllowed: true },
  },
};

export function getCapabilityDefinition(capability: AiCapability): CapabilityDefinition {
  return capabilityRegistry[capability];
}

export function supportsModelAlias(
  capability: CapabilityDefinition,
  alias: CapabilityDefinition["defaultModelAlias"]
): boolean {
  return capability.supportedModelAliases.includes(alias);
}
