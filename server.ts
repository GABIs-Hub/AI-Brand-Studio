import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[Gemini API] GEMINI_API_KEY is not set in environment variables.");
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err) {
    console.error("[Gemini API] Client initialization error:", err);
    return null;
  }
}

// In-memory model cooldown tracker to prevent repeated hammering of quota-exhausted or busy models
const modelCooldowns = new Map<string, number>();

// Helper function to safely query Gemini models with automatic try/catch fallback sequence, circuit breaker, and exponential backoff
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: { contents: any; config?: any },
  models: string[] = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"]
) {
  let lastError: any = null;
  const now = Date.now();

  for (const model of models) {
    const cooldownUntil = modelCooldowns.get(model) || 0;
    if (now < cooldownUntil) {
      const remainingSec = Math.ceil((cooldownUntil - now) / 1000);
      console.log(`[Gemini API] Model ${model} is on circuit-breaker cooldown (${remainingSec}s remaining). Routing to next model.`);
      continue;
    }

    // Attempt generation with up to 1 retry for transient 503 spikes
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[Gemini API] Invoking generation with model: ${model} (attempt ${attempt + 1})`);
        
        const fetchPromise = ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        // 25-second timeout to prevent 5-minute hanging on network stalls
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("ETIMEDOUT: AI request timed out after 25s")), 25000)
        );

        const response: any = await Promise.race([fetchPromise, timeoutPromise]);

        if (response && response.text) {
          console.log(`[Gemini API] Successfully generated content using model: ${model}`);
          return response;
        }
      } catch (error: any) {
        lastError = error;
        const errMsg = error?.message || String(error);

        const isQuotaExhausted =
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("exceeded your current quota") ||
          errMsg.includes("limit: 0");

        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("temporary") ||
          errMsg.includes("busy") ||
          errMsg.includes("overloaded") ||
          errMsg.includes("fetch failed") ||
          errMsg.includes("ECONNRESET") ||
          errMsg.includes("ETIMEDOUT") ||
          errMsg.includes("socket");

        if (isQuotaExhausted) {
          // Model quota reached: set 120s cooldown and immediately switch to next model
          modelCooldowns.set(model, Date.now() + 120000);
          console.log(`[Gemini API] Quota limit reached for ${model}. Cooldown set (120s). Cascading to next model.`);
          break; // break retry loop to try next model in cascade
        }

        if (isTransient) {
          if (attempt === 0) {
            // First transient failure: brief 350ms delay before single retry
            console.log(`[Gemini API] Model ${model} is experiencing temporary high demand (503). Retrying shortly...`);
            await new Promise((resolve) => setTimeout(resolve, 350));
            continue;
          } else {
            // Second transient failure: set short 30s cooldown and cascade to next model
            modelCooldowns.set(model, Date.now() + 30000);
            console.log(`[Gemini API] Model ${model} remains busy. Cooldown set (30s). Cascading to next model.`);
            break;
          }
        }

        // Other non-transient errors: cascade immediately
        console.log(`[Gemini API] Notice for ${model}: ${errMsg.slice(0, 100)}... Cascading.`);
        break;
      }
    }
  }

  throw lastError || new Error("All AI models were temporarily unreachable.");
}

// Procedural Agency Logo Variations Generator (Diverse Archetypes Beyond Basic Shapes)
function generateProceduralLogoVariations(params: {
  brandName: string;
  industry?: string;
  pColor?: string;
  sColor?: string;
  aColor?: string;
  nlColor?: string;
  ndColor?: string;
  headingFont?: string;
  bodyFont?: string;
}) {
  const brandName = params.brandName || "Aura";
  const pColor = params.pColor || "#1A1A1A";
  const sColor = params.sColor || "#2563EB";
  const aColor = params.aColor || "#F59E0B";
  const nlColor = params.nlColor || "#F9F8F6";
  const ndColor = params.ndColor || "#111827";
  const hFont = params.headingFont || "Plus Jakarta Sans";
  const bFont = params.bodyFont || "Plus Jakarta Sans";

  const initial = brandName.charAt(0).toUpperCase();
  const secondLetter = brandName.length > 1 ? brandName.charAt(1).toUpperCase() : "S";

  // 1. Negative Space Archetype: Optical illusion where positive geometry carves an inner arrow/flame
  const negativeSpaceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
  <defs>
    <linearGradient id="nsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pColor}" />
      <stop offset="100%" stop-color="${sColor}" />
    </linearGradient>
    <mask id="nsCutout">
      <rect width="100" height="100" fill="#ffffff" />
      <!-- Negative space dynamic arrow / forward momentum cutout -->
      <polygon points="40,25 65,50 40,75 48,50" fill="#000000" />
      <circle cx="50" cy="50" r="6" fill="#000000" />
    </mask>
  </defs>
  <g transform="translate(15, 12)">
    <rect x="0" y="0" width="76" height="76" rx="18" fill="url(#nsGrad)" mask="url(#nsCutout)" />
    <circle cx="16" cy="16" r="4" fill="${aColor}" />
  </g>
  <text x="110" y="50" font-family="${hFont}, sans-serif" font-size="26" font-weight="800" fill="${ndColor}" letter-spacing="-0.5">${brandName}</text>
  <text x="110" y="70" font-family="${bFont}, sans-serif" font-size="9" font-weight="700" fill="${sColor}" letter-spacing="3.5" text-transform="uppercase">NEGATIVE SPACE IDENTITY</text>
</svg>`;

  // 2. Interlocking Dynamic Monogram Archetype: Overlapping woven typographic ribbon curves
  const interlockingMonogramSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
  <defs>
    <linearGradient id="monoGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${pColor}" />
      <stop offset="100%" stop-color="${sColor}" />
    </linearGradient>
    <linearGradient id="monoGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="${sColor}" />
      <stop offset="100%" stop-color="${aColor}" />
    </linearGradient>
  </defs>
  <g transform="translate(15, 12)">
    <circle cx="38" cy="38" r="36" fill="${nlColor}" stroke="${ndColor}" stroke-width="1.5" stroke-opacity="0.1" />
    <!-- Interlocking Ribbon Loop 1 -->
    <path d="M22 56 C22 28, 42 22, 54 36 C62 46, 38 52, 28 42" fill="none" stroke="url(#monoGrad1)" stroke-width="6.5" stroke-linecap="round" />
    <!-- Interlocking Ribbon Loop 2 -->
    <path d="M54 20 C54 48, 34 54, 22 40 C14 30, 38 24, 48 34" fill="none" stroke="url(#monoGrad2)" stroke-width="4.5" stroke-linecap="round" opacity="0.9" />
    <circle cx="38" cy="38" r="5" fill="${pColor}" />
  </g>
  <text x="110" y="48" font-family="${hFont}, sans-serif" font-size="25" font-weight="700" fill="${ndColor}">${brandName}</text>
  <text x="110" y="68" font-family="${bFont}, sans-serif" font-size="9" font-weight="600" fill="${aColor}" letter-spacing="3" text-transform="uppercase">DYNAMIC MONOGRAM SYSTEM</text>
</svg>`;

  // 3. Conceptual Abstract Emblem Archetype: Multi-axis kinetic isometric geometric vortex
  const abstractEmblemSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
  <defs>
    <linearGradient id="emblemFacet1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pColor}" />
      <stop offset="100%" stop-color="${ndColor}" />
    </linearGradient>
    <linearGradient id="emblemFacet2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${sColor}" />
      <stop offset="100%" stop-color="${pColor}" />
    </linearGradient>
    <linearGradient id="emblemFacet3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${aColor}" />
      <stop offset="100%" stop-color="${sColor}" />
    </linearGradient>
  </defs>
  <g transform="translate(18, 12)">
    <!-- Isometric Kinetic Prism Structure -->
    <polygon points="38,6 70,24 38,42 6,24" fill="url(#emblemFacet1)" />
    <polygon points="6,24 38,42 38,72 6,54" fill="url(#emblemFacet2)" opacity="0.95" />
    <polygon points="70,24 38,42 38,72 70,54" fill="url(#emblemFacet3)" opacity="0.9" />
    <!-- Core luminous nucleus -->
    <circle cx="38" cy="42" r="5" fill="#FFFFFF" />
    <circle cx="38" cy="42" r="2.5" fill="${aColor}" />
  </g>
  <text x="112" y="49" font-family="${hFont}, sans-serif" font-size="25" font-weight="800" fill="${ndColor}" letter-spacing="-0.8">${brandName}</text>
  <text x="112" y="69" font-family="${bFont}, sans-serif" font-size="9" font-weight="700" fill="${sColor}" letter-spacing="3" text-transform="uppercase">ARCHITECTURAL EMBLEM</text>
</svg>`;

  // 4. Architectural Badge & Heritage Seal Archetype: Concentric precision rings, radial ticks, and seal
  const architecturalBadgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
  <g transform="translate(15, 12)">
    <!-- Outer heritage ring -->
    <circle cx="38" cy="38" r="36" fill="${nlColor}" stroke="${pColor}" stroke-width="2.5" />
    <circle cx="38" cy="38" r="30" fill="none" stroke="${sColor}" stroke-width="1.2" stroke-dasharray="3 2" />
    <!-- Inner geometric badge -->
    <polygon points="38,15 57,26 57,49 38,60 19,49 19,26" fill="${pColor}" />
    <text x="38" y="44" font-family="${hFont}, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">${initial}</text>
    <circle cx="38" cy="21" r="2" fill="${aColor}" />
    <circle cx="38" cy="54" r="2" fill="${aColor}" />
  </g>
  <text x="108" y="46" font-family="${hFont}, sans-serif" font-size="24" font-weight="700" fill="${ndColor}">${brandName}</text>
  <text x="108" y="66" font-family="${bFont}, sans-serif" font-size="9" font-weight="700" fill="${pColor}" letter-spacing="3" text-transform="uppercase">AUTHENTICATED HERITAGE SEAL</text>
</svg>`;

  // 5. Geometric Minimalist Archetype: Clean Bauhaus precision with asymmetrical golden-ratio balance
  const geometricMinimalistSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
  <g transform="translate(18, 14)">
    <rect x="0" y="0" width="70" height="70" fill="none" stroke="${ndColor}" stroke-width="1" opacity="0.2" />
    <path d="M12 58 L35 14 L58 58 Z" fill="none" stroke="${pColor}" stroke-width="4.5" stroke-linejoin="round" />
    <circle cx="35" cy="42" r="12" fill="${sColor}" opacity="0.85" />
    <line x1="12" y1="42" x2="58" y2="42" stroke="${nlColor}" stroke-width="2.5" />
    <circle cx="35" cy="14" r="4" fill="${aColor}" />
  </g>
  <text x="110" y="48" font-family="${hFont}, sans-serif" font-size="26" font-weight="800" fill="${ndColor}" letter-spacing="-0.5">${brandName}</text>
  <text x="110" y="68" font-family="${bFont}, sans-serif" font-size="9" font-weight="600" fill="${sColor}" letter-spacing="3.5" text-transform="uppercase">MINIMALIST GEOMETRY</text>
</svg>`;

  // 6. Modern Wordmark + Standalone Responsive Mark
  const modernWordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
  <g transform="translate(16, 20)">
    <rect x="0" y="0" width="58" height="58" rx="14" fill="${pColor}" />
    <path d="M16 42 L29 16 L42 42 M20 34 L38 34" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="44" cy="14" r="5" fill="${aColor}" />
  </g>
  <text x="96" y="52" font-family="${hFont}, sans-serif" font-size="28" font-weight="900" fill="${ndColor}" letter-spacing="-1">${brandName}</text>
  <circle cx="96" cy="66" r="3" fill="${sColor}" />
  <text x="106" y="69" font-family="${bFont}, sans-serif" font-size="8.5" font-weight="700" fill="${sColor}" letter-spacing="4" text-transform="uppercase">GLOBAL VENTURE</text>
</svg>`;

  return [
    {
      id: "var-negative-space",
      title: "Negative Space Illusion Mark",
      archetype: "negative_space",
      archetypeLabel: "Negative Space Mark",
      svg: negativeSpaceSvg,
      concept: "A dual-meaning vector silhouette where the negative space cutout reveals a forward arrow and focal lens, symbolizing visionary direction.",
      symbolism: "The subtraction creates an optical 'aha!' moment that dramatically elevates brand recall and memorability.",
      geometryDetails: "Engineered on a 76x76 master grid with 18px outer corner radii and 45-degree optical cutouts.",
      aiImagePrompt: `3D matte black and glowing titanium negative space emblem logo for ${brandName}, architectural studio lighting, 8k render`,
      tags: ["Clever Cutout", "Optical Illusion", "High Recall", "Modern Vector"],
    },
    {
      id: "var-interlocking-monogram",
      title: "Interlocking Ribbon Monogram",
      archetype: "interlocking_monogram",
      archetypeLabel: "Dynamic Monogram",
      svg: interlockingMonogramSvg,
      concept: "Fluid, woven typographic ribbons intertwining with golden-ratio continuous loops to reflect synergy and unity.",
      symbolism: "The continuous dual loops symbolize unbroken collaboration, perpetual momentum, and interconnected excellence.",
      geometryDetails: "Constructed using dual Bézier offset curves with 6.5px and 4.5px differentiated stroke weights.",
      aiImagePrompt: `Luxe brushed gold and midnight enamel interlocking ribbon monogram for ${brandName}, macro jewelry detail, cinematic lighting`,
      tags: ["Typographic", "Luxury Craft", "Golden Ratio", "Continuous Loop"],
    },
    {
      id: "var-abstract-emblem",
      title: "Kinetic Prism Emblem",
      archetype: "abstract_emblem",
      archetypeLabel: "Abstract Emblem",
      svg: abstractEmblemSvg,
      concept: "An isometric dimensional prism structure with multi-tonal light facets and a central focal core.",
      symbolism: "The three interlocking planes represent foundation, acceleration, and pinnacle execution.",
      geometryDetails: "30-degree isometric projection with 3 distinct gradient facets anchored by a central coordinate.",
      aiImagePrompt: `Futuristic architectural glass and iridescent chrome geometric prism logo for ${brandName}, studio backdrop, octane render`,
      tags: ["Dimensional", "3D Isometric", "Tech Authority", "Prism Facets"],
    },
    {
      id: "var-architectural-badge",
      title: "Precision Heritage Crest",
      archetype: "architectural_badge",
      archetypeLabel: "Architectural Badge",
      svg: architecturalBadgeSvg,
      concept: "A modern evolution of the classic hallmark stamp, marrying circular micro-perforations with a sharp central hexagonal crest.",
      symbolism: "Communicates institutional credibility, certified standard of excellence, and timeless heritage.",
      geometryDetails: "Concentric dual-radius circles (36px and 30px) with equilateral hexagonal crest interior.",
      aiImagePrompt: `Embossed metallic gold foil seal on heavy textured artisanal paper for ${brandName}, high-fashion stationery mockup`,
      tags: ["Heritage Crest", "Packaging Seal", "Micro Details", "Institutional"],
    },
    {
      id: "var-geometric-minimalist",
      title: "Bauhaus Minimalist Mark",
      archetype: "geometric_minimalist",
      archetypeLabel: "Geometric Minimalist",
      svg: geometricMinimalistSvg,
      concept: "Strict Bauhaus geometry combining the triangle of aspiration with the circle of harmony and horizontal baseline.",
      symbolism: "Represents purity of form, mathematical balance, and eliminating all unnecessary noise.",
      geometryDetails: "Constructed on an equilateral triangle with 4.5px stroke weight intersecting an offset circle.",
      aiImagePrompt: `Minimalist matte anodized aluminum geometric badge for ${brandName}, clean stark shadows, gallery aesthetic`,
      tags: ["Bauhaus", "Architectural", "Clean Lines", "Timeless"],
    },
    {
      id: "var-modern-wordmark",
      title: "Wordmark + Responsive Symbol",
      archetype: "modern_wordmark",
      archetypeLabel: "Wordmark & Mark",
      svg: modernWordmarkSvg,
      concept: "A horizontal lockup designed for primary web navigation, mobile apps, and horizontal touchpoints.",
      symbolism: "The custom vector monogram provides an instant 16px favicon footprint while the full wordmark anchors authority.",
      geometryDetails: "Proportional 1:3.2 aspect ratio lockup with 14px container radius and 4px vector stroke.",
      aiImagePrompt: `High-end minimalist tech identity branding sign for ${brandName}, backlit architectural signage on dark concrete`,
      tags: ["Header Lockup", "Responsive", "High Legibility", "Digital First"],
    },
  ];
}

// Procedural Brand Synthesis Engine (Deterministic high-aesthetic generator)
function synthesizeProceduralBrand(req: {
  brandName?: string;
  mission: string;
  industry?: string;
  aesthetic?: string;
  targetAudience?: string;
  isExistingBrandRefresh?: boolean;
  existingColors?: string[];
  existingTagline?: string;
}) {
  const mission = req.mission.trim();
  const aesthetic = (req.aesthetic || "Modern & Minimalist").toLowerCase();
  const industry = req.industry || "Creative Innovation & Technology";
  const audience = req.targetAudience || "Modern creators, forward-thinking professionals, and discerning global audiences";

  // Derive memorable brand name if not provided
  let brandName = req.brandName?.trim();
  if (!brandName) {
    const words = mission.split(/\s+/).filter((w) => w.length > 3);
    const primaryWord = words[0] || "Aura";
    const cleanWord = primaryWord.replace(/[^a-zA-Z]/g, "");
    const capitalized = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
    
    if (aesthetic.includes("luxury") || aesthetic.includes("heritage")) {
      brandName = `${capitalized} & Co.`;
    } else if (aesthetic.includes("tech") || aesthetic.includes("futuristic")) {
      brandName = `${capitalized} Labs`;
    } else if (aesthetic.includes("organic") || aesthetic.includes("artisanal")) {
      brandName = `${capitalized} Botanica`;
    } else {
      brandName = `${capitalized} Studio`;
    }
  }

  // Generate aesthetic-tailored color palettes (or respect existing hexes if supplied)
  let palette: any[];
  let typography: any;

  if (req.existingColors && req.existingColors.length >= 2) {
    const p = req.existingColors[0] || "#1A1A1A";
    const s = req.existingColors[1] || "#2563EB";
    const a = req.existingColors[2] || "#F59E0B";
    palette = [
      { name: "Brand Signature Tone", hex: p, rgb: "30, 41, 59", role: "Primary", usage: "Primary brand mark, signature hero sections, structural accents", contrastNote: "Established Core Brand Color" },
      { name: "Brand Supporting Tone", hex: s, rgb: "37, 99, 235", role: "Secondary", usage: "Secondary buttons, active links, primary highlights", contrastNote: "Established Secondary Color" },
      { name: "Brand Accent Highlight", hex: a, rgb: "245, 158, 11", role: "Accent", usage: "Key CTAs, badge icons, micro-details", contrastNote: "High-contrast focal point" },
      { name: "Pure Canvas Light", hex: "#FAF9F6", rgb: "250, 249, 246", role: "Neutral Light", usage: "App background canvas, editorial cards, clean negative space", contrastNote: "Optimal eye-comfort canvas" },
      { name: "Obsidian Slate", hex: "#111827", rgb: "17, 24, 39", role: "Neutral Dark", usage: "Headings, body copy, deep structural borders", contrastNote: "Passes AAA against Pure Canvas" },
    ];
    typography = {
      headingFont: "Plus Jakarta Sans",
      headingFontCategory: "Sans-Serif",
      headingWeights: ["600", "700", "800"],
      bodyFont: "Plus Jakarta Sans",
      bodyFontCategory: "Sans-Serif",
      bodyWeights: ["400", "500", "600"],
      accentFont: "Space Grotesk",
      googleFontsUrl: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      rationale: "Plus Jakarta Sans preserves established brand recognition while upgrading digital UI clarity across all scale steps.",
      cssSnippet: "font-family: 'Plus Jakarta Sans', sans-serif;",
    };
  } else if (aesthetic.includes("organic") || aesthetic.includes("artisanal")) {
    palette = [
      { name: "Forest Cypress", hex: "#1F4E38", rgb: "31, 78, 56", role: "Primary", usage: "Primary brand mark, signature hero sections, structural accents", contrastNote: "Passes AAA against warm canvas" },
      { name: "Raw Terracotta", hex: "#C86D51", rgb: "200, 109, 81", role: "Secondary", usage: "Secondary buttons, editorial badges, feature highlights", contrastNote: "Passes AA for large text and buttons" },
      { name: "Golden Wheat", hex: "#E9B872", rgb: "233, 184, 114", role: "Accent", usage: "Interactive call-to-action pops, badge icons, micro-details", contrastNote: "Use with dark text or as borders" },
      { name: "Warm Alabaster", hex: "#FAF8F5", rgb: "250, 248, 245", role: "Neutral Light", usage: "App background canvas, editorial cards, clean negative space", contrastNote: "Optimal eye-comfort canvas" },
      { name: "Charcoal Loam", hex: "#18201B", rgb: "24, 32, 27", role: "Neutral Dark", usage: "Headings, body typography, deep structural borders", contrastNote: "Passes AAA against Warm Alabaster" },
    ];
    typography = {
      headingFont: "Fraunces",
      headingFontCategory: "Serif",
      headingWeights: ["600", "700"],
      bodyFont: "Plus Jakarta Sans",
      bodyFontCategory: "Sans-Serif",
      bodyWeights: ["400", "500", "600"],
      accentFont: "Space Mono",
      googleFontsUrl: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap",
      rationale: "Fraunces offers tactile warmth and editorial craftsmanship, paired with Plus Jakarta Sans for crisp, modern legibility across interfaces.",
      cssSnippet: "font-family: 'Fraunces', serif; --font-body: 'Plus Jakarta Sans', sans-serif;",
    };
  } else if (aesthetic.includes("luxury") || aesthetic.includes("heritage")) {
    palette = [
      { name: "Imperial Noir", hex: "#111110", rgb: "17, 17, 16", role: "Primary", usage: "Signature brand identity, luxury cards, premium packaging", contrastNote: "High contrast structural anchor" },
      { name: "Gilded Champagne", hex: "#C5A880", rgb: "197, 168, 128", role: "Secondary", usage: "Subtle borders, refined monograms, premium accents", contrastNote: "Passes AA for accent graphics" },
      { name: "Amber Ochre", hex: "#A37A47", rgb: "163, 122, 71", role: "Accent", usage: "Key CTAs, active highlights, curated badges", contrastNote: "Passes AAA against light backgrounds" },
      { name: "Silk Ecru", hex: "#F7F5F0", rgb: "247, 245, 240", role: "Neutral Light", usage: "Elevated background canvas, document paper tone", contrastNote: "Warm, eye-safe high-end canvas" },
      { name: "Onyx Slate", hex: "#1C1B18", rgb: "28, 27, 24", role: "Neutral Dark", usage: "Primary text, deep framing borders, typography", contrastNote: "Passes AAA contrast" },
    ];
    typography = {
      headingFont: "Playfair Display",
      headingFontCategory: "Serif",
      headingWeights: ["600", "700"],
      bodyFont: "Plus Jakarta Sans",
      bodyFontCategory: "Sans-Serif",
      bodyWeights: ["400", "500", "600"],
      accentFont: "Cinzel",
      googleFontsUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap",
      rationale: "Playfair Display delivers haute-couture elegance and timeless authority, balanced by Plus Jakarta Sans for frictionless readability.",
      cssSnippet: "font-family: 'Playfair Display', serif; --font-body: 'Plus Jakarta Sans', sans-serif;",
    };
  } else if (aesthetic.includes("futuristic") || aesthetic.includes("tech")) {
    palette = [
      { name: "Electric Indigo", hex: "#4F46E5", rgb: "79, 70, 229", role: "Primary", usage: "Core brand logomark, interactive buttons, primary signals", contrastNote: "Passes AAA against light canvas" },
      { name: "Cyan Pulse", hex: "#06B6D4", rgb: "6, 182, 212", role: "Secondary", usage: "Glow highlights, secondary badges, data visualizations", contrastNote: "Passes AA for badges and graphics" },
      { name: "Violet Flare", hex: "#8B5CF6", rgb: "139, 92, 246", role: "Accent", usage: "Feature spotlights, gradient accents, tags", contrastNote: "Vibrant CTA contrast" },
      { name: "Vapor Frost", hex: "#F8FAFC", rgb: "248, 250, 252", role: "Neutral Light", usage: "Modern UI canvas, card backgrounds, negative space", contrastNote: "High-contrast clean tech canvas" },
      { name: "Quantum Obsidian", hex: "#0F172A", rgb: "15, 23, 42", role: "Neutral Dark", usage: "Headings, typography, dark mode foundations", contrastNote: "Passes AAA readability" },
    ];
    typography = {
      headingFont: "Outfit",
      headingFontCategory: "Sans-Serif",
      headingWeights: ["600", "700", "800"],
      bodyFont: "Inter",
      bodyFontCategory: "Sans-Serif",
      bodyWeights: ["400", "500", "600"],
      accentFont: "Space Grotesk",
      googleFontsUrl: "https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&display=swap",
      rationale: "Outfit provides a hyper-modern geometric stance, perfectly grounded by Inter's industry-standard UI ergonomics.",
      cssSnippet: "font-family: 'Outfit', sans-serif; --font-body: 'Inter', sans-serif;",
    };
  } else {
    // Modern & Minimalist (Default)
    palette = [
      { name: "Bauhaus Noir", hex: "#1A1A1A", rgb: "26, 26, 26", role: "Primary", usage: "Signature identity, primary typography, stark contrast elements", contrastNote: "Passes AAA across all light backgrounds" },
      { name: "Cobalt Slate", hex: "#2563EB", rgb: "37, 99, 235", role: "Secondary", usage: "Secondary buttons, active links, primary highlights", contrastNote: "Passes AAA for interactive elements" },
      { name: "Amber Blaze", hex: "#F59E0B", rgb: "245, 158, 11", role: "Accent", usage: "Pill badges, status indicators, accent focal points", contrastNote: "Optimal contrast on dark & light" },
      { name: "Pure Linen", hex: "#F9F8F6", rgb: "249, 248, 246", role: "Neutral Light", usage: "Primary dashboard background, cards, spacious margins", contrastNote: "Soft gallery aesthetic" },
      { name: "Graphite Deep", hex: "#111827", rgb: "17, 24, 39", role: "Neutral Dark", usage: "Main body copy, headings, structural borders", contrastNote: "Passes AAA readability standards" },
    ];
    typography = {
      headingFont: "Plus Jakarta Sans",
      headingFontCategory: "Sans-Serif",
      headingWeights: ["600", "700", "800"],
      bodyFont: "Plus Jakarta Sans",
      bodyFontCategory: "Sans-Serif",
      bodyWeights: ["400", "500", "600"],
      accentFont: "Space Grotesk",
      googleFontsUrl: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      rationale: "Plus Jakarta Sans establishes a cohesive, razor-sharp architectural layout with world-class legibility at all scale steps.",
      cssSnippet: "font-family: 'Plus Jakarta Sans', sans-serif;",
    };
  }

  const pColor = palette[0].hex;
  const sColor = palette[1].hex;
  const aColor = palette[2].hex;
  const nlColor = palette[3].hex;
  const ndColor = palette[4].hex;

  // Generate diverse procedural logo variations
  const variations = generateProceduralLogoVariations({
    brandName,
    industry,
    pColor,
    sColor,
    aColor,
    nlColor,
    ndColor,
    headingFont: typography.headingFont,
    bodyFont: typography.bodyFont,
  });

  const primaryLogoSvg = variations[0].svg;
  const secondaryMarks = [
    {
      id: "mark-1",
      title: variations[1].title,
      description: variations[1].concept,
      svg: variations[1].svg,
    },
    {
      id: "mark-2",
      title: variations[2].title,
      description: variations[2].concept,
      svg: variations[2].svg,
    },
    {
      id: "mark-3",
      title: variations[3].title,
      description: variations[3].concept,
      svg: variations[3].svg,
    },
  ];

  return {
    id: "brand-" + Date.now(),
    brandName,
    tagline: req.existingTagline || `Defining the Future of ${industry.split(/\s+/)[0] || "Innovation"}`,
    industry,
    mission,
    vision: `To lead a global transformation in ${industry.toLowerCase()} by marrying timeless aesthetic craftsmanship with fearless technological execution.`,
    positioningStatement: `${brandName} delivers uncompromising quality and visionary design to ${audience.toLowerCase()}, empowering them with refined solutions that elevate everyday standards.`,
    personalityTraits: [
      { trait: "Innovation", rating: 4.8, minLabel: "Traditional", maxLabel: "Pioneering" },
      { trait: "Aesthetic Precision", rating: 4.9, minLabel: "Pragmatic", maxLabel: "Obsessively Crafted" },
      { trait: "Authority", rating: 4.6, minLabel: "Casual", maxLabel: "Commanding" },
      { trait: "Warmth & Accessibility", rating: 4.2, minLabel: "Exclusive", maxLabel: "Empathetic" },
    ],
    values: [
      { title: "Architectural Precision", description: "Every line, word, and interaction is engineered with mathematical balance and intentional restraint.", iconName: "Layers" },
      { title: "Fearless Innovation", description: "Constantly challenging industry conventions to pioneer meaningful breakthroughs for our community.", iconName: "Zap" },
      { title: "Radical Transparency", description: "Clear communication, honest sourcing, and ethical design principles guiding all product endeavors.", iconName: "Shield" },
      { title: "Timeless Quality", description: "Creating enduring identity assets and products built to inspire for decades rather than fleeting trends.", iconName: "Sparkles" },
    ],
    palette,
    typography,
    logo: {
      primaryLogoSvg,
      concept: variations[0].concept,
      symbolism: variations[0].symbolism,
      geometryDetails: variations[0].geometryDetails,
      aiImagePrompt: variations[0].aiImagePrompt || `3D architectural glass and brushed metal emblem logomark for ${brandName}, studio lighting, clean minimal background, 8k render`,
    },
    secondaryMarks,
    toneOfVoice: [
      {
        trait: "Insightful & Confident",
        description: "Speak with calm expertise and intellectual clarity. Never preach or shout.",
        doExample: "Precision engineering crafted for creators who value clarity above noise.",
        dontExample: "Check out our crazy awesome tool that will blow your mind!!",
      },
      {
        trait: "Empathetic & Direct",
        description: "Address user challenges straight to the point with warm, professional respect.",
        doExample: "Designed to remove friction from your workflow from day one.",
        dontExample: "Our complex paradigm shifts will seamlessly synergize your outputs.",
      },
      {
        trait: "Poetic & Evocative",
        description: "Use tactile, sensory metaphors to describe aesthetics and craftsmanship.",
        doExample: "Form follows feeling. Light meets purpose.",
        dontExample: "We have lots of pretty colors and buttons in our UI.",
      },
      {
        trait: "Decisive & Action-Oriented",
        description: "Inspire forward momentum through clear, confident calls to action.",
        doExample: "Begin your brand exploration.",
        dontExample: "Click here to maybe learn more about what we do.",
      },
    ],
    imageryStyle: {
      moodboardKeywords: ["Minimalist Architecture", "Cinematic Natural Light", "Tactile Textures", "Sculptural Geometry", "High-Contrast Monochrome"],
      photographyGuidance: "Favor authentic natural lighting, gentle directional shadows, and tactile materials. Maintain generous negative space with human subjects captured in unposed, contemplative moments.",
      dos: ["Use natural window light and subtle chiaroscuro", "Feature real tactile textures like linen, ceramic, and matte metal", "Maintain intentional negative space around focal subjects"],
      donts: ["Avoid artificial studio flash and overly saturated HDR filters", "Never use cheesy, staged corporate stock photography", "Avoid busy, cluttered backgrounds with competing visual noise"],
    },
    targetAudience: audience,
    createdAt: new Date().toISOString(),
  };
}

// 1. Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Generate Brand Bible Endpoint (Handles both new ventures and existing brand refreshes / upgrades)
app.post("/api/generate-brand", async (req, res) => {
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
    } = req.body;

    if (!mission || typeof mission !== "string" || mission.trim().length === 0) {
      return res.status(400).json({ error: "Mission statement or current company core is required." });
    }

    const ai = getGeminiClient();

    // If Gemini client is available, attempt AI generation with multi-model fallback
    if (ai) {
      try {
        let refreshInstruction = "Generate a brand identity from scratch.";
        if (isExistingBrandRefresh) {
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
You are a world-class Creative Director and Brand Strategist at an award-winning identity firm.
Your task is to generate a comprehensive, cohesive, professional "Brand Bible" for a brand based on the following input brief:

${refreshInstruction}
Brand Name: ${brandName || "Please invent a memorable, premium, distinctive brand name"}
Industry / Category: ${industry || "Auto-detect from mission"}
Aesthetic Vibe: ${aesthetic || "Modern, Clean, High-Contrast"}
Mission & Purpose: ${mission}
Target Audience: ${targetAudience || "General discerning audience"}
${existingTagline ? `Existing Tagline to refine/preserve: ${existingTagline}` : ""}
${existingColors && existingColors.length > 0 ? `Existing Brand Colors: ${existingColors.join(", ")}` : ""}

REQUIREMENTS:
1. Brand Core: brandName, tagline, industry, mission, vision, positioningStatement, personalityTraits (4 items with trait, rating 1-5, minLabel, maxLabel), values (4 items with title, description, iconName among Lucide icons).
2. 5-Color Hex Palette: Exactly 5 colors (Primary, Secondary, Accent, Neutral Light, Neutral Dark) with name, hex, rgb, role, usage, contrastNote.
3. Typography & Google Fonts: headingFont, headingFontCategory, headingWeights, bodyFont, bodyFontCategory, bodyWeights, googleFontsUrl, rationale, cssSnippet.
4. Primary Logo Design: primaryLogoSvg (MUST BE an agency-quality vector SVG with <defs>, gradients, negative space or interlocking paths, viewBox="0 0 320 100"), concept, symbolism, geometryDetails, aiImagePrompt.
5. Secondary Marks: 3 marks with id, title, description, and svg (viewBox="0 0 160 160").
6. Tone of Voice: 4 guidelines with trait, description, doExample, dontExample.
7. Imagery Style: moodboardKeywords, photographyGuidance, dos, donts.
8. targetAudience string.
`;

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
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
          },
        });

        const responseText = response.text;
        if (responseText) {
          const brandData = JSON.parse(responseText);
          brandData.id = "brand-" + Date.now();
          brandData.createdAt = new Date().toISOString();
          return res.json(brandData);
        }
      } catch (geminiError: any) {
        console.warn("[Gemini API] Live generation failed, engaging procedural synthesis engine:", geminiError.message || geminiError);
      }
    }

    // High-quality Procedural fallback synthesis
    console.log("[Synthesis Engine] Generating brand identity deterministically...");
    const synthesized = synthesizeProceduralBrand({
      brandName,
      mission,
      industry,
      aesthetic,
      targetAudience,
      isExistingBrandRefresh,
      existingColors,
      existingTagline,
    });
    return res.json(synthesized);
  } catch (error: any) {
    console.error("Critical error in /api/generate-brand:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate brand bible identity.",
    });
  }
});

// 3. Multi-Archetype Logo Variations Generator Endpoint
app.post("/api/generate-logo-variations", async (req, res) => {
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

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `
You are a master identity designer & vector craft specialist at Pentagram / Wolff Olins.
Generate 6 distinct, stunning, production-ready logo variations for:
Brand Name: "${brandName}"
Industry: "${industry || "Modern Innovation"}"
Mission/Philosophy: "${mission || "Leading with craft and vision"}"
Palette: Primary=${pColor}, Secondary=${sColor}, Accent=${aColor}, NeutralLight=${nlColor}, NeutralDark=${ndColor}
Heading Font: ${hFont}
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

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
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
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.variations && parsed.variations.length > 0) {
            return res.json({ variations: parsed.variations });
          }
        }
      } catch (geminiLogoErr: any) {
        console.warn("[Gemini API] Logo variations fallback engaged:", geminiLogoErr.message || geminiLogoErr);
      }
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
app.post("/api/refine-logo-prompt", async (req, res) => {
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

    const ai = getGeminiClient();

    if (ai) {
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

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
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
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (geminiCoTErr: any) {
        console.warn("[Gemini API] CoT Logo Prompt Refinement notice:", geminiCoTErr.message || geminiCoTErr);
      }
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
app.post("/api/generate-viral-topics", async (req, res) => {
  try {
    const { brandName, industry, mission, targetAudience, toneStyle, goal } = req.body;

    if (!brandName) {
      return res.status(400).json({ error: "Brand name is required." });
    }

    const ai = getGeminiClient();

    if (ai) {
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

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
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
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.hooks && parsed.hooks.length > 0) {
            return res.json({ hooks: parsed.hooks });
          }
        }
      } catch (topicErr: any) {
        console.warn("[Gemini API] Viral topic generator notice:", topicErr.message || topicErr);
      }
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
app.post("/api/audit-brand", async (req, res) => {
  try {
    const { brandName, industry, currentMission, palette, typography, toneStyle } = req.body;

    if (!brandName) {
      return res.status(400).json({ error: "Brand name is required." });
    }

    const ai = getGeminiClient();

    if (ai) {
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

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
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
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (auditErr: any) {
        console.warn("[Gemini API] Brand audit notice:", auditErr.message || auditErr);
      }
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
app.post("/api/generate-logo-image", async (req, res) => {
  try {
    const { prompt, resolution, brandName, industry, palette, logoSvg, tagline, typography } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Image prompt is required." });
    }

    const ai = getGeminiClient();
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

    // 1. Attempt generation with Gemini Nano Banana Image models if available
    if (ai) {
      const imageModels = ["gemini-3.1-flash-image", "gemini-3.1-flash-lite-image"];
      const now = Date.now();
      for (const model of imageModels) {
        const cooldownUntil = modelCooldowns.get(model) || 0;
        if (now < cooldownUntil) {
          console.log(`[Gemini API] Image model ${model} is on quota cooldown (${Math.ceil((cooldownUntil - now) / 1000)}s remaining), skipping.`);
          continue;
        }

        try {
          console.log(`[Gemini API] Attempting logo image generation with model: ${model}`);
          const enrichedPrompt = `Photorealistic 3D luxury physical logomark emblem render for brand "${displayBrandName}" (${industry || "Design"}). Primary color ${pColor}, secondary ${sColor}, accent ${aColor}. High-end architectural studio setting, raytraced global illumination, volumetric rim lighting, macro lens depth of field, 8k octane render: ${prompt}`;
          
          const config: any = {
            imageConfig: {
              aspectRatio: "1:1",
            },
          };

          // imageSize is supported on gemini-3.1-flash-image
          if (model === "gemini-3.1-flash-image" && ["512px", "1K", "2K", "4K"].includes(validResolution)) {
            config.imageConfig.imageSize = validResolution;
          }

          const response = await ai.models.generateContent({
            model,
            contents: {
              parts: [
                {
                  text: enrichedPrompt,
                },
              ],
            },
            config,
          });

          const candidates = response.candidates;
          if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
            for (const part of candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const mimeType = part.inlineData.mimeType || "image/png";
                const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
                return res.json({ imageUrl, resolution: validResolution, engine: "gemini_ai", format: "png" });
              }
            }
          }
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          const isQuota = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota") || errMsg.includes("limit: 0");
          const isTransient = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("temporary");
          
          if (isQuota) {
            modelCooldowns.set(model, Date.now() + 120000);
            console.log(`[Gemini API] Quota limit for image model ${model}. Cooldown set (120s). Cascading.`);
          } else if (isTransient) {
            modelCooldowns.set(model, Date.now() + 30000);
            console.log(`[Gemini API] Image model ${model} temporarily unavailable. Cooldown set (30s). Cascading.`);
          } else {
            console.log(`[Gemini API] Notice for image model ${model}: ${errMsg.slice(0, 100)}... Cascading to studio raytracer.`);
          }
        }
      }
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
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, brandContext, model } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();
    const lastUserMsg = messages[messages.length - 1]?.text || "";

    if (ai) {
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

        const contents = messages.map((msg: any) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }));

        const targetModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
        const response = await generateContentWithFallback(ai, { contents, config: { systemInstruction } }, targetModels);
        if (response.text) {
          return res.json({ reply: response.text });
        }
      } catch (chatError: any) {
        console.warn("[Gemini API] Chat fallback notice:", chatError.message || chatError);
      }
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
app.post("/api/generate-social-post", async (req, res) => {
  try {
    const { brand, postType, platform, topicPrompt } = req.body;

    if (!brand || !brand.brandName) {
      return res.status(400).json({ error: "Brand Bible context is required." });
    }

    const ai = getGeminiClient();
    const selectedType = postType || "thought_leadership";
    const selectedPlatform = platform || "instagram_square";

    if (ai) {
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

        const response = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
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
          },
        });

        if (response.text) {
          const postData = JSON.parse(response.text);
          postData.id = "post-" + Date.now();
          postData.platform = selectedPlatform;
          postData.postType = selectedType;
          postData.layout = postData.recommendedLayout || "editorial_minimal";
          postData.theme = postData.recommendedTheme || "brand_dark";
          return res.json(postData);
        }
      } catch (socialErr: any) {
        console.warn("[Gemini API] Social post generation notice:", socialErr.message || socialErr);
      }
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
app.post("/api/generate-social-image", async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Image prompt is required." });
    }

    const ai = getGeminiClient();
    const validAspectRatio = ["1:1", "9:16", "4:3", "16:9", "3:4"].includes(aspectRatio)
      ? aspectRatio
      : "1:1";

    if (ai) {
      const imageModels = ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image"];
      const now = Date.now();
      for (const model of imageModels) {
        const cooldownUntil = modelCooldowns.get(model) || 0;
        if (now < cooldownUntil) {
          console.log(`[Gemini API] Social image model ${model} is on quota cooldown (${Math.ceil((cooldownUntil - now) / 1000)}s remaining), skipping.`);
          continue;
        }

        try {
          console.log(`[Gemini API] Attempting social image generation with model: ${model}`);
          const response = await ai.models.generateContent({
            model,
            contents: {
              parts: [
                {
                  text: `High-end editorial aesthetic background photograph for social media template: ${prompt}. Atmospheric, sophisticated lighting, artistic depth of field, minimalist composition.`,
                },
              ],
            },
            config: {
              imageConfig: {
                aspectRatio: validAspectRatio as any,
              },
            },
          });

          const candidates = response.candidates;
          if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
            for (const part of candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const mimeType = part.inlineData.mimeType || "image/png";
                const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
                return res.json({ imageUrl });
              }
            }
          }
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          const isQuota = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota") || errMsg.includes("limit: 0");
          const isTransient = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("temporary");

          if (isQuota) {
            modelCooldowns.set(model, Date.now() + 120000);
            console.log(`[Gemini API] Quota limit for social image model ${model}. Cooldown set (120s). Cascading.`);
          } else if (isTransient) {
            modelCooldowns.set(model, Date.now() + 30000);
            console.log(`[Gemini API] Social image model ${model} temporarily unavailable. Cooldown set (30s). Cascading.`);
          } else {
            console.log(`[Gemini API] Notice for social image model ${model}: ${errMsg.slice(0, 100)}... Cascading.`);
          }
        }
      }
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

// AI Brand History & Origin Case Study Deep Intelligence Endpoint
app.post("/api/brand-case-study", async (req, res) => {
  try {
    const { brandQuery } = req.body;
    if (!brandQuery || typeof brandQuery !== "string" || !brandQuery.trim()) {
      return res.status(400).json({ error: "brandQuery is required." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini AI client unavailable." });
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
      "imageUrl": "https://logo.clearbit.com/branddomain.com"
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

Ensure high analytical rigor, historical accuracy, deep semiotic insight into their logo evolution, and actionable advice for modern founders. For the "imageUrl", ALWAYS replace "branddomain.com" with the brand's actual official website domain (e.g. nike.com, apple.com) so the frontend can load their real logo from the Clearbit API. Do NOT wrap in markdown backticks. Return raw JSON.`;

    let parsedData = null;

    if (ai) {
      try {
        const response = await generateContentWithFallback(ai, {
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        }, ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"]);

        const text = response?.text || "";
        let cleanJson = text.trim();
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.slice(7);
        }
        if (cleanJson.endsWith("```")) {
          cleanJson = cleanJson.slice(0, -3);
        }

        parsedData = JSON.parse(cleanJson.trim());
      } catch (aiErr: any) {
        console.warn("[Gemini API] Brand case study AI generation notice:", aiErr.message || aiErr);
      }
    }

    if (parsedData && parsedData.brandName) {
      return res.json(parsedData);
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
          imageUrl: `https://logo.clearbit.com/${domain}`,
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

    return res.json(fallbackCaseStudy);
  } catch (error: any) {
    console.error("Error in /api/brand-case-study:", error);
    return res.status(500).json({ error: error.message || "Failed to compile brand case study intelligence." });
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
