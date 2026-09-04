import { describe, it, expect } from 'vitest';
import { formatBrandSummarySnippet } from './share';
import { BrandBible } from '../types';

function makeBrand(): BrandBible {
  return {
    id: 'b1',
    brandName: 'Nimbus',
    tagline: 'Clouds for creators',
    industry: 'Software',
    mission: 'Mission text',
    vision: 'Vision text',
    positioningStatement: 'Positioning text',
    personalityTraits: [
      { trait: 'Bold', rating: 4, minLabel: 'Quiet', maxLabel: 'Loud' },
    ],
    values: [{ title: 'Craft', description: 'Care in every detail', iconName: 'Wrench' }],
    palette: [
      { name: 'Primary', hex: '#1A1A1A', rgb: '26, 26, 26', role: 'Primary', usage: 'Hero sections', contrastNote: 'AAA' },
    ],
    typography: {
      headingFont: 'Fraunces',
      headingFontCategory: 'Serif',
      headingWeights: ['700'],
      bodyFont: 'Inter',
      bodyFontCategory: 'Sans-Serif',
      bodyWeights: ['400'],
      accentFont: 'Space Grotesk',
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
    createdAt: new Date().toISOString(),
  };
}

describe('formatBrandSummarySnippet', () => {
  it('includes the brand name uppercased', () => {
    expect(formatBrandSummarySnippet(makeBrand())).toContain('BRAND DOSSIER: NIMBUS');
  });

  it('includes palette, values, and personality sections', () => {
    const snippet = formatBrandSummarySnippet(makeBrand());
    expect(snippet).toContain('5-COLOR HARMONY PALETTE');
    expect(snippet).toContain('• Primary: Primary (#1A1A1A) - Hero sections');
    expect(snippet).toContain('CORE BRAND VALUES');
    expect(snippet).toContain('PERSONALITY SPECTRUM');
    expect(snippet).toContain('Bold');
  });

  it('includes typography pairings', () => {
    const snippet = formatBrandSummarySnippet(makeBrand());
    expect(snippet).toContain('Heading: Fraunces (Serif)');
    expect(snippet).toContain('Body: Inter (Sans-Serif)');
  });
});