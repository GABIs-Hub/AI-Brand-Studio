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

  const copyCss = () => {
    navigator.clipboard.writeText(typography.cssSnippet);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#1A1A1A] pb-4">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A]">Typography Pair</h2>
          <p className="font-serif italic text-lg opacity-80 mt-2">
            Curated typographic pairing for brand headers and body copy, loaded dynamically from Google Fonts.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest font-bold">
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
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            {copiedCss ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>Copy CSS</span>
          </button>
        </div>
      </div>

      {/* Interactive Sample Text Customizer */}
      <div className="bg-white p-6 border border-[#1A1A1A] rounded-none space-y-3">
        <label className="block text-[9px] uppercase tracking-[0.3em] font-black text-[#1A1A1A]">
          Interactive Typography Specimen Input
        </label>
        <input
          type="text"
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          placeholder="Type custom text to preview font pairings live..."
          className="w-full bg-transparent border-b border-[#1A1A1A] border-dashed px-0 py-2 text-xl font-serif italic text-[#1A1A1A] focus:border-solid focus:outline-hidden"
        />
      </div>

      <div className="space-y-6">
        {/* Header Font Specimen Card */}
        <div className="bg-white border border-[#1A1A1A] p-8 rounded-none space-y-6">
          <div className="flex flex-col border-b border-dashed border-[#1A1A1A]/30 pb-4">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-2">
              Header: {typography.headingFont} ({typography.headingFontCategory})
            </span>
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">
              Weights: {typography.headingWeights.join(', ')}
            </span>
          </div>

          <div className="py-6 space-y-8 overflow-x-auto">
            <p
              style={{ fontFamily: `'${typography.headingFont}', serif, sans-serif` }}
              className="text-5xl md:text-7xl font-serif font-light tracking-tighter text-[#1A1A1A] leading-tight"
            >
              {sampleText}
            </p>
            <p
              style={{ fontFamily: `'${typography.headingFont}', serif, sans-serif` }}
              className="text-xl md:text-2xl text-[#1A1A1A] tracking-wider uppercase"
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
            </p>
          </div>
        </div>

        {/* Body Font Specimen Card */}
        <div className="bg-white border border-[#1A1A1A] p-8 rounded-none space-y-6">
          <div className="flex flex-col border-b border-dashed border-[#1A1A1A]/30 pb-4">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-2">
              Body: {typography.bodyFont} ({typography.bodyFontCategory})
            </span>
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">
              Weights: {typography.bodyWeights.join(', ')}
            </span>
          </div>

          <div className="py-6 space-y-6">
            <p
              style={{ fontFamily: `'${typography.bodyFont}', sans-serif` }}
              className="text-xl md:text-2xl font-light text-[#1A1A1A] leading-relaxed"
            >
              {sampleText}
            </p>
            <p
              style={{ fontFamily: `'${typography.bodyFont}', sans-serif` }}
              className="text-base text-[#1A1A1A]/80 leading-relaxed font-light max-w-4xl"
            >
              Typography forms the backbone of digital communication. Selecting the right body typeface ensures maximum legibility, comfortable reading cadence across dense information dashboards, and harmonious brand personality expression.
            </p>
          </div>
        </div>
      </div>

      {/* Typography Rationale & Code Snippet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] text-[#F9F7F2] border border-[#1A1A1A] p-8 rounded-none space-y-4 flex flex-col justify-center">
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-3 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Pairing Rationale</span>
          </h3>
          <p className="font-serif italic text-lg opacity-80 leading-relaxed">{typography.rationale}</p>
        </div>

        <div className="bg-white border border-[#1A1A1A] p-8 rounded-none space-y-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-dashed border-[#1A1A1A]/30 pb-4">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A]">CSS Declarations</h3>
            <button
              onClick={copyCss}
              className="text-[9px] uppercase tracking-widest font-bold hover:opacity-70 transition-opacity"
            >
              {copiedCss ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="text-sm font-mono text-[#1A1A1A] overflow-x-auto leading-relaxed flex-grow">
            {typography.cssSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
