import { BrandBible } from '../types';
import { sanitizeBrandBible } from '../lib/brandValidation';

const SAFE_BRAND_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

/**
 * Validates and normalizes a brand before it crosses the persistence boundary.
 *
 * The route id is checked separately from the document id so a caller cannot
 * make the URL identify one resource while updating another. Ownership is
 * always derived from the authenticated session, never from request data.
 */
export function prepareBrandForPersistence(
  input: unknown,
  routeId: string,
  userId: string
): BrandBible | null {
  const brand = sanitizeBrandBible(input);
  if (!brand || brand.id !== routeId || !SAFE_BRAND_ID.test(routeId) || !userId) return null;

  // Project onto the persisted contract. The general sanitizer preserves
  // future fields for safe client round-tripping; persistence must not store
  // arbitrary request properties or caller-supplied ownership metadata.
  return {
    id: brand.id,
    userId,
    brandName: brand.brandName,
    tagline: brand.tagline,
    industry: brand.industry,
    mission: brand.mission,
    vision: brand.vision,
    positioningStatement: brand.positioningStatement,
    personalityTraits: brand.personalityTraits,
    values: brand.values,
    palette: brand.palette,
    typography: brand.typography,
    logo: brand.logo,
    secondaryMarks: brand.secondaryMarks,
    toneOfVoice: brand.toneOfVoice,
    targetAudience: brand.targetAudience,
    imageryStyle: brand.imageryStyle,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
    generatedLogoImageUrl: brand.generatedLogoImageUrl,
    generatedLogoResolution: brand.generatedLogoResolution,
    version: brand.version,
  };
}
