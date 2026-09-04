import React, { useState } from 'react';
import { BrandBible } from '../types';
import { sanitizeSvg } from '../utils/sanitizeSvg';
import { LogoRenderSkeleton } from './LogoRenderSkeleton';
import {
  downloadRenderAsPng,
  downloadRenderAsSvg,
  copyRenderToClipboard,
  parseResolutionToDimensions,
  extractCleanSvgText,
} from '../utils/imageExport';
import {
  Wand2,
  Download,
  Copy,
  Check,
  RefreshCw,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Sparkles,
  Layers,
  Sun,
  ShieldCheck,
  AlertCircle,
  Eye,
  Info,
  Camera,
  CheckCircle2,
} from 'lucide-react';

interface Render3DStudioProps {
  brand: BrandBible;
  onGenerateLogoImage: (prompt: string, resolution: string, provider?: string) => Promise<string | void>;
  isGeneratingImage: boolean;
  generatedImageUrl?: string;
  generatedImageResolution?: string;
}

export const STUDIO_PRESETS = [
  {
    id: 'matte_foil',
    title: 'Embossed Gold Foil',
    category: 'Luxury & Editorial',
    description: 'Deeply debossed metallic 24K gold foil stamp on matte black 700gsm cotton cardstock with studio chiaroscuro rim lighting.',
    prompt: 'Embossed metallic gold foil on luxury black heavy cardstock, studio chiaroscuro lighting, volumetric rim light, 8k octane render',
    accentColor: '#D97706',
  },
  {
    id: 'titanium',
    title: 'Brushed Titanium & Glass',
    category: 'Architectural & Tech',
    description: 'Precision laser-machined aerospace titanium emblem set into frosted optical glass with crisp raytraced specular highlights.',
    prompt: 'Precision brushed titanium and frosted optical glass emblem, dramatic architectural ray-traced shadows, macro studio lens',
    accentColor: '#64748B',
  },
  {
    id: 'neon_noir',
    title: 'Cyberpunk Neon Noir',
    category: 'Vibrant & Modern',
    description: 'Backlit luminous neon tube sign mounted on a wet dark slate architectural wall with atmospheric fog and subtle chromatic lens flare.',
    prompt: 'Backlit cyberpunk neon acrylic sign on rainy dark slate wall, cinematic atmospheric depth, luminous blue and amber glow',
    accentColor: '#06B6D4',
  },
  {
    id: 'linen_stamp',
    title: 'Debossed Letterpress Linen',
    category: 'Artisanal & Heritage',
    description: 'Tactile blind debossed letterpress indentation on unbleached warm ivory artisanal linen paper with rich fiber micro-textures.',
    prompt: 'Debossed blind letterpress ink stamp on textured warm ivory artisanal linen paper, natural soft window daylight, macro detail',
    accentColor: '#B45309',
  },
  {
    id: 'ceramic_clay',
    title: 'Terracotta & Ceramic Clay',
    category: 'Organic & Minimalist',
    description: 'Matte sculptural ceramic form in warm terracotta and porcelain with soft studio dome illumination and organic clay shadows.',
    prompt: 'Sculptural matte ceramic and terracotta 3D brand symbol, softbox dome lighting, clean minimal brutalist architectural podium',
    accentColor: '#EA580C',
  },
  {
    id: 'holographic_chrome',
    title: 'Prismatic Liquid Chrome',
    category: 'Futuristic & Dynamic',
    description: 'Iridescent liquid mirror chrome mark with fluid surface tension reflections, chromatic aberration, and studio spotlight flares.',
    prompt: 'Fluid liquid metal chrome logo emblem with iridescent rainbow prism reflections, dark mirror reflection pool, studio spotlight',
    accentColor: '#8B5CF6',
  },
];

export function Render3DStudio({
  brand,
  onGenerateLogoImage,
  isGeneratingImage,
  generatedImageUrl,
  generatedImageResolution = '2K',
}: Render3DStudioProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('matte_foil');
  const [selectedResolution, setSelectedResolution] = useState<'1K' | '2K' | '4K'>('2K');
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'openai' | 'gemini' | 'higgsfield'>('auto');

  const IMAGE_PROVIDERS = [
    { id: 'auto', label: 'Auto' },
    { id: 'openai', label: 'OpenAI' },
    { id: 'gemini', label: 'Gemini' },
    { id: 'higgsfield', label: 'Higgsfield' },
  ] as const;
  const [customPrompt, setCustomPrompt] = useState<string>(
    STUDIO_PRESETS[0].prompt
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [studioBackdrop, setStudioBackdrop] = useState<'obsidian' | 'ivory' | 'slate'>('obsidian');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [imgLoadFailed, setImgLoadFailed] = useState(false);
  const [isImgReady, setIsImgReady] = useState(false);

  // Reset image load state if URL updates
  React.useEffect(() => {
    setImgLoadFailed(false);
    setIsImgReady(false);
  }, [generatedImageUrl]);

  const activePreset = STUDIO_PRESETS.find((p) => p.id === selectedPresetId) || STUDIO_PRESETS[0];
  const dimensionsInfo = parseResolutionToDimensions(selectedResolution);

  const handleSelectPreset = (preset: typeof STUDIO_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setCustomPrompt(preset.prompt);
  };

  const handleTriggerRender = async (promptOverride?: string) => {
    setRenderError(null);
    setImgLoadFailed(false);
    try {
      const promptToUse = promptOverride || customPrompt;
      await onGenerateLogoImage(promptToUse, selectedResolution, selectedProvider);
    } catch (err: any) {
      setRenderError(err.message || 'Rendering error encountered.');
    }
  };

  const handleDownloadPng = async () => {
    setIsDownloading(true);
    setRenderError(null);
    try {
      let imageToDownload = generatedImageUrl;
      if (!imageToDownload) {
        // Automatically synthesize render if not already triggered
        const synthesized = await onGenerateLogoImage(customPrompt, selectedResolution, selectedProvider);
        if (typeof synthesized === 'string') {
          imageToDownload = synthesized;
        } else {
          imageToDownload = generatedImageUrl;
        }
      }

      if (!imageToDownload) {
        throw new Error('Could not retrieve rendered asset.');
      }

      const filename = `${brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-3d-${selectedPresetId}-${selectedResolution.toLowerCase()}`;
      await downloadRenderAsPng(imageToDownload, filename, selectedResolution);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      console.error('Download PNG failed:', err);
      setRenderError('Failed to prepare high-res PNG download: ' + (err.message || String(err)));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSvg = () => {
    if (!generatedImageUrl) return;
    const filename = `${brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-3d-vector-scene`;
    downloadRenderAsSvg(generatedImageUrl, filename);
  };

  const handleCopyClipboard = async () => {
    if (!generatedImageUrl) return;
    const ok = await copyRenderToClipboard(generatedImageUrl);
    if (ok) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } else {
      setRenderError('Direct clipboard copy not supported on this browser. Use Download PNG instead.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Studio Header & Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[9px] uppercase tracking-widest font-black">
              Studio Render Engine 3.0
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-500 font-mono">
              Raytracer &bull; AI Physical Simulation
            </span>
          </div>
          <h3 className="text-sm uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] mt-1">
            3D Photorealistic Identity &amp; Physical Emblem Studio
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-serif italic mt-0.5">
            Simulate tangible high-end physical materials, studio lighting rigs, and export ultra-high-resolution 1K to 4K assets.
          </p>
        </div>

        {/* Global Export & Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Resolution Selector */}
          <div className="flex items-center bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 p-0.5">
            {(['1K', '2K', '4K'] as const).map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => setSelectedResolution(res)}
                className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer ${
                  selectedResolution === res
                    ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] shadow-xs'
                    : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {res}
              </button>
            ))}
          </div>

          {/* AI Engine Selector */}
          <div
            className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 p-0.5"
            title="Choose the AI engine for this render. Auto cascades OpenAI → Gemini → Higgsfield."
          >
            <Sparkles className="w-3 h-3 text-gray-400 ml-1 shrink-0" />
            {IMAGE_PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProvider(p.id)}
                className={`px-2 py-1 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer ${
                  selectedProvider === p.id
                    ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] shadow-xs'
                    : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Download Ultra-HD PNG */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isDownloading || isGeneratingImage}
            className="px-4 py-2 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[9px] uppercase tracking-widest font-black flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
          >
            {isDownloading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : downloadSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{downloadSuccess ? 'Downloaded!' : `Download ${selectedResolution} PNG`}</span>
          </button>

          {/* Copy to Clipboard */}
          {generatedImageUrl && (
            <button
              type="button"
              onClick={handleCopyClipboard}
              className="px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[#1A1A1A] dark:text-[#F9F7F2] text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5 cursor-pointer hover:border-black dark:hover:border-white transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Interactive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Materials & Directives (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Material Presets Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Physical Material &amp; Lighting Presets</span>
              </span>
              <span className="text-[9px] font-mono text-gray-400">
                {STUDIO_PRESETS.length} Rigs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {STUDIO_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 text-left border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-white dark:bg-[#1C1C1A] border-[#1A1A1A] dark:border-[#F9F7F2] shadow-md ring-1 ring-[#1A1A1A] dark:ring-[#F9F7F2]'
                        : 'bg-gray-50 dark:bg-[#141413] border-gray-200 dark:border-gray-200 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: preset.accentColor }}
                          />
                          <h4 className="text-[11px] uppercase tracking-wider font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                            {preset.title}
                          </h4>
                        </div>
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-mono block mt-0.5">
                          {preset.category}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[8px] uppercase tracking-widest font-black">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-600 dark:text-gray-600 dark:text-zinc-400 font-serif italic mt-2 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Prompt & Prompt Enhancement Controls */}
          <div className="p-4 bg-gray-50 dark:bg-[#141413] border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[9px] uppercase tracking-widest font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-gray-500 dark:text-gray-500" />
                <span>Fine-Tune Lighting &amp; Texture Prompt</span>
              </label>
              <button
                type="button"
                onClick={() => setCustomPrompt(activePreset.prompt)}
                className="text-[8px] uppercase tracking-widest font-bold text-gray-400 hover:text-black dark:hover:text-white underline cursor-pointer"
              >
                Reset to Preset
              </button>
            </div>

            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe optical glass, specular flares, brushed metals..."
              className="w-full bg-white dark:bg-[#1C1C1A] border border-gray-300 dark:border-gray-300 dark:border-zinc-700 p-2.5 text-xs text-[#1A1A1A] dark:text-[#F9F7F2] font-sans focus:outline-hidden focus:border-black dark:focus:border-white leading-relaxed resize-none"
            />

            {/* Quick Modifiers */}
            <div className="flex flex-wrap gap-1">
              {[
                '+ Chiaroscuro 8k',
                '+ Frosted Glass',
                '+ 24K Gold Bevels',
                '+ Rainy Dark Slate',
                '+ Macro Lens 50mm',
              ].map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setCustomPrompt((prev) => `${prev.trim()}, ${mod.replace('+ ', '')}`)}
                  className="px-2 py-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-200 dark:border-zinc-700 text-[8px] font-mono text-gray-600 dark:text-gray-600 dark:text-zinc-300 hover:border-black dark:hover:border-white cursor-pointer transition-colors"
                >
                  {mod}
                </button>
              ))}
            </div>

            {/* Main Render Trigger Button */}
            <button
              type="button"
              onClick={() => handleTriggerRender()}
              disabled={isGeneratingImage || !customPrompt.trim()}
              className="w-full py-3 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isGeneratingImage ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Raytraced 3D Simulation...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Render 3D Photorealistic Emblem ({selectedResolution})</span>
                </>
              )}
            </button>
          </div>

          {/* Render Error Alert */}
          {renderError && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>{renderError}</span>
            </div>
          )}
        </div>

        {/* Right Column: Live 3D Stage Viewport (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div
            className={`border border-[#1A1A1A] dark:border-[#F9F7F2]/20 overflow-hidden transition-all duration-300 relative ${
              isFullscreen ? 'fixed inset-4 z-50 bg-[#0E0F12] shadow-2xl flex flex-col' : 'bg-[#0E0F12]'
            }`}
          >
            {/* Viewport Top Control Bar */}
            <div className="bg-[#1A1A1A] px-4 py-2.5 flex items-center justify-between border-b border-white/10 text-white">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[9px] uppercase tracking-widest font-mono text-gray-400">
                  STAGE: {brand.brandName.toUpperCase()} // {activePreset.title.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {dimensionsInfo.label}
                </span>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Viewport Canvas Center */}
            <div className="p-8 sm:p-12 flex items-center justify-center min-h-[420px] relative overflow-hidden bg-radial from-[#1E222A] via-[#121418] to-[#0A0B0E]">
              {/* Studio Grid Floor Lines */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                  perspective: '500px',
                  transform: 'rotateX(60deg) scale(1.4) translateY(40px)',
                }}
              />

              {/* Rendered Asset or Live Placeholder Stage */}
              {isGeneratingImage ? (
                <LogoRenderSkeleton
                  mode="3d_stage"
                  presetName={activePreset.title}
                  brandName={brand.brandName}
                  resolution={selectedResolution}
                />
              ) : generatedImageUrl ? (
                <div className="relative z-10 max-w-full flex flex-col items-center animate-in zoom-in-95 duration-500 p-4">
                  {!imgLoadFailed ? (
                    <div className="relative flex flex-col items-center">
                      {!isImgReady && (
                        <div className="absolute inset-0 flex items-center justify-center min-h-[300px] min-w-[300px]">
                          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-amber-400 animate-spin" />
                        </div>
                      )}
                      <img
                        src={generatedImageUrl}
                        alt={`${brand.brandName} 3D Photorealistic Render`}
                        referrerPolicy="no-referrer"
                        onLoad={() => setIsImgReady(true)}
                        onError={() => {
                          console.warn('Direct <img> load failed for render, falling back to clean inline SVG rendering.');
                          setImgLoadFailed(true);
                        }}
                        className={`max-h-[380px] w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500 cursor-zoom-in hover:scale-105 ${
                          isImgReady ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                        onClick={() => setIsFullscreen(true)}
                      />
                    </div>
                  ) : (
                    /* Fallback direct decoded vector SVG injection */
                    <div
                      className="max-h-[380px] w-full max-w-[420px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform hover:scale-105 duration-300 flex items-center justify-center animate-in fade-in duration-300"
                      dangerouslySetInnerHTML={{ __html: sanitizeSvg(extractCleanSvgText(generatedImageUrl)) }}
                      onClick={() => setIsFullscreen(true)}
                    />
                  )}
                  <span className="mt-3 text-[9px] uppercase tracking-widest font-mono text-gray-400">
                    Target Output: {dimensionsInfo.label} &bull; 8-Bit RGB
                  </span>
                </div>
              ) : (
                /* Interactive Stage Preview Default */
                <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-md p-6">
                  {/* Default 3D Simulated Monogram Plaque */}
                  <div
                    className="w-36 h-36 rounded-2xl border p-4 shadow-2xl flex items-center justify-center group transform hover:rotate-3 transition-transform duration-300 relative overflow-hidden"
                    style={{
                      backgroundColor: '#161922',
                      borderColor: activePreset.accentColor + '55',
                      boxShadow: `0 20px 40px -10px ${activePreset.accentColor}33`,
                    }}
                  >
                    {/* Simulated Material Surface Gradient */}
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        background: `radial-gradient(circle at 30% 20%, ${activePreset.accentColor}, transparent 70%)`,
                      }}
                    />
                    <div
                      className="w-24 h-24 text-white drop-shadow-[0_6px_16px_rgba(255,255,255,0.25)] relative z-10"
                      dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.logo?.primaryLogoSvg || '') }}
                    />
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-xs uppercase tracking-widest font-black text-white">
                      Preset Active: {activePreset.title}
                    </h5>
                    <p className="text-xs text-gray-400 font-serif italic max-w-xs">
                      {activePreset.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleTriggerRender()}
                      className="px-5 py-2 bg-white text-black text-[9px] uppercase tracking-widest font-black hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-2 shadow-lg"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Synthesize 3D Render ({selectedResolution})</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPng}
                      disabled={isDownloading}
                      className="px-4 py-2 bg-transparent text-white border border-white/40 text-[9px] uppercase tracking-widest font-bold hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Direct Download PNG</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Viewport Bottom Quick Bar */}
            <div className="bg-[#15171D] px-6 py-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-3 text-[9px] font-mono text-gray-400">
                <span>PRESET: {activePreset.title}</span>
                <span>&bull;</span>
                <span>ASPECT: 1:1</span>
                <span>&bull;</span>
                <span>RES: {dimensionsInfo.width}&times;{dimensionsInfo.height}</span>
              </div>

              <div className="flex items-center gap-2">
                {downloadSuccess && (
                  <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved PNG</span>
                  </span>
                )}

                {generatedImageUrl && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownloadSvg}
                      className="text-[9px] uppercase tracking-widest font-bold text-gray-300 hover:text-white underline cursor-pointer"
                    >
                      Download SVG Scene
                    </button>
                    <span className="text-gray-600 dark:text-gray-600">|</span>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={isDownloading}
                  className="px-3 py-1 bg-white text-black text-[9px] uppercase tracking-widest font-black hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isDownloading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  <span>{isDownloading ? 'Preparing PNG...' : 'Download Ultra-HD PNG'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Specifications & Usage Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px]">
            <div className="p-3 bg-gray-50 dark:bg-[#141413] border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-1">
              <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">
                Primary Medium
              </span>
              <p className="text-[#1A1A1A] dark:text-[#F9F7F2] font-medium">
                Hero Banners &bull; Pitch Decks &bull; Press Kits
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#141413] border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-1">
              <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">
                Color Depth &amp; Alpha
              </span>
              <p className="text-[#1A1A1A] dark:text-[#F9F7F2] font-medium">
                32-Bit sRGB with Alpha Channel
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#141413] border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-1">
              <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">
                Export Formats
              </span>
              <p className="text-[#1A1A1A] dark:text-[#F9F7F2] font-medium">
                PNG (1K/2K/4K) &bull; Scalable Vector SVG
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
