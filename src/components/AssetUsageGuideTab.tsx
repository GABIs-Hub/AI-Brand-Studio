import { useState } from 'react';
import { BrandBible } from '../types';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Type,
  Maximize2,
  Grid,
  Sparkles,
  Layers,
  Copy,
  Check,
  AlertTriangle,
  ZoomIn,
  Sliders,
  Palette,
} from 'lucide-react';

interface AssetUsageGuideTabProps {
  brand: BrandBible;
}

type GuideFilter = 'all' | 'logo' | 'typography' | 'color' | 'clearspace';

export function AssetUsageGuideTab({ brand }: AssetUsageGuideTabProps) {
  const [filter, setFilter] = useState<GuideFilter>('all');
  const [scaleTestSize, setScaleTestSize] = useState<number>(64);
  const [copiedRules, setCopiedRules] = useState(false);

  const { logo, secondaryMarks, typography, palette, brandName } = brand;

  const primaryColor = palette.find((c) => c.role === 'Primary')?.hex || '#1A1A1A';
  const secondaryColor = palette.find((c) => c.role === 'Secondary')?.hex || '#555555';
  const accentColor = palette.find((c) => c.role === 'Accent')?.hex || '#E65100';
  const neutralLight = palette.find((c) => c.role === 'Neutral Light')?.hex || '#F9F7F2';
  const neutralDark = palette.find((c) => c.role === 'Neutral Dark')?.hex || '#111111';

  const secondarySvg = secondaryMarks.length > 0 ? secondaryMarks[0].svg : logo.primaryLogoSvg;

  const copyRuleChecklist = () => {
    const rulesText = `
=== ${brandName.toUpperCase()} ASSET USAGE GUIDELINES ===

[ LOGOMARK DO'S ]
✓ Maintain mandatory 1X clearspace zone on all 4 borders.
✓ Place only on high-contrast approved brand backdrops (${neutralLight}, ${neutralDark}, or ${primaryColor}).
✓ Use the dedicated secondary mark for micro digital sizes under 40px.
✓ Scale proportionally at 1:1 aspect ratio at all times.

[ LOGOMARK DON'TS ]
✗ Never stretch, condense, or distort the logo aspect ratio.
✗ Never apply drop shadows, glows, bevels, or unapproved filter effects.
✗ Never rotate, tilt, or alter the orientation of visual marks.
✗ Never recolor with non-brand gradients, neon fills, or low-contrast combinations.

[ TYPOGRAPHY DO'S ]
✓ Use ${typography.headingFont} strictly for primary display titles and major section headings.
✓ Pair with ${typography.bodyFont} for body copy with comfortable line-height (1.5 - 1.7) and max 70ch measure.
✓ Use generous letter-spacing (0.15em - 0.3em) on all-caps subheaders and metadata labels.
✓ Maintain WCAG AA compliant text contrast across all digital surfaces.

[ TYPOGRAPHY DON'TS ]
✗ Never combine multiple conflicting display typefaces in the same layout.
✗ Never add wide letter-spacing to standard lowercase paragraph body copy.
✗ Never center-align paragraphs longer than 3 lines.
✗ Never use low-contrast gray text on tinted or dark surfaces.
`.trim();

    navigator.clipboard.writeText(rulesText);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  return (
    <div className="space-y-10" id="asset-usage-guide-container">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              Brand Standards & Compliance
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif italic text-[#1A1A1A] dark:text-[#F9F7F2]">
            Asset Usage Guide
          </h2>
          <p className="text-xs text-gray-600 dark:text-zinc-400 max-w-2xl mt-2 leading-relaxed font-sans">
            Visual reference standards and strict Do’s & Don’ts to preserve the integrity, legibility, and premium perception of the {brandName} visual identity system.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={copyRuleChecklist}
            className="flex items-center gap-2 px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold border border-[#1A1A1A] dark:border-[#F9F7F2]/30 bg-[#1A1A1A] dark:bg-[#F9F7F2] text-white dark:text-[#1A1A1A] hover:bg-black dark:hover:bg-white transition-all cursor-pointer rounded-none"
            id="copy-usage-rules-btn"
          >
            {copiedRules ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRules ? 'Rules Copied' : 'Copy Rules Spec'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[9px] uppercase tracking-widest font-black text-gray-400 dark:text-zinc-500 mr-2">
          Filter Area:
        </span>
        {[
          { id: 'all', label: 'All Guidelines', icon: Sparkles },
          { id: 'logo', label: 'Logomark Rules', icon: ShieldCheck },
          { id: 'typography', label: 'Typography Standards', icon: Type },
          { id: 'clearspace', label: 'Clearspace & Scaling', icon: Maximize2 },
          { id: 'color', label: 'Color & Contrast', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as GuideFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold transition-all rounded-none border cursor-pointer ${
                isActive
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:border-[#F9F7F2]'
                  : 'bg-transparent text-gray-700 dark:text-zinc-300 border-gray-300 dark:border-zinc-800 hover:border-[#1A1A1A] dark:hover:border-[#F9F7F2]'
              }`}
              id={`filter-guide-${tab.id}`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: LOGOMARK DO'S & DON'TS */}
      {(filter === 'all' || filter === 'logo') && (
        <section className="space-y-6" id="logo-usage-section">
          <div className="flex items-baseline justify-between border-b border-dashed border-gray-300 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-xs uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                1. Logomark Integrity & Treatment
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                Always reproduce marks from vector masters without distortion or unauthorized styling.
              </p>
            </div>
            <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
              Visual Marks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* DO: Aspect Ratio & Clearspace */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-emerald-500/30 dark:border-emerald-500/30 flex flex-col justify-between overflow-hidden shadow-xs">
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>DO: Proportional 1:1 Scale</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5">
                  APPROVED
                </span>
              </div>
              <div className="p-8 flex items-center justify-center min-h-[190px] bg-gray-50 dark:bg-zinc-900/40 relative">
                <div className="w-28 h-28 flex items-center justify-center p-2 bg-white dark:bg-white rounded-none shadow-xs border border-gray-200">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: logo.primaryLogoSvg }}
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A]">
                <p className="text-xs text-gray-700 dark:text-zinc-300 font-sans leading-relaxed">
                  Always scale proportionally while locking aspect ratio to preserve geometric balance and legibility.
                </p>
              </div>
            </div>

            {/* DON'T: Distort or Squash */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-rose-500/30 dark:border-rose-500/30 flex flex-col justify-between overflow-hidden shadow-xs">
              <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border-b border-rose-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-[10px] uppercase tracking-widest">
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>DON'T: Squeeze or Stretch</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5">
                  PROHIBITED
                </span>
              </div>
              <div className="p-8 flex items-center justify-center min-h-[190px] bg-rose-50/20 dark:bg-zinc-900/40 relative overflow-hidden">
                <div className="w-36 h-20 flex items-center justify-center p-2 bg-white dark:bg-white rounded-none shadow-xs border border-rose-200 scale-x-125 scale-y-75 opacity-90">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: logo.primaryLogoSvg }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <XCircle className="w-16 h-16 text-rose-500/25 stroke-[1.5]" />
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A]">
                <p className="text-xs text-gray-700 dark:text-zinc-300 font-sans leading-relaxed">
                  Never squeeze, stretch, or alter the horizontal or vertical proportions of the mark under any circumstances.
                </p>
              </div>
            </div>

            {/* DO: Approved Contrast Surfaces */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-emerald-500/30 dark:border-emerald-500/30 flex flex-col justify-between overflow-hidden shadow-xs">
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>DO: High Contrast Surfaces</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5">
                  APPROVED
                </span>
              </div>
              <div className="grid grid-cols-2 min-h-[190px]">
                <div className="bg-[#1A1A1A] p-4 flex items-center justify-center">
                  <div className="w-16 h-16 p-1.5 bg-white flex items-center justify-center">
                    <div
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: logo.primaryLogoSvg }}
                    />
                  </div>
                </div>
                <div className="bg-[#F9F7F2] p-4 flex items-center justify-center border-l border-gray-200 dark:border-zinc-800">
                  <div className="w-16 h-16 p-1.5 bg-white flex items-center justify-center border border-gray-200">
                    <div
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: logo.primaryLogoSvg }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A]">
                <p className="text-xs text-gray-700 dark:text-zinc-300 font-sans leading-relaxed">
                  Display exclusively on clean, high-contrast approved brand backgrounds ensuring crisp visual punch.
                </p>
              </div>
            </div>

            {/* DON'T: Heavy Shadows / Glows / 3D FX */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-rose-500/30 dark:border-rose-500/30 flex flex-col justify-between overflow-hidden shadow-xs">
              <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border-b border-rose-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-[10px] uppercase tracking-widest">
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>DON'T: Heavy Drop Shadows</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5">
                  PROHIBITED
                </span>
              </div>
              <div className="p-8 flex items-center justify-center min-h-[190px] bg-rose-50/20 dark:bg-zinc-900/40 relative">
                <div
                  className="w-28 h-28 flex items-center justify-center p-2 bg-white rounded-none"
                  style={{
                    filter: 'drop-shadow(0px 18px 12px rgba(0,0,0,0.85)) blur(0.3px)',
                  }}
                >
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: logo.primaryLogoSvg }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <XCircle className="w-16 h-16 text-rose-500/25 stroke-[1.5]" />
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A]">
                <p className="text-xs text-gray-700 dark:text-zinc-300 font-sans leading-relaxed">
                  Do not add artificial drop shadows, bevels, neon glows, gradients, or raster filters to vectors.
                </p>
              </div>
            </div>

            {/* DO: Dedicated Micro Icon */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-emerald-500/30 dark:border-emerald-500/30 flex flex-col justify-between overflow-hidden shadow-xs">
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>DO: Secondary Mark for Micro</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5">
                  APPROVED
                </span>
              </div>
              <div className="p-8 flex items-center justify-center gap-6 min-h-[190px] bg-gray-50 dark:bg-zinc-900/40">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 p-1 bg-white dark:bg-white rounded-none shadow-xs border border-gray-300 flex items-center justify-center">
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: secondarySvg }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-gray-500">32px Favicon</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 p-1.5 bg-white dark:bg-white rounded-none shadow-xs border border-gray-300 flex items-center justify-center">
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: secondarySvg }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-gray-500">56px App Icon</span>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A]">
                <p className="text-xs text-gray-700 dark:text-zinc-300 font-sans leading-relaxed">
                  Use the simplified secondary submark for micro-scale UI targets, app badges, and favicons under 48px.
                </p>
              </div>
            </div>

            {/* DON'T: Unapproved Hue Rotations */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-rose-500/30 dark:border-rose-500/30 flex flex-col justify-between overflow-hidden shadow-xs">
              <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border-b border-rose-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-[10px] uppercase tracking-widest">
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>DON'T: Random Color Shifts</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5">
                  PROHIBITED
                </span>
              </div>
              <div className="p-8 flex items-center justify-center min-h-[190px] bg-rose-50/20 dark:bg-zinc-900/40 relative">
                <div
                  className="w-28 h-28 flex items-center justify-center p-2 bg-gradient-to-tr from-fuchsia-400 via-lime-400 to-cyan-400 rounded-none"
                  style={{ filter: 'hue-rotate(190deg) saturate(3)' }}
                >
                  <div
                    className="w-full h-full flex items-center justify-center invert"
                    dangerouslySetInnerHTML={{ __html: logo.primaryLogoSvg }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <XCircle className="w-16 h-16 text-rose-500/25 stroke-[1.5]" />
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A]">
                <p className="text-xs text-gray-700 dark:text-zinc-300 font-sans leading-relaxed">
                  Do not apply unapproved neon hues, arbitrary color fills, or non-brand gradient textures.
                </p>
              </div>
            </div>

            {/* DO: Clean Vector Rendering */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-emerald-500/30 dark:border-emerald-500/30 flex flex-col justify-between overflow-hidden shadow-xs">
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>DO: Upright 0° Orientation</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5">
                  APPROVED
                </span>
              </div>
              <div className="p-8 flex items-center justify-center min-h-[190px] bg-gray-50 dark:bg-zinc-900/40">
                <div className="w-28 h-28 flex items-center justify-center p-2 bg-white dark:bg-white rounded-none shadow-xs border border-gray-200">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: logo.primaryLogoSvg }}
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A]">
                <p className="text-xs text-gray-700 dark:text-zinc-300 font-sans leading-relaxed">
                  Keep logo level at exact 0° horizontal alignment. Only official lockup variations are approved.
                </p>
              </div>
            </div>

            {/* DON'T: Skewing or Tilting */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-rose-500/30 dark:border-rose-500/30 flex flex-col justify-between overflow-hidden shadow-xs">
              <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border-b border-rose-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-[10px] uppercase tracking-widest">
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>DON'T: Rotate or Skew</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5">
                  PROHIBITED
                </span>
              </div>
              <div className="p-8 flex items-center justify-center min-h-[190px] bg-rose-50/20 dark:bg-zinc-900/40 relative overflow-hidden">
                <div className="w-28 h-28 flex items-center justify-center p-2 bg-white dark:bg-white rounded-none shadow-xs border border-rose-200 rotate-25 skew-x-12 opacity-80">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: logo.primaryLogoSvg }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <XCircle className="w-16 h-16 text-rose-500/25 stroke-[1.5]" />
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A]">
                <p className="text-xs text-gray-700 dark:text-zinc-300 font-sans leading-relaxed">
                  Never rotate, slant, skew, or place the logomark on diagonal baseline angles.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: CLEARSPACE & MINIMUM SIZE ARCHITECTURE */}
      {(filter === 'all' || filter === 'clearspace') && (
        <section className="space-y-6" id="clearspace-section">
          <div className="flex items-baseline justify-between border-b border-dashed border-gray-300 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-xs uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                2. Clearspace & Minimum Size Specifications
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                The minimum exclusion zone around the mark ensures zero interference from surrounding graphics, typography, or page edges.
              </p>
            </div>
            <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
              Spatial Grid
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Interactive Blueprint Clearspace Grid */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-black text-gray-400">
                    Architectural Blueprint
                  </span>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-[#F9F7F2]">
                    Clearspace Exclusion Zone (1X)
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-1 border border-amber-300 dark:border-amber-800">
                  <span>X = Height of Mark ÷ 4</span>
                </div>
              </div>

              {/* Blueprint Visual Representation */}
              <div className="relative p-12 bg-slate-900 rounded-none border border-slate-700 flex items-center justify-center overflow-hidden my-4">
                {/* Blueprint grid background */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Outer Clearzone Box */}
                <div className="relative border-2 border-dashed border-sky-400/80 p-8 bg-sky-500/5">
                  {/* Clearzone label tags */}
                  <span className="absolute -top-3 left-4 text-[9px] font-mono bg-sky-500 text-white px-1.5 py-0.5">
                    1X Margin
                  </span>
                  <span className="absolute -bottom-3 right-4 text-[9px] font-mono bg-sky-500 text-white px-1.5 py-0.5">
                    1X Margin
                  </span>
                  <span className="absolute top-1/2 -left-3 -translate-y-1/2 text-[9px] font-mono bg-sky-500 text-white px-1">
                    1X
                  </span>
                  <span className="absolute top-1/2 -right-3 -translate-y-1/2 text-[9px] font-mono bg-sky-500 text-white px-1">
                    1X
                  </span>

                  {/* Centered Logo Asset */}
                  <div className="w-36 h-36 bg-white p-3 shadow-2xl flex items-center justify-center">
                    <div
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: logo.primaryLogoSvg }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-600 dark:text-zinc-400 font-sans space-y-2 mt-4">
                <p>
                  <strong>Formula:</strong> The clear zone margin is calculated by taking 25% of the total logomark height (1X).
                </p>
                <p>
                  No text, page margins, photographs, secondary buttons, or competing graphic elements may encroach inside this perimeter.
                </p>
              </div>
            </div>

            {/* Minimum Sizes & Live Interactive Scale Tester */}
            <div className="lg:col-span-5 bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-8 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-black text-gray-400">
                  Resolution Constraints
                </span>
                <h4 className="text-lg font-bold text-gray-900 dark:text-[#F9F7F2]">
                  Minimum Scale Guide
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Prevents micro-detail loss on low-DPI screens and thermal print mediums.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-[#F9F7F2]">Primary Lockup (Digital)</div>
                    <div className="text-[10px] text-gray-500">Web headers, banners, cards</div>
                  </div>
                  <div className="text-xs font-mono font-bold text-gray-900 dark:text-[#F9F7F2]">
                    min. 96px width
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-[#F9F7F2]">Secondary Submark</div>
                    <div className="text-[10px] text-gray-500">Favicons, micro avatars, buttons</div>
                  </div>
                  <div className="text-xs font-mono font-bold text-gray-900 dark:text-[#F9F7F2]">
                    min. 24px × 24px
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-[#F9F7F2]">Print Collateral</div>
                    <div className="text-[10px] text-gray-500">Business cards, packaging, stationery</div>
                  </div>
                  <div className="text-xs font-mono font-bold text-gray-900 dark:text-[#F9F7F2]">
                    min. 20mm (0.78 in)
                  </div>
                </div>
              </div>

              {/* Interactive Scale Tester */}
              <div className="p-4 bg-gray-50 dark:bg-zinc-900/60 border border-dashed border-gray-300 dark:border-zinc-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-[#F9F7F2]">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Interactive Legibility Tester</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white dark:bg-zinc-800 px-2 py-0.5 border border-gray-300 dark:border-zinc-700">
                    {scaleTestSize}px
                  </span>
                </div>

                <input
                  type="range"
                  min="24"
                  max="160"
                  step="4"
                  value={scaleTestSize}
                  onChange={(e) => setScaleTestSize(Number(e.target.value))}
                  className="w-full accent-[#1A1A1A] dark:accent-[#F9F7F2] cursor-pointer"
                />

                <div className="flex items-center justify-center p-4 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 min-h-[140px] overflow-hidden">
                  <div
                    style={{ width: `${scaleTestSize}px`, height: `${scaleTestSize}px` }}
                    className="flex items-center justify-center transition-all duration-150"
                  >
                    <div
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{
                        __html: scaleTestSize <= 40 ? secondarySvg : logo.primaryLogoSvg,
                      }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 text-center">
                  {scaleTestSize <= 40
                    ? '💡 Micro Mode Active: Automatically switched to Secondary Submark for optimal clarity.'
                    : 'Standard Mode Active: Rendering full Primary Vector Mark.'}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: TYPOGRAPHY DO'S & DON'TS */}
      {(filter === 'all' || filter === 'typography') && (
        <section className="space-y-6" id="typography-usage-section">
          <div className="flex items-baseline justify-between border-b border-dashed border-gray-300 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-xs uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                3. Typography Hierarchy & Treatment Standards
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                Maintain typographic harmony by strictly pairing {typography.headingFont} with {typography.bodyFont}.
              </p>
            </div>
            <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
              Font Pairing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TYPO DO: Clear Contrast Hierarchy */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-emerald-500/30 flex flex-col justify-between overflow-hidden shadow-xs">
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>DO: Strict Visual Hierarchy</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5">
                  APPROVED
                </span>
              </div>
              <div className="p-6 space-y-4 bg-gray-50 dark:bg-zinc-900/40 min-h-[220px]">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-gray-400 block mb-1">
                    01 // Architectural Principle
                  </span>
                  <h4
                    style={{ fontFamily: `'${typography.headingFont}', serif, sans-serif` }}
                    className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F9F7F2] leading-tight"
                  >
                    Delivering transformative creative excellence.
                  </h4>
                </div>
                <p
                  style={{ fontFamily: `'${typography.bodyFont}', sans-serif` }}
                  className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed max-w-prose"
                >
                  Our mission is grounded in rigorous craftsmanship. We combine refined aesthetic sensibility with seamless functional execution to create timeless brand value for global audiences.
                </p>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A]">
                <p className="text-xs text-gray-700 dark:text-zinc-300 font-sans leading-relaxed">
                  Pair {typography.headingFont} for high-impact headlines with {typography.bodyFont} for body copy at 1.5–1.7 line height.
                </p>
              </div>
            </div>

            {/* TYPO DON'T: Competing Display Typefaces */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-rose-500/30 flex flex-col justify-between overflow-hidden shadow-xs">
              <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border-b border-rose-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-[10px] uppercase tracking-widest">
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>DON'T: Clashing Display Typefaces</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5">
                  PROHIBITED
                </span>
              </div>
              <div className="p-6 space-y-4 bg-rose-50/20 dark:bg-zinc-900/40 min-h-[220px] relative">
                <div>
                  <span className="text-[9px] uppercase tracking-normal font-mono text-rose-500 block mb-1">
                    Conflicting Fonts In Single View
                  </span>
                  <h4 className="text-2xl font-black font-mono text-purple-700 dark:text-purple-400 italic">
                    Transforming the industry...
                  </h4>
                </div>
                <p className="text-xs font-serif font-bold text-amber-800 dark:text-amber-400 tracking-widest leading-none">
                  Our mission is grounded in randomized typographic chaos that degrades brand credibility and visual hierarchy.
                </p>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <XCircle className="w-16 h-16 text-rose-500/25 stroke-[1.5]" />
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A]">
                <p className="text-xs text-gray-700 dark:text-zinc-300 font-sans leading-relaxed">
                  Never introduce random unapproved fonts, decorative comic/script fonts, or mismatch weights that dilute hierarchy.
                </p>
              </div>
            </div>

            {/* TYPO DO: Tracking on All-Caps & Flush Left Alignment */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-emerald-500/30 flex flex-col justify-between overflow-hidden shadow-xs">
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>DO: Clean Left-Alignment & Optical Tracking</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5">
                  APPROVED
                </span>
              </div>
              <div className="p-6 space-y-3 bg-gray-50 dark:bg-zinc-900/40 min-h-[190px]">
                <div className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-900 dark:text-[#F9F7F2] pb-1 border-b border-gray-300 dark:border-zinc-700">
                  SECTION 02 // EDITORIAL CADENCE
                </div>
                <p
                  style={{ fontFamily: `'${typography.bodyFont}', sans-serif` }}
                  className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed text-left"
                >
                  Left-aligned copy provides a reliable left anchor for the reader's eye, maximizing scanability and reducing cognitive reading fatigue on long multi-paragraph documents.
                </p>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A]">
                <p className="text-xs text-gray-700 dark:text-zinc-300 font-sans leading-relaxed">
                  Use letter-spacing (0.2em–0.3em) on all-caps titles and keep body copy strictly flush-left with balanced measure.
                </p>
              </div>
            </div>

            {/* TYPO DON'T: Centering Long Copy & Over-tracking Lowercase */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-rose-500/30 flex flex-col justify-between overflow-hidden shadow-xs">
              <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border-b border-rose-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-[10px] uppercase tracking-widest">
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>DON'T: Center Long Multi-Line Copy</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5">
                  PROHIBITED
                </span>
              </div>
              <div className="p-6 space-y-3 bg-rose-50/20 dark:bg-zinc-900/40 min-h-[190px] relative text-center">
                <div className="text-[10px] tracking-normal font-sans text-rose-600 pb-1">
                  centered paragraph without anchor
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-tight text-center tracking-[0.25em]">
                  centering long multi-sentence paragraphs creates jagged uneven left margins that force the reader's eye to constantly search for the starting position of every single line.
                </p>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <XCircle className="w-16 h-16 text-rose-500/25 stroke-[1.5]" />
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A]">
                <p className="text-xs text-gray-700 dark:text-zinc-300 font-sans leading-relaxed">
                  Never center-align paragraphs longer than 2 lines, and never apply wide letter-spacing to lowercase body copy.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: COLOR CONTRAST & SURFACE APPLICATIONS */}
      {(filter === 'all' || filter === 'color') && (
        <section className="space-y-6" id="color-contrast-section">
          <div className="flex items-baseline justify-between border-b border-dashed border-gray-300 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-xs uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                4. Color Contrast & Accessibility Hierarchy
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                Ensure all brand communications meet minimum WCAG AA contrast standards (4.5:1 for body text, 3:1 for large display titles).
              </p>
            </div>
            <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
              5-Color Palette
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Approved Light Mode Surface */}
            <div className="p-6 bg-[#F9F7F2] text-[#1A1A1A] border border-emerald-500/40 shadow-xs flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-mono font-bold bg-emerald-600 text-white px-1.5 py-0.5">
                    PASS WCAG AAA (12.4:1)
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <h5 className="font-bold text-sm">Primary Light Canvas</h5>
                <p className="text-xs opacity-80 mt-1">
                  Dark typography ({neutralDark} or {primaryColor}) on Neutral Light canvas ({neutralLight}).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-black/10 text-[10px] font-mono opacity-70">
                Optimal for Editorial, Print, & Web Reading
              </div>
            </div>

            {/* Approved Dark Mode Surface */}
            <div className="p-6 bg-[#111110] text-[#F9F7F2] border border-emerald-500/40 shadow-xs flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-mono font-bold bg-emerald-600 text-white px-1.5 py-0.5">
                    PASS WCAG AAA (14.2:1)
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <h5 className="font-bold text-sm">Primary Dark Canvas</h5>
                <p className="text-xs opacity-80 mt-1">
                  Light typography ({neutralLight}) on Neutral Dark background ({neutralDark}).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[10px] font-mono opacity-70">
                Optimal for Hero Banners & Dark Interfaces
              </div>
            </div>

            {/* Prohibited Low Contrast Failure */}
            <div className="p-6 bg-gray-300 text-gray-400 border border-rose-500/40 shadow-xs flex flex-col justify-between min-h-[220px] relative overflow-hidden">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.5">
                    FAIL WCAG AA (1.8:1)
                  </span>
                  <XCircle className="w-4 h-4 text-rose-600" />
                </div>
                <h5 className="font-bold text-sm text-gray-500">Low-Contrast Gray on Tint</h5>
                <p className="text-xs text-gray-400 mt-1">
                  Muted gray copy over light-gray or mid-tone surfaces makes text illegible.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-black/10 text-[10px] font-mono text-rose-700 font-bold">
                STRICTLY PROHIBITED IN PRODUCTION
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: QUICK BRAND RULES CHEAT SHEET */}
      <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-4">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2]">
              Quick Reference Governance Checklist
            </h4>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Hand this checklist to agency partners, external vendors, and internal product teams.
            </p>
          </div>
          <div className="text-[9px] uppercase tracking-widest font-black bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 px-2.5 py-1 border border-gray-300 dark:border-zinc-700">
            {brandName} Design System v1.0
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 text-[10px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mandatory DOs</span>
            </div>
            <ul className="space-y-1.5 text-gray-700 dark:text-zinc-300 list-disc list-inside">
              <li>Always scale vector SVG assets proportionally.</li>
              <li>Preserve minimum 1X exclusion zone around visual marks.</li>
              <li>Use {typography.headingFont} exclusively for titles and key metrics.</li>
              <li>Maintain minimum 16px body copy on all web applications.</li>
              <li>Switch to Secondary Submark for micro icons under 40px.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 text-[10px] flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              <span>Strictly Prohibited DON'Ts</span>
            </div>
            <ul className="space-y-1.5 text-gray-700 dark:text-zinc-300 list-disc list-inside">
              <li>Do not distort, squash, or stretch the logo aspect ratio.</li>
              <li>Do not add arbitrary drop shadows, glows, or 3D extrusions.</li>
              <li>Do not rotate or place marks on diagonal angles.</li>
              <li>Do not apply unapproved colors or non-system gradients.</li>
              <li>Do not center-align body paragraphs longer than 2 lines.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
