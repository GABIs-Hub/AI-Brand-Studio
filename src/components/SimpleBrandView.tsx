import { useState } from 'react';
import { BrandBible } from '../types';
import { sanitizeSvg } from '../utils/sanitizeSvg';
import {
  Copy,
  Check,
  Download,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Type,
  Palette,
  Target
} from 'lucide-react';
import { shareBrandBible } from '../lib/share';

interface SimpleBrandViewProps {
  brand: BrandBible;
  onSwitchToStudio: () => void;
  onUpgradeBrand?: (brand: BrandBible) => void;
}

export function SimpleBrandView({ brand, onSwitchToStudio, onUpgradeBrand }: SimpleBrandViewProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [logoBg, setLogoBg] = useState<'light' | 'dark' | 'brand'>('light');
  const [customSpecimenText, setCustomSpecimenText] = useState(
    'The quick brown fox jumps over the lazy dog. 1234567890'
  );

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(brand.logo.primaryLogoSvg);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([brand.logo.primaryLogoSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-logo.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const res = await shareBrandBible(brand);
    if (res.success) {
      setShareStatus(res.method === 'native-share' ? 'Shared!' : 'Copied Summary!');
      setTimeout(() => setShareStatus(null), 2500);
    }
  };

  // Find dominant brand color for preview
  const primaryColor = brand.palette.find((c) => c.role.toLowerCase().includes('primary'))?.hex || brand.palette[1]?.hex || '#1A1A1A';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner & Executive Tagline */}
      <div className="bg-[#1A1A1A] dark:bg-[#111110] text-[#F9F7F2] p-8 sm:p-10 border border-[#1A1A1A] dark:border-[#F9F7F2]/20 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-transparent border border-[#F9F7F2] text-[9px] font-black uppercase tracking-[0.25em]">
              Your Brand at a Glance
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#F9F7F2]/60">
              {brand.industry}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent hover:bg-white hover:text-[#1A1A1A] text-[#F9F7F2] border border-[#F9F7F2]/40 text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer"
              id="simple-view-share-btn"
            >
              {shareStatus ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{shareStatus}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3 h-3 opacity-80" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              onClick={onSwitchToStudio}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F9F7F2] text-[#1A1A1A] text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all cursor-pointer shadow-xs"
              id="simple-view-open-studio-btn"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Open Studio Suite</span>
            </button>
          </div>
        </div>

        <div className="space-y-3 max-w-4xl">
          <h1 className="text-4xl sm:text-6xl font-display font-light tracking-tight text-[#F9F7F2]">
            {brand.brandName}
          </h1>
          <p className="text-lg sm:text-xl font-display text-[#F9F7F2]/80 border-l-2 border-[#F9F7F2]/40 pl-4">
            "{brand.tagline}"
          </p>
          <p className="text-sm font-sans font-light text-[#F9F7F2]/90 leading-relaxed pt-2">
            {brand.positioningStatement || brand.mission}
          </p>
        </div>
      </div>

      {/* 1.5 Plain-language orientation strip */}
      <div className="flex items-start gap-3 bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-4 sm:p-5">
        <div className="shrink-0 w-9 h-9 bg-[#1A1A1A] dark:bg-[#F9F7F2] text-[#F9F7F2] dark:text-[#1A1A1A] flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h3 className="text-[11px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
            Here&rsquo;s your complete brand identity
          </h3>
          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
            Everything below is ready to use: your <strong className="text-[#1A1A1A] dark:text-[#F9F7F2]">logo</strong>, your <strong className="text-[#1A1A1A] dark:text-[#F9F7F2]">colors</strong>, your <strong className="text-[#1A1A1A] dark:text-[#F9F7F2]">fonts</strong>, and the <strong className="text-[#1A1A1A] dark:text-[#F9F7F2]">rules of your brand voice</strong>. Tap a color to copy it, download your logo as a file, or open the Studio Suite when you want the full creative toolkit.
          </p>
        </div>
      </div>

      {/* 2. Visual Logomark Presentation */}
      <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1A1A1A] dark:text-[#F9F7F2]" />
              <h2 className="text-[11px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                Your Logo
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 font-display mt-0.5">
              {brand.logo.concept}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Background Selector */}
            <div className="inline-flex p-0.5 bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[9px] uppercase tracking-wider font-bold">
              <button
                type="button"
                onClick={() => setLogoBg('light')}
                className={`px-2 py-1 transition-all cursor-pointer ${logoBg === 'light' ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]' : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400'}`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setLogoBg('dark')}
                className={`px-2 py-1 transition-all cursor-pointer ${logoBg === 'dark' ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]' : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400'}`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setLogoBg('brand')}
                className={`px-2 py-1 transition-all cursor-pointer ${logoBg === 'brand' ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]' : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400'}`}
              >
                Accent
              </button>
            </div>

            {/* SVG copy / Download */}
            <button
              onClick={handleCopySvg}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[9px] uppercase tracking-widest font-bold text-gray-800 dark:text-zinc-200 transition-colors cursor-pointer"
              title="Copy the logo as vector (SVG) code — handy for developers"
              id="simple-view-copy-svg-btn"
            >
              {copiedSvg ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSvg ? 'Copied' : 'Copy Logo'}</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[9px] uppercase tracking-widest font-bold hover:opacity-85 transition-opacity cursor-pointer"
              title="Download the logo as a vector (SVG) file"
              id="simple-view-download-svg-btn"
            >
              <Download className="w-3 h-3" />
              <span>Download Logo</span>
            </button>
          </div>
        </div>

        {/* Vector Display Canvas */}
        <div
          className={`mt-6 p-8 sm:p-12 flex items-center justify-center min-h-[220px] transition-colors duration-300 border border-dashed ${
            logoBg === 'light'
              ? 'bg-[#FAF8F5] text-[#1A1A1A] border-gray-300 dark:border-gray-300'
              : logoBg === 'dark'
              ? 'bg-[#141413] text-[#F9F7F2] border-zinc-800'
              : 'border-transparent text-white'
          }`}
          style={logoBg === 'brand' ? { backgroundColor: primaryColor } : undefined}
        >
          <div
            className="w-full max-w-md max-h-[160px] flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.logo.primaryLogoSvg) }}
          />
        </div>
      </div>

      {/* 3. Essential 5-Color Harmony */}
      <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#1A1A1A] dark:text-[#F9F7F2]" />
            <h2 className="text-[11px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              Your Colors
            </h2>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-gray-500 dark:text-zinc-400 font-bold">
            Tap a color to copy it
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-zinc-400 font-display mt-3">
          These five colors are the foundation of your brand. Use them on your website, social posts, packaging, and everywhere else.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          {brand.palette.map((color, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleCopyHex(color.hex)}
              className="text-left p-3.5 bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 hover:border-[#1A1A1A] dark:hover:border-[#F9F7F2] transition-all cursor-pointer group"
              title={`Click to copy ${color.hex}`}
            >
              <div
                className="w-full h-16 border border-black/10 dark:border-white/10 mb-3 relative flex items-end justify-end p-1.5"
                style={{ backgroundColor: color.hex }}
              >
                {copiedHex === color.hex && (
                  <span className="px-1.5 py-0.5 bg-black/80 text-white text-[8px] font-mono tracking-wider font-bold">
                    Copied!
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-zinc-300 inline-block">
                  {color.role}
                </span>
                <p className="text-xs font-bold text-[#1A1A1A] dark:text-[#F9F7F2] truncate">
                  {color.name}
                </p>
                <p className="text-[10px] font-mono text-gray-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>{color.hex}</span>
                  <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Typographic Pairings */}
      <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-[#1A1A1A] dark:text-[#F9F7F2]" />
            <h2 className="text-[11px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              Your Fonts
            </h2>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-gray-500 dark:text-zinc-400 font-bold">
            Try typing below
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-zinc-400 font-display mt-3">
          One font for big headlines and one for everyday text. Type in the box at the bottom to see how they look together.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Heading Font */}
          <div className="p-5 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest font-black text-gray-500 dark:text-zinc-400">
                Primary Display Font
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-gray-200 dark:bg-zinc-800">
                {brand.typography.headingFontCategory}
              </span>
            </div>
            <h3
              className="text-3xl sm:text-4xl text-[#1A1A1A] dark:text-[#F9F7F2] font-semibold"
              style={{ fontFamily: `'${brand.typography.headingFont}', serif, sans-serif` }}
            >
              {brand.typography.headingFont}
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 font-display">
              {brand.typography.rationale}
            </p>
          </div>

          {/* Body Font */}
          <div className="p-5 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest font-black text-gray-500 dark:text-zinc-400">
                Body &amp; Editorial Font
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-gray-200 dark:bg-zinc-800">
                {brand.typography.bodyFontCategory}
              </span>
            </div>
            <h3
              className="text-2xl sm:text-3xl text-[#1A1A1A] dark:text-[#F9F7F2]"
              style={{ fontFamily: `'${brand.typography.bodyFont}', sans-serif` }}
            >
              {brand.typography.bodyFont}
            </h3>
            <p
              className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed font-normal"
              style={{ fontFamily: `'${brand.typography.bodyFont}', sans-serif` }}
            >
              Crafted for clean reading hierarchies, digital application user interfaces, packaging labels, and high-density editorial documentation.
            </p>
          </div>
        </div>

        {/* Editable live tester */}
        <div className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-2">
          <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 block">
            Test Sample Copy (Type below to preview live):
          </label>
          <input
            type="text"
            value={customSpecimenText}
            onChange={(e) => setCustomSpecimenText(e.target.value)}
            className="w-full px-3 py-2 text-base bg-white dark:bg-zinc-950 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-none focus:border-black dark:focus:border-white"
            style={{ fontFamily: `'${brand.typography.headingFont}', serif, sans-serif` }}
          />
        </div>
      </div>

      {/* 5. Core Values & Voice Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Values */}
        <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800">
            <Target className="w-4 h-4 text-[#1A1A1A] dark:text-[#F9F7F2]" />
            <h2 className="text-[11px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              What Your Brand Stands For
            </h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-zinc-400 font-display">
            The core beliefs that guide every decision your brand makes.
          </p>

          <div className="space-y-3">
            {brand.values.slice(0, 3).map((val, idx) => (
              <div key={idx} className="p-3.5 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-1">
                <span className="text-[9px] uppercase tracking-widest font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                  {val.title}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-400 font-sans leading-relaxed">
                  {val.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tone of Voice Quick Guide */}
        <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800">
            <ShieldCheck className="w-4 h-4 text-[#1A1A1A] dark:text-[#F9F7F2]" />
            <h2 className="text-[11px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              How Your Brand Sounds
            </h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-zinc-400 font-display">
            The personality your brand uses when it speaks — in posts, emails, and ads.
          </p>

          <div className="space-y-3">
            {brand.toneOfVoice.slice(0, 2).map((t, idx) => (
              <div key={idx} className="p-3.5 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-2">
                <span className="text-[9px] uppercase tracking-widest font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                  {t.trait}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-400 leading-relaxed font-display">
                  {t.description}
                </p>
                <div className="grid grid-cols-1 gap-1.5 pt-1 text-[11px]">
                  <div className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 border border-emerald-200 dark:border-emerald-900/50">
                    <strong className="uppercase text-[8px] tracking-wider block font-black">Do:</strong>
                    "{t.doExample}"
                  </div>
                  <div className="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 border border-rose-200 dark:border-rose-900/50">
                    <strong className="uppercase text-[8px] tracking-wider block font-black">Avoid:</strong>
                    "{t.dontExample}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Studio Mode Callout Banner */}
      <div className="bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#1A1A1A] dark:border-[#F9F7F2]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <h3 className="text-xs uppercase tracking-[0.25em] font-black">
              Need Deeper Creative Tools &amp; Assets?
            </h3>
          </div>
          <p className="text-xs opacity-80 font-display">
            Switch to Studio View for social post generators, viral topic ideas, 3D merchandise mockups, brand health audit scorecards, and live SVG geometry editors.
          </p>
        </div>

        <button
          type="button"
          onClick={onSwitchToStudio}
          className="flex items-center gap-2 px-5 py-3 bg-white text-[#1A1A1A] dark:bg-[#1A1A1A] dark:text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
          <span>Switch to Studio View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
