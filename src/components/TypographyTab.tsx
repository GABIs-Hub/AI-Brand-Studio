import { useState, useEffect } from 'react';
import { FontPairing } from '../types';
import { Type, ExternalLink, Copy, Check, Sparkles, SlidersHorizontal } from 'lucide-react';
import { FontPickerModal } from './FontPickerModal';
import {
  CURATED_GOOGLE_FONT_PAIRINGS,
  loadGoogleFontDynamically,
  buildGoogleFontEmbedUrl,
} from '../data/googleFontsCatalog';

interface TypographyTabProps {
  typography: FontPairing;
  brandName: string;
}

export function TypographyTab({ typography = {} as FontPairing, brandName }: TypographyTabProps) {
  const [headingFont, setHeadingFont] = useState(typography.headingFont || 'Plus Jakarta Sans');
  const [bodyFont, setBodyFont] = useState(typography.bodyFont || 'Inter');
  const [sampleText, setSampleText] = useState(
    `${brandName} crafts extraordinary experiences through modern design & engineering.`
  );
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedHeading, setCopiedHeading] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [fontPickerRole, setFontPickerRole] = useState<'heading' | 'body'>('heading');

  // Sync if typography prop changes
  useEffect(() => {
    if (typography.headingFont) setHeadingFont(typography.headingFont);
    if (typography.bodyFont) setBodyFont(typography.bodyFont);
  }, [typography.headingFont, typography.bodyFont]);

  // Dynamically load Google Fonts when selected
  useEffect(() => {
    if (headingFont) loadGoogleFontDynamically(headingFont);
  }, [headingFont]);

  useEffect(() => {
    if (bodyFont) loadGoogleFontDynamically(bodyFont);
  }, [bodyFont]);

  const activeFontsUrl = `https://fonts.google.com/specimen/${encodeURIComponent(headingFont.replace(/ /g, '+'))}`;

  const dynamicCssSnippet = `/* Heading Typography */
font-family: '${headingFont}', sans-serif;
font-weight: 700;
letter-spacing: -0.02em;

/* Body Typography */
font-family: '${bodyFont}', sans-serif;
font-weight: 400;
line-height: 1.6;`;

  const copyCss = () => {
    navigator.clipboard.writeText(dynamicCssSnippet);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const copyFontName = (name: string, type: 'heading' | 'body') => {
    navigator.clipboard.writeText(name);
    if (type === 'heading') {
      setCopiedHeading(true);
      setTimeout(() => setCopiedHeading(false), 2000);
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              Typography System
            </h2>
            <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-blue-600 text-white rounded">
              Google Fonts
            </span>
          </div>
          <p className="font-display text-lg opacity-80 mt-2 text-[#1A1A1A] dark:text-[#F9F7F2]">
            Vast typography pairing engine powered by Google Fonts. Test, customize, or switch typefaces live.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">
          <button
            type="button"
            onClick={() => {
              setFontPickerRole('heading');
              setIsFontPickerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Browse 100+ Fonts</span>
          </button>
          <a
            href={activeFontsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-black/20 dark:border-white/20 hover:opacity-70 transition-opacity"
          >
            <span>fonts.google.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={copyCss}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-black/20 dark:border-white/20 hover:opacity-70 transition-opacity cursor-pointer"
          >
            {copiedCss ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy CSS</span>
          </button>
        </div>
      </div>

      {/* 1-Click Curated Google Fonts Pairings Bar */}
      <div className="bg-white dark:bg-[#1C1C1A] p-4 border border-[#1A1A1A] dark:border-[#F9F7F2]/20 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.25em] font-black text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Curated Google Font Pairings</span>
          </span>
          <span className="text-[9px] text-gray-400 font-mono">
            Click to instantly apply to Brand Bible
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {CURATED_GOOGLE_FONT_PAIRINGS.map((pairing) => {
            const isCurrent =
              headingFont.toLowerCase() === pairing.headingFont.toLowerCase() &&
              bodyFont.toLowerCase() === pairing.bodyFont.toLowerCase();
            return (
              <button
                key={pairing.name}
                type="button"
                onClick={() => {
                  setHeadingFont(pairing.headingFont);
                  setBodyFont(pairing.bodyFont);
                  loadGoogleFontDynamically(pairing.headingFont);
                  loadGoogleFontDynamically(pairing.bodyFont);
                }}
                className={`px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider border rounded-sm transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-600 font-black shadow-xs'
                    : 'bg-transparent text-gray-700 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:border-blue-500'
                }`}
              >
                {pairing.name} — <span className="font-mono text-[8px] opacity-80">{pairing.headingFont} + {pairing.bodyFont}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Sample Text Customizer */}
      <div className="bg-white dark:bg-[#1C1C1A] p-6 border border-[#1A1A1A] dark:border-[#F9F7F2]/20 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-[9px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
            Interactive Typography Specimen Input
          </label>
          <span className="text-[9px] font-mono text-gray-400">
            Real-time optical rendering
          </span>
        </div>
        <input
          type="text"
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          placeholder="Type custom text to preview font pairings live..."
          className="w-full bg-transparent border-b border-[#1A1A1A] dark:border-[#F9F7F2]/30 border-dashed px-0 py-2 text-xl font-display text-[#1A1A1A] dark:text-[#F9F7F2] focus:border-solid focus:outline-hidden"
        />
      </div>

      <div className="space-y-6">
        {/* Header Font Specimen Card */}
        <div className="group relative bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-8 rounded-xl space-y-6 transition-all duration-500 ease-out hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dashed border-[#1A1A1A]/30 dark:border-[#F9F7F2]/20 pb-4 gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] opacity-70 block mb-1">
                Header Typeface: <strong className="text-black dark:text-white font-black">{headingFont}</strong>
              </span>
              <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] opacity-40">
                Source: Google Fonts Catalog
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFontPickerRole('heading');
                  setIsFontPickerOpen(true);
                }}
                className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 hover:bg-blue-600 hover:text-white rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <Type className="w-3 h-3" />
                <span>Switch Header Font</span>
              </button>
              <button
                onClick={() => copyFontName(headingFont, 'heading')}
                className="p-1.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 text-[#1A1A1A] dark:text-[#F9F7F2] hover:bg-[#1A1A1A]/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold cursor-pointer"
              >
                {copiedHeading ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
          </div>

          <div className="py-6 space-y-8 overflow-x-auto">
            <p
              style={{ fontFamily: `'${headingFont}', serif, sans-serif` }}
              className="text-5xl md:text-7xl font-display font-light tracking-tighter text-[#1A1A1A] dark:text-[#F9F7F2] leading-tight"
            >
              {sampleText}
            </p>
            <p
              style={{ fontFamily: `'${headingFont}', serif, sans-serif` }}
              className="text-xl md:text-2xl text-[#1A1A1A] dark:text-[#F9F7F2] tracking-wider uppercase"
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
            </p>
          </div>
        </div>

        {/* Body Font Specimen Card */}
        <div className="group relative bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-8 rounded-xl space-y-6 transition-all duration-500 ease-out hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dashed border-[#1A1A1A]/30 dark:border-[#F9F7F2]/20 pb-4 gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] opacity-70 block mb-1">
                Body Typeface: <strong className="text-black dark:text-white font-black">{bodyFont}</strong>
              </span>
              <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] opacity-40">
                Source: Google Fonts Catalog
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFontPickerRole('body');
                  setIsFontPickerOpen(true);
                }}
                className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 hover:bg-blue-600 hover:text-white rounded transition-colors cursor-pointer flex items-center gap-1"
              >
                <Type className="w-3 h-3" />
                <span>Switch Body Font</span>
              </button>
              <button
                onClick={() => copyFontName(bodyFont, 'body')}
                className="p-1.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 text-[#1A1A1A] dark:text-[#F9F7F2] hover:bg-[#1A1A1A]/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold cursor-pointer"
              >
                {copiedBody ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
          </div>

          <div className="py-6 space-y-6">
            <p
              style={{ fontFamily: `'${bodyFont}', sans-serif` }}
              className="text-xl md:text-2xl font-light text-[#1A1A1A] dark:text-[#F9F7F2] leading-relaxed"
            >
              {sampleText}
            </p>
            <p
              style={{ fontFamily: `'${bodyFont}', sans-serif` }}
              className="text-base text-[#1A1A1A]/80 dark:text-[#F9F7F2]/80 leading-relaxed font-light max-w-4xl"
            >
              Typography forms the backbone of digital communication. Selecting the right body typeface ensures maximum legibility, comfortable reading cadence across dense information dashboards, and harmonious brand personality expression.
            </p>
          </div>
        </div>
      </div>

      {/* Typography Rationale & Code Snippet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] dark:bg-[#111110] text-[#F9F7F2] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-8 rounded-xl space-y-4 flex flex-col justify-center">
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-3 mb-2 text-[#F9F7F2]">
            <Sparkles className="w-4 h-4" />
            <span>Pairing Rationale</span>
          </h3>
          <p className="font-display text-lg opacity-80 leading-relaxed text-[#F9F7F2]">
            {typography.rationale || `Balanced pairing combining ${headingFont} for high-impact structural authority with ${bodyFont} for sustained rhythmic reading.`}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-8 rounded-xl space-y-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-dashed border-[#1A1A1A]/30 dark:border-[#F9F7F2]/20 pb-4">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">CSS Declarations</h3>
            <button
              onClick={copyCss}
              className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] hover:opacity-70 transition-opacity cursor-pointer"
            >
              {copiedCss ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="text-sm font-mono text-[#1A1A1A] dark:text-[#F9F7F2] overflow-x-auto leading-relaxed flex-grow">
            {dynamicCssSnippet}
          </pre>
        </div>
      </div>

      {/* Vast Google Fonts Picker Modal */}
      <FontPickerModal
        isOpen={isFontPickerOpen}
        onClose={() => setIsFontPickerOpen(false)}
        onSelectFont={(fontName) => {
          if (fontPickerRole === 'heading') {
            setHeadingFont(fontName);
          } else {
            setBodyFont(fontName);
          }
          loadGoogleFontDynamically(fontName);
        }}
        onSelectPairing={(pairing) => {
          setHeadingFont(pairing.headingFont);
          setBodyFont(pairing.bodyFont);
          loadGoogleFontDynamically(pairing.headingFont);
          loadGoogleFontDynamically(pairing.bodyFont);
        }}
        currentHeadingFont={headingFont}
        currentBodyFont={bodyFont}
        targetRole={fontPickerRole}
      />
    </div>
  );
}
