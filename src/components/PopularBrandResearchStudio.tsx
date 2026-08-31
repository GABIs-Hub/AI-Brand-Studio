import React, { useState } from 'react';
import { PopularBrandCaseStudy } from '../types/brandCaseStudies';
import { CURATED_POPULAR_BRANDS } from '../data/curatedPopularBrands';
import {
  Search,
  Sparkles,
  History,
  BookOpen,
  ArrowRight,
  Lightbulb,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Globe,
  Palette,
  Type,
  Clock,
  Compass,
  Check,
  Loader2,
  ExternalLink,
  Flame,
} from 'lucide-react';

interface PopularBrandResearchStudioProps {
  onApplyBrandInspiration: (inspiration: {
    recommendedMission: string;
    recommendedAesthetic: string;
    recommendedTargetAudience: string;
    recommendedIndustry: string;
    brandNameSuggestion?: string;
  }) => void;
}


function ImageWithFallback({ src, alt, fallbackText }: { src: string; alt: string; fallbackText: string }) {
  const [error, setError] = React.useState(false);
  if (error || !src) {
    return <div className="font-serif italic text-2xl font-bold text-center">{fallbackText}</div>;
  }
  return <img src={src} alt={alt} className="max-w-full max-h-full object-contain" onError={() => setError(true)} />;
}

export function PopularBrandResearchStudio({
  onApplyBrandInspiration,
}: PopularBrandResearchStudioProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<PopularBrandCaseStudy>(
    CURATED_POPULAR_BRANDS[0]
  );
  const [isSearchingAi, setIsSearchingAi] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<PopularBrandCaseStudy[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [appliedToast, setAppliedToast] = useState<string | null>(null);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<
    'origin' | 'logos' | 'colors' | 'lessons'
  >('origin');

  const categories = [
    'All',
    'Tech & Software',
    'Athletics & Lifestyle',
    'Food & Beverage',
    'Automotive & Space',
    'Luxury & Fashion',
  ];

  // Filter curated + dynamic search results
  const allBrandsPool = [...aiSearchResults, ...CURATED_POPULAR_BRANDS];
  // Deduplicate by ID
  const uniqueBrands = Array.from(
    new Map(allBrandsPool.map((item) => [item.id.toLowerCase(), item])).values()
  );

  const filteredBrands = uniqueBrands.filter((b) => {
    const matchesCategory =
      selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      b.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDeepAiResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if query exists in curated list already
    const existing = uniqueBrands.find(
      (b) => b.brandName.toLowerCase() === searchQuery.trim().toLowerCase()
    );
    if (existing) {
      setSelectedBrand(existing);
      return;
    }

    setIsSearchingAi(true);
    setSearchError(null);

    try {
      const response = await fetch('/api/brand-case-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandQuery: searchQuery.trim() }),
      });

      let responseData: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        try {
          responseData = JSON.parse(text);
        } catch {
          throw new Error('Unexpected response format from server.');
        }
      }

      if (!response.ok) {
        throw new Error(responseData?.error || 'Failed to research brand.');
      }

      const caseStudy: PopularBrandCaseStudy = responseData;
      setAiSearchResults((prev) => [caseStudy, ...prev]);
      setSelectedBrand(caseStudy);
      setActiveAnalysisTab('origin');
    } catch (err: any) {
      console.error('Error fetching deep brand case study:', err);
      setSearchError(err.message || 'Could not compile intelligence for this brand.');
    } finally {
      setIsSearchingAi(false);
    }
  };

  const handleApplyLessons = (brand: PopularBrandCaseStudy) => {
    onApplyBrandInspiration({
      recommendedMission: brand.starterPromptInspiration.recommendedMission,
      recommendedAesthetic: brand.starterPromptInspiration.recommendedAesthetic,
      recommendedTargetAudience:
        brand.starterPromptInspiration.recommendedTargetAudience,
      recommendedIndustry: brand.starterPromptInspiration.recommendedIndustry,
      brandNameSuggestion: undefined,
    });
    setAppliedToast(`Loaded strategic lessons & prompt from ${brand.brandName}!`);
    setTimeout(() => setAppliedToast(null), 4000);
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="popular-brand-research-studio">
      {/* Strategic Header & Search Bar */}
      <div className="bg-white dark:bg-[#1C1C1A] border-2 border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-500 dark:text-zinc-400">
                Pre-Creation Intelligence &bull; Brand Origins &amp; Logo History
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif italic font-light tracking-tight text-[#1A1A1A] dark:text-[#F9F7F2]">
              Study How Iconic Brands Were Built
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-2xl font-serif italic">
              Search any iconic or historical brand (e.g. Nike, Apple, Patagonia, Spotify, Ferrari). Explore their garage origins, logo evolution over decades, color psychology, and extract actionable takeaways for your own brand.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 bg-amber-400/10 border border-amber-400/30 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Research Engine</span>
            </div>
          </div>
        </div>

        {/* Live Search Form */}
        <form onSubmit={handleDeepAiResearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or research any brand (e.g. Nike, Chanel, Red Bull, Sony, Gucci)..."
              className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] dark:bg-[#161614] border border-[#1A1A1A]/30 dark:border-[#F9F7F2]/20 text-xs sm:text-sm text-[#1A1A1A] dark:text-[#F9F7F2] placeholder-gray-400 focus:outline-hidden focus:border-black dark:focus:border-white transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingAi || !searchQuery.trim()}
            className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#2C3333] dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:hover:bg-white text-white font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {isSearchingAi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400 dark:text-amber-600" />
                <span>Researching...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                <span>Analyze Brand</span>
              </>
            )}
          </button>
        </form>

        {searchError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {searchError}
          </div>
        )}

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[9px] uppercase tracking-widest font-black">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 border transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#1A1A1A] text-white border-black dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:border-white'
                  : 'bg-transparent border-gray-200 dark:border-zinc-800 text-gray-500 hover:border-black dark:hover:border-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Selection Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {filteredBrands.map((b) => {
          const isSelected = selectedBrand?.id === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setSelectedBrand(b);
                setActiveAnalysisTab('origin');
              }}
              className={`p-3.5 border text-left transition-all cursor-pointer flex flex-col justify-between h-32 group relative overflow-hidden ${
                isSelected
                  ? 'border-2 border-black dark:border-white bg-[#FAF9F6] dark:bg-[#161614] shadow-md'
                  : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A] hover:border-gray-400'
              }`}
            >
              <div className="space-y-1">
                <span className="text-[8px] font-mono uppercase tracking-widest text-gray-400 dark:text-zinc-500 block">
                  Est. {b.foundingYear}
                </span>
                <h4 className="font-serif italic font-bold text-base text-[#1A1A1A] dark:text-[#F9F7F2] truncate group-hover:underline">
                  {b.brandName}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800 text-[8px] font-mono text-gray-500">
                <span className="truncate max-w-[80px]">{b.category.split(' ')[0]}</span>
                <div className="flex items-center gap-0.5">
                  {b.colorPaletteHeritage?.slice(0, 3).map((c) => (
                    <div
                      key={'swatch-' + b.id + '-' + c.hex}
                      className="w-2.5 h-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Deep Dossier View of Selected Brand */}
      {selectedBrand && (
        <div className="bg-white dark:bg-[#1C1C1A] border-2 border-[#1A1A1A] dark:border-[#F9F7F2]/20 shadow-md">
          {/* Dossier Header */}
          <div className="p-6 sm:p-8 bg-[#FAF9F6] dark:bg-[#161614] border-b-2 border-[#1A1A1A] dark:border-[#F9F7F2]/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] uppercase tracking-[0.3em] font-black px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black">
                  Case Study &bull; {selectedBrand.category}
                </span>
                <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-400">
                  Founded {selectedBrand.foundingYear} in {selectedBrand.headquarters}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif italic font-light tracking-tight text-[#1A1A1A] dark:text-[#F9F7F2]">
                {selectedBrand.brandName}
              </h1>

              <p className="text-base sm:text-lg font-serif italic text-gray-600 dark:text-zinc-400">
                &ldquo;{selectedBrand.tagline}&rdquo;
              </p>
              <div className="text-xs text-gray-500 font-mono">
                Founders: {selectedBrand.founders.join(', ')} &bull; {selectedBrand.industry}
              </div>
            </div>

            {/* Quick Inspiration Loader Action */}
            <div className="space-y-2 shrink-0">
              <button
                type="button"
                onClick={() => handleApplyLessons(selectedBrand)}
                className="w-full sm:w-auto px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                id="apply-brand-lessons-btn"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Adopt Blueprint For My Brand</span>
              </button>
              <span className="text-[9px] text-gray-400 block text-center font-mono">
                Pre-fills form with tested archetype strategy
              </span>
            </div>
          </div>

          {/* Feedback Toast */}
          {appliedToast && (
            <div className="p-3 bg-emerald-500 text-white font-bold text-xs flex items-center justify-between px-6 animate-fadeIn">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                {appliedToast}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest">
                Scroll down to customize prompt &rarr;
              </span>
            </div>
          )}

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#1C1C1A] overflow-x-auto text-[10px] uppercase tracking-widest font-black">
            <button
              type="button"
              onClick={() => setActiveAnalysisTab('origin')}
              className={`px-5 py-3.5 border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeAnalysisTab === 'origin'
                  ? 'border-black text-black dark:border-white dark:text-white bg-black/5 dark:bg-white/5'
                  : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>1. How They Started &amp; Breakthrough</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveAnalysisTab('logos')}
              className={`px-5 py-3.5 border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeAnalysisTab === 'logos'
                  ? 'border-black text-black dark:border-white dark:text-white bg-black/5 dark:bg-white/5'
                  : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Logo &amp; Visual Evolution</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveAnalysisTab('colors')}
              className={`px-5 py-3.5 border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeAnalysisTab === 'colors'
                  ? 'border-black text-black dark:border-white dark:text-white bg-black/5 dark:bg-white/5'
                  : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>3. Color &amp; Type System</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveAnalysisTab('lessons')}
              className={`px-5 py-3.5 border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeAnalysisTab === 'lessons'
                  ? 'border-black text-black dark:border-white dark:text-white bg-black/5 dark:bg-white/5'
                  : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>4. Strategic Lessons For You</span>
            </button>
          </div>

          {/* TAB 1: ORIGIN STORY & BREAKTHROUGH */}
          {activeAnalysisTab === 'origin' && (
            <div className="p-6 sm:p-8 space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-[#FAF9F6] dark:bg-[#161614] border border-gray-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[9px] uppercase tracking-widest font-black text-gray-400 dark:text-zinc-500 block">
                    Phase I &bull; The Humble Beginning
                  </span>
                  <h3 className="font-serif italic text-lg font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">
                    The Origin Reality
                  </h3>
                  <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
                    {selectedBrand.originStory}
                  </p>
                </div>

                <div className="p-5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
                  <span className="text-[9px] uppercase tracking-widest font-black text-rose-500 block">
                    Phase II &bull; The Early Struggle
                  </span>
                  <h3 className="font-serif italic text-lg font-bold text-rose-900 dark:text-rose-200">
                    The Near-Fatal Friction
                  </h3>
                  <p className="text-xs text-rose-800/90 dark:text-rose-300 leading-relaxed">
                    {selectedBrand.initialStruggle}
                  </p>
                </div>

                <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                  <span className="text-[9px] uppercase tracking-widest font-black text-emerald-600 block">
                    Phase III &bull; The Pivot
                  </span>
                  <h3 className="font-serif italic text-lg font-bold text-emerald-900 dark:text-emerald-200">
                    The Breakthrough Moment
                  </h3>
                  <p className="text-xs text-emerald-800/90 dark:text-emerald-300 leading-relaxed">
                    {selectedBrand.thePivotalBreakthrough}
                  </p>
                </div>
              </div>

              {/* Core Strategic Pillars */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 dark:text-zinc-500 block">
                  Foundational Brand Pillars
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedBrand.coreBrandPillars.map((pillar, idx) => (
                    <div
                      key={'pillar-' + idx}
                      className="p-4 border-l-4 border-black dark:border-white bg-[#FAF9F6] dark:bg-[#161614]"
                    >
                      <h4 className="font-serif italic font-bold text-sm text-[#1A1A1A] dark:text-[#F9F7F2] mb-1">
                        {pillar.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historical Timeline */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 dark:text-zinc-500 block">
                  Key Historical Milestones &amp; Takeaways
                </span>
                <div className="space-y-3">
                  {selectedBrand.keyMilestones.map((m, i) => (
                    <div
                      key={'milestone-' + i}
                      className="p-4 bg-[#FAF9F6] dark:bg-[#161614] border border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <span className="px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black font-mono font-black text-xs shrink-0">
                          {m.year}
                        </span>
                        <div>
                          <h5 className="font-bold text-sm text-[#1A1A1A] dark:text-[#F9F7F2]">
                            {m.headline}
                          </h5>
                          <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
                            {m.summary}
                          </p>
                        </div>
                      </div>
                      <div className="sm:max-w-xs p-2.5 bg-amber-400/10 border border-amber-400/30 text-[11px] text-amber-900 dark:text-amber-300 font-serif italic shrink-0">
                        <strong>Takeaway:</strong> {m.takeaway}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOGO EVOLUTION OVER ERAS */}
          {activeAnalysisTab === 'logos' && (
            <div className="p-6 sm:p-8 space-y-8 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-serif italic text-2xl text-[#1A1A1A] dark:text-[#F9F7F2]">
                  How the {selectedBrand.brandName} Logomark Evolved Across Eras
                </h3>
                <p className="text-xs text-gray-600 dark:text-zinc-400 font-serif italic">
                  Notice how nearly all legendary logos start complex, literal, or crowded, and gradually subtract unnecessary detail until only a pure geometric essence remains.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {selectedBrand.logoEvolution.map((logo, idx) => (
                  <div
                    key={'logo-era-' + idx}
                    className="border-2 border-gray-300 dark:border-zinc-700 bg-[#FAF9F6] dark:bg-[#161614] flex flex-col justify-between"
                  >
                    {/* Visual Graphic Representation */}
                    <div className="p-8 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-center min-h-[160px] text-[#1A1A1A] dark:text-[#F9F7F2]">
                      {logo.imageUrl ? (
                        <div className="w-32 h-20 flex items-center justify-center">
                          <ImageWithFallback src={logo.imageUrl} alt={`${selectedBrand.brandName} - ${logo.title}`} fallbackText={selectedBrand.brandName} />
                        </div>
                      ) : (
                        <div className="font-serif italic text-2xl font-bold">
                          {selectedBrand.brandName}
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono uppercase tracking-widest font-black px-2 py-0.5 bg-black/10 dark:bg-white/10 text-[#1A1A1A] dark:text-[#F9F7F2] inline-block">
                          {logo.era}
                        </span>
                        <h4 className="font-serif italic font-bold text-base text-[#1A1A1A] dark:text-[#F9F7F2]">
                          {logo.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                          {logo.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-200 dark:border-zinc-800">
                        <span className="text-[8px] uppercase tracking-widest font-black text-gray-400 block mb-1">
                          Key Changes Made
                        </span>
                        <ul className="space-y-1">
                          {logo.keyDesignChanges.map((change, cIdx) => (
                            <li
                              key={'change-' + cIdx}
                              className="text-[11px] text-gray-700 dark:text-zinc-300 flex items-center gap-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COLOR PALETTE & TYPOGRAPHY SYSTEM */}
          {activeAnalysisTab === 'colors' && (
            <div className="p-6 sm:p-8 space-y-8 animate-fadeIn">
              {/* Heritage Color Palette */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-[0.25em] font-black text-gray-400 block">
                    Heritage Palette &amp; Psychology
                  </span>
                  <h3 className="font-serif italic text-2xl text-[#1A1A1A] dark:text-[#F9F7F2]">
                    Color Distribution
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {selectedBrand.colorPaletteHeritage.map((color, cIdx) => (
                    <div
                      key={'color-' + cIdx}
                      className="border border-gray-200 dark:border-zinc-800 bg-[#FAF9F6] dark:bg-[#161614] overflow-hidden flex flex-col justify-between"
                    >
                      <div
                        className="h-24 p-3 flex items-start justify-between"
                        style={{ backgroundColor: color.hex }}
                      >
                        <span className="text-[8px] font-mono uppercase font-black px-1.5 py-0.5 bg-black/80 text-white rounded-xs">
                          {color.role}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-white/90 text-black font-bold">
                          {color.hex}
                        </span>
                      </div>

                      <div className="p-4 space-y-1">
                        <h4 className="font-bold text-sm text-[#1A1A1A] dark:text-[#F9F7F2]">
                          {color.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-zinc-400">
                          {color.psychology}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography Evolution */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-[0.25em] font-black text-gray-400 block">
                    Type Heritage
                  </span>
                  <h3 className="font-serif italic text-2xl text-[#1A1A1A] dark:text-[#F9F7F2]">
                    Typography System
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedBrand.typographyEvolution.map((typeSpec, tIdx) => (
                    <div
                      key={'type-' + tIdx}
                      className="p-5 bg-[#FAF9F6] dark:bg-[#161614] border border-gray-200 dark:border-zinc-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black">
                          {typeSpec.era}
                        </span>
                        <span className="text-[9px] font-mono text-gray-500">{typeSpec.style}</span>
                      </div>
                      <h4 className="text-2xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F9F7F2]">
                        {typeSpec.fontName}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed font-serif italic">
                        {typeSpec.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIONABLE STRATEGIC LESSONS */}
          {activeAnalysisTab === 'lessons' && (
            <div className="p-6 sm:p-8 space-y-8 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="font-serif italic text-2xl text-[#1A1A1A] dark:text-[#F9F7F2]">
                  What You Can Learn From {selectedBrand.brandName} To Build Your Brand
                </h3>
                <p className="text-xs text-gray-600 dark:text-zinc-400 font-serif italic">
                  Direct principles distilled from {selectedBrand.brandName}&apos;s founding journey and how to apply them immediately in your brand prompt.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedBrand.actionableLessons.map((lesson, lIdx) => (
                  <div
                    key={'lesson-' + lIdx}
                    className="p-6 bg-[#FAF9F6] dark:bg-[#161614] border-2 border-black dark:border-white space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                        <Award className="w-4 h-4" />
                        <span>Core Strategy #{lIdx + 1}</span>
                      </div>
                      <h4 className="font-serif italic font-bold text-lg text-[#1A1A1A] dark:text-[#F9F7F2]">
                        {lesson.lessonTitle}
                      </h4>
                      <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
                        {lesson.explanation}
                      </p>
                    </div>

                    <div className="p-4 bg-amber-400/15 dark:bg-amber-400/10 border-l-4 border-amber-400 text-xs text-amber-950 dark:text-amber-200">
                      <span className="font-bold block uppercase tracking-wider text-[9px] mb-1">
                        Actionable Step For Your Brand:
                      </span>
                      {lesson.actionableStepForYourBrand}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ready to generate prompt blueprint */}
              <div className="p-6 bg-black text-white dark:bg-white dark:text-black space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-[0.3em] font-mono text-amber-400 dark:text-amber-600 font-bold block">
                      Blueprint Recommendation
                    </span>
                    <h4 className="font-serif italic text-xl font-light">
                      Start Your Brand With This Proven {selectedBrand.brandName} Archetype
                    </h4>
                    <p className="text-xs opacity-80 max-w-xl font-serif italic">
                      &ldquo;{selectedBrand.starterPromptInspiration.recommendedMission}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyLessons(selectedBrand)}
                    className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-widest transition-all shrink-0 cursor-pointer shadow-lg"
                  >
                    Adopt Strategy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
