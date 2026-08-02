import { useState } from 'react';
import { BrandColor } from '../types';
import { Copy, Check, Info, ShieldAlert, Sparkles } from 'lucide-react';

interface PaletteTabProps {
  palette: BrandColor[];
}

export function PaletteTab({ palette }: PaletteTabProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (label.startsWith('#')) {
      setCopiedHex(label);
      setTimeout(() => setCopiedHex(null), 2000);
    } else {
      setCopiedSnippet(label);
      setTimeout(() => setCopiedSnippet(null), 2000);
    }
  };

  // Generate CSS Variables code
  const cssVariablesSnippet = `:root {\n` +
    palette.map((c) => `  --color-${c.role.toLowerCase().replace(/\s+/g, '-')}: ${c.hex}; /* ${c.name} */`).join('\n') +
    `\n}`;

  // Generate Tailwind config snippet
  const tailwindConfigSnippet = `// tailwind.config.js\ncolors: {\n` +
    palette.map((c) => `  'brand-${c.role.toLowerCase().replace(/\s+/g, '-')}': '${c.hex}',`).join('\n') +
    `\n}`;

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#1A1A1A] pb-4">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A]">5-Color Brand Palette</h2>
          <p className="font-serif italic text-lg opacity-80 mt-2">
            Curated 5-color hex palette with strict semantic roles, contrast compliance, and digital usage rules.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => copyToClipboard(cssVariablesSnippet, 'css')}
            className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            {copiedSnippet === 'css' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>Copy CSS Vars</span>
          </button>
          <button
            onClick={() => copyToClipboard(tailwindConfigSnippet, 'tailwind')}
            className="text-[9px] uppercase tracking-widest font-bold flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            {copiedSnippet === 'tailwind' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>Copy Tailwind Config</span>
          </button>
        </div>
      </div>

      {/* Swatch Bar Overview */}
      <div className="h-24 w-full flex border-y border-[#1A1A1A]">
        {palette.map((color, i) => (
          <div
            key={color.role}
            style={{ backgroundColor: color.hex }}
            className={`h-full flex-1 group relative transition-all hover:flex-[1.5] flex items-end p-3 ${i !== palette.length - 1 ? 'border-r border-[#1A1A1A]' : ''}`}
          >
            <span
              className={`text-[10px] font-mono font-bold px-2 py-1 bg-white text-[#1A1A1A] border border-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity`}
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
              className={`group flex-1 flex flex-col sm:flex-row justify-between border-b border-[#1A1A1A] transition-all duration-500 ease-out hover:z-10 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 origin-center relative ${i === 0 ? 'border-t' : ''}`}
              style={{ backgroundColor: color.hex }}
            >
              <div className={`p-6 flex flex-col justify-between ${textColorClass} w-full sm:w-1/3 min-h-[140px] border-r border-transparent sm:border-[#1A1A1A]/20`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest transition-transform duration-500 group-hover:translate-x-1">{color.role}</span>
                  <button
                    onClick={() => copyToClipboard(color.hex, color.hex)}
                    className="p-1.5 border border-current hover:bg-black/10 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold translate-y-2 group-hover:translate-y-0"
                  >
                    {copiedHex === color.hex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
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

      {/* Palette Export Snippets Box */}
      <div className="bg-[#1A1A1A] text-white p-8 space-y-6 border border-[#1A1A1A] rounded-none mt-8">
        <div className="flex items-center justify-between border-b border-dashed border-white/30 pb-4">
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-3">
            <Sparkles className="w-4 h-4" />
            <span>Developer Code Snippet</span>
          </h3>
          <span className="text-[9px] uppercase tracking-widest font-bold opacity-50">CSS Custom Properties</span>
        </div>
        <pre className="text-sm font-mono text-white/80 overflow-x-auto leading-relaxed">
          {cssVariablesSnippet}
        </pre>
      </div>
    </div>
  );
}
