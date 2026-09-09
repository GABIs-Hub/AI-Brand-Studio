import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const providerMocks = vi.hoisted(() => ({
  anthropicCreate: vi.fn(),
  geminiGenerateContent: vi.fn(),
  higgsfieldConfig: vi.fn(),
  higgsfieldSubscribe: vi.fn(),
  openAIChatCreate: vi.fn(),
  openAIImageGenerate: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class MockOpenAI {
    chat = { completions: { create: providerMocks.openAIChatCreate } };
    images = { generate: providerMocks.openAIImageGenerate };
  },
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { create: providerMocks.anthropicCreate };
  },
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = { generateContent: providerMocks.geminiGenerateContent };
  },
}));

vi.mock("@higgsfield/client/v2", () => ({
  config: providerMocks.higgsfieldConfig,
  higgsfield: { subscribe: providerMocks.higgsfieldSubscribe },
}));

function clearProviderEnvironment() {
  for (const key of [
    "ANTHROPIC_API_KEY",
    "ANTHROPIC_MODEL",
    "ANTHROPIC_TEXT_MODELS",
    "GEMINI_API_KEY",
    "GEMINI_IMAGE_MODELS",
    "GEMINI_TEXT_MODELS",
    "HF_API_KEY",
    "HF_API_SECRET",
    "HF_CREDENTIALS",
    "OPENAI_API_KEY",
    "OPENAI_MODEL",
    "OPENAI_TEXT_MODELS",
  ]) {
    vi.stubEnv(key, "");
  }
}

describe("AI gateway model ladders", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    vi.useFakeTimers();
    clearProviderEnvironment();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("passes the max-tier OpenAI env ladder and explicit token budget to the client", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
    vi.stubEnv("OPENAI_TEXT_MODELS", "flagship, economical");
    providerMocks.openAIChatCreate.mockResolvedValue({
      choices: [{ message: { content: "openai result" } }],
    });
    const { generateText } = await import("./aiGateway");

    await expect(
      generateText({
        prompt: "Create a brand",
        system: "Be precise",
        preferred: "openai",
        tier: "max",
        maxTokens: 1234,
      })
    ).resolves.toBe("openai result");

    expect(providerMocks.openAIChatCreate).toHaveBeenCalledOnce();
    expect(providerMocks.openAIChatCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "flagship",
        max_tokens: 1234,
        messages: [
          { role: "system", content: "Be precise" },
          { role: "user", content: "Create a brand" },
        ],
      })
    );
  });

  it("steps down the OpenAI ladder after a quota failure", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
    vi.stubEnv("OPENAI_TEXT_MODELS", "first-model, second-model, third-model");
    providerMocks.openAIChatCreate
      .mockRejectedValueOnce(new Error("429 quota exceeded"))
      .mockResolvedValueOnce({ choices: [{ message: { content: "fallback result" } }] });
    const { generateText } = await import("./aiGateway");

    await expect(
      generateText({ prompt: "prompt", preferred: "openai", tier: "max" })
    ).resolves.toBe("fallback result");
    expect(
      providerMocks.openAIChatCreate.mock.calls.map(([request]) => request.model)
    ).toEqual(["first-model", "second-model"]);
  });

  it("retries OpenAI structured output without response_format before cascading", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
    vi.stubEnv("OPENAI_TEXT_MODELS", "structured-model");
    providerMocks.openAIChatCreate
      .mockRejectedValueOnce(new Error("response_format is unsupported"))
      .mockResolvedValueOnce({ choices: [{ message: { content: '{"ok":true}' } }] });
    const { generateText } = await import("./aiGateway");

    await expect(
      generateText({
        prompt: "prompt",
        preferred: "openai",
        requireJson: true,
      })
    ).resolves.toBe('{"ok":true}');

    expect(providerMocks.openAIChatCreate).toHaveBeenCalledTimes(2);
    expect(providerMocks.openAIChatCreate.mock.calls[0][0].response_format).toEqual({
      type: "json_object",
    });
    expect(providerMocks.openAIChatCreate.mock.calls[1][0]).not.toHaveProperty(
      "response_format"
    );
  });

  it("stops trying OpenAI models after an authentication error", async () => {
    vi.stubEnv("OPENAI_API_KEY", "invalid-openai-key");
    vi.stubEnv("OPENAI_TEXT_MODELS", "first-model, second-model");
    const authError = new Error("401 invalid api key");
    providerMocks.openAIChatCreate.mockRejectedValue(authError);
    const { generateText } = await import("./aiGateway");

    await expect(
      generateText({ prompt: "prompt", preferred: "openai", tier: "max" })
    ).rejects.toBe(authError);
    expect(providerMocks.openAIChatCreate).toHaveBeenCalledOnce();
  });

  it("uses only the cheapest Anthropic model for lite JSON requests", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-anthropic-key");
    vi.stubEnv("ANTHROPIC_TEXT_MODELS", "claude-large, claude-small");
    providerMocks.anthropicCreate.mockResolvedValue({
      content: [
        { type: "text", text: "anthropic " },
        { type: "tool_use", id: "ignored" },
        { type: "text", text: "result" },
      ],
    });
    const { generateText } = await import("./aiGateway");

    await expect(
      generateText({
        prompt: "Short answer",
        preferred: "anthropic",
        tier: "lite",
        requireJson: true,
      })
    ).resolves.toBe("anthropic result");

    expect(providerMocks.anthropicCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-small",
        max_tokens: 4096,
        system: "Respond with valid JSON only. No markdown code fences.",
      })
    );
  });

  it("uses only the cheapest Gemini text model for lite requests", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-gemini-key");
    vi.stubEnv("GEMINI_TEXT_MODELS", "gemini-large, gemini-small");
    providerMocks.geminiGenerateContent.mockResolvedValue({ text: "gemini result" });
    const { generateText } = await import("./aiGateway");

    await expect(
      generateText({ prompt: "Short answer", preferred: "gemini", tier: "lite" })
    ).resolves.toBe("gemini result");

    expect(providerMocks.geminiGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gemini-small", contents: "Short answer" })
    );
  });

  it("cascades through the configured Gemini image model override", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-gemini-key");
    vi.stubEnv("GEMINI_IMAGE_MODELS", "image-primary, image-fallback");
    providerMocks.geminiGenerateContent
      .mockRejectedValueOnce(new Error("primary model unsupported"))
      .mockResolvedValueOnce({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { mimeType: "image/png", data: "encoded-image" } }],
            },
          },
        ],
      });
    const { generateImage } = await import("./aiGateway");

    await expect(
      generateImage({ prompt: "Logo", preferred: "gemini", aspectRatio: "16:9" })
    ).resolves.toEqual({
      imageUrl: "data:image/png;base64,encoded-image",
      engine: "gemini",
      format: "png",
    });
    expect(
      providerMocks.geminiGenerateContent.mock.calls.map(([request]) => request.model)
    ).toEqual(["image-primary", "image-fallback"]);
    expect(providerMocks.geminiGenerateContent.mock.calls[1][0].config).toEqual({
      imageConfig: { aspectRatio: "16:9" },
    });
  });
});
