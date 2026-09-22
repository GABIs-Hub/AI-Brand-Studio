import { afterEach, describe, expect, it, vi } from "vitest";
import { AiEngine } from "./engine";
import { AiEngineError } from "./errors";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("AI engine", () => {
  it("executes a capability through the resolved provider adapter and returns metadata", async () => {
    vi.stubEnv("OPENAI_TEXT_MODELS", "configured-openai-model");
    const execute = vi.fn().mockResolvedValue('{"ok":true}');
    const engine = new AiEngine({
      textAdapters: new Map([["openai", { execute }]]),
      imageAdapters: new Map(),
    });

    const result = await engine.executeText("brand_generation", {
      prompt: "Create a brand",
      preferred: "openai",
    });

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: "Create a brand", preferred: "openai", tier: "max" }),
      { provider: "openai", providerModelId: "configured-openai-model" }
    );
    expect(result.output).toBe('{"ok":true}');
    expect(result.metadata).toMatchObject({
      capability: "brand_generation",
      provider: "openai",
      modelAlias: "astra",
      success: true,
      attempt: 1,
    });
    expect(result.metadata.generationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.metadata.endedAt).not.toBe("");
  });

  it("normalizes malformed structured output without exposing the provider error", async () => {
    vi.stubEnv("OPENAI_TEXT_MODELS", "configured-openai-model");
    const engine = new AiEngine({
      textAdapters: new Map([["openai", { execute: vi.fn().mockResolvedValue("not-json") }]]),
      imageAdapters: new Map(),
    });

    await expect(
      engine.executeText("brand_audit", { prompt: "Audit", preferred: "openai" })
    ).rejects.toMatchObject({
      name: "AiEngineError",
      category: "malformed_provider_response",
      message: "The AI provider returned malformed structured output.",
    });
  });

  it("does not retry an authentication failure in the engine", async () => {
    vi.stubEnv("OPENAI_TEXT_MODELS", "configured-openai-model");
    const execute = vi.fn().mockRejectedValue(new Error("401 invalid api key"));
    const engine = new AiEngine({
      textAdapters: new Map([["openai", { execute }]]),
      imageAdapters: new Map(),
    });

    const error = await engine
      .executeText("assistant", { prompt: "Hello", preferred: "openai" })
      .catch((value) => value as AiEngineError);

    expect(execute).toHaveBeenCalledOnce();
    expect(error).toMatchObject({ category: "authentication", message: "AI operation failed (authentication)." });
  });

  it("passes an explicit no-fallback policy to the provider boundary", async () => {
    vi.stubEnv("OPENAI_TEXT_MODELS", "configured-openai-model");
    const execute = vi.fn().mockResolvedValue("reply");
    const engine = new AiEngine({
      textAdapters: new Map([["openai", { execute }]]),
      imageAdapters: new Map(),
    });

    await engine.executeText("assistant", { prompt: "Use only OpenAI", preferred: "openai" }, { allowFallback: false });

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ preferred: "openai", allowProviderFallback: false })
    );
  });

  it("executes image capabilities through image adapters", async () => {
    vi.stubEnv("OPENAI_IMAGE_MODEL", "configured-openai-image");
    const execute = vi.fn().mockResolvedValue({ imageUrl: "data:image/png;base64,abc", engine: "openai" });
    const engine = new AiEngine({
      textAdapters: new Map(),
      imageAdapters: new Map([["openai", { execute }]]),
    });

    const result = await engine.executeImage("image_generation", {
      prompt: "Render a logo",
      preferred: "openai",
      aspectRatio: "1:1",
    });

    expect(result.output.imageUrl).toContain("data:image/png");
    expect(result.metadata).toMatchObject({ capability: "image_generation", provider: "openai", modelAlias: "nano-banana", success: true });
  });

  it("rejects unresolved text models before invoking an adapter", async () => {
    vi.stubEnv("OPENAI_TEXT_MODELS", "");
    vi.stubEnv("OPENAI_MODEL", "");
    const execute = vi.fn();
    const engine = new AiEngine({
      textAdapters: new Map([["openai", { execute }]]),
      imageAdapters: new Map(),
    });

    await expect(engine.executeText("assistant", { prompt: "Hello", preferred: "openai" })).rejects.toMatchObject({
      category: "configuration",
      message: "No configured provider model is available for astra.",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it("rejects unresolved automatic image models before invoking an adapter", async () => {
    for (const key of ["OPENAI_IMAGE_MODEL", "GEMINI_IMAGE_MODELS", "HIGGSFIELD_ENDPOINT"]) vi.stubEnv(key, "");
    const execute = vi.fn();
    const engine = new AiEngine({
      textAdapters: new Map(),
      imageAdapters: new Map([["openai", { execute }]]),
    });

    await expect(engine.executeImage("image_generation", { prompt: "Render" })).rejects.toMatchObject({
      category: "configuration",
      message: "No configured provider model is available for nano-banana.",
    });
    expect(execute).not.toHaveBeenCalled();
  });
});
