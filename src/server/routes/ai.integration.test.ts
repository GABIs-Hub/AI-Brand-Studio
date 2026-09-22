import { describe, expect, it, vi } from "vitest";
import { registerAiRoutes } from "./ai";

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
      { method: "GET", path: "/api/brand-logo-history" },
      { method: "POST", path: "/api/brand-case-study" },
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
