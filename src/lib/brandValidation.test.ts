import { describe, it, expect } from 'vitest';
import { sanitizeBrandBible, sanitizeBrandList, looksLikeBrandBible } from './brandValidation';
import { BrandBible } from '../types';

const base = {
  id: 'b1',
  brandName: 'Acme',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function makeFullBrand(): BrandBible {
  return {
    id: 'full',
    brandName: 'Nimbus',
    tagline: 'Clouds for creators',
    industry: 'Software',
    mission: 'Mission text',
    vision: 'Vision text',
    positioningStatement: 'Positioning text',
    personalityTraits: [
      { trait: 'Bold', rating: 4, minLabel: 'Quiet', maxLabel: 'Loud' },
    ],
    values: [{ title: 'Craft', description: 'Care', iconName: 'Wrench' }],
    palette: [
      { name: 'Primary', hex: '#1A1A1A', rgb: '26, 26, 26', role: 'Primary', usage: 'Hero', contrastNote: 'AAA' },
    ],
    typography: {
      headingFont: 'Fraunces',
      headingFontCategory: 'Serif',
      headingWeights: ['700'],
      bodyFont: 'Inter',
      bodyFontCategory: 'Sans-Serif',
      bodyWeights: ['400'],
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Fraunces&display=swap',
      rationale: 'r',
      cssSnippet: 'font-family: Fraunces;',
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
    targetAudience: 'Creators',
    imageryStyle: {
      moodboardKeywords: ['clean'],
      photographyGuidance: 'pg',
      dos: ['d'],
      donts: ['x'],
    },
    createdAt: '2026-01-02T00:00:00.000Z',
  };
}

describe('sanitizeBrandBible', () => {
  it('passes a complete, valid brand through unchanged', () => {
    const input = makeFullBrand();
    expect(sanitizeBrandBible(input)).toEqual(input);
  });

  it('fills safe defaults for a minimal valid bible', () => {
    const b = sanitizeBrandBible(base)!;
    expect(b).not.toBeNull();
    expect(b.palette).toEqual([]);
    expect(b.values).toEqual([]);
    expect(b.toneOfVoice).toEqual([]);
    expect(b.personalityTraits).toEqual([]);
    expect(b.secondaryMarks).toEqual([]);
    expect(b.logo.primaryLogoSvg).toBe('');
    expect(b.typography).toEqual({
      headingFont: '',
      headingFontCategory: 'Sans-Serif',
      headingWeights: [],
      bodyFont: '',
      bodyFontCategory: 'Sans-Serif',
      bodyWeights: [],
      accentFont: undefined,
      googleFontsUrl: '',
      rationale: '',
      cssSnippet: '',
    });
    expect(b.imageryStyle).toEqual({ moodboardKeywords: [], photographyGuidance: '', dos: [], donts: [] });
    expect(b.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('rejects payloads that are not a brand at all', () => {
    expect(sanitizeBrandBible(null)).toBeNull();
    expect(sanitizeBrandBible(undefined)).toBeNull();
    expect(sanitizeBrandBible('text')).toBeNull();
    expect(sanitizeBrandBible(42)).toBeNull();
    expect(sanitizeBrandBible([base])).toBeNull(); // arrays are not bibles
    expect(sanitizeBrandBible({ brandName: 'No id' })).toBeNull();
    expect(sanitizeBrandBible({ id: 'no-name' })).toBeNull();
    expect(sanitizeBrandBible({ id: 'x', brandName: 42 })).toBeNull();
    expect(sanitizeBrandBible({ id: '', brandName: '' })).toBeNull();
  });

  it('assigns a valid createdAt when missing or malformed', () => {
    const missing = sanitizeBrandBible({ id: 'a', brandName: 'A' })!;
    expect(Number.isNaN(Date.parse(missing.createdAt))).toBe(false);
    const broken = sanitizeBrandBible({ id: 'a', brandName: 'A', createdAt: 'not-a-date' })!;
    expect(Number.isNaN(Date.parse(broken.createdAt))).toBe(false);
  });

  it('drops palette entries without a hex and repairs the rest', () => {
    const b = sanitizeBrandBible({
      ...base,
      palette: [{ hex: '#FF0000', name: 5, role: 'Bogus' }, { name: 'no-hex' }, 'junk', null],
    })!;
    expect(b.palette).toHaveLength(1);
    expect(b.palette[0]).toMatchObject({ hex: '#FF0000', name: '', role: 'Primary' });
  });

  it('repairs broken typography, wrong-typed arrays, and rating ranges', () => {
    const b = sanitizeBrandBible({
      ...base,
      typography: { googleFontsUrl: 5, headingWeights: 'bold', bodyWeights: [1, '400'] },
      values: 'junk',
      toneOfVoice: [{ trait: 'Warm' }],
      imageryStyle: null,
      personalityTraits: [{ trait: 'Loud', rating: 99 }, { trait: 'Quiet', rating: 'x' }],
    })!;
    expect(b.typography.googleFontsUrl).toBe('');
    expect(b.typography.headingWeights).toEqual([]);
    expect(b.typography.bodyWeights).toEqual(['400']);
    expect(b.values).toEqual([]);
    expect(b.toneOfVoice).toEqual([
      { trait: 'Warm', description: '', doExample: '', dontExample: '' },
    ]);
    expect(b.imageryStyle.moodboardKeywords).toEqual([]);
    expect(b.personalityTraits.map((p) => p.rating)).toEqual([5, 3]);
  });

  it('preserves unknown/future fields so data is never lost', () => {
    const b = sanitizeBrandBible({ ...base, someFutureField: { nested: true }, userId: 'u1' })!;
    expect((b as any).someFutureField).toEqual({ nested: true });
    expect(b.userId).toBe('u1');
  });

  it('keeps valid optional strings and drops invalid types', () => {
    const b = sanitizeBrandBible({
      ...base,
      userId: 123,
      tagline: null,
      generatedLogoImageUrl: 'https://img.example/x.png',
      version: undefined,
      updatedAt: 'nope',
    })!;
    expect(b.userId).toBeUndefined();
    expect(b.tagline).toBe('');
    expect(b.generatedLogoImageUrl).toBe('https://img.example/x.png');
    expect(b.version).toBeUndefined();
    expect(b.updatedAt).toBeUndefined();
  });
});

describe('sanitizeBrandList', () => {
  it('drops malformed rows, dedupes by id, and preserves order', () => {
    const list = sanitizeBrandList([
      { id: 'a', brandName: 'A', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'b' }, // no brandName -> dropped
      'junk', // not an object -> dropped
      null,
      { id: 'a', brandName: 'A2' }, // duplicate id -> dropped
      { id: 'c', brandName: 'C' },
    ]);
    expect(list.map((b) => b.id)).toEqual(['a', 'c']);
  });

  it('never throws on garbage and returns [] for non-arrays', () => {
    expect(sanitizeBrandList({ brands: [] })).toEqual([]);
    expect(sanitizeBrandList(null)).toEqual([]);
    expect(sanitizeBrandList('nope')).toEqual([]);
    expect(sanitizeBrandList([{ typography: { bad: true } }])).toEqual([]);
  });
});

describe('looksLikeBrandBible', () => {
  it('recognizes objects with a brand name and rejects the rest', () => {
    expect(looksLikeBrandBible({ brandName: 'Acme' })).toBe(true);
    expect(looksLikeBrandBible({ brandName: '  ' })).toBe(false);
    expect(looksLikeBrandBible({ id: 'x' })).toBe(false);
    expect(looksLikeBrandBible('x')).toBe(false);
    expect(looksLikeBrandBible(null)).toBe(false);
    expect(looksLikeBrandBible([{ brandName: 'A' }])).toBe(false);
  });
});
