import { describe, expect, it, vi } from "vitest";
import { registerAiRoutes } from "./ai";
import { aiEngine } from "../ai/engine";

describe("AI route integration boundary", () => {
  it("registers every existing AI endpoint", () => {
    const routes: Array<{ method: string; path: string }> = [];
    const app = {
      post: (path: string) => routes.push({ method: "POST", path }),
      get: (path: string) => routes.push({ method: "GET", path }),
    };
    const limiter = (_req: unknown, _res: unknown, next: () => void) => next();

    registerAiRoutes(app as never, { apiRateLimiter: limiter, imageRateLimiter: limiter });

    expect(routes).toEqual([
      { method: "POST", path: "/api/generate-brand" },
      { method: "POST", path: "/api/generate-logo-variations" },
      { method: "POST", path: "/api/refine-logo-prompt" },
      { method: "POST", path: "/api/generate-viral-topics" },
      { method: "POST", path: "/api/audit-brand" },
      { method: "POST", path: "/api/generate-logo-image" },
      { method: "POST", path: "/api/chat" },
      { method: "POST", path: "/api/generate-social-post" },
      { method: "POST", path: "/api/generate-social-image" },
      { method: "POST", path: "/api/generate-ai-mockup" },
      { method: "GET", path: "/api/brand-logo-history" },
      { method: "POST", path: "/api/brand-case-study" },
      { method: "GET", path: "/api/ai-director/status" },
    ]);
  });

  it("preserves the existing stable validation error contract", async () => {
    const handlers = new Map<string, (...args: any[]) => Promise<unknown>>();
    const app = {
      post: (path: string, ...handlersForRoute: Array<(...args: any[]) => Promise<unknown>>) => {
        handlers.set(path, handlersForRoute.at(-1)!);
      },
      get: () => undefined,
    };
    const limiter = (_req: unknown, _res: unknown, next: () => void) => next();
    registerAiRoutes(app as never, { apiRateLimiter: limiter, imageRateLimiter: limiter });

    const res = {
      locals: { requestId: "request-test" },
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    await handlers.get("/api/generate-brand")?.({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: "VALIDATION_ERROR", requestId: "request-test" })
    );
  });
});


describe("merged studio routes", () => {
  function handlers() {
    const routes = new Map<string, (...args: any[]) => Promise<unknown>>();
    const app = {
      post: (path: string, ...callbacks: Array<(...args: any[]) => Promise<unknown>>) => routes.set(path, callbacks.at(-1)!),
      get: (path: string, callback: (...args: any[]) => Promise<unknown>) => routes.set(path, callback),
    };
    const limiter = (_req: unknown, _res: unknown, next: () => void) => next();
    registerAiRoutes(app as never, { apiRateLimiter: limiter, imageRateLimiter: limiter });
    return routes;
  }

  it("preserves the rebrand story in legacy mode without calling an AI provider", async () => {
    const execute = vi.spyOn(aiEngine, "executeText");
    try {
      const res = { json: vi.fn() };
      await handlers().get("/api/generate-brand")!({ body: {
        brandName: "Acme", mission: "Create durable tools", industry: "Technology",
        powerLevel: "legacy", isRebrand: true, currentLogoType: "description",
        currentLogo: "An old emblem", rebrandMode: "impress_me",
      } }, res);
      expect(execute).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        powerLevel: "legacy", brandName: "Acme",
        rebrandStory: expect.objectContaining({ isRebrand: true, previousLogo: "An old emblem" }),
      }));
    } finally { execute.mockRestore(); }
  });

  it("generates a safe procedural mockup when the image engine is unavailable", async () => {
    const execute = vi.spyOn(aiEngine, "executeImage").mockRejectedValue(new Error("provider unavailable"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    try {
      const res = { json: vi.fn() };
      await handlers().get("/api/generate-ai-mockup")!({ body: {
        brandName: "Acme</text><script>alert(1)</script>", palette: [{ hex: '#123456" onload="alert(1)' }],
      } }, res);
      const result = res.json.mock.calls[0][0];
      expect(result).toMatchObject({ engine: "procedural-studio", isFallback: true });
      expect(execute).toHaveBeenCalledWith("image_generation", expect.objectContaining({ taskType: "photorealistic_mockup" }));
      const svg = Buffer.from(result.imageUrl.split(",")[1], "base64").toString();
      expect(svg).toContain("ACME&lt;/TEXT&gt;");
      expect(svg).not.toMatch(/<script|onload=/i);
    } finally { execute.mockRestore(); warn.mockRestore(); }
  });
});
