import "./env"; // MUST be first: loads .env before other modules evaluate
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { registerCoreRoutes } from "./routes/core";
import { registerAiRoutes } from "./routes/ai";
import { sendApiError, apiErrorMiddleware, requestIdMiddleware } from "./security/requestSecurity";
import { isAllowedOrigin } from "./security/originPolicy";

const app = express();
const PORT = 3000;

app.use(requestIdMiddleware);
app.use(express.json({ limit: "10mb" }));

if (process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

const APP_URL = (process.env.APP_URL || "").replace(/\/+$/, "");

app.use("/api", (req, res, next) => {
  if (APP_URL) {
    const origin = req.headers.origin;
    if (!isAllowedOrigin(origin, [APP_URL])) {
      return sendApiError(
        res,
        403,
        "AUTHORIZATION_ERROR",
        "Cross-origin API requests are not allowed."
      );
    }
  }
  next();
});

const WINDOW_MS = 60_000;
const rateLimitBuckets = new Map<string, { windowStart: number; count: number }>();

function createRateLimiter(maxRequests: number, label: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${label}:${ip}`;
    const now = Date.now();
    const bucket = rateLimitBuckets.get(key);
    if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
      rateLimitBuckets.set(key, { windowStart: now, count: 1 });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > maxRequests) {
      const retryAfter = Math.ceil((WINDOW_MS - (now - bucket.windowStart)) / 1000);
      return res.status(429).json({
        error: `Rate limit exceeded for ${label}. Please wait ${retryAfter}s and try again.`,
      });
    }
    return next();
  };
}

const apiRateLimiter = createRateLimiter(30, "AI requests");
const imageRateLimiter = createRateLimiter(6, "image generation");
const authRateLimiter = createRateLimiter(10, "account security");

const rateLimitPruner = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets) {
    if (now - bucket.windowStart >= WINDOW_MS) {
      rateLimitBuckets.delete(key);
    }
  }
}, WINDOW_MS * 2);
rateLimitPruner.unref();

registerCoreRoutes(app, { authRateLimiter });
registerAiRoutes(app, { apiRateLimiter, imageRateLimiter });

app.all("/api/*", (_req, res) => {
  sendApiError(res, 404, "NOT_FOUND", "API endpoint not found.");
});

app.use(apiErrorMiddleware);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
