import { describe, expect, it } from "vitest";
import { capabilityRegistry, getCapabilityDefinition, supportsModelAlias } from "./capabilityRegistry";

describe("AI capability registry", () => {
  it("defines the current product capabilities with typed defaults", () => {
    expect(getCapabilityDefinition("brand_generation")).toMatchObject({
      modality: "text",
      defaultModelAlias: "astra",
      structuredOutput: "json",
      tier: "max",
    });
    expect(getCapabilityDefinition("image_generation")).toMatchObject({
      modality: "image",
      defaultModelAlias: "nano-banana",
      structuredOutput: "image",
    });
    expect(Object.keys(capabilityRegistry)).toHaveLength(10);
  });

  it("validates supported capability/model combinations", () => {
    const text = getCapabilityDefinition("assistant");
    const image = getCapabilityDefinition("social_image");

    expect(supportsModelAlias(text, "fable")).toBe(true);
    expect(supportsModelAlias(text, "nano-banana")).toBe(false);
    expect(supportsModelAlias(image, "nano-banana")).toBe(true);
  });
});
