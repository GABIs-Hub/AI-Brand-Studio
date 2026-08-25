import { useState } from 'react';
import { FontPairing } from '../types';
import { Type, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';

interface TypographyTabProps {
  typography: FontPairing;
  brandName: string;
}

export function TypographyTab({ typography, brandName }: TypographyTabProps) {
  const [sampleText, setSampleText] = useState(
    `${brandName} crafts extraordinary experiences through modern design & engineering.`
  );
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedHeading, setCopiedHeading] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const copyCss = () => {
    navigator.clipboard.writeText(typography.cssSnippet);
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
          <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">Typography Pair</h2>
          <p className="font-serif italic text-lg opacity-80 mt-2 text-[#1A1A1A] dark:text-[#F9F7F2]">
            Curated typographic pairing for brand headers and body copy, loaded dynamically from Google Fonts.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">
          <a
            href={typography.googleFontsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <span>Open Google Fonts</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={copyCss}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
          >
            {copiedCss ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>Copy CSS</span>
          </button>
        </div>
      </div>

      {/* Interactive Sample Text Customizer */}
      <div className="bg-white dark:bg-[#1C1C1A] p-6 border border-[#1A1A1A] dark:border-[#F9F7F2]/20 rounded-none space-y-3">
        <label className="block text-[9px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
          Interactive Typography Specimen Input
        </label>
        <input
          type="text"
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          placeholder="Type custom text to preview font pairings live..."
          className="w-full bg-transparent border-b border-[#1A1A1A] dark:border-[#F9F7F2]/30 border-dashed px-0 py-2 text-xl font-serif italic text-[#1A1A1A] dark:text-[#F9F7F2] focus:border-solid focus:outline-hidden"
        />
      </div>

      <div className="space-y-6">
        {/* Header Font Specimen Card */}
        <div className="group relative bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-8 rounded-none space-y-6 transition-all duration-500 ease-out hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:z-10">
          <div className="flex flex-col border-b border-dashed border-[#1A1A1A]/30 dark:border-[#F9F7F2]/20 pb-4 relative overflow-hidden">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] opacity-50 mb-2 transition-transform duration-500 group-hover:translate-x-1">
              Header: {typography.headingFont} ({typography.headingFontCategory})
            </span>
            <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] opacity-40 transition-transform duration-500 group-hover:translate-x-1 delay-75">
              Weights: {typography.headingWeights.join(', ')}
            </span>
            <button
              onClick={() => copyFontName(typography.headingFont, 'heading')}
              className="absolute right-0 top-0 p-1.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 text-[#1A1A1A] dark:text-[#F9F7F2] hover:bg-[#1A1A1A]/5 dark:hover:bg-white/5 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold translate-y-2 group-hover:translate-y-0 cursor-pointer"
            >
              {copiedHeading ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Name</span>
            </button>
          </div>

          <div className="py-6 space-y-8 overflow-x-auto">
            <p
              style={{ fontFamily: `'${typography.headingFont}', serif, sans-serif` }}
              className="text-5xl md:text-7xl font-serif font-light tracking-tighter text-[#1A1A1A] dark:text-[#F9F7F2] leading-tight"
            >
              {sampleText}
            </p>
            <p
              style={{ fontFamily: `'${typography.headingFont}', serif, sans-serif` }}
              className="text-xl md:text-2xl text-[#1A1A1A] dark:text-[#F9F7F2] tracking-wider uppercase"
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
            </p>
          </div>
        </div>

        {/* Body Font Specimen Card */}
        <div className="group relative bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-8 rounded-none space-y-6 transition-all duration-500 ease-out hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:z-10">
          <div className="flex flex-col border-b border-dashed border-[#1A1A1A]/30 dark:border-[#F9F7F2]/20 pb-4 relative overflow-hidden">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] opacity-50 mb-2 transition-transform duration-500 group-hover:translate-x-1">
              Body: {typography.bodyFont} ({typography.bodyFontCategory})
            </span>
            <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] opacity-40 transition-transform duration-500 group-hover:translate-x-1 delay-75">
              Weights: {typography.bodyWeights.join(', ')}
            </span>
            <button
              onClick={() => copyFontName(typography.bodyFont, 'body')}
              className="absolute right-0 top-0 p-1.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 text-[#1A1A1A] dark:text-[#F9F7F2] hover:bg-[#1A1A1A]/5 dark:hover:bg-white/5 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold translate-y-2 group-hover:translate-y-0 cursor-pointer"
            >
              {copiedBody ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Name</span>
            </button>
          </div>

          <div className="py-6 space-y-6">
            <p
              style={{ fontFamily: `'${typography.bodyFont}', sans-serif` }}
              className="text-xl md:text-2xl font-light text-[#1A1A1A] dark:text-[#F9F7F2] leading-relaxed"
            >
              {sampleText}
            </p>
            <p
              style={{ fontFamily: `'${typography.bodyFont}', sans-serif` }}
              className="text-base text-[#1A1A1A]/80 dark:text-[#F9F7F2]/80 leading-relaxed font-light max-w-4xl"
            >
              Typography forms the backbone of digital communication. Selecting the right body typeface ensures maximum legibility, comfortable reading cadence across dense information dashboards, and harmonious brand personality expression.
            </p>
          </div>
        </div>
      </div>

      {/* Typography Rationale & Code Snippet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] dark:bg-[#111110] text-[#F9F7F2] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-8 rounded-none space-y-4 flex flex-col justify-center">
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-3 mb-2 text-[#F9F7F2]">
            <Sparkles className="w-4 h-4" />
            <span>Pairing Rationale</span>
          </h3>
          <p className="font-serif italic text-lg opacity-80 leading-relaxed text-[#F9F7F2]">{typography.rationale}</p>
        </div>

        <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-8 rounded-none space-y-6 flex flex-col">
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
            {typography.cssSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
