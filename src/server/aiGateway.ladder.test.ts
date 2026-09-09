import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import {
  generateContentWithFallback,
  parseModelList,
  pickModelsForTier,
} from "./aiGateway";

describe("parseModelList", () => {
  it("splits a comma-separated env value into a trimmed list", () => {
    expect(parseModelList(" m1 , m2,m3")).toEqual(["m1", "m2", "m3"]);
  });

  it("returns [] for unset, empty or comma-only values", () => {
    expect(parseModelList(undefined)).toEqual([]);
    expect(parseModelList("")).toEqual([]);
    expect(parseModelList("  ,  ,")).toEqual([]);
  });

  it("preserves model order and duplicates for selection to resolve", () => {
    expect(parseModelList("first,second,first")).toEqual(["first", "second", "first"]);
  });
});

describe("pickModelsForTier", () => {
  const defaults = ["big", "mid", "small"];

  it("returns the whole ladder for the max tier", () => {
    expect(pickModelsForTier(defaults, "max", [])).toEqual(["big", "mid", "small"]);
  });

  it("drops only the cheapest rung for the standard tier", () => {
    expect(pickModelsForTier(defaults, "standard", [])).toEqual(["big", "mid"]);
  });

  it("uses only the cheapest rung for the lite tier", () => {
    expect(pickModelsForTier(defaults, "lite", [])).toEqual(["small"]);
  });

  it("an env ladder replaces the defaults entirely", () => {
    expect(pickModelsForTier(defaults, "max", ["x1", "x2"])).toEqual(["x1", "x2"]);
    expect(pickModelsForTier(defaults, "lite", ["x1", "x2"])).toEqual(["x2"]);
  });

  it("always returns at least one model", () => {
    expect(pickModelsForTier(["only"], "standard", [])).toEqual(["only"]);
    expect(pickModelsForTier(["only"], "lite", [])).toEqual(["only"]);
  });

  it("a legacy singular override pins its model to the front", () => {
    expect(pickModelsForTier(defaults, "max", [], "custom")).toEqual([
      "custom",
      "mid",
      "small",
    ]);
    // Already in the ladder -> moved to the front, not duplicated.
    expect(pickModelsForTier(defaults, "max", [], "mid")).toEqual(["mid", "big", "small"]);
    // An explicit env ladder wins over the singular override's presence.
    expect(pickModelsForTier(defaults, "max", ["x1", "x2"], "x1")).toEqual(["x1", "x2"]);
    expect(pickModelsForTier(defaults, "max", ["x1", "x2"], "z9")).toEqual([
      "z9",
      "x2",
    ]);
  });

  it("dedupes the ladder", () => {
    expect(pickModelsForTier(["a", "a", "b"], "max", [])).toEqual(["a", "b"]);
  });

  it("does not mutate defaults or environment overrides", () => {
    const localDefaults = ["big", "small"];
    const override = ["custom-big", "custom-small"];
    pickModelsForTier(localDefaults, "max", override, "legacy");
    expect(localDefaults).toEqual(["big", "small"]);
    expect(override).toEqual(["custom-big", "custom-small"]);
  });

  it("returns an empty selection when both ladders are empty", () => {
    expect(pickModelsForTier([], "max", [])).toEqual([]);
    expect(pickModelsForTier([], "standard", [])).toEqual([]);
    expect(pickModelsForTier([], "lite", [])).toEqual([]);
  });
});

describe("generateContentWithFallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("passes request content and config to the first successful model", async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: "generated" });
    const ai = { models: { generateContent } } as any;

    await expect(
      generateContentWithFallback(
        ai,
        { contents: "prompt", config: { temperature: 0.2 } },
        ["primary", "fallback"]
      )
    ).resolves.toEqual({ text: "generated" });
    expect(generateContent).toHaveBeenCalledOnce();
    expect(generateContent).toHaveBeenCalledWith({
      model: "primary",
      contents: "prompt",
      config: { temperature: 0.2 },
    });
  });

  it("cascades immediately after a quota error and skips the cooled model later", async () => {
    const generateContent = vi
      .fn()
      .mockRejectedValueOnce(new Error("429 RESOURCE_EXHAUSTED"))
      .mockResolvedValue({ text: "fallback" });
    const ai = { models: { generateContent } } as any;
    const models = ["quota-primary", "quota-fallback"];

    await expect(generateContentWithFallback(ai, { contents: "first" }, models)).resolves.toEqual({
      text: "fallback",
    });
    await expect(generateContentWithFallback(ai, { contents: "second" }, models)).resolves.toEqual({
      text: "fallback",
    });

    expect(generateContent.mock.calls.map(([request]) => request.model)).toEqual([
      "quota-primary",
      "quota-fallback",
      "quota-fallback",
    ]);
  });

  it("retries a busy model once before stepping down", async () => {
    const generateContent = vi
      .fn()
      .mockRejectedValueOnce(new Error("503 overloaded"))
      .mockResolvedValueOnce({ text: "recovered" });
    const ai = { models: { generateContent } } as any;

    const result = generateContentWithFallback(ai, { contents: "prompt" }, ["busy-primary"]);
    await vi.advanceTimersByTimeAsync(350);

    await expect(result).resolves.toEqual({ text: "recovered" });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("moves to the next model after an unknown model-specific error", async () => {
    const generateContent = vi
      .fn()
      .mockRejectedValueOnce(new Error("model not found"))
      .mockResolvedValueOnce({ text: "next model" });
    const ai = { models: { generateContent } } as any;

    await expect(
      generateContentWithFallback(ai, { contents: "prompt" }, ["missing-model", "working-model"])
    ).resolves.toEqual({ text: "next model" });
    expect(generateContent.mock.calls.map(([request]) => request.model)).toEqual([
      "missing-model",
      "working-model",
    ]);
  });

  it("throws the final model error after the ladder is exhausted", async () => {
    const finalError = new Error("second model failed");
    const generateContent = vi
      .fn()
      .mockRejectedValueOnce(new Error("first model failed"))
      .mockRejectedValueOnce(finalError);
    const ai = { models: { generateContent } } as any;

    await expect(
      generateContentWithFallback(ai, { contents: "prompt" }, ["first", "second"])
    ).rejects.toBe(finalError);
  });

  it("uses a stable error when no models are available", async () => {
    const ai = { models: { generateContent: vi.fn() } } as any;
    await expect(generateContentWithFallback(ai, { contents: "prompt" }, [])).rejects.toThrow(
      "All Gemini models were temporarily unreachable."
    );
  });
});
