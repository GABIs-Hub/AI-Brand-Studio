import {
  BrandBible,
  BrandColor,
  FontPairing,
  ImageryStyle,
  LogoSpec,
  PersonalityTrait,
  SecondaryMark,
  ToneGuideline,
  BrandValue,
} from '../types';

// ── Defensive Brand Bible validation ─────────────────────────────────────
// Every brand document that enters the app — JSON imports, localStorage /
// sessionStorage rows, cloud (Neon) rows, and AI-engine responses — passes
// through these pure helpers. The sanitizer NEVER throws: it repairs any
// repairable shape (missing typography, malformed arrays, bad dates) and
// returns null only when the payload is not a brand at all (no id or no
// brand name), so callers can drop it instead of crashing the app or
// letting a broken doc leak into the library.

function obj(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function validDateString(v: unknown): string | undefined {
  if (typeof v === 'string' && !Number.isNaN(Date.parse(v))) return v;
  return undefined;
}

const COLOR_ROLES = ['Primary', 'Secondary', 'Accent', 'Neutral Light', 'Neutral Dark'] as const;
const HEADING_CATEGORIES = ['Serif', 'Sans-Serif', 'Display', 'Monospace'] as const;
const BODY_CATEGORIES = ['Serif', 'Sans-Serif', 'Monospace'] as const;

function sanitizePalette(v: unknown): BrandColor[] {
  if (!Array.isArray(v)) return [];
  const out: BrandColor[] = [];
  for (const item of v) {
    const o = obj(item);
    if (!o) continue;
    const hex = str(o.hex);
    if (!hex) continue; // A swatch without a hex is useless — drop it.
    out.push({
      name: str(o.name),
      hex,
      rgb: str(o.rgb),
      role: COLOR_ROLES.includes(o.role as (typeof COLOR_ROLES)[number])
        ? (o.role as BrandColor['role'])
        : 'Primary',
      usage: str(o.usage),
      contrastNote: str(o.contrastNote),
    });
  }
  return out;
}

function sanitizeTypography(v: unknown): FontPairing {
  const o = obj(v);
  return {
    headingFont: str(o?.headingFont),
    headingFontCategory: HEADING_CATEGORIES.includes(
      o?.headingFontCategory as (typeof HEADING_CATEGORIES)[number]
    )
      ? (o!.headingFontCategory as FontPairing['headingFontCategory'])
      : 'Sans-Serif',
    headingWeights: strArray(o?.headingWeights),
    bodyFont: str(o?.bodyFont),
    bodyFontCategory: BODY_CATEGORIES.includes(o?.bodyFontCategory as (typeof BODY_CATEGORIES)[number])
      ? (o!.bodyFontCategory as FontPairing['bodyFontCategory'])
      : 'Sans-Serif',
    bodyWeights: strArray(o?.bodyWeights),
    accentFont: o?.accentFont === undefined ? undefined : str(o.accentFont),
    googleFontsUrl: str(o?.googleFontsUrl),
    rationale: str(o?.rationale),
    cssSnippet: str(o?.cssSnippet),
  };
}

function sanitizeLogo(v: unknown): LogoSpec {
  const o = obj(v);
  return {
    primaryLogoSvg: str(o?.primaryLogoSvg),
    concept: str(o?.concept),
    symbolism: str(o?.symbolism),
    geometryDetails: str(o?.geometryDetails),
    aiImagePrompt: str(o?.aiImagePrompt),
  };
}

function sanitizeValues(v: unknown): BrandValue[] {
  if (!Array.isArray(v)) return [];
  const out: BrandValue[] = [];
  for (const item of v) {
    const o = obj(item);
    if (!o) continue;
    out.push({ title: str(o.title), description: str(o.description), iconName: str(o.iconName) });
  }
  return out;
}

function sanitizePersonalityTraits(v: unknown): PersonalityTrait[] {
  if (!Array.isArray(v)) return [];
  const out: PersonalityTrait[] = [];
  for (const item of v) {
    const o = obj(item);
    if (!o) continue;
    const rating =
      typeof o.rating === 'number' && !Number.isNaN(o.rating)
        ? Math.min(5, Math.max(1, Math.round(o.rating)))
        : 3;
    out.push({ trait: str(o.trait), rating, minLabel: str(o.minLabel), maxLabel: str(o.maxLabel) });
  }
  return out;
}

function sanitizeTone(v: unknown): ToneGuideline[] {
  if (!Array.isArray(v)) return [];
  const out: ToneGuideline[] = [];
  for (const item of v) {
    const o = obj(item);
    if (!o) continue;
    out.push({
      trait: str(o.trait),
      description: str(o.description),
      doExample: str(o.doExample),
      dontExample: str(o.dontExample),
    });
  }
  return out;
}

function sanitizeSecondaryMarks(v: unknown): SecondaryMark[] {
  if (!Array.isArray(v)) return [];
  const out: SecondaryMark[] = [];
  v.forEach((item, i) => {
    const o = obj(item);
    if (!o) return;
    out.push({
      id: str(o.id) || `mark_${i + 1}`,
      title: str(o.title),
      description: str(o.description),
      svg: str(o.svg),
    });
  });
  return out;
}

function sanitizeImagery(v: unknown): ImageryStyle {
  const o = obj(v);
  return {
    moodboardKeywords: strArray(o?.moodboardKeywords),
    photographyGuidance: str(o?.photographyGuidance),
    dos: strArray(o?.dos),
    donts: strArray(o?.donts),
  };
}

/**
 * Repairs any repairable brand document and returns a complete, render-safe
 * BrandBible. Returns null when the payload is not a brand at all — missing
 * id, missing brandName, or not an object.
 */
export function sanitizeBrandBible(input: unknown): BrandBible | null {
  const o = obj(input);
  if (!o) return null;

  const id = str(o.id);
  const brandName = str(o.brandName);
  if (!id || !brandName) return null;

  const createdAt = validDateString(o.createdAt) ?? new Date().toISOString();
  const updatedAt = validDateString(o.updatedAt);

  return {
    ...(o as unknown as BrandBible), // preserve unknown/future fields
    id,
    brandName,
    // Optional string fields stay undefined unless they are real strings —
    // never empty-string placeholders, so round-tripping is lossless.
    userId: typeof o.userId === 'string' ? o.userId : undefined,
    tagline: str(o.tagline),
    industry: str(o.industry),
    mission: str(o.mission),
    vision: str(o.vision),
    positioningStatement: str(o.positioningStatement),
    personalityTraits: sanitizePersonalityTraits(o.personalityTraits),
    values: sanitizeValues(o.values),
    palette: sanitizePalette(o.palette),
    typography: sanitizeTypography(o.typography),
    logo: sanitizeLogo(o.logo),
    secondaryMarks: sanitizeSecondaryMarks(o.secondaryMarks),
    toneOfVoice: sanitizeTone(o.toneOfVoice),
    targetAudience: str(o.targetAudience),
    imageryStyle: sanitizeImagery(o.imageryStyle),
    createdAt,
    updatedAt,
    generatedLogoImageUrl:
      typeof o.generatedLogoImageUrl === 'string' ? o.generatedLogoImageUrl : undefined,
    generatedLogoResolution:
      typeof o.generatedLogoResolution === 'string' ? o.generatedLogoResolution : undefined,
    version: typeof o.version === 'string' ? o.version : undefined,
  };
}

/**
 * Filters a raw list of brand rows: drops anything that is not a valid
 * brand, dedupes by id (first occurrence wins), and preserves order.
 * Never throws — a malformed cloud row or storage array simply disappears.
 */
export function sanitizeBrandList(input: unknown): BrandBible[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: BrandBible[] = [];
  for (const item of input) {
    const clean = sanitizeBrandBible(item);
    if (!clean) continue;
    if (seen.has(clean.id)) continue;
    seen.add(clean.id);
    out.push(clean);
  }
  return out;
}

/** Cheap pre-check for the import UI: does this object plausibly name a brand? */
export function looksLikeBrandBible(input: unknown): boolean {
  const o = obj(input);
  return !!o && typeof o.brandName === 'string' && o.brandName.trim().length > 0;
}