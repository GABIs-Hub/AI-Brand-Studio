import { useState, useEffect } from 'react';
import { BrandBible } from '../types';
import { SessionUser } from '../lib/authClient';
import { SimpleBrandView } from './SimpleBrandView';
import { BrandOverviewTab } from './BrandOverviewTab';
import { PaletteTab } from './PaletteTab';
import { TypographyTab } from './TypographyTab';
import { LogoTab } from './LogoTab';
import { ToneTab } from './ToneTab';
import { AssetUsageGuideTab } from './AssetUsageGuideTab';
import { BrandEvolutionTab } from './BrandEvolutionTab';
import { MockupsTab } from './MockupsTab';
import { SocialTemplatesTab } from './SocialTemplatesTab';
import { ViralTopicsTab } from './ViralTopicsTab';
import { BrandAuditTab } from './BrandAuditTab';
import { DesignSystemSandbox } from './DesignSystemSandbox';
import { FontLoader } from './FontLoader';
import {
  LayoutDashboard,
  Palette,
  Type,
  Shield,
  MessageSquare,
  ShieldCheck,
  GitBranch,
  Monitor,
  Share2,
  History,
  Trash2,
  FolderHeart,
  Flame,
  Award,
  Sparkles,
  SlidersHorizontal,
  Download,
  Layers,
  Cloud,
  Clock,
  Box,
  Info,
} from 'lucide-react';

interface BrandDashboardProps {
  brand: BrandBible;
  onGenerateLogoImage: (prompt: string, resolution: string) => Promise<string | void>;
  isGeneratingLogoImage: boolean;
  savedBrands: BrandBible[];
  onSelectBrand: (brand: BrandBible) => void;
  onDeleteBrand: (id: string) => void;
  onUpgradeBrand?: (brand: BrandBible) => void;
  user?: SessionUser | null;
  activeTabOverride?: TabType;
  viewModeOverride?: 'simple' | 'studio';
  onViewModeChange?: (mode: 'simple' | 'studio') => void;
}

export type TabType =
  | 'overview'
  | 'logos'
  | 'design_system'
  | 'social_content'
  | 'mockups_usage'
  | 'strategy_audit';

export function BrandDashboard({
  brand,
  onGenerateLogoImage,
  isGeneratingLogoImage,
  savedBrands,
  onSelectBrand,
  onDeleteBrand,
  onUpgradeBrand,
  user,
  activeTabOverride,
  viewModeOverride,
  onViewModeChange,
}: BrandDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>(activeTabOverride || 'overview');
  const [isProMode, setIsProMode] = useState(viewModeOverride ? viewModeOverride === 'studio' : false);
  const [selectedTopicHeadline, setSelectedTopicHeadline] = useState<string | undefined>(undefined);
  const [designSubTab, setDesignSubTab] = useState<'palette' | 'typography' | 'sandbox'>('palette');
  const [socialSubTab, setSocialSubTab] = useState<'templates' | 'topics'>('templates');
  const [mockupSubTab, setMockupSubTab] = useState<'mockups' | 'usage'>('mockups');
  const [strategySubTab, setStrategySubTab] = useState<'tone' | 'audit' | 'evolution' | 'history'>('tone');

  // Synchronize when activeTabOverride changes from tour
  useEffect(() => {
    if (activeTabOverride) {
      setActiveTab(activeTabOverride);
    }
  }, [activeTabOverride]);

  // Synchronize when viewModeOverride changes from tour
  useEffect(() => {
    if (viewModeOverride !== undefined) {
      setIsProMode(viewModeOverride === 'studio');
    }
  }, [viewModeOverride]);

  const handleSetMode = (mode: 'simple' | 'studio') => {
    setIsProMode(mode === 'studio');
    onViewModeChange?.(mode);
  };

  const mainTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Brand Kit & Summary' },
    { id: 'logos', label: 'Logo & Marks', icon: Shield, desc: 'Styles & Vector Exports' },
    { id: 'design_system', label: 'Colors & Fonts', icon: Palette, desc: 'Palette & Typography' },
    { id: 'social_content', label: 'Social & Content', icon: Share2, desc: 'Templates & Viral Hooks' },
    { id: 'mockups_usage', label: 'Mockups & Guide', icon: Monitor, desc: 'Merchandise & Dos/Don’ts' },
    { id: 'strategy_audit', label: 'Voice & Strategy', icon: Award, desc: 'Tone, Audit & History' },
  ] as const;

  // Developer-oriented guide for each studio tab
  const tabGuides: Record<TabType, { title: string; guide: string }> = {
    overview: {
      title: 'Brand Overview',
      guide: 'The complete identity at a glance — mission, positioning, personality, and values. Use this as the single source of truth for the brand.',
    },
    logos: {
      title: 'Logo & Marks',
      guide: 'Work with the primary SVG logo and secondary marks: preview on any background, copy vector code, download files, or render a high-resolution AI version. The Logo Studio offers six archetypes with chain-of-thought prompt refinement, and the favicon generator ships .ico/.png/manifest bundles.',
    },
    design_system: {
      title: 'Colors & Fonts',
      guide: 'The design foundation: a WCAG-validated 5-color palette with an accessibility matrix, a Google Fonts pairing with live specimens, and a sandbox to preview real components in both light and dark mode.',
    },
    social_content: {
      title: 'Social & Content',
      guide: 'Generate platform-ready social templates (IG, LinkedIn, TikTok, WhatsApp), viral topic hooks, and AI-assisted visuals. Pick your AI provider per generation — auto, OpenAI, Gemini, or Higgsfield.',
    },
    mockups_usage: {
      title: 'Mockups & Usage',
      guide: 'See the logo applied to 3D merchandise mockups (t-shirts, mugs, signage) and review the asset-usage guide for consistent, on-brand application everywhere.',
    },
    strategy_audit: {
      title: 'Voice & Strategy',
      guide: 'Tone-of-voice rules, a brand-health audit scorecard, evolution history, and upgrade checkpoints — track how the identity grows across versions.',
    },
  };

  const handleUpdatePrimaryLogo = (svg: string, concept: string, symbolism: string, geometry: string) => {
    const updatedBrand: BrandBible = {
      ...brand,
      logo: {
        ...brand.logo,
        primaryLogoSvg: svg,
        concept,
        symbolism,
        geometryDetails: geometry,
      },
      updatedAt: new Date().toISOString(),
    };
    onSelectBrand(updatedBrand);
  };

  const handleSendToSocial = (topicHeadline: string) => {
    setSelectedTopicHeadline(topicHeadline);
    setActiveTab('social_content');
    setSocialSubTab('templates');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Inject Google Font Link Dynamically */}
      {/* Guard against partial/imported brands that lack a typography block. */}
      <FontLoader url={brand.typography?.googleFontsUrl} />

      {/* Top Header & Experience Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] font-black bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] px-2 py-0.5">
              {brand.industry || 'Brand Identity'}
            </span>
            <span className="text-xs font-serif italic text-gray-500 dark:text-zinc-400">
              "{brand.tagline}"
            </span>
          </div>
        </div>

        {/* Right Controls: Upgrade Brand + View Mode Pill */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {onUpgradeBrand && (
            <button
              type="button"
              onClick={() => onUpgradeBrand(brand)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[9px] uppercase tracking-widest font-black hover:opacity-85 transition-opacity cursor-pointer shadow-xs"
              title="Upgrade and modernize this brand identity"
            >
              <Layers className="w-3 h-3" />
              <span>Upgrade Brand</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-500 hidden sm:inline">
              View:
            </span>
            <div className="inline-flex p-0.5 bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => handleSetMode('simple')}
                className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer ${
                  !isProMode
                    ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                    : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() => handleSetMode('studio')}
                className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center gap-1 ${
                  isProMode
                    ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                    : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-2.5 h-2.5" />
                <span>Studio</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Mode Split: Simple View vs Studio Workstation */}
      {!isProMode ? (
        <SimpleBrandView
          brand={brand}
          onSwitchToStudio={() => handleSetMode('studio')}
          onUpgradeBrand={onUpgradeBrand}
        />
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main 6-Tab Navigation Bar */}
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-1.5 flex items-center overflow-x-auto scrollbar-none transition-colors duration-300">
            <div className="flex items-center gap-1 w-full">
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:border-[#F9F7F2] shadow-sm'
                        : 'text-[#1A1A1A] dark:text-[#F9F7F2] border-transparent hover:border-dashed hover:border-[#1A1A1A] dark:hover:border-[#F9F7F2]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active-tab explainer strip (Studio guidance for technical users) */}
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 px-4 py-3 flex items-start gap-3 transition-colors duration-300">
            <Info className="w-4 h-4 text-[#1A1A1A] dark:text-[#F9F7F2] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-[10px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                {tabGuides[activeTab].title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                {tabGuides[activeTab].guide}
              </p>
            </div>
          </div>

      {/* Tab Content Area */}
      <div className="min-h-[500px]">
        {/* 1. Overview Tab */}
        {activeTab === 'overview' && <BrandOverviewTab brand={brand} />}

        {/* 2. Logo & Marks Tab */}
        {activeTab === 'logos' && (
          <LogoTab
            brand={brand}
            logo={brand.logo}
            secondaryMarks={brand.secondaryMarks}
            brandName={brand.brandName}
            onGenerateLogoImage={onGenerateLogoImage}
            onUpdatePrimaryLogo={handleUpdatePrimaryLogo}
            generatedImageUrl={brand.generatedLogoImageUrl}
            generatedImageResolution={brand.generatedLogoResolution}
            isGeneratingImage={isGeneratingLogoImage}
            isProMode={isProMode}
          />
        )}

        {/* 3. Colors & Typography (Combined Design Foundation) */}
        {activeTab === 'design_system' && (
          <div className="space-y-6">
            {/* Sub-nav for Colors vs Fonts */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-xs uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Design Foundation
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 font-serif italic">
                  Curated 5-color palette and Google Font typographic pairings.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-1">
                <button
                  type="button"
                  onClick={() => setDesignSubTab('palette')}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    designSubTab === 'palette'
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Palette className="w-3 h-3" />
                  <span>Color &amp; WCAG</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDesignSubTab('typography')}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    designSubTab === 'typography'
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Type className="w-3 h-3" />
                  <span>Typography</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDesignSubTab('sandbox')}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    designSubTab === 'sandbox'
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Box className="w-3 h-3" />
                  <span>UI Sandbox</span>
                </button>
              </div>
            </div>

            {designSubTab === 'palette' && <PaletteTab palette={brand.palette} />}
            {designSubTab === 'typography' && (
              <TypographyTab typography={brand.typography} brandName={brand.brandName} />
            )}
            {designSubTab === 'sandbox' && <DesignSystemSandbox brand={brand} />}
          </div>
        )}

        {/* 4. Social Posts & Marketing Content */}
        {activeTab === 'social_content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-xs uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Social Media &amp; Content Engine
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 font-serif italic">
                  Ready-to-post Instagram/LinkedIn templates and high-engagement topic ideas.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-1">
                <button
                  type="button"
                  onClick={() => setSocialSubTab('templates')}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    socialSubTab === 'templates'
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Share2 className="w-3 h-3" />
                  <span>Post Templates</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSocialSubTab('topics')}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    socialSubTab === 'topics'
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  <span>Content Ideas</span>
                </button>
              </div>
            </div>

            {socialSubTab === 'templates' ? (
              <SocialTemplatesTab
                brand={brand}
                initialTopicHeadline={selectedTopicHeadline}
              />
            ) : (
              <ViralTopicsTab
                brand={brand}
                onSendToSocialTemplate={handleSendToSocial}
              />
            )}
          </div>
        )}

        {/* 5. Mockups & Brand Usage Guidelines */}
        {activeTab === 'mockups_usage' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-xs uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Brand Applications &amp; Guidelines
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 font-serif italic">
                  Real-world merchandise mockups and essential visual dos &amp; don'ts.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-1">
                <button
                  type="button"
                  onClick={() => setMockupSubTab('mockups')}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    mockupSubTab === 'mockups'
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Live Mockups</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMockupSubTab('usage')}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    mockupSubTab === 'usage'
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Dos &amp; Don'ts</span>
                </button>
              </div>
            </div>

            {mockupSubTab === 'mockups' ? (
              <MockupsTab brand={brand} />
            ) : (
              <AssetUsageGuideTab brand={brand} />
            )}
          </div>
        )}

        {/* 6. Brand Voice, Strategy & Health Audit */}
        {activeTab === 'strategy_audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-xs uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Brand Voice &amp; Health
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 font-serif italic">
                  Tone guidelines, messaging pillars, brand health audit, and saved history.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-1">
                <button
                  type="button"
                  onClick={() => setStrategySubTab('tone')}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    strategySubTab === 'tone'
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Tone &amp; Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStrategySubTab('audit')}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    strategySubTab === 'audit'
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Award className="w-3 h-3" />
                  <span>Brand Health</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStrategySubTab('evolution')}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    strategySubTab === 'evolution'
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <GitBranch className="w-3 h-3" />
                  <span>Evolution</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStrategySubTab('history')}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    strategySubTab === 'history'
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <History className="w-3 h-3" />
                  <span>Saved Brands</span>
                </button>
              </div>
            </div>

            {strategySubTab === 'tone' && (
              <ToneTab toneOfVoice={brand.toneOfVoice} imageryStyle={brand.imageryStyle} />
            )}

            {strategySubTab === 'audit' && (
              <BrandAuditTab
                brand={brand}
                onNavigateToTab={(tabId) => {
                  if (tabId === 'palette' || tabId === 'typography') {
                    setActiveTab('design_system');
                    setDesignSubTab(tabId);
                  } else if (tabId === 'logos') {
                    setActiveTab('logos');
                  } else if (tabId === 'social') {
                    setActiveTab('social_content');
                  } else if (tabId === 'tone') {
                    setActiveTab('strategy_audit');
                    setStrategySubTab('tone');
                  } else {
                    setActiveTab('overview');
                  }
                }}
              />
            )}

            {strategySubTab === 'evolution' && (
              <BrandEvolutionTab
                brand={brand}
                onRestoreVersion={(restored) => onSelectBrand(restored)}
              />
            )}

            {strategySubTab === 'history' && (
              <div className="space-y-6" id="history-view-container">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2]">
                      {user ? 'Saved Brand Library' : 'Session Brand Cache'}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                      {user
                        ? 'Permanently synced to your Google Account Cloud Storage.'
                        : 'Temporary session cache. Log in to permanently preserve and sync your brands across devices.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {user ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] uppercase tracking-widest font-black bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <Cloud className="w-3 h-3 text-emerald-600" />
                        <span>Cloud Synced</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] uppercase tracking-widest font-black bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Tab Session Cache</span>
                      </span>
                    )}
                  </div>
                </div>

                {savedBrands.length === 0 ? (
                  <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-12 text-center" id="empty-history">
                    <FolderHeart className="w-12 h-12 text-gray-300 dark:text-zinc-600 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-900 dark:text-[#F9F7F2]">Your Brand History is Empty</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Generate a new brand to populate this list.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="history-grid">
                    {savedBrands.map((saved) => {
                      const isCurrent = saved.id === brand.id;
                      return (
                        <div
                          key={saved.id}
                          className={`group bg-white dark:bg-[#1C1C1A] border p-6 flex flex-col justify-between transition-all duration-300 ${
                            isCurrent
                              ? 'border-[#1A1A1A] dark:border-[#F9F7F2] shadow-[0_10px_20px_rgba(0,0,0,0.06)] scale-[1.01]'
                              : 'border-gray-200 dark:border-gray-200 dark:border-zinc-800 hover:border-[#1A1A1A] dark:hover:border-[#F9F7F2] hover:shadow-md'
                          }`}
                          id={`brand-card-${saved.id}`}
                        >
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[9px] uppercase tracking-widest font-black bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-300 px-2 py-0.5 rounded-none border border-gray-300 dark:border-gray-300 dark:border-zinc-700">
                                  {saved.industry}
                                </span>
                              </div>
                              {isCurrent && (
                                <span className="text-[8px] uppercase tracking-widest font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 px-2 py-0.5">
                                  Current
                                </span>
                              )}
                            </div>

                            <div>
                              <h3 className="font-serif italic text-2xl text-[#1A1A1A] dark:text-[#F9F7F2]">
                                {saved.brandName}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-zinc-400 font-serif italic mt-1 line-clamp-1">
                                "{saved.tagline}"
                              </p>
                            </div>

                            {/* Color Swatch Preview */}
                            <div className="flex items-center gap-1.5 pt-2">
                              {saved.palette.slice(0, 5).map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-5 h-5 rounded-none border border-black/10 shadow-xs"
                                  style={{ backgroundColor: color.hex }}
                                  title={`${color.role}: ${color.hex}`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="pt-6 mt-6 border-t border-dashed border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onSelectBrand(saved)}
                                className="text-[9px] uppercase tracking-widest font-black text-[#1A1A1A] dark:text-[#F9F7F2] hover:opacity-70 transition-opacity cursor-pointer"
                              >
                                View &rarr;
                              </button>
                              {onUpgradeBrand && (
                                <button
                                  type="button"
                                  onClick={() => onUpgradeBrand(saved)}
                                  className="text-[9px] uppercase tracking-widest font-black text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <Layers className="w-2.5 h-2.5" />
                                  <span>Upgrade</span>
                                </button>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => onDeleteBrand(saved.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete from history"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )}
</div>
);
}
