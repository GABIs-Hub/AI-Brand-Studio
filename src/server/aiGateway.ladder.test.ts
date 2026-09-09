import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  it("preserves model order and duplicates for the tier selector to resolve", () => {
    expect(parseModelList("first, second, first")).toEqual(["first", "second", "first"]);
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

  it("does not mutate default or environment ladders", () => {
    const defaultLadder = ["default-strong", "default-cheap"];
    const envLadder = ["env-strong", "env-cheap"];

    pickModelsForTier(defaultLadder, "lite", envLadder, "legacy");

    expect(defaultLadder).toEqual(["default-strong", "default-cheap"]);
    expect(envLadder).toEqual(["env-strong", "env-cheap"]);
  });
});

describe("generateContentWithFallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns the first successful response and forwards request configuration", async () => {
    const generateContent = vi.fn().mockResolvedValue({ text: "generated" });
    const ai = { models: { generateContent } } as any;

    await expect(
      generateContentWithFallback(
        ai,
        { contents: "prompt", config: { temperature: 0.2 } },
        ["preferred", "fallback"]
      )
    ).resolves.toEqual({ text: "generated" });
    expect(generateContent).toHaveBeenCalledOnce();
    expect(generateContent).toHaveBeenCalledWith({
      model: "preferred",
      contents: "prompt",
      config: { temperature: 0.2 },
    });
  });

  it("cascades immediately after a quota error and skips the cooled model later", async () => {
    const generateContent = vi
      .fn()
      .mockRejectedValueOnce(new Error("429 insufficient_quota"))
      .mockResolvedValueOnce({ text: "fallback one" })
      .mockResolvedValueOnce({ text: "fallback two" });
    const ai = { models: { generateContent } } as any;
    const models = ["quota-model-boundary", "healthy-model-boundary"];

    await expect(generateContentWithFallback(ai, { contents: "first" }, models)).resolves.toEqual({
      text: "fallback one",
    });
    await expect(generateContentWithFallback(ai, { contents: "second" }, models)).resolves.toEqual({
      text: "fallback two",
    });

    expect(generateContent.mock.calls.map(([request]) => request.model)).toEqual([
      "quota-model-boundary",
      "healthy-model-boundary",
      "healthy-model-boundary",
    ]);
  });

  it("retries a busy model once before succeeding", async () => {
    const generateContent = vi
      .fn()
      .mockRejectedValueOnce(new Error("503 temporarily busy"))
      .mockResolvedValueOnce({ text: "recovered" });
    const ai = { models: { generateContent } } as any;

    const result = generateContentWithFallback(ai, { contents: "prompt" }, ["busy-then-ok"]);
    await vi.advanceTimersByTimeAsync(350);

    await expect(result).resolves.toEqual({ text: "recovered" });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("moves to the next model after two busy responses", async () => {
    const generateContent = vi
      .fn()
      .mockRejectedValueOnce(new Error("UNAVAILABLE"))
      .mockRejectedValueOnce(new Error("high demand"))
      .mockResolvedValueOnce({ text: "next model" });
    const ai = { models: { generateContent } } as any;

    const result = generateContentWithFallback(
      ai,
      { contents: "prompt" },
      ["persistently-busy", "available-fallback"]
    );
    await vi.advanceTimersByTimeAsync(350);

    await expect(result).resolves.toEqual({ text: "next model" });
    expect(generateContent.mock.calls.map(([request]) => request.model)).toEqual([
      "persistently-busy",
      "persistently-busy",
      "available-fallback",
    ]);
  });

  it("moves on when a model returns no text", async () => {
    const generateContent = vi
      .fn()
      .mockResolvedValueOnce({ text: "" })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ text: "usable" });
    const ai = { models: { generateContent } } as any;

    await expect(
      generateContentWithFallback(ai, { contents: "prompt" }, ["empty", "usable"])
    ).resolves.toEqual({ text: "usable" });
    expect(generateContent.mock.calls.map(([request]) => request.model)).toEqual([
      "empty",
      "empty",
      "usable",
    ]);
  });

  it("throws the final model error when every model fails", async () => {
    const finalError = new Error("unsupported fallback model");
    const generateContent = vi
      .fn()
      .mockRejectedValueOnce(new Error("unsupported preferred model"))
      .mockRejectedValueOnce(finalError);
    const ai = { models: { generateContent } } as any;

    await expect(
      generateContentWithFallback(ai, { contents: "prompt" }, ["bad-one", "bad-two"])
    ).rejects.toBe(finalError);
  });

  it("times out, retries once, and rejects without waiting in real time", async () => {
    const generateContent = vi.fn().mockReturnValue(new Promise(() => undefined));
    const ai = { models: { generateContent } } as any;
    const result = generateContentWithFallback(ai, { contents: "prompt" }, ["never-responds"]);
    const assertion = expect(result).rejects.toThrow("ETIMEDOUT: AI request timed out after 25s");

    await vi.advanceTimersByTimeAsync(25_000);
    await vi.advanceTimersByTimeAsync(350);
    await vi.advanceTimersByTimeAsync(25_000);

    await assertion;
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("reports a stable error for an empty model ladder", async () => {
    const ai = { models: { generateContent: vi.fn() } } as any;

    await expect(generateContentWithFallback(ai, { contents: "prompt" }, [])).rejects.toThrow(
      "All Gemini models were temporarily unreachable."
    );
    expect(ai.models.generateContent).not.toHaveBeenCalled();
  });
});
