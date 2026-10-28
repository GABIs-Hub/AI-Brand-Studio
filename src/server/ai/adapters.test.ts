import { describe, expect, it, vi } from "vitest";

const gatewayMocks = vi.hoisted(() => ({
  generateText: vi.fn(),
  generateImage: vi.fn(),
}));

vi.mock("../aiGateway", () => gatewayMocks);

import { createImageProviderAdapters, createTextProviderAdapters } from "./adapters";

describe("AI provider adapters", () => {
  it("normalizes text execution through the selected gateway provider", async () => {
    gatewayMocks.generateText.mockResolvedValue("normalized text");
    const adapter = createTextProviderAdapters().get("anthropic");

    await expect(adapter?.execute({ prompt: "prompt" }, { provider: "anthropic", providerModelId: "configured-model" })).resolves.toBe("normalized text");
    expect(gatewayMocks.generateText).toHaveBeenCalledWith({
      prompt: "prompt",
      preferred: "anthropic",
      providerModelId: "configured-model",
      providerModelProvider: "anthropic",
    });
  });

  it("normalizes image execution through the selected gateway provider", async () => {
    gatewayMocks.generateImage.mockResolvedValue({ imageUrl: "https://example.test/image.png", engine: "gemini" });
    const adapter = createImageProviderAdapters().get("gemini");

    await expect(adapter?.execute({ prompt: "image", aspectRatio: "1:1" }, { provider: "gemini", providerModelId: "configured-image-model" })).resolves.toEqual({
      imageUrl: "https://example.test/image.png",
      engine: "gemini",
    });
    expect(gatewayMocks.generateImage).toHaveBeenCalledWith({
      prompt: "image",
      aspectRatio: "1:1",
      preferred: "gemini",
      providerModelId: "configured-image-model",
      providerModelProvider: "gemini",
    });
  });
});
