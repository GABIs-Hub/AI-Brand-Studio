import JSZip from 'jszip';
import { BrandBible } from '../types';
import { extractCleanSvgText } from './imageExport';
import { FAVICON_SPECS, renderSvgToCanvas, canvasToBlob, createMultiSizeIco, FaviconRenderOptions } from './faviconUtils';

export interface AssetKitProgress {
  step: string;
  percent: number;
}

/**
 * Creates SVG color variations:
 * - Original color
 * - Monochrome black (#111827)
 * - Monochrome white (#FFFFFF)
 */
export function createSvgVariant(svgString: string, variant: 'original' | 'dark' | 'light'): string {
  const clean = extractCleanSvgText(svgString);
  if (variant === 'original') return clean;

  const targetColor = variant === 'dark' ? '#111827' : '#FFFFFF';

  // Replace fills and strokes that are not 'none' or 'transparent'
  let modified = clean.replace(/fill="(?!(?:none|transparent|url\())[^"]+"/gi, `fill="${targetColor}"`);
  modified = modified.replace(/stroke="(?!(?:none|transparent|url\())[^"]+"/gi, `stroke="${targetColor}"`);
  modified = modified.replace(/style="([^"]*)"/gi, (match, styleContent) => {
    let s = styleContent.replace(/fill:\s*(?!(?:none|transparent|url\())[^;]+;?/gi, `fill: ${targetColor};`);
    s = s.replace(/stroke:\s*(?!(?:none|transparent|url\())[^;]+;?/gi, `stroke: ${targetColor};`);
    return `style="${s}"`;
  });
  return modified;
}

/**
 * Renders SVG to a PNG blob at specified dimension with transparent or custom background
 */
export function renderSvgToPngBlob(
  svgString: string,
  width: number,
  height: number,
  bgColor: string | null = null
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const cleanSvg = extractCleanSvgText(svgString);
      const svgBlob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        if (bgColor) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.clearRect(0, 0, width, height);
        }

        // Draw with 10% outer safe margin
        const padding = width * 0.08;
        const drawW = width - padding * 2;
        const drawH = height - padding * 2;

        ctx.drawImage(img, padding, padding, drawW, drawH);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('SVG image failed to load for rasterization'));
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates a complete production-grade Brand Asset ZIP Package
 */
export async function generateFullBrandAssetKitZip(
  brand: BrandBible,
  onProgress?: (progress: AssetKitProgress) => void
): Promise<Blob> {
  const zip = new JSZip();
  const brandSlug = brand.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'brand';

  onProgress?.({ step: 'Preparing vector SVG logos...', percent: 10 });

  // 1. Root / Vectors Folder
  const vectorsFolder = zip.folder('01_Vector_Logos');
  const primarySvg = brand.logo.primaryLogoSvg;
  const darkSvg = createSvgVariant(primarySvg, 'dark');
  const lightSvg = createSvgVariant(primarySvg, 'light');

  vectorsFolder?.file(`${brandSlug}-logo-primary.svg`, primarySvg);
  vectorsFolder?.file(`${brandSlug}-logo-monochrome-dark.svg`, darkSvg);
  vectorsFolder?.file(`${brandSlug}-logo-monochrome-white.svg`, lightSvg);

  // Secondary marks
  if (brand.secondaryMarks && brand.secondaryMarks.length > 0) {
    brand.secondaryMarks.forEach((mark, idx) => {
      const markSlug = mark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `mark-${idx + 1}`;
      vectorsFolder?.file(`${brandSlug}-secondary-${markSlug}.svg`, mark.svg);
    });
  }

  onProgress?.({ step: 'Generating transparent PNG raster suites...', percent: 30 });

  // 2. Raster PNG Folder (Transparent and background variants)
  const rastersFolder = zip.folder('02_High_Res_PNGs');
  const primaryHex = brand.palette[0]?.hex || '#1E40AF';
  const darkHex = brand.palette.find(c => c.role.includes('Dark'))?.hex || '#111827';

  // Transparent master sizes
  const sizes = [
    { size: 1024, name: '1024x1024_master_transparent' },
    { size: 512, name: '512x512_transparent' },
    { size: 256, name: '256x256_transparent' },
    { size: 128, name: '128x128_transparent' },
  ];

  for (const s of sizes) {
    try {
      const blob = await renderSvgToPngBlob(primarySvg, s.size, s.size, null);
      rastersFolder?.file(`${brandSlug}-logo-${s.name}.png`, blob);
    } catch (e) {
      console.warn(`Could not render size ${s.size}`, e);
    }
  }

  // Solid background previews
  try {
    const whiteBgBlob = await renderSvgToPngBlob(primarySvg, 1024, 1024, '#FFFFFF');
    rastersFolder?.file(`${brandSlug}-logo-1024x1024_white_bg.png`, whiteBgBlob);

    const darkBgBlob = await renderSvgToPngBlob(lightSvg, 1024, 1024, darkHex);
    rastersFolder?.file(`${brandSlug}-logo-1024x1024_dark_bg.png`, darkBgBlob);

    const brandBgBlob = await renderSvgToPngBlob(lightSvg, 1024, 1024, primaryHex);
    rastersFolder?.file(`${brandSlug}-logo-1024x1024_brand_color_bg.png`, brandBgBlob);
  } catch (e) {
    console.warn('Solid preview generation error', e);
  }

  onProgress?.({ step: 'Generating Web Favicon & Mobile App Icon suite...', percent: 60 });

  // 3. Web & App Icons Folder
  const webIconsFolder = zip.folder('03_Web_And_App_Favicons');
  const faviconOptions: FaviconRenderOptions = {
    background: 'transparent',
    paddingPercent: 12,
    borderRadiusPercent: 0,
  };
  const brandColors = {
    primary: primaryHex,
    dark: darkHex,
    light: brand.palette.find(c => c.role.includes('Light'))?.hex || '#F9F7F2',
  };

  try {
    for (const spec of FAVICON_SPECS) {
      const canvas = await renderSvgToCanvas(primarySvg, spec.size, faviconOptions, brandColors);
      const blob = await canvasToBlob(canvas);
      webIconsFolder?.file(spec.name, blob);
    }

    const icoBlob = await createMultiSizeIco(primarySvg, faviconOptions, brandColors);
    if (icoBlob) {
      webIconsFolder?.file('favicon.ico', icoBlob);
    }

    // Web App Manifest
    const manifest = {
      name: brand.brandName,
      short_name: brand.brandName,
      description: brand.tagline,
      start_url: '/',
      display: 'standalone',
      background_color: brandColors.light,
      theme_color: brandColors.primary,
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
      ]
    };
    webIconsFolder?.file('site.webmanifest', JSON.stringify(manifest, null, 2));

    // HTML Snippet for head
    const htmlHeadSnippet = `<!-- Favicon and App Icons for ${brand.brandName} -->\n` +
      `<link rel="icon" type="image/x-icon" href="/favicon.ico">\n` +
      `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n` +
      `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n` +
      `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n` +
      `<link rel="manifest" href="/site.webmanifest">\n` +
      `<meta name="theme-color" content="${brandColors.primary}">\n`;
    webIconsFolder?.file('FAVICON_HTML_SNIPPET.html', htmlHeadSnippet);
  } catch (err) {
    console.warn('Favicon asset package notice:', err);
  }

  onProgress?.({ step: 'Compiling Developer Design System Tokens...', percent: 80 });

  // 4. Design System Tokens Folder
  const tokensFolder = zip.folder('04_Design_System_Tokens');

  // CSS Variables
  const cssString = `:root {\n` +
    `  /* ${brand.brandName} Design Tokens */\n` +
    brand.palette
      .map((c) => `  --color-brand-${c.role.toLowerCase().replace(/\s+/g, '-')}: ${c.hex}; /* ${c.name} */`)
      .join('\n') +
    `\n\n  /* Typography */\n` +
    `  --font-heading: '${brand.typography.headingFont}', serif;\n` +
    `  --font-body: '${brand.typography.bodyFont}', sans-serif;\n` +
    `}\n`;
  tokensFolder?.file('brand-tokens.css', cssString);

  // Tailwind config
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n` +
    brand.palette.map((c) => `        'brand-${c.role.toLowerCase().replace(/\s+/g, '-')}': '${c.hex}', // ${c.name}`).join('\n') +
    `\n      },\n      fontFamily: {\n` +
    `        'heading': ['"${brand.typography.headingFont}"', 'serif'],\n` +
    `        'body': ['"${brand.typography.bodyFont}"', 'sans-serif'],\n` +
    `      }\n    }\n  }\n};\n`;
  tokensFolder?.file('tailwind.config.js', tailwindConfig);

  // SCSS Variables
  const scssString = `// ${brand.brandName} SCSS Variables\n` +
    brand.palette.map(c => `$color-brand-${c.role.toLowerCase().replace(/\s+/g, '-')}: ${c.hex};`).join('\n') +
    `\n$font-heading: '${brand.typography.headingFont}', serif;\n` +
    `$font-body: '${brand.typography.bodyFont}', sans-serif;\n`;
  tokensFolder?.file('brand-tokens.scss', scssString);

  // JSON Tokens
  const jsonTokens = {
    brandName: brand.brandName,
    colors: brand.palette.reduce((acc, c) => {
      acc[c.role.toLowerCase().replace(/\s+/g, '_')] = {
        name: c.name,
        hex: c.hex,
        rgb: c.rgb,
        usage: c.usage
      };
      return acc;
    }, {} as Record<string, any>),
    typography: {
      headingFont: brand.typography.headingFont,
      headingCategory: brand.typography.headingFontCategory,
      bodyFont: brand.typography.bodyFont,
      bodyCategory: brand.typography.bodyFontCategory,
      googleFontsUrl: brand.typography.googleFontsUrl
    }
  };
  tokensFolder?.file('brand-tokens.json', JSON.stringify(jsonTokens, null, 2));

  onProgress?.({ step: 'Generating Brand Guidelines & Metadata Dossier...', percent: 95 });

  // 5. Documentation & Metadata
  zip.file(`${brandSlug}-brand-bible.json`, JSON.stringify(brand, null, 2));

  const markdownGuidelines = `# ${brand.brandName} — Brand Identity & Guidelines\n\n` +
    `> **"${brand.tagline}"**\n\n` +
    `**Industry:** ${brand.industry}  \n` +
    `**Generated:** ${new Date(brand.createdAt).toLocaleDateString()}  \n\n` +
    `---\n\n` +
    `## 1. Brand Strategic Foundation\n\n` +
    `### Mission\n${brand.mission}\n\n` +
    `### Vision\n${brand.vision}\n\n` +
    `### Positioning Statement\n${brand.positioningStatement}\n\n` +
    `---\n\n` +
    `## 2. 5-Color Semantic Palette\n\n` +
    brand.palette.map((c) => `- **${c.role} (${c.name}):** \`${c.hex}\` (RGB: ${c.rgb}) — *${c.usage}*`).join('\n') +
    `\n\n---\n\n` +
    `## 3. Typography Hierarchy\n\n` +
    `- **Primary Display Font:** ${brand.typography.headingFont} (${brand.typography.headingFontCategory})\n` +
    `- **Body Text Font:** ${brand.typography.bodyFont} (${brand.typography.bodyFontCategory})\n` +
    `- **Google Fonts Embed Link:** [Load Google Font](${brand.typography.googleFontsUrl})\n\n` +
    `---\n\n` +
    `## 4. Brand Voice & Personality\n\n` +
    brand.toneOfVoice.map((t) => `- **${t.trait}:** ${t.description}\n  - *Do:* "${t.doExample}"\n  - *Don't:* "${t.dontExample}"`).join('\n\n') +
    `\n\n---\n\n` +
    `## 5. Core Values\n\n` +
    brand.values.map((v) => `### ${v.title}\n${v.description}\n`).join('\n') +
    `\n---\n\n` +
    `*Generated with GABI — Generate. Align. Build. Inspire.*\n`;

  zip.file('BRAND_GUIDELINES.md', markdownGuidelines);

  onProgress?.({ step: 'Finalizing ZIP compression archive...', percent: 100 });
  return await zip.generateAsync({ type: 'blob' });
}
