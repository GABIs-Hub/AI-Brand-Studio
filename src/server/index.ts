import "./env"; // MUST be first: loads .env before other modules evaluate
import express from "express";
import path from "path";
import { Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { generateText, generateImage, ImageProvider, TextProvider } from "./aiGateway";
import { generateProceduralLogoVariations, synthesizeProceduralBrand } from "./proceduralBrands";
import { routeTask, getDirectorStatus } from "./aiDirector";
import { resolveIndustryDirection } from "./industryContext";
import { getSession } from "@auth/express";
import {
  authConfig,
  authMiddleware,
  registerUser,
  createAuthToken,
  consumeAuthToken,
} from "./auth";
import { buildResetEmail, buildVerifyEmail, makeResetLink, makeVerifyLink, sendMail } from "./mail";
import { hash } from "bcryptjs";
import { getBrandsByUser, upsertBrand, deleteBrand, getSql, isDbConfigured } from "./db";
import { uploadImageToStore, isImageStoreConfigured } from "./imageStore";
import { applyLogoHistoryToEras, getLogoHistory, matchImagesToEras } from "./logoHistory";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Behind a hosting proxy (Render / Fly / Railway), trust the first hop so
// req.ip (rate limiting) and protocol detection (secure cookies) reflect the
// real client. Off locally — set TRUST_PROXY=1 when deployed.
if (process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

// ---------------------------------------------------------------------------
// API protection: origin enforcement + in-memory sliding-window rate limiting
// ---------------------------------------------------------------------------
const APP_URL = (process.env.APP_URL || "").replace(/\/+$/, "");

// Reject cross-origin API requests when an explicit APP_URL is configured.
// Same-origin browser requests carry an Origin header matching APP_URL; requests
// without an Origin header (curl, same-tab fetches, health probes) are allowed.
app.use("/api", (req, res, next) => {
  if (APP_URL) {
    const origin = req.headers.origin;
    if (origin && !origin.startsWith(APP_URL)) {
      return res.status(403).json({ error: "Cross-origin API requests are not allowed." });
    }
  }
  next();
});

// Simple in-memory sliding-window rate limiter keyed by client IP.
// Protects paid Gemini/Imagen quota from abuse when the applet is deployed publicly.
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

// General AI endpoints: 30 requests/min per IP.
const apiRateLimiter = createRateLimiter(30, "AI requests");
// Expensive image-generation endpoints: 6 requests/min per IP.
const imageRateLimiter = createRateLimiter(6, "image generation");
// Account-security actions (password reset, email verification): 10/min per IP.
const authRateLimiter = createRateLimiter(10, "account security");

// Periodically prune stale rate-limit buckets so memory stays bounded.
const rateLimitPruner = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets) {
    if (now - bucket.windowStart >= WINDOW_MS) {
      rateLimitBuckets.delete(key);
    }
  }
}, WINDOW_MS * 2);
rateLimitPruner.unref();







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
    return res.status(400).json({ error: err?.message || "Registration failed." });
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
    return res.status(400).json({ error: "Please enter a valid email address." });
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
    return res.status(400).json({
      error: "This reset link is invalid or has expired. Please request a new one.",
    });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (!password || String(password).length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }
  const db = getSql();
  if (!db) {
    return res.status(500).json({ error: "Accounts are not configured on this server." });
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
      return res.status(400).json({ error: "No account matches this reset request." });
    }
    const passwordHash = await hash(String(password), 10);
    await db`update users set password_hash = ${passwordHash} where id = ${users[0].id}`;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("[Auth API] Password reset failed:", err);
    return res.status(500).json({ error: "Failed to reset your password. Please try again." });
  }
});

// Consume the emailed token and mark the account email-verified.
app.post("/api/auth/verify-email", authRateLimiter, async (req, res) => {
  const { token } = req.body || {};
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!token || typeof token !== "string" || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "This verification link is invalid or has expired." });
  }
  const db = getSql();
  if (!db) {
    return res.status(500).json({ error: "Accounts are not configured on this server." });
  }
  const consumed = await consumeAuthToken(`verify:${email}`, token);
  if (!consumed) {
    return res.status(400).json({
      error: "This verification link is invalid or has expired. Please request a new one.",
    });
  }
  try {
    await db`update users set "emailVerified" = now() where lower(email) = ${email}`;
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("[Auth API] Email verification failed:", err);
    return res.status(500).json({ error: "Failed to verify your email. Please try again." });
  }
});

// Re-send the verification email to the signed-in user.
app.post("/api/auth/resend-verification", authRateLimiter, async (req: any, res) => {
  try {
    const session = await getSession(req, authConfig);
    const uid = session?.user?.id;
    if (!uid) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const db = getSql();
    const rows = db ? await db`select email from users where id = ${uid}` : [];
    const email = rows?.[0]?.email;
    if (!email) {
      return res.status(404).json({ error: "Account not found." });
    }
    const token = await createAuthToken(`verify:${email}`, VERIFY_TOKEN_TTL_MS);
    await sendMail(buildVerifyEmail(email, makeVerifyLink(email, token)));
    return res.json({ ok: true });
  } catch (err: any) {
    console.warn("[Auth API] Resend verification failed:", err?.message || err);
    return res.status(500).json({ error: "Failed to resend the verification email." });
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
function requireAuth(req: any, res: any, next: any) {
  const session = req.auth;
  const userId = session?.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required." });
  }
  req.userId = userId;
  next();
}

// Brand library CRUD (server-side Postgres — credentials never reach the browser)
app.get("/api/brands", requireAuth, async (req: any, res) => {
  try {
    const brands = await getBrandsByUser(req.userId);
    return res.json({ brands });
  } catch (err: any) {
    console.error("[Brands API] List failed:", err);
    return res.status(500).json({ error: "Failed to load your brand library." });
  }
});

app.put("/api/brands/:id", requireAuth, async (req: any, res) => {
  try {
    const brand = req.body;
    if (!brand || !brand.id || !brand.brandName) {
      return res.status(400).json({ error: "A valid brand is required." });
    }
    await upsertBrand(req.userId, brand);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("[Brands API] Save failed:", err);
    return res.status(500).json({ error: "Failed to save your brand." });
  }
});

app.delete("/api/brands/:id", requireAuth, async (req: any, res) => {
  try {
    await deleteBrand(req.userId, req.params.id);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("[Brands API] Delete failed:", err);
    return res.status(500).json({ error: "Failed to delete your brand." });
  }
});

// AI-rendered image upload (Cloudflare R2) — requires auth
app.post("/api/images", requireAuth, async (req: any, res) => {
  const { dataUrl, brandId } = req.body || {};
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    return res.status(400).json({ error: "A valid image data URL is required." });
  }
  try {
    const url = await uploadImageToStore(dataUrl, `brand-renders/${req.userId}/${brandId || "general"}`);
    return res.json({ url });
  } catch (err: any) {
    console.warn("[Images API] Upload failed:", err?.message || err);
    return res.status(500).json({ error: "Failed to store image." });
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
  res.json({ status: "ok", time: new Date().toISOString(), db });
});

// 2. Generate Brand Bible Endpoint (Handles both new ventures and existing brand refreshes / upgrades)
app.post("/api/generate-brand", apiRateLimiter, async (req, res) => {
  try {
    const {
      brandName,
      mission,
      industry,
      aesthetic,
      targetAudience,
      isExistingBrandRefresh,
      existingColors,
      existingTagline,
      baseBrandId,
      previousVersionDetails,
      isRebrand,
      currentLogo,
      currentLogoType,
      currentTypography,
      preferredTypography,
      rebrandMode,
      customRebrandPrompt,
      // GABI Brand Intelligence & Contextual parameters
      powerLevel = 'pro',
      productsServices,
      geographicMarket,
      brandArchetype,
      competitiveEnvironment,
      primaryColorPreference,
      tonePreference,
    } = req.body;

    if (!mission || typeof mission !== "string" || mission.trim().length === 0) {
      return res.status(400).json({ error: "Mission statement or current company core is required." });
    }

    const resolvedIndustry = industry || "Innovation & Technology";
    const industryDir = resolveIndustryDirection(resolvedIndustry, mission);
    const chosenColors = primaryColorPreference
      ? [primaryColorPreference, ...(existingColors || [])]
      : existingColors;

    // Fast-path: Legacy Mode runs the high-aesthetic deterministic synthesis engine directly
    if (powerLevel === 'legacy') {
      const synthesized: any = synthesizeProceduralBrand({
        brandName,
        mission,
        industry: resolvedIndustry,
        aesthetic,
        targetAudience,
        isExistingBrandRefresh,
        existingColors: chosenColors,
        existingTagline,
        isRebrand,
        currentLogo,
        currentLogoType,
        currentTypography,
        rebrandMode,
        customRebrandPrompt,
      });
      synthesized.powerLevel = 'legacy';
      synthesized.productsServices = productsServices;
      synthesized.geographicMarket = geographicMarket;
      synthesized.brandArchetype = brandArchetype || synthesized.brandArchetype || industryDir.logoArchetypes[0];
      synthesized.competitiveEnvironment = competitiveEnvironment;
      return res.json(synthesized);
    }

    const startTime = Date.now();
    const decision = routeTask('brand_strategy', {
      powerLevel,
      userPreferredProvider: req.body?.provider,
    });

    // Attempt AI generation across the provider gateway (routed by AI Director)
    try {
        let refreshInstruction = "Generate a brand identity from scratch.";
        if (isRebrand) {
          const modeDescription = rebrandMode === 'custom_prompt'
            ? `USER'S CUSTOM REBRAND VISION & SPECIFIC INSTRUCTIONS:\n"${customRebrandPrompt || "Modernize the brand with elevated polish and authority"}"\nExecute these specific instructions meticulously while ensuring world-class design standards.`
            : `GABI AUTONOMOUS STRATEGIC REASONING MANDATE:\nAnalyze the user's legacy brand assets below. Diagnose visual bottlenecks, outdated tropes, accessibility or contrast shortcomings, and formulate an ambitious, visionary transformation that positions this brand as an undisputed industry leader.`;

          refreshInstruction = `NOTE: THIS IS AN OFFICIAL STRATEGIC REBRAND & MODERNIZATION PROJECT.
The user is rebranding their company/product from its previous identity to an elevated, modern new phase.

Current Legacy Brand Assets:
- Current Brand Name: "${brandName || "Legacy Brand"}"
- Current Colors: ${chosenColors && chosenColors.length > 0 ? chosenColors.join(", ") : "Not specified"}
- Current Typography: ${currentTypography ? `Heading: ${currentTypography.headingFont || "Unspecified"}, Body: ${currentTypography.bodyFont || "Unspecified"}` : "Not specified"}
- Current Logo: ${currentLogo ? (currentLogoType === "description" ? currentLogo : "Existing logo graphic provided") : "Legacy emblem provided"}

Strategic Mode:
${modeDescription}

MANDATORY REBRAND DELIVERABLE:
You MUST generate a cohesive 'rebrandStory' containing:
1. 'rebrandTitle': A punchy, inspiring rebrand campaign title (e.g. "From Utility to Artistry: The Next Era of ${brandName || "Brand"}").
2. 'rebrandBio': An inspiring, eloquent 2-3 paragraph strategic story / announcement bio ("Why We're Moving Towards This New Phase") explaining the heritage, why the company is shifting now, what the new identity represents, and how it aligns with modern customer expectations.
3. 'strategicDiagnosis': A sharp 1-2 sentence assessment of what needed evolution in the previous identity.
4. 'keyEvolutionPoints': 3-4 structured comparison items with 'title', 'before', 'after', and 'strategicWhy'.`;
        } else if (isExistingBrandRefresh) {
          refreshInstruction = `NOTE: THIS IS AN EXISTING BRAND REFRESH & MODERNIZATION UPGRADE.
Preserve the user's established Brand Name ("${brandName}"), existing identity equity, and harmonize the colors/tagline without completely discarding their recognizable history.`;
          if (previousVersionDetails) {
            refreshInstruction += `
Previous Version Context:
- Previous Typography: ${previousVersionDetails.typography || "Not specified"}
- Previous Logo Concept: ${previousVersionDetails.logoConcept || "Not specified"}
- Previous Core Values: ${previousVersionDetails.values ? previousVersionDetails.values.join(", ") : "Not specified"}
Upgrade this brand to a higher tier of modern polish and visual distinction while maintaining recognizable continuity.`;
          }
        }

        const prompt = `
You are a world-class Creative Director and Brand Strategist at an award-winning identity design firm.
Your task is to generate a comprehensive, highly cohesive, production-grade "Brand Bible" strictly tailored to the specific business context, industry benchmarks, and strategic requirements below.

${refreshInstruction}

STRATEGIC BRIEF:
- Brand Name: ${brandName || "Please invent a memorable, premium, distinctive brand name"}
- Industry & Domain: ${resolvedIndustry} (${industryDir.name})
- Core Mission & Purpose: ${mission}
- Products & Services: ${productsServices || "High-craft core offerings aligned with mission"}
- Target Audience & User Persona: ${targetAudience || "Discerning modern clients and practitioners"}
- Geographic / Cultural Market: ${geographicMarket || "Global / Prime Metropolitan"}
- Competitive Landscape: ${competitiveEnvironment || "Fast-moving, quality-conscious landscape requiring unmistakable differentiation"}
- Preferred Brand Archetype: ${brandArchetype || industryDir.logoArchetypes[0]} (Alternatives: ${industryDir.logoArchetypes.join(', ')})
- Aesthetic Vibe & Tone: ${aesthetic || "Modern, Clean, High-Contrast"} ${tonePreference ? `| Specific Tone: ${tonePreference}` : ""}
${existingTagline ? `- Established Tagline: ${existingTagline}` : ""}
${chosenColors && chosenColors.length > 0 ? `- Established Color Anchors: ${chosenColors.join(", ")}` : ""}
${preferredTypography?.headingFont ? `- User-Specified Preferred Heading Font: ${preferredTypography.headingFont} (from Google Fonts)` : ""}
${preferredTypography?.bodyFont ? `- User-Specified Preferred Body Font: ${preferredTypography.bodyFont} (from Google Fonts)` : ""}

INDUSTRY CREATIVE INTELLIGENCE GUIDELINES:
1. Color Architecture Philosophy:
   - Hue Family: ${industryDir.colorPhilosophy.hueFamily}
   - Palette Rationale: ${industryDir.colorPhilosophy.paletteRationale}
   - Recommended Seed Hues: ${industryDir.colorPhilosophy.suggestedSeedHues.join(', ')}
   - Surface Treatment: ${industryDir.colorPhilosophy.surfaceTreatment}
   - Follow 60-30-10 distribution (60% Neutral canvas, 30% Primary family, 10% Accent CTA pop).
   - Ensure WCAG AA compliance (Primary/Secondary >= 4.5:1 against Neutral Light; Light vs Dark >= 7:1).
2. Typographic Rules:
   - Heading Stance: ${industryDir.typographyRules.headingStyle}
   - Body Stance: ${industryDir.typographyRules.bodyStyle}
   - Curated Reference Pairings: ${industryDir.typographyRules.recommendedPairings.map(p => `${p.heading} + ${p.body} (${p.rationale})`).join(' | ')}
3. Logo Geometry & Vector Architecture:
   - Structural Guidance: ${industryDir.logoGeometryGuidance}
   - Target Archetypes: ${industryDir.logoArchetypes.join(', ')}
   - primaryLogoSvg MUST be an agency-quality vector SVG with <defs>, gradients or negative space/interlocking paths, viewBox="0 0 320 100".
4. Applied Photography & Material Direction:
   - Camera & Lens: ${industryDir.photographyDirection.lens}
   - Lighting Physics: ${industryDir.photographyDirection.lighting}
   - Materials & Texture: ${industryDir.photographyDirection.materials}
   - Color Grade: ${industryDir.photographyDirection.colorGrade}

DELIVERABLE REQUIREMENTS:
1. Brand Core: brandName, tagline, industry, mission, vision, positioningStatement, personalityTraits (4 items with trait, rating 1-5, minLabel, maxLabel), values (4 items with title, description, iconName among Lucide icons).
2. 5-Color Hex Palette: Exactly 5 colors (Primary, Secondary, Accent, Neutral Light, Neutral Dark) with name, hex, rgb, role, usage, contrastNote.
3. Typography & Google Fonts: headingFont, headingFontCategory, headingWeights, bodyFont, bodyFontCategory, bodyWeights, googleFontsUrl, rationale, cssSnippet.
4. Primary Logo Design: primaryLogoSvg, concept, symbolism, geometryDetails, aiImagePrompt.
5. Secondary Marks: 3 marks with id, title, description, and svg (viewBox="0 0 160 160").
6. Tone of Voice: 4 guidelines with trait, description, doExample, dontExample.
7. Imagery Style: moodboardKeywords, photographyGuidance, dos, donts.
8. targetAudience string.
${isRebrand ? "9. rebrandStory object: rebrandTitle, rebrandBio, strategicDiagnosis, keyEvolutionPoints." : ""}
`;

        const responseText = await generateText({
          prompt,
          preferred: req.body?.provider,
          taskType: 'brand_strategy',
          powerLevel,
          jsonSchema: {
              type: Type.OBJECT,
              properties: {
                brandName: { type: Type.STRING },
                tagline: { type: Type.STRING },
                industry: { type: Type.STRING },
                mission: { type: Type.STRING },
                vision: { type: Type.STRING },
                positioningStatement: { type: Type.STRING },
                personalityTraits: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      trait: { type: Type.STRING },
                      rating: { type: Type.NUMBER },
                      minLabel: { type: Type.STRING },
                      maxLabel: { type: Type.STRING },
                    },
                    required: ["trait", "rating", "minLabel", "maxLabel"],
                  },
                },
                values: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      iconName: { type: Type.STRING },
                    },
                    required: ["title", "description", "iconName"],
                  },
                },
                palette: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      hex: { type: Type.STRING },
                      rgb: { type: Type.STRING },
                      role: { type: Type.STRING },
                      usage: { type: Type.STRING },
                      contrastNote: { type: Type.STRING },
                    },
                    required: ["name", "hex", "rgb", "role", "usage", "contrastNote"],
                  },
                },
                typography: {
                  type: Type.OBJECT,
                  properties: {
                    headingFont: { type: Type.STRING },
                    headingFontCategory: { type: Type.STRING },
                    headingWeights: { type: Type.ARRAY, items: { type: Type.STRING } },
                    bodyFont: { type: Type.STRING },
                    bodyFontCategory: { type: Type.STRING },
                    bodyWeights: { type: Type.ARRAY, items: { type: Type.STRING } },
                    accentFont: { type: Type.STRING },
                    googleFontsUrl: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    cssSnippet: { type: Type.STRING },
                  },
                  required: [
                    "headingFont",
                    "headingFontCategory",
                    "headingWeights",
                    "bodyFont",
                    "bodyFontCategory",
                    "bodyWeights",
                    "googleFontsUrl",
                    "rationale",
                    "cssSnippet",
                  ],
                },
                logo: {
                  type: Type.OBJECT,
                  properties: {
                    primaryLogoSvg: { type: Type.STRING },
                    concept: { type: Type.STRING },
                    symbolism: { type: Type.STRING },
                    geometryDetails: { type: Type.STRING },
                    aiImagePrompt: { type: Type.STRING },
                  },
                  required: [
                    "primaryLogoSvg",
                    "concept",
                    "symbolism",
                    "geometryDetails",
                    "aiImagePrompt",
                  ],
                },
                secondaryMarks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      svg: { type: Type.STRING },
                    },
                    required: ["id", "title", "description", "svg"],
                  },
                },
                toneOfVoice: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      trait: { type: Type.STRING },
                      description: { type: Type.STRING },
                      doExample: { type: Type.STRING },
                      dontExample: { type: Type.STRING },
                    },
                    required: ["trait", "description", "doExample", "dontExample"],
                  },
                },
                imageryStyle: {
                  type: Type.OBJECT,
                  properties: {
                    moodboardKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    photographyGuidance: { type: Type.STRING },
                    dos: { type: Type.ARRAY, items: { type: Type.STRING } },
                    donts: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["moodboardKeywords", "photographyGuidance", "dos", "donts"],
                },
                targetAudience: { type: Type.STRING },
                rebrandStory: {
                  type: Type.OBJECT,
                  properties: {
                    rebrandTitle: { type: Type.STRING },
                    rebrandBio: { type: Type.STRING },
                    strategicDiagnosis: { type: Type.STRING },
                    keyEvolutionPoints: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          before: { type: Type.STRING },
                          after: { type: Type.STRING },
                          strategicWhy: { type: Type.STRING },
                        },
                        required: ["title", "before", "after", "strategicWhy"],
                      },
                    },
                  },
                },
              },
              required: [
                "brandName",
                "tagline",
                "industry",
                "mission",
                "vision",
                "positioningStatement",
                "personalityTraits",
                "values",
                "palette",
                "typography",
                "logo",
                "secondaryMarks",
                "toneOfVoice",
                "imageryStyle",
                "targetAudience",
              ],
            },
        });

        if (responseText) {
          const brandData = JSON.parse(responseText);
          brandData.id = "brand-" + Date.now();
          brandData.createdAt = new Date().toISOString();

          // Stash context-aware fields and AI Director telemetry
          brandData.powerLevel = powerLevel;
          brandData.productsServices = productsServices;
          brandData.geographicMarket = geographicMarket;
          brandData.brandArchetype = brandArchetype || industryDir.logoArchetypes[0];
          brandData.competitiveEnvironment = competitiveEnvironment;
          brandData.photographyDirection = industryDir.photographyDirection;
          brandData.directorMetadata = {
            model: decision.modelName,
            provider: decision.selectedEngine,
            routingRationale: decision.routingRationale,
            powerLevel,
            latencyMs: Date.now() - startTime,
          };

          if (isRebrand) {
            brandData.rebrandStory = {
              isRebrand: true,
              previousBrandName: brandName,
              previousLogo: currentLogo,
              previousLogoType: currentLogoType,
              previousTypography: currentTypography,
              previousColors: chosenColors,
              rebrandMode: rebrandMode || 'impress_me',
              customPrompt: customRebrandPrompt,
              rebrandTitle: brandData.rebrandStory?.rebrandTitle || `${brandName || "Brand"}: The Next Strategic Era`,
              rebrandBio:
                brandData.rebrandStory?.rebrandBio ||
                `As we enter this next phase, our rebranding reflects a deliberate evolution toward elevated craftsmanship, clarity, and enduring relevance in an evolving market.`,
              strategicDiagnosis:
                brandData.rebrandStory?.strategicDiagnosis ||
                (rebrandMode === 'custom_prompt'
                  ? `Executed custom transformation vision: ${customRebrandPrompt}`
                  : "Diagnostic analysis modernized visual architecture and elevated brand presence for contemporary touchpoints."),
              keyEvolutionPoints:
                brandData.rebrandStory?.keyEvolutionPoints && brandData.rebrandStory.keyEvolutionPoints.length > 0
                  ? brandData.rebrandStory.keyEvolutionPoints
                  : [
                      {
                        title: "Visual Identity & Emblem Modernization",
                        before: currentLogo ? "Legacy mark with visual friction and dated geometry" : "Initial uncalibrated logo concept",
                        after: "Sculpted vector identity with mathematical geometry and negative space harmony",
                        strategicWhy: "Ensures unmistakable recognition across digital touchpoints, app icons, and physical packaging.",
                      },
                      {
                        title: "Typographic Hierarchy & Editorial Authority",
                        before: currentTypography?.headingFont ? `Legacy ${currentTypography.headingFont} font pairing` : "System font lacking distinct brand voice",
                        after: `${brandData.typography?.headingFont || "Modern Sans"} paired with ${brandData.typography?.bodyFont || "Clean Sans"}`,
                        strategicWhy: brandData.typography?.rationale || "Elevates readability and signals premium editorial craft.",
                      },
                      {
                        title: "Color Atmosphere & Accessibility",
                        before: chosenColors?.length ? `Legacy palette (${chosenColors.join(', ')})` : "Uncalibrated primary colors",
                        after: `5-Color balanced palette with 60-30-10 distribution and WCAG AA verification`,
                        strategicWhy: "Eliminates contrast barriers while projecting contemporary sophistication.",
                      },
                    ],
              createdAt: new Date().toISOString(),
            };
          }

          return res.json(brandData);
        }
    } catch (aiError: any) {
      console.warn("[AI Gateway] Live generation failed, engaging procedural synthesis engine:", aiError?.message || aiError);
    }

    // High-quality Procedural fallback synthesis
    console.log("[Synthesis Engine] Generating brand identity deterministically...");
    const synthesized: any = synthesizeProceduralBrand({
      brandName,
      mission,
      industry: resolvedIndustry,
      aesthetic,
      targetAudience,
      isExistingBrandRefresh,
      existingColors: chosenColors,
      existingTagline,
      isRebrand,
      currentLogo,
      currentLogoType,
      currentTypography,
      rebrandMode,
      customRebrandPrompt,
    });
    synthesized.powerLevel = powerLevel;
    synthesized.productsServices = productsServices;
    synthesized.geographicMarket = geographicMarket;
    synthesized.brandArchetype = brandArchetype || synthesized.brandArchetype || industryDir.logoArchetypes[0];
    synthesized.competitiveEnvironment = competitiveEnvironment;
    synthesized.directorMetadata = {
      model: 'GABI Procedural Architecture Engine',
      provider: 'local',
      routingRationale: `Autonomous Failover: Deterministic mathematical vector synthesis with WCAG AA compliance engaged.`,
      powerLevel,
      latencyMs: Date.now() - startTime,
    };
    return res.json(synthesized);
  } catch (error: any) {
    console.error("Critical error in /api/generate-brand:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate brand bible identity.",
    });
  }
});

// 3. Multi-Archetype Logo Variations Generator Endpoint
app.post("/api/generate-logo-variations", apiRateLimiter, async (req, res) => {
  try {
    const { brandName, industry, mission, palette, typography, archetypeFilter, stylePrompt } = req.body;

    if (!brandName) {
      return res.status(400).json({ error: "Brand name is required." });
    }

    const pColor = palette?.[0]?.hex || "#1A1A1A";
    const sColor = palette?.[1]?.hex || "#2563EB";
    const aColor = palette?.[2]?.hex || "#F59E0B";
    const nlColor = palette?.[3]?.hex || "#FAF9F6";
    const ndColor = palette?.[4]?.hex || "#111827";
    const hFont = typography?.headingFont || "Plus Jakarta Sans";
    const bFont = typography?.bodyFont || "Plus Jakarta Sans";
    const industryDir = resolveIndustryDirection(industry || "Technology", mission);

    try {
        const prompt = `
You are a master identity designer & vector craft specialist at Pentagram / Wolff Olins.
Generate 6 distinct, stunning, production-ready logo variations tailored to the brand's industry context:
Brand Name: "${brandName}"
Industry: "${industry || "Modern Innovation"}" (${industryDir.name})
Mission/Philosophy: "${mission || "Leading with craft and vision"}"
Palette: Primary=${pColor}, Secondary=${sColor}, Accent=${aColor}, NeutralLight=${nlColor}, NeutralDark=${ndColor}
Heading Font: ${hFont}
Industry Logo Guidance: ${industryDir.logoGeometryGuidance}
Industry Recommended Archetypes: ${industryDir.logoArchetypes.join(', ')}
${stylePrompt ? `Special Aesthetic Direction: ${stylePrompt}` : ""}

FOR EACH LOGO VARIATION:
Create a complete, clean SVG string (viewBox="0 0 320 100", width="100%", height="100%") matching one of the 6 archetypes:
1. "negative_space" (clever optical illusion cutout)
2. "interlocking_monogram" (woven ribbon curves, golden ratio)
3. "abstract_emblem" (3D kinetic prism / isometric geometric metaphor)
4. "architectural_badge" (concentric rings, radial ticks, certified seal)
5. "geometric_minimalist" (Bauhaus precision strokes)
6. "modern_wordmark" (responsive horizontal mark + letterspaced lockup)

Return strict JSON schema with an array of variations.
`;

        const responseText = await generateText({
          prompt,
          preferred: req.body?.provider,
          taskType: 'logo_vector',
          powerLevel: req.body?.powerLevel || 'pro',
          jsonSchema: {
              type: Type.OBJECT,
              properties: {
                variations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      archetype: { type: Type.STRING },
                      archetypeLabel: { type: Type.STRING },
                      svg: { type: Type.STRING },
                      concept: { type: Type.STRING },
                      symbolism: { type: Type.STRING },
                      geometryDetails: { type: Type.STRING },
                      aiImagePrompt: { type: Type.STRING },
                      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: [
                      "id",
                      "title",
                      "archetype",
                      "archetypeLabel",
                      "svg",
                      "concept",
                      "symbolism",
                      "geometryDetails",
                      "tags",
                    ],
                  },
                },
              },
              required: ["variations"],
            },
        });

        if (responseText) {
          const parsed = JSON.parse(responseText);
          if (parsed.variations && parsed.variations.length > 0) {
            return res.json({ variations: parsed.variations });
          }
        }
    } catch (aiError: any) {
      console.warn("[AI Gateway] Logo variations fallback engaged:", aiError?.message || aiError);
    }

    // Procedural fallback with 6 handcrafted agency archetypes
    const proceduralVariations = generateProceduralLogoVariations({
      brandName,
      industry,
      pColor,
      sColor,
      aColor,
      nlColor,
      ndColor,
      headingFont: hFont,
      bodyFont: bFont,
    });

    return res.json({ variations: proceduralVariations });
  } catch (error: any) {
    console.error("Error in /api/generate-logo-variations:", error);
    return res.status(500).json({ error: error.message || "Failed to generate logo variations." });
  }
});

// Helper for deterministic Chain-of-Thought Logo Prompt Refinement fallback
function refineProceduralLogoPromptCoT(params: {
  brandName: string;
  industry?: string;
  mission?: string;
  aesthetic?: string;
  targetAudience?: string;
  archetype?: string;
  customDirectives?: string;
  complexityLevel?: string;
  palette?: any[];
  typography?: any;
}) {
  const brandName = params.brandName || "Aura";
  const industry = params.industry || "Creative Technology & Design";
  const mission = params.mission || "Empowering creators with precision tools";
  const archetype = (params.archetype || "negative_space") as any;
  const complexityLevel = params.complexityLevel || "intricate_geometric";
  const customDirectives = params.customDirectives || "";
  const pColor = params.palette?.[0]?.hex || "#1A1A1A";
  const sColor = params.palette?.[1]?.hex || "#2563EB";
  const aColor = params.palette?.[2]?.hex || "#F59E0B";
  const nlColor = params.palette?.[3]?.hex || "#FAF9F6";
  const ndColor = params.palette?.[4]?.hex || "#111827";
  const hFont = params.typography?.headingFont || "Plus Jakarta Sans";
  const bFont = params.typography?.bodyFont || "Plus Jakarta Sans";

  const initial = brandName.charAt(0).toUpperCase();

  // Determine metaphor & CoT steps based on archetype and complexity
  let metaphor = "Perpetual Momentum & Intersecting Visions";
  let step1Metaphors = ["Möbius loop duality", "Optical focal convergence", "Architectural cantilever"];
  let step2Rules = ["Golden ratio phi = 1.618 grid", "45-degree isometric projection planes", "Subtractive boolean mask on 80x80 canvas"];
  let svgString = "";
  let vectorPrompt = "";
  let studioPrompt = "";
  let complexityAnalysis = "";

  if (archetype === "negative_space" || archetype === "metaphoric_duality") {
    metaphor = "The Hidden Portal: Optical Subtraction Revealing Forward Velocity";
    step1Metaphors = ["Keyhole aperture symbolising access", "Hidden directional arrowhead in negative space", "Luminous center anchor"];
    step2Rules = ["80x80 bounding container with 20px organic corner curvature", "45-degree triangular cutout boolean subtraction", "6px optical offset for secondary focal ring"];
    
    svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
  <defs>
    <linearGradient id="cotNsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pColor}" />
      <stop offset="50%" stop-color="${sColor}" />
      <stop offset="100%" stop-color="${ndColor}" />
    </linearGradient>
    <linearGradient id="cotAccentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${aColor}" />
      <stop offset="100%" stop-color="#FCD34D" />
    </linearGradient>
    <mask id="cotNegativeCutout">
      <rect width="100" height="100" fill="#ffffff" />
      <path d="M40 22 L66 50 L40 78 L48 50 Z" fill="#000000" />
      <circle cx="50" cy="50" r="7" fill="#000000" />
      <path d="M22 50 L34 50" stroke="#000000" stroke-width="3" stroke-linecap="round" />
    </mask>
    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${sColor}" flood-opacity="0.25" />
    </filter>
  </defs>
  <g transform="translate(14, 10)">
    <!-- Primary Outer Frame with CoT Negative Space Cutout -->
    <rect x="0" y="0" width="80" height="80" rx="20" fill="url(#cotNsGrad)" mask="url(#cotNegativeCutout)" filter="url(#subtleGlow)" />
    <!-- Dynamic Accent Precision Dot -->
    <circle cx="18" cy="18" r="5" fill="url(#cotAccentGrad)" />
    <!-- Geometric Tension Ring -->
    <circle cx="40" cy="40" r="36" fill="none" stroke="${aColor}" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.4" />
  </g>
  <!-- Letterspaced Typography Lockup -->
  <text x="112" y="48" font-family="${hFont}, sans-serif" font-size="27" font-weight="900" fill="${ndColor}" letter-spacing="-0.8">${brandName}</text>
  <line x1="112" y1="56" x2="290" y2="56" stroke="${sColor}" stroke-width="1.5" stroke-linecap="round" opacity="0.3" />
  <text x="112" y="73" font-family="${bFont}, sans-serif" font-size="8.5" font-weight="800" fill="${sColor}" letter-spacing="4" text-transform="uppercase">PRECISION NEGATIVE SPACE MARK</text>
</svg>`;

    vectorPrompt = `Vector logomark for ${brandName}, negative space optical illusion symbol where positive geometric gradient frame carves out a dynamic forward arrow and focal lens, clean mathematical curves, SVG vector craft, 2-color precision lockup.`;
    studioPrompt = `3D architectural physical emblem mockup for ${brandName}, matte noir anodized aluminum cube with precision laser-cut negative space optical arrow glowing with subtle sapphire and amber backlighting, resting on textured silk paper, studio macro photography, 8k resolution.`;
    complexityAnalysis = `Surpasses basic shapes by employing dual-layer boolean subtraction (<mask id="...">), asymmetric corner rounding (rx=20), and dual-axis linear gradients rather than a flat primitive square.`;

  } else if (archetype === "interlocking_monogram") {
    metaphor = "The Möbius Knot: Continuous Infinite Synergy and Golden Ratio Ribbon Topology";
    step1Metaphors = ["Endless ribbon loop symbolizing continuity", "Intertwined initial glyphs representing partnership", "Overlapping depth occlusion"];
    step2Rules = ["Golden ratio Bézier control points (P0=(20,60), P1=(25,15), P2=(65,15), P3=(65,60))", "Offset parallel curve with 6.5px stroke weight", "Z-index topological weave crossing"];

    svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
  <defs>
    <linearGradient id="cotRibbon1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pColor}" />
      <stop offset="60%" stop-color="${sColor}" />
      <stop offset="100%" stop-color="${aColor}" />
    </linearGradient>
    <linearGradient id="cotRibbon2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${aColor}" />
      <stop offset="50%" stop-color="${sColor}" />
      <stop offset="100%" stop-color="${pColor}" />
    </linearGradient>
  </defs>
  <g transform="translate(14, 10)">
    <!-- Base Golden Ratio Compass Circle -->
    <circle cx="40" cy="40" r="38" fill="${nlColor}" stroke="${ndColor}" stroke-width="1" stroke-dasharray="4 3" opacity="0.2" />
    <!-- Overlapping Interlocking Woven Ribbon Paths -->
    <path d="M22 62 C15 32, 44 18, 58 32 C72 46, 44 68, 30 52 C20 40, 48 24, 60 40" fill="none" stroke="url(#cotRibbon1)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M58 18 C65 48, 36 62, 22 48 C8 34, 36 12, 50 28" fill="none" stroke="url(#cotRibbon2)" stroke-width="4" stroke-linecap="round" opacity="0.9" />
    <!-- Center Jewel Coordinate -->
    <circle cx="40" cy="40" r="5" fill="${pColor}" />
    <circle cx="40" cy="40" r="2.5" fill="#FFFFFF" />
  </g>
  <text x="112" y="47" font-family="${hFont}, sans-serif" font-size="26" font-weight="800" fill="${ndColor}">${brandName}</text>
  <text x="112" y="69" font-family="${bFont}, sans-serif" font-size="8.5" font-weight="700" fill="${aColor}" letter-spacing="3.5" text-transform="uppercase">INTERLOCKING MONOGRAM SYSTEM</text>
</svg>`;

    vectorPrompt = `Interlocking ribbon monogram logomark for ${brandName}, continuous woven geometric curves forming an infinite loop with letter '${initial}', golden ratio proportions, multi-stop gradient styling, modern vector mastery.`;
    studioPrompt = `Macro jewelry-grade 3D render of ${brandName} interlocking monogram emblem, cast in brushed champagne gold and polished cobalt enamel, dramatic rim lighting, dark gallery backdrop, 8k render.`;
    complexityAnalysis = `Constructed with multi-point cubic Bézier splines rather than standard circular arcs, creating genuine topological depth where ribbon strokes interweave dynamically.`;

  } else if (archetype === "abstract_emblem" || archetype === "architectural_dimensional") {
    metaphor = "The Kinetic Dimensional Crystal: Multi-plane Isometric Acceleration";
    step1Metaphors = ["Isometric crystalline prism", "Tonal facet light diffraction", "Anchor core of perpetual energy"];
    step2Rules = ["30-degree isometric projection matrix", "3 discrete gradient facet polygons sharing vertices at (40,44)", "Concentric hexagonal boundary lines"];

    svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
  <defs>
    <linearGradient id="cotPrismTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pColor}" />
      <stop offset="100%" stop-color="${sColor}" />
    </linearGradient>
    <linearGradient id="cotPrismLeft" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${sColor}" />
      <stop offset="100%" stop-color="${ndColor}" />
    </linearGradient>
    <linearGradient id="cotPrismRight" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${aColor}" />
      <stop offset="100%" stop-color="${sColor}" />
    </linearGradient>
  </defs>
  <g transform="translate(16, 10)">
    <!-- Isometric Outer Framework -->
    <polygon points="40,4 74,24 74,62 40,82 6,62 6,24" fill="none" stroke="${sColor}" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.35" />
    <!-- 3D Dimensional Facets -->
    <polygon points="40,10 70,27 40,45 10,27" fill="url(#cotPrismTop)" />
    <polygon points="10,27 40,45 40,76 10,58" fill="url(#cotPrismLeft)" opacity="0.95" />
    <polygon points="70,27 40,45 40,76 70,58" fill="url(#cotPrismRight)" opacity="0.9" />
    <!-- High-Tension Nucleus & Light Lines -->
    <line x1="40" y1="10" x2="40" y2="45" stroke="#FFFFFF" stroke-width="1" opacity="0.4" />
    <circle cx="40" cy="45" r="6" fill="#FFFFFF" />
    <circle cx="40" cy="45" r="3" fill="${aColor}" />
  </g>
  <text x="114" y="49" font-family="${hFont}, sans-serif" font-size="26" font-weight="900" fill="${ndColor}" letter-spacing="-0.5">${brandName}</text>
  <text x="114" y="70" font-family="${bFont}, sans-serif" font-size="9" font-weight="800" fill="${sColor}" letter-spacing="3" text-transform="uppercase">DIMENSIONAL KINETIC EMBLEM</text>
</svg>`;

    vectorPrompt = `Isometric dimensional kinetic prism logo for ${brandName}, 3-facet geometric crystal emblem with directional lighting gradients, precision vertices, 30-degree isometric projection, clean vector perfection.`;
    studioPrompt = `Photorealistic 3D rendering of ${brandName} isometric crystal prism logomark, crafted from frosted optical borosilicate glass with iridescent titanium edges, volumetric studio lighting, caustics, octane render.`;
    complexityAnalysis = `Utilizes true 3D isometric polygon vertices and ray-traced lighting facet gradients to convey physical dimensionality while retaining vector precision.`;

  } else {
    // Architectural Badge / Bauhaus
    metaphor = "The Authenticated Sovereign Seal: Guilloché Precision & Verified Hallmark";
    step1Metaphors = ["Concentric precision rings of authority", "Guilloché mathematical micro-perforations", "Central heraldic monogram shield"];
    step2Rules = ["Concentric radiuses at 38px, 32px, 24px", "Equilateral hexagonal core polygon", "12 radial micro-notch ticks along circumference"];

    svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
  <defs>
    <linearGradient id="cotBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pColor}" />
      <stop offset="100%" stop-color="${sColor}" />
    </linearGradient>
  </defs>
  <g transform="translate(14, 10)">
    <!-- Outer Precision Guilloché Dial -->
    <circle cx="40" cy="40" r="38" fill="${nlColor}" stroke="${pColor}" stroke-width="2" />
    <circle cx="40" cy="40" r="32" fill="none" stroke="${sColor}" stroke-width="1.2" stroke-dasharray="3 2" />
    <circle cx="40" cy="40" r="28" fill="none" stroke="${aColor}" stroke-width="0.8" opacity="0.6" />
    <!-- Hexagonal Inner Shield -->
    <polygon points="40,16 60,28 60,52 40,64 20,52 20,28" fill="url(#cotBadgeGrad)" />
    <!-- Central Monogram Initial -->
    <text x="40" y="47" font-family="${hFont}, sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle">${initial}</text>
    <!-- Seal Micro Jewels -->
    <circle cx="40" cy="22" r="2" fill="${aColor}" />
    <circle cx="40" cy="58" r="2" fill="${aColor}" />
  </g>
  <text x="110" y="47" font-family="${hFont}, sans-serif" font-size="25" font-weight="800" fill="${ndColor}">${brandName}</text>
  <text x="110" y="68" font-family="${bFont}, sans-serif" font-size="9" font-weight="700" fill="${pColor}" letter-spacing="3" text-transform="uppercase">AUTHENTICATED HERITAGE SEAL</text>
</svg>`;

    vectorPrompt = `Architectural guilloché seal logo for ${brandName}, concentric precision rings, micro-perforated radial ticks, central hexagonal heraldic monogram '${initial}', luxury certified hallmark standard.`;
    studioPrompt = `Embossed metallic gold foil and blind letterpress seal on heavy 600gsm cotton rag paper for ${brandName}, high-fashion luxury identity stationery mockup, studio chiaroscuro lighting.`;
    complexityAnalysis = `Engineered with multi-layered concentric geometry, radial tick calculations, and an interior polygon shield that delivers high institutional gravitas.`;
  }

  const chainOfThought: any[] = [
    {
      stepNumber: 1,
      stepName: "Semiotic & Metaphor Deconstruction",
      focus: "Deconstructing core identity tensions, phonetic weight, and visual duality.",
      reasoning: `Analyzed brand "${brandName}" in ${industry}. Identified primary tension between stability and dynamic evolution. Extracted 3 deep visual metaphors: ${step1Metaphors.join(", ")}.`,
      extractedMetaphors: step1Metaphors,
    },
    {
      stepNumber: 2,
      stepName: "Spatial Topology & Mathematical Blueprint",
      focus: "Formulating golden ratio grids, coordinate vertices, and rejecting simplistic shapes.",
      reasoning: `Established a 80x80 master coordinate matrix with strict mathematical constraints: ${step2Rules.join("; ")}. Replaced generic geometric primitives with multi-point Bézier curvatures and optical negative-space boolean subtractions.`,
      geometryRules: step2Rules,
    },
    {
      stepNumber: 3,
      stepName: "Vector Craft & Path Synthesizer",
      focus: "Synthesizing precise SVG path commands, gradient maps, and typography lockup.",
      reasoning: `Constructed comprehensive SVG with custom <defs>, linear gradient maps with 3-stop interpolation, dynamic masks, and letterspaced horizontal typography aligned to the optical center.`,
      extractedMetaphors: [`Primary Palette: ${pColor}`, `Secondary: ${sColor}`, `Accent: ${aColor}`],
    },
    {
      stepNumber: 4,
      stepName: "Photometric & 3D Materiality Synthesis",
      focus: "Formulating hyper-refined prompts for physical realization and 3D studio mockups.",
      reasoning: `Engineered a physical lighting prompt detailing surface materiality (anodized aluminum, optical borosilicate glass, metallic foil), studio raytraced caustics, and macro aperture depth.`,
    },
    {
      stepNumber: 5,
      stepName: "Anti-Basic Complexity & Memorability Metric",
      focus: "Benchmarking against generic AI clichés and verifying agency-grade recall.",
      reasoning: complexityAnalysis,
    },
  ];

  return {
    brandName,
    archetype,
    conceptualMetaphor: metaphor,
    chainOfThought,
    refinedVectorPrompt: vectorPrompt,
    refinedStudioPrompt: studioPrompt,
    svgPathBlueprint: `M22 62 C15 32, 44 18, 58 32 C72 46, 44 68, 30 52 | ViewBox: 0 0 320 100`,
    visualComplexityAnalysis: complexityAnalysis,
    generatedSvg: svgString,
    suggestedArchetypes: [
      { archetype: "negative_space", name: "Negative Space Illusion", rationale: "Delivers the highest optical recall and clever storytelling." },
      { archetype: "interlocking_monogram", name: "Dynamic Monogram", rationale: "Golden-ratio continuous ribbon suitable for luxury and tech." },
      { archetype: "abstract_emblem", name: "Isometric Kinetic Emblem", rationale: "3D multi-facet acceleration ideal for modern scale." },
    ],
  };
}

// 4. Chain-of-Thought Logo Prompt Refinement Engine Endpoint
app.post("/api/refine-logo-prompt", apiRateLimiter, async (req, res) => {
  try {
    const {
      brandName,
      industry,
      mission,
      aesthetic,
      targetAudience,
      archetype,
      customDirectives,
      complexityLevel,
      currentPrompt,
      palette,
      typography,
    } = req.body;

    if (!brandName) {
      return res.status(400).json({ error: "Brand name is required." });
    }

    const pColor = palette?.[0]?.hex || "#1A1A1A";
    const sColor = palette?.[1]?.hex || "#2563EB";
    const aColor = palette?.[2]?.hex || "#F59E0B";
    const nlColor = palette?.[3]?.hex || "#FAF9F6";
    const ndColor = palette?.[4]?.hex || "#111827";
    const hFont = typography?.headingFont || "Plus Jakarta Sans";
    const bFont = typography?.bodyFont || "Plus Jakarta Sans";

    try {
        const prompt = `
You are a legendary Creative Director, Principal Vector Architect, and Brand Semiotician at a top-tier global identity studio (Pentagram, Wolff Olins, Collins).
Your mission is to perform deep CHAIN-OF-THOUGHT (CoT) REASONING to refine a logo prompt and generate a complex, professional-grade vector visual concept that completely transcends generic, basic shapes (no solo circles, squares, or naive clip-art).

INPUT BRAND CONTEXT:
Brand Name: "${brandName}"
Industry: "${industry || "Creative Technology"}"
Mission / Philosophy: "${mission || "Innovating with precision and craft"}"
Aesthetic Vibe: "${aesthetic || "Modern, Clean, High-Contrast"}"
Target Audience: "${targetAudience || "Discerning professionals and global leaders"}"
Selected Archetype: "${archetype || "negative_space"}"
Complexity Directive: "${complexityLevel || "intricate_geometric"}"
${customDirectives ? `User Custom Directives: "${customDirectives}"` : ""}
${currentPrompt ? `Current Prompt to Refine: "${currentPrompt}"` : ""}
Color Palette: Primary=${pColor}, Secondary=${sColor}, Accent=${aColor}, NeutralLight=${nlColor}, NeutralDark=${ndColor}
Typography: Heading=${hFont}, Body=${bFont}

MANDATORY CHAIN-OF-THOUGHT STAGES:
1. Stage 1 (Semiotic & Metaphor Deconstruction): Break down the brand's core tension, emotional resonance, and uncover 3 non-obvious visual metaphors.
2. Stage 2 (Spatial Topology & Mathematical Grid): Design an explicit geometric blueprint (golden ratio curves, isometric 3D projections, optical negative space boolean subtractions, or interwoven ribbon splines). Explicitly ban basic primitive shapes.
3. Stage 3 (Vector Craft & Path Synthesis): Synthesize exact SVG directives with <defs>, multi-stop linear/radial gradients, dynamic masks, smooth cubic Bézier curves (M... C... Q... Z), and responsive letterspaced wordmark lockup (viewBox="0 0 320 100").
4. Stage 4 (Photometric 3D Studio Prompt): Formulate a hyper-detailed studio rendering prompt (materiality, lighting, caustics, macro lens, 8k render).
5. Stage 5 (Anti-Basic Complexity Analysis): Provide an analysis explaining why this concept is agency-grade and mathematically superior to naive basic shapes.

Return strict JSON adhering to the schema.
`;

        const responseText = await generateText({
          prompt,
          preferred: req.body?.provider,
          jsonSchema: {
              type: Type.OBJECT,
              properties: {
                brandName: { type: Type.STRING },
                archetype: { type: Type.STRING },
                conceptualMetaphor: { type: Type.STRING },
                chainOfThought: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.NUMBER },
                      stepName: { type: Type.STRING },
                      focus: { type: Type.STRING },
                      reasoning: { type: Type.STRING },
                      extractedMetaphors: { type: Type.ARRAY, items: { type: Type.STRING } },
                      geometryRules: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["stepNumber", "stepName", "focus", "reasoning"],
                  },
                },
                refinedVectorPrompt: { type: Type.STRING },
                refinedStudioPrompt: { type: Type.STRING },
                svgPathBlueprint: { type: Type.STRING },
                visualComplexityAnalysis: { type: Type.STRING },
                generatedSvg: { type: Type.STRING },
                suggestedArchetypes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      archetype: { type: Type.STRING },
                      name: { type: Type.STRING },
                      rationale: { type: Type.STRING },
                    },
                    required: ["archetype", "name", "rationale"],
                  },
                },
              },
              required: [
                "brandName",
                "archetype",
                "conceptualMetaphor",
                "chainOfThought",
                "refinedVectorPrompt",
                "refinedStudioPrompt",
                "svgPathBlueprint",
                "visualComplexityAnalysis",
                "generatedSvg",
              ],
            },
        });

        if (responseText) {
          const parsed = JSON.parse(responseText);
          return res.json(parsed);
        }
    } catch (aiError: any) {
      console.warn("[AI Gateway] CoT Logo Prompt Refinement notice:", aiError?.message || aiError);
    }

    // Procedural deterministic fallback for CoT Prompt Refinement
    const proceduralCoT = refineProceduralLogoPromptCoT({
      brandName,
      industry,
      mission,
      aesthetic,
      targetAudience,
      archetype,
      customDirectives,
      complexityLevel,
      palette,
      typography,
    });

    return res.json(proceduralCoT);
  } catch (error: any) {
    console.error("Error in /api/refine-logo-prompt:", error);
    return res.status(500).json({ error: error.message || "Failed to refine logo prompt." });
  }
});

// 4. Generate Viral Topic Hooks & Strategic Campaign Angles Endpoint
app.post("/api/generate-viral-topics", apiRateLimiter, async (req, res) => {
  try {
    const { brandName, industry, mission, targetAudience, toneStyle, goal } = req.body;

    if (!brandName) {
      return res.status(400).json({ error: "Brand name is required." });
    }

    try {
        const prompt = `
You are a viral growth strategist and creative director who creates world-class, high-engagement content for top brands on LinkedIn, Instagram, and X.
Generate 6 highly distinct, viral topic angles and hooks tailored specifically for:
Brand Name: "${brandName}"
Industry: "${industry || "Innovation"}"
Core Mission: "${mission || "Empowering leaders with craft"}"
Target Audience: "${targetAudience || "Modern creators and executives"}"
Tone: "${toneStyle || "Authoritative, Insightful, Unapologetic"}"
Campaign Goal: "${goal || "High engagement, brand authority, and community shares"}"

Generate structured JSON matching the schema for 6 diverse hook angles:
1. "contrarian" (challenges common industry myths)
2. "curiosity" (surprising insight or behind-the-scenes metric)
3. "storytelling" (the hero's journey / founding conviction)
4. "framework" (actionable step-by-step blueprint)
5. "future_trend" (provocative 2027+ prediction)
6. "data_insight" (counter-intuitive data point or realization)
`;

        const responseText = await generateText({
          prompt,
          preferred: req.body?.provider,
          jsonSchema: {
              type: Type.OBJECT,
              properties: {
                hooks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      headline: { type: Type.STRING },
                      hookAngle: { type: Type.STRING },
                      hookAngleLabel: { type: Type.STRING },
                      pitch: { type: Type.STRING },
                      suggestedFormat: { type: Type.STRING },
                      engagementPrediction: { type: Type.STRING },
                      targetEmotion: { type: Type.STRING },
                      sampleOutline: { type: Type.ARRAY, items: { type: Type.STRING } },
                      suggestedHashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: [
                      "id",
                      "headline",
                      "hookAngle",
                      "hookAngleLabel",
                      "pitch",
                      "suggestedFormat",
                      "engagementPrediction",
                      "targetEmotion",
                      "sampleOutline",
                      "suggestedHashtags",
                    ],
                  },
                },
              },
              required: ["hooks"],
            },
        });

        if (responseText) {
          const parsed = JSON.parse(responseText);
          if (parsed.hooks && parsed.hooks.length > 0) {
            return res.json({ hooks: parsed.hooks });
          }
        }
    } catch (aiError: any) {
      console.warn("[AI Gateway] Viral topic generator notice:", aiError?.message || aiError);
    }

    // Procedural viral topics fallback
    const fallbackHooks = [
      {
        id: "hook-1",
        headline: `Why 90% of ${industry || "Industry"} Brands Are Solving the Wrong Problem in 2026`,
        hookAngle: "contrarian",
        hookAngleLabel: "The Contrarian Angle",
        pitch: "Dissects standard market assumptions and positions your brand's philosophy as the intelligent paradigm shift.",
        suggestedFormat: "carousel",
        engagementPrediction: "High Viral Potential",
        targetEmotion: "Intellectual Curiosity & Paradigm Shift",
        sampleOutline: [
          "Slide 1: The uncomfortable truth most companies ignore",
          "Slide 2: Breakdown of the 3 outdated industry habits",
          "Slide 3: Why incremental improvements no longer work",
          "Slide 4: The new framework pioneered by " + brandName,
          "Slide 5: Actionable checklist for creators to adapt today",
        ],
        suggestedHashtags: [brandName.replace(/\s+/g, ""), "BrandStrategy", "FutureOfWork", "Innovation"],
      },
      {
        id: "hook-2",
        headline: `The Unseen Craft Behind ${brandName}: What It Actually Takes to Build Enduring Quality`,
        hookAngle: "storytelling",
        hookAngleLabel: "Founding Conviction Story",
        pitch: "An authentic, deep-dive narrative revealing the trade secrets, obsessive iterations, and craftsmanship behind your work.",
        suggestedFormat: "manifesto",
        engagementPrediction: "Deep Authority & Trust",
        targetEmotion: "Respect & Authentic Connection",
        sampleOutline: [
          "Hook: What we threw in the trash before launching",
          "Story: The 14 iterations that failed our standards",
          "Philosophy: Why speed without intention is a trap",
          "Takeaway: The standard we hold ourselves to every day",
        ],
        suggestedHashtags: [brandName.replace(/\s+/g, ""), "Craftsmanship", "BehindTheScenes", "DesignSystem"],
      },
      {
        id: "hook-3",
        headline: `The 5-Step System to Master ${industry || "Design & Growth"} Without the Noise`,
        hookAngle: "framework",
        hookAngleLabel: "Actionable Framework",
        pitch: "A bulletproof, step-by-step roadmap that your audience can screenshot, bookmark, and apply immediately.",
        suggestedFormat: "carousel",
        engagementPrediction: "High Saves & Shares",
        targetEmotion: "Clarity & Empowerment",
        sampleOutline: [
          "Phase 1: Zero-noise audit",
          "Phase 2: Defining the core standard",
          "Phase 3: Relentless execution loop",
          "Phase 4: Feedback distillation",
          "Phase 5: Scalable ecosystem design",
        ],
        suggestedHashtags: [brandName.replace(/\s+/g, ""), "Playbook", "Framework", "ActionableInsights"],
      },
      {
        id: "hook-4",
        headline: `The Shift Nobody Is Talking About: Where ${industry || "Our Market"} is Headed in 2027`,
        hookAngle: "future_trend",
        hookAngleLabel: "Future Trend Forecast",
        pitch: "Positions your brand as the forward-thinking lighthouse predicting macro shifts before they become mainstream.",
        suggestedFormat: "thread",
        engagementPrediction: "High Conversation Starter",
        targetEmotion: "Anticipation & Strategic Urgency",
        sampleOutline: [
          "Trend 1: The death of generic mass-production",
          "Trend 2: The rise of radical aesthetic precision",
          "Trend 3: Why community ownership beats advertising",
          "Conclusion: How to prepare your business right now",
        ],
        suggestedHashtags: [brandName.replace(/\s+/g, ""), "FutureTrends", "IndustryForecast", "StrategicLeadership"],
      },
    ];

    return res.json({ hooks: fallbackHooks });
  } catch (error: any) {
    console.error("Error generating viral topics:", error);
    return res.status(500).json({ error: error.message || "Failed to generate viral topic hooks." });
  }
});

// 5. Strategic Brand Audit & Non-Destructive Modernization Endpoint
app.post("/api/audit-brand", apiRateLimiter, async (req, res) => {
  try {
    const { brandName, industry, currentMission, palette, typography, toneStyle } = req.body;

    if (!brandName) {
      return res.status(400).json({ error: "Brand name is required." });
    }

    try {
        const prompt = `
You are a senior brand equity auditor and Chief Design Officer.
Conduct a thorough, objective, and constructive brand audit for:
Brand Name: "${brandName}"
Industry: "${industry || "Modern Business"}"
Mission/Value Prop: "${currentMission || "Standard business mission"}"
Palette: ${palette?.map((c: any) => `${c.role}: ${c.hex} (${c.name})`).join(", ") || "Standard 5-color palette"}
Typography: Heading: ${typography?.headingFont || "Sans"}, Body: ${typography?.bodyFont || "Sans"}
Tone: ${toneStyle || "Standard Corporate"}

Generate a comprehensive audit that:
1. Highlights what to KEEP and PRESERVE (Brand Equity).
2. Identifies CRITICAL GAPS (e.g. low visual contrast, generic buzzwords, lack of secondary icon adaptability).
3. Gives prioritized, non-destructive modernization recommendations (so the client does not need to start from scratch).
`;

        const responseText = await generateText({
          prompt,
          preferred: req.body?.provider,
          jsonSchema: {
              type: Type.OBJECT,
              properties: {
                overallScore: { type: Type.NUMBER },
                brandMaturityLevel: { type: Type.STRING },
                summary: { type: Type.STRING },
                keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                criticalGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      category: { type: Type.STRING },
                      severity: { type: Type.STRING },
                      finding: { type: Type.STRING },
                      recommendation: { type: Type.STRING },
                      actionableStep: { type: Type.STRING },
                    },
                    required: ["id", "category", "severity", "finding", "recommendation", "actionableStep"],
                  },
                },
                quickFixPivots: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: [
                "overallScore",
                "brandMaturityLevel",
                "summary",
                "keyStrengths",
                "criticalGaps",
                "recommendations",
                "quickFixPivots",
              ],
            },
        });

        if (responseText) {
          const parsed = JSON.parse(responseText);
          return res.json(parsed);
        }
    } catch (aiError: any) {
      console.warn("[AI Gateway] Brand audit notice:", aiError?.message || aiError);
    }

    // Procedural fallback audit
    const fallbackAudit = {
      overallScore: 84,
      brandMaturityLevel: "Scaling",
      summary: `${brandName} displays a solid structural foundation with strong category alignment. With targeted refinements to color contrast ratios and secondary logo flexibility, the identity will achieve world-class agency standing.`,
      keyStrengths: [
        `Strong name recognition and distinct phonetics in the ${industry || "market"} sector.`,
        "Clear directional mission statement with high consumer appeal.",
        "Harmonious base palette with well-defined primary and accent roles.",
      ],
      criticalGaps: [
        "Need responsive micro-marks (16px favicon and app icon) that perform without full wordmark text.",
        "Ensure WCAG AAA contrast between secondary accent buttons and light background canvases.",
        "Elevate editorial tone-of-voice to avoid generic industry buzzwords.",
      ],
      recommendations: [
        {
          id: "rec-1",
          category: "Visual & Logo",
          severity: "High Priority",
          finding: "Primary logo requires responsive sub-variations for social avatars and mobile navbars.",
          recommendation: "Deploy dedicated Negative Space Monogram and Architectural Seal secondary marks.",
          actionableStep: "Use the Logo Studio tab to activate secondary responsive lockups.",
        },
        {
          id: "rec-2",
          category: "Color & Contrast",
          severity: "Enhancement",
          finding: "Accent color performs well on dark backgrounds, but needs careful border handling on pure white.",
          recommendation: "Introduce a 1px subtle dark containment border on interactive accent badges.",
          actionableStep: "Harmonize the 5-color token system with automatic contrast notes.",
        },
        {
          id: "rec-3",
          category: "Voice & Messaging",
          severity: "Enhancement",
          finding: "Messaging occasionally defaults to passive corporate phrasing.",
          recommendation: "Adopt active, sensory verbs with concise value propositions.",
          actionableStep: "Use the Viral Topic Hook Generator to test high-conversion campaign angles.",
        },
      ],
      quickFixPivots: [
        "Upgrade primary logo to a high-recall Negative Space or Dynamic Monogram mark.",
        "Deploy the 60-30-10 palette balance across marketing assets.",
        "Implement consistent Google Font pairing (Headings with deliberate tracking).",
      ],
    };

    return res.json(fallbackAudit);
  } catch (error: any) {
    console.error("Error auditing brand:", error);
    return res.status(500).json({ error: error.message || "Failed to complete brand audit." });
  }
});

// 6. Generate High-Res Logo Image Endpoint with brand-specific context, Imagen 3, and rich procedural 3D studio fallback
app.post("/api/generate-logo-image", imageRateLimiter, async (req, res) => {
  try {
    const { prompt, resolution, brandName, industry, palette, logoSvg, tagline, typography } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Image prompt is required." });
    }

    const validResolution = ["512px", "1K", "2K", "4K"].includes(resolution)
      ? resolution
      : "2K";

    const pColor = palette?.[0]?.hex || "#1A1A1A";
    const sColor = palette?.[1]?.hex || "#2563EB";
    const aColor = palette?.[2]?.hex || "#F59E0B";
    const nlColor = palette?.[3]?.hex || "#F8F9FA";
    const ndColor = palette?.[4]?.hex || "#0F172A";
    const displayBrandName = brandName || "Brand";
    const displayTagline = tagline || "Excellence in Craft";
    const headingFont = typography?.headingFont || "Plus Jakarta Sans";

    // 1. Attempt AI image generation across the provider gateway (OpenAI → Gemini → Higgsfield)
    try {
      const enrichedPrompt = `Photorealistic 3D luxury physical logomark emblem render for brand "${displayBrandName}" (${industry || "Design"}). Primary color ${pColor}, secondary ${sColor}, accent ${aColor}. High-end architectural studio setting, raytraced global illumination, volumetric rim lighting, macro lens depth of field, 8k octane render: ${prompt}`;
      const result = await generateImage({
        prompt: enrichedPrompt,
        aspectRatio: "1:1",
        size: validResolution,
        preferred: req.body?.provider,
      });
      if (result) {
        return res.json({
          imageUrl: result.imageUrl,
          resolution: validResolution,
          engine: result.engine,
          format: result.format || "png",
        });
      }
    } catch (imgErr: any) {
      console.warn("[AI Gateway] Live logo render failed, engaging procedural studio raytracer:", imgErr?.message || imgErr);
    }

    // 2. High-Fidelity Procedural 3D Physical Studio Raytracer Fallback
    const promptLower = prompt.toLowerCase();
    const isTitanium = promptLower.includes("titanium") || promptLower.includes("glass") || promptLower.includes("steel");
    const isNeon = promptLower.includes("neon") || promptLower.includes("cyberpunk") || promptLower.includes("glow");
    const isLinen = promptLower.includes("linen") || promptLower.includes("letterpress") || promptLower.includes("paper") || promptLower.includes("deboss");
    const isCeramic = promptLower.includes("ceramic") || promptLower.includes("terracotta") || promptLower.includes("clay");
    const isChrome = promptLower.includes("chrome") || promptLower.includes("liquid") || promptLower.includes("prismatic");

    // XML safe escaping helper
    const escapeXml = (str: string) =>
      (str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const safeBrandName = escapeXml(displayBrandName);
    const initial = (displayBrandName.charAt(0) || "B").toUpperCase();
    const safeInitial = escapeXml(initial);

    // Extract sanitized inner logo markup if available
    let embeddedMarkMarkup = "";
    if (logoSvg && logoSvg.includes("<svg")) {
      // Clean and sanitize inner SVG content
      const innerContent = logoSvg
        .replace(/<svg[^>]*>/i, "")
        .replace(/<\/svg>/i, "")
        .replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&amp;");
      embeddedMarkMarkup = `<g transform="scale(0.85) translate(-160, -50)">${innerContent}</g>`;
    } else {
      embeddedMarkMarkup = `
        <circle cx="0" cy="0" r="42" fill="#0A0D12" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.3" />
        <text x="0" y="16" font-family="${headingFont}, sans-serif" font-size="48" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">
          ${safeInitial}
        </text>
      `;
    }

    let studioBgGradient = "";
    let materialGradient = "";
    let lightingEffect = "";
    let styleTag = "3D PHOTOREALISTIC STUDIO";

    if (isTitanium) {
      styleTag = "PRECISION BRUSHED TITANIUM &amp; GLASS";
      studioBgGradient = `
        <radialGradient id="titaniumBg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#242B35" />
          <stop offset="50%" stop-color="#13171E" />
          <stop offset="100%" stop-color="#090B0E" />
        </radialGradient>
      `;
      materialGradient = `
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E2E8F0" />
          <stop offset="25%" stop-color="#94A3B8" />
          <stop offset="50%" stop-color="#F8FAFC" />
          <stop offset="75%" stop-color="#64748B" />
          <stop offset="100%" stop-color="#CBD5E1" />
        </linearGradient>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#0284C7" stop-opacity="0.05" />
        </linearGradient>
      `;
    } else if (isNeon) {
      styleTag = "CYBERPUNK NEON NOIR &amp; SLATE";
      studioBgGradient = `
        <radialGradient id="neonBg" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stop-color="#1A1128" />
          <stop offset="60%" stop-color="#0D0714" />
          <stop offset="100%" stop-color="#050208" />
        </radialGradient>
      `;
      materialGradient = `
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8" />
          <stop offset="50%" stop-color="${sColor}" />
          <stop offset="100%" stop-color="#EC4899" />
        </linearGradient>
      `;
      lightingEffect = `
        <circle cx="500" cy="380" r="280" fill="${sColor}" opacity="0.18" filter="url(#coreEmblemGlow)" />
        <circle cx="500" cy="380" r="180" fill="#EC4899" opacity="0.15" filter="url(#coreEmblemGlow)" />
      `;
    } else if (isLinen) {
      styleTag = "BLIND DEBOSSED ARTISANAL LINEN";
      studioBgGradient = `
        <radialGradient id="linenBg" cx="45%" cy="35%" r="80%">
          <stop offset="0%" stop-color="#FAF8F5" />
          <stop offset="50%" stop-color="#F1ECE4" />
          <stop offset="100%" stop-color="#E2DCD0" />
        </radialGradient>
      `;
      materialGradient = `
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C2B7A3" />
          <stop offset="50%" stop-color="#8F8471" />
          <stop offset="100%" stop-color="#5C5343" />
        </linearGradient>
      `;
    } else if (isCeramic) {
      styleTag = "SCULPTURAL TERRACOTTA &amp; CERAMIC";
      studioBgGradient = `
        <radialGradient id="ceramicBg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#2D231E" />
          <stop offset="60%" stop-color="#191310" />
          <stop offset="100%" stop-color="#0B0807" />
        </radialGradient>
      `;
      materialGradient = `
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDBA74" />
          <stop offset="50%" stop-color="#EA580C" />
          <stop offset="100%" stop-color="#9A3412" />
        </linearGradient>
      `;
    } else if (isChrome) {
      styleTag = "PRISMATIC LIQUID CHROME &amp; MIRROR";
      studioBgGradient = `
        <radialGradient id="chromeBg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#1E1B2E" />
          <stop offset="60%" stop-color="#0E0C17" />
          <stop offset="100%" stop-color="#050409" />
        </radialGradient>
      `;
      materialGradient = `
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E0E7FF" />
          <stop offset="25%" stop-color="#818CF8" />
          <stop offset="50%" stop-color="#C084FC" />
          <stop offset="75%" stop-color="#38BDF8" />
          <stop offset="100%" stop-color="#FFFFFF" />
        </linearGradient>
      `;
    } else {
      // Default: 24K Gold / Copper Luxury Chiaroscuro
      styleTag = "24K EMBOSSED GOLD FOIL &amp; OBSIDIAN";
      studioBgGradient = `
        <radialGradient id="studioFloor" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#22252A" />
          <stop offset="60%" stop-color="#14161A" />
          <stop offset="100%" stop-color="#08090B" />
        </radialGradient>
      `;
      materialGradient = `
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFBEB" />
          <stop offset="25%" stop-color="${aColor}" />
          <stop offset="50%" stop-color="#F59E0B" />
          <stop offset="75%" stop-color="#B45309" />
          <stop offset="100%" stop-color="#FEF3C7" />
        </linearGradient>
      `;
    }

    const svgBadge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
      <defs>
        ${studioBgGradient}
        ${materialGradient}
        
        <!-- Overhead Spot Light -->
        <radialGradient id="spotLight" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.14" />
          <stop offset="50%" stop-color="${sColor}" stop-opacity="0.06" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>

        <!-- 3D Pedestal Cylindrical Shading -->
        <linearGradient id="pedestalTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2A2E35" />
          <stop offset="100%" stop-color="#181A1F" />
        </linearGradient>
        <linearGradient id="pedestalFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1F2228" />
          <stop offset="100%" stop-color="#0E0F12" />
        </linearGradient>

        <!-- Ambient Shadow Filter -->
        <filter id="pedestalShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="28" />
          <feOffset dx="0" dy="40" result="offsetblur" />
          <feFlood flood-color="#000000" flood-opacity="0.85" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="coreEmblemGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="20" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Background Canvas -->
      <rect width="1000" height="1000" fill="${isLinen ? "url(#linenBg)" : isNeon ? "url(#neonBg)" : isTitanium ? "url(#titaniumBg)" : isCeramic ? "url(#ceramicBg)" : isChrome ? "url(#chromeBg)" : "url(#studioFloor)"}" />
      <rect width="1000" height="1000" fill="url(#spotLight)" />
      ${lightingEffect}

      <!-- Isometric Perspective Grid Floor -->
      <g opacity="${isLinen ? "0.03" : "0.08"}" stroke="${isLinen ? "#000000" : "#FFFFFF"}" stroke-width="1">
        <line x1="100" y1="900" x2="500" y2="480" />
        <line x1="300" y1="900" x2="500" y2="480" />
        <line x1="700" y1="900" x2="500" y2="480" />
        <line x1="900" y1="900" x2="500" y2="480" />
        <ellipse cx="500" cy="620" rx="360" ry="120" fill="none" />
        <ellipse cx="500" cy="620" rx="460" ry="150" fill="none" />
      </g>

      <!-- 3D Pedestal Base -->
      <g filter="url(#pedestalShadow)" transform="translate(0, 100)">
        <!-- Front side of pedestal -->
        <path d="M 220 520 C 220 590, 780 590, 780 520 L 780 570 C 780 640, 220 640, 220 570 Z" fill="url(#pedestalFront)" />
        <!-- Top disc of pedestal -->
        <ellipse cx="500" cy="520" rx="280" ry="85" fill="url(#pedestalTop)" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
        <!-- Inner glowing groove ring on pedestal -->
        <ellipse cx="500" cy="520" rx="240" ry="70" fill="none" stroke="${aColor}" stroke-width="2" stroke-dasharray="8 6" opacity="0.45" />
        <!-- Pedestal core glow -->
        <ellipse cx="500" cy="520" rx="140" ry="40" fill="${sColor}" opacity="0.2" />
      </g>

      <!-- Central Floating 3D Dimensional Mark Assembly -->
      <g transform="translate(500, 380)">
        <!-- Drop shadow on pedestal for floating mark -->
        <ellipse cx="0" cy="200" rx="130" ry="35" fill="#000000" opacity="0.65" filter="url(#pedestalShadow)" />

        <!-- 3D Geometric Ring Frame -->
        <circle cx="0" cy="0" r="145" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" stroke-dasharray="6 6" />
        <circle cx="0" cy="0" r="130" fill="none" stroke="url(#metalGrad)" stroke-width="3.5" opacity="0.85" />

        <!-- 3D Dimensional Faceted Emblem Base Plate -->
        <g filter="url(#coreEmblemGlow)">
          <!-- Dynamic 3D Prism / Diamond Silhouette -->
          <polygon points="0,-95 90,-38 90,48 0,100 -90,48 -90,-38" fill="#14171C" stroke="url(#metalGrad)" stroke-width="3.5" />
          
          <!-- Internal 3D Shading Facets -->
          <polygon points="0,-95 90,-38 0,0" fill="${pColor}" opacity="0.85" />
          <polygon points="90,-38 90,48 0,0" fill="${sColor}" opacity="0.9" />
          <polygon points="90,48 0,100 0,0" fill="${aColor}" opacity="0.8" />
          <polygon points="0,100 -90,48 0,0" fill="${ndColor}" opacity="0.95" />
          <polygon points="-90,48 -90,-38 0,0" fill="${sColor}" opacity="0.7" />
          <polygon points="-90,-38 0,-95 0,0" fill="${pColor}" opacity="0.95" />

          <!-- Center Specular Mark Container -->
          <g transform="translate(0, 0)">
            ${embeddedMarkMarkup}
          </g>
        </g>

        <!-- Specular Highlight Flares -->
        <circle cx="0" cy="-95" r="4.5" fill="#FFFFFF" />
        <circle cx="90" cy="-38" r="3.5" fill="#FFFFFF" />
        <circle cx="-90" cy="-38" r="3.5" fill="#FFFFFF" />
      </g>

      <!-- Clean Typographic Studio Titleplate -->
      <g transform="translate(500, 770)">
        <rect x="-250" y="-35" width="500" height="72" rx="4" fill="#111317" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
        <!-- Brand Name & Industry Spec -->
        <text x="0" y="-6" font-family="${headingFont}, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">
          ${safeBrandName.toUpperCase()}
        </text>
        <text x="0" y="18" font-family="sans-serif" font-size="10" font-weight="700" fill="${aColor}" text-anchor="middle" letter-spacing="5">
          ${styleTag}
        </text>
      </g>

      <!-- Technical Studio Coordinates & Quality Stamp -->
      <text x="70" y="940" font-family="monospace" font-size="11" font-weight="600" fill="rgba(255,255,255,0.4)" letter-spacing="3">
        RENDER: RAYTRACED 3D STUDIO // ${validResolution}
      </text>
      <text x="930" y="940" font-family="monospace" font-size="11" font-weight="600" fill="${sColor}" text-anchor="end" letter-spacing="3">
        PALETTE: ${pColor} / ${sColor} / ${aColor}
      </text>
    </svg>`;

    const base64Svg = Buffer.from(svgBadge, "utf-8").toString("base64");
    const fallbackImageUrl = `data:image/svg+xml;base64,${base64Svg}`;
    return res.json({ imageUrl: fallbackImageUrl, resolution: validResolution, engine: "studio_raytracer", format: "svg" });
  } catch (error: any) {
    console.error("Error generating logo image:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate AI logo image.",
    });
  }
});

// 7. Multi-turn AI Brand Strategist Chat Assistant
app.post("/api/chat", apiRateLimiter, async (req, res) => {
  try {
    const { messages, brandContext, model, provider } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const lastUserMsg = messages[messages.length - 1]?.text || "";

    try {
        let systemInstruction = `You are a world-class AI Brand Director & Strategy Consultant. 
You help clients refine their brand identity, tagline, copy, color palettes, visual hierarchy, tone of voice, and brand guidelines.
Be insightful, actionable, elegant, professional, and clear. Never use emojis in your responses.`;

        if (model === "gemini-3.1-pro-preview") {
          systemInstruction += `\n\n[MODE: COMPLEX STRATEGIC CRITIQUE]\nProvide multi-layered creative critiques, analyze market positioning loopholes, and offer advanced visual/verbal upgrades.`;
        } else if (model === "gemini-3.1-flash-lite") {
          systemInstruction += `\n\n[MODE: FAST COPYWRITING]\nProvide ultra-concise, punchy, high-conversion copy ideas and taglines.`;
        }

        if (brandContext) {
          systemInstruction += `\n\nActive Brand Context:
Brand Name: ${brandContext.brandName || "N/A"}
Tagline: ${brandContext.tagline || "N/A"}
Industry: ${brandContext.industry || "N/A"}
Mission: ${brandContext.mission || "N/A"}
Colors: ${brandContext.palette?.map((c: any) => `${c.role}: ${c.hex} (${c.name})`).join(", ")}
Typography: Heading: ${brandContext.typography?.headingFont}, Body: ${brandContext.typography?.bodyFont}`;
        }

        const transcript = messages
          .map((msg: any) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
          .join("\n\n");
        const decision = routeTask('chat_director', {
          powerLevel: model === 'gemini-3.1-flash-lite' ? 'lite' : 'pro',
          userPreferredProvider: provider,
        });
        const responseText = await generateText({
          prompt: `${transcript}\n\nAssistant:`,
          system: systemInstruction,
          preferred: provider || "auto",
          taskType: 'chat_director',
          powerLevel: model === 'gemini-3.1-flash-lite' ? 'lite' : 'pro',
        });
        if (responseText) {
          return res.json({ reply: responseText, directorDecision: decision });
        }
    } catch (chatError: any) {
      console.warn("[AI Gateway] Chat fallback notice:", chatError?.message || chatError);
    }

    // Procedural brand director response fallback
    const brandName = brandContext?.brandName || "your brand";
    let proceduralReply = `Here is a strategic creative recommendation for ${brandName}:\n\n` +
      `1. **Messaging Alignment**: Ensure your value proposition highlights key differentiators rather than generic market claims.\n` +
      `2. **Visual Rhythm**: Maintain generous negative space around your primary logomark to ensure high visual hierarchy.\n` +
      `3. **Color Balance**: Keep your 60-30-10 rule active (60% Neutral canvas, 30% Primary structural tone, 10% Accent pop for CTAs).\n\n` +
      `How would you like to refine your copy or design assets next?`;

    if (lastUserMsg.toLowerCase().includes("tagline")) {
      proceduralReply = `Here are 3 refined tagline variations crafted for ${brandName}:\n\n` +
        `• "Clarity in Motion." (Minimalist & Punchy)\n` +
        `• "Engineered for Tomorrow." (Forward-Thinking Authority)\n` +
        `• "Pure Craft. Uncompromised Vision." (High-End Artisan)`;
    } else if (lastUserMsg.toLowerCase().includes("color") || lastUserMsg.toLowerCase().includes("palette")) {
      proceduralReply = `Your palette is strategically balanced for high contrast accessibility:\n\n` +
        `• **Primary Tone**: Establishes structural gravitas across headings.\n` +
        `• **Accent Tone**: Reserved strictly for high-conversion buttons and badge highlights.\n` +
        `• **Canvas Neutral**: Off-white tone preventing digital eye fatigue.`;
    }

    return res.json({ reply: proceduralReply });
  } catch (error: any) {
    console.error("Error in chat endpoint:", error);
    return res.status(500).json({ error: error.message || "Failed to complete chat response." });
  }
});

// 8. Generate AI Social Media Post Template Content (Instagram, LinkedIn, TikTok, WhatsApp)
app.post("/api/generate-social-post", apiRateLimiter, async (req, res) => {
  try {
    const { brand, postType, platform, topicPrompt } = req.body;

    if (!brand || !brand.brandName) {
      return res.status(400).json({ error: "Brand Bible context is required." });
    }

    const selectedType = postType || "thought_leadership";
    const selectedPlatform = platform || "instagram_square";

    try {
        const prompt = `
You are an expert Social Media Creative Director and Video Strategist specializing in high-conversion, aesthetically elevated social media campaigns for premium brands on Instagram, LinkedIn, TikTok, and WhatsApp.

Brand Name: ${brand.brandName}
Industry: ${brand.industry}
Tagline: ${brand.tagline}
Mission: ${brand.mission}
Platform Target: ${selectedPlatform} (Options: instagram_square, instagram_story, linkedin_feed, linkedin_carousel, tiktok_video, whatsapp_status, whatsapp_broadcast)
Post Archetype: ${selectedType}
Topic Focus: ${topicPrompt || "Core brand vision and impact"}

CRITICAL RULE: DO NOT USE ANY EMOJIS IN ANY PART OF YOUR OUTPUT. Write clean, professional copy without emoji icons.

Generate structured JSON matching the schema:
1. headline (4-8 words)
2. subheadline (6-12 words)
3. bodyCopy (1-3 crisp sentences)
4. badgeLabel (e.g. "Brand Manifesto", "Perspective", "Product Drop")
5. quoteAuthor (optional)
6. quoteRole (optional)
7. metricNumber (optional)
8. metricLabel (optional)
9. callToAction (short button text)
10. hashtags (array of 4-6 strings without #)
11. fullCaption (complete ready-to-post caption with line breaks, zero emojis)
12. aiImagePrompt (descriptive visual prompt)
13. recommendedLayout ("editorial_minimal" | "bold_hero" | "split_visual" | "metrics_card" | "framed_quote" | "badge_stamp")
14. recommendedTheme ("brand_dark" | "brand_light" | "vibrant_accent" | "contrast_primary" | "minimal_editorial")
15. videoHookScript (for TikTok / Video: opening 3-second hook voiceover or text overlay)
16. videoScenes (array of 3 objects with step, title, action, narration, duration)
17. viralAudioSuggestion (audio track archetype or sound genre)
18. whatsappMessageTemplate (clean, markdown-formatted message with bolding and call to action for WhatsApp Broadcast)
`;

        const responseText = await generateText({
          prompt,
          preferred: req.body?.provider,
          jsonSchema: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                subheadline: { type: Type.STRING },
                bodyCopy: { type: Type.STRING },
                badgeLabel: { type: Type.STRING },
                quoteAuthor: { type: Type.STRING },
                quoteRole: { type: Type.STRING },
                metricNumber: { type: Type.STRING },
                metricLabel: { type: Type.STRING },
                callToAction: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                fullCaption: { type: Type.STRING },
                aiImagePrompt: { type: Type.STRING },
                recommendedLayout: { type: Type.STRING },
                recommendedTheme: { type: Type.STRING },
                videoHookScript: { type: Type.STRING },
                viralAudioSuggestion: { type: Type.STRING },
                whatsappMessageTemplate: { type: Type.STRING },
                videoScenes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      step: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      action: { type: Type.STRING },
                      narration: { type: Type.STRING },
                      duration: { type: Type.STRING },
                    },
                    required: ["step", "title", "action", "narration", "duration"],
                  },
                },
              },
              required: [
                "headline",
                "bodyCopy",
                "badgeLabel",
                "callToAction",
                "hashtags",
                "fullCaption",
                "aiImagePrompt",
                "recommendedLayout",
                "recommendedTheme",
              ],
            },
        });

        if (responseText) {
          const postData = JSON.parse(responseText);
          postData.id = "post-" + Date.now();
          postData.platform = selectedPlatform;
          postData.postType = selectedType;
          postData.layout = postData.recommendedLayout || "editorial_minimal";
          postData.theme = postData.recommendedTheme || "brand_dark";
          return res.json(postData);
        }
    } catch (aiError: any) {
      console.warn("[AI Gateway] Social post generation notice:", aiError?.message || aiError);
    }

    // Procedural social post fallback with TikTok and WhatsApp awareness
    const cleanBrandName = brand.brandName.replace(/\s+/g, "");
    const cleanIndustry = (brand.industry || "Design").replace(/\s+/g, "");

    const isTikTok = selectedPlatform === "tiktok_video";
    const isWhatsApp = selectedPlatform === "whatsapp_status" || selectedPlatform === "whatsapp_broadcast";

    const postData = {
      id: "post-" + Date.now(),
      platform: selectedPlatform,
      postType: selectedType,
      layout: "editorial_minimal",
      theme: "brand_dark",
      badgeLabel: isTikTok ? "TikTok Video Concept" : isWhatsApp ? "WhatsApp Broadcast" : "Brand Perspective",
      headline: `The New Standard in ${brand.industry || "Design"}`,
      subheadline: `How ${brand.brandName} is redefining category conventions.`,
      bodyCopy: brand.positioningStatement || `We believe in relentless craftsmanship, intentional simplicity, and creating enduring value for our community.`,
      callToAction: isWhatsApp ? "Reply to Learn More" : "Read The Full Story",
      quoteAuthor: "Creative Leadership",
      quoteRole: `${brand.brandName} Studio`,
      metricNumber: "100%",
      metricLabel: "Dedicated Craftsmanship",
      hashtags: [cleanBrandName, cleanIndustry, "BrandDesign", "Innovation", "Typography", "ModernIdentity"],
      fullCaption: `Exploring the philosophy behind ${brand.brandName}.\n\n` +
        `"${brand.mission}"\n\n` +
        `In an era of fleeting trends, we anchor our vision in timeless precision and thoughtful execution.\n\n` +
        `Swipe or tap to explore our core values and design system.\n\n` +
        `#${cleanBrandName} #${cleanIndustry} #BrandDesign #CreativeDirection #Innovation`,
      aiImagePrompt: `Studio aesthetic background for ${brand.brandName}, architectural lighting, minimalist shadows, ${brand.palette?.[0]?.name || "slate"} tones`,
      videoHookScript: `Stop settling for generic solutions in ${brand.industry || "your daily workflow"}. Here is why ${brand.brandName} does things differently.`,
      viralAudioSuggestion: "Deep atmospheric lo-fi beats with ambient vinyl texture (120 BPM)",
      videoScenes: [
        {
          step: 1,
          title: "The Hook (0-3s)",
          action: `Close-up macro pan of ${brand.brandName} logomark with fast text overlay on screen.`,
          narration: `Most companies in ${brand.industry} cut corners here. We took the opposite path.`,
          duration: "3s",
        },
        {
          step: 2,
          title: "The Craft & Proof (3-12s)",
          action: "Split-screen or dynamic cut showing the tactile product details and design system precision.",
          narration: `"${brand.mission.slice(0, 120)}..."`,
          duration: "9s",
        },
        {
          step: 3,
          title: "The Takeaway & CTA (12-18s)",
          action: `Full-screen reveal of ${brand.tagline} with link in bio prompt.`,
          narration: `Follow ${brand.brandName} for the next chapter in modern craft.`,
          duration: "6s",
        },
      ],
      whatsappMessageTemplate: `*ANNOUNCEMENT FROM ${brand.brandName.toUpperCase()}*\n\n` +
        `_${brand.tagline}_\n\n` +
        `Hello everyone,\n\n` +
        `We are proud to share our latest update with our inner circle.\n\n` +
        `*Core Vision:* ${brand.mission}\n\n` +
        `• High-precision design & engineering\n` +
        `• Uncompromising materials and attention to detail\n` +
        `• Designed specifically for discerning creators\n\n` +
        `Read our full brand manifesto: https://www.${cleanBrandName.toLowerCase()}.com\n\n` +
        `Reply to this message directly if you have any questions!`,
    };

    return res.json(postData);
  } catch (error: any) {
    console.error("Error generating social post:", error);
    return res.status(500).json({ error: error.message || "Failed to generate social post template." });
  }
});

// 9. Generate AI Visual Artwork for Social Media Post Background with fallback
app.post("/api/generate-social-image", imageRateLimiter, async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Image prompt is required." });
    }

    const validAspectRatio = ["1:1", "9:16", "4:3", "16:9", "3:4"].includes(aspectRatio)
      ? aspectRatio
      : "1:1";

    // Attempt AI image generation across the provider gateway (OpenAI → Gemini → Higgsfield)
    try {
      const result = await generateImage({
        prompt: `High-end editorial aesthetic background photograph for social media template: ${prompt}. Atmospheric, sophisticated lighting, artistic depth of field, minimalist composition.`,
        aspectRatio: validAspectRatio as any,
        preferred: req.body?.provider,
      });
      if (result) {
        return res.json({ imageUrl: result.imageUrl, engine: result.engine });
      }
    } catch (imgErr: any) {
      console.warn("[AI Gateway] Social visual generation failed, engaging SVG fallback:", imgErr?.message || imgErr);
    }

    // High quality aesthetic SVG background graphic fallback
    const isStory = validAspectRatio === "9:16";
    const width = isStory ? 720 : 1080;
    const height = isStory ? 1280 : 1080;

    const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <radialGradient id="meshGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#1E293B" />
          <stop offset="50%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="#020617" />
        </radialGradient>
        <pattern id="dotPattern" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.06)" />
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#meshGrad)" />
      <rect width="${width}" height="${height}" fill="url(#dotPattern)" />
      <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${width * 0.35}" fill="none" stroke="rgba(99,102,241,0.12)" stroke-width="1.5" />
      <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${width * 0.45}" fill="none" stroke="rgba(99,102,241,0.06)" stroke-width="1" />
    </svg>`;

    const base64Bg = Buffer.from(bgSvg).toString("base64");
    const fallbackBgUrl = `data:image/svg+xml;base64,${base64Bg}`;
    return res.json({ imageUrl: fallbackBgUrl });
  } catch (error: any) {
    console.error("Error generating social visual image:", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI social post artwork." });
  }
});

// Dedicated Commercial AI Mockups Studio Generation Endpoint
app.post("/api/generate-ai-mockup", imageRateLimiter, async (req, res) => {
  try {
    const {
      prompt,
      brandName = "Brand",
      industry = "Design",
      mockupType = "product",
      environment = "minimalist studio",
      lens = "50mm prime",
      lighting = "directional studio light",
      materials = "matte tactile textures",
      colorGrade = "commercial clean",
      palette = [],
      aspectRatio = "4:5",
      provider = "auto",
    } = req.body;

    const validAspectRatio = ["1:1", "4:5", "16:9", "9:16", "3:4"].includes(aspectRatio)
      ? aspectRatio
      : "4:5";

    const paletteList = Array.isArray(palette)
      ? palette.slice(0, 4).map((p: any) => (typeof p === "string" ? p : p.hex || "")).filter(Boolean).join(", ")
      : "";

    const fullPrompt = [
      `High-end commercial product photography mockup of a ${mockupType} for the brand "${brandName}" in the ${industry} industry.`,
      `Scene environment: ${environment}. Contextual details: ${prompt || "clean presentation with balanced negative space"}.`,
      `Camera optics: Shot with professional camera using ${lens} lens with crisp central subject focus and natural optical depth of field.`,
      `Lighting physics: ${lighting}.`,
      `Material authenticity: ${materials}, real physical surface finishes and tactile textures.`,
      `Color grading: ${colorGrade}. ${paletteList ? `Adhering to brand palette accents (${paletteList}).` : ""}`,
      `Aesthetic: Prestigious editorial commercial catalog standard, crisp 8k details, zero artificial noise, zero unwanted artifacts.`,
    ].join(" ");

    try {
      const result = await generateImage({
        prompt: fullPrompt,
        aspectRatio: validAspectRatio as any,
        preferred: provider !== "auto" ? provider : undefined,
      });

      if (result && result.imageUrl) {
        return res.json({
          imageUrl: result.imageUrl,
          engine: result.engine,
          promptUsed: fullPrompt,
          isFallback: false,
        });
      }
    } catch (imgErr: any) {
      console.warn("[AI Gateway] AI Mockup generation error:", imgErr?.message || imgErr);
    }

    // High fidelity procedural branded vector mockup fallback
    const primaryHex = Array.isArray(palette) && palette[0]?.hex ? palette[0].hex : "#1A1A1A";
    const accentHex = Array.isArray(palette) && palette[1]?.hex ? palette[1].hex : "#D97706";
    const width = 1080;
    const height = validAspectRatio === "9:16" ? 1920 : validAspectRatio === "16:9" ? 608 : 1350;

    const proceduralMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <radialGradient id="mockupLighting" cx="35%" cy="25%" r="80%">
          <stop offset="0%" stop-color="#2D3139" />
          <stop offset="60%" stop-color="#181A20" />
          <stop offset="100%" stop-color="#0E1015" />
        </radialGradient>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.02" />
        </linearGradient>
        <filter id="studioShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="0.6" />
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#mockupLighting)" />
      
      <!-- Studio floor grid subtly visible -->
      <line x1="0" y1="${height * 0.72}" x2="${width}" y2="${height * 0.72}" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
      
      <!-- Main Mockup Plinth / Canvas Object -->
      <g filter="url(#studioShadow)" transform="translate(${width * 0.15}, ${height * 0.18})">
        <rect width="${width * 0.7}" height="${height * 0.58}" rx="16" fill="${primaryHex}" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
        <rect width="${width * 0.7}" height="${height * 0.58}" rx="16" fill="url(#cardGrad)" />
        
        <!-- Embossed Brand Badge -->
        <rect x="48" y="48" width="${width * 0.7 - 96}" height="${height * 0.58 - 96}" rx="8" fill="none" stroke="${accentHex}" stroke-width="1" stroke-dasharray="4 6" opacity="0.4" />
        
        <!-- Brand Monogram Header -->
        <circle cx="${(width * 0.7) / 2}" cy="${(height * 0.58) / 2 - 40}" r="48" fill="none" stroke="${accentHex}" stroke-width="2" />
        <text x="${(width * 0.7) / 2}" y="${(height * 0.58) / 2 - 32}" font-family="sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">${brandName.slice(0, 2).toUpperCase()}</text>
        
        <!-- Brand Wordmark -->
        <text x="${(width * 0.7) / 2}" y="${(height * 0.58) / 2 + 40}" font-family="serif" font-size="34" font-weight="400" fill="#FFFFFF" text-anchor="middle" letter-spacing="8">${brandName.toUpperCase()}</text>
        <text x="${(width * 0.7) / 2}" y="${(height * 0.58) / 2 + 75}" font-family="sans-serif" font-size="12" font-weight="700" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="4">${mockupType.toUpperCase()} SPECIFICATION • ${lens.toUpperCase()}</text>
      </g>
      
      <!-- Lens & Telemetry Label -->
      <text x="${width * 0.15}" y="${height * 0.88}" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.4)" letter-spacing="2">GABI OPTICS ENGINE • ${lens.toUpperCase()} • ${lighting.toUpperCase()}</text>
    </svg>`;

    const base64 = Buffer.from(proceduralMockupSvg).toString("base64");
    return res.json({
      imageUrl: `data:image/svg+xml;base64,${base64}`,
      engine: "procedural-studio",
      isFallback: true,
      promptUsed: fullPrompt,
      message: "Generated using GABI Studio Procedural Engine. Add an AI API key in Settings for photorealistic diffusion rendering.",
    });
  } catch (error: any) {
    console.error("Error generating AI mockup:", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI mockup." });
  }
});

// AI Brand History & Origin Case Study Deep Intelligence Endpoint
// Real archival logo history for a brand (Wikimedia Commons). Used by the
// curated showcase path to attach real images to pre-baked case studies.
app.get("/api/brand-logo-history", apiRateLimiter, async (req, res) => {
  const brand = String(req.query.brand || "").trim();
  if (!brand) {
    return res.status(400).json({ error: "brand query parameter is required." });
  }
  try {
    const history = await getLogoHistory(brand);
    if (!history) {
      return res.json({ brand, currentLogo: null, eras: [] });
    }
    // Optional era labels (pipe-separated, e.g. "1971 - 1980|1998 - 2015|2017 - Present")
    // so the archival files are matched chronologically to each era slot.
    const eras = req.query.eras
      ? String(req.query.eras)
          .split("|")
          .map((era) => ({ era: era.trim() }))
          .filter((e) => e.era.length > 0)
      : [];
    const matched = await matchImagesToEras(eras, history, brand);
    return res.json({
      brand,
      currentLogo: history.currentLogo
        ? {
            title: history.currentLogo.title,
            imageUrl: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(history.currentLogo.title)}?width=400`,
          }
        : null,
      eras: matched,
    });
  } catch (error: any) {
    console.warn("Error in /api/brand-logo-history:", error?.message || error);
    return res.status(502).json({ error: "Archival logo lookup failed." });
  }
});

app.post("/api/brand-case-study", apiRateLimiter, async (req, res) => {
  try {
    const { brandQuery } = req.body;
    if (!brandQuery || typeof brandQuery !== "string" || !brandQuery.trim()) {
      return res.status(400).json({ error: "brandQuery is required." });
    }

    const systemPrompt = `You are a world-class brand strategist, design historian, and identity researcher.
The user is searching for a popular or historic brand to study how they started, how their logo/visual identity evolved over eras, and what concrete lessons an entrepreneur or designer can learn to build their own world-class brand identity.

Generate an exhaustive, highly professional, analytical brand case study for: "${brandQuery.trim()}".

You MUST return a strictly valid JSON object matching this exact schema:
{
  "id": "slug-string",
  "brandName": "Brand Name",
  "tagline": "Famous or historical tagline",
  "foundingYear": 1900,
  "founders": ["Founder 1", "Founder 2"],
  "headquarters": "City, Country",
  "industry": "Industry description",
  "category": "Tech & Software" | "Luxury & Fashion" | "Athletics & Lifestyle" | "Food & Beverage" | "Automotive & Space" | "Media & Entertainment",
  "originStory": "Comprehensive paragraph on how the company started from nothing, the garage/dorm/workshop reality, and initial experiments.",
  "initialStruggle": "The critical friction, near-bankruptcy, or early skepticism they had to overcome.",
  "thePivotalBreakthrough": "The pivotal product, rebrand, or marketing campaign that catapulted them to iconic global status.",
  "coreBrandPillars": [
    { "title": "Pillar Name", "description": "In-depth strategic rationale" },
    { "title": "Pillar Name", "description": "In-depth strategic rationale" },
    { "title": "Pillar Name", "description": "In-depth strategic rationale" }
  ],
  "logoEvolution": [
    {
      "era": "e.g. 1971 - 1980",
      "title": "Era Name / Concept",
      "description": "Why and how this mark was designed, who drew it, and key flaws or strengths.",
      "keyDesignChanges": ["Key change 1", "Key change 2"],
      "imageUrl": ""
    }
  ],
  "colorPaletteHeritage": [
    { "name": "Color Name", "hex": "#HEX", "role": "Dominant (60%)" | "Structural (30%)" | "Accent (10%)", "psychology": "Semiotic rationale" }
  ],
  "typographyEvolution": [
    { "era": "e.g. 1970 - 1990", "fontName": "Font Family", "style": "Style description", "rationale": "Why this typeface was chosen" }
  ],
  "keyMilestones": [
    { "year": "1975", "headline": "Milestone Headline", "summary": "What happened", "takeaway": "What entrepreneurs should learn" }
  ],
  "actionableLessons": [
    {
      "lessonTitle": "Strategic Lesson Title",
      "explanation": "Deep analytical breakdown of how this brand masterminded this advantage.",
      "actionableStepForYourBrand": "Specific, practical instruction for how the user can apply this exact lesson to their new brand right now."
    }
  ],
  "starterPromptInspiration": {
    "recommendedMission": "A high-conviction mission statement inspired by this brand archetype that the user can adopt or adapt for their own startup.",
    "recommendedAesthetic": "One of: Modern & Minimalist | Warm & Organic Artisanal | Futuristic & High-Tech | Heritage & Luxury | Bold & Energetic | Playful & Friendly | Sophisticated & Editorial",
    "recommendedTargetAudience": "The ideal customer persona for this archetype",
    "recommendedIndustry": "Industry name"
  }
}

Ensure high analytical rigor, historical accuracy, deep semiotic insight into their logo evolution, and actionable advice for modern founders. CRITICAL: leave "imageUrl" as an empty string ("") for every era — the server automatically attaches real archival logo images to each era after generation, so never invent or guess image URLs. Each "title" should be a descriptive era title (e.g. "The 1971 Swoosh — $35 sketch"), never just the brand name. Do NOT wrap in markdown backticks. Return raw JSON.`;

    let parsedData = null;

    try {
      const text = await generateText({
        prompt: systemPrompt,
        requireJson: true,
        temperature: 0.3,
      });
      let cleanJson = (text || "").trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.slice(7);
      }
      if (cleanJson.endsWith("```")) {
        cleanJson = cleanJson.slice(0, -3);
      }

      parsedData = JSON.parse(cleanJson.trim());
    } catch (aiErr: any) {
      console.warn("[AI Gateway] Brand case study AI generation notice:", aiErr?.message || aiErr);
    }

    if (parsedData && parsedData.brandName) {
      // Attach real archival logo-history images (Wikimedia Commons) to every era.
      const logoEvolution = await applyLogoHistoryToEras(
        Array.isArray(parsedData.logoEvolution) ? parsedData.logoEvolution : [],
        parsedData.brandName
      );
      return res.json({ ...parsedData, logoEvolution });
    }

    // Procedural Fallback Brand Case Study
    const normalizedName = brandQuery.trim().charAt(0).toUpperCase() + brandQuery.trim().slice(1);
    const slug = brandQuery.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const domain = brandQuery.trim().toLowerCase().replace(/[^a-z0-9]+/g, "") + ".com";
    const fallbackCaseStudy = {
      id: slug,
      brandName: normalizedName,
      tagline: `Pioneering the Future of ${normalizedName}`,
      foundingYear: 1985,
      founders: ["Visionary Co-Founders", "Design Pioneers"],
      headquarters: "Global Creative Hub",
      industry: `${normalizedName} Design & Technology Ecosystem`,
      category: "Tech & Software",
      originStory: `${normalizedName} began as an ambitious experimental workshop driven by a relentless focus on craftsmanship and customer obsession. The founders started in a modest setting, testing early prototypes directly with early adopters to solve acute industry friction.`,
      initialStruggle: `Early in their journey, ${normalizedName} faced intense competitive pressure, capital constraints, and skepticism from entrenched legacy competitors before proving their differentiated value proposition.`,
      thePivotalBreakthrough: `Through a signature product release that harmonized minimalist aesthetics with extraordinary utility, ${normalizedName} redefined industry standards and built an intensely loyal global following.`,
      coreBrandPillars: [
        {
          title: "Obsessive Product Craft",
          description: `Every touchpoint of ${normalizedName} is designed with uncompromising attention to detail and user-centric clarity.`,
        },
        {
          title: "Distinctive Visual Semiotics",
          description: "A signature identity system that commands immediate recognition and elevates brand authority.",
        },
        {
          title: "Authentic Cultural Connection",
          description: "Fostering deep community trust through transparent communication and enduring principles.",
        },
      ],
      logoEvolution: [
        {
          era: "Founding Era (1985 - 1995)",
          title: "The Detailed Emblem",
          description: `The initial mark featured intricate typography and decorative flourishes, reflecting traditional craft values before digital screens required vector simplification.`,
          keyDesignChanges: ["Serif typography lockup", "Decorative emblem framing", "High-contrast monochrome print weight"],
          imageUrl: "",
        },
        {
          era: "Modern Era (1996 - Present)",
          title: "Pure Minimalist Geometry",
          description: `Subtracted all extraneous framing in favor of a timeless, high-contrast geometric vector silhouette optimized for physical and digital touchpoints.`,
          keyDesignChanges: ["Pure geometric balance", "Refined negative space", "Scalable responsive mark"],
          imageUrl: "",
        },
      ],
      colorPaletteHeritage: [
        {
          name: "Signature Dominant",
          hex: "#18181B",
          role: "Dominant (60%)",
          psychology: "Authority, modern sophistication, and premium contrast.",
        },
        {
          name: "Crisp Canvas",
          hex: "#FAFAFA",
          role: "Structural (30%)",
          psychology: "Clarity, breathability, and seamless digital legibility.",
        },
        {
          name: "Dynamic Accent",
          hex: "#F59E0B",
          role: "Accent (10%)",
          psychology: "Optimism, energy, and focal hierarchy.",
        },
      ],
      typographyEvolution: [
        {
          era: "Contemporary Standard",
          fontName: "Plus Jakarta Sans",
          style: "Geometric Sans-Serif",
          rationale: "Engineered for maximum legibility across digital interfaces, print collaterals, and billboard scales.",
        },
      ],
      keyMilestones: [
        {
          year: "1992",
          headline: "First Flagship Innovation Release",
          summary: `Captured mainstream attention and achieved product-market fit by delivering unmatched quality.`,
          takeaway: "Solve one acute user friction with superior craft before expanding product scope.",
        },
        {
          year: "2008",
          headline: "Global Digital Ecosystem Transition",
          summary: `Harmonized international branding across physical packaging, retail, and mobile applications.`,
          takeaway: "Maintain strict design consistency across every customer touchpoint.",
        },
      ],
      actionableLessons: [
        {
          lessonTitle: "Subtract Noise Until Only Essence Remains",
          explanation: `Like all category-defining brands, ${normalizedName} achieved iconic stature by distilling their value proposition and visual identity into an unmistakable core.`,
          actionableStepForYourBrand: `Eliminate secondary design elements and clarify your primary brand promise into a single high-conviction sentence.`,
        },
        {
          lessonTitle: "Ground Aesthetic in Brand Archetype",
          explanation: `Their visual language directly reinforces their core brand promise rather than following transient fleeting trends.`,
          actionableStepForYourBrand: `Select typography and color palettes that mirror your foundational philosophy and target audience expectations.`,
        },
      ],
      starterPromptInspiration: {
        recommendedMission: `Empowering high-performing individuals and teams with world-class, beautifully engineered tools and experiences.`,
        recommendedAesthetic: "Modern & Minimalist",
        recommendedTargetAudience: "Discerning professionals, modern creators, and forward-thinking industry leaders",
        recommendedIndustry: `${normalizedName} & Innovative Services`,
      },
    };

    // Attach real archival logo-history images (Wikimedia Commons) to every era.
    const logoEvolution = await applyLogoHistoryToEras(
      Array.isArray(fallbackCaseStudy.logoEvolution) ? fallbackCaseStudy.logoEvolution : [],
      normalizedName
    );
    return res.json({ ...fallbackCaseStudy, logoEvolution });
  } catch (error: any) {
    console.error("Error in /api/brand-case-study:", error);
    return res.status(500).json({ error: error.message || "Failed to compile brand case study intelligence." });
  }
});

// AI Director Status & Telemetry Endpoint
app.get("/api/ai-director/status", (_req, res) => {
  try {
    const status = getDirectorStatus();
    return res.json(status);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to retrieve director status" });
  }
});

// Global API 404 handler for unmatched /api/* requests (must return JSON, never HTML!)
app.all("/api/*", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

// Vite Middleware & Static Server
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
