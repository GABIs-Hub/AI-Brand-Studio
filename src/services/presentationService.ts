import pptxgen from 'pptxgenjs';
import { BrandBible } from '../types';

/**
 * Strips '#' from hex string for pptxgenjs color format
 */
function cleanHex(hex: string, defaultHex = '1A1A1A'): string {
  if (!hex) return defaultHex;
  return hex.replace('#', '').trim().toUpperCase();
}

/**
 * Converts SVG string into PNG data URL via canvas for PowerPoint slide embedding
 */
async function svgToPngDataUrl(svgString: string, width = 600, height = 600): Promise<string> {
  if (typeof window === 'undefined') return '';
  return new Promise((resolve) => {
    try {
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 40, 40, width - 80, height - 80);
        }
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('');
      };
      img.src = url;
    } catch {
      resolve('');
    }
  });
}

/**
 * Generates an editable, professional 16:9 PowerPoint (.pptx) deck for a brand
 */
export async function exportBrandPowerPointDeck(brand: BrandBible): Promise<void> {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16X9';
  pptx.title = `${brand.brandName} - Brand Strategy & Identity Deck`;
  pptx.company = brand.brandName;
  pptx.subject = `Brand Strategy, Identity System & Visual Guidelines for ${brand.brandName}`;
  pptx.author = 'GABI Creative Direction Platform';

  // Core brand color tokens for PowerPoint
  const primaryHex = cleanHex(brand.palette.find((c) => c.role === 'Primary')?.hex || '#1E40AF');
  const secondaryHex = cleanHex(brand.palette.find((c) => c.role === 'Secondary')?.hex || '#3B82F6');
  const accentHex = cleanHex(brand.palette.find((c) => c.role === 'Accent')?.hex || '#F59E0B');
  const lightHex = cleanHex(brand.palette.find((c) => c.role.includes('Light'))?.hex || '#F9F7F2');
  const darkHex = cleanHex(brand.palette.find((c) => c.role.includes('Dark'))?.hex || '#111827');

  const headingFont = brand.typography.headingFont || 'Arial';
  const bodyFont = brand.typography.bodyFont || 'Calibri';

  // Attempt to render logo for slide inclusion
  let logoPngDataUrl = '';
  if (brand.generatedLogoImageUrl && brand.generatedLogoImageUrl.startsWith('data:image/')) {
    logoPngDataUrl = brand.generatedLogoImageUrl;
  } else if (brand.logo?.primaryLogoSvg) {
    logoPngDataUrl = await svgToPngDataUrl(brand.logo.primaryLogoSvg, 800, 800);
  }

  // ==========================================
  // SLIDE 1: COVER
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: darkHex };

  // Subtle accent line
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.15,
    fill: { color: accentHex },
    line: { color: accentHex },
  });

  // Category Tag
  slide1.addText(`${brand.industry.toUpperCase()} • BRAND DOSSIER`, {
    x: 1.0,
    y: 1.4,
    w: 11.33,
    h: 0.4,
    fontSize: 11,
    fontFace: bodyFont,
    color: accentHex,
    bold: true,
    charSpacing: 4,
  });

  // Brand Name
  slide1.addText(brand.brandName, {
    x: 1.0,
    y: 1.9,
    w: 11.33,
    h: 1.8,
    fontSize: 54,
    fontFace: headingFont,
    color: 'FFFFFF',
    bold: true,
  });

  // Tagline
  slide1.addText(`"${brand.tagline}"`, {
    x: 1.0,
    y: 3.8,
    w: 11.33,
    h: 0.9,
    fontSize: 22,
    fontFace: bodyFont,
    color: lightHex,
    italic: true,
  });

  // Divider
  slide1.addShape(pptx.ShapeType.line, {
    x: 1.0,
    y: 5.2,
    w: 11.33,
    h: 0,
    line: { color: '4B5563', width: 1 },
  });

  // Footer Metadata
  slide1.addText(`CONFIDENTIAL BRAND GUIDELINES • ${new Date().getFullYear()}`, {
    x: 1.0,
    y: 5.6,
    w: 6.0,
    h: 0.4,
    fontSize: 10,
    fontFace: bodyFont,
    color: '9CA3AF',
    charSpacing: 2,
  });

  slide1.addText('CREATED WITH GABI CREATIVE DIRECTION', {
    x: 7.33,
    y: 5.6,
    w: 5.0,
    h: 0.4,
    fontSize: 10,
    fontFace: bodyFont,
    color: '9CA3AF',
    align: 'right',
    charSpacing: 2,
  });

  // ==========================================
  // SLIDE 2: BRAND STRATEGY & VISION
  // ==========================================
  const slide2 = pptx.addSlide();
  slide2.background = { color: 'FFFFFF' };

  // Header banner
  slide2.addText('01 / STRATEGIC FOUNDATION', {
    x: 0.8,
    y: 0.6,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 3,
  });

  slide2.addText('Brand Mission, Vision & Strategic Positioning', {
    x: 0.8,
    y: 0.9,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    fontFace: headingFont,
    color: darkHex,
    bold: true,
  });

  // Card 1: Mission
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.8,
    w: 5.6,
    h: 2.3,
    rectRadius: 0.1,
    fill: { color: 'F8FAFC' },
    line: { color: 'E2E8F0', width: 1 },
  });
  slide2.addText('CORE MISSION', {
    x: 1.1,
    y: 2.0,
    w: 5.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 2,
  });
  slide2.addText(brand.mission, {
    x: 1.1,
    y: 2.4,
    w: 5.0,
    h: 1.5,
    fontSize: 13,
    fontFace: bodyFont,
    color: '334155',
    lineSpacingMultiple: 1.2,
  });

  // Card 2: Vision
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 6.9,
    y: 1.8,
    w: 5.6,
    h: 2.3,
    rectRadius: 0.1,
    fill: { color: 'F8FAFC' },
    line: { color: 'E2E8F0', width: 1 },
  });
  slide2.addText('LONG-TERM VISION', {
    x: 7.2,
    y: 2.0,
    w: 5.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 2,
  });
  slide2.addText(brand.vision, {
    x: 7.2,
    y: 2.4,
    w: 5.0,
    h: 1.5,
    fontSize: 13,
    fontFace: bodyFont,
    color: '334155',
    lineSpacingMultiple: 1.2,
  });

  // Card 3: Positioning Statement (Full Width)
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 4.4,
    w: 11.7,
    h: 2.2,
    rectRadius: 0.1,
    fill: { color: darkHex },
    line: { color: primaryHex, width: 1 },
  });
  slide2.addText('STRATEGIC POSITIONING & TARGET AUDIENCE', {
    x: 1.1,
    y: 4.65,
    w: 11.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: accentHex,
    bold: true,
    charSpacing: 2,
  });
  slide2.addText(`"${brand.positioningStatement}"`, {
    x: 1.1,
    y: 5.0,
    w: 11.0,
    h: 0.9,
    fontSize: 14,
    fontFace: headingFont,
    color: 'FFFFFF',
    italic: true,
  });
  slide2.addText(`Target Demographic: ${brand.targetAudience}`, {
    x: 1.1,
    y: 5.95,
    w: 11.0,
    h: 0.4,
    fontSize: 11,
    fontFace: bodyFont,
    color: lightHex,
  });

  // ==========================================
  // SLIDE 3: BRAND VALUES & PERSONALITY
  // ==========================================
  const slide3 = pptx.addSlide();
  slide3.background = { color: 'FFFFFF' };

  slide3.addText('02 / BRAND CHARACTER', {
    x: 0.8,
    y: 0.6,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 3,
  });

  slide3.addText('Core Values & Personality Spectrum', {
    x: 0.8,
    y: 0.9,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    fontFace: headingFont,
    color: darkHex,
    bold: true,
  });

  // 3-4 Values Columns
  const values = brand.values.slice(0, 4);
  const valColW = 11.7 / values.length - 0.2;

  values.forEach((v, idx) => {
    const vx = 0.8 + idx * (valColW + 0.2);
    slide3.addShape(pptx.ShapeType.roundRect, {
      x: vx,
      y: 1.8,
      w: valColW,
      h: 2.5,
      rectRadius: 0.1,
      fill: { color: 'F1F5F9' },
      line: { color: 'CBD5E1', width: 1 },
    });
    slide3.addText(`0${idx + 1}`, {
      x: vx + 0.2,
      y: 2.0,
      w: valColW - 0.4,
      h: 0.3,
      fontSize: 14,
      fontFace: headingFont,
      color: primaryHex,
      bold: true,
    });
    slide3.addText(v.title, {
      x: vx + 0.2,
      y: 2.35,
      w: valColW - 0.4,
      h: 0.45,
      fontSize: 13,
      fontFace: headingFont,
      color: darkHex,
      bold: true,
    });
    slide3.addText(v.description, {
      x: vx + 0.2,
      y: 2.85,
      w: valColW - 0.4,
      h: 1.3,
      fontSize: 11,
      fontFace: bodyFont,
      color: '475569',
    });
  });

  // Personality Traits
  slide3.addText('PERSONALITY TRAITS & AUDIENCE CALIBRATION', {
    x: 0.8,
    y: 4.7,
    w: 11.7,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 2,
  });

  const traits = brand.personalityTraits.slice(0, 5);
  traits.forEach((t, idx) => {
    const ty = 5.1 + idx * 0.38;
    slide3.addText(t.trait, {
      x: 0.8,
      y: ty,
      w: 2.2,
      h: 0.3,
      fontSize: 11,
      fontFace: bodyFont,
      color: darkHex,
      bold: true,
    });
    slide3.addText(t.minLabel, {
      x: 3.1,
      y: ty,
      w: 1.8,
      h: 0.3,
      fontSize: 10,
      fontFace: bodyFont,
      color: '64748B',
      align: 'right',
    });
    // Rating bar background
    slide3.addShape(pptx.ShapeType.rect, {
      x: 5.1,
      y: ty + 0.08,
      w: 4.0,
      h: 0.14,
      fill: { color: 'E2E8F0' },
      line: { color: 'E2E8F0' },
    });
    // Rating fill
    const fillW = Math.max(0.4, (t.rating / 5) * 4.0);
    slide3.addShape(pptx.ShapeType.rect, {
      x: 5.1,
      y: ty + 0.08,
      w: fillW,
      h: 0.14,
      fill: { color: primaryHex },
      line: { color: primaryHex },
    });
    slide3.addText(t.maxLabel, {
      x: 9.3,
      y: ty,
      w: 2.0,
      h: 0.3,
      fontSize: 10,
      fontFace: bodyFont,
      color: '64748B',
    });
    slide3.addText(`${t.rating}/5`, {
      x: 11.5,
      y: ty,
      w: 1.0,
      h: 0.3,
      fontSize: 10,
      fontFace: bodyFont,
      color: primaryHex,
      bold: true,
    });
  });

  // ==========================================
  // SLIDE 4: LOGO & VISUAL IDENTITY MARKS
  // ==========================================
  const slide4 = pptx.addSlide();
  slide4.background = { color: 'FFFFFF' };

  slide4.addText('03 / VISUAL IDENTITY', {
    x: 0.8,
    y: 0.6,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 3,
  });

  slide4.addText('Primary Mark & Clearspace Geometry', {
    x: 0.8,
    y: 0.9,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    fontFace: headingFont,
    color: darkHex,
    bold: true,
  });

  // Left: Logo Stage Container
  slide4.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.8,
    w: 5.6,
    h: 4.8,
    rectRadius: 0.1,
    fill: { color: 'FAFAFA' },
    line: { color: 'E5E7EB', width: 1 },
  });

  if (logoPngDataUrl) {
    slide4.addImage({
      data: logoPngDataUrl,
      x: 1.4,
      y: 2.2,
      w: 4.4,
      h: 4.0,
    });
  } else {
    slide4.addText(brand.brandName, {
      x: 1.2,
      y: 3.5,
      w: 4.8,
      h: 1.0,
      fontSize: 32,
      fontFace: headingFont,
      color: darkHex,
      bold: true,
      align: 'center',
    });
  }

  // Right: Logo Specifications & Geometry
  slide4.addShape(pptx.ShapeType.roundRect, {
    x: 6.9,
    y: 1.8,
    w: 5.6,
    h: 4.8,
    rectRadius: 0.1,
    fill: { color: 'F8FAFC' },
    line: { color: 'E2E8F0', width: 1 },
  });

  slide4.addText('IDENTITY SYSTEM SPECIFICATIONS', {
    x: 7.2,
    y: 2.1,
    w: 5.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 2,
  });

  const specs = [
    { label: 'Primary Brand Mark', val: `${brand.brandName} Master Identity` },
    { label: 'Geometric Grid', val: 'Optical centering with 1:1 proportional bounding box' },
    { label: 'Minimum Digital Size', val: '32px height for micro digital viewports' },
    { label: 'Minimum Print Size', val: '12mm width for physical publications' },
    { label: 'Mandatory Clearspace', val: 'Minimum 1X clear boundary derived from logomark height' },
    { label: 'Approved Backdrops', val: `Pure Light (#${lightHex}), Obsidian Dark (#${darkHex}), Brand Primary (#${primaryHex})` },
  ];

  specs.forEach((s, idx) => {
    const sy = 2.55 + idx * 0.65;
    slide4.addText(s.label.toUpperCase(), {
      x: 7.2,
      y: sy,
      w: 5.0,
      h: 0.22,
      fontSize: 9,
      fontFace: bodyFont,
      color: '64748B',
      bold: true,
    });
    slide4.addText(s.val, {
      x: 7.2,
      y: sy + 0.22,
      w: 5.0,
      h: 0.35,
      fontSize: 11,
      fontFace: bodyFont,
      color: darkHex,
    });
  });

  // ==========================================
  // SLIDE 5: COLOR HARMONY & ACCESSIBILITY
  // ==========================================
  const slide5 = pptx.addSlide();
  slide5.background = { color: 'FFFFFF' };

  slide5.addText('04 / COLOR ARCHITECTURE', {
    x: 0.8,
    y: 0.6,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 3,
  });

  slide5.addText('5-Color Harmony Palette & WCAG Accessibility', {
    x: 0.8,
    y: 0.9,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    fontFace: headingFont,
    color: darkHex,
    bold: true,
  });

  const swatches = brand.palette.slice(0, 5);
  const swatchW = 11.7 / swatches.length - 0.2;

  swatches.forEach((sw, idx) => {
    const sx = 0.8 + idx * (swatchW + 0.2);
    const cHex = cleanHex(sw.hex);

    // Color Box
    slide5.addShape(pptx.ShapeType.roundRect, {
      x: sx,
      y: 1.8,
      w: swatchW,
      h: 2.8,
      rectRadius: 0.1,
      fill: { color: cHex },
      line: { color: cHex },
    });

    // Swatch Information Card
    slide5.addShape(pptx.ShapeType.roundRect, {
      x: sx,
      y: 4.8,
      w: swatchW,
      h: 1.8,
      rectRadius: 0.1,
      fill: { color: 'F8FAFC' },
      line: { color: 'E2E8F0', width: 1 },
    });

    slide5.addText(sw.role.toUpperCase(), {
      x: sx + 0.15,
      y: 4.95,
      w: swatchW - 0.3,
      h: 0.25,
      fontSize: 9,
      fontFace: bodyFont,
      color: primaryHex,
      bold: true,
      charSpacing: 1,
    });

    slide5.addText(sw.name, {
      x: sx + 0.15,
      y: 5.2,
      w: swatchW - 0.3,
      h: 0.3,
      fontSize: 12,
      fontFace: headingFont,
      color: darkHex,
      bold: true,
    });

    slide5.addText(`HEX: ${sw.hex.toUpperCase()}`, {
      x: sx + 0.15,
      y: 5.5,
      w: swatchW - 0.3,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Courier New',
      color: '475569',
      bold: true,
    });

    slide5.addText(sw.usage || 'Interface & brand accent', {
      x: sx + 0.15,
      y: 5.8,
      w: swatchW - 0.3,
      h: 0.7,
      fontSize: 9,
      fontFace: bodyFont,
      color: '64748B',
    });
  });

  // ==========================================
  // SLIDE 6: TYPOGRAPHY SYSTEM
  // ==========================================
  const slide6 = pptx.addSlide();
  slide6.background = { color: 'FFFFFF' };

  slide6.addText('05 / TYPOGRAPHY HIERARCHY', {
    x: 0.8,
    y: 0.6,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 3,
  });

  slide6.addText('Typeface Pairings, Scale & Usage Standards', {
    x: 0.8,
    y: 0.9,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    fontFace: headingFont,
    color: darkHex,
    bold: true,
  });

  // Left: Heading Typeface Specimen
  slide6.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.8,
    w: 5.6,
    h: 4.8,
    rectRadius: 0.1,
    fill: { color: 'FAFAFA' },
    line: { color: 'E2E8F0', width: 1 },
  });

  slide6.addText('PRIMARY DISPLAY TYPEFACE', {
    x: 1.1,
    y: 2.1,
    w: 5.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 2,
  });

  slide6.addText(brand.typography.headingFont, {
    x: 1.1,
    y: 2.45,
    w: 5.0,
    h: 0.6,
    fontSize: 28,
    fontFace: headingFont,
    color: darkHex,
    bold: true,
  });

  slide6.addText(`Classification: ${brand.typography.headingFontCategory || 'Editorial Display'}`, {
    x: 1.1,
    y: 3.1,
    w: 5.0,
    h: 0.3,
    fontSize: 11,
    fontFace: bodyFont,
    color: '64748B',
  });

  slide6.addText('Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz\n0123456789 &?!@#$%', {
    x: 1.1,
    y: 3.5,
    w: 5.0,
    h: 1.2,
    fontSize: 16,
    fontFace: headingFont,
    color: darkHex,
    lineSpacingMultiple: 1.3,
  });

  slide6.addText('Usage Guidelines:\n• Reserved strictly for H1-H3 headlines, hero statements, and packaging titles.\n• Never apply wide tracking to lowercase editorial copy.', {
    x: 1.1,
    y: 4.9,
    w: 5.0,
    h: 1.4,
    fontSize: 11,
    fontFace: bodyFont,
    color: '334155',
    lineSpacingMultiple: 1.2,
  });

  // Right: Body Typeface Specimen
  slide6.addShape(pptx.ShapeType.roundRect, {
    x: 6.9,
    y: 1.8,
    w: 5.6,
    h: 4.8,
    rectRadius: 0.1,
    fill: { color: 'FAFAFA' },
    line: { color: 'E2E8F0', width: 1 },
  });

  slide6.addText('PRIMARY BODY & INTERFACE TYPEFACE', {
    x: 7.2,
    y: 2.1,
    w: 5.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 2,
  });

  slide6.addText(brand.typography.bodyFont, {
    x: 7.2,
    y: 2.45,
    w: 5.0,
    h: 0.6,
    fontSize: 28,
    fontFace: bodyFont,
    color: darkHex,
    bold: true,
  });

  slide6.addText(`Classification: ${brand.typography.bodyFontCategory || 'Contemporary Neutral Sans'}`, {
    x: 7.2,
    y: 3.1,
    w: 5.0,
    h: 0.3,
    fontSize: 11,
    fontFace: bodyFont,
    color: '64748B',
  });

  slide6.addText('Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz\n0123456789 &?!@#$%', {
    x: 7.2,
    y: 3.5,
    w: 5.0,
    h: 1.2,
    fontSize: 16,
    fontFace: bodyFont,
    color: darkHex,
    lineSpacingMultiple: 1.3,
  });

  slide6.addText('Usage Guidelines:\n• Optimized for paragraphs, metadata, product UI, and digital dashboards.\n• Maximum line length: 65-75 characters for optimal legibility.', {
    x: 7.2,
    y: 4.9,
    w: 5.0,
    h: 1.4,
    fontSize: 11,
    fontFace: bodyFont,
    color: '334155',
    lineSpacingMultiple: 1.2,
  });

  // ==========================================
  // SLIDE 7: COMMERCIAL PHOTOGRAPHY DIRECTION
  // ==========================================
  const slide7 = pptx.addSlide();
  slide7.background = { color: darkHex };

  slide7.addText('06 / ART DIRECTION & PHOTOGRAPHY', {
    x: 0.8,
    y: 0.6,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: accentHex,
    bold: true,
    charSpacing: 3,
  });

  slide7.addText('Commercial Optical Standards & Environmental Lighting', {
    x: 0.8,
    y: 0.9,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    fontFace: headingFont,
    color: 'FFFFFF',
    bold: true,
  });

  const photoRules = [
    {
      title: 'Full-Frame Camera Optics',
      desc: '35mm, 50mm, and 85mm prime lenses with controlled shallow depth of field (f/1.8 - f/2.8). Natural bokeh falloff preserving focal subject clarity.',
    },
    {
      title: 'Controlled Lighting Physics',
      desc: 'Soft architectural key lighting with subtle rim contrast. Neutral 5400K daylight or warm interior 3200K tungsten balance. No harsh unnatural flashes.',
    },
    {
      title: 'Authentic Physical Materials',
      desc: 'Emphasize tactile textures: natural matte paper stocks, brushed anodized aluminum, woven linens, architectural stone, and true reflections.',
    },
    {
      title: 'Color Grading & White Balance',
      desc: `Incorporate brand palette undertones (${brand.palette[0]?.name || 'Primary'}). Rich shadow details with non-clipped specular highlights.`,
    },
  ];

  photoRules.forEach((pr, idx) => {
    const px = 0.8 + (idx % 2) * 6.0;
    const py = 1.8 + Math.floor(idx / 2) * 2.5;

    slide7.addShape(pptx.ShapeType.roundRect, {
      x: px,
      y: py,
      w: 5.7,
      h: 2.2,
      rectRadius: 0.1,
      fill: { color: '1F2937' },
      line: { color: '374151', width: 1 },
    });

    slide7.addText(`0${idx + 1} • ${pr.title.toUpperCase()}`, {
      x: px + 0.3,
      y: py + 0.25,
      w: 5.1,
      h: 0.3,
      fontSize: 11,
      fontFace: bodyFont,
      color: accentHex,
      bold: true,
      charSpacing: 1,
    });

    slide7.addText(pr.desc, {
      x: px + 0.3,
      y: py + 0.65,
      w: 5.1,
      h: 1.3,
      fontSize: 12,
      fontFace: bodyFont,
      color: lightHex,
      lineSpacingMultiple: 1.2,
    });
  });

  // ==========================================
  // SLIDE 8: BRAND APPLICATIONS & TOUCHPOINTS
  // ==========================================
  const slide8 = pptx.addSlide();
  slide8.background = { color: 'FFFFFF' };

  slide8.addText('07 / MULTI-CHANNEL APPLICATIONS', {
    x: 0.8,
    y: 0.6,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 3,
  });

  slide8.addText('Cross-Platform Brand Touchpoint Standards', {
    x: 0.8,
    y: 0.9,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    fontFace: headingFont,
    color: darkHex,
    bold: true,
  });

  const touchpoints = [
    { title: 'Digital Platform & Web', rule: 'Responsive minimalist layouts, high-contrast typography, accessible color ratios, and fluid interactions.' },
    { title: 'Packaging & Merchandise', rule: 'Minimalist sustainable materials with debossed, foiled, or screen-printed primary marks.' },
    { title: 'Stationery & Executive Suite', rule: 'Heavyweight matte cotton cardstock (350+ gsm) with precise edge finishing and crisp typographical alignment.' },
    { title: 'Large Scale & Environmental', rule: 'High-contrast architectural signage, monumental billboard typography, and clean directional signage.' },
  ];

  touchpoints.forEach((tp, idx) => {
    const ty = 1.8 + idx * 1.2;
    slide8.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: ty,
      w: 11.7,
      h: 1.0,
      rectRadius: 0.1,
      fill: { color: 'F8FAFC' },
      line: { color: 'E2E8F0', width: 1 },
    });

    slide8.addText(tp.title.toUpperCase(), {
      x: 1.1,
      y: ty + 0.18,
      w: 3.5,
      h: 0.3,
      fontSize: 11,
      fontFace: headingFont,
      color: primaryHex,
      bold: true,
    });

    slide8.addText(tp.rule, {
      x: 4.8,
      y: ty + 0.18,
      w: 7.4,
      h: 0.65,
      fontSize: 11,
      fontFace: bodyFont,
      color: '334155',
      lineSpacingMultiple: 1.2,
    });
  });

  // ==========================================
  // SLIDE 9: SOCIAL & CONTENT STRATEGY
  // ==========================================
  const slide9 = pptx.addSlide();
  slide9.background = { color: 'FFFFFF' };

  slide9.addText('08 / CONTENT & MOTION ARCHITECTURE', {
    x: 0.8,
    y: 0.6,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 3,
  });

  slide9.addText('Multi-Channel Social & Motion Assets', {
    x: 0.8,
    y: 0.9,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    fontFace: headingFont,
    color: darkHex,
    bold: true,
  });

  // 3 Columns: Instagram / LinkedIn / Short-form Video
  const channels = [
    {
      name: 'Instagram & Visual Feed',
      format: '1:1 Square & 9:16 Stories',
      desc: 'High-contrast quote graphics, full-bleed editorial imagery, and brand-aligned carousel slides showcasing thought leadership.',
    },
    {
      name: 'LinkedIn & Professional',
      format: 'Document Carousels & Feed',
      desc: 'Deep strategic manifestos, data graphics, mission updates, and industry perspective carousels reinforcing authority.',
    },
    {
      name: 'TikTok & Kinetic Video',
      format: '9:16 Vertical Video (60fps)',
      desc: 'Punchy 3-second opening hook scripts, rhythmic kinetic typography, ambient audio pairings, and high-impact logo reveals.',
    },
  ];

  channels.forEach((ch, idx) => {
    const cx = 0.8 + idx * 4.0;
    slide9.addShape(pptx.ShapeType.roundRect, {
      x: cx,
      y: 1.8,
      w: 3.7,
      h: 4.8,
      rectRadius: 0.1,
      fill: { color: 'F8FAFC' },
      line: { color: 'CBD5E1', width: 1 },
    });

    slide9.addText(ch.name, {
      x: cx + 0.3,
      y: 2.1,
      w: 3.1,
      h: 0.4,
      fontSize: 14,
      fontFace: headingFont,
      color: darkHex,
      bold: true,
    });

    slide9.addText(ch.format, {
      x: cx + 0.3,
      y: 2.55,
      w: 3.1,
      h: 0.3,
      fontSize: 10,
      fontFace: bodyFont,
      color: primaryHex,
      bold: true,
    });

    slide9.addText(ch.desc, {
      x: cx + 0.3,
      y: 3.0,
      w: 3.1,
      h: 3.2,
      fontSize: 12,
      fontFace: bodyFont,
      color: '475569',
      lineSpacingMultiple: 1.3,
    });
  });

  // ==========================================
  // SLIDE 10: BRAND GOVERNANCE & ASSET INTEGRITY
  // ==========================================
  const slide10 = pptx.addSlide();
  slide10.background = { color: 'FFFFFF' };

  slide10.addText('09 / GOVERNANCE & INTEGRITY', {
    x: 0.8,
    y: 0.6,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    fontFace: bodyFont,
    color: primaryHex,
    bold: true,
    charSpacing: 3,
  });

  slide10.addText('Brand Dos and Don’ts / Clearspace Rules', {
    x: 0.8,
    y: 0.9,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    fontFace: headingFont,
    color: darkHex,
    bold: true,
  });

  // Approved Practices (Green tint)
  slide10.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.8,
    w: 5.6,
    h: 4.8,
    rectRadius: 0.1,
    fill: { color: 'F0FDF4' },
    line: { color: '86EFAC', width: 1 },
  });

  slide10.addText('APPROVED MANDATES (DO)', {
    x: 1.1,
    y: 2.1,
    w: 5.0,
    h: 0.3,
    fontSize: 11,
    fontFace: bodyFont,
    color: '15803D',
    bold: true,
    charSpacing: 2,
  });

  const dos = [
    'Maintain mandatory 1X clearspace boundary on all 4 borders of the logomark.',
    `Place marks only on high-contrast approved backgrounds (#${lightHex}, #${darkHex}, #${primaryHex}).`,
    'Always scale marks proportionally at 1:1 aspect ratio with locked constraints.',
    `Reserve ${brand.typography.headingFont} strictly for primary display titles.`,
    'Ensure WCAG AA contrast compliance (minimum 4.5:1 ratio) on all live touchpoints.',
  ];

  dos.forEach((d, idx) => {
    slide10.addText(`[APPROVED]  ${d}`, {
      x: 1.1,
      y: 2.5 + idx * 0.8,
      w: 5.0,
      h: 0.7,
      fontSize: 11,
      fontFace: bodyFont,
      color: '166534',
      lineSpacingMultiple: 1.2,
    });
  });

  // Prohibited Distortions (Red tint)
  slide10.addShape(pptx.ShapeType.roundRect, {
    x: 6.9,
    y: 1.8,
    w: 5.6,
    h: 4.8,
    rectRadius: 0.1,
    fill: { color: 'FEF2F2' },
    line: { color: 'FECACA', width: 1 },
  });

  slide10.addText('PROHIBITED EXECUTIONS (DON’T)', {
    x: 7.2,
    y: 2.1,
    w: 5.0,
    h: 0.3,
    fontSize: 11,
    fontFace: bodyFont,
    color: 'B91C1C',
    bold: true,
    charSpacing: 2,
  });

  const donts = [
    'Never stretch, condense, skew, or distort the logo aspect ratio.',
    'Never apply drop shadows, glowing halos, bevels, or unapproved filter effects.',
    'Never rotate, tilt, or alter the geometry and orientation of the visual marks.',
    'Never recolor marks with unapproved non-brand gradients or neon combinations.',
    'Never place low-contrast gray text on tinted, patterned, or dark surfaces.',
  ];

  donts.forEach((d, idx) => {
    slide10.addText(`[RESTRICTED]  ${d}`, {
      x: 7.2,
      y: 2.5 + idx * 0.8,
      w: 5.0,
      h: 0.7,
      fontSize: 11,
      fontFace: bodyFont,
      color: '991B1B',
      lineSpacingMultiple: 1.2,
    });
  });

  // Trigger download in browser
  const filename = `${brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-brand-pitch-deck.pptx`;
  await pptx.writeFile({ fileName: filename });
}
