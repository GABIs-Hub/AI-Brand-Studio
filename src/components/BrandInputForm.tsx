import React, { useState, useEffect, useMemo } from 'react';
import { SAMPLE_PRESETS } from '../data/presets';
import { DEFAULT_SAVED_BRANDS } from '../data/defaultBrands';
import { GenerateBrandRequest, SamplePreset, BrandBible } from '../types';
import { SessionUser } from '../lib/authClient';
import { PopularBrandResearchStudio } from './PopularBrandResearchStudio';
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
} from 'lucide-react';

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
  const [activeMode, setActiveMode] = useState<'new_brand' | 'existing_brand' | 'research_brands'>(
    initialBrandToUpgrade ? 'existing_brand' : 'new_brand'
  );
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // New Brand State
  const [brandName, setBrandName] = useState('');
  const [mission, setMission] = useState('');
  const [industry, setIndustry] = useState('');
  const [aesthetics, setAesthetics] = useState<string[]>(['Modern & Minimalist']);
  const [targetAudience, setTargetAudience] = useState('');

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
      setActiveMode('existing_brand');
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
        <p className="text-sm font-serif italic text-gray-600 dark:text-zinc-400">
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
                : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
            id="tab-new-brand-mode"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create New Brand</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('research_brands')}
            className={`px-4 sm:px-5 py-2 text-[10px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'research_brands'
                ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] shadow-sm'
                : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
            id="tab-research-brands-mode"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Iconic Brand Case Studies</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('existing_brand')}
            className={`px-4 sm:px-5 py-2 text-[10px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'existing_brand'
                ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] shadow-sm'
                : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
            id="tab-upgrade-brand-mode"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upgrade Existing Brand</span>
            <span className="sm:hidden">Upgrade</span>
          </button>
        </div>
      </div>

      {/* MODE 1: CREATE NEW BRAND */}
      {activeMode === 'new_brand' && (
        <div className="space-y-6">
          {/* Main Title & One-Sentence Pitch */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif italic font-light tracking-tight text-[#1A1A1A] dark:text-[#F9F7F2]">
              Create Your Complete Brand Identity
            </h1>
            <p className="text-sm font-serif italic text-gray-600 dark:text-gray-600 dark:text-zinc-400 max-w-lg mx-auto">
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
                    <h4 className="font-serif italic text-sm font-bold text-[#1A1A1A] dark:text-[#F9F7F2] truncate mt-0.5">
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
                  <h4 className="font-serif italic text-sm font-bold text-[#1A1A1A] dark:text-[#F9F7F2] truncate mt-0.5">
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
                  className="w-full border border-gray-300 dark:border-gray-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-[#1A1A1A] dark:text-[#F9F7F2] placeholder-gray-400 dark:placeholder-zinc-600 text-sm focus:border-black dark:focus:border-white focus:outline-hidden transition-all font-serif italic"
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

              {/* Collapsible Additional Details */}
              <div className="border-t border-dashed border-gray-200 dark:border-gray-200 dark:border-zinc-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  {showMoreOptions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  <span>{showMoreOptions ? 'Hide Optional Style & Audience' : '+ Choose Aesthetic Style & Target Audience (Optional)'}</span>
                </button>

                {showMoreOptions && (
                  <div className="pt-4 space-y-4 animate-fadeIn">
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
                                  : 'bg-transparent text-gray-600 dark:text-gray-600 dark:text-zinc-400 border-gray-300 dark:border-gray-300 dark:border-zinc-700 hover:border-black'
                              }`}
                            >
                              {vibe}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Target Audience */}
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
                        className="w-full border border-gray-300 dark:border-gray-300 dark:border-zinc-700 bg-transparent px-3.5 py-2 text-[#1A1A1A] dark:text-[#F9F7F2] text-sm focus:border-black dark:focus:border-white focus:outline-hidden transition-all"
                      />
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

      {/* MODE 2: EXISTING BRAND REFRESH & UPGRADE */}
      {activeMode === 'existing_brand' && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif italic font-light tracking-tight text-[#1A1A1A] dark:text-[#F9F7F2]">
              Upgrade Existing Brand
            </h1>
            <p className="text-sm font-serif italic text-gray-600 dark:text-gray-600 dark:text-zinc-400 max-w-lg mx-auto">
              Preserve your existing brand name and identity equity while upgrading your vector marks, typography, social templates, and brand bible.
            </p>
          </div>

          {/* LOOKUP FROM SAVED BRANDS HISTORY (Account Library or Tab Cache) */}
          {savedBrands.length > 0 && (
            <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-600 dark:text-gray-600 dark:text-zinc-400" />
                  <span className="text-[10px] uppercase tracking-widest font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                    {user ? 'Select From Your Saved Cloud Library' : 'Select From Current Tab Session Cache'}
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-600 dark:text-zinc-400">
                  {user ? `${savedBrands.length} Cloud Saved` : `${savedBrands.length} In Tab Cache`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {savedBrands.map((b) => {
                  const isSelected = selectedBaseBrandId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectSavedBrandToUpgrade(b)}
                      className={`p-3 border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-[#1A1A1A] dark:border-[#F9F7F2] bg-gray-50 dark:bg-zinc-900/90 shadow-xs'
                          : 'border-gray-200 dark:border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A] hover:border-black dark:hover:border-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500 truncate">
                          {b.industry || 'Brand'}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-serif italic text-sm font-bold text-[#1A1A1A] dark:text-[#F9F7F2] truncate">
                          {b.brandName}
                        </h4>
                        {b.tagline && (
                          <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-serif italic truncate">
                            "{b.tagline}"
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 pt-1">
                        {b.palette?.slice(0, 4).map((c, i) => (
                          <div
                            key={i}
                            className="w-3.5 h-3.5 border border-black/10"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick test with sample brands if user has none yet */}
          {savedBrands.length === 0 && (
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-500 block text-center">
                Or test with sample existing brands:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {EXISTING_BRAND_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSelectExistingSample(sample)}
                    className="p-3 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A] hover:border-black dark:hover:border-white text-left transition-all cursor-pointer"
                  >
                    <span className="text-[8px] font-mono text-gray-500 dark:text-gray-500 uppercase tracking-widest block">
                      {sample.industry.split('&')[0]}
                    </span>
                    <h4 className="font-serif italic text-sm font-bold text-[#1A1A1A] dark:text-[#F9F7F2] truncate">
                      {sample.name}
                    </h4>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Real-time Match Banner if typed name matches a saved brand */}
          {matchingSavedBrand && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs">
                  Found <strong>"{matchingSavedBrand.brandName}"</strong> in your{' '}
                  {user ? 'saved cloud library' : 'current tab cache'}.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectSavedBrandToUpgrade(matchingSavedBrand)}
                className="px-2.5 py-1 text-[9px] uppercase tracking-widest font-black bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] hover:opacity-80 transition-opacity cursor-pointer shrink-0"
              >
                Auto-Fill Identity
              </button>
            </div>
          )}

          {/* Existing Brand Form */}
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8 space-y-5 shadow-sm">
            <form onSubmit={handleExistingBrandSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="existing-name-input" className="block text-[9px] uppercase tracking-widest font-black mb-1 text-[#1A1A1A] dark:text-[#F9F7F2]">
                    Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="existing-name-input"
                    required
                    type="text"
                    value={existingName}
                    onChange={(e) => setExistingName(e.target.value)}
                    placeholder="e.g. Veritas Coffee Co."
                    className="w-full border border-gray-300 dark:border-gray-300 dark:border-zinc-700 bg-transparent px-3.5 py-2 text-[#1A1A1A] dark:text-[#F9F7F2] text-sm focus:border-black dark:focus:border-white focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="existing-industry-input" className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-[#1A1A1A] dark:text-[#F9F7F2]">
                    Industry / Sector <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="existing-industry-input"
                    type="text"
                    value={existingIndustry}
                    onChange={(e) => setExistingIndustry(e.target.value)}
                    placeholder="e.g. Specialty Coffee & Hospitality"
                    className="w-full border border-gray-300 dark:border-gray-300 dark:border-zinc-700 bg-transparent px-3.5 py-2 text-[#1A1A1A] dark:text-[#F9F7F2] text-sm focus:border-black dark:focus:border-white focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="existing-tagline-input" className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Existing Tagline <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="existing-tagline-input"
                  type="text"
                  value={existingTagline}
                  onChange={(e) => setExistingTagline(e.target.value)}
                  placeholder="e.g. Truth in Every Roast"
                  className="w-full border border-gray-300 dark:border-gray-300 dark:border-zinc-700 bg-transparent px-3.5 py-2 text-[#1A1A1A] dark:text-[#F9F7F2] text-sm focus:border-black dark:focus:border-white focus:outline-hidden transition-all font-serif italic"
                />
              </div>

              <div>
                <label htmlFor="existing-mission-input" className="block text-[10px] uppercase tracking-widest font-black mb-1 text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Brand Mission &amp; Values <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="existing-mission-input"
                  required
                  rows={3}
                  value={existingMission}
                  onChange={(e) => setExistingMission(e.target.value)}
                  placeholder="Describe your current brand values and products..."
                  className="w-full border border-gray-300 dark:border-gray-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-[#1A1A1A] dark:text-[#F9F7F2] placeholder-gray-400 dark:placeholder-zinc-600 text-sm focus:border-black dark:focus:border-white focus:outline-hidden transition-all font-serif italic"
                />
              </div>

              {/* Colors */}
              <div>
                <span className="block text-[9px] uppercase tracking-widest font-bold mb-2 text-gray-600 dark:text-gray-600 dark:text-zinc-400">
                  Current Brand Colors (Optional):
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-7 h-7 rounded-none border border-gray-300 dark:border-gray-300 cursor-pointer"
                    />
                    <span className="text-[9px] font-mono uppercase">{primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-7 h-7 rounded-none border border-gray-300 dark:border-gray-300 cursor-pointer"
                    />
                    <span className="text-[9px] font-mono uppercase">{secondaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-7 h-7 rounded-none border border-gray-300 dark:border-gray-300 cursor-pointer"
                    />
                    <span className="text-[9px] font-mono uppercase">{accentColor}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !existingName.trim() || !existingMission.trim()}
                className="w-full py-4 px-6 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-xs uppercase tracking-[0.25em] font-black hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer shadow-md"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{loadingStep || 'Upgrading Brand Bible...'}</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Refresh &amp; Upgrade Brand</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODE 3: ICONIC BRAND CASE STUDIES & HISTORY */}
      {activeMode === 'research_brands' && (
        <PopularBrandResearchStudio
          onApplyBrandInspiration={handleApplyBrandInspiration}
        />
      )}
    </div>
  );
}
