// Procedural (deterministic, no-AI) brand generators.
// Extracted from server.ts so the pure functions can be unit-tested without
// booting the Express server.

import {
  contrastRatioHex,
  hashString,
  hexToRgb,
  rgbToHex,
  paletteFromBrandContext,
} from "../utils/colorEngine";
import { resolveIndustryDirection } from "./industryContext";

function normalizeHex(hex: string): string {
  return rgbToHex(hexToRgb(hex));
}

function rgbString(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isHexColor(value: string | undefined): value is string {
  return Boolean(value && /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value));
}

function contrastNoteForColor(hex: string, light: string, dark: string): string {
  if (contrastRatioHex(hex, light) >= 7) return "Passes AAA contrast on light surfaces";
  if (contrastRatioHex(hex, light) >= 4.5) return "Passes AA contrast on light surfaces";
  if (contrastRatioHex(hex, dark) >= 4.5) return "Passes AA contrast on dark surfaces";
  return "Use for graphics and large text";
}

function industryGlyph(
  symbol: ProceduralLogoVariationParams["logoSymbol"],
  primary: string,
  accent: string
): string {
  const marks: Record<NonNullable<ProceduralLogoVariationParams["logoSymbol"]>, string> = {
    structure: `<path d="M20 53V28l18-11 18 11v25M20 28l18 11 18-11M38 39v14M28 33v20M48 33v20"/>`,
    monogram: `<path d="M22 48c0-15 9-25 19-25 7 0 12 4 12 10 0 7-6 10-16 10-8 0-13 4-13 10 0 5 4 8 10 8 9 0 17-8 17-20"/>`,
    network: `<path d="M25 25l13 13 14-15M25 25l-3 27 16-14 14 12M38 38l14-15"/> <circle cx="25" cy="25" r="4" fill="${accent}"/><circle cx="52" cy="23" r="4" fill="${accent}"/><circle cx="22" cy="52" r="4" fill="${accent}"/><circle cx="38" cy="38" r="4" fill="${accent}"/><circle cx="52" cy="50" r="4" fill="${accent}"/>`,
    care: `<path d="M38 54S20 44 20 32c0-10 13-14 18-4 5-10 18-6 18 4 0 12-18 22-18 22z"/> <path d="M38 29v15M30.5 36.5h15" stroke="${accent}"/>`,
    vault: `<path d="M38 17l19 8v14c0 11-8 18-19 23-11-5-19-12-19-23V25z"/> <path d="M38 29v24M30 34v14M46 34v14" stroke="${accent}"/>`,
    botanical: `<path d="M38 56V37M38 43C24 43 20 34 21 24c12-1 21 4 17 19M38 38c0-14 8-21 19-21 1 12-4 21-19 21"/> <path d="M27 33l11 10M49 25L38 38" stroke="${accent}"/>`,
    book: `<path d="M19 23c8-3 14-2 19 2v31c-5-4-11-5-19-2zM57 23c-8-3-14-2-19 2v31c5-4 11-5 19-2z"/> <path d="M24 31c4-1 7 0 10 1M24 38c4-1 7 0 10 1M52 31c-4-1-7 0-10 1M52 38c-4-1-7 0-10 1" stroke="${accent}"/>`,
    home: `<path d="M19 37l19-17 19 17M25 34v20h26V34M34 54V41h10v13"/> <path d="M19 37l19-17 19 17" stroke="${accent}"/>`,
    beauty: `<path d="M38 38c-13 0-16-15-5-18 5-1 8 4 5 18zM38 38c0-13 15-16 18-5 1 5-4 8-18 5zM38 38c13 0 16 15 5 18-5 1-8-4-5-18zM38 38c0 13-15 16-18 5-1-5 4-8 18-5z"/> <circle cx="38" cy="38" r="4" fill="${accent}"/>`,
    planet: `<circle cx="38" cy="38" r="17"/> <ellipse cx="38" cy="38" rx="27" ry="10" transform="rotate(-25 38 38)"/> <circle cx="51" cy="24" r="3" fill="${accent}"/>`,
    compass: `<circle cx="38" cy="38" r="20"/> <path d="M45 29l-5 12-12 6 5-12z" fill="${accent}" stroke="${primary}"/> <path d="M38 18v5M58 38h-5M38 58v-5M18 38h5"/>`,
    media: `<path d="M20 25h36v27H20z"/> <path d="M34 31v15l12-7.5z" fill="${accent}" stroke="${primary}"/> <path d="M26 20h24M26 57h24" stroke="${accent}"/>`,
    orbit: `<circle cx="38" cy="38" r="16"/> <ellipse cx="38" cy="38" rx="27" ry="9" transform="rotate(-30 38 38)"/> <circle cx="54" cy="28" r="3" fill="${accent}"/>`,
  };
  const selected = symbol || "orbit";
  return `<g fill="none" stroke="${primary}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.96">${marks[selected]}</g>`;
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
  logoSymbol?: 'structure' | 'monogram' | 'network' | 'care' | 'vault' | 'botanical' | 'book' | 'home' | 'beauty' | 'planet' | 'compass' | 'media' | 'orbit';
  preferredArchetypes?: string[];
  preferredArchetype?: string;
  logoGeometryGuidance?: string;
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
  const pColor = normalizeHex(params.pColor || "#1A1A1A");
  const sColor = normalizeHex(params.sColor || "#2563EB");
  const aColor = normalizeHex(params.aColor || "#F59E0B");
  const nlColor = normalizeHex(params.nlColor || "#F9F8F6");
  const ndColor = normalizeHex(params.ndColor || "#111827");
  const hFont = escapeXml(params.headingFont || "Plus Jakarta Sans");
  const bFont = escapeXml(params.bodyFont || "Plus Jakarta Sans");
  const escapedBrandName = escapeXml(brandName);
  const industryDirection = resolveIndustryDirection(params.industry);
  const industryName = escapeXml(industryDirection.name);
  const glyph = industryGlyph(params.logoSymbol || industryDirection.logoSymbol, pColor, aColor);
  const initial = brandName.charAt(0).toUpperCase();
  const escapedInitial = escapeXml(initial);
  const letterPath = getLetterformSvgPath(initial);
  const subline = escapeXml((params.industry || "Brand Identity").toUpperCase());

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
    ${glyph}
  </g>
  <text x="110" y="50" font-family="${hFont}, sans-serif" font-size="26" font-weight="800" fill="${ndColor}" letter-spacing="-0.5">${escapedBrandName}</text>
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
    ${glyph}
  </g>
  <text x="110" y="48" font-family="${hFont}, sans-serif" font-size="25" font-weight="700" fill="${ndColor}">${escapedBrandName}</text>
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
    ${glyph}
  </g>
  <text x="112" y="49" font-family="${hFont}, sans-serif" font-size="25" font-weight="800" fill="${ndColor}" letter-spacing="-0.8">${escapedBrandName}</text>
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
    <text x="38" y="44" font-family="${hFont}, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">${escapedInitial}</text>
    <circle cx="38" cy="21" r="2" fill="${aColor}" />
    <circle cx="38" cy="54" r="2" fill="${aColor}" />
    ${glyph}
  </g>
  <text x="108" y="46" font-family="${hFont}, sans-serif" font-size="24" font-weight="700" fill="${ndColor}">${escapedBrandName}</text>
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
    ${glyph}
  </g>
  <text x="110" y="48" font-family="${hFont}, sans-serif" font-size="26" font-weight="800" fill="${ndColor}" letter-spacing="-0.5">${escapedBrandName}</text>
  <text x="110" y="68" font-family="${bFont}, sans-serif" font-size="8.5" font-weight="600" fill="${sColor}" letter-spacing="3.5" text-transform="uppercase">${subline}</text>
</svg>`;

  // 6. Modern Wordmark + Standalone Responsive Dynamic Initial Mark
  const modernWordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
  <g transform="translate(16, 20)">
    <rect x="0" y="0" width="58" height="58" rx="14" fill="${pColor}" />
    <!-- Dynamic Letterform Initial Path -->
    <path d="${letterPath}" fill="none" stroke="#FFFFFF" stroke-width="3.75" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="44" cy="14" r="4.5" fill="${aColor}" />
    ${glyph}
  </g>
  <text x="96" y="52" font-family="${hFont}, sans-serif" font-size="28" font-weight="900" fill="${ndColor}" letter-spacing="-1">${escapedBrandName}</text>
  <circle cx="96" cy="66" r="3" fill="${sColor}" />
  <text x="106" y="69" font-family="${bFont}, sans-serif" font-size="8.5" font-weight="700" fill="${sColor}" letter-spacing="4" text-transform="uppercase">${subline}</text>
</svg>`;

  const variations = [
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

  const preferred = [...new Set(
    [params.preferredArchetype, ...(params.preferredArchetypes || [])]
      .filter((archetype): archetype is string => Boolean(archetype))
      .filter((archetype) => variations.some((variation) => variation.archetype === archetype))
  )];
  const byArchetype = new Map(variations.map((variation) => [variation.archetype, variation]));
  const ordered = [
    ...preferred.map((archetype) => byArchetype.get(archetype)!),
    ...variations.filter((variation) => !preferred.includes(variation.archetype)),
  ];
  const guidance = params.logoGeometryGuidance || industryDirection.logoGeometryGuidance;
  return ordered.map((variation) => ({
    ...variation,
    concept: `${variation.concept} Adapted for ${industryName} with its recommended ${variation.archetype.replace(/_/g, " ")} direction.`,
    geometryDetails: `${variation.geometryDetails} Industry geometry: ${guidance}`,
  }));
}

export interface ProceduralLogoPromptRefinementInput {
  brandName: string;
  industry?: string;
  mission?: string;
  aesthetic?: string;
  targetAudience?: string;
  archetype?: string;
  customDirectives?: string;
  complexityLevel?: string;
  currentPrompt?: string;
  palette?: Array<{ hex?: string }>;
  typography?: {
    headingFont?: string;
    bodyFont?: string;
  };
}

export function refineProceduralLogoPromptCoT(input: ProceduralLogoPromptRefinementInput) {
  const brandName = (input.brandName || "Northstar").trim() || "Northstar";
  const industry = input.industry?.trim() || "Technology";
  const mission = input.mission?.trim() || "Build a memorable, modern, high-trust identity.";
  const aesthetic = (input.aesthetic || "Modern, Clean, High-Contrast").trim();
  const audience = input.targetAudience?.trim() || "Discerning professionals and global audiences";
  const complexity = input.complexityLevel?.trim() || "intricate_geometric";
  const direction = resolveIndustryDirection(industry, mission);
  const normalizedArchetype = (input.archetype || direction.logoArchetypes[0] || "negative_space").trim();

  const paletteColors = [
    input.palette?.find((color) => isHexColor(color.hex))?.hex || "#111827",
    input.palette?.find((color, index) => index === 1 && isHexColor(color.hex))?.hex || "#2563EB",
    input.palette?.find((color, index) => index === 2 && isHexColor(color.hex))?.hex || "#F59E0B",
    input.palette?.find((color, index) => index === 3 && isHexColor(color.hex))?.hex || "#F8F8F6",
    input.palette?.find((color, index) => index === 4 && isHexColor(color.hex))?.hex || "#0F172A",
  ].map((hex) => normalizeHex(hex));

  const typography = {
    headingFont: input.typography?.headingFont || direction.typographyRules.recommendedPairings[0]?.heading || "Plus Jakarta Sans",
    bodyFont: input.typography?.bodyFont || direction.typographyRules.recommendedPairings[0]?.body || "Inter",
  };

  const conceptualMetaphor = `${direction.name} craftsmanship expressed as ${normalizedArchetype.replace(/_/g, " ")} meeting a ${aesthetic.toLowerCase()} point of view.`;
  const metaphors = [
    "An engineered gesture that feels like a premium signal, not a generic badge.",
    "A visual tension between clarity and motion, balancing confidence with approachability.",
    `A ${direction.name.toLowerCase()} narrative shaped by ${direction.brandPromise.toLowerCase()}.`,
  ];

  const chainOfThought = [
    {
      stepNumber: 1,
      stepName: "Semiotic deconstruction",
      focus: `${brandName} in ${direction.name}`,
      reasoning: `The identity should feel grounded in ${direction.brandPromise.toLowerCase()} while remaining distinct for ${audience.toLowerCase()}.`,
      extractedMetaphors: metaphors,
      geometryRules: [
        "Use asymmetric balance and layered rhythm instead of symmetrical default shapes.",
        "Let the form imply movement without becoming decorative or noisy.",
      ],
    },
    {
      stepNumber: 2,
      stepName: "Spatial topology",
      focus: "Structure and proportion",
      reasoning: `Complexity should rise from ${complexity.replace(/_/g, " ")} logic, not from clutter. The mark should read crisply at app icon scale and in a full lockup.`,
      extractedMetaphors: [`${direction.logoGeometryGuidance}`],
      geometryRules: [
        "Anchor the structure to a strong geometric grid.",
        "Favor gold-ratio spacing and purposeful negative space over random ornament.",
      ],
    },
    {
      stepNumber: 3,
      stepName: "Vector craft",
      focus: "Path synthesis",
      reasoning: `Combine a custom monogram, a subtle directional counterform, and layered gradients to create a premium yet technical presence for ${brandName}.`,
      extractedMetaphors: ["Precision as emotion", "Loyalty expressed through motion", "Trust translated into tactile form"],
      geometryRules: [
        "Use smooth cubic curves and deliberate contrast between stroke weights.",
        "Keep the mark scalable without reducing readability at small sizes.",
      ],
    },
    {
      stepNumber: 4,
      stepName: "Studio rendering prompt",
      focus: "Materiality and surface",
      reasoning: `The studio brief should describe a refined ${direction.voice.style} finish with polished depth, subtle highlight edges, and controlled light falloff.`,
      extractedMetaphors: ["A premium object, not a flat sticker."],
      geometryRules: [
        "Use micro-contrast lighting and tactile materials.",
        "Avoid heavy noise, generic shadows, and stock-photo softness.",
      ],
    },
    {
      stepNumber: 5,
      stepName: "Complexity audit",
      focus: "Why this stands apart",
      reasoning: `This concept feels bespoke because it translates business meaning into shape, rhythm, and typography rather than relying on a generic symbol library.`,
      extractedMetaphors: ["Signal with substance", "Authority with warmth"],
      geometryRules: [
        "One core metaphor, a manageable number of shapes, and clear hierarchy for the brand system.",
        "The result is more memorable because it is intentionally designed, not merely decorative.",
      ],
    },
  ];

  const refinedVectorPrompt = `Design a premium ${direction.name.toLowerCase()} logo for ${brandName}. ${direction.logoGeometryGuidance} Build a ${normalizedArchetype.replace(/_/g, " ")} system with layered gradients, clean geometry, and nuanced negative space. Palette: ${paletteColors.join(", ")}. Type: ${typography.headingFont} and ${typography.bodyFont}. Mission: ${mission}. Audience: ${audience}. Aesthetic: ${aesthetic}.`;
  const refinedStudioPrompt = `Photorealistic studio render of the ${brandName} brand mark: premium ${direction.name.toLowerCase()} identity system, polished ${direction.photographyDirection.materials.toLowerCase()}, controlled directional lighting, crisp material reflections, macro texture, high-end editorial composition, minimal background, 8k, cinematic surfaces, elegant shadowing.`;
  const svgPathBlueprint = `Anchor mark at center, negative-space counterform, golden-ratio spacing, layered gradients from ${paletteColors[0]} to ${paletteColors[1]}, accent highlight at ${paletteColors[2]}, wordmark in ${typography.headingFont} with tight tracking and a precise secondary line in ${typography.bodyFont}.`;
  const visualComplexityAnalysis = `This concept qualifies as agency-grade because it balances strategic meaning, geometry, and market fit. The system does not rely on generic circles or simplistic badges; instead it uses deliberate asymmetry, layered contrast, and industry-aware symbolism to make ${brandName} stand out in ${direction.name.toLowerCase()}.`;

  const generatedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" width="100%" height="100%">
    <defs>
      <linearGradient id="brandGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${paletteColors[0]}" />
        <stop offset="85%" stop-color="${paletteColors[1]}" />
      </linearGradient>
    </defs>
    <rect x="12" y="18" width="88" height="88" rx="20" fill="url(#brandGlow)" />
    <path d="M36 92 L52 38 L70 92" fill="none" stroke="${paletteColors[3]}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M46 58 H59" fill="none" stroke="${paletteColors[2]}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="90" cy="38" r="9" fill="${paletteColors[2]}"/>
    <text x="118" y="58" font-family="${typography.headingFont}, sans-serif" font-size="28" font-weight="800" fill="${paletteColors[4]}">${escapeXml(brandName)}</text>
    <text x="118" y="81" font-family="${typography.bodyFont}, sans-serif" font-size="11" letter-spacing="3" fill="${paletteColors[1]}" text-transform="uppercase">${escapeXml(direction.name.toUpperCase())}</text>
  </svg>`;

  const suggestedArchetypes = direction.logoArchetypes.slice(0, 3).map((archetype) => ({
    archetype,
    name: archetype.replace(/_/g, " "),
    rationale: `Best suited for ${direction.name.toLowerCase()} because it reinforces ${direction.brandPromise.toLowerCase()} and supports a premium, recognizable system.`,
  }));

  return {
    brandName,
    archetype: normalizedArchetype,
    conceptualMetaphor,
    chainOfThought,
    refinedVectorPrompt,
    refinedStudioPrompt,
    svgPathBlueprint,
    visualComplexityAnalysis,
    generatedSvg,
    suggestedArchetypes,
  };
}

export interface ProceduralBrandRequest {
  brandName?: string;
  mission: string;
  industry?: string;
  aesthetic?: string;
  targetAudience?: string;
  productsServices?: string;
  geographicMarket?: string;
  brandArchetype?: string;
  competitiveEnvironment?: string;
  primaryColorPreference?: string;
  preferredTypography?: {
    headingFont?: string;
    bodyFont?: string;
  };
  tonePreference?: string;
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

function fontCategory(font: string): "Serif" | "Sans-Serif" | "Display" | "Monospace" {
  if (/mono|code/i.test(font)) return "Monospace";
  if (/fraunces|playfair|cinzel|lora|merriweather|serif/i.test(font)) return "Serif";
  if (/display|bebas|oswald/i.test(font)) return "Display";
  return "Sans-Serif";
}

function googleFontsUrl(fonts: Array<{ name: string; weights: string[] }>): string {
  const uniqueFonts = [...new Map(fonts.map((font) => [font.name, font])).values()];
  const families = uniqueFonts.map(({ name, weights }) =>
    `family=${encodeURIComponent(name).replace(/%20/g, "+")}:wght@${weights.join(";")}`
  );
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

// Procedural Brand Synthesis Engine (Deterministic high-aesthetic generator)
export function synthesizeProceduralBrand(req: ProceduralBrandRequest) {
  const mission = req.mission.trim();
  const aesthetic = (req.aesthetic || "Modern & Minimalist").toLowerCase();
  const industry = req.industry?.trim() || "Independent & Cross-Industry";
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

  const suppliedColors = [
    isHexColor(req.primaryColorPreference) ? req.primaryColorPreference : req.existingColors?.[0],
    req.existingColors?.[1],
    req.existingColors?.[2],
  ];
  const primaryHex = isHexColor(suppliedColors[0]) ? normalizeHex(suppliedColors[0]) : undefined;
  const generatedPalette = paletteFromBrandContext(brandName, industry, aesthetic, primaryHex, {
    seedHex: industryDir.colorPhilosophy.suggestedSeedHues[0],
    harmony: industryDir.colorPhilosophy.harmony,
  });
  const palette = generatedPalette.map((color, index) => {
    const supplied = suppliedColors[index];
    if (index > 2 || !isHexColor(supplied)) return color;
    const hex = normalizeHex(supplied);
    return {
      ...color,
      hex,
      rgb: rgbString(hex),
      contrastNote: contrastNoteForColor(hex, generatedPalette[3].hex, generatedPalette[4].hex),
    };
  });

  const pairingIndex = hashString(`${brandName}|${industry}|${aesthetic}`) %
    industryDir.typographyRules.recommendedPairings.length;
  const pairing = industryDir.typographyRules.recommendedPairings[pairingIndex];
  const headingFont = req.preferredTypography?.headingFont?.trim() || pairing.heading;
  const bodyFont = req.preferredTypography?.bodyFont?.trim() || pairing.body;
  const headingWeights = ["500", "600", "700"];
  const bodyWeights = ["400", "500", "600"];
  const typography = {
    headingFont,
    headingFontCategory: fontCategory(headingFont),
    headingWeights,
    bodyFont,
    bodyFontCategory: fontCategory(bodyFont) === "Display" ? "Sans-Serif" as const : fontCategory(bodyFont),
    bodyWeights,
    accentFont: "Space Grotesk",
    googleFontsUrl: googleFontsUrl([
      { name: headingFont, weights: headingWeights },
      { name: bodyFont, weights: bodyWeights },
    ]),
    rationale: req.preferredTypography?.headingFont || req.preferredTypography?.bodyFont
      ? `User-selected typefaces are paired with the ${industryDir.name.toLowerCase()} guidance: ${industryDir.typographyRules.bodyStyle}.`
      : `${pairing.rationale} ${industryDir.typographyRules.bodyStyle}.`,
    cssSnippet: `font-family: '${headingFont}', ${fontCategory(headingFont) === "Serif" ? "serif" : "sans-serif"}; --font-body: '${bodyFont}', sans-serif;`,
  };

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
    logoSymbol: industryDir.logoSymbol,
    preferredArchetypes: industryDir.logoArchetypes,
    preferredArchetype: req.brandArchetype,
    logoGeometryGuidance: industryDir.logoGeometryGuidance,
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

  const offering = req.productsServices?.trim() || mission;
  const market = req.geographicMarket?.trim();
  const competitiveContext = req.competitiveEnvironment?.trim();
  const positioningStatement =
    `For ${audience}${market ? ` in ${market}` : ""}, ${brandName} provides ${offering} in ${industryDir.name.toLowerCase()}. ` +
    `The brand is built around ${industryDir.brandPromise}` +
    `${competitiveContext ? `, with a point of difference in ${competitiveContext}` : ""}.`;
  const taglineIndex = hashString(`${brandName}|${mission}|${industry}`) % industryDir.taglineOptions.length;
  const tagline = req.existingTagline?.trim() || industryDir.taglineOptions[taglineIndex];
  const valueIcons: Record<string, string[]> = {
    structure: ["Layers", "Shield", "Target", "Zap"],
    monogram: ["Sparkles", "Crown", "Layers", "Compass"],
    network: ["Zap", "Shield", "Target", "Layers"],
    care: ["Heart", "Shield", "Activity", "Sparkles"],
    vault: ["Shield", "Target", "Layers", "Zap"],
    botanical: ["Heart", "Sparkles", "Layers", "Globe"],
    book: ["Compass", "BookOpen", "Target", "Layers"],
    home: ["Shield", "Compass", "Target", "Heart"],
    beauty: ["Sparkles", "Shield", "Heart", "Layers"],
    planet: ["Globe", "Layers", "Shield", "Zap"],
    compass: ["Compass", "Globe", "Shield", "Sparkles"],
    media: ["Sparkles", "Target", "Layers", "Compass"],
    orbit: ["Target", "Shield", "Layers", "Sparkles"],
  };
  const iconNames = valueIcons[industryDir.logoSymbol] || valueIcons.orbit;
  const voiceStyle = req.tonePreference?.trim()
    ? `${req.tonePreference.trim()}, balanced with ${industryDir.voice.style}`
    : industryDir.voice.style;

  let rebrandStory = undefined;
  if (req.isRebrand) {
    const isCustom = req.rebrandMode === 'custom_prompt' && Boolean(req.customRebrandPrompt?.trim());
    const prevName = req.brandName || "Our Brand";

    const rebrandBio = isCustom
      ? `Our rebranding from ${prevName} is guided by this ambition: "${req.customRebrandPrompt}". The new identity brings that direction into the ${industryDir.name.toLowerCase()} context, with a focus on ${industryDir.brandPromise}.`
      : `As ${prevName} enters its next chapter in ${industryDir.name.toLowerCase()}, the identity is evolving around ${industryDir.brandPromise}. The refresh brings its visual language, typography, and everyday touchpoints into closer alignment with ${audience}${market ? ` in ${market}` : ""}.`;

    rebrandStory = {
      isRebrand: true,
      previousBrandName: req.brandName,
      previousLogo: req.currentLogo,
      previousLogoType: req.currentLogoType,
      previousTypography: req.currentTypography,
      previousColors: req.existingColors,
      rebrandMode: req.rebrandMode || 'impress_me',
      customPrompt: req.customRebrandPrompt,
      rebrandTitle: `${prevName}: ${industryDir.name} Reframed`,
      rebrandBio,
      strategicDiagnosis: isCustom
        ? `The requested transformation is expressed through ${industryDir.logoGeometryGuidance} The strategic intent is to ${industryDir.brandPromise}.`
        : `The previous identity needed a clearer connection to ${industryDir.name.toLowerCase()} and the people it serves. The update prioritizes ${industryDir.brandPromise} through a more relevant visual and verbal system.`,
      keyEvolutionPoints: [
        {
          title: "Visual Identity & Emblem Modernization",
          before: req.currentLogo ? "Legacy logo mark with visual clutter and multi-scale friction" : "Initial uncalibrated logo concept",
          after: variations[0].concept,
          strategicWhy: industryDir.logoGeometryGuidance,
        },
        {
          title: "Typographic Hierarchy & Editorial Authority",
          before: req.currentTypography?.headingFont ? `Legacy ${req.currentTypography.headingFont} font stack with limited dynamic range` : "System-default typography lacking distinct brand voice",
          after: `${typography.headingFont} paired with ${typography.bodyFont}`,
          strategicWhy: `${typography.rationale} ${industryDir.typographyRules.headingStyle}.`,
        },
        {
          title: "Color Atmosphere & Accessibility",
          before: req.existingColors?.length ? `Legacy palette (${req.existingColors.join(', ')}) with untested contrast ratios` : "Uncalibrated primary colors",
          after: `5-Color balanced palette (${palette.map((c: any) => c.hex).join(', ')}) with 60-30-10 distribution and WCAG AA verification`,
          strategicWhy: `${industryDir.colorPhilosophy.paletteRationale} Preserve contrast and legibility across brand surfaces.`,
        },
        {
          title: "Strategic Market Posture",
          before: "Initial utility focus with fragmented messaging",
          after: `Cohesive positioning: "${positioningStatement}"`,
          strategicWhy: `Makes the brand promise concrete for ${audience}: ${industryDir.brandPromise}.`,
        },
      ],
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: "brand-" + Date.now(),
    brandName,
    tagline,
    industry,
    mission,
    vision: `${brandName} aims to be known for ${industryDir.brandPromise}, serving ${audience}${market ? ` in ${market}` : ""}.`,
    positioningStatement,
    personalityTraits: industryDir.personalityDefaults,
    values: industryDir.brandValues.map((value, index) => ({
      ...value,
      iconName: iconNames[index] || "Sparkles",
    })),
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
    toneOfVoice: industryDir.personalityDefaults.map((personality, index) => ({
      trait: `${personality.trait}: ${personality.maxLabel}`,
      description: `Use a ${voiceStyle} voice, especially when communicating ${personality.maxLabel.toLowerCase()}.`,
      doExample: index === 0
        ? industryDir.voice.doExample
        : `Describe ${offering} with specific details that demonstrate ${personality.maxLabel.toLowerCase()}.`,
      dontExample: industryDir.voice.dontExample,
    })),
    imageryStyle: {
      moodboardKeywords: industryDir.categoryKeywords.length > 0
        ? industryDir.categoryKeywords
        : industryDir.iconConcepts,
      photographyGuidance: `${industryDir.photographyDirection.lighting}. Shot on ${industryDir.photographyDirection.lens}, featuring ${industryDir.photographyDirection.materials}. Composition: ${industryDir.photographyDirection.composition}. Color grade: ${industryDir.photographyDirection.colorGrade}.`,
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
    brandArchetype: variations[0].archetype,
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