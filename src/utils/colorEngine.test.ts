import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  contrastRatio,
  contrastRatioHex,
  hashString,
  seedHue,
  generateHarmoniousPalette,
  paletteFromBrandContext,
  darkModeVariants,
  schemeForAesthetic,
  harmonyOffsets,
  type BrandPalette,
} from './colorEngine';

describe('color math', () => {
  it('round-trips hex → rgb → hex', () => {
    expect(rgbToHex(hexToRgb('#2563EB'))).toBe('#2563EB');
    expect(rgbToHex(hexToRgb('#fff'))).toBe('#FFFFFF');
    expect(rgbToHex(hexToRgb('#1A1A1A'))).toBe('#1A1A1A');
  });

  it('falls back safely on malformed hex', () => {
    expect(hexToRgb('nonsense')).toEqual({ r: 26, g: 26, b: 26 });
  });

  it('round-trips hsl → rgb', () => {
    expect(rgbToHsl(hslToRgb({ h: 220, s: 80, l: 50 }))).toEqual({ h: 220, s: 80, l: 50 });
  });

  it('computes known WCAG contrast ratios', () => {
    // Black on white is exactly 21:1
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 0);
    expect(contrastRatioHex('#000000', '#FFFFFF')).toBeGreaterThanOrEqual(21);
    // Same color is 1:1
    expect(contrastRatioHex('#2563EB', '#2563EB')).toBeCloseTo(1, 5);
  });
});

describe('deterministic seeding', () => {
  it('hashString is stable across calls', () => {
    expect(hashString('acme|tech|modern')).toBe(hashString('acme|tech|modern'));
  });

  it('different inputs produce different hues', () => {
    expect(seedHue('acme|tech')).not.toBe(seedHue('zenith|organic'));
  });

  it('seedHue stays within 0–359', () => {
    for (const s of ['a', 'brand', 'very long brand string with spaces']) {
      const h = seedHue(s);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
  });
});

describe('harmony schemes', () => {
  it('maps aesthetics to sensible schemes', () => {
    expect(schemeForAesthetic('Luxury & Heritage')).toBe('monochromatic');
    expect(schemeForAesthetic('tech startup')).toBe('triadic');
    expect(schemeForAesthetic('organic skincare')).toBe('analogous');
    expect(schemeForAesthetic('bold & playful')).toBe('complementary');
    expect(schemeForAesthetic('Modern & Minimalist')).toBe('analogous');
  });

  it('harmonyOffsets always yields exactly 3 hues', () => {
    for (const scheme of ['analogous', 'complementary', 'triadic', 'split-complementary', 'monochromatic'] as const) {
      expect(harmonyOffsets(scheme).length).toBe(3);
    }
  });
});

describe('palette generation invariants', () => {
  it('produces exactly 5 colors with the right roles', () => {
    const palette = paletteFromBrandContext('Acme', 'Technology', 'Modern & Minimalist');
    expect(palette).toHaveLength(5);
    expect(palette.map((c) => c.role)).toEqual([
      'Primary',
      'Secondary',
      'Accent',
      'Neutral Light',
      'Neutral Dark',
    ]);
  });

  it('all hex values are valid 6-digit hex', () => {
    const palette = paletteFromBrandContext('Acme', 'Technology', 'Modern & Minimalist');
    for (const c of palette) {
      expect(c.hex).toMatch(/^#[0-9A-F]{6}$/);
      expect(c.rgb).toMatch(/^\d{1,3}, \d{1,3}, \d{1,3}$/);
    }
  });

  it('guarantees AAA contrast between the neutral pair', () => {
    for (const aesthetic of ['Modern & Minimalist', 'Luxury & Heritage', 'Organic & Artisanal', 'Tech & Futuristic']) {
      const palette = paletteFromBrandContext('Nimbus', 'General', aesthetic);
      const light = palette[3].hex;
      const dark = palette[4].hex;
      expect(contrastRatioHex(light, dark), `${aesthetic}: ${light} vs ${dark}`).toBeGreaterThanOrEqual(7);
    }
  });

  it('guarantees AA contrast for primary/secondary on the light canvas', () => {
    for (const aesthetic of ['Modern & Minimalist', 'Luxury & Heritage', 'Organic & Artisanal', 'Tech & Futuristic', 'Bold & Playful']) {
      const palette = paletteFromBrandContext('Vertex', 'Fashion', aesthetic);
      const light = palette[3].hex;
      expect(contrastRatioHex(palette[0].hex, light), `primary ${aesthetic}`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatioHex(palette[1].hex, light), `secondary ${aesthetic}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('is deterministic for identical inputs', () => {
    const a = paletteFromBrandContext('Acme', 'Technology', 'Modern');
    const b = paletteFromBrandContext('Acme', 'Technology', 'Modern');
    expect(a.map((c) => c.hex)).toEqual(b.map((c) => c.hex));
  });

  it('varies palettes across different brand contexts', () => {
    const a = paletteFromBrandContext('Acme', 'Technology', 'Modern');
    const b = paletteFromBrandContext('Acme', 'Food', 'Organic & Artisanal');
    expect(a.map((c) => c.hex)).not.toEqual(b.map((c) => c.hex));
  });

  it('honors a user-supplied primary color', () => {
    const palette = paletteFromBrandContext('Acme', 'Tech', 'Modern', '#E63946');
    expect(palette[0].hex).toBe('#E63946');
  });

  it('generated palettes from the same seed hue are valid', () => {
    const palette = generateHarmoniousPalette({ hue: 200, scheme: 'triadic', saturation: 70, lightness: 50 });
    expect(palette).toHaveLength(5);
    expect(contrastRatioHex(palette[3].hex, palette[4].hex)).toBeGreaterThanOrEqual(7);
  });
});

describe('dark mode variants', () => {
  it('lightens accent and primary for dark surfaces', () => {
    const palette = paletteFromBrandContext('Acme', 'Tech', 'Modern');
    const dark = darkModeVariants(palette);
    const accentL = hexToRgb(palette[2].hex);
    const accentDark = hexToRgb(dark[2].hex);
    // Sum of RGB channels should be brighter (lighter color) in the dark variant
    const sum = (c: { r: number; g: number; b: number }) => c.r + c.g + c.b;
    expect(sum(accentDark)).toBeGreaterThanOrEqual(sum(accentL));
  });

  it('keeps neutral roles unchanged', () => {
    const palette = paletteFromBrandContext('Acme', 'Tech', 'Modern');
    const dark = darkModeVariants(palette);
    expect(dark[3].hex).toBe(palette[3].hex);
    expect(dark[4].hex).toBe(palette[4].hex);
  });

  it('returns the input unchanged when neutrals are missing', () => {
    const broken = [{ role: 'Primary', hex: '#111111' }] as unknown as BrandPalette;
    expect(darkModeVariants(broken)).toBe(broken);
  });
});