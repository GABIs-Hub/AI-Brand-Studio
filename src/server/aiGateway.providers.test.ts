import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  openaiText: vi.fn(),
  openaiImage: vi.fn(),
  anthropicText: vi.fn(),
  geminiGenerate: vi.fn(),
  higgsfieldSubscribe: vi.fn(),
  higgsfieldConfig: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAI {
    chat = { completions: { create: sdk.openaiText } };
    images = { generate: sdk.openaiImage };
  },
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class Anthropic {
    messages = { create: sdk.anthropicText };
  },
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class GoogleGenAI {
    models = { generateContent: sdk.geminiGenerate };
  },
}));

vi.mock("@higgsfield/client/v2", () => ({
  higgsfield: { subscribe: sdk.higgsfieldSubscribe },
  config: sdk.higgsfieldConfig,
}));

const ENV_KEYS = [
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "OPENAI_TEXT_MODELS",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_MODEL",
  "ANTHROPIC_TEXT_MODELS",
  "GEMINI_API_KEY",
  "GEMINI_TEXT_MODELS",
  "GEMINI_IMAGE_MODELS",
  "HF_CREDENTIALS",
  "HF_API_KEY",
  "HF_API_SECRET",
] as const;

async function loadGateway() {
  return import("./aiGateway");
}

describe("AI gateway provider ladders", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    for (const key of ENV_KEYS) delete process.env[key];
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    for (const key of ENV_KEYS) delete process.env[key];
  });

  it("uses only the cheapest OpenAI override for lite requests", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_TEXT_MODELS = "large-model, small-model";
    sdk.openaiText.mockResolvedValue({ choices: [{ message: { content: "small result" } }] });
    const { generateText } = await loadGateway();

    await expect(
      generateText({ prompt: "Short answer", preferred: "openai", tier: "lite" })
    ).resolves.toBe("small result");

    expect(sdk.openaiText).toHaveBeenCalledOnce();
    expect(sdk.openaiText).toHaveBeenCalledWith({
      model: "small-model",
      messages: [{ role: "user", content: "Short answer" }],
      temperature: 0.7,
      max_tokens: 4096,
    });
  });

  it("uses the max-tier token budget and caller overrides", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_TEXT_MODELS = "max-model";
    sdk.openaiText
      .mockResolvedValueOnce({ choices: [{ message: { content: "default budget" } }] })
      .mockResolvedValueOnce({ choices: [{ message: { content: "custom budget" } }] });
    const { generateText } = await loadGateway();

    await generateText({ prompt: "large", preferred: "openai", tier: "max" });
    await generateText({ prompt: "custom", preferred: "openai", tier: "max", maxTokens: 1234 });

    expect(sdk.openaiText.mock.calls[0][0].max_tokens).toBe(8192);
    expect(sdk.openaiText.mock.calls[1][0].max_tokens).toBe(1234);
  });

  it("retries OpenAI without structured output before changing models", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_TEXT_MODELS = "schema-model, fallback-model";
    sdk.openaiText
      .mockRejectedValueOnce(new Error("response_format is unsupported"))
      .mockResolvedValueOnce({ choices: [{ message: { content: '{"ok":true}' } }] });
    const { generateText } = await loadGateway();
    const schema = { type: "object", properties: { ok: { type: "boolean" } } };

    await expect(
      generateText({ prompt: "JSON", preferred: "openai", tier: "max", jsonSchema: schema })
    ).resolves.toBe('{"ok":true}');

    expect(sdk.openaiText).toHaveBeenCalledTimes(2);
    expect(sdk.openaiText.mock.calls[0][0]).toMatchObject({
      model: "schema-model",
      response_format: {
        type: "json_schema",
        json_schema: { name: "structured_result", schema, strict: false },
      },
    });
    expect(sdk.openaiText.mock.calls[1][0].model).toBe("schema-model");
    expect(sdk.openaiText.mock.calls[1][0]).not.toHaveProperty("response_format");
  });

  it("stops an authenticated provider ladder after an auth error and tries the next provider", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_TEXT_MODELS = "openai-one, openai-two";
    process.env.ANTHROPIC_API_KEY = "test-key";
    process.env.ANTHROPIC_TEXT_MODELS = "claude-one";
    sdk.openaiText.mockRejectedValue(new Error("401 invalid api key"));
    sdk.anthropicText.mockResolvedValue({ content: [{ type: "text", text: "Claude result" }] });
    const { generateText } = await loadGateway();

    await expect(generateText({ prompt: "Fallback", tier: "max" })).resolves.toBe("Claude result");

    expect(sdk.openaiText).toHaveBeenCalledOnce();
    expect(sdk.anthropicText).toHaveBeenCalledOnce();
    expect(sdk.anthropicText.mock.calls[0][0].model).toBe("claude-one");
  });

  it("prioritizes Anthropic and combines only returned text blocks", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.ANTHROPIC_API_KEY = "test-key";
    process.env.ANTHROPIC_TEXT_MODELS = "claude-max, claude-lite";
    sdk.anthropicText.mockResolvedValue({
      content: [
        { type: "text", text: "first" },
        { type: "tool_use", id: "ignored" },
        { type: "text", text: " second" },
      ],
    });
    const { generateText } = await loadGateway();

    await expect(
      generateText({
        prompt: "Return JSON",
        system: "Be concise.",
        preferred: "anthropic",
        tier: "max",
        requireJson: true,
        temperature: 0,
      })
    ).resolves.toBe("first second");

    expect(sdk.openaiText).not.toHaveBeenCalled();
    expect(sdk.anthropicText).toHaveBeenCalledWith({
      model: "claude-max",
      max_tokens: 8192,
      system: "Be concise.\n\nRespond with valid JSON only. No markdown code fences.",
      messages: [{ role: "user", content: "Return JSON" }],
      temperature: 0,
    });
  });

  it("uses Gemini's lite rung and JSON request configuration", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_TEXT_MODELS = "gemini-large, gemini-small";
    sdk.geminiGenerate.mockResolvedValue({ text: '{"answer":true}' });
    const { generateText } = await loadGateway();

    await expect(
      generateText({
        prompt: "Question",
        system: "System",
        preferred: "gemini",
        tier: "lite",
        requireJson: true,
        temperature: 0.1,
      })
    ).resolves.toBe('{"answer":true}');

    expect(sdk.geminiGenerate).toHaveBeenCalledOnce();
    expect(sdk.geminiGenerate).toHaveBeenCalledWith({
      model: "gemini-small",
      contents: "System\n\nQuestion\nRespond with valid JSON only, no markdown.",
      config: {
        responseMimeType: "application/json",
        responseSchema: undefined,
        temperature: 0.1,
      },
    });
  });

  it("uses Gemini image model overrides in order", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_IMAGE_MODELS = "custom-image-one, custom-image-two";
    sdk.geminiGenerate
      .mockRejectedValueOnce(new Error("model not found"))
      .mockResolvedValueOnce({
        candidates: [
          { content: { parts: [{ inlineData: { mimeType: "image/webp", data: "encoded" } }] } },
        ],
      });
    const { generateImage } = await loadGateway();

    await expect(
      generateImage({ prompt: "A logo", preferred: "gemini", aspectRatio: "16:9", size: "4K" })
    ).resolves.toEqual({
      imageUrl: "data:image/webp;base64,encoded",
      engine: "gemini",
      format: "png",
    });

    expect(sdk.geminiGenerate.mock.calls.map(([request]) => request.model)).toEqual([
      "custom-image-one",
      "custom-image-two",
    ]);
    expect(sdk.geminiGenerate.mock.calls[1][0].config).toEqual({
      imageConfig: { aspectRatio: "16:9" },
    });
  });

  it("passes supported image sizes only to the compatible default Gemini model", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    sdk.geminiGenerate.mockResolvedValue({
      candidates: [{ content: { parts: [{ inlineData: { data: "encoded" } }] } }],
    });
    const { generateImage } = await loadGateway();

    await generateImage({ prompt: "A logo", preferred: "gemini", aspectRatio: "1:1", size: "4K" });

    expect(sdk.geminiGenerate).toHaveBeenCalledWith({
      model: "gemini-3.1-flash-image",
      contents: { parts: [{ text: "A logo" }] },
      config: { imageConfig: { aspectRatio: "1:1", imageSize: "4K" } },
    });
  });

  it("reports a stable error when no text providers are configured", async () => {
    const { generateText } = await loadGateway();
    await expect(generateText({ prompt: "No credentials" })).rejects.toThrow(
      "All AI text providers are unavailable."
    );
  });
});
