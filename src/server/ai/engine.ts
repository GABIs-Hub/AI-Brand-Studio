import { routeTask } from "../aiDirector";
import { randomUUID } from "node:crypto";
import {
  type ImageGenerationRequest,
  type ImageGenerationResult,
  type ImageProvider,
  type TextGenerationRequest,
  type TextProvider,
} from "../aiGateway";
import { createImageProviderAdapters, createTextProviderAdapters, type ProviderAdapterAttempt } from "./adapters";
import { getCapabilityDefinition, type AiCapability } from "./capabilityRegistry";
import { normalizeAiError, AiEngineError, type AiErrorCategory } from "./errors";
import { resolveModel, type ModelResolution, type ProductModelAlias } from "./modelRegistry";

export interface AiGenerationMetadata {
  generationId: string;
  capability: AiCapability;
  provider: TextProvider | ImageProvider;
  providerModelId?: string;
  modelAlias: ProductModelAlias;
  startedAt: string;
  endedAt: string;
  attempt: number;
  success: boolean;
  errorCategory?: AiErrorCategory;
}

export interface AiExecutionResult<T> {
  output: T;
  metadata: AiGenerationMetadata;
}

export interface AiEngineDependencies {
  textAdapters: ReadonlyMap<TextProvider, { execute(request: TextGenerationRequest, model: ProviderAdapterAttempt): Promise<string> }>;
  imageAdapters: ReadonlyMap<ImageProvider, { execute(request: ImageGenerationRequest, model: ProviderAdapterAttempt): Promise<ImageGenerationResult> }>;
}

export class AiEngine {
  private readonly textAdapters: AiEngineDependencies["textAdapters"];
  private readonly imageAdapters: AiEngineDependencies["imageAdapters"];

  constructor(dependencies: AiEngineDependencies = {
    textAdapters: createTextProviderAdapters(),
    imageAdapters: createImageProviderAdapters(),
  }) {
    this.textAdapters = dependencies.textAdapters;
    this.imageAdapters = dependencies.imageAdapters;
  }

  async executeText(
    capability: AiCapability,
    request: TextGenerationRequest,
    options: { modelAlias?: ProductModelAlias; allowFallback?: boolean } = {}
  ): Promise<AiExecutionResult<string>> {
    const definition = getCapabilityDefinition(capability);
    if (definition.modality !== "text") {
      throw new AiEngineError(`Capability ${capability} does not support text requests.`, "invalid_input");
    }
    if ((!request.preferred || request.preferred === "auto") && request.taskType) {
      const decision = routeTask(request.taskType, { powerLevel: request.powerLevel });
      if (decision.selectedEngine !== "local") request = { ...request, preferred: decision.selectedEngine as typeof request.preferred };
    }
    const resolution = resolveModel(capability, {
      alias: options.modelAlias,
      preferredProvider: request.preferred,
    });
    this.assertResolvedModel(resolution);
    const adapter = this.textAdapters.get(resolution.provider as TextProvider);
    if (!adapter) throw new AiEngineError(`No adapter configured for ${resolution.provider}.`, "configuration");
    const metadata = this.startMetadata(capability, resolution);
    try {
      const output = await adapter.execute({
        ...request,
        tier: request.tier || definition.tier,
        allowProviderFallback: options.allowFallback ?? definition.retry.fallbackAllowed,
        onProviderAttempt: (provider) => this.recordProviderAttempt(metadata, capability, provider),
      }, this.adapterModel(resolution));
      if (definition.structuredOutput === "json") this.validateStructuredOutput(output);
      if (metadata.attempt === 0) metadata.attempt = 1;
      metadata.endedAt = new Date().toISOString();
      metadata.success = true;
      return { output, metadata };
    } catch (error) {
      const normalized = normalizeAiError(error);
      metadata.endedAt = new Date().toISOString();
      metadata.success = false;
      metadata.errorCategory = normalized.category;
      throw normalized;
    }
  }

  async executeImage(
    capability: AiCapability,
    request: ImageGenerationRequest,
    options: { modelAlias?: ProductModelAlias; allowFallback?: boolean } = {}
  ): Promise<AiExecutionResult<ImageGenerationResult>> {
    const definition = getCapabilityDefinition(capability);
    if (definition.modality !== "image") {
      throw new AiEngineError(`Capability ${capability} does not support image requests.`, "invalid_input");
    }
    if ((!request.preferred || request.preferred === "auto") && request.taskType) {
      const decision = routeTask(request.taskType, { powerLevel: request.powerLevel });
      if (decision.selectedEngine !== "local") request = { ...request, preferred: decision.selectedEngine as typeof request.preferred };
    }
    const resolution = resolveModel(capability, {
      alias: options.modelAlias,
      preferredProvider: request.preferred,
    });
    this.assertResolvedModel(resolution);
    const adapter = this.imageAdapters.get(resolution.provider as ImageProvider);
    if (!adapter) throw new AiEngineError(`No adapter configured for ${resolution.provider}.`, "configuration");
    const metadata = this.startMetadata(capability, resolution);
    try {
      const output = await adapter.execute({
        ...request,
        allowProviderFallback: options.allowFallback ?? definition.retry.fallbackAllowed,
        onProviderAttempt: (provider) => this.recordProviderAttempt(metadata, capability, provider),
      }, this.adapterModel(resolution));
      if (metadata.attempt === 0) metadata.attempt = 1;
      metadata.endedAt = new Date().toISOString();
      metadata.success = true;
      return { output, metadata };
    } catch (error) {
      const normalized = normalizeAiError(error);
      metadata.endedAt = new Date().toISOString();
      metadata.success = false;
      metadata.errorCategory = normalized.category;
      throw normalized;
    }
  }

  private startMetadata(capability: AiCapability, resolution: ModelResolution): AiGenerationMetadata {
    return {
      generationId: randomUUID(),
      capability,
      provider: resolution.provider,
      providerModelId: resolution.providerModelId,
      modelAlias: resolution.alias,
      startedAt: new Date().toISOString(),
      endedAt: "",
      attempt: 0,
      success: false,
    };
  }

  private assertResolvedModel(resolution: ModelResolution): void {
    if (resolution.source === "unresolved" || !resolution.providerModelId) {
      throw new AiEngineError(
        `No configured provider model is available for ${resolution.alias}.`,
        "configuration"
      );
    }
  }

  private adapterModel(resolution: ModelResolution): ProviderAdapterAttempt {
    return { provider: resolution.provider, providerModelId: resolution.providerModelId };
  }

  private recordProviderAttempt(
    metadata: AiGenerationMetadata,
    capability: AiCapability,
    provider: TextProvider | ImageProvider
  ): void {
    metadata.attempt += 1;
    metadata.provider = provider;
    const attemptResolution = resolveModel(capability, { preferredProvider: provider });
    metadata.providerModelId = attemptResolution.providerModelId;
  }

  private validateStructuredOutput(output: string): void {
    try {
      JSON.parse(output);
    } catch (error) {
      throw new AiEngineError("The AI provider returned malformed structured output.", "malformed_provider_response", error);
    }
  }
}

export const aiEngine = new AiEngine();
