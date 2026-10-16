import React, { useState, useEffect, useMemo } from 'react';
import { SAMPLE_PRESETS } from '../data/presets';
import { DEFAULT_SAVED_BRANDS } from '../data/defaultBrands';
import { GenerateBrandRequest, SamplePreset, BrandBible } from '../types';
import { SessionUser } from '../lib/authClient';
import { PopularBrandResearchStudio } from './PopularBrandResearchStudio';
import { RebrandStudio } from './RebrandStudio';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronUp,
  History,
  Database,
  Check,
  Compass,
  Search,
  Type,
} from 'lucide-react';
import { FontPickerModal } from './FontPickerModal';
import {
  GOOGLE_FONTS_CATALOG,
  CURATED_GOOGLE_FONT_PAIRINGS,
  loadGoogleFontDynamically,
} from '../data/googleFontsCatalog';

interface BrandInputFormProps {
  onGenerate: (req: GenerateBrandRequest) => void;
  isLoading: boolean;
  loadingStep?: string;
  savedBrands?: BrandBible[];
  user?: SessionUser | null;
  initialBrandToUpgrade?: BrandBible | null;
  onClearInitialBrand?: () => void;
  onSelectShowcaseBrand?: (brand: BrandBible) => void;
}

const AESTHETIC_VIBES = [
  'Modern & Minimalist',
  'Warm & Organic Artisanal',
  'Futuristic & High-Tech',
  'Heritage & Luxury',
  'Bold & Energetic',
  'Playful & Friendly',
  'Sophisticated & Editorial',
];

const EXISTING_BRAND_SAMPLES = [
  {
    name: 'Veritas Coffee Co.',
    industry: 'Specialty Coffee & Hospitality',
    mission: 'Roasting ethically sourced single-origin beans with obsessive temperature profiling and welcoming community cafes.',
    tagline: 'Truth in Every Roast',
    colors: ['#3E2723', '#D7CCC8', '#FFB300'],
    aesthetic: 'Warm & Organic Artisanal',
  },
  {
    name: 'Nexus Aerospace',
    industry: 'Commercial Space & Defense Tech',
    mission: 'Engineering autonomous orbital delivery systems and lightweight composite propulsion for next-generation research.',
    tagline: 'Beyond Earthly Frontiers',
    colors: ['#0A192F', '#00E5FF', '#7928CA'],
    aesthetic: 'Futuristic & High-Tech',
  },
  {
    name: 'Maison Aurelia',
    industry: 'Haute Horology & Fine Jewelry',
    mission: 'Handcrafted Swiss mechanical timepieces celebrating centuries of ancestral metallurgy and timeless luxury.',
    tagline: 'Elegance in Motion',
    colors: ['#1A1A1A', '#C5A880', '#990000'],
    aesthetic: 'Heritage & Luxury',
  },
];

export function BrandInputForm({
  onGenerate,
  isLoading,
  loadingStep,
  savedBrands = [],
  user = null,
  initialBrandToUpgrade = null,
  onClearInitialBrand,
  onSelectShowcaseBrand,
}: BrandInputFormProps) {
  const [activeMode, setActiveMode] = useState<'new_brand' | 'rebrand' | 'existing_brand' | 'research_brands'>(
    initialBrandToUpgrade ? 'rebrand' : 'new_brand'
  );
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // New Brand State
  const [brandName, setBrandName] = useState('');
  const [mission, setMission] = useState('');
  const [industry, setIndustry] = useState('');
  const [aesthetics, setAesthetics] = useState<string[]>(['Modern & Minimalist']);
  const [targetAudience, setTargetAudience] = useState('');
  const [powerLevel, setPowerLevel] = useState<'pro' | 'lite' | 'legacy'>('pro');
  const [productsServices, setProductsServices] = useState('');
  const [geographicMarket, setGeographicMarket] = useState('');
  const [brandArchetype, setBrandArchetype] = useState('');
  const [competitiveEnvironment, setCompetitiveEnvironment] = useState('');
  const [primaryColorPreference, setPrimaryColorPreference] = useState('');
  const [preferredHeadingFont, setPreferredHeadingFont] = useState('');
  const [preferredBodyFont, setPreferredBodyFont] = useState('');
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [fontPickerRole, setFontPickerRole] = useState<'heading' | 'body'>('heading');

  // Dynamically load chosen Google Fonts for live preview
  useEffect(() => {
    if (preferredHeadingFont) loadGoogleFontDynamically(preferredHeadingFont);
  }, [preferredHeadingFont]);

  useEffect(() => {
    if (preferredBodyFont) loadGoogleFontDynamically(preferredBodyFont);
  }, [preferredBodyFont]);

  // Existing Brand State
  const [selectedBaseBrandId, setSelectedBaseBrandId] = useState<string | null>(
    initialBrandToUpgrade?.id || null
  );
  const [existingName, setExistingName] = useState(initialBrandToUpgrade?.brandName || '');
  const [existingTagline, setExistingTagline] = useState(initialBrandToUpgrade?.tagline || '');
  const [existingIndustry, setExistingIndustry] = useState(initialBrandToUpgrade?.industry || '');
  const [existingMission, setExistingMission] = useState(initialBrandToUpgrade?.mission || '');
  const [primaryColor, setPrimaryColor] = useState(
    initialBrandToUpgrade?.palette?.[0]?.hex || '#1A1A1A'
  );
  const [secondaryColor, setSecondaryColor] = useState(
    initialBrandToUpgrade?.palette?.[1]?.hex || '#2563EB'
  );
  const [accentColor, setAccentColor] = useState(
    initialBrandToUpgrade?.palette?.[2]?.hex || '#F59E0B'
  );
  const [existingTargetAudience, setExistingTargetAudience] = useState(
    initialBrandToUpgrade?.targetAudience || ''
  );
  const [existingAesthetics, setExistingAesthetics] = useState<string[]>([
    'Modern & Minimalist',
  ]);

  // Sync if initialBrandToUpgrade changes
  useEffect(() => {
    if (initialBrandToUpgrade) {
      setActiveMode('rebrand');
      setSelectedBaseBrandId(initialBrandToUpgrade.id);
      setExistingName(initialBrandToUpgrade.brandName);
      setExistingTagline(initialBrandToUpgrade.tagline || '');
      setExistingIndustry(initialBrandToUpgrade.industry || '');
      setExistingMission(initialBrandToUpgrade.mission || '');
      setPrimaryColor(initialBrandToUpgrade.palette?.[0]?.hex || '#1A1A1A');
      setSecondaryColor(initialBrandToUpgrade.palette?.[1]?.hex || '#2563EB');
      setAccentColor(initialBrandToUpgrade.palette?.[2]?.hex || '#F59E0B');
      setExistingTargetAudience(initialBrandToUpgrade.targetAudience || '');
    }
  }, [initialBrandToUpgrade]);

  // Handle applying inspiration from Popular Brand Case Studies
  const handleApplyBrandInspiration = (inspiration: {
    recommendedMission: string;
    recommendedAesthetic: string;
    recommendedTargetAudience: string;
    recommendedIndustry: string;
    brandNameSuggestion?: string;
  }) => {
    setMission(inspiration.recommendedMission);
    setIndustry(inspiration.recommendedIndustry);
    setAesthetics([inspiration.recommendedAesthetic]);
    setTargetAudience(inspiration.recommendedTargetAudience);
    if (inspiration.brandNameSuggestion) {
      setBrandName(inspiration.brandNameSuggestion);
    }
    setActiveMode('new_brand');
  };

  // Look for matching brands in storage/cache as user types
  const matchingSavedBrand = useMemo(() => {
    if (!existingName.trim() || activeMode !== 'existing_brand') return null;
    const query = existingName.trim().toLowerCase();
    return (
      savedBrands.find(
        (b) =>
          b.id !== selectedBaseBrandId &&
          (b.brandName.toLowerCase() === query ||
            b.brandName.toLowerCase().startsWith(query))
      ) || null
    );
  }, [existingName, savedBrands, selectedBaseBrandId, activeMode]);

  const handleSelectPreset = (preset: SamplePreset) => {
    setBrandName(preset.name);
    setMission(preset.mission);
    setIndustry(preset.industry);
    setAesthetics([preset.aesthetic.split(' ')[0] || 'Modern & Minimalist']);
    setTargetAudience(preset.targetAudience);
  };

  const handleSelectExistingSample = (sample: (typeof EXISTING_BRAND_SAMPLES)[0]) => {
    setSelectedBaseBrandId(null);
    setExistingName(sample.name);
    setExistingTagline(sample.tagline);
    setExistingIndustry(sample.industry);
    setExistingMission(sample.mission);
    setPrimaryColor(sample.colors[0]);
    setSecondaryColor(sample.colors[1]);
    setAccentColor(sample.colors[2]);
    setExistingAesthetics([sample.aesthetic]);
  };

  const handleSelectSavedBrandToUpgrade = (brand: BrandBible) => {
    setSelectedBaseBrandId(brand.id);
    setExistingName(brand.brandName);
    setExistingTagline(brand.tagline || '');
    setExistingIndustry(brand.industry || '');
    setExistingMission(brand.mission || '');
    setPrimaryColor(brand.palette?.[0]?.hex || '#1A1A1A');
    setSecondaryColor(brand.palette?.[1]?.hex || '#2563EB');
    setAccentColor(brand.palette?.[2]?.hex || '#F59E0B');
    setExistingTargetAudience(brand.targetAudience || '');
    if (brand.personalityTraits?.length) {
      setExistingAesthetics(['Sophisticated & Editorial']);
    }
  };

  const handleToggleAesthetic = (vibe: string, isExisting: boolean = false) => {
    if (isExisting) {
      setExistingAesthetics((prev) =>
        prev.includes(vibe)
          ? prev.length <= 1
            ? prev
            : prev.filter((x) => x !== vibe)
          : [...prev, vibe]
      );
    } else {
      setAesthetics((prev) =>
        prev.includes(vibe)
          ? prev.length <= 1
            ? prev
            : prev.filter((x) => x !== vibe)
          : [...prev, vibe]
      );
    }
  };

  const handleNewBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission.trim()) return;
    onGenerate({
      brandName: brandName.trim() || undefined,
      mission: mission.trim(),
      industry: industry.trim() || undefined,
      aesthetic: aesthetics.join(', '),
      targetAudience: targetAudience.trim() || undefined,
      powerLevel,
      productsServices: productsServices.trim() || undefined,
      geographicMarket: geographicMarket.trim() || undefined,
      brandArchetype: brandArchetype.trim() || undefined,
      competitiveEnvironment: competitiveEnvironment.trim() || undefined,
      primaryColorPreference: primaryColorPreference.trim() || undefined,
      preferredTypography:
        preferredHeadingFont.trim() || preferredBodyFont.trim()
          ? {
              headingFont: preferredHeadingFont.trim() || undefined,
              bodyFont: preferredBodyFont.trim() || undefined,
            }
          : undefined,
    });
  };

  const handleExistingBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingName.trim() || !existingMission.trim()) return;

    // Find original brand if upgrading an existing library/cache brand
    const baseBrand = savedBrands.find(
      (b) => b.id === selectedBaseBrandId || b.brandName.toLowerCase() === existingName.trim().toLowerCase()
    );

    onGenerate({
      brandName: existingName.trim(),
      existingTagline: existingTagline.trim() || undefined,
      mission: existingMission.trim(),
      industry: existingIndustry.trim() || undefined,
      aesthetic: existingAesthetics.join(', '),
      targetAudience: existingTargetAudience.trim() || undefined,
      isExistingBrandRefresh: true,
      existingColors: [primaryColor, secondaryColor, accentColor],
      baseBrandId: baseBrand?.id || selectedBaseBrandId || undefined,
      previousVersionDetails: baseBrand
        ? {
            typography: baseBrand.typography?.headingFont,
            logoConcept: baseBrand.logo?.concept,
            values: baseBrand.values?.map((v) => v.title),
          }
        : undefined,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn">
      {/* GABI identity statement — the first thing visitors read */}
      <div className="text-center mb-6">
        <p className="text-sm font-display text-gray-600 dark:text-zinc-400">
          Turning brand ideas into complete, consistent identities.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center mb-8">
        <div className="inline-flex p-1 bg-gray-100 dark:bg-zinc-900 border border-[#1A1A1A] dark:border-[#F9F7F2]/20">
          <button
            type="button"
            onClick={() => {
              setActiveMode('new_brand');
              if (onClearInitialBrand) onClearInitialBrand();
            }}
            className={`px-4 sm:px-5 py-2 text-[10px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'new_brand'
                ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] shadow-sm'
                : 'text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
            id="tab-new-brand-mode"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create New Brand</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('rebrand')}
            className={`px-4 sm:px-5 py-2 text-[10px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'rebrand' || activeMode === 'existing_brand'
                ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] shadow-sm'
                : 'text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
            id="tab-rebrand-mode"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Rebrand</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('research_brands')}
            className={`px-4 sm:px-5 py-2 text-[10px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'research_brands'
                ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] shadow-sm'
                : 'text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
            id="tab-research-brands-mode"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Case Studies</span>
          </button>
        </div>
      </div>

      {/* MODE 1: CREATE NEW BRAND */}
      {activeMode === 'new_brand' && (
        <div className="space-y-6">
          {/* Main Title & One-Sentence Pitch */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-display font-light tracking-tight text-[#1A1A1A] dark:text-[#F9F7F2]">
              Create Your Complete Brand Identity
            </h1>
            <p className="text-sm font-display text-gray-600 dark:text-gray-600 dark:text-zinc-400 max-w-lg mx-auto">
              Describe your idea in one sentence. AI will craft your vector logos, color palette, typography, social templates, and guidelines.
            </p>
          </div>

          {/* Showcase Demo Brand Bibles (view-only, never saved to the library) */}
          {savedBrands.length === 0 && onSelectShowcaseBrand && (
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-500 block text-center">
                Or explore showcase brand bibles{' '}
                <span className="font-normal normal-case tracking-normal">(view-only — not saved to your library)</span>:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {DEFAULT_SAVED_BRANDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    disabled={isLoading}
                    onClick={() => onSelectShowcaseBrand(b)}
                    className="p-3 border border-dashed border-gray-300 dark:border-gray-300 dark:border-zinc-700 bg-white dark:bg-[#1C1C1A] hover:border-black dark:hover:border-white text-left transition-all cursor-pointer group"
                  >
                    <span className="text-[8px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
                      ★ Showcase
                    </span>
                    <h4 className="font-display text-sm font-bold text-[#1A1A1A] dark:text-[#F9F7F2] truncate mt-0.5">
                      {b.brandName}
                    </h4>
                    <p className="text-[9px] text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                      {b.industry}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 1-Click Starter Presets */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-500 block text-center">
              Or tap a starter concept to test instantly:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectPreset(preset)}
                  className="p-3 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A] hover:border-black dark:hover:border-white text-left transition-all cursor-pointer group"
                >
                  <span className="text-[8px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500 block">
                    {preset.aesthetic.split(' ')[0]}
                  </span>
                  <h4 className="font-display text-sm font-bold text-[#1A1A1A] dark:text-[#F9F7F2] truncate mt-0.5">
                    {preset.name}
                  </h4>
                </button>
              ))}
            </div>
          </div>

          {/* Simple Form Container */}
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8 space-y-5 shadow-sm">
            <form onSubmit={handleNewBrandSubmit} className="space-y-5">
              {/* Primary Question */}
              <div>
                <label htmlFor="mission-input" className="block text-[10px] uppercase tracking-widest font-black mb-2 text-[#1A1A1A] dark:text-[#F9F7F2]">
                  What does your company or project do? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="mission-input"
                  required
                  rows={3}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="e.g. Crafting artisanal cold-brew coffee with ethically sourced single-origin beans and cozy neighborhood cafes..."
                  className="w-full border border-gray-300 dark:border-gray-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-[#1A1A1A] dark:text-[#F9F7F2] placeholder-gray-400 dark:placeholder-zinc-600 text-sm focus:border-black dark:focus:border-white focus:outline-hidden transition-all font-display"
                />
              </div>

              {/* Quick Brand Name & Industry Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="brand-name-input" className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-[#1A1A1A] dark:text-[#F9F7F2]">
                    Brand Name <span className="text-gray-400 font-normal">(Optional - AI will invent if blank)</span>
                  </label>
                  <input
                    id="brand-name-input"
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Lumina Audio"
                    className="w-full border border-gray-300 dark:border-gray-300 dark:border-zinc-700 bg-transparent px-3.5 py-2 text-[#1A1A1A] dark:text-[#F9F7F2] text-sm focus:border-black dark:focus:border-white focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="industry-input" className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-[#1A1A1A] dark:text-[#F9F7F2]">
                    Industry / Niche <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="industry-input"
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Specialty Coffee, SaaS, Fashion"
                    className="w-full border border-gray-300 dark:border-gray-300 dark:border-zinc-700 bg-transparent px-3.5 py-2 text-[#1A1A1A] dark:text-[#F9F7F2] text-sm focus:border-black dark:focus:border-white focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Power Level & Autonomous Engine Routing */}
              <div className="border-t border-dashed border-gray-200 dark:border-zinc-800 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase tracking-widest font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                    Intelligence Engine & Power Level
                  </span>
                  <span className="text-[8px] font-mono text-gray-400">
                    {powerLevel === 'pro' ? 'Gemini 3.1 Pro Strategic Cascade' : powerLevel === 'lite' ? 'Gemini 3.1 Flash Lite Agile Sprint' : 'Local Deterministic Vector Engine'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPowerLevel('pro')}
                    className={`p-2.5 border text-left transition-all cursor-pointer ${
                      powerLevel === 'pro'
                        ? 'border-black dark:border-white bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                        : 'border-gray-200 dark:border-zinc-800 bg-transparent text-gray-600 dark:text-zinc-400 hover:border-black'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider">Pro Director</span>
                      <span className="text-[7px] font-mono px-1 py-0.2 bg-amber-400/20 text-amber-500 rounded">DEEP</span>
                    </div>
                    <p className="text-[8px] opacity-75 mt-0.5 leading-tight">Multi-stage reasoning & agency vector craft</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPowerLevel('lite')}
                    className={`p-2.5 border text-left transition-all cursor-pointer ${
                      powerLevel === 'lite'
                        ? 'border-black dark:border-white bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                        : 'border-gray-200 dark:border-zinc-800 bg-transparent text-gray-600 dark:text-zinc-400 hover:border-black'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider">Lite Agile</span>
                      <span className="text-[7px] font-mono px-1 py-0.2 bg-blue-400/20 text-blue-500 rounded">FAST</span>
                    </div>
                    <p className="text-[8px] opacity-75 mt-0.5 leading-tight">Ultra-low latency rapid prototyping</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPowerLevel('legacy')}
                    className={`p-2.5 border text-left transition-all cursor-pointer ${
                      powerLevel === 'legacy'
                        ? 'border-black dark:border-white bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                        : 'border-gray-200 dark:border-zinc-800 bg-transparent text-gray-600 dark:text-zinc-400 hover:border-black'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider">Procedural</span>
                      <span className="text-[7px] font-mono px-1 py-0.2 bg-emerald-400/20 text-emerald-500 rounded">LOCAL</span>
                    </div>
                    <p className="text-[8px] opacity-75 mt-0.5 leading-tight">Instant zero-API mathematical synthesis</p>
                  </button>
                </div>
              </div>

              {/* Collapsible Additional Details */}
              <div className="border-t border-dashed border-gray-200 dark:border-zinc-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  {showMoreOptions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  <span>{showMoreOptions ? 'Hide Strategic Context & Architecture' : '+ Add Strategic Brand Intelligence (Products, Market, Archetype)'}</span>
                </button>

                {showMoreOptions && (
                  <div className="pt-4 space-y-4 animate-fadeIn">
                    {/* Products / Services & Geographic Market */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="products-input" className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-[#1A1A1A] dark:text-[#F9F7F2]">
                          Key Products / Services Offered
                        </label>
                        <input
                          id="products-input"
                          type="text"
                          value={productsServices}
                          onChange={(e) => setProductsServices(e.target.value)}
                          placeholder="e.g. Single-origin cold brew, beans, cafes"
                          className="w-full border border-gray-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-[#1A1A1A] dark:text-[#F9F7F2] text-xs focus:border-black dark:focus:border-white focus:outline-hidden transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="market-input" className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-[#1A1A1A] dark:text-[#F9F7F2]">
                          Target Geographic Market
                        </label>
                        <input
                          id="market-input"
                          type="text"
                          value={geographicMarket}
                          onChange={(e) => setGeographicMarket(e.target.value)}
                          placeholder="e.g. Global, North America & Europe"
                          className="w-full border border-gray-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-[#1A1A1A] dark:text-[#F9F7F2] text-xs focus:border-black dark:focus:border-white focus:outline-hidden transition-all"
                        />
                      </div>
                    </div>

                    {/* Preferred Logo Archetype & Competitive Rivals */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="archetype-select" className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-[#1A1A1A] dark:text-[#F9F7F2]">
                          Target Logo Archetype
                        </label>
                        <select
                          id="archetype-select"
                          value={brandArchetype}
                          onChange={(e) => setBrandArchetype(e.target.value)}
                          className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-[#1A1A1A] dark:text-[#F9F7F2] text-xs focus:border-black dark:focus:border-white focus:outline-hidden transition-all"
                        >
                          <option value="">Auto-select optimal industry archetype</option>
                          <option value="Interlocking Monogram">Interlocking Monogram (Golden ratio curves)</option>
                          <option value="Negative Space Cutout">Negative Space Cutout (Optical contrast)</option>
                          <option value="Geometric Minimalist">Geometric Minimalist (Bauhaus grid)</option>
                          <option value="Architectural Seal">Architectural Seal / Heraldic Badge</option>
                          <option value="Abstract Kinetic Prism">Abstract Kinetic Prism (Dynamic metaphor)</option>
                          <option value="Modern Wordmark">Modern Wordmark (Refined letterspacing)</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="rivals-input" className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-[#1A1A1A] dark:text-[#F9F7F2]">
                          Competitive Landscape / Rivals
                        </label>
                        <input
                          id="rivals-input"
                          type="text"
                          value={competitiveEnvironment}
                          onChange={(e) => setCompetitiveEnvironment(e.target.value)}
                          placeholder="e.g. Blue Bottle, Stumptown, local roasters"
                          className="w-full border border-gray-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-[#1A1A1A] dark:text-[#F9F7F2] text-xs focus:border-black dark:focus:border-white focus:outline-hidden transition-all"
                        />
                      </div>
                    </div>

                    {/* Aesthetic Vibe Selector */}
                    <div>
                      <span className="block text-[9px] uppercase tracking-widest font-bold mb-2 text-[#1A1A1A] dark:text-[#F9F7F2]">
                        Design Aesthetic
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {AESTHETIC_VIBES.map((vibe) => {
                          const isActive = aesthetics.includes(vibe);
                          return (
                            <button
                              key={vibe}
                              type="button"
                              onClick={() => handleToggleAesthetic(vibe, false)}
                              className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold transition-all border cursor-pointer ${
                                isActive
                                  ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] border-[#1A1A1A] dark:border-[#F9F7F2]'
                                  : 'bg-transparent text-gray-600 dark:text-zinc-400 border-gray-300 dark:border-zinc-700 hover:border-black'
                              }`}
                            >
                              {vibe}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Target Audience & Primary Color Anchor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="audience-input" className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-[#1A1A1A] dark:text-[#F9F7F2]">
                          Target Audience
                        </label>
                        <input
                          id="audience-input"
                          type="text"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          placeholder="e.g. Discerning lifestyle enthusiasts"
                          className="w-full border border-gray-300 dark:border-zinc-700 bg-transparent px-3.5 py-2 text-[#1A1A1A] dark:text-[#F9F7F2] text-sm focus:border-black dark:focus:border-white focus:outline-hidden transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="color-anchor-input" className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-[#1A1A1A] dark:text-[#F9F7F2]">
                          Seed Color Anchor <span className="text-gray-400 font-normal">(Optional hex)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={primaryColorPreference || '#1A1A1A'}
                            onChange={(e) => setPrimaryColorPreference(e.target.value)}
                            className="w-9 h-9 border border-gray-300 dark:border-zinc-700 cursor-pointer bg-transparent"
                          />
                          <input
                            id="color-anchor-input"
                            type="text"
                            value={primaryColorPreference}
                            onChange={(e) => setPrimaryColorPreference(e.target.value)}
                            placeholder="e.g. #2563EB or leave blank"
                            className="w-full border border-gray-300 dark:border-zinc-700 bg-transparent px-3.5 py-2 text-[#1A1A1A] dark:text-[#F9F7F2] text-sm focus:border-black dark:focus:border-white focus:outline-hidden transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Google Fonts Typography Direction */}
                    <div className="border-t border-dashed border-gray-200 dark:border-zinc-800 pt-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Type className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">
                            Typography Direction (Google Fonts)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFontPickerRole('heading');
                            setIsFontPickerOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded cursor-pointer transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Browse 100+ Google Fonts</span>
                        </button>
                      </div>

                      {/* Curated Google Font Pairings Quick-Pills */}
                      <div>
                        <span className="block text-[8px] text-gray-400 uppercase font-bold tracking-wider mb-1.5">
                          1-Click Curated Google Font Pairings:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {CURATED_GOOGLE_FONT_PAIRINGS.map((pairing) => {
                            const isSelected =
                              preferredHeadingFont === pairing.headingFont &&
                              preferredBodyFont === pairing.bodyFont;
                            return (
                              <button
                                key={pairing.name}
                                type="button"
                                onClick={() => {
                                  setPreferredHeadingFont(pairing.headingFont);
                                  setPreferredBodyFont(pairing.bodyFont);
                                  loadGoogleFontDynamically(pairing.headingFont);
                                  loadGoogleFontDynamically(pairing.bodyFont);
                                }}
                                className={`px-2 py-1 text-[8px] uppercase tracking-wider font-bold border transition-colors cursor-pointer rounded-xs ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 font-black'
                                    : 'bg-white dark:bg-zinc-800/60 text-gray-700 dark:text-zinc-300 border-gray-300 dark:border-zinc-700 hover:border-blue-500'
                                }`}
                              >
                                {pairing.name} ({pairing.headingFont} + {pairing.bodyFont})
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">
                              Preferred Heading Font
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setFontPickerRole('heading');
                                setIsFontPickerOpen(true);
                              }}
                              className="text-[8px] text-blue-500 hover:underline cursor-pointer"
                            >
                              Browse Catalog...
                            </button>
                          </div>
                          <input
                            type="text"
                            value={preferredHeadingFont}
                            onChange={(e) => setPreferredHeadingFont(e.target.value)}
                            placeholder="e.g. Plus Jakarta Sans, Syne, Playfair Display"
                            className="w-full border border-gray-300 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-[#1A1A1A] dark:text-[#F9F7F2] text-xs focus:border-black dark:focus:border-white focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">
                              Preferred Body Font
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setFontPickerRole('body');
                                setIsFontPickerOpen(true);
                              }}
                              className="text-[8px] text-blue-500 hover:underline cursor-pointer"
                            >
                              Browse Catalog...
                            </button>
                          </div>
                          <input
                            type="text"
                            value={preferredBodyFont}
                            onChange={(e) => setPreferredBodyFont(e.target.value)}
                            placeholder="e.g. Inter, Roboto, DM Sans, Lora"
                            className="w-full border border-gray-300 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-[#1A1A1A] dark:text-[#F9F7F2] text-xs focus:border-black dark:focus:border-white focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Live Specimen Preview if selected */}
                      {(preferredHeadingFont || preferredBodyFont) && (
                        <div className="p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-sm">
                          <span className="text-[8px] font-mono uppercase text-gray-400 block mb-1">
                            Live Specimen Preview:
                          </span>
                          <div
                            className="text-base font-bold text-gray-900 dark:text-zinc-100"
                            style={{ fontFamily: `"${preferredHeadingFont || 'sans-serif'}", sans-serif` }}
                          >
                            {brandName || 'Brand Display'} — Aa Bb Cc 123
                          </div>
                          <p
                            className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5"
                            style={{ fontFamily: `"${preferredBodyFont || 'sans-serif'}", sans-serif` }}
                          >
                            Crafting extraordinary digital products and consistent design systems.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoading || !mission.trim()}
                className="w-full py-4 px-6 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-xs uppercase tracking-[0.25em] font-black hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer shadow-md"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{loadingStep || 'Crafting Your Brand Identity...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Brand Identity</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODE 2: REBRAND STUDIO */}
      {(activeMode === 'rebrand' || activeMode === 'existing_brand') && (
        <RebrandStudio
          onGenerate={onGenerate}
          isLoading={isLoading}
          loadingStep={loadingStep}
          savedBrands={savedBrands}
          initialBrandToRebrand={initialBrandToUpgrade}
          onClearInitialBrand={onClearInitialBrand}
        />
      )}

      {/* MODE 3: ICONIC BRAND CASE STUDIES & HISTORY */}
      {activeMode === 'research_brands' && (
        <PopularBrandResearchStudio
          onApplyBrandInspiration={handleApplyBrandInspiration}
        />
      )}

      {/* Vast Google Fonts Picker Modal */}
      <FontPickerModal
        isOpen={isFontPickerOpen}
        onClose={() => setIsFontPickerOpen(false)}
        onSelectFont={(fontName) => {
          if (fontPickerRole === 'heading') {
            setPreferredHeadingFont(fontName);
          } else {
            setPreferredBodyFont(fontName);
          }
          loadGoogleFontDynamically(fontName);
        }}
        onSelectPairing={(pairing) => {
          setPreferredHeadingFont(pairing.headingFont);
          setPreferredBodyFont(pairing.bodyFont);
          loadGoogleFontDynamically(pairing.headingFont);
          loadGoogleFontDynamically(pairing.bodyFont);
        }}
        currentHeadingFont={preferredHeadingFont}
        currentBodyFont={preferredBodyFont}
        targetRole={fontPickerRole}
      />
    </div>
  );
}
