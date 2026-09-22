import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveModel } from "./modelRegistry";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("AI model registry", () => {
  it("resolves product aliases to configured provider model IDs", () => {
    vi.stubEnv("ANTHROPIC_TEXT_MODELS", "configured-fable, fallback-fable");

    expect(resolveModel("brand_generation", { alias: "fable" })).toEqual({
      alias: "fable",
      provider: "anthropic",
      providerModelId: "configured-fable",
      configurationKey: "ANTHROPIC_TEXT_MODELS",
      source: "configuration",
    });
  });

  it("does not confuse a product alias with an API model ID when configuration is missing", () => {
    const resolution = resolveModel("assistant", { alias: "astra" });

    expect(resolution.alias).toBe("astra");
    expect(resolution.provider).toBe("openai");
    expect(resolution.providerModelId).toBeUndefined();
    expect(resolution.source).toBe("unresolved");
    expect(resolution.configurationKey).toBe("OPENAI_TEXT_MODELS");
  });

  it("selects a compatible alias for an explicitly selected provider", () => {
    vi.stubEnv("GEMINI_TEXT_MODELS", "configured-gemini");

    expect(resolveModel("brand_audit", { preferredProvider: "gemini" })).toMatchObject({
      alias: "gemini-pro",
      provider: "gemini",
      providerModelId: "configured-gemini",
    });
  });

  it("selects the first configured automatic image provider without using a default ID", () => {
    vi.stubEnv("OPENAI_IMAGE_MODEL", "");
    vi.stubEnv("GEMINI_IMAGE_MODELS", "configured-gemini-image");

    expect(resolveModel("image_generation")).toMatchObject({
      alias: "nano-banana",
      provider: "gemini",
      providerModelId: "configured-gemini-image",
      configurationKey: "GEMINI_IMAGE_MODELS",
      source: "configuration",
    });
  });

  it("rejects unsupported capability/model combinations", () => {
    expect(() => resolveModel("image_generation", { alias: "astra" })).toThrow(
      "Model alias astra is not supported for image_generation."
    );
  });
});
