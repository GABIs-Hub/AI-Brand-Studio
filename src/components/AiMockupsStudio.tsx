import React, { useState } from 'react';
import { BrandBible } from '../types';
import { AnimatedDottedBorder } from './AnimatedDottedBorder';
import {
  Camera,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Package,
  ShoppingBag,
  CreditCard,
  Building2,
  Monitor,
  Maximize2,
  Layers,
  SlidersHorizontal,
  AlertCircle,
  Eye,
  Aperture,
  Sun,
  ShieldCheck,
} from 'lucide-react';

interface AiMockupsStudioProps {
  brand: BrandBible;
}

interface MockupItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  promptUsed: string;
  engine: string;
  isFallback: boolean;
  aspectRatio: string;
  lens: string;
  lighting: string;
  materials: string;
  createdAt: string;
}

const MOCKUP_CATEGORIES = [
  {
    id: 'packaging',
    label: 'Packaging & Boxes',
    icon: Package,
    defaultPrompt: 'Luxury matte rigid box with embossed metallic foil monogram on raw architectural plinth',
    materials: 'Organic soft-touch matte cardstock, hot-stamped gold foil accents',
  },
  {
    id: 'apparel',
    label: 'Apparel & Textiles',
    icon: ShoppingBag,
    defaultPrompt: 'Heavyweight organic cotton streetwear t-shirt with screen-printed brand emblem on minimalist wooden hanger',
    materials: '300gsm heavyweight combed cotton, tactile textured weave',
  },
  {
    id: 'stationery',
    label: 'Stationery Suite',
    icon: CreditCard,
    defaultPrompt: 'Thick cotton business card stack with edge gilding resting on raw natural linen cloth',
    materials: '600gsm duplexed cotton stock, letterpress indentation',
  },
  {
    id: 'signage',
    label: 'Architectural Signage',
    icon: Building2,
    defaultPrompt: 'Precision laser-cut brushed bronze dimensional lettering on fluted concrete gallery facade',
    materials: 'Weathered brushed bronze, textured sand-cast concrete',
  },
  {
    id: 'device',
    label: 'Digital Devices',
    icon: Monitor,
    defaultPrompt: 'Bezel-less slate tablet showing clean brand platform interface on sunlit travertine desk',
    materials: 'Anodized dark aluminum, anti-reflective matte glass display',
  },
  {
    id: 'product',
    label: 'Product Showcase',
    icon: Layers,
    defaultPrompt: 'Sculptural frosted glass cosmetic dispenser with minimal typography label in direct morning sun',
    materials: 'Frosted recycled heavyweight glass, brushed aluminum pump',
  },
];

const LENS_OPTIONS = [
  { id: '35mm', label: '35mm Environmental', desc: 'Contextual wider scene with architectural depth' },
  { id: '50mm', label: '50mm Documentary', desc: 'Natural perspective, balanced standard focal length' },
  { id: '85mm', label: '85mm Macro Detail', desc: 'Tactile close-up with creamy optical background blur' },
];

const LIGHTING_OPTIONS = [
  { id: 'Directional Natural Sunlight', label: 'Natural Daylight', desc: 'Crisp shadow cast through architectural window' },
  { id: 'Diffused Studio Softbox Illumination', label: 'Studio Softbox', desc: 'Soft even wraps, zero harsh highlights' },
  { id: 'Warm Golden Hour Rim Lighting', label: 'Golden Hour', desc: 'Warm directional rim glows and cinematic tones' },
  { id: 'Moody Chiaroscuro Low-Key Lighting', label: 'Editorial Darkroom', desc: 'Dramatic high-contrast shadow interplay' },
];

export function AiMockupsStudio({ brand }: AiMockupsStudioProps) {
  const defaultLens = brand.photographyDirection?.lens || '50mm Documentary';
  const defaultLighting = brand.photographyDirection?.lighting || 'Diffused Studio Softbox Illumination';
  const defaultMaterials = brand.photographyDirection?.materials || 'Matte tactile textures';
  const defaultColorGrade = brand.photographyDirection?.colorGrade || 'Commercial editorial balance';

  // Active form state
  const [selectedCategory, setSelectedCategory] = useState<string>('packaging');
  const [prompt, setPrompt] = useState<string>(MOCKUP_CATEGORIES[0].defaultPrompt);
  const [selectedLens, setSelectedLens] = useState<string>(
    defaultLens.includes('35mm') ? '35mm' : defaultLens.includes('85mm') ? '85mm' : '50mm'
  );
  const [selectedLighting, setSelectedLighting] = useState<string>(LIGHTING_OPTIONS[1].id);
  const [customMaterials, setCustomMaterials] = useState<string>(MOCKUP_CATEGORIES[0].materials);
  const [aspectRatio, setAspectRatio] = useState<string>('4:5');
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'gemini' | 'openai' | 'higgsfield'>('auto');

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Gallery of generated mockups
  const [mockups, setMockups] = useState<MockupItem[]>(() => {
    // Seed with 2 high-quality initial procedural mockups for the brand
    const primaryHex = brand.palette[0]?.hex || '#1A1A1A';
    const accentHex = brand.palette[1]?.hex || '#D97706';
    return [
      {
        id: 'seed-stationery',
        title: `${brand.brandName} Bespoke Stationery Suite`,
        category: 'stationery',
        imageUrl: '',
        promptUsed: `Commercial product photography mockup for brand "${brand.brandName}". Heavyweight cotton cards on raw linen. Lens: 50mm. Lighting: Natural daylight.`,
        engine: 'procedural-studio',
        isFallback: false,
        aspectRatio: '4:5',
        lens: '50mm',
        lighting: 'Natural daylight',
        materials: '600gsm cotton cardstock',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'seed-packaging',
        title: `${brand.brandName} Minimal Rigid Box`,
        category: 'packaging',
        imageUrl: '',
        promptUsed: `Luxury matte rigid box with embossed logo for "${brand.brandName}". Lens: 85mm macro. Lighting: Studio softbox.`,
        engine: 'procedural-studio',
        isFallback: false,
        aspectRatio: '4:5',
        lens: '85mm',
        lighting: 'Studio softbox',
        materials: 'Matte soft-touch paper',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [selectedMockup, setSelectedMockup] = useState<MockupItem | null>(null);

  // When user clicks a category, update default prompt & materials
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const cat = MOCKUP_CATEGORIES.find((c) => c.id === catId);
    if (cat) {
      setPrompt(cat.defaultPrompt);
      setCustomMaterials(cat.materials);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationStep('Configuring optical camera parameters...');

    try {
      const stepTimer1 = setTimeout(() => {
        setGenerationStep('Applying physical material & surface textures...');
      }, 1800);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep('Balancing commercial lighting and color grading...');
      }, 4200);

      const response = await fetch('/api/generate-ai-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          brandName: brand.brandName,
          industry: brand.industry,
          mockupType: selectedCategory,
          environment: 'high-end architectural minimalist studio',
          lens: selectedLens,
          lighting: selectedLighting,
          materials: customMaterials,
          colorGrade: defaultColorGrade,
          palette: brand.palette,
          aspectRatio,
          provider: selectedProvider,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('Backend server is restarting. Please retry in a few seconds.');
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to render commercial mockup.');
      }

      const data = await response.json();
      const newMockup: MockupItem = {
        id: `mockup-${Date.now()}`,
        title: `${brand.brandName} ${MOCKUP_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Mockup'}`,
        category: selectedCategory,
        imageUrl: data.imageUrl,
        promptUsed: data.promptUsed || prompt,
        engine: data.engine || 'ai',
        isFallback: !!data.isFallback,
        aspectRatio,
        lens: selectedLens,
        lighting: selectedLighting,
        materials: customMaterials,
        createdAt: new Date().toISOString(),
      };

      setMockups((prev) => [newMockup, ...prev]);
      setSelectedMockup(newMockup);
    } catch (err: any) {
      console.error('Mockup generation error:', err);
      setErrorMessage(err.message || 'Generation failed. Check your API settings or retry.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleDownloadImage = (item: MockupItem) => {
    if (!item.imageUrl) return;
    const a = document.createElement('a');
    a.href = item.imageUrl;
    a.download = `${brand.brandName.toLowerCase()}-${item.category}-mockup-${Date.now()}.png`;
    a.click();
  };

  const handleCopyPrompt = (item: MockupItem) => {
    navigator.clipboard.writeText(item.promptUsed);
    setCopiedPromptId(item.id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Studio Header Banner */}
      <div className="border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-[0.3em] font-black bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] px-2 py-0.5">
                AI Mockup Studio
              </span>
              <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500 dark:text-zinc-400">
                Commercial Photography Pipeline
              </span>
            </div>
            <h2 className="text-2xl font-light font-display tracking-tight text-[#1A1A1A] dark:text-[#F9F7F2] mt-1">
              Photorealistic Brand Mockups &amp; Visual Touchpoints
            </h2>
            <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 max-w-3xl font-display">
              Synthesize realistic physical merchandise, packaging, apparel, and architectural assets adhering strictly
              to <strong className="text-black dark:text-white font-semibold">{brand.brandName}</strong>'s lens physics, authentic textures, and color grade.
            </p>
          </div>

          {/* Active Photography Direction Inheritance Pill */}
          <div className="p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[10px] space-y-1 rounded-sm shrink-0">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2]">
              <Aperture className="w-3.5 h-3.5 text-amber-500" />
              <span>Inherited Optics &amp; Lighting</span>
            </div>
            <p className="text-gray-500 dark:text-zinc-400 text-[9px] font-mono">
              Lens: {defaultLens.slice(0, 20)} • Light: {defaultLighting.slice(0, 22)}
            </p>
          </div>
        </div>
      </div>

      {/* Control Workspace: Split Grid (Left Controls 5 cols, Right Preview/Gallery 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Generation Parameters */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-current/20 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Mockup Specifications</span>
              </h3>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as any)}
                className="text-[9px] uppercase tracking-widest font-mono bg-gray-100 dark:bg-zinc-800 border-none px-2 py-1 text-gray-700 dark:text-zinc-300"
              >
                <option value="auto">Auto AI Provider</option>
                <option value="gemini">Gemini Imagen 3</option>
                <option value="openai">OpenAI DALL·E 3</option>
                <option value="higgsfield">Higgsfield Flux</option>
              </select>
            </div>

            {/* 1. Touchpoint Category Grid */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 block">
                1. Touchpoint Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MOCKUP_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`p-2.5 text-left border transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'border-[#1A1A1A] dark:border-[#F9F7F2] bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-400 text-gray-700 dark:text-zinc-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[10px] font-bold tracking-tight truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Lens & Perspective Selection */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 block">
                2. Optical Lens Perspective
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LENS_OPTIONS.map((lens) => (
                  <button
                    key={lens.id}
                    type="button"
                    onClick={() => setSelectedLens(lens.id)}
                    className={`p-2 border text-center transition-all cursor-pointer ${
                      selectedLens === lens.id
                        ? 'border-[#1A1A1A] dark:border-[#F9F7F2] bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-[10px] font-black block">{lens.id}</span>
                    <span className="text-[8px] opacity-70 block truncate">{lens.label.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Lighting Physics */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 block">
                3. Lighting Environment
              </label>
              <select
                value={selectedLighting}
                onChange={(e) => setSelectedLighting(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
              >
                {LIGHTING_OPTIONS.map((light) => (
                  <option key={light.id} value={light.id}>
                    {light.label} — {light.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Material Textures */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 block">
                4. Surface Materials &amp; Tactile Finishes
              </label>
              <input
                type="text"
                value={customMaterials}
                onChange={(e) => setCustomMaterials(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 font-display"
                placeholder="e.g., Heavyweight matte paper, brushed titanium, organic linen"
              />
            </div>

            {/* 5. Scene Prompt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 block">
                  5. Scene &amp; Composition Refinement
                </label>
                <span className="text-[8px] uppercase tracking-widest font-mono text-gray-400">
                  Commercial Prompt
                </span>
              </div>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 font-display resize-none leading-relaxed"
                placeholder="Describe specific scene arrangement, object angle, or context..."
              />
            </div>

            {/* 6. Aspect Ratio Switcher */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 block">
                6. Mockup Framing Ratio
              </label>
              <div className="flex gap-2">
                {[
                  { id: '1:1', label: '1:1 Square' },
                  { id: '4:5', label: '4:5 Portrait' },
                  { id: '16:9', label: '16:9 Wide' },
                  { id: '9:16', label: '9:16 Story' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setAspectRatio(r.id)}
                    className={`flex-1 py-1.5 text-[9px] uppercase tracking-widest font-bold border transition-all cursor-pointer ${
                      aspectRatio === r.id
                        ? 'border-[#1A1A1A] dark:border-[#F9F7F2] bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-400'
                    }`}
                  >
                    {r.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-[11px]">{errorMessage}</p>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="underline text-[10px] uppercase tracking-widest font-bold text-rose-800 dark:text-rose-200 hover:text-black cursor-pointer"
                  >
                    Retry Generation
                  </button>
                </div>
              </div>
            )}

            {/* Action Trigger */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[10px] uppercase tracking-[0.25em] font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>{generationStep || 'Rendering Mockup...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Render Commercial Mockup</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Active Mockup Spotlight & Gallery */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Featured Mockup Card */}
          {selectedMockup || mockups[0] ? (
            (() => {
              const active = selectedMockup || mockups[0];
              return (
                <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-current/20 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                    <div>
                      <span className="text-[8px] uppercase tracking-[0.25em] font-black text-amber-600 dark:text-amber-400 block">
                        Featured High-Resolution Output
                      </span>
                      <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">
                        {active.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(active)}
                        className="px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold border border-gray-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all flex items-center gap-1 cursor-pointer"
                        title="Copy Prompt"
                      >
                        {copiedPromptId === active.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedPromptId === active.id ? 'Copied' : 'Prompt'}</span>
                      </button>

                      {active.imageUrl && (
                        <button
                          type="button"
                          onClick={() => handleDownloadImage(active)}
                          className="px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] hover:opacity-80 transition-all flex items-center gap-1 cursor-pointer"
                          title="Download Mockup"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export PNG</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Image Viewport */}
                  <div className="relative overflow-hidden bg-gray-950 flex items-center justify-center min-h-[380px] max-h-[500px] border border-gray-200 dark:border-zinc-800">
                    {active.imageUrl ? (
                      <img
                        src={active.imageUrl}
                        alt={active.title}
                        className="w-full h-full object-contain max-h-[480px]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      // Procedural Initial Mockup Display
                      <div className="p-8 text-center space-y-4 text-zinc-300 w-full">
                        <div className="w-16 h-16 mx-auto border border-amber-500/40 rounded-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-amber-400" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm uppercase tracking-widest font-black text-white">
                            {brand.brandName} • {active.category.toUpperCase()}
                          </h4>
                          <p className="text-xs text-zinc-400 max-w-md mx-auto font-display">
                            {active.promptUsed}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                          <span>Lens: {active.lens}</span>
                          <span>•</span>
                          <span>Lighting: {active.lighting}</span>
                        </div>
                      </div>
                    )}

                    {/* Engine Overlay Tag */}
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 text-[8px] uppercase tracking-widest font-mono border border-white/20">
                      {active.engine === 'procedural-studio' ? 'Procedural Engine' : `AI Diffusion (${active.engine})`}
                    </div>
                  </div>

                  {/* Mockup Metadata Telemetry */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-dashed border-gray-200 dark:border-zinc-800 text-[9px]">
                    <div>
                      <span className="text-gray-400 block font-bold uppercase tracking-widest">Optics</span>
                      <span className="font-mono text-[#1A1A1A] dark:text-[#F9F7F2]">{active.lens} lens</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-bold uppercase tracking-widest">Environment</span>
                      <span className="font-mono text-[#1A1A1A] dark:text-[#F9F7F2] truncate block">{active.lighting}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-bold uppercase tracking-widest">Materials</span>
                      <span className="font-mono text-[#1A1A1A] dark:text-[#F9F7F2] truncate block">{active.materials}</span>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : null}

          {/* Generated Mockups History / Roll */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                Generated Brand Asset Library ({mockups.length})
              </h3>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-mono">
                Click to inspect &amp; export
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {mockups.map((item) => {
                const isSelected = selectedMockup?.id === item.id;
                return (
                  <AnimatedDottedBorder
                    key={item.id}
                    isActive={isSelected}
                    onClick={() => setSelectedMockup(item)}
                    label={isSelected ? 'Selected' : undefined}
                    className="bg-white dark:bg-[#1C1C1A] p-3 flex flex-col justify-between group h-full shadow-xs cursor-pointer"
                  >
                    <div className="aspect-square bg-gray-900 overflow-hidden flex items-center justify-center relative mb-2">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="p-3 text-center">
                          <Package className="w-5 h-5 mx-auto text-amber-400 mb-1" />
                          <span className="text-[8px] uppercase tracking-widest font-mono text-zinc-400 block">
                            {item.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-[#1A1A1A] dark:text-[#F9F7F2] truncate">
                        {item.title}
                      </h4>
                      <p className="text-[8px] font-mono text-gray-400 truncate">
                        {item.lens} • {item.engine}
                      </p>
                    </div>
                  </AnimatedDottedBorder>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
