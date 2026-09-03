import { useState } from 'react';
import { BrandColor } from '../types';
import { Copy, Check, Info, Code2, Terminal, ShieldCheck } from 'lucide-react';
import { ColorAccessibilityMatrix } from './ColorAccessibilityMatrix';

interface PaletteTabProps {
  palette: BrandColor[];
}

export function PaletteTab({ palette }: PaletteTabProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<'css' | 'tailwind' | 'json' | 'scss'>('css');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (label.startsWith('#')) {
      setCopiedHex(label);
      setTimeout(() => setCopiedHex(null), 2500);
    } else {
      setCopiedSnippet(label);
      setTimeout(() => setCopiedSnippet(null), 2500);
    }
  };

  // Generate CSS Variables code
  const cssVariablesSnippet = `:root {\n` +
    palette.map((c) => `  --color-${c.role.toLowerCase().replace(/\s+/g, '-')}: ${c.hex}; /* ${c.name} */`).join('\n') +
    `\n}`;

  // Generate Tailwind config snippet
  const tailwindConfigSnippet = `// tailwind.config.js / tailwind.config.ts\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n` +
    palette.map((c) => `        'brand-${c.role.toLowerCase().replace(/\s+/g, '-')}': '${c.hex}', // ${c.name}`).join('\n') +
    `\n      }\n    }\n  }\n};`;

  // Generate JSON snippet
  const jsonSnippet = JSON.stringify(
    palette.reduce((acc, c) => {
      acc[c.role.toLowerCase().replace(/\s+/g, '_')] = {
        name: c.name,
        hex: c.hex,
        rgb: c.rgb,
        usage: c.usage,
      };
      return acc;
    }, {} as Record<string, any>),
    null,
    2
  );

  // Generate SCSS variables
  const scssSnippet = palette
    .map((c) => `$brand-${c.role.toLowerCase().replace(/\s+/g, '-')}: ${c.hex}; // ${c.name}`)
    .join('\n');

  const getCurrentSnippet = () => {
    switch (activeFormat) {
      case 'tailwind':
        return tailwindConfigSnippet;
      case 'json':
        return jsonSnippet;
      case 'scss':
        return scssSnippet;
      case 'css':
      default:
        return cssVariablesSnippet;
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification for Hex Copy */}
      {copiedHex && (
        <div
          className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] dark:bg-[#F9F7F2] text-white dark:text-[#1A1A1A] px-5 py-3 border border-[#F9F7F2]/20 dark:border-[#1A1A1A]/20 shadow-2xl flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
          id="hex-copied-toast"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-widest font-black opacity-60">Color Copied</span>
            <span className="text-xs font-mono font-bold tracking-wider">{copiedHex} successfully copied</span>
          </div>
        </div>
      )}

      {/* Toast Notification for Code Snippet Copy */}
      {copiedSnippet && (
        <div
          className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] dark:bg-[#F9F7F2] text-white dark:text-[#1A1A1A] px-5 py-3 border border-[#F9F7F2]/20 dark:border-[#1A1A1A]/20 shadow-2xl flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
          id="snippet-copied-toast"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase tracking-widest font-black opacity-60">Snippet Copied</span>
            <span className="text-xs font-mono font-bold tracking-wider">{copiedSnippet} copied to clipboard</span>
          </div>
        </div>
      )}

      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 pb-4 transition-colors duration-300">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">5-Color Brand Palette</h2>
          <p className="font-serif italic text-lg opacity-80 mt-2 text-[#1A1A1A] dark:text-[#F9F7F2]">
            Curated 5-color hex palette with strict semantic roles, contrast compliance, and digital usage rules.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => copyToClipboard(cssVariablesSnippet, 'CSS Variables')}
            className="px-3 py-1.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer text-[#1A1A1A] dark:text-[#F9F7F2]"
            id="quick-copy-css-btn"
          >
            {copiedSnippet === 'CSS Variables' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy CSS</span>
          </button>
          <button
            onClick={() => copyToClipboard(tailwindConfigSnippet, 'Tailwind Config')}
            className="px-3 py-1.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer text-[#1A1A1A] dark:text-[#F9F7F2]"
            id="quick-copy-tailwind-btn"
          >
            {copiedSnippet === 'Tailwind Config' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Tailwind</span>
          </button>
        </div>
      </div>

      {/* Swatch Bar Overview */}
      <div className="h-24 w-full flex border-y border-[#1A1A1A] dark:border-[#F9F7F2]/20 transition-colors duration-300">
        {palette.map((color, i) => (
          <div
            key={color.role}
            style={{ backgroundColor: color.hex }}
            className={`h-full flex-1 group relative transition-all hover:flex-[1.5] flex items-end p-3 ${i !== palette.length - 1 ? 'border-r border-[#1A1A1A] dark:border-[#F9F7F2]/20' : ''}`}
          >
            <span
              className={`text-[10px] font-mono font-bold px-2 py-1 bg-white dark:bg-zinc-900 text-[#1A1A1A] dark:text-[#F9F7F2] border border-[#1A1A1A] dark:border-[#F9F7F2]/30 opacity-0 group-hover:opacity-100 transition-opacity`}
            >
              {color.hex}
            </span>
          </div>
        ))}
      </div>

      {/* Detailed Color Cards Grid */}
      <div className="flex flex-col flex-grow">
        {palette.map((color, i) => {
          const isLight = color.role === 'Neutral Light';
          const textColorClass = isLight ? 'text-[#1A1A1A]' : 'text-white';

          return (
            <div
              key={color.role}
              className={`group flex-1 flex flex-col sm:flex-row justify-between border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 transition-all duration-500 ease-out hover:z-10 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 origin-center relative ${i === 0 ? 'border-t' : ''}`}
              style={{ backgroundColor: color.hex }}
              id={`color-card-${color.role.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className={`p-6 flex flex-col justify-between ${textColorClass} w-full sm:w-1/3 min-h-[140px] border-r border-transparent sm:border-[#1A1A1A]/20 dark:sm:border-[#F9F7F2]/10`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest transition-transform duration-500 group-hover:translate-x-1">{color.role}</span>
                  <button
                    onClick={() => copyToClipboard(color.hex, color.hex)}
                    className="p-1.5 border border-current hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold translate-y-2 group-hover:translate-y-0 cursor-pointer"
                    id={`copy-color-btn-${color.hex.replace('#', '')}`}
                  >
                    {copiedHex === color.hex ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="font-mono">{color.hex}</span>
                  </button>
                </div>
                <div>
                  <h3 className="font-serif italic text-2xl font-light tracking-tighter">{color.name}</h3>
                  <p className="text-[9px] uppercase font-bold tracking-widest opacity-70 mt-1">RGB({color.rgb})</p>
                </div>
              </div>

              <div className={`p-6 flex flex-col justify-center space-y-3 ${textColorClass} w-full sm:w-2/3 transition-transform duration-500 group-hover:translate-x-2`}>
                <p className="font-sans font-light text-sm leading-relaxed opacity-90">{color.usage}</p>
                <div className="pt-3 border-t border-current/20 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">{color.contrastNote}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive WCAG 2.1 Color Accessibility & Contrast Audit Matrix */}
      <div className="pt-4">
        <ColorAccessibilityMatrix palette={palette} />
      </div>

      {/* Palette Export Snippets Box with Multi-Format Selector and 1-Click Copy */}
      <div className="bg-[#1A1A1A] dark:bg-[#1E1E1C] text-white dark:text-[#F9F7F2] p-6 sm:p-8 space-y-6 border border-[#1A1A1A] dark:border-[#F9F7F2]/10 rounded-none mt-8 transition-colors duration-300 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dashed border-white/20 pb-4">
          <div className="flex items-center gap-3">
            <Code2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-[11px] uppercase tracking-[0.25em] font-black">Developer Color Snippet</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Format Selector Pills */}
            <div className="inline-flex p-0.5 bg-black/40 border border-white/20">
              <button
                type="button"
                onClick={() => setActiveFormat('css')}
                className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
                  activeFormat === 'css' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                CSS Var
              </button>
              <button
                type="button"
                onClick={() => setActiveFormat('tailwind')}
                className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
                  activeFormat === 'tailwind' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                Tailwind
              </button>
              <button
                type="button"
                onClick={() => setActiveFormat('scss')}
                className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
                  activeFormat === 'scss' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                SCSS
              </button>
              <button
                type="button"
                onClick={() => setActiveFormat('json')}
                className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
                  activeFormat === 'json' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                JSON
              </button>
            </div>

            {/* Direct Copy Code Action Button */}
            <button
              type="button"
              onClick={() => copyToClipboard(getCurrentSnippet(), `${activeFormat.toUpperCase()} Code`)}
              className="px-4 py-1.5 bg-white hover:bg-amber-400 text-black text-[9px] uppercase tracking-widest font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              id="copy-developer-code-btn"
            >
              {copiedSnippet === `${activeFormat.toUpperCase()} Code` ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between text-[8px] font-mono text-white/40 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              <span>{activeFormat.toUpperCase()} Export</span>
            </span>
            <span>Click &apos;Copy Code&apos; to paste into your codebase</span>
          </div>
          <pre className="p-4 bg-black/60 border border-white/10 text-xs font-mono text-white/90 overflow-x-auto leading-relaxed max-h-60 selection:bg-amber-400 selection:text-black">
            {getCurrentSnippet()}
          </pre>
        </div>
      </div>
    </div>
  );
}
