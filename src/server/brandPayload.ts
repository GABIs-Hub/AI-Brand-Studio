import { BrandBible } from '../types';
import { sanitizeBrandBible } from '../lib/brandValidation';

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
  if (!brand || brand.id !== routeId) return null;

  return { ...brand, userId };
}
