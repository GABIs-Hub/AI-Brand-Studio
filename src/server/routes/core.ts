import { getSession } from "@auth/express";
import type { Express, Request, Response, NextFunction } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";
import {
  authConfig,
  authMiddleware,
  registerUser,
  createAuthToken,
  consumeAuthToken,
} from "../auth";
import { buildResetEmail, buildVerifyEmail, makeResetLink, makeVerifyLink, sendMail } from "../mail";
import { hash } from "bcryptjs";
import { getBrandsByUser, upsertBrand, deleteBrand, getSql, isDbConfigured } from "../db";
import { uploadImageToStore } from "../imageStore";
import { prepareBrandForPersistence } from "../brandPayload";
import type { BrandListResponse, BrandMutationResponse, BrandRouteParams, HealthResponse } from "../../types/api";
import { sendApiError, sendInternalApiError } from "../security/requestSecurity";

declare global {
  namespace Express {
    interface Request {
      auth?: { user?: { id?: string } } | null;
      userId?: string;
    }
  }
}

export interface CoreRouteDependencies {
  authRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
}

export function registerCoreRoutes(app: Express, { authRateLimiter }: CoreRouteDependencies): void {
// ───────────────────────────────────────────────────────────────────────────
// Authentication (Auth.js Express) + brand library API (Neon Postgres)
// ───────────────────────────────────────────────────────────────────────────
// Registration must be mounted before ExpressAuth so it wins for /api/auth/register.
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    const user = await registerUser({ email, password, name });
    // Issue an email-verification token and send the link (best-effort —
    // registration still succeeds if mail fails; the signed-in banner offers
    // a resend). With no mail provider configured the link prints to console.
    try {
      const token = await createAuthToken(`verify:${user.email}`, VERIFY_TOKEN_TTL_MS);
      await sendMail(buildVerifyEmail(user.email, makeVerifyLink(user.email, token)));
    } catch (err: any) {
      console.warn("[Auth API] Could not send verification email:", err?.message || err);
    }
    return res.status(201).json({ user });
  } catch (err: any) {
    return sendApiError(res, 400, "BAD_REQUEST", "Registration failed.");
  }
});

// ── Email verification & password reset (Auth.js verification tokens) ──────
// Mounted before ExpressAuth so these routes win for /api/auth/*.
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Request a password reset. Always answers ok — never reveals whether an
// account exists (no account enumeration).
app.post("/api/auth/forgot-password", authRateLimiter, async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return sendApiError(res, 400, "VALIDATION_ERROR", "Please enter a valid email address.");
  }
  try {
    const db = getSql();
    if (db) {
      const rows = await db`select id from users where lower(email) = ${email}`;
      if (rows?.length) {
        const token = await createAuthToken(`reset:${email}`, RESET_TOKEN_TTL_MS);
        await sendMail(buildResetEmail(email, makeResetLink(email, token)));
      }
    }
  } catch (err: any) {
    console.warn("[Auth API] Password-reset flow failed:", err?.message || err);
  }
  return res.json({ ok: true });
});

// Consume the emailed token and set a new password.
app.post("/api/auth/reset-password", authRateLimiter, async (req, res) => {
  const { token, password } = req.body || {};
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!token || typeof token !== "string") {
    return sendApiError(
      res,
      400,
      "VALIDATION_ERROR",
      "This reset link is invalid or has expired. Please request a new one."
    );
  }
  if (!EMAIL_RE.test(email)) {
    return sendApiError(res, 400, "VALIDATION_ERROR", "Please enter a valid email address.");
  }
  if (!password || String(password).length < 8) {
    return sendApiError(res, 400, "VALIDATION_ERROR", "Password must be at least 8 characters.");
  }
  const db = getSql();
  if (!db) {
    return sendApiError(res, 500, "DATABASE_ERROR", "Accounts are not configured on this server.");
  }
  const consumed = await consumeAuthToken(`reset:${email}`, token);
  if (!consumed) {
    return res.status(400).json({
      error: "This reset link is invalid or has expired. Please request a new one.",
    });
  }
  try {
    const users = await db`select id from users where lower(email) = ${email}`;
    if (!users?.length) {
      return sendApiError(res, 400, "VALIDATION_ERROR", "No account matches this reset request.");
    }
    const passwordHash = await hash(String(password), 10);
    await db`update users set password_hash = ${passwordHash} where id = ${users[0].id}`;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("[Auth API] Password reset failed:", err);
    return sendInternalApiError(res, err, "Failed to reset your password. Please try again.");
  }
});

// Consume the emailed token and mark the account email-verified.
app.post("/api/auth/verify-email", authRateLimiter, async (req, res) => {
  const { token } = req.body || {};
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!token || typeof token !== "string" || !EMAIL_RE.test(email)) {
    return sendApiError(res, 400, "VALIDATION_ERROR", "This verification link is invalid or has expired.");
  }
  const db = getSql();
  if (!db) {
    return sendApiError(res, 500, "DATABASE_ERROR", "Accounts are not configured on this server.");
  }
  const consumed = await consumeAuthToken(`verify:${email}`, token);
  if (!consumed) {
    return sendApiError(
      res,
      400,
      "VALIDATION_ERROR",
      "This verification link is invalid or has expired. Please request a new one."
    );
  }
  try {
    await db`update users set "emailVerified" = now() where lower(email) = ${email}`;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("[Auth API] Email verification failed:", err);
    return sendInternalApiError(res, err, "Failed to verify your email. Please try again.");
  }
});

// Re-send the verification email to the signed-in user.
app.post("/api/auth/resend-verification", authRateLimiter, async (req: any, res) => {
  try {
    const session = await getSession(req, authConfig);
    const uid = session?.user?.id;
    if (!uid) {
      return sendApiError(res, 401, "AUTHENTICATION_REQUIRED", "Authentication required.");
    }
    const db = getSql();
    const rows = db ? await db`select email from users where id = ${uid}` : [];
    const email = rows?.[0]?.email;
    if (!email) {
      return sendApiError(res, 404, "NOT_FOUND", "Account not found.");
    }
    const token = await createAuthToken(`verify:${email}`, VERIFY_TOKEN_TTL_MS);
    await sendMail(buildVerifyEmail(email, makeVerifyLink(email, token)));
    return res.json({ ok: true });
  } catch (err: any) {
    console.warn("[Auth API] Resend verification failed:", err?.message || err);
    return sendInternalApiError(res, err, "Failed to resend the verification email.");
  }
});

// Auth.js handles sign-in/sign-out/session for Credentials + Google.
app.use("/api/auth", authMiddleware());

// Populate req.auth with the current session for every API route so protected
// endpoints (brands, images) can authorize. @auth/express only serves the
// /api/auth routes — it does not attach req.auth elsewhere — so we fetch the
// session explicitly with getSession (returns null when signed out).
app.use("/api", async (req: any, _res, next) => {
  try {
    req.auth = await getSession(req, authConfig);
    next();
  } catch (err) {
    next(err);
  }
});

// Require an authenticated session and attach the user id.
function requireAuth<
  P extends ParamsDictionary = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
  Locals extends Record<string, unknown> = Record<string, unknown>
>(req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction): void {
  const session = req.auth;
  const userId = session?.user?.id;
  if (!userId) {
    return sendApiError(res, 401, "AUTHENTICATION_REQUIRED", "Authentication required.");
  }
  req.userId = userId;
  next();
}

// Brand library CRUD (server-side Postgres — credentials never reach the browser)
app.get<{}, BrandListResponse>("/api/brands", requireAuth, async (req, res: Response<BrandListResponse>) => {
  if (!req.userId) return sendApiError(res, 401, "AUTHENTICATION_REQUIRED", "Authentication required.");
  try {
    const brands = await getBrandsByUser(req.userId);
    return res.json({ brands });
  } catch (err: any) {
    console.error("[Brands API] List failed:", err);
    return sendInternalApiError(res, err, "Failed to load your brand library.");
  }
});

app.put<BrandRouteParams, BrandMutationResponse, unknown>("/api/brands/:id", requireAuth, async (req, res) => {
  try {
    if (!req.userId) return sendApiError(res, 401, "AUTHENTICATION_REQUIRED", "Authentication required.");
    const brand = prepareBrandForPersistence(req.body, req.params.id, req.userId);
    if (!brand) {
      return sendApiError(res, 400, "VALIDATION_ERROR", "A valid brand is required.");
    }
    await upsertBrand(req.userId, brand);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("[Brands API] Save failed:", err);
    return sendInternalApiError(res, err, "Failed to save your brand.");
  }
});

app.delete<BrandRouteParams, BrandMutationResponse>("/api/brands/:id", requireAuth, async (req, res) => {
  try {
    if (!req.userId) return sendApiError(res, 401, "AUTHENTICATION_REQUIRED", "Authentication required.");
    await deleteBrand(req.userId, req.params.id);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("[Brands API] Delete failed:", err);
    return sendInternalApiError(res, err, "Failed to delete your brand.");
  }
});

// AI-rendered image upload (Cloudflare R2) — requires auth
app.post("/api/images", requireAuth, async (req: any, res) => {
  const { dataUrl, brandId } = req.body || {};
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    return sendApiError(res, 400, "VALIDATION_ERROR", "A valid image data URL is required.");
  }
  try {
    const url = await uploadImageToStore(dataUrl, `brand-renders/${req.userId}/${brandId || "general"}`);
    return res.json({ url });
  } catch (err: any) {
    console.warn("[Images API] Upload failed:", err?.message || err);
    return sendInternalApiError(res, err, "Failed to store image.");
  }
});

// 1. Health check endpoint (also reports live database connectivity)
app.get("/api/health", async (_req, res) => {
  let db: "not-configured" | "connected" | "error" = "not-configured";
  if (isDbConfigured()) {
    try {
      const sql = getSql();
      await sql`select 1`;
      db = "connected";
    } catch (err) {
      console.error("[Health] Database probe failed:", err);
      db = "error";
    }
  }
  const response: HealthResponse = { status: "ok", time: new Date().toISOString(), db };
  res.json(response);
});

}
