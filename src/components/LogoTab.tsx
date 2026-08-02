import { useState } from 'react';
import { LogoSpec, SecondaryMark } from '../types';
import { Download, Sparkles, Wand2, RefreshCw, Check, Image as ImageIcon, Maximize2, Layers } from 'lucide-react';

interface LogoTabProps {
  logo: LogoSpec;
  secondaryMarks: SecondaryMark[];
  brandName: string;
  onGenerateLogoImage: (prompt: string, resolution: string) => Promise<string | void>;
  generatedImageUrl?: string;
  generatedImageResolution?: string;
  isGeneratingImage: boolean;
}

export function LogoTab({
  logo,
  secondaryMarks,
  brandName,
  onGenerateLogoImage,
  generatedImageUrl,
  generatedImageResolution,
  isGeneratingImage,
}: LogoTabProps) {
  const [selectedResolution, setSelectedResolution] = useState<'1K' | '2K' | '4K'>('2K');
  const [customPrompt, setCustomPrompt] = useState(logo.aiImagePrompt || '');
  const [copiedSvg, setCopiedSvg] = useState<string | null>(null);

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

  const copySvgText = (svgContent: string, key: string) => {
    navigator.clipboard.writeText(svgContent);
    setCopiedSvg(key);
    setTimeout(() => setCopiedSvg(null), 2000);
  };

  const handleGenerateImageClick = async () => {
    await onGenerateLogoImage(customPrompt, selectedResolution);
  };

  return (
    <div className="space-y-10">
      {/* Primary Logo Showcase Card */}
      <div className="flex flex-col">
        <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] mb-6">Visual Marks</h2>
        
        <div className="relative flex-grow bg-white border border-[#1A1A1A] flex flex-col items-center justify-center overflow-hidden rounded-none p-12 min-h-[300px]">
          <div className="absolute top-6 left-6 text-[10px] uppercase tracking-widest opacity-50 font-bold">Primary Logomark</div>
          <div className="absolute top-6 right-6 flex items-center gap-4 text-[9px] uppercase tracking-widest font-bold">
            <button
              onClick={() => copySvgText(logo.primaryLogoSvg, 'primary')}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              {copiedSvg === 'primary' ? <Check className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
              <span>Copy SVG</span>
            </button>
            <button
              onClick={() => downloadSvg(logo.primaryLogoSvg, `${brandName.toLowerCase()}-primary-logo`)}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
          <div
            className="w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center mt-8"
            dangerouslySetInnerHTML={{ __html: logo.primaryLogoSvg }}
          />
        </div>

        {/* Concept & Symbolism Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#1A1A1A] border-t-0 bg-white rounded-none">
          <div className="p-6 border-b md:border-b-0 md:border-r border-[#1A1A1A] space-y-4">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 block">Design Concept</span>
            <p className="font-serif italic text-sm leading-relaxed">{logo.concept}</p>
          </div>
          <div className="p-6 border-b md:border-b-0 md:border-r border-[#1A1A1A] space-y-4">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 block">Visual Symbolism</span>
            <p className="font-serif italic text-sm leading-relaxed">{logo.symbolism}</p>
          </div>
          <div className="p-6 space-y-4">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 block">Geometry & Grid</span>
            <p className="font-serif italic text-sm leading-relaxed">{logo.geometryDetails}</p>
          </div>
        </div>
      </div>

      {/* Secondary Marks & Icons Suite */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {secondaryMarks.map((mark) => (
            <div
              key={mark.id}
              className="bg-white border border-[#1A1A1A] flex flex-col justify-between rounded-none"
            >
              <div className="border-b border-[#1A1A1A] p-4 flex items-center justify-between bg-[#1A1A1A] text-white">
                <span className="text-[9px] uppercase tracking-widest font-bold">
                  {mark.title}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => copySvgText(mark.svg, mark.id)}
                    className="hover:opacity-70 transition-opacity"
                    title="Copy SVG"
                  >
                    {copiedSvg === mark.id ? <Check className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => downloadSvg(mark.svg, `${brandName.toLowerCase()}-${mark.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)}
                    className="hover:opacity-70 transition-opacity"
                    title="Download SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-8 flex items-center justify-center min-h-[160px]">
                <div
                  className="w-24 h-24 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: mark.svg }}
                />
              </div>

              <div className="border-t border-dashed border-[#1A1A1A]/30 p-4">
                <p className="font-sans font-light text-[11px] leading-relaxed opacity-80">{mark.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI High-Resolution Image Logo Generation Card */}
      <div className="bg-[#1A1A1A] p-8 sm:p-12 text-[#F9F7F2] border border-[#1A1A1A] rounded-none space-y-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-dashed border-white/30 pb-6">
          <div className="flex items-center gap-4">
            <ImageIcon className="w-6 h-6 opacity-70" />
            <div>
              <h3 className="text-xl font-serif italic tracking-tighter flex items-center gap-4">
                <span>AI Rendering Studio</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 border border-white/30 text-white/70">
                  gemini-3.1-flash-image
                </span>
              </h3>
              <p className="text-xs font-sans font-light opacity-60 mt-2">
                Generate photo-realistic 3D metallic, glass, or studio emblem renderings.
              </p>
            </div>
          </div>

          {/* Resolution Selector Affordance (1K, 2K, 4K) */}
          <div className="flex items-center gap-3 bg-transparent border border-white/30 p-1">
            <span className="text-[9px] uppercase tracking-widest font-bold px-3 flex items-center gap-2 opacity-50">
              <Maximize2 className="w-3 h-3" />
              <span>Output Res:</span>
            </span>
            {(['1K', '2K', '4K'] as const).map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => setSelectedResolution(res)}
                className={`px-4 py-1.5 text-[9px] uppercase tracking-widest font-bold transition-all ${
                  selectedResolution === res
                    ? 'bg-white text-[#1A1A1A]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input & Action */}
        <div className="space-y-4">
          <label className="block text-[10px] uppercase tracking-[0.3em] font-black opacity-70">
            Render Prompt Directive
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe the rendering style..."
              className="flex-1 bg-transparent border-b border-dashed border-white/50 px-0 py-3 text-lg font-serif italic text-white placeholder-white/30 focus:outline-hidden focus:border-white transition-all"
            />
            <button
              onClick={handleGenerateImageClick}
              disabled={isGeneratingImage || !customPrompt.trim()}
              className="px-8 py-3 bg-white text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold hover:bg-[#F9F7F2] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shrink-0 rounded-none border-none"
            >
              {isGeneratingImage ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Execute Render</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Image Result Showcase */}
        {generatedImageUrl && (
          <div className="pt-8 border-t border-dashed border-white/30 space-y-6">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold opacity-70">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white" />
                <span>Rendered at {generatedImageResolution || selectedResolution}</span>
              </span>
              <a
                href={generatedImageUrl}
                download={`${brandName.toLowerCase()}-ai-logo-${generatedImageResolution || selectedResolution}.png`}
                className="flex items-center gap-2 hover:opacity-100 transition-opacity"
              >
                <Download className="w-4 h-4" />
                <span>Download Asset</span>
              </a>
            </div>
            <div className="border border-white/20 bg-[#0F0F0F] p-4 flex items-center justify-center max-w-2xl mx-auto rounded-none shadow-2xl">
              <img
                src={generatedImageUrl}
                alt={`${brandName} Rendered Logo`}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain max-h-[500px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
