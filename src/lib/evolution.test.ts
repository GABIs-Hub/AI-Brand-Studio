import { describe, it, expect, beforeEach } from 'vitest';
import {
  getBrandMilestones,
  createMilestoneCheckpoint,
  deleteMilestone,
  formatEvolutionDate,
} from './evolution';
import { BrandBible } from '../types';

function makeBrand(id = 'brand-1'): BrandBible {
  return {
    id,
    brandName: 'Test Brand',
    tagline: 'Make it count',
    industry: 'Tech',
    mission: 'Mission',
    vision: 'Vision',
    positioningStatement: 'Positioning',
    personalityTraits: [],
    values: [],
    palette: [],
    typography: {
      headingFont: 'A',
      headingFontCategory: 'Sans-Serif',
      headingWeights: ['700'],
      bodyFont: 'B',
      bodyFontCategory: 'Sans-Serif',
      bodyWeights: ['400'],
      accentFont: 'C',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=A&display=swap',
      rationale: 'r',
      cssSnippet: 'font-family: A;',
    },
    logo: {
      primaryLogoSvg: '<svg/>',
      concept: 'c',
      symbolism: 's',
      geometryDetails: 'g',
      aiImagePrompt: 'p',
    },
    secondaryMarks: [],
    toneOfVoice: [],
    targetAudience: 'Everyone',
    imageryStyle: {
      moodboardKeywords: ['clean'],
      photographyGuidance: 'pg',
      dos: ['d'],
      donts: ['x'],
    },
    createdAt: new Date().toISOString(),
  };
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('getBrandMilestones', () => {
  it('bootstraps a genesis milestone for a brand without history', () => {
    const brand = makeBrand();
    const milestones = getBrandMilestones(brand);
    expect(milestones).toHaveLength(1);
    expect(milestones[0].versionLabel).toBe('v1.0');
    expect(milestones[0].category).toBe('genesis');
    expect(milestones[0].snapshot.id).toBe('brand-1');
  });

  it('returns an empty array for a brand without an id', () => {
    expect(getBrandMilestones({ ...makeBrand(), id: '' })).toEqual([]);
  });
});

describe('createMilestoneCheckpoint', () => {
  it('increments minor versions v1.0 → v1.1 → v1.2', () => {
    const brand = makeBrand('brand-increment');
    const first = createMilestoneCheckpoint(brand, { title: 'First', changeNote: 'n1' });
    const second = createMilestoneCheckpoint(brand, { title: 'Second', changeNote: 'n2' });
    expect(first.versionLabel).toBe('v1.1');
    expect(second.versionLabel).toBe('v1.2');
  });

  it('never duplicates the genesis v1.0 label', () => {
    const brand = makeBrand('brand-no-collide');
    const next = createMilestoneCheckpoint(brand, { title: 'A', changeNote: 'a' });
    expect(next.versionLabel).toBe('v1.1');
  });

  it('derives the next version from max existing (no collision after delete)', () => {
    const brand = makeBrand('brand-post-delete');
    createMilestoneCheckpoint(brand, { title: 'A', changeNote: 'a' }); // v1.1
    createMilestoneCheckpoint(brand, { title: 'B', changeNote: 'b' }); // v1.2
    deleteMilestone(brand.id, getBrandMilestones(brand)[0].id); // remove v1.2
    const next = createMilestoneCheckpoint(brand, { title: 'C', changeNote: 'c' });
    // v1.2 was deleted, so the highest remaining is v1.1 → next is v1.2 (no collision)
    expect(next.versionLabel).toBe('v1.2');
  });

  it('respects a version override', () => {
    const brand = makeBrand('brand-override');
    const m = createMilestoneCheckpoint(brand, {
      title: 'Pivot',
      changeNote: 'big change',
      versionOverride: 'v2.0',
    });
    expect(m.versionLabel).toBe('v2.0');
  });
});

describe('deleteMilestone', () => {
  it('removes a milestone from history', () => {
    const brand = makeBrand('brand-delete');
    createMilestoneCheckpoint(brand, { title: 'X', changeNote: 'x' });
    const target = getBrandMilestones(brand)[0];
    const remaining = deleteMilestone(brand.id, target.id);
    expect(remaining.find((m) => m.id === target.id)).toBeUndefined();
  });
});

describe('formatEvolutionDate', () => {
  it('formats a recent date as relative', () => {
    const { relative, full } = formatEvolutionDate(new Date().toISOString());
    expect(relative).toMatch(/ago|just now/i);
    expect(full).toMatch(/\d{4}/);
  });

  it('falls back gracefully on invalid input', () => {
    const { relative, full } = formatEvolutionDate('not-a-date');
    expect(typeof relative).toBe('string');
    expect(typeof full).toBe('string');
  });
});