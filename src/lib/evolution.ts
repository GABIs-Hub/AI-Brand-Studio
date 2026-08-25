import { BrandBible, BrandMilestone, MilestoneCategory } from '../types';

const EVOLUTION_STORAGE_PREFIX = 'brand_evolution_milestones_';

/**
 * Retrieves all evolution milestones for a given brand.
 * Automatically bootstraps a Genesis (v1.0) milestone if none exists.
 */
export function getBrandMilestones(brand: BrandBible): BrandMilestone[] {
  if (!brand || !brand.id) return [];
  const key = `${EVOLUTION_STORAGE_PREFIX}${brand.id}`;
  let milestones: BrandMilestone[] = [];

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      milestones = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse brand milestones from localStorage:', err);
  }

  // If no milestones recorded yet, initialize v1.0 Genesis
  if (milestones.length === 0) {
    const genesisMilestone: BrandMilestone = {
      id: `ms-genesis-${brand.id}`,
      brandId: brand.id,
      versionLabel: 'v1.0',
      title: 'Initial Brand Genesis',
      changeNote: 'Baseline identity generation synthesized by Gemini AI with core visual assets.',
      timestamp: brand.createdAt || new Date().toISOString(),
      category: 'genesis',
      tags: ['Genesis', 'Identity Launch', 'v1.0'],
      snapshot: JSON.parse(JSON.stringify(brand)),
    };
    milestones = [genesisMilestone];
    saveMilestonesToStorage(brand.id, milestones);
  }

  // Return sorted descending by timestamp
  return milestones.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Saves the full list of milestones for a brand to localStorage.
 */
function saveMilestonesToStorage(brandId: string, milestones: BrandMilestone[]): void {
  try {
    const key = `${EVOLUTION_STORAGE_PREFIX}${brandId}`;
    localStorage.setItem(key, JSON.stringify(milestones));
  } catch (err) {
    console.error('Failed to save brand milestones:', err);
  }
}

/**
 * Records a new checkpoint milestone for the brand.
 */
export function createMilestoneCheckpoint(
  brand: BrandBible,
  params: {
    title: string;
    changeNote: string;
    category?: MilestoneCategory;
    tags?: string[];
    versionOverride?: string;
  }
): BrandMilestone {
  const currentMilestones = getBrandMilestones(brand);
  
  // Calculate next version label (e.g. v1.1, v1.2, or user provided)
  let nextVersion = params.versionOverride;
  if (!nextVersion) {
    const nextNum = (currentMilestones.length * 0.1 + 1.0).toFixed(1);
    nextVersion = `v${nextNum}`;
  }

  const newMilestone: BrandMilestone = {
    id: `ms-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    brandId: brand.id,
    versionLabel: nextVersion,
    title: params.title || `Revision ${nextVersion}`,
    changeNote: params.changeNote || 'Captured brand identity state checkpoint.',
    timestamp: new Date().toISOString(),
    category: params.category || 'checkpoint',
    tags: params.tags && params.tags.length > 0 ? params.tags : ['Checkpoint', nextVersion],
    snapshot: JSON.parse(JSON.stringify(brand)),
  };

  const updatedList = [newMilestone, ...currentMilestones];
  saveMilestonesToStorage(brand.id, updatedList);
  return newMilestone;
}

/**
 * Deletes a specific milestone from history.
 */
export function deleteMilestone(brandId: string, milestoneId: string): BrandMilestone[] {
  const current = getBrandMilestones({ id: brandId } as BrandBible);
  const filtered = current.filter((m) => m.id !== milestoneId);
  saveMilestonesToStorage(brandId, filtered);
  return filtered;
}

/**
 * Formats a timestamp into a clean relative or absolute date.
 */
export function formatEvolutionDate(isoDate: string): { relative: string; full: string } {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative = 'Just now';
    if (diffDays > 0) {
      relative = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      relative = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffMin > 0) {
      relative = diffMin === 1 ? '1 min ago' : `${diffMin} mins ago`;
    }

    const full = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return { relative, full };
  } catch {
    return { relative: 'Recently', full: isoDate };
  }
}

export interface EvolutionDiffResult {
  hasDifferences: boolean;
  colorChanges: { role: string; oldHex: string; newHex: string; changed: boolean }[];
  headingFontChanged: boolean;
  bodyFontChanged: boolean;
  oldHeading: string;
  newHeading: string;
  oldBody: string;
  newBody: string;
  taglineChanged: boolean;
  oldTagline: string;
  newTagline: string;
  missionChanged: boolean;
  logoChanged: boolean;
  traitsChangesCount: number;
}

/**
 * Computes a side-by-side visual difference between two BrandBible states.
 */
export function compareBrandVersions(
  versionA: BrandBible,
  versionB: BrandBible
): EvolutionDiffResult {
  const colorChanges: { role: string; oldHex: string; newHex: string; changed: boolean }[] = [];
  
  // Compare 5-color palette roles
  const roles = ['Primary', 'Secondary', 'Accent', 'Neutral Light', 'Neutral Dark'] as const;
  roles.forEach((role) => {
    const colA = versionA.palette.find((c) => c.role === role)?.hex || '#000000';
    const colB = versionB.palette.find((c) => c.role === role)?.hex || '#000000';
    colorChanges.push({
      role,
      oldHex: colA,
      newHex: colB,
      changed: colA.toLowerCase() !== colB.toLowerCase(),
    });
  });

  const headingFontChanged = versionA.typography.headingFont !== versionB.typography.headingFont;
  const bodyFontChanged = versionA.typography.bodyFont !== versionB.typography.bodyFont;
  const taglineChanged = versionA.tagline !== versionB.tagline;
  const missionChanged = versionA.mission !== versionB.mission;
  const logoChanged = versionA.logo.primaryLogoSvg !== versionB.logo.primaryLogoSvg;

  // Trait differences
  let traitsChangesCount = 0;
  versionA.personalityTraits.forEach((traitA) => {
    const traitB = versionB.personalityTraits.find((t) => t.trait === traitA.trait);
    if (!traitB || traitB.rating !== traitA.rating) {
      traitsChangesCount++;
    }
  });

  const hasDifferences =
    colorChanges.some((c) => c.changed) ||
    headingFontChanged ||
    bodyFontChanged ||
    taglineChanged ||
    missionChanged ||
    logoChanged ||
    traitsChangesCount > 0;

  return {
    hasDifferences,
    colorChanges,
    headingFontChanged,
    bodyFontChanged,
    oldHeading: versionA.typography.headingFont,
    newHeading: versionB.typography.headingFont,
    oldBody: versionA.typography.bodyFont,
    newBody: versionB.typography.bodyFont,
    taglineChanged,
    oldTagline: versionA.tagline,
    newTagline: versionB.tagline,
    missionChanged,
    logoChanged,
    traitsChangesCount,
  };
}
