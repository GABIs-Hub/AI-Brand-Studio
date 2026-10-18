import React, { useState, useRef, useEffect } from 'react';
import {
  RefreshCw,
  Sparkles,
  Upload,
  Palette,
  Type,
  Shield,
  FileText,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  HelpCircle,
  Wand2,
  Sliders,
  History,
  Info,
} from 'lucide-react';
import { BrandBible, GenerateBrandRequest } from '../types';
import { FontPickerModal } from './FontPickerModal';
import {
  GOOGLE_FONTS_CATALOG,
  loadGoogleFontDynamically,
} from '../data/googleFontsCatalog';

interface RebrandStudioProps {
  onGenerate: (req: GenerateBrandRequest) => void;
  isLoading: boolean;
  loadingStep?: string;
  savedBrands?: BrandBible[];
  initialBrandToRebrand?: BrandBible | null;
  onClearInitialBrand?: () => void;
}

const COMMON_HEADING_FONTS = [
  'Arial',
  'Helvetica',
  'Plus Jakarta Sans',
  'Georgia',
  'Impact',
  'Comic Sans MS',
  'Futura',
  'Montserrat',
  'Roboto',
  'Bodoni MT',
  'Papyrus',
  'Courier New',
];

const COMMON_BODY_FONTS = [
  'Arial',
  'Open Sans',
  'Calibri',
  'Georgia',
  'Verdana',
  'Roboto',
  'Plus Jakarta Sans',
  'Tahoma',
  'Trebuchet MS',
];

const LEGACY_PALETTE_PRESETS = [
  {
    name: '90s Corporate Blue',
    colors: ['#003366', '#336699', '#99CCFF'],
  },
  {
    name: 'Dated Pastel Startup',
    colors: ['#FFB6C1', '#B0E0E6', '#FFD700'],
  },
  {
    name: 'Harsh Primary Web 1.0',
    colors: ['#FF0000', '#0000FF', '#FFFF00'],
  },
  {
    name: 'Dull Enterprise Gray',
    colors: ['#4A4A4A', '#808080', '#D3D3D3'],
  },
  {
    name: 'Cluttered 2010s Gradient',
    colors: ['#7928CA', '#FF0080', '#00DFD8'],
  },
];

const REBRAND_PROMPT_SUGGESTIONS = [
  'Transition toward Swiss modernist minimalism with warm earthy neutrals and mathematical negative space.',
  'Elevate from a scrappy tech utility to a commanding, premium enterprise SaaS authority.',
  'Retire the literal cartoon emblem in favor of an abstract, geometric interlocking monogram.',
  'Target Gen Z luxury consumers with high-contrast editorial typography and bespoke dark palettes.',
  'Transform our local organic coffee roastery into an international design-forward lifestyle benchmark.',
];

export function RebrandStudio({
  onGenerate,
  isLoading,
  loadingStep,
  savedBrands = [],
  initialBrandToRebrand = null,
  onClearInitialBrand,
}: RebrandStudioProps) {
  // Brand basics
  const [brandName, setBrandName] = useState(initialBrandToRebrand?.brandName || '');
  const [industry, setIndustry] = useState(initialBrandToRebrand?.industry || '');
  const [mission, setMission] = useState(initialBrandToRebrand?.mission || '');

  // Current Logo state
  const [logoInputType, setLogoInputType] = useState<'upload' | 'svg' | 'description'>('upload');
  const [logoData, setLogoData] = useState<string>(
    initialBrandToRebrand?.logo?.primaryLogoSvg || ''
  );
  const [logoDescription, setLogoDescription] = useState<string>('');
  const [logoFileName, setLogoFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current Typography state
  const [headingFont, setHeadingFont] = useState(
    initialBrandToRebrand?.typography?.headingFont || 'Arial'
  );
  const [bodyFont, setBodyFont] = useState(
    initialBrandToRebrand?.typography?.bodyFont || 'Helvetica'
  );
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [fontPickerRole, setFontPickerRole] = useState<'heading' | 'body'>('heading');
  const [fontCategoryTab, setFontCategoryTab] = useState<string>('All');

  // Load Google Fonts whenever heading or body font updates
  useEffect(() => {
    if (headingFont) loadGoogleFontDynamically(headingFont);
  }, [headingFont]);

  useEffect(() => {
    if (bodyFont) loadGoogleFontDynamically(bodyFont);
  }, [bodyFont]);

  // Current Colors state
  const [palette, setPalette] = useState<string[]>(
    initialBrandToRebrand?.palette?.map((c) => c.hex) || ['#003366', '#336699', '#99CCFF']
  );

  // Rebrand Mode state: 'impress_me' (autonomous reasoning) vs 'custom_prompt' (user vision)
  const [rebrandMode, setRebrandMode] = useState<'impress_me' | 'custom_prompt'>('impress_me');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Sync if initialBrandToRebrand changes
  useEffect(() => {
    if (initialBrandToRebrand) {
      setBrandName(initialBrandToRebrand.brandName);
      setIndustry(initialBrandToRebrand.industry || '');
      setMission(initialBrandToRebrand.mission || '');
      if (initialBrandToRebrand.logo?.primaryLogoSvg) {
        setLogoInputType('svg');
        setLogoData(initialBrandToRebrand.logo.primaryLogoSvg);
      }
      if (initialBrandToRebrand.typography) {
        setHeadingFont(initialBrandToRebrand.typography.headingFont || 'Arial');
        setBodyFont(initialBrandToRebrand.typography.bodyFont || 'Helvetica');
      }
      if (initialBrandToRebrand.palette?.length) {
        setPalette(initialBrandToRebrand.palette.map((c) => c.hex));
      }
    }
  }, [initialBrandToRebrand]);

  // Handle file upload (drag and drop or click)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null;
    if ('dataTransfer' in e) {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        file = e.dataTransfer.files[0];
      }
    } else if (e.target.files && e.target.files.length > 0) {
      file = e.target.files[0];
    }

    if (!file) return;

    setLogoFileName(file.name);
    const reader = new FileReader();

    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setLogoData(content);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setLogoData(content);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (index: number, newHex: string) => {
    const updated = [...palette];
    updated[index] = newHex;
    setPalette(updated);
  };

  const handleAddColor = () => {
    if (palette.length >= 5) return;
    const fallbackColors = ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#8B5CF6'];
    const nextColor = fallbackColors[palette.length] || '#888888';
    setPalette([...palette, nextColor]);
  };

  const handleRemoveColor = (index: number) => {
    if (palette.length <= 2) return;
    setPalette(palette.filter((_, i) => i !== index));
  };

  const handleSelectSavedBrand = (brand: BrandBible) => {
    setBrandName(brand.brandName);
    setIndustry(brand.industry || '');
    setMission(brand.mission || '');
    if (brand.logo?.primaryLogoSvg) {
      setLogoInputType('svg');
      setLogoData(brand.logo.primaryLogoSvg);
      setLogoFileName(`${brand.brandName} Logo`);
    }
    if (brand.typography) {
      setHeadingFont(brand.typography.headingFont || 'Arial');
      setBodyFont(brand.typography.bodyFont || 'Helvetica');
    }
    if (brand.palette?.length) {
      setPalette(brand.palette.map((c) => c.hex));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission.trim()) return;

    const currentLogoPayload =
      logoInputType === 'description'
        ? logoDescription.trim() || undefined
        : logoData.trim() || undefined;

    onGenerate({
      brandName: brandName.trim() || undefined,
      industry: industry.trim() || undefined,
      mission: mission.trim(),
      aesthetic: 'Modern, Cohesive & High-Contrast',
      targetAudience: 'Discerning modern audience',
      isRebrand: true,
      isExistingBrandRefresh: true,
      existingColors: palette.filter((c) => c && c.startsWith('#')),
      currentLogo: currentLogoPayload,
      currentLogoType:
        logoInputType === 'description'
          ? 'description'
          : logoData.includes('<svg')
            ? 'svg'
            : 'image',
      currentTypography: {
        headingFont: headingFont.trim() || 'Arial',
        bodyFont: bodyFont.trim() || 'Helvetica',
      },
      rebrandMode,
      customRebrandPrompt:
        rebrandMode === 'custom_prompt' ? customPrompt.trim() || undefined : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn" id="rebrand-studio-form">
      {/* Hero Header */}
      <div className="bg-[#1A1A1A] text-white p-6 sm:p-8 border border-black/10 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden sm:block">
          <RefreshCw className="w-48 h-48 -mr-12 -mt-12 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-amber-400 text-black mb-3">
            <RefreshCw className="w-3 h-3" />
            Rebrand Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F9F7F2] mb-2">
            Modernize Your Brand Identity & Generate Your Rebrand Story
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
            Input your current logos, typography, and color palette. Choose whether GABI should
            critique and impress you with its own strategic reasoning, or guide it with your custom prompts.
            GABI will synthesize a high-contrast Brand Bible and formulate an inspiring rebrand bio
            explaining why you are moving into this new phase.
          </p>
        </div>
      </div>

      {/* Quick Load from Library / Presets (Optional) */}
      {savedBrands.length > 0 && (
        <div className="bg-[#FAF9F6] dark:bg-[#202020] border border-black/5 dark:border-white/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-500" />
              Pre-load from your Saved Library:
            </span>
            {initialBrandToRebrand && onClearInitialBrand && (
              <button
                type="button"
                onClick={onClearInitialBrand}
                className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white underline cursor-pointer"
              >
                Clear Pre-loaded
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {savedBrands.slice(0, 5).map((b) => (
              <button
                type="button"
                key={b.id}
                onClick={() => handleSelectSavedBrand(b)}
                className={`px-3 py-1.5 text-xs border transition-all cursor-pointer flex items-center gap-2 ${
                  brandName.toLowerCase() === b.brandName.toLowerCase()
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold'
                    : 'bg-white dark:bg-[#2A2A2A] text-gray-800 dark:text-zinc-200 border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white'
                }`}
              >
                <span>{b.brandName}</span>
                <div className="flex items-center gap-0.5">
                  {b.palette?.slice(0, 3).map((col, idx) => (
                    <span
                      key={idx}
                      className="w-2 h-2 rounded-xl-full border border-black/20"
                      style={{ backgroundColor: col.hex }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 1: Brand Fundamentals */}
      <div className="bg-white dark:bg-[#242424] border border-[#1A1A1A]/10 dark:border-[#F9F7F2]/10 p-6 sm:p-7 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2] mb-4 flex items-center gap-2">
          <span className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-mono text-[10px]">
            01
          </span>
          Current Company & Business Core
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
              Current Brand Name *
            </label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g., Acme Logistics, Veritas Coffee Co."
              className="w-full px-3 py-2 text-sm bg-transparent border border-black/20 dark:border-white/20 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white"
              id="rebrand-brand-name-input"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
              Industry or Vertical
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Sustainable Packaging, Fintech, Hospitality"
              className="w-full px-3 py-2 text-sm bg-transparent border border-black/20 dark:border-white/20 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white"
              id="rebrand-industry-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
            What your business does & why you exist (Mission) *
          </label>
          <textarea
            required
            rows={3}
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="Describe what your business does, your origins, and your core offering to customers..."
            className="w-full px-3 py-2 text-sm bg-transparent border border-black/20 dark:border-white/20 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white"
            id="rebrand-mission-input"
          />
        </div>
      </div>

      {/* SECTION 2: Current Brand Assets (Logo, Typography, Palette) */}
      <div className="bg-white dark:bg-[#242424] border border-[#1A1A1A]/10 dark:border-[#F9F7F2]/10 p-6 sm:p-7 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2] mb-1 flex items-center gap-2">
          <span className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-mono text-[10px]">
            02
          </span>
          Your Current Assets (To Be Transformed)
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-6">
          Provide your current logo, font stack, and color swatches so GABI can perform a strategic diagnosis.
        </p>

        {/* 1. Current Logo */}
        <div className="mb-8 p-4 bg-[#FAF9F6] dark:bg-[#1C1C1C] border border-black/5 dark:border-white/5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                Current Logo
              </span>
            </div>

            <div className="flex items-center gap-1 border border-black/10 dark:border-white/10 p-0.5 bg-white dark:bg-[#2A2A2A]">
              <button
                type="button"
                onClick={() => setLogoInputType('upload')}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  logoInputType === 'upload'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setLogoInputType('svg')}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  logoInputType === 'svg'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Paste SVG
              </button>
              <button
                type="button"
                onClick={() => setLogoInputType('description')}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  logoInputType === 'description'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Describe Logo
              </button>
            </div>
          </div>

          {/* Logo Input Modes */}
          {logoInputType === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/svg+xml,image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
                id="rebrand-logo-file-input"
              />
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileUpload}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white p-6 text-center cursor-pointer transition-colors bg-white/50 dark:bg-white/5"
              >
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 block">
                  Drag & Drop your current logo (SVG, PNG, JPG, WebP)
                </span>
                <span className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1 block">
                  or click to browse from your device
                </span>
                {logoFileName && (
                  <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-mono bg-green-100 text-green-800 border border-green-300">
                    ✓ Loaded: {logoFileName}
                  </span>
                )}
              </div>
            </div>
          )}

          {logoInputType === 'svg' && (
            <div>
              <textarea
                rows={3}
                value={logoData}
                onChange={(e) => setLogoData(e.target.value)}
                placeholder="<svg viewBox='0 0 100 100'>...</svg>"
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-black/30 border border-black/20 dark:border-white/20 text-gray-900 dark:text-zinc-100 focus:outline-none"
                id="rebrand-logo-svg-input"
              />
            </div>
          )}

          {logoInputType === 'description' && (
            <div>
              <textarea
                rows={2}
                value={logoDescription}
                onChange={(e) => setLogoDescription(e.target.value)}
                placeholder="e.g. A blue globe with a red swoosh and generic sans-serif lettering underneath..."
                className="w-full px-3 py-2 text-xs bg-white dark:bg-black/30 border border-black/20 dark:border-white/20 text-gray-900 dark:text-zinc-100 focus:outline-none"
                id="rebrand-logo-description-input"
              />
            </div>
          )}

          {/* Current Logo Preview */}
          {logoData && logoInputType !== 'description' && (
            <div className="mt-3 p-3 bg-white dark:bg-[#222] border border-black/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 border border-black/10 flex items-center justify-center overflow-hidden p-1">
                  {logoData.includes('<svg') ? (
                    <div
                      className="w-full h-full flex items-center justify-center [&>svg]:max-h-12 [&>svg]:w-auto"
                      dangerouslySetInnerHTML={{ __html: logoData }}
                    />
                  ) : (
                    <img src={logoData} alt="Current Logo" className="max-h-12 max-w-full object-contain" />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-800 dark:text-zinc-200 block">
                    Current Logo Preview
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-zinc-400">
                    Ready for GABI's modernization transformation
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLogoData('');
                  setLogoFileName('');
                }}
                className="text-[10px] uppercase font-bold text-red-600 hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* 2. Current Typography (Vast Google Fonts Selection) */}
        <div className="mb-8 p-4 bg-[#FAF9F6] dark:bg-[#1C1C1C] border border-black/5 dark:border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                Current Typography (Google Fonts & Legacy Stacks)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFontPickerRole('heading');
                  setIsFontPickerOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer transition-colors shadow-xs"
              >
                <Sparkles className="w-3 h-3" />
                <span>Browse 100+ Google Fonts</span>
              </button>
            </div>
          </div>

          {/* Category Filter for Quick Selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
            <span className="text-gray-400 font-bold uppercase text-[9px] mr-1">Filter:</span>
            {['All', 'Sans-Serif', 'Serif', 'Display', 'Monospace', 'Handwriting', 'Classic/Legacy'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFontCategoryTab(cat)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer whitespace-nowrap ${
                  fontCategoryTab === cat
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Heading Font Column */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                  Current Heading Font
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFontPickerRole('heading');
                    setIsFontPickerOpen(true);
                  }}
                  className="text-[9px] text-blue-500 hover:underline cursor-pointer font-semibold"
                >
                  Change Typeface...
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={headingFont}
                  onChange={(e) => setHeadingFont(e.target.value)}
                  placeholder="e.g. Plus Jakarta Sans, Playfair Display, Arial, Comic Sans"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-black/30 border border-black/20 dark:border-white/20 text-gray-900 dark:text-zinc-100 focus:outline-none"
                  id="rebrand-heading-font-input"
                />
              </div>

              {/* Vast Font Chips for Headings */}
              <div className="space-y-1">
                <span className="text-[9px] text-gray-400 uppercase font-semibold block">
                  Quick Select Headings ({fontCategoryTab}):
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {GOOGLE_FONTS_CATALOG.filter(
                    (f) =>
                      (fontCategoryTab === 'All' || f.category === fontCategoryTab) &&
                      (f.bestFor === 'heading' || f.bestFor === 'both')
                  )
                    .slice(0, 18)
                    .map((font) => (
                      <button
                        type="button"
                        key={font.name}
                        onClick={() => {
                          setHeadingFont(font.name);
                          if (font.isGoogleFont) loadGoogleFontDynamically(font.name);
                        }}
                        className={`px-1.5 py-0.5 text-[9px] border transition-colors cursor-pointer rounded-xs ${
                          headingFont.toLowerCase() === font.name.toLowerCase()
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-white dark:bg-[#2A2A2A] text-gray-700 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:border-blue-500'
                        }`}
                      >
                        {font.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Body Font Column */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400">
                  Current Body Font
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFontPickerRole('body');
                    setIsFontPickerOpen(true);
                  }}
                  className="text-[9px] text-blue-500 hover:underline cursor-pointer font-semibold"
                >
                  Change Typeface...
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  placeholder="e.g. Inter, Open Sans, Roboto, Helvetica, Georgia"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-black/30 border border-black/20 dark:border-white/20 text-gray-900 dark:text-zinc-100 focus:outline-none"
                  id="rebrand-body-font-input"
                />
              </div>

              {/* Vast Font Chips for Body */}
              <div className="space-y-1">
                <span className="text-[9px] text-gray-400 uppercase font-semibold block">
                  Quick Select Body ({fontCategoryTab}):
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {GOOGLE_FONTS_CATALOG.filter(
                    (f) =>
                      (fontCategoryTab === 'All' || f.category === fontCategoryTab) &&
                      (f.bestFor === 'body' || f.bestFor === 'both')
                  )
                    .slice(0, 18)
                    .map((font) => (
                      <button
                        type="button"
                        key={font.name}
                        onClick={() => {
                          setBodyFont(font.name);
                          if (font.isGoogleFont) loadGoogleFontDynamically(font.name);
                        }}
                        className={`px-1.5 py-0.5 text-[9px] border transition-colors cursor-pointer rounded-xs ${
                          bodyFont.toLowerCase() === font.name.toLowerCase()
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-white dark:bg-[#2A2A2A] text-gray-700 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:border-blue-500'
                        }`}
                      >
                        {font.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Specimen Preview */}
          <div className="p-3.5 bg-white dark:bg-[#222] border border-black/10 dark:border-white/10 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-gray-400">
                Live Font Specimen Preview:
              </span>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span>
                  Heading: <strong className="text-gray-900 dark:text-zinc-100">{headingFont || 'Default'}</strong>
                </span>
                <span>•</span>
                <span>
                  Body: <strong className="text-gray-900 dark:text-zinc-100">{bodyFont || 'Default'}</strong>
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div
                className="text-lg font-bold text-gray-900 dark:text-zinc-100 leading-tight"
                style={{ fontFamily: `"${headingFont || 'Arial'}", sans-serif` }}
              >
                {brandName || 'Brand Heading'} — Aa Bb Cc 0123456789
              </div>
              <p
                className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed"
                style={{ fontFamily: `"${bodyFont || 'Helvetica'}", sans-serif` }}
              >
                The quick brown fox jumps over the lazy dog. GABI analyzes this current typography
                and elevates it with harmonized Google Fonts pairings, optical contrast, and responsive scale ratios.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Current Color Palette */}
        <div className="p-4 bg-[#FAF9F6] dark:bg-[#1C1C1C] border border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                Current Color Palette
              </span>
            </div>

            {palette.length < 5 && (
              <button
                type="button"
                onClick={handleAddColor}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border border-black/20 dark:border-white/20 bg-white dark:bg-[#2A2A2A] hover:bg-black/5 cursor-pointer"
                id="rebrand-add-color-btn"
              >
                <Plus className="w-3 h-3" />
                Add Color
              </button>
            )}
          </div>

          {/* Swatch Editor */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            {palette.map((hex, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-white dark:bg-[#222] border border-black/10 dark:border-white/10"
              >
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="w-7 h-7 cursor-pointer border-0 p-0 bg-transparent rounded-xl"
                  title="Pick color"
                />
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  placeholder="#000000"
                  className="w-16 px-1.5 py-0.5 text-xs font-mono uppercase bg-transparent border-b border-black/20 dark:border-white/20 text-gray-800 dark:text-zinc-200 focus:outline-none"
                />
                {palette.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                    title="Remove color"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Legacy Presets Quick Load */}
          <div className="pt-2 border-t border-black/5 dark:border-white/5">
            <span className="text-[10px] font-mono text-gray-400 block mb-1.5">
              Or quickly pick a typical legacy palette:
            </span>
            <div className="flex flex-wrap gap-2">
              {LEGACY_PALETTE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setPalette(preset.colors)}
                  className="px-2 py-1 text-[10px] bg-white dark:bg-[#2A2A2A] border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white flex items-center gap-1.5 cursor-pointer"
                >
                  <div className="flex items-center gap-0.5">
                    {preset.colors.map((c, i) => (
                      <span key={i} className="w-2 h-2" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Strategic Direction (Let GABI Impress Me vs Custom Prompts) */}
      <div className="bg-white dark:bg-[#242424] border border-[#1A1A1A]/10 dark:border-[#F9F7F2]/10 p-6 sm:p-7 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2] mb-1 flex items-center gap-2">
          <span className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-mono text-[10px]">
            03
          </span>
          Rebrand Strategy & Decision Mode
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-6">
          Decide whether GABI should formulate its own autonomous creative diagnosis or follow your exact prompt directions.
        </p>

        {/* The 2 Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Option A: GABI Impress Me */}
          <div
            onClick={() => setRebrandMode('impress_me')}
            className={`p-5 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              rebrandMode === 'impress_me'
                ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs'
                : 'border-black/10 dark:border-white/10 hover:border-black/30'
            }`}
            id="rebrand-mode-impress-me"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-amber-400 text-black font-bold">
                  <Wand2 className="w-4 h-4" />
                </div>
                {rebrandMode === 'impress_me' && (
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-amber-400 text-black">
                    Selected
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2] mb-1.5">
                Let GABI Impress Me
              </h3>
              <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed mb-3">
                GABI acts as your autonomous Creative Director. It critiques the weaknesses of your current
                assets, diagnoses visual bottlenecks, and reasons from first principles to formulate an elevated,
                visionary transformation.
              </p>
            </div>
            <div className="pt-3 border-t border-black/5 dark:border-white/5 text-[11px] text-amber-700 dark:text-amber-400 font-mono">
              ✓ Autonomous creative critique & rationale
            </div>
          </div>

          {/* Option B: Write Down Custom Prompts */}
          <div
            onClick={() => setRebrandMode('custom_prompt')}
            className={`p-5 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              rebrandMode === 'custom_prompt'
                ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs'
                : 'border-black/10 dark:border-white/10 hover:border-black/30'
            }`}
            id="rebrand-mode-custom-prompt"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-600 text-white font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                {rebrandMode === 'custom_prompt' && (
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-blue-600 text-white">
                    Selected
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2] mb-1.5">
                Write Down Custom Prompts
              </h3>
              <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed mb-3">
                Take the reins: write down your explicit vision, design mandates, mood shifts, or audience
                repositioning notes. GABI will execute your prompt instructions with rigorous mathematical craft.
              </p>
            </div>
            <div className="pt-3 border-t border-black/5 dark:border-white/5 text-[11px] text-blue-700 dark:text-blue-400 font-mono">
              ✓ Tailored to your exact creative prompt
            </div>
          </div>
        </div>

        {/* Custom Prompt Textarea (Active if custom_prompt is chosen) */}
        {rebrandMode === 'custom_prompt' && (
          <div className="space-y-3 p-4 bg-[#FAF9F6] dark:bg-[#1C1C1C] border border-blue-500/30 animate-fadeIn">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                Your Rebrand Prompt & Creative Mandate *
              </label>
              <span className="text-[10px] text-gray-400 font-mono">
                Specific shifts you want GABI to execute
              </span>
            </div>

            <textarea
              rows={3}
              required={rebrandMode === 'custom_prompt'}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Modernize our identity with architectural Swiss minimalism. Replace the literal icon with an abstract geometric emblem. Use warm taupe and deep charcoal neutrals with a vibrant amber accent..."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-black/40 border border-black/20 dark:border-white/20 text-gray-900 dark:text-zinc-100 focus:outline-none"
              id="rebrand-custom-prompt-input"
            />

            <div>
              <span className="text-[10px] font-mono text-gray-400 block mb-1">
                Inspirational starter prompts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {REBRAND_PROMPT_SUGGESTIONS.map((promptText, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setCustomPrompt(promptText)}
                    className="px-2 py-1 text-[10px] text-left bg-white dark:bg-[#2A2A2A] border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white text-gray-700 dark:text-zinc-300 cursor-pointer"
                  >
                    "{promptText.slice(0, 60)}..."
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Will generate a complete Brand Bible, vector emblem suite, and official rebrand bio narrative.
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading || !mission.trim()}
          className={`w-full sm:w-auto px-8 py-3.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isLoading || !mission.trim()
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-black text-white dark:bg-white dark:text-black hover:bg-amber-400 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black shadow-sm'
          }`}
          id="rebrand-submit-btn"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
              <span>{loadingStep || 'Synthesizing Rebrand & Bio...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Synthesize Rebrand & Story</span>
            </>
          )}
        </button>
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
    </form>
  );
}
