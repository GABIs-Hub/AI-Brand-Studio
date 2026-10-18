import { useState } from 'react';
import { BrandBible } from '../types';
import {
  X,
  Download,
  Copy,
  Check,
  FileJson,
  FileCode,
  FileText,
  FileUp,
  Share2,
  Package,
  Presentation,
  Sparkles,
  Layers,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { shareBrandBible, formatBrandSummarySnippet } from '../lib/share';
import { exportBrandPowerPointDeck } from '../services/presentationService';
import { generateFullBrandAssetKitZip, AssetKitProgress } from '../utils/brandAssetKit';

interface ExportModalProps {
  brand: BrandBible | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPitchDeck?: () => void;
}

// Convert Hex string to RGB numbers for jsPDF fill styling

const convertSvgToPngDataUrl = async (svgString: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const encodedSvg = encodeURIComponent(svgString);
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 800, 600);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
  });
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 26, g: 26, b: 26 };
};

// Convert SVG Logo string directly to a PNG Data URI on-the-fly using browser Canvas
const svgToPngDataUrl = (svgString: string): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 400, 400);
          ctx.drawImage(img, 50, 50, 300, 300);
        }
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.onerror = () => resolve('');
      img.src = url;
    } catch {
      resolve('');
    }
  });
};

export function ExportModal({ brand, isOpen, onClose, onOpenPitchDeck }: ExportModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<AssetKitProgress | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (!isOpen || !brand) return null;

  const jsonString = JSON.stringify(brand, null, 2);
  const summarySnippet = formatBrandSummarySnippet(brand);

  const handleDownloadFullAssetKit = async () => {
    if (!brand) return;
    setIsZipping(true);
    try {
      const zipBlob = await generateFullBrandAssetKitZip(brand, (progress) => {
        setZipProgress(progress);
      });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      const brandSlug = brand.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'brand';
      link.href = url;
      link.download = `${brandSlug}-full-brand-asset-kit.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate full asset kit zip:', err);
    } finally {
      setIsZipping(false);
      setZipProgress(null);
    }
  };

  const cssString = `:root {\n` +
    `  /* Brand Bible: ${brand.brandName} Palette */\n` +
    brand.palette
      .map((c) => `  --color-${c.role.toLowerCase().replace(/\s+/g, '-')}: ${c.hex}; /* ${c.name} */`)
      .join('\n') +
    `\n\n  /* Typography Pairings */\n` +
    `  --font-heading: '${brand.typography.headingFont}', serif;\n` +
    `  --font-body: '${brand.typography.bodyFont}', sans-serif;\n` +
    `}`;

  const markdownString = `# Brand Bible: ${brand.brandName}\n\n` +
    `**Tagline:** "${brand.tagline}"  \n` +
    `**Industry:** ${brand.industry}  \n\n` +
    `## Mission Statement\n${brand.mission}\n\n` +
    `## Long-Term Vision\n${brand.vision}\n\n` +
    `## Positioning Statement\n${brand.positioningStatement}\n\n` +
    `## 5-Color Brand Palette\n` +
    brand.palette.map((c) => `- **${c.role} (${c.name}):** \`${c.hex}\` — ${c.usage}`).join('\n') +
    `\n\n## Typography\n` +
    `- **Heading Font:** ${brand.typography.headingFont} (${brand.typography.headingFontCategory})\n` +
    `- **Body Font:** ${brand.typography.bodyFont} (${brand.typography.bodyFontCategory})\n` +
    `- **Google Fonts Link:** ${brand.typography.googleFontsUrl}\n\n` +
    `## Core Values\n` +
    brand.values.map((v) => `- **${v.title}:** ${v.description}`).join('\n');

  const handleDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleShare = async () => {
    if (!brand) return;
    const res = await shareBrandBible(brand);
    if (res.success) {
      setShareFeedback(res.method === 'native-share' ? 'Shared via Web Share API' : 'Summary Copied to Clipboard');
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  const handleDownloadPdf = async () => {
    if (!brand) return;
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      // ==========================================
      // PAGE 1: Brand Header & Cover
      // ==========================================
      doc.setFillColor(249, 247, 242); // Warm off-white #F9F7F2
      doc.rect(0, 0, 595.28, 841.89, 'F');

      // Elegant inner border
      doc.setDrawColor(26, 26, 26); // Charcoal #1A1A1A
      doc.setLineWidth(1.5);
      doc.rect(40, 40, 515.28, 761.89);

      doc.setLineWidth(0.5);
      doc.line(50, 50, 545.28, 50);

      // Title
      doc.setTextColor(26, 26, 26);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.text(brand.brandName.toUpperCase(), 297.64, 130, { align: 'center' });

      // Subtitle
      doc.setFont('helvetica', 'oblique');
      doc.setFontSize(14);
      doc.text(`"${brand.tagline}"`, 297.64, 165, { align: 'center' });

      // Details Block
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`INDUSTRY: ${brand.industry.toUpperCase()}`, 297.64, 195, { align: 'center' });
      doc.text(`GENERATED ON: ${new Date().toLocaleDateString()}`, 297.64, 210, { align: 'center' });

      // Add Logo Image if available
      if (brand.logo?.primaryLogoSvg) {
        try {
          const pngDataUrl = await convertSvgToPngDataUrl(brand.logo.primaryLogoSvg);
          // Center the image (Image is 800x600 aspect ratio)
          doc.addImage(pngDataUrl, 'PNG', 197.64, 250, 200, 150);
        } catch (e) {
          console.error("Could not add logo to PDF:", e);
        }
      }


      // Logo Frame
      doc.setDrawColor(26, 26, 26);
      doc.setLineWidth(1);
      doc.rect(197.64, 240, 200, 200);

      // Render vector logo to frame
      const logoPng = await svgToPngDataUrl(brand.logo.primaryLogoSvg);
      if (logoPng) {
        doc.addImage(logoPng, 'PNG', 198.64, 241, 198, 198);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text("PRIMARY LOGO MARK", 297.64, 345, { align: 'center' });
      }

      // Mission & Vision Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text("MISSION STATEMENT", 60, 490);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      const splitMission = doc.splitTextToSize(brand.mission, 475);
      doc.text(splitMission, 60, 510);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text("LONG-TERM VISION", 60, 600);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      const splitVision = doc.splitTextToSize(brand.vision, 475);
      doc.text(splitVision, 60, 620);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text("POSITIONING STATEMENT", 60, 710);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      const splitPositioning = doc.splitTextToSize(brand.positioningStatement, 475);
      doc.text(splitPositioning, 60, 730);

      // ==========================================
      // PAGE 2: Color Palette Details
      // ==========================================
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 595.28, 841.89, 'F');
      doc.rect(40, 40, 515.28, 761.89);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(26, 26, 26);
      doc.text("BRAND PALETTE SPECS", 60, 90);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text("A carefully calibrated five-color scheme defining roles, contrast, and usage metrics.", 60, 110);

      let yOffset = 145;
      brand.palette.forEach((color) => {
        const rgb = hexToRgb(color.hex);
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(60, yOffset, 65, 65, 'FD');

        doc.setTextColor(26, 26, 26);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        doc.text(`${color.role.toUpperCase()}: ${color.name}`, 140, yOffset + 15);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.text(`HEX: ${color.hex}   |   RGB: ${color.rgb}`, 140, yOffset + 30);

        const splitUsage = doc.splitTextToSize(`Usage Guideline: ${color.usage}`, 380);
        doc.text(splitUsage, 140, yOffset + 43);

        yOffset += 112;
      });

      // ==========================================
      // PAGE 3: Typography & Values
      // ==========================================
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 595.28, 841.89, 'F');
      doc.rect(40, 40, 515.28, 761.89);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text("TYPOGRAPHY & VALUES", 60, 90);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text("HEADING TYPOGRAPHY", 60, 135);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.text(`Primary Font: ${brand.typography.headingFont} (${brand.typography.headingFontCategory})`, 60, 155);
      doc.text(`Supported Weights: ${brand.typography.headingWeights.join(', ')}`, 60, 170);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text("BODY TYPOGRAPHY", 60, 210);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.text(`System Font: ${brand.typography.bodyFont} (${brand.typography.bodyFontCategory})`, 60, 230);
      doc.text(`Supported Weights: ${brand.typography.bodyWeights.join(', ')}`, 60, 245);

      doc.setFont('helvetica', 'oblique');
      doc.setFontSize(9.5);
      const splitRationale = doc.splitTextToSize(`Type Rationalization: ${brand.typography.rationale}`, 470);
      doc.text(splitRationale, 60, 275);

      // Core Values
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text("CORE BRAND VALUES", 60, 375);

      let valY = 410;
      brand.values.forEach((val) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(val.title.toUpperCase(), 60, valY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        const splitValDesc = doc.splitTextToSize(val.description, 470);
        doc.text(splitValDesc, 60, valY + 14);

        valY += 58;
      });

      // ==========================================
      // PAGE 4: Asset Usage Guide (Do's & Don'ts)
      // ==========================================
      doc.addPage();
      doc.setFillColor(249, 247, 242);
      doc.rect(0, 0, 595.28, 841.89, 'F');

      doc.setDrawColor(26, 26, 26);
      doc.setLineWidth(1.5);
      doc.rect(40, 40, 515.28, 761.89);

      doc.setLineWidth(0.5);
      doc.line(50, 50, 545.28, 50);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text("ASSET USAGE & GOVERNANCE", 60, 90);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(16, 122, 68); // Dark Emerald
      doc.text("APPROVED PRACTICES (DO'S)", 60, 135);

      doc.setTextColor(26, 26, 26);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const dosList = [
        "• Always scale logomarks proportionally with locked 1:1 aspect ratio.",
        "• Maintain mandatory 1X clearspace exclusion perimeter around visual marks.",
        "• Use dedicated secondary submarks for micro UI targets under 40px.",
        `• Pair ${brand.typography.headingFont} for headlines with ${brand.typography.bodyFont} for body copy.`,
        "• Ensure high contrast against background surfaces meeting WCAG AA standards."
      ];
      let doY = 160;
      dosList.forEach(item => {
        doc.text(item, 60, doY);
        doY += 22;
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(190, 24, 24); // Dark Crimson
      doc.text("PROHIBITED PRACTICES (DON'TS)", 60, 295);

      doc.setTextColor(26, 26, 26);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const dontsList = [
        "• Never stretch, condense, skew, or distort the vector logomarks.",
        "• Never apply artificial drop shadows, glows, bevels, or unapproved filter effects.",
        "• Never rotate or angle visual marks on diagonal baselines.",
        "• Never recolor with non-system gradients or unauthorized tint variations.",
        "• Never center-align multi-sentence paragraphs longer than 2 lines."
      ];
      let dontY = 320;
      dontsList.forEach(item => {
        doc.text(item, 60, dontY);
        dontY += 22;
      });

      // Spatial & Sizing Specifications
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(26, 26, 26);
      doc.text("MINIMUM SIZE SPECIFICATIONS", 60, 460);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text("• Primary Digital Lockup: Minimum 96px width", 60, 485);
      doc.text("• Secondary Submark (Favicons/Avatars): Minimum 24px x 24px", 60, 507);
      doc.text("• Print Minimum Resolution: 20mm (0.78 in) at 300 DPI vector", 60, 529);

      doc.save(`${brand.brandName.toLowerCase()}-brand-bible.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" id="export-modal">
      <div className="bg-white dark:bg-[#1C1C1A] text-[#1A1A1A] dark:text-[#F9F7F2] rounded-xl-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-gray-200 dark:border-gray-200 dark:border-[#F9F7F2]/20">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          id="close-export-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F9F7F2]" id="export-modal-title">Export Brand Bible</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Download or copy complete design system specifications for {brand.brandName}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Production Asset Kit (.ZIP) Enterprise Card */}
          <div
            className="sm:col-span-2 p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-400/40 dark:border-amber-400/30 rounded-xl-2xl relative overflow-hidden flex flex-col justify-between space-y-4"
            id="full-asset-kit-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold shrink-0 shadow-md">
                  <Package className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-gray-900 dark:text-[#F9F7F2]">
                      Full Brand Production Asset Kit (.ZIP)
                    </h3>
                    <span className="text-[9px] uppercase font-black px-2 py-0.5 bg-amber-400 text-black rounded-xl-full">
                      All-in-One
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                    1-Click compiled production ZIP containing <strong>Vector SVGs</strong> (primary, monochrome, secondary), <strong>Raster PNGs</strong> (1024px, 512px, 256px, 128px), <strong>Web Favicon Suite</strong> (ICO, PNGs, manifest), <strong>Design Tokens</strong> (CSS, SCSS, Tailwind, JSON), and <strong>Markdown Guidelines</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar or Download Button */}
            {isZipping ? (
              <div className="space-y-2 p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {zipProgress?.step || 'Compiling asset bundle...'}
                  </span>
                  <span className="font-bold">{zipProgress?.percent || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-700 h-2 rounded-xl-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${zipProgress?.percent || 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadFullAssetKit}
                  className="py-2.5 px-5 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-gray-100 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  id="download-full-zip-btn"
                >
                  <Download className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                  <span>Download Full Asset Bundle (.ZIP)</span>
                </button>

                {onOpenPitchDeck && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPitchDeck();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-amber-400/40 transition-all cursor-pointer"
                    id="open-deck-from-export-btn"
                  >
                    <Presentation className="w-4 h-4" />
                    <span>Launch Client Pitch Deck</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Web Share & Quick Snippet */}
          <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl-2xl border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between sm:col-span-2" id="share-snippet-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Web Share & Text Snippet</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal mt-0.5">
                    Share a clean text summary via native device share sheet (iOS/Android/Desktop) or copy snippet.
                  </p>
                </div>
              </div>
              {shareFeedback && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-xl-md border border-emerald-200 dark:border-emerald-800 shrink-0">
                  ✓ {shareFeedback}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleShare}
                className="flex-1 min-w-[140px] py-2 px-3 text-xs font-bold rounded-xl-lg bg-[#1A1A1A] hover:bg-black dark:bg-[#F9F7F2] dark:hover:bg-white text-white dark:text-[#1A1A1A] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                id="native-share-btn"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share via Web Share API</span>
              </button>
              <button
                onClick={() => handleCopy(summarySnippet, 'snippet')}
                className="py-2 px-3 text-xs font-semibold rounded-xl-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1 cursor-pointer"
                id="copy-snippet-btn"
              >
                {copiedType === 'snippet' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Text Snippet</span>
              </button>
            </div>
          </div>

          {/* Structured Brand PDF */}
          <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl-2xl border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between" id="pdf-export-card">
            <div>
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 flex items-center justify-center mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Structured PDF</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal mt-0.5">
                Download a beautifully formatted multi-page printable Brand manual.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full py-1.5 px-3 text-xs font-bold rounded-xl-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                id="download-pdf-btn"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>

          {/* Editable PowerPoint Deck */}
          <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl-2xl border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between" id="pptx-export-card">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 flex items-center justify-center mb-2">
                <Presentation className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">PowerPoint Deck</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal mt-0.5">
                Download a fully editable 16:9 brand presentation in .pptx format.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={async () => {
                  try {
                    setShareFeedback('Generating PPTX...');
                    await exportBrandPowerPointDeck(brand);
                    setShareFeedback('PPTX Downloaded');
                  } catch (e) {
                    console.error('PPTX failed:', e);
                    setShareFeedback('Export failed');
                  }
                  setTimeout(() => setShareFeedback(null), 3000);
                }}
                className="w-full py-1.5 px-3 text-xs font-bold rounded-xl-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                id="download-pptx-btn"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .pptx</span>
              </button>
            </div>
          </div>

          {/* JSON Export */}
          <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl-2xl border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between" id="json-export-card">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-2">
                <FileJson className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Full JSON Kit</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal mt-0.5">
                Complete structured Brand Bible data schema.
              </p>
            </div>
            <div className="flex gap-1.5 pt-2">
              <button
                onClick={() => handleCopy(jsonString, 'json')}
                className="flex-1 py-1.5 px-2 text-xs font-semibold rounded-xl-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1 cursor-pointer"
                id="copy-json-btn"
              >
                {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
              <button
                onClick={() => handleDownload(jsonString, `${brand.brandName.toLowerCase()}-brand-bible.json`, 'application/json')}
                className="py-1.5 px-2.5 text-xs font-bold rounded-xl-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer"
                title="Download JSON"
                id="download-json-btn"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CSS Variables Export */}
          <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl-2xl border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between" id="css-export-card">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-2">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">CSS Stylesheet</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal mt-0.5">
                CSS custom properties for colors & typography.
              </p>
            </div>
            <div className="flex gap-1.5 pt-2">
              <button
                onClick={() => handleCopy(cssString, 'css')}
                className="flex-1 py-1.5 px-2 text-xs font-semibold rounded-xl-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1 cursor-pointer"
                id="copy-css-btn"
              >
                {copiedType === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
              <button
                onClick={() => handleDownload(cssString, `${brand.brandName.toLowerCase()}-brand-tokens.css`, 'text/css')}
                className="py-1.5 px-2.5 text-xs font-bold rounded-xl-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer"
                title="Download CSS"
                id="download-css-btn"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Markdown Summary Export */}
          <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl-2xl border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between" id="markdown-export-card">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-2">
                <FileUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Markdown Guide</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal mt-0.5">
                Formatted documentation markdown file.
              </p>
            </div>
            <div className="flex gap-1.5 pt-2">
              <button
                onClick={() => handleCopy(markdownString, 'md')}
                className="flex-1 py-1.5 px-2 text-xs font-semibold rounded-xl-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1 cursor-pointer"
                id="copy-md-btn"
              >
                {copiedType === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
              <button
                onClick={() => handleDownload(markdownString, `${brand.brandName.toLowerCase()}-brand-bible.md`, 'text/markdown')}
                className="py-1.5 px-2.5 text-xs font-bold rounded-xl-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer"
                title="Download MD"
                id="download-md-btn"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

