import type { ImageProvider, TextProvider } from "../aiGateway";
import {
  getCapabilityDefinition,
  supportsModelAlias,
  type AiCapability,
} from "./capabilityRegistry";

export type ProductModelAlias = "astra" | "fable" | "gemini-pro" | "nano-banana";
export type ResolvedProvider = TextProvider | ImageProvider;

export interface ModelResolution {
  alias: ProductModelAlias;
  provider: ResolvedProvider;
  /** Undefined means no explicit provider model ID is configured. */
  providerModelId?: string;
  configurationKey: string;
  source: "configuration" | "unresolved";
}

const textAliasProviders: Readonly<Record<Exclude<ProductModelAlias, "nano-banana">, TextProvider>> = {
  astra: "openai",
  fable: "anthropic",
  "gemini-pro": "gemini",
};

function firstConfigured(...keys: string[]): { value?: string; key: string } {
  for (const key of keys) {
    const value = process.env[key]?.split(",")[0]?.trim();
    if (value) return { value, key };
  }
  return { key: keys[0] };
}

function resolveTextAlias(alias: Exclude<ProductModelAlias, "nano-banana">): ModelResolution {
  const provider = textAliasProviders[alias];
  const configuration =
    provider === "openai"
      ? firstConfigured("OPENAI_TEXT_MODELS", "OPENAI_MODEL")
      : provider === "anthropic"
        ? firstConfigured("ANTHROPIC_TEXT_MODELS", "ANTHROPIC_MODEL")
        : firstConfigured("GEMINI_TEXT_MODELS", "GEMINI_MODEL");
  return {
    alias,
    provider,
    providerModelId: configuration.value,
    configurationKey: configuration.key,
    source: configuration.value ? "configuration" : "unresolved",
  };
}

function resolveImageAlias(preferredProvider?: ImageProvider): ModelResolution {
  // The existing gateway tries OpenAI, Gemini, then Higgsfield for auto image
  // requests. Keep that first attempt for compatibility while exposing the
  // product-level image alias separately from provider model IDs.
  const configuredProviders: Array<{ provider: ImageProvider; configuration: { value?: string; key: string } }> = [
    { provider: "openai", configuration: firstConfigured("OPENAI_IMAGE_MODEL") },
    { provider: "gemini", configuration: firstConfigured("GEMINI_IMAGE_MODELS", "GEMINI_IMAGE_MODEL") },
    { provider: "higgsfield", configuration: firstConfigured("HIGGSFIELD_ENDPOINT") },
  ];
  const selected = preferredProvider && preferredProvider !== "auto"
    ? configuredProviders.find(({ provider }) => provider === preferredProvider)
    : configuredProviders.find(({ configuration }) => configuration.value);
  const provider = selected?.provider || (preferredProvider && preferredProvider !== "auto" ? preferredProvider : "openai");
  const configuration = selected?.configuration || firstConfigured(
    provider === "openai"
      ? "OPENAI_IMAGE_MODEL"
      : provider === "gemini"
        ? "GEMINI_IMAGE_MODELS"
        : "HIGGSFIELD_ENDPOINT"
  );
  return {
    alias: "nano-banana",
    provider,
    providerModelId: configuration.value,
    configurationKey: configuration.key,
    source: configuration.value ? "configuration" : "unresolved",
  };
}

export function resolveModel(
  capability: AiCapability,
  options: { alias?: ProductModelAlias; preferredProvider?: ResolvedProvider } = {}
): ModelResolution {
  const definition = getCapabilityDefinition(capability);
  const alias = options.alias || definition.defaultModelAlias;
  if (!supportsModelAlias(definition, alias)) {
    throw new Error(`Model alias ${alias} is not supported for ${capability}.`);
  }
  if (alias === "nano-banana") {
    if (definition.modality !== "image") {
      throw new Error(`Image model alias ${alias} is not supported for ${capability}.`);
    }
    return resolveImageAlias(options.preferredProvider as ImageProvider | undefined);
  }
  if (options.preferredProvider && options.preferredProvider !== "auto") {
    const providerForAlias = textAliasProviders[alias];
    if (providerForAlias !== options.preferredProvider) {
      const compatibleAlias = (Object.entries(textAliasProviders).find(([, provider]) => provider === options.preferredProvider)?.[0] || alias) as Exclude<ProductModelAlias, "nano-banana">;
      return resolveTextAlias(compatibleAlias);
    }
  }
  return resolveTextAlias(alias);
}
