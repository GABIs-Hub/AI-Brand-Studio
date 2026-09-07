import React, { useState, useEffect } from 'react';
import { BrandBible, LogoVariation, LogoArchetype } from '../types';
import { sanitizeSvg } from '../utils/sanitizeSvg';
import { LogoRenderSkeleton } from './LogoRenderSkeleton';
import {
  Sparkles,
  Download,
  Check,
  Layers,
  Wand2,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
  Shield,
  Layout,
  Maximize2,
  Minimize2,
  Compass,
  Zap,
} from 'lucide-react';

interface LogoArchetypeStudioProps {
  brand: BrandBible;
  onUpdatePrimaryLogo: (svg: string, concept: string, symbolism: string, geometry: string) => void;
}

const ARCHETYPE_DESCRIPTIONS: Record<LogoArchetype, { title: string; subtitle: string; icon: string }> = {
  negative_space: {
    title: 'Negative Space Mark',
    subtitle: 'Clever optical illusion cutout revealing secondary storytelling symbols.',
    icon: 'Eye',
  },
  interlocking_monogram: {
    title: 'Dynamic Monogram',
    subtitle: 'Intertwining woven typographic ribbon curves engineered with golden ratio balance.',
    icon: 'Layers',
  },
  abstract_emblem: {
    title: 'Abstract Kinetic Emblem',
    subtitle: 'Isometric dimensional prism & kinetic metaphor symbolizing multi-plane acceleration.',
    icon: 'Zap',
  },
  architectural_badge: {
    title: 'Architectural Heritage Seal',
    subtitle: 'Concentric precision rings, micro-perforations, and certified hallmark crest.',
    icon: 'Shield',
  },
  geometric_minimalist: {
    title: 'Bauhaus Minimalist',
    subtitle: 'Strict geometric purity, essential mathematical balance, zero unnecessary noise.',
    icon: 'Compass',
  },
  modern_wordmark: {
    title: 'Modern Responsive Lockup',
    subtitle: 'Complete horizontal lockup pairing custom vector symbol with letterspaced wordmark.',
    icon: 'Layout',
  },
};

const BACKGROUND_OPTIONS = [
  { id: 'light', label: 'Light Canvas', class: 'bg-[#FAF9F6] text-[#111827]' },
  { id: 'dark', label: 'Dark Noir', class: 'bg-[#111110] text-[#F9F7F2]' },
  { id: 'primary', label: 'Brand Primary', class: 'bg-[#1A1A1A] text-white' },
  { id: 'slate', label: 'Studio Slate', class: 'bg-[#1E293B] text-white' },
];

export function LogoArchetypeStudio({ brand, onUpdatePrimaryLogo }: LogoArchetypeStudioProps) {
  const [variations, setVariations] = useState<LogoVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<LogoVariation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [previewBg, setPreviewBg] = useState<'light' | 'dark' | 'primary' | 'slate'>('light');
  const [customStylePrompt, setCustomStylePrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchVariations = async (stylePrompt?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/generate-logo-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brand.brandName,
          industry: brand.industry,
          mission: brand.mission,
          palette: brand.palette,
          typography: brand.typography,
          stylePrompt: stylePrompt || customStylePrompt,
        }),
      });

      let data: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Logo variations service returned an unexpected response format.');
        }
      }

      if (!response.ok || !data) {
        throw new Error(data?.error || 'Failed to generate logo variations.');
      }

      if (data.variations && data.variations.length > 0) {
        setVariations(data.variations);
        setSelectedVariation(data.variations[0]);
      }
    } catch (err: any) {
      console.error('Logo variations fetch error:', err);
      setErrorMsg(err.message || 'Error fetching logo archetype variations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVariations();
  }, [brand.brandName]);

  const downloadSvg = (svgContent: string, filename: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copySvgText = (svgContent: string, id: string) => {
    navigator.clipboard.writeText(svgContent);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyAsPrimary = (variation: LogoVariation) => {
    onUpdatePrimaryLogo(variation.svg, variation.concept, variation.symbolism, variation.geometryDetails);
    setAppliedId(variation.id);
    setTimeout(() => setAppliedId(null), 3000);
  };

  const currentBgClass = BACKGROUND_OPTIONS.find((b) => b.id === previewBg)?.class || 'bg-[#FAF9F6] text-[#111827]';

  return (
    <div className="space-y-8" id="logo-archetype-studio">
      {/* Header & Directive Bar */}
      <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] uppercase tracking-[0.3em] font-black bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] px-2 py-0.5">
                Agency Studio Engine
              </span>
              <span className="text-[9px] uppercase tracking-widest font-mono text-gray-500 dark:text-gray-500">
                6 Archetypes Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif italic text-[#1A1A1A] dark:text-[#F9F7F2]">
              Elevated Logo Archetype Studio
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-400 mt-1 max-w-2xl">
              Break free from generic box-and-line shapes. Explore bespoke negative space illusions, interlocking monogram ribbons, kinetic emblems, and certified architectural seals engineered for <span className="font-bold text-black dark:text-white">{brand.brandName}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchVariations()}
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Crafting Vectors...' : 'Regenerate 6 Archetypes'}</span>
            </button>
          </div>
        </div>

        {/* Custom AI Visual Directive Input */}
        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customStylePrompt}
            onChange={(e) => setCustomStylePrompt(e.target.value)}
            placeholder="Direct the aesthetic (e.g., 'Emphasize architectural symmetry with subtle golden ratio curves' or 'High-fashion editorial elegance')..."
            className="flex-1 bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-gray-200 dark:border-zinc-700 px-4 py-2 text-xs font-serif italic text-[#1A1A1A] dark:text-[#F9F7F2] placeholder-gray-400 focus:outline-hidden focus:border-[#1A1A1A] dark:focus:border-[#F9F7F2]"
          />
          <button
            onClick={() => fetchVariations(customStylePrompt)}
            disabled={isLoading || !customStylePrompt.trim()}
            className="px-4 py-2 border border-[#1A1A1A] dark:border-[#F9F7F2] text-[9px] uppercase tracking-widest font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Apply Directive</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
          {errorMsg}
        </div>
      )}

      {/* Main Studio Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 6 Archetype Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {isLoading ? (
            <LogoRenderSkeleton mode="archetype_grid" brandName={brand.brandName} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
              {variations.map((v) => {
                const isSelected = selectedVariation?.id === v.id;
                const isPrimaryActive = brand.logo.primaryLogoSvg.includes(v.concept) || appliedId === v.id;

                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVariation(v)}
                    className={`bg-white dark:bg-[#1C1C1A] border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'border-[#1A1A1A] dark:border-[#F9F7F2] shadow-lg ring-1 ring-[#1A1A1A] dark:ring-[#F9F7F2]'
                        : 'border-gray-200 dark:border-gray-200 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600'
                    }`}
                  >
                  {/* Card Top Banner */}
                  <div className="p-4 border-b border-gray-100 dark:border-zinc-800/80 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/30">
                    <span className="text-[9px] uppercase tracking-widest font-black text-gray-800 dark:text-zinc-200">
                      {v.archetypeLabel}
                    </span>
                    {isPrimaryActive ? (
                      <span className="text-[8px] uppercase tracking-widest font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 px-1.5 py-0.5">
                        Active In Bible
                      </span>
                    ) : (
                      <span className="text-[8px] uppercase tracking-widest font-mono text-gray-400">
                        {v.tags[0] || 'Vector'}
                      </span>
                    )}
                  </div>

                  {/* SVG Display Viewport */}
                  <div className="p-6 flex items-center justify-center min-h-[140px] bg-gray-50/30 dark:bg-black/20">
                    <div
                      className="w-full max-w-[240px] h-20 flex items-center justify-center transition-transform group-hover:scale-105"
                      dangerouslySetInnerHTML={{ __html: sanitizeSvg(v.svg) }}
                    />
                  </div>

                  {/* Card Details & Actions */}
                  <div className="p-4 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">{v.title}</h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 mt-1 font-serif italic">
                        {v.concept}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copySvgText(v.svg, v.id);
                          }}
                          className="text-[9px] uppercase tracking-widest font-bold text-gray-600 dark:text-gray-600 hover:text-black dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === v.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Layers className="w-3 h-3" />}
                          <span>{copiedId === v.id ? 'Copied' : 'SVG'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSvg(v.svg, `${brand.brandName.toLowerCase()}-${v.archetype}`);
                          }}
                          className="text-[9px] uppercase tracking-widest font-bold text-gray-600 dark:text-gray-600 hover:text-black dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Save</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyAsPrimary(v);
                        }}
                        className="px-2.5 py-1 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[8px] uppercase tracking-widest font-black hover:opacity-80 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {appliedId === v.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Sparkles className="w-3 h-3" />}
                        <span>{appliedId === v.id ? 'Applied!' : 'Make Primary'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Right Column: Detailed Inspector & Live Background Sandbox (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {selectedVariation ? (
            <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 space-y-6 sticky top-6">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 pb-3">
                <span className="text-[9px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Live Test Sandbox
                </span>
                <span className="text-[9px] font-mono text-gray-400">
                  {selectedVariation.archetypeLabel}
                </span>
              </div>

              {/* Background Color Switcher Controls */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-500">
                  Preview Canvas Background:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {BACKGROUND_OPTIONS.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setPreviewBg(bg.id as any)}
                      className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border transition-all cursor-pointer ${
                        previewBg === bg.id
                          ? 'border-[#1A1A1A] dark:border-[#F9F7F2] bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                          : 'border-gray-200 dark:border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Sandbox Canvas */}
              <div className={`p-8 border border-gray-200 dark:border-gray-200 dark:border-zinc-700 min-h-[180px] flex items-center justify-center ${currentBgClass} transition-colors duration-300`}>
                <div
                  className="w-full max-w-[280px] h-24 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(selectedVariation.svg) }}
                />
              </div>

              {/* Rationale & Geometric Construction */}
              <div className="space-y-4 text-xs font-serif italic text-gray-700 dark:text-zinc-300">
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-gray-400 not-italic block mb-1">
                    Design Concept
                  </span>
                  <p>{selectedVariation.concept}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-gray-400 not-italic block mb-1">
                    Visual Symbolism
                  </span>
                  <p>{selectedVariation.symbolism}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-gray-400 not-italic block mb-1">
                    Mathematical Geometry
                  </span>
                  <p className="font-mono text-[10px] not-italic text-gray-600 dark:text-gray-600 dark:text-zinc-400">
                    {selectedVariation.geometryDetails}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyAsPrimary(selectedVariation)}
                  className="w-full py-3 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[10px] uppercase tracking-[0.2em] font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Set as Active Primary Brand Mark</span>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copySvgText(selectedVariation.svg, selectedVariation.id)}
                    className="flex-1 py-2 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[9px] uppercase tracking-widest font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Copy Raw SVG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadSvg(selectedVariation.svg, `${brand.brandName.toLowerCase()}-${selectedVariation.archetype}`)}
                    className="flex-1 py-2 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[9px] uppercase tracking-widest font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Vector</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 border border-dashed border-gray-300 dark:border-gray-300 dark:border-zinc-800 text-center text-xs text-gray-400">
              Select an archetype variation to inspect its geometry and sandbox.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
