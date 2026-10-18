import { BrandBible } from '../types';

/**
 * Generates a self-contained, responsive, beautifully styled HTML Brand Dossier document.
 * This standalone HTML file can be opened in any browser, emailed to clients, or hosted
 * as an interactive web presentation of the brand bible without needing a server.
 */
export function generateVisualBrandDossierHtml(brand: BrandBible): string {
  const primaryColor = brand.palette.find((c) => c.role === 'Primary')?.hex || '#1E40AF';
  const secondaryColor = brand.palette.find((c) => c.role === 'Secondary')?.hex || '#3B82F6';
  const accentColor = brand.palette.find((c) => c.role === 'Accent')?.hex || '#F59E0B';
  const lightColor = brand.palette.find((c) => c.role.includes('Light'))?.hex || '#F9F7F2';
  const darkColor = brand.palette.find((c) => c.role.includes('Dark'))?.hex || '#111827';

  const headingFont = brand.typography?.headingFont || 'Plus Jakarta Sans';
  const bodyFont = brand.typography?.bodyFont || 'Inter';

  // Palette swatches HTML
  const paletteHtml = brand.palette
    .map(
      (c) => `
      <div class="color-card">
        <div class="swatch" style="background-color: ${c.hex};"></div>
        <div class="swatch-details">
          <span class="role-tag">${c.role}</span>
          <h4>${c.name}</h4>
          <code>${c.hex.toUpperCase()}</code>
          <p class="usage">${c.usage || ''}</p>
        </div>
      </div>
    `
    )
    .join('');

  // Values HTML
  const valuesHtml = brand.values
    .map(
      (v, idx) => `
      <div class="value-card">
        <span class="val-num">0${idx + 1}</span>
        <h4>${v.title}</h4>
        <p>${v.description}</p>
      </div>
    `
    )
    .join('');

  // Traits HTML
  const traitsHtml = brand.personalityTraits
    .map(
      (t) => `
      <div class="trait-row">
        <span class="trait-name">${t.trait}</span>
        <span class="trait-min">${t.minLabel}</span>
        <div class="trait-bar-track">
          <div class="trait-bar-fill" style="width: ${(t.rating / 5) * 100}%;"></div>
        </div>
        <span class="trait-max">${t.maxLabel}</span>
        <span class="trait-rating">${t.rating}/5</span>
      </div>
    `
    )
    .join('');

  // Photography & Art Direction
  const photoRules = [
    { title: 'Optical Standard', desc: 'Full-frame camera body, 35mm / 50mm / 85mm prime optics with natural optical falloff.' },
    { title: 'Lighting Atmosphere', desc: 'Soft directional daylight (5400K) or balanced architectural key lighting with natural shadow gradients.' },
    { title: 'Tactile Materials', desc: 'Authentic physical textures: natural matte paper, brushed anodized metal, woven linen, architectural stone.' },
    { title: 'Color Calibration', desc: `Harmonized color grading infusing primary brand tones (${primaryColor}) and true-to-life white balance.` },
  ];
  const photoHtml = photoRules
    .map(
      (p, i) => `
      <div class="photo-card">
        <span class="photo-idx">0${i + 1}</span>
        <h5>${p.title}</h5>
        <p>${p.desc}</p>
      </div>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand.brandName} — Brand Identity Dossier</title>
  <meta name="description" content="${brand.tagline} — Official Brand Identity System created with GABI">
  <style>
    :root {
      --primary: ${primaryColor};
      --secondary: ${secondaryColor};
      --accent: ${accentColor};
      --light: ${lightColor};
      --dark: ${darkColor};
      --bg: #FAF9F6;
      --card-bg: #FFFFFF;
      --text: #1A1A1A;
      --text-muted: #64748B;
      --border: #E2E8F0;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #121212;
        --card-bg: #1A1A1A;
        --text: #F9F7F2;
        --text-muted: #94A3B8;
        --border: #2D2D2D;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: '${bodyFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 0;
      margin: 0;
    }
    header {
      padding: 4rem 2rem;
      background: var(--dark);
      color: #FFFFFF;
      border-bottom: 3px solid var(--primary);
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    .header-meta {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.3em;
      color: var(--accent);
      font-weight: 700;
      margin-bottom: 1rem;
    }
    h1 {
      font-family: '${headingFont}', Georgia, serif;
      font-size: 3.5rem;
      letter-spacing: -0.03em;
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 0.75rem;
    }
    .tagline {
      font-size: 1.35rem;
      opacity: 0.9;
      font-style: italic;
      margin-bottom: 2rem;
    }
    .meta-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.8rem;
    }
    .badge {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      padding: 0.35rem 0.75rem;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
    main {
      padding: 3rem 2rem 6rem;
    }
    section {
      margin-bottom: 4rem;
    }
    .section-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.75rem;
      margin-bottom: 1.75rem;
    }
    .section-header h2 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      font-weight: 800;
      color: var(--primary);
    }
    .section-header span {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: monospace;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.75rem;
    }
    .card h3 {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }
    .card p {
      font-size: 1.05rem;
      color: var(--text);
    }
    /* Logo Showcase */
    .logo-stage {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 3rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .logo-container {
      max-width: 380px;
      width: 100%;
      height: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .logo-container svg {
      max-width: 100%;
      max-height: 100%;
      height: auto;
    }
    /* Palette */
    .palette-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }
    .color-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .swatch {
      height: 120px;
      width: 100%;
    }
    .swatch-details {
      padding: 1rem;
    }
    .role-tag {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-weight: 700;
      color: var(--text-muted);
      display: block;
      margin-bottom: 0.25rem;
    }
    .swatch-details h4 {
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }
    .swatch-details code {
      font-size: 0.85rem;
      font-family: monospace;
      font-weight: 700;
      color: var(--primary);
    }
    .swatch-details .usage {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
    }
    /* Values */
    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
    }
    .value-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.5rem;
    }
    .val-num {
      font-size: 1.25rem;
      font-family: monospace;
      font-weight: 800;
      color: var(--primary);
      display: block;
      margin-bottom: 0.5rem;
    }
    .value-card h4 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
    .value-card p {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    /* Traits */
    .traits-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .trait-row {
      display: grid;
      grid-template-columns: 140px 100px 1fr 100px 50px;
      align-items: center;
      gap: 1rem;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.85rem 1.25rem;
      font-size: 0.85rem;
    }
    .trait-name {
      font-weight: 700;
    }
    .trait-min, .trait-max {
      color: var(--text-muted);
      font-size: 0.75rem;
    }
    .trait-min { text-align: right; }
    .trait-bar-track {
      background: var(--border);
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    .trait-bar-fill {
      background: var(--primary);
      height: 100%;
    }
    .trait-rating {
      font-family: monospace;
      font-weight: 700;
      color: var(--primary);
      text-align: right;
    }
    /* Typography */
    .type-specimen {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 1.5rem;
    }
    .type-specimen h3 {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .type-specimen .font-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .type-specimen .alphabet {
      font-size: 1.2rem;
      opacity: 0.85;
      line-height: 1.5;
      margin-bottom: 1rem;
    }
    /* Photography */
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
    }
    .photo-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.5rem;
    }
    .photo-idx {
      font-family: monospace;
      font-weight: 800;
      font-size: 0.85rem;
      color: var(--accent);
      display: block;
      margin-bottom: 0.5rem;
    }
    .photo-card h5 {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
    .photo-card p {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    footer {
      border-top: 1px solid var(--border);
      padding: 3rem 2rem;
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    @media (max-width: 768px) {
      h1 { font-size: 2.5rem; }
      .trait-row {
        grid-template-columns: 1fr;
        gap: 0.35rem;
      }
      .trait-min, .trait-max { text-align: left; }
    }
    @media print {
      body { background: white; color: black; }
      header { background: white; color: black; border-bottom: 2px solid black; }
      .card, .color-card, .value-card, .trait-row, .type-specimen, .photo-card {
        border-color: #ccc;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="header-meta">Brand Identity Bible &bull; ${brand.industry}</div>
      <h1>${brand.brandName}</h1>
      <p class="tagline">"${brand.tagline}"</p>
      <div class="meta-badges">
        <span class="badge">Official Brand Dossier</span>
        <span class="badge">CONFIDENTIAL</span>
        <span class="badge">${new Date().getFullYear()} Edition</span>
        <span class="badge">Created with GABI</span>
      </div>
    </div>
  </header>

  <main class="container">
    <!-- Strategic Positioning -->
    <section>
      <div class="section-header">
        <h2>01 / Strategic Foundation</h2>
        <span>Mission &bull; Vision &bull; Positioning</span>
      </div>
      <div class="grid-2">
        <div class="card">
          <h3>Core Mission</h3>
          <p>${brand.mission}</p>
        </div>
        <div class="card">
          <h3>Long-Term Vision</h3>
          <p>${brand.vision}</p>
        </div>
      </div>
      <div class="card" style="margin-top: 1.5rem; border-left: 4px solid var(--primary);">
        <h3>Strategic Market Positioning</h3>
        <p style="font-size: 1.2rem; font-style: italic; margin-bottom: 0.5rem;">"${brand.positioningStatement}"</p>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Target Audience: ${brand.targetAudience}</p>
      </div>
    </section>

    <!-- Visual Identity & Logo -->
    <section>
      <div class="section-header">
        <h2>02 / Visual Identity</h2>
        <span>Primary Logomark &bull; Mark Geometry</span>
      </div>
      <div class="logo-stage">
        <div class="logo-container">
          ${brand.logo?.primaryLogoSvg || `<h2>${brand.brandName}</h2>`}
        </div>
        <h3 style="font-size: 1.2rem; margin-bottom: 0.25rem;">${brand.brandName} Primary Mark</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; max-w: 600px;">
          ${brand.logo?.concept || 'Primary identity mark engineered for high-contrast digital and physical reproduction.'}
        </p>
      </div>
    </section>

    <!-- Color Palette -->
    <section>
      <div class="section-header">
        <h2>03 / Color System</h2>
        <span>5-Color Harmony Palette</span>
      </div>
      <div class="palette-grid">
        ${paletteHtml}
      </div>
    </section>

    <!-- Typography -->
    <section>
      <div class="section-header">
        <h2>04 / Typographic Hierarchy</h2>
        <span>Display &amp; Body Pairings</span>
      </div>
      <div class="type-specimen">
        <h3>Display Headline Typeface</h3>
        <div class="font-title" style="font-family: '${headingFont}', serif;">${brand.typography.headingFont}</div>
        <div class="alphabet" style="font-family: '${headingFont}', serif;">
          Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz<br>
          0123456789 (!@#$%^&amp;*)
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          Category: ${brand.typography.headingFontCategory || 'Display'} &bull; Primary application: H1-H3 headlines, hero titles, billboard campaigns.
        </p>
      </div>
      <div class="type-specimen">
        <h3>Body &amp; Interface Typeface</h3>
        <div class="font-title" style="font-family: '${bodyFont}', sans-serif;">${brand.typography.bodyFont}</div>
        <div class="alphabet" style="font-family: '${bodyFont}', sans-serif;">
          Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz<br>
          0123456789 (!@#$%^&amp;*)
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          Category: ${brand.typography.bodyFontCategory || 'Sans-Serif'} &bull; Primary application: Long-form paragraphs, interface labels, metadata.
        </p>
      </div>
    </section>

    <!-- Values & Personality -->
    <section>
      <div class="section-header">
        <h2>05 / Core Values &amp; Character</h2>
        <span>Guiding Principles</span>
      </div>
      <div class="values-grid">
        ${valuesHtml}
      </div>
      <div style="margin-top: 2rem;">
        <h3 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--text-muted); margin-bottom: 1rem;">
          Personality Calibration
        </h3>
        <div class="traits-list">
          ${traitsHtml}
        </div>
      </div>
    </section>

    <!-- Photography & Commercial Direction -->
    <section>
      <div class="section-header">
        <h2>06 / Art Direction &amp; Photography</h2>
        <span>Commercial Optical Direction</span>
      </div>
      <div class="photo-grid">
        ${photoHtml}
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <p><strong>${brand.brandName} Brand Identity System</strong> &bull; Generated via GABI Creative Direction Platform</p>
      <p style="margin-top: 0.5rem; font-size: 0.75rem;">All rights reserved &bull; Confidential and proprietary brand guidelines</p>
    </div>
  </footer>
</body>
</html>`;
}

/**
 * Initiates the download of the standalone Visual Brand Dossier HTML file
 */
export function downloadVisualBrandDossier(brand: BrandBible): void {
  const htmlContent = generateVisualBrandDossierHtml(brand);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-visual-brand-dossier.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens the Visual Brand Dossier in a new browser window/tab
 */
export function openVisualBrandDossierInNewTab(brand: BrandBible): void {
  const htmlContent = generateVisualBrandDossierHtml(brand);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
