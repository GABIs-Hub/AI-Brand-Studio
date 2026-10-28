import {
  generateImage,
  generateText,
  type ImageGenerationRequest,
  type ImageGenerationResult,
  type TextGenerationRequest,
  type ImageProvider,
  type TextProvider,
} from "../aiGateway";

export interface ProviderAdapterAttempt {
  provider: TextProvider | ImageProvider;
  providerModelId?: string;
}

export interface TextProviderAdapter {
  readonly provider: TextProvider;
  execute(request: TextGenerationRequest, model: ProviderAdapterAttempt): Promise<string>;
}

export interface ImageProviderAdapter {
  readonly provider: ImageProvider;
  execute(request: ImageGenerationRequest, model: ProviderAdapterAttempt): Promise<ImageGenerationResult>;
}

/**
 * Compatibility adapters around the existing gateway. The gateway remains the
 * owner of SDK formatting, model ladders, circuit breakers, and fallback order
 * until those concerns can be migrated without changing product behavior.
 */
export function createTextProviderAdapters(): ReadonlyMap<TextProvider, TextProviderAdapter> {
  return new Map(
    (["openai", "anthropic", "gemini"] as const).map((provider) => [
      provider,
      {
        provider,
        execute: (request, model) => generateText({
          ...request,
          preferred: provider,
          providerModelId: model.providerModelId,
          providerModelProvider: provider,
        }),
      },
    ])
  );
}

export function createImageProviderAdapters(): ReadonlyMap<ImageProvider, ImageProviderAdapter> {
  return new Map(
    (["openai", "gemini", "higgsfield"] as const).map((provider) => [
      provider,
      {
        provider,
        execute: (request, model) => generateImage({
          ...request,
          preferred: provider,
          providerModelId: model.providerModelId,
          providerModelProvider: provider,
        }),
      },
    ])
  );
}
