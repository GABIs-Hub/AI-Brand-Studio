import { BrandBible } from '../types';

/**
 * Formats a clean, readable text snippet summary of a Brand Bible
 * suitable for sharing via Web Share API or copying to clipboard.
 */
export function formatBrandSummarySnippet(brand: BrandBible): string {
  const paletteSummary = brand.palette
    .map((c) => `  • ${c.role}: ${c.name} (${c.hex}) - ${c.usage}`)
    .join('\n');

  const valuesSummary = brand.values
    .map((v) => `  • ${v.title}: ${v.description}`)
    .join('\n');

  const traitsSummary = brand.personalityTraits
    .map((t) => `  • ${t.trait}: ${t.minLabel} ◄───► ${t.maxLabel} (${t.rating}/5)`)
    .join('\n');

  return [
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `✨ BRAND DOSSIER: ${brand.brandName.toUpperCase()}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Industry: ${brand.industry}`,
    `Tagline: "${brand.tagline}"`,
    ``,
    `📌 CORE MISSION:`,
    `${brand.mission}`,
    ``,
    `🔭 LONG-TERM VISION:`,
    `${brand.vision}`,
    ``,
    `🎯 STRATEGIC POSITIONING:`,
    `${brand.positioningStatement}`,
    `Target Audience: ${brand.targetAudience}`,
    ``,
    `🎨 5-COLOR HARMONY PALETTE:`,
    paletteSummary,
    ``,
    `🔤 TYPOGRAPHY PAIRINGS:`,
    `  • Heading: ${brand.typography.headingFont} (${brand.typography.headingFontCategory})`,
    `  • Body: ${brand.typography.bodyFont} (${brand.typography.bodyFontCategory})`,
    ``,
    `💎 CORE BRAND VALUES:`,
    valuesSummary,
    ``,
    `⚖️ PERSONALITY SPECTRUM:`,
    traitsSummary,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Created with Brand Studio AI`,
  ].join('\n');
}

export interface ShareResult {
  success: boolean;
  method?: 'native-share' | 'clipboard';
  aborted?: boolean;
  error?: any;
}

/**
 * Invokes the Web Share API if supported on the user device/browser,
 * with automatic graceful fallback to clipboard copy if unavailable or rejected.
 */
export async function shareBrandBible(brand: BrandBible): Promise<ShareResult> {
  const textSnippet = formatBrandSummarySnippet(brand);
  const shareTitle = `${brand.brandName} — Brand Identity Bible`;

  const shareData: ShareData = {
    title: shareTitle,
    text: textSnippet,
  };

  // Attempt Web Share API first
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      // Check if navigator.canShare is available and supports the data
      if (!navigator.canShare || navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return { success: true, method: 'native-share' };
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User dismissed the native share sheet
        return { success: false, aborted: true };
      }
      console.warn('Web Share API failed, attempting clipboard fallback...', err);
    }
  }

  // Fallback to Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(textSnippet);
      return { success: true, method: 'clipboard' };
    } catch (clipErr) {
      console.error('Clipboard write failed:', clipErr);
      return { success: false, error: clipErr };
    }
  }

  return { success: false, error: new Error('Sharing is not supported in this environment.') };
}
