import { describe, it, expect } from 'vitest';
import { synthesizeProceduralBrand, generateProceduralLogoVariations } from './proceduralBrands';
import { contrastRatioHex } from '../utils/colorEngine';

describe('synthesizeProceduralBrand', () => {
  it('returns a complete brand bible with all required sections', () => {
    const brand = synthesizeProceduralBrand({
      mission: 'Build beautiful, accessible design tools for indie creators.',
      industry: 'Software',
      aesthetic: 'Modern & Minimalist',
    });

    expect(brand.brandName).toBeTruthy();
    expect(brand.tagline).toBeTruthy();
    expect(brand.industry).toBe('Software');
    expect(brand.palette).toHaveLength(5);
    expect(brand.personalityTraits).toHaveLength(4);
    expect(brand.values).toHaveLength(4);
    expect(brand.typography.headingFont).toBeTruthy();
    expect(brand.typography.googleFontsUrl).toMatch(/^https:\/\/fonts\.googleapis\.com/);
    expect(brand.logo.primaryLogoSvg).toContain('<svg');
    expect(brand.secondaryMarks.length).toBeGreaterThanOrEqual(3);
    expect(brand.toneOfVoice.length).toBeGreaterThanOrEqual(4);
    expect(brand.imageryStyle.moodboardKeywords.length).toBeGreaterThan(0);
  });

  it('generates a unique brand name from the mission when none is given', () => {
    const a = synthesizeProceduralBrand({ mission: 'Empower freelancers to ship polished client work.' });
    const b = synthesizeProceduralBrand({ mission: 'Help families cook healthy meals in minutes.' });
    expect(a.brandName).toBeTruthy();
    expect(b.brandName).toBeTruthy();
    expect(a.brandName).not.toBe(b.brandName);
  });

  it('is deterministic for identical inputs', () => {
    const input = { mission: 'Test deterministic synthesis.', industry: 'Design', aesthetic: 'Luxury & Heritage' };
    const a = synthesizeProceduralBrand(input);
    const b = synthesizeProceduralBrand(input);
    expect(a.brandName).toBe(b.brandName);
    expect(a.palette.map((c: any) => c.hex)).toEqual(b.palette.map((c: any) => c.hex));
    expect(a.logo.primaryLogoSvg).toBe(b.logo.primaryLogoSvg);
  });

  it('produces an accessible palette across aesthetics', () => {
    for (const aesthetic of ['Modern & Minimalist', 'Luxury & Heritage', 'Organic & Artisanal', 'Tech & Futuristic', 'Bold & Playful']) {
      const brand = synthesizeProceduralBrand({
        mission: 'A vibrant brand test.',
        industry: 'Fashion',
        aesthetic,
      });
      const [primary, , , light, dark] = brand.palette;
      expect(contrastRatioHex(light.hex, dark.hex), `${aesthetic} neutrals`).toBeGreaterThanOrEqual(7);
      expect(contrastRatioHex(primary.hex, light.hex), `${aesthetic} primary`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('respects existing brand colors when supplied', () => {
    const brand = synthesizeProceduralBrand({
      mission: 'Refresh an existing identity.',
      industry: 'Retail',
      aesthetic: 'Modern & Minimalist',
      existingColors: ['#E63946', '#1D3557', '#F1FAEE'],
    });
    expect(brand.palette[0].hex.toLowerCase()).toBe('#e63946');
    expect(brand.palette[1].hex.toLowerCase()).toBe('#1d3557');
    expect(brand.palette[2].hex.toLowerCase()).toBe('#f1faee');
  });

  it('handles a refresh request with preserved name', () => {
    const brand = synthesizeProceduralBrand({
      brandName: 'Existing Co.',
      mission: 'Keep the name, modernize everything else.',
      isExistingBrandRefresh: true,
    });
    expect(brand.brandName).toBe('Existing Co.');
  });
});

describe('generateProceduralLogoVariations', () => {
  it('returns 4+ distinct SVG variations', () => {
    const variations = generateProceduralLogoVariations({
      brandName: 'Nova',
      industry: 'Tech',
      pColor: '#4F46E5',
      sColor: '#06B6D4',
      aColor: '#8B5CF6',
    });
    expect(variations.length).toBeGreaterThanOrEqual(4);
    for (const v of variations) {
      expect(v.id).toBeTruthy();
      expect(v.title).toBeTruthy();
      expect(v.svg).toContain('<svg');
      expect(v.svg).toContain('viewBox');
    }
  });

  it('is deterministic for identical params', () => {
    const params = { brandName: 'Nova', industry: 'Tech' };
    const a = generateProceduralLogoVariations(params);
    const b = generateProceduralLogoVariations(params);
    expect(a.map((v) => v.svg)).toEqual(b.map((v) => v.svg));
  });
});