import { useState } from 'react';
import { BrandBible, LogoSpec, SecondaryMark } from '../types';
import { FaviconGenerator } from './FaviconGenerator';
import { LogoArchetypeStudio } from './LogoArchetypeStudio';
import { CoTPromptRefinementStudio } from './CoTPromptRefinementStudio';
import {
  Download,
  Sparkles,
  Wand2,
  RefreshCw,
  Check,
  Image as ImageIcon,
  Maximize2,
  Layers,
  Globe,
  Compass,
  AlertTriangle,
  LayoutGrid,
  Brain,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Palette,
  SlidersHorizontal,
} from 'lucide-react';

interface LogoTabProps {
  brand: BrandBible;
  logo: LogoSpec;
  secondaryMarks: SecondaryMark[];
  brandName: string;
  onGenerateLogoImage: (prompt: string, resolution: string) => Promise<string | void>;
  onUpdatePrimaryLogo?: (svg: string, concept: string, symbolism: string, geometry: string) => void;
  generatedImageUrl?: string;
  generatedImageResolution?: string;
  isGeneratingImage: boolean;
  isProMode?: boolean;
}

const STUDIO_LIGHTING_PRESETS = [
  { id: 'matte_foil', label: 'Gold Foil Stamp', prompt: 'Embossed metallic gold foil on luxury black heavy cardstock, studio chiaroscuro lighting, 8k render' },
  { id: 'titanium', label: 'Brushed Titanium', prompt: 'Precision brushed titanium and frosted optical glass emblem, dramatic architectural ray-traced shadows' },
  { id: 'neon_noir', label: 'Neon Glow Sign', prompt: 'Backlit cyberpunk neon acrylic sign on rainy dark slate wall, cinematic atmospheric depth' },
  { id: 'linen_stamp', label: 'Letterpress Stamp', prompt: 'Debossed blind letterpress ink stamp on textured warm ivory artisanal linen paper' },
];

export function LogoTab({
  brand,
  logo,
  secondaryMarks,
  brandName,
  onGenerateLogoImage,
  onUpdatePrimaryLogo,
  generatedImageUrl,
  generatedImageResolution,
  isGeneratingImage,
  isProMode = false,
}: LogoTabProps) {
  const [activeTabMode, setActiveTabMode] = useState<'main' | 'styles' | 'favicons' | 'secondary'>('main');
  const [bgMode, setBgMode] = useState<'light' | 'dark' | 'brand'>('light');
  const [selectedResolution, setSelectedResolution] = useState<'1K' | '2K' | '4K'>('2K');
  const [customPrompt, setCustomPrompt] = useState(logo.aiImagePrompt || '');
  const [copiedSvg, setCopiedSvg] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showAdvancedTools, setShowAdvancedTools] = useState(isProMode);

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

  const downloadPng = (svgContent: string, filename: string, size = 1024) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Optional background fill for visibility
    if (bgMode === 'light') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
    } else if (bgMode === 'dark') {
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(0, 0, size, size);
    } else if (bgMode === 'brand' && brand.palette[0]) {
      ctx.fillStyle = brand.palette[0].hex;
      ctx.fillRect(0, 0, size, size);
    }

    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Draw centered with padding
      const padding = size * 0.15;
      const drawSize = size - padding * 2;
      ctx.drawImage(img, padding, padding, drawSize, drawSize);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const copySvgText = (svgContent: string, key: string) => {
    navigator.clipboard.writeText(svgContent);
    setCopiedSvg(key);
    setTimeout(() => setCopiedSvg(null), 2000);
  };

  const handleGenerateImageClick = async (presetPrompt?: string) => {
    setImageError(null);
    try {
      const promptToUse = presetPrompt || customPrompt;
      await onGenerateLogoImage(promptToUse, selectedResolution);
    } catch (err: any) {
      setImageError(err.message || 'Image rendering was not completed.');
    }
  };

  const primaryColorHex = brand.palette[0]?.hex || '#1A1A1A';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sub-Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xs uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
            Logo &amp; Brand Marks
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-serif italic mt-0.5">
            Vector logos, alternate styles, web favicons, and high-resolution exports.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-1">
          {[
            { id: 'main', label: 'Active Logo', icon: LayoutGrid },
            { id: 'styles', label: 'Explore Styles', icon: Sparkles },
            { id: 'favicons', label: 'Favicons', icon: Globe },
            { id: 'secondary', label: 'Sub-Marks', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabMode(tab.id as any)}
                className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Main Active Logo View */}
      {activeTabMode === 'main' && (
        <div className="space-y-6">
          {/* Main Logo Display Canvas */}
          <div className="border border-[#1A1A1A] dark:border-[#F9F7F2]/20 overflow-hidden">
            {/* Canvas Header Toolbar */}
            <div className="bg-gray-50 dark:bg-[#151514] border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
              {/* Background Color Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500">
                  Preview Canvas:
                </span>
                <div className="inline-flex p-0.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setBgMode('light')}
                    className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold flex items-center gap-1 cursor-pointer ${
                      bgMode === 'light' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>White</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgMode('dark')}
                    className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold flex items-center gap-1 cursor-pointer ${
                      bgMode === 'dark' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>Dark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgMode('brand')}
                    className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold flex items-center gap-1 cursor-pointer ${
                      bgMode === 'brand' ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    <Palette className="w-3 h-3" />
                    <span>Brand Color</span>
                  </button>
                </div>
              </div>

              {/* 1-Click Export Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copySvgText(logo.primaryLogoSvg, 'primary')}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedSvg === 'primary' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-3.5 h-3.5" />
                      <span>Copy SVG</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => downloadSvg(logo.primaryLogoSvg, `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-logo`)}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadPng(logo.primaryLogoSvg, `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-logo-hires`)}
                  className="px-3.5 py-1.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] border border-black dark:border-white text-[9px] uppercase tracking-widest font-black flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
              </div>
            </div>

            {/* Logo Rendering Stage */}
            <div
              className={`p-16 flex items-center justify-center min-h-[320px] transition-colors duration-300 ${
                bgMode === 'light'
                  ? 'bg-white'
                  : bgMode === 'dark'
                  ? 'bg-[#121212]'
                  : ''
              }`}
              style={bgMode === 'brand' ? { backgroundColor: primaryColorHex } : {}}
            >
              <div
                className={`w-full max-w-[360px] h-32 flex items-center justify-center transition-transform hover:scale-105 duration-300 ${
                  bgMode === 'dark' ? 'drop-shadow-[0_4px_20px_rgba(255,255,255,0.05)]' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: logo.primaryLogoSvg }}
              />
            </div>

            {/* Concept & Symbolism Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#1A1A1A] dark:border-[#F9F7F2]/20 bg-white dark:bg-[#1C1C1A]">
              <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800 space-y-2">
                <span className="text-[9px] uppercase tracking-widest font-black text-gray-500 block">
                  Core Concept
                </span>
                <p className="font-serif italic text-sm text-[#1A1A1A] dark:text-[#F9F7F2] leading-relaxed">
                  {logo.concept}
                </p>
              </div>

              <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800 space-y-2">
                <span className="text-[9px] uppercase tracking-widest font-black text-gray-500 block">
                  Symbolism
                </span>
                <p className="font-serif italic text-sm text-[#1A1A1A] dark:text-[#F9F7F2] leading-relaxed">
                  {logo.symbolism}
                </p>
              </div>

              <div className="p-6 space-y-2">
                <span className="text-[9px] uppercase tracking-widest font-black text-gray-500 block">
                  Geometry
                </span>
                <p className="font-serif italic text-sm text-[#1A1A1A] dark:text-[#F9F7F2] leading-relaxed">
                  {logo.geometryDetails}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Style Switcher Callout Banner */}
          <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs uppercase tracking-widest font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                Want to try another logo style?
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-serif italic mt-0.5">
                Explore Minimalist, Negative Space, Monogram, Crest, and Seal variations with 1-click instant preview.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTabMode('styles')}
              className="px-4 py-2 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[9px] uppercase tracking-widest font-black hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            >
              Browse Logo Styles &rarr;
            </button>
          </div>

          {/* Collapsible Advanced 3D & AI Prompt Studio */}
          <div className="border border-gray-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setShowAdvancedTools(!showAdvancedTools)}
              className="w-full bg-gray-50 dark:bg-[#151514] px-6 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <span className="text-[10px] uppercase tracking-widest font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Advanced Studio Tools: 3D Renders &amp; AI Prompt Lab
                </span>
              </div>
              {showAdvancedTools ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {showAdvancedTools && (
              <div className="p-6 space-y-8 bg-white dark:bg-[#1C1C1A] border-t border-gray-200 dark:border-zinc-800">
                {/* 3D Render Studio */}
                <div className="bg-[#1A1A1A] dark:bg-[#111110] p-6 text-white space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-4">
                    <div>
                      <h4 className="text-sm font-serif italic">3D Photorealistic Render</h4>
                      <p className="text-xs opacity-60">Generate metallic, neon, or letterpress 3D textures.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Resolution:</span>
                      {(['1K', '2K', '4K'] as const).map((res) => (
                        <button
                          key={res}
                          type="button"
                          onClick={() => setSelectedResolution(res)}
                          className={`px-3 py-1 text-[9px] uppercase font-bold cursor-pointer ${
                            selectedResolution === res ? 'bg-white text-black' : 'border border-white/30 text-white'
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {STUDIO_LIGHTING_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setCustomPrompt(preset.prompt);
                          handleGenerateImageClick(preset.prompt);
                        }}
                        className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border border-white/30 hover:bg-white hover:text-black transition-all cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Prompt Box */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Describe custom lighting or material..."
                      className="flex-1 bg-transparent border-b border-white/40 px-2 py-2 text-sm text-white focus:outline-hidden focus:border-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleGenerateImageClick()}
                      disabled={isGeneratingImage || !customPrompt.trim()}
                      className="px-6 py-2 bg-white text-black text-[9px] uppercase tracking-widest font-black hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shrink-0"
                    >
                      {isGeneratingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                      <span>Generate 3D Render</span>
                    </button>
                  </div>

                  {imageError && (
                    <div className="p-3 bg-amber-900/50 border border-amber-500/50 text-xs text-amber-200">
                      {imageError}
                    </div>
                  )}

                  {generatedImageUrl && (
                    <div className="pt-4 border-t border-white/20 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs opacity-75">Rendered Asset:</span>
                        <a
                          href={generatedImageUrl}
                          download={`${brandName.toLowerCase()}-3d-logo.png`}
                          className="text-xs uppercase font-bold underline cursor-pointer"
                        >
                          Download 3D PNG &rarr;
                        </a>
                      </div>
                      <img
                        src={generatedImageUrl}
                        alt="3D Logo"
                        className="max-h-[300px] mx-auto object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* CoT Prompt Refinement Lab */}
                <div className="pt-6 border-t border-gray-200 dark:border-zinc-800">
                  <CoTPromptRefinementStudio
                    brand={brand}
                    onUpdatePrimaryLogo={(svg, concept, symbolism, geometry) => {
                      if (onUpdatePrimaryLogo) {
                        onUpdatePrimaryLogo(svg, concept, symbolism, geometry);
                      }
                    }}
                    onSendTo3DRender={(refinedPrompt) => {
                      setCustomPrompt(refinedPrompt);
                      handleGenerateImageClick(refinedPrompt);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Explore Logo Styles */}
      {activeTabMode === 'styles' && (
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 flex items-center justify-between">
            <span className="text-xs font-serif italic text-gray-600 dark:text-zinc-400">
              Click any style to preview and apply it as your primary logomark.
            </span>
            <button
              type="button"
              onClick={() => setActiveTabMode('main')}
              className="text-[9px] uppercase tracking-widest font-black text-[#1A1A1A] dark:text-[#F9F7F2] underline cursor-pointer"
            >
              &larr; Back to Active Logo
            </button>
          </div>

          <LogoArchetypeStudio
            brand={brand}
            onUpdatePrimaryLogo={(svg, concept, symbolism, geometry) => {
              if (onUpdatePrimaryLogo) {
                onUpdatePrimaryLogo(svg, concept, symbolism, geometry);
                setActiveTabMode('main');
              }
            }}
          />
        </div>
      )}

      {/* 3. Favicon & Web Icon Suite */}
      {activeTabMode === 'favicons' && (
        <div className="space-y-6">
          <FaviconGenerator brand={brand} />
        </div>
      )}

      {/* 4. Secondary Marks */}
      {activeTabMode === 'secondary' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              Secondary Marks &amp; Badges ({secondaryMarks.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {secondaryMarks.map((mark) => (
              <div
                key={mark.id}
                className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 flex flex-col justify-between"
              >
                <div className="border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-3 flex items-center justify-between bg-gray-50 dark:bg-zinc-900">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-gray-800 dark:text-zinc-200">
                    {mark.title}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copySvgText(mark.svg, mark.id)}
                      className="p-1 hover:opacity-70 transition-opacity cursor-pointer"
                      title="Copy SVG"
                    >
                      {copiedSvg === mark.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Layers className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => downloadSvg(mark.svg, `${brandName.toLowerCase()}-${mark.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)}
                      className="p-1 hover:opacity-70 transition-opacity cursor-pointer"
                      title="Download SVG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-8 flex items-center justify-center min-h-[160px] bg-white dark:bg-zinc-900/40">
                  <div
                    className="w-24 h-24 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: mark.svg }}
                  />
                </div>

                <div className="border-t border-gray-200 dark:border-zinc-800 p-3">
                  <p className="text-[11px] font-serif italic text-gray-600 dark:text-zinc-400">
                    {mark.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
