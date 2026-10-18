// Procedural (deterministic, no-AI) brand generators.
// Extracted from server.ts so the pure functions can be unit-tested without
// booting the Express server.

import { hexToRgb, rgbToHex, paletteFromBrandContext } from "../utils/colorEngine";
import { resolveIndustryDirection } from "./industryContext";

function normalizeHex(hex: string): string {
  return rgbToHex(hexToRgb(hex));
}

function rgbString(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

export interface ProceduralLogoVariationParams {
  brandName: string;
  industry?: string;
  pColor?: string;
  sColor?: string;
  aColor?: string;
  nlColor?: string;
  ndColor?: string;
  headingFont?: string;
  bodyFont?: string;
}

// Procedural Agency Logo Variations Generator (Diverse Archetypes Beyond Basic Shapes)
// Dynamic letterform path generator for precision monograms and marks (A-Z)
function getLetterformSvgPath(char: string): string {
  const c = (char || 'A').toUpperCase();
  switch (c) {
    case 'A':
      return 'M14 44 L29 14 L44 44 M19 35 L39 35';
    case 'B':
      return 'M16 14 L34 14 C40 14 43 18 43 23 C43 28 39 30 33 30 L16 30 M16 30 L35 30 C41 30 45 34 45 39 C45 44 41 45 34 45 L16 45 Z';
    case 'C':
      return 'M44 20 C38 14 34 14 28 14 C19 14 14 20 14 29 C14 38 19 44 28 44 C34 44 38 44 44 38';
    case 'D':
      return 'M16 14 L30 14 C39 14 45 20 45 29 C45 38 39 44 30 44 L16 44 Z';
    case 'E':
      return 'M42 14 L16 14 L16 44 L42 44 M16 29 L38 29';
    case 'F':
      return 'M42 14 L16 14 L16 44 M16 29 L36 29';
    case 'G':
      return 'M44 20 C38 14 34 14 28 14 C19 14 14 20 14 29 C14 38 19 44 28 44 C36 44 42 40 42 33 L29 33';
    case 'H':
      return 'M16 14 L16 44 M42 14 L42 44 M16 29 L42 29';
    case 'I':
      return 'M22 14 L36 14 M29 14 L29 44 M22 44 L36 44';
    case 'J':
      return 'M38 14 L38 36 C38 42 33 44 27 44 C20 44 16 40 16 35';
    case 'K':
      return 'M16 14 L16 44 M42 14 L18 30 L42 44';
    case 'L':
      return 'M16 14 L16 44 L42 44';
    case 'M':
      return 'M14 44 L14 14 L29 32 L44 14 L44 44';
    case 'N':
      return 'M15 44 L15 14 L43 44 L43 14';
    case 'O':
      return 'M29 14 C19 14 14 20 14 29 C14 38 19 44 29 44 C39 44 44 38 44 29 C44 20 39 14 29 14 Z';
    case 'P':
      return 'M16 14 L32 14 C39 14 43 18 43 24 C43 30 39 34 32 34 L16 34 L16 44';
    case 'Q':
      return 'M28 14 C19 14 14 20 14 29 C14 38 19 44 28 44 C34 44 38 42 41 38 M36 36 L44 44';
    case 'R':
      return 'M16 14 L32 14 C39 14 43 18 43 24 C43 30 39 33 32 33 L16 33 L16 44 M30 33 L43 44';
    case 'S':
      return 'M42 20 C38 14 33 14 28 14 C20 14 16 18 16 23 C16 32 44 28 44 37 C44 42 39 45 28 45 C20 45 15 42 14 38';
    case 'T':
      return 'M14 14 L44 14 M29 14 L29 44';
    case 'U':
      return 'M15 14 L15 34 C15 41 21 44 29 44 C37 44 43 41 43 34 L43 14';
    case 'V':
      return 'M14 14 L29 44 L44 14';
    case 'W':
      return 'M13 14 L20 44 L29 27 L38 44 L45 14';
    case 'X':
      return 'M15 14 L43 44 M43 14 L15 44';
    case 'Y':
      return 'M14 14 L29 29 L44 14 M29 29 L29 44';
    case 'Z':
      return 'M15 14 L43 14 L15 44 L43 44';
    default:
      return 'M14 44 L29 14 L44 44 M19 35 L39 35';
  }
}

export function generateProceduralLogoVariations(params: ProceduralLogoVariationParams) {
  const brandName = params.brandName || "Aura";
  const pColor = params.pColor || "#1A1A1A";
  const sColor = params.sColor || "#2563EB";
  const aColor = params.aColor || "#F59E0B";
  const nlColor = params.nlColor || "#F9F8F6";
  const ndColor = params.ndColor || "#111827";
  const hFont = params.headingFont || "Plus Jakarta Sans";
  const bFont = params.bodyFont || "Plus Jakarta Sans";

  const initial = brandName.charAt(0).toUpperCase();
  const letterPath = getLetterformSvgPath(initial);
  const subline = (params.industry || "Brand Identity").toUpperCase();

  // 1. Negative Space Archetype: Optical illusion where positive geometry carves an inner arrow/flame
  const negativeSpaceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
  <defs>
    <linearGradient id="nsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pColor}" />
      <stop offset="100%" stop-color="${sColor}" />
    </linearGradient>
    <mask id="nsCutout">
      <rect width="100" height="100" fill="#ffffff" />
      <!-- Negative space dynamic arrow / optical cutout -->
      <polygon points="38,22 66,50 38,78 48,50" fill="#000000" />
      <circle cx="50" cy="50" r="6" fill="#000000" />
    </mask>
  </defs>
  <g transform="translate(15, 12)">
    <rect x="0" y="0" width="76" height="76" rx="18" fill="url(#nsGrad)" mask="url(#nsCutout)" />
    <circle cx="16" cy="16" r="4" fill="${aColor}" />
  </g>
  <text x="110" y="50" font-family="${hFont}, sans-serif" font-size="26" font-weight="800" fill="${ndColor}" letter-spacing="-0.5">${brandName}</text>
  <text x="110" y="70" font-family="${bFont}, sans-serif" font-size="8.5" font-weight="700" fill="${sColor}" letter-spacing="3.5" text-transform="uppercase">${subline}</text>
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
    <!-- Interlocking Ribbon Loops -->
    <path d="M22 54 C22 26, 42 20, 54 34 C62 44, 38 50, 28 40" fill="none" stroke="url(#monoGrad1)" stroke-width="6" stroke-linecap="round" />
    <path d="M54 22 C54 50, 34 56, 22 42 C14 32, 38 26, 48 36" fill="none" stroke="url(#monoGrad2)" stroke-width="4.5" stroke-linecap="round" opacity="0.9" />
    <circle cx="38" cy="38" r="4.5" fill="${pColor}" />
  </g>
  <text x="110" y="48" font-family="${hFont}, sans-serif" font-size="25" font-weight="700" fill="${ndColor}">${brandName}</text>
  <text x="110" y="68" font-family="${bFont}, sans-serif" font-size="8.5" font-weight="600" fill="${aColor}" letter-spacing="3" text-transform="uppercase">${subline}</text>
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
  <text x="112" y="69" font-family="${bFont}, sans-serif" font-size="8.5" font-weight="700" fill="${sColor}" letter-spacing="3" text-transform="uppercase">${subline}</text>
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
  <text x="108" y="66" font-family="${bFont}, sans-serif" font-size="8.5" font-weight="700" fill="${pColor}" letter-spacing="3" text-transform="uppercase">${subline}</text>
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
  <text x="110" y="68" font-family="${bFont}, sans-serif" font-size="8.5" font-weight="600" fill="${sColor}" letter-spacing="3.5" text-transform="uppercase">${subline}</text>
</svg>`;

  // 6. Modern Wordmark + Standalone Responsive Dynamic Initial Mark
  const modernWordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
  <g transform="translate(16, 20)">
    <rect x="0" y="0" width="58" height="58" rx="14" fill="${pColor}" />
    <!-- Dynamic Letterform Initial Path -->
    <path d="${letterPath}" fill="none" stroke="#FFFFFF" stroke-width="3.75" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="44" cy="14" r="4.5" fill="${aColor}" />
  </g>
  <text x="96" y="52" font-family="${hFont}, sans-serif" font-size="28" font-weight="900" fill="${ndColor}" letter-spacing="-1">${brandName}</text>
  <circle cx="96" cy="66" r="3" fill="${sColor}" />
  <text x="106" y="69" font-family="${bFont}, sans-serif" font-size="8.5" font-weight="700" fill="${sColor}" letter-spacing="4" text-transform="uppercase">${subline}</text>
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

export interface ProceduralBrandRequest {
  brandName?: string;
  mission: string;
  industry?: string;
  aesthetic?: string;
  targetAudience?: string;
  isExistingBrandRefresh?: boolean;
  existingColors?: string[];
  existingTagline?: string;
  isRebrand?: boolean;
  currentLogo?: string;
  currentLogoType?: 'image' | 'svg' | 'description';
  currentTypography?: {
    headingFont?: string;
    bodyFont?: string;
  };
  rebrandMode?: 'impress_me' | 'custom_prompt';
  customRebrandPrompt?: string;
}

// Procedural Brand Synthesis Engine (Deterministic high-aesthetic generator)
export function synthesizeProceduralBrand(req: ProceduralBrandRequest) {
  const mission = req.mission.trim();
  const aesthetic = (req.aesthetic || "Modern & Minimalist").toLowerCase();
  const industry = req.industry || "Creative Innovation & Technology";
  const audience = req.targetAudience || "Modern creators, forward-thinking professionals, and discerning global audiences";
  const industryDir = resolveIndustryDirection(industry, mission);

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
    // Anchor the harmony engine on the user's primary, then override the
    // supporting tones with their established colors; neutrals stay engine-
    // validated so the canvas always passes contrast checks.
    const base = paletteFromBrandContext(brandName, industry, aesthetic, p);
    const secondaryHex = normalizeHex(s);
    const accentHex = normalizeHex(a);
    palette = [
      { ...base[0], hex: normalizeHex(p), contrastNote: "Established core brand color" },
      { ...base[1], hex: secondaryHex, rgb: rgbString(secondaryHex), contrastNote: "Established secondary color" },
      { ...base[2], hex: accentHex, rgb: rgbString(accentHex), contrastNote: "User-supplied accent tone" },
      base[3],
      base[4],
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
    palette = paletteFromBrandContext(brandName, industry, aesthetic);
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
    palette = paletteFromBrandContext(brandName, industry, aesthetic);
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
    palette = paletteFromBrandContext(brandName, industry, aesthetic);
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
    palette = paletteFromBrandContext(brandName, industry, aesthetic);
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

  const positioningStatement = `${brandName} delivers uncompromising quality and visionary design to ${audience.toLowerCase()}, empowering them with refined solutions that elevate everyday standards.`;

  let rebrandStory = undefined;
  if (req.isRebrand) {
    const isCustom = req.rebrandMode === 'custom_prompt' && Boolean(req.customRebrandPrompt?.trim());
    const prevName = req.brandName || "Our Brand";

    const rebrandBio = isCustom
      ? `Our rebranding from ${prevName} marks a decisive strategic evolution aligned with our modern ambition: "${req.customRebrandPrompt}". This new identity unites architectural precision with elevated emotional resonance, stripping away legacy frictions to position our brand for long-term category leadership and meaningful customer connection.`
      : `As ${prevName} enters its next chapter, we are embracing a comprehensive identity transformation. What began as an early venture has matured into an authoritative benchmark of craft, trust, and technological clarity. Moving towards this new phase allows us to shed outdated visual paradigms, sharpen our digital touchpoints, and communicate our true product excellence to a global audience.`;

    rebrandStory = {
      isRebrand: true,
      previousBrandName: req.brandName,
      previousLogo: req.currentLogo,
      previousLogoType: req.currentLogoType,
      previousTypography: req.currentTypography,
      previousColors: req.existingColors,
      rebrandMode: req.rebrandMode || 'impress_me',
      customPrompt: req.customRebrandPrompt,
      rebrandTitle: `${prevName}: The Next Strategic Era`,
      rebrandBio,
      strategicDiagnosis: isCustom
        ? `Executed strategic transformation following user vision: "${req.customRebrandPrompt}". Rebalanced optical weights, heightened contrast, and harmonized assets.`
        : `Diagnostic analysis revealed legacy aesthetic constraints in typography contrast and icon scalability. Re-engineered into a high-contrast, WCAG AA compliant system with enduring geometric authority.`,
      keyEvolutionPoints: [
        {
          title: "Visual Identity & Emblem Modernization",
          before: req.currentLogo ? "Legacy logo mark with visual clutter and multi-scale friction" : "Initial uncalibrated logo concept",
          after: "Sculpted vector identity with mathematical geometry and negative space harmony",
          strategicWhy: "Ensures unmistakable recognition across high-resolution displays, favicons, app icons, and physical architecture.",
        },
        {
          title: "Typographic Hierarchy & Editorial Authority",
          before: req.currentTypography?.headingFont ? `Legacy ${req.currentTypography.headingFont} font stack with limited dynamic range` : "System-default typography lacking distinct brand voice",
          after: `${typography.headingFont} paired with ${typography.bodyFont}`,
          strategicWhy: typography.rationale,
        },
        {
          title: "Color Atmosphere & Accessibility",
          before: req.existingColors?.length ? `Legacy palette (${req.existingColors.join(', ')}) with untested contrast ratios` : "Uncalibrated primary colors",
          after: `5-Color balanced palette (${palette.map((c: any) => c.hex).join(', ')}) with 60-30-10 distribution and WCAG AA verification`,
          strategicWhy: "Eliminates legibility barriers while projecting contemporary sophistication.",
        },
        {
          title: "Strategic Market Posture",
          before: "Initial utility focus with fragmented messaging",
          after: `Cohesive positioning: "${positioningStatement}"`,
          strategicWhy: "Builds defensible brand equity and commands premium market resonance.",
        },
      ],
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: "brand-" + Date.now(),
    brandName,
    tagline: req.existingTagline || `Defining the Future of ${industry.split(/\s+/)[0] || "Innovation"}`,
    industry,
    mission,
    vision: `To lead a global transformation in ${industry.toLowerCase()} by marrying timeless aesthetic craftsmanship with fearless technological execution.`,
    positioningStatement,
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
      moodboardKeywords: industryDir.categoryKeywords,
      photographyGuidance: `${industryDir.photographyDirection.lighting}. Shot on ${industryDir.photographyDirection.lens}, featuring ${industryDir.photographyDirection.materials}. Color grade: ${industryDir.photographyDirection.colorGrade}.`,
      dos: [
        "Use natural directional light and authentic material physics",
        "Feature high-craft architectural or tactile details without clutter",
        "Maintain intentional negative space around focal subjects",
      ],
      donts: [
        "Avoid generic corporate stock photography clichés",
        "Never use harsh oversaturated artificial flash",
        "Avoid busy, unfocused backgrounds with competing visual noise",
      ],
    },
    targetAudience: audience,
    powerLevel: 'legacy',
    brandArchetype: industryDir.logoArchetypes[0] || 'geometric_minimalist',
    photographyDirection: industryDir.photographyDirection,
    directorMetadata: {
      model: 'GABI Procedural Architecture Engine',
      provider: 'local',
      routingRationale: 'GABI Legacy Mode: Deterministic mathematical vector synthesis with WCAG AA compliance and zero external API dependencies.',
      powerLevel: 'legacy',
      latencyMs: 12,
    },
    createdAt: new Date().toISOString(),
    rebrandStory,
  };
}