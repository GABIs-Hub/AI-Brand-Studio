import { describe, it, expect } from "vitest";
import { parseModelList, pickModelsForTier } from "./aiGateway";

describe("parseModelList", () => {
  it("splits a comma-separated env value into a trimmed list", () => {
    expect(parseModelList(" m1 , m2,m3")).toEqual(["m1", "m2", "m3"]);
  });

  it("returns [] for unset, empty or comma-only values", () => {
    expect(parseModelList(undefined)).toEqual([]);
    expect(parseModelList("")).toEqual([]);
    expect(parseModelList("  ,  ,")).toEqual([]);
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
});
