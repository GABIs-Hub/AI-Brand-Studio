import React, { useState, useEffect } from 'react';
import { BrandBible } from '../types';
import { TabType } from './BrandDashboard';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Compass,
  Shield,
  Palette,
  Share2,
  Award,
  MessageSquarePlus,
  Box,
  Layers,
  ChevronDown,
  Check,
  Minimize2,
  Maximize2,
  MousePointerClick,
  SlidersHorizontal,
  Play,
  FileText,
  LayoutDashboard,
  Type,
  Monitor,
} from 'lucide-react';

export type TourTrack = 'all' | 'simple' | 'studio';

export interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  category: string;
  viewMode: 'simple' | 'studio';
  tabTarget?: TabType;
  description: string;
  interactiveTask: {
    instruction: string;
    actionLabel?: string;
    actionType?: 'set_simple' | 'set_studio' | 'navigate_tab' | 'open_chat' | 'open_export';
    targetTab?: TabType;
  };
  features: string[];
  icon: React.ElementType;
}

export const ALL_TOUR_STEPS: TourStep[] = [
  // --- PHASE 1: SIMPLE VIEW (Executive 1-Page Presentation) ---
  {
    id: 'simple_summary',
    stepNumber: 1,
    title: 'Executive Brand Dossier',
    category: 'Simple View Experience',
    viewMode: 'simple',
    description:
      'Simple View is the clean, executive-ready presentation mode. It presents the brand tagline, strategic positioning statement, and industry context in a distraction-free, one-page summary.',
    interactiveTask: {
      instruction:
        'Notice the top executive banner on your screen. Click the "Share" button in the upper right to copy the entire formatted brand dossier to your clipboard.',
      actionLabel: 'Ensure Simple View is Active',
      actionType: 'set_simple',
    },
    features: [
      'High-impact executive presentation banner',
      'One-click Web Share & formatted clipboard dossier',
      'Zero cognitive clutter for client and executive presentations',
    ],
    icon: FileText,
  },
  {
    id: 'simple_logo',
    stepNumber: 2,
    title: 'Vector Logomark & Stage Sandbox',
    category: 'Simple View Experience',
    viewMode: 'simple',
    description:
      'The Simple View puts the primary vector mark front and center with instant contrast testing and export capabilities for non-technical stakeholders.',
    interactiveTask: {
      instruction:
        'Try clicking the "Light", "Dark", and "Brand" background pill buttons above the logo to preview contrast. Then click "Download SVG" to grab the clean vector file.',
      actionLabel: 'Test Background Selector',
      actionType: 'set_simple',
    },
    features: [
      'Instant Light / Dark / Brand background contrast validation',
      'One-click clean SVG vector file download',
      'Direct SVG markup clipboard copy for web developers',
    ],
    icon: Shield,
  },
  {
    id: 'simple_palette',
    stepNumber: 3,
    title: '5-Color Swatch Kit & Fast Copy',
    category: 'Simple View Experience',
    viewMode: 'simple',
    description:
      'A concise 5-color swatch kit showing Primary, Secondary, Accent, Dark Neutral, and Light Neutral roles with direct click-to-copy functionality.',
    interactiveTask: {
      instruction:
        'Click on any colored swatch box on the screen below to instantly copy its exact HEX code to your clipboard with visual feedback.',
      actionLabel: 'View Swatch Kit',
      actionType: 'set_simple',
    },
    features: [
      '5 essential brand role color swatches (Primary to Light Neutral)',
      'One-tap HEX code copying with instant toast feedback',
      'Luminance & role labels for immediate team alignment',
    ],
    icon: Palette,
  },
  {
    id: 'simple_typography',
    stepNumber: 4,
    title: 'Interactive Font Pairing Tester',
    category: 'Simple View Experience',
    viewMode: 'simple',
    description:
      'Preview the curated Google Fonts pairing with an interactive type specimen input where you can type your own custom marketing slogans.',
    interactiveTask: {
      instruction:
        'Scroll down to the "Typography Pairing & Live Specimen" section and type custom text inside the input box to see both Display and Body fonts render live.',
      actionLabel: 'Inspect Typography Specimen',
      actionType: 'set_simple',
    },
    features: [
      'Dynamic Google Font injection with curated pairing rules',
      'Live interactive text input field for custom specimen preview',
      'Direct link to font documentation and designer credits',
    ],
    icon: Type,
  },

  // --- PHASE 2: STUDIO SUITE (6-Module Deep Agency Workstation) ---
  {
    id: 'studio_strategy',
    stepNumber: 5,
    title: 'Strategic Pillars & Modernization',
    category: 'Studio Suite Workstation',
    viewMode: 'studio',
    tabTarget: 'overview',
    description:
      'Studio Suite unlocks the full 6-module agency engineering suite. The Overview tab features deep market positioning, target audience personas, and the "Upgrade Brand" rebrand engine.',
    interactiveTask: {
      instruction:
        'Explore the full Strategic Dossier tab. Click "Upgrade Brand" at the top right to see how the system can evolve an existing brand into a modernized identity.',
      actionLabel: 'Open Studio Overview Tab',
      actionType: 'navigate_tab',
      targetTab: 'overview',
    },
    features: [
      'Comprehensive positioning statements & target audience personas',
      '6-tab modular workstation navigation for agency deep-dives',
      'Integrated "Upgrade Brand" workflow to rebrand existing identities',
    ],
    icon: Compass,
  },
  {
    id: 'studio_3d_logos',
    stepNumber: 6,
    title: '6 Archetypes & 3D Raytraced Studio',
    category: 'Studio Suite Workstation',
    viewMode: 'studio',
    tabTarget: 'logos',
    description:
      'Generate 6 mathematically balanced vector archetypes (Negative Space, Monogram, Kinetic, Bauhaus, Seal, Wordmark) or synthesize raytraced 3D renders with specular shaders.',
    interactiveTask: {
      instruction:
        'Click the "3D Studio" sub-tab on your screen to test raytraced shaders (Gold Foil, Titanium, Neon Noir) and click "Download Ultra-HD PNG" to get 2K/4K renders.',
      actionLabel: 'Go to 3D Raytracing Studio',
      actionType: 'navigate_tab',
      targetTab: 'logos',
    },
    features: [
      '6 distinct geometric logo archetype variations',
      'Photorealistic 3D raytraced studio with real-time material shaders',
      'Ultra-HD 1K, 2K, and 4K PNG rasterization & scalable SVG exports',
    ],
    icon: Box,
  },
  {
    id: 'studio_design_system',
    stepNumber: 7,
    title: '60-30-10 Color Math & WCAG Matrix',
    category: 'Studio Suite Workstation',
    viewMode: 'studio',
    tabTarget: 'design_system',
    description:
      'Inspect the mathematical 60-30-10 dominant color distribution system with automated WCAG AA/AAA legibility scores and complete typographic tracking formulas.',
    interactiveTask: {
      instruction:
        'Review the WCAG contrast ratings on screen, then click the "Typography" sub-tab above to inspect the full font ladder and spacing scales.',
      actionLabel: 'Open Color & Type Matrix',
      actionType: 'navigate_tab',
      targetTab: 'design_system',
    },
    features: [
      '60-30-10 visual hierarchy balance formulas',
      'Automated WCAG AA & AAA contrast matrix validation',
      'Proportional typographic scales with precise letter-spacing formulas',
    ],
    icon: Palette,
  },
  {
    id: 'studio_social_content',
    stepNumber: 8,
    title: 'Multi-Platform Social & Viral TikTok',
    category: 'Studio Suite Workstation',
    viewMode: 'studio',
    tabTarget: 'social_content',
    description:
      'Generate platform-native content formatted specifically for Instagram Carousels, LinkedIn Thought Leadership, TikTok 3-Scene Video Storyboards, and WhatsApp Broadcasts.',
    interactiveTask: {
      instruction:
        'Click through the platform tabs (Instagram, LinkedIn, TikTok, WhatsApp) to inspect custom copy, or switch to "Viral Topics" for contrarian hooks.',
      actionLabel: 'View Social Campaigns',
      actionType: 'navigate_tab',
      targetTab: 'social_content',
    },
    features: [
      'Native copy formatting tailored for 4 major social networks',
      'TikTok 3-scene storyboard scripts with visual direction',
      'Contrarian viral angles generator with targeted hashtag clusters',
    ],
    icon: Share2,
  },
  {
    id: 'studio_mockups_guide',
    stepNumber: 9,
    title: 'Live Mockups & Asset Brand Guidelines',
    category: 'Studio Suite Workstation',
    viewMode: 'studio',
    tabTarget: 'mockups_usage',
    description:
      'Visualize your brand across realistic responsive mockups (SaaS Desktop App, Mobile UI, Luxury Business Cards, Heavyweight Tote, Glass Coffee Tumbler, Billboards) and enforce brand protection rules with interactive Dos & Don’ts.',
    interactiveTask: {
      instruction:
        'Explore the responsive merchandise and interface mockups on screen. Then click the "Dos & Don\'ts" sub-tab above to inspect clear-space requirements and forbidden logo distortions.',
      actionLabel: 'Open Mockups & Guidelines',
      actionType: 'navigate_tab',
      targetTab: 'mockups_usage',
    },
    features: [
      '6 high-fidelity contextual mockups: App interfaces, luxury stationery & physical merchandise',
      'Interactive Dos and Don\'ts rules with visual contrast & clear-space enforcement',
      'Real-time brand color & vector mark rendering across physical and digital substrates',
    ],
    icon: Monitor,
  },
  {
    id: 'studio_strategy_audit',
    stepNumber: 10,
    title: 'Brand Equity Audit & Milestones',
    category: 'Studio Suite Workstation',
    viewMode: 'studio',
    tabTarget: 'strategy_audit',
    description:
      'Evaluate overall brand maturity (0–100 scale) with the Brand Equity Auditor, review editorial Tone of Voice guidelines, and track non-destructive milestone checkpoints.',
    interactiveTask: {
      instruction:
        'Inspect the Brand Maturity score on screen. Then click the "Tone of Voice" sub-tab to review editorial writing rules and communication styles.',
      actionLabel: 'Inspect Equity Audit',
      actionType: 'navigate_tab',
      targetTab: 'strategy_audit',
    },
    features: [
      'Objective 0–100 brand maturity rating across 5 key dimensions',
      'Strategic SWOT gap analysis & prioritized recommendations',
      'Immutable milestone checkpoint history tracking',
    ],
    icon: Award,
  },
  {
    id: 'studio_ai_export',
    stepNumber: 11,
    title: 'AI Creative Director & Production Tokens',
    category: 'Studio Suite Workstation',
    viewMode: 'studio',
    tabTarget: 'overview',
    description:
      'Consult with your context-aware AI Brand Strategist anytime, and export complete production packages including JSON specifications and CSS custom property variables.',
    interactiveTask: {
      instruction:
        'Click "AI Director" in the top navigation header to ask for live strategic advice, or click "Export" to download complete CSS variables and JSON tokens.',
      actionLabel: 'Launch AI Director Assistant',
      actionType: 'open_chat',
    },
    features: [
      'Context-aware AI Creative Director tailored to your active brand',
      'Production-ready CSS variable design tokens & JSON brand bibles',
      'Instant shareable links and multi-format exports',
    ],
    icon: MessageSquarePlus,
  },
];

interface ProjectTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: TabType) => void;
  onSetViewMode?: (mode: 'simple' | 'studio') => void;
  onOpenChat?: () => void;
  onOpenExport?: () => void;
  savedBrands: BrandBible[];
  activeBrand: BrandBible | null;
  onSelectBrand: (brand: BrandBible) => void;
}

export function ProjectTour({
  isOpen,
  onClose,
  onNavigateTab,
  onSetViewMode,
  onOpenChat,
  onOpenExport,
  savedBrands,
  activeBrand,
  onSelectBrand,
}: ProjectTourProps) {
  const [selectedTrack, setSelectedTrack] = useState<TourTrack>('all');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isBrandPickerOpen, setIsBrandPickerOpen] = useState(false);

  // Filter steps based on selected track
  const activeSteps = React.useMemo(() => {
    if (selectedTrack === 'simple') {
      return ALL_TOUR_STEPS.filter((s) => s.viewMode === 'simple');
    }
    if (selectedTrack === 'studio') {
      return ALL_TOUR_STEPS.filter((s) => s.viewMode === 'studio');
    }
    return ALL_TOUR_STEPS;
  }, [selectedTrack]);

  // Reset or constrain index when track changes
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [selectedTrack]);

  // Synchronize active step with UI view mode & tab
  useEffect(() => {
    if (isOpen && activeSteps.length > 0) {
      const step = activeSteps[currentStepIndex] || activeSteps[0];
      if (step) {
        if (onSetViewMode) {
          onSetViewMode(step.viewMode);
        }
        if (step.viewMode === 'studio' && step.tabTarget && onNavigateTab) {
          onNavigateTab(step.tabTarget);
        }
      }
    }
  }, [isOpen, currentStepIndex, activeSteps, onSetViewMode, onNavigateTab]);

  if (!isOpen || activeSteps.length === 0) return null;

  const currentStep = activeSteps[currentStepIndex] || activeSteps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeSteps.length - 1;
  const StepIcon = currentStep.icon;

  const goToStep = (index: number) => {
    if (index >= 0 && index < activeSteps.length) {
      setCurrentStepIndex(index);
      const nextStep = activeSteps[index];
      if (nextStep) {
        if (onSetViewMode) {
          onSetViewMode(nextStep.viewMode);
        }
        if (nextStep.viewMode === 'studio' && nextStep.tabTarget && onNavigateTab) {
          onNavigateTab(nextStep.tabTarget);
        }
      }
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      goToStep(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      goToStep(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('gabi_tour_seen', 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  const handlePerformInteractiveAction = () => {
    const task = currentStep.interactiveTask;
    if (task.actionType === 'set_simple' && onSetViewMode) {
      onSetViewMode('simple');
    } else if (task.actionType === 'set_studio' && onSetViewMode) {
      onSetViewMode('studio');
    } else if (task.actionType === 'navigate_tab' && onNavigateTab) {
      if (onSetViewMode) onSetViewMode('studio');
      if (task.targetTab) onNavigateTab(task.targetTab);
    } else if (task.actionType === 'open_chat' && onOpenChat) {
      onOpenChat();
    } else if (task.actionType === 'open_export' && onOpenExport) {
      onOpenExport();
    } else {
      // default sync
      if (onSetViewMode) onSetViewMode(currentStep.viewMode);
      if (currentStep.tabTarget && onNavigateTab) onNavigateTab(currentStep.tabTarget);
    }
  };

  // Minimized Floating Pill Mode
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
        id="tour-companion-minimized"
      >
        <div className="bg-[#1A1A1A] text-white dark:bg-[#FAF9F6] dark:text-[#1A1A1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/30 shadow-2xl p-2.5 px-4 flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMinimized(false)}>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest font-black flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-amber-400" />
                Tour Guide &bull; Step {currentStepIndex + 1}/{activeSteps.length}
              </span>
              <span className="text-xs font-bold truncate max-w-[170px]">
                {currentStep.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-white/20 dark:border-black/20">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="p-1.5 hover:bg-white/10 dark:hover:bg-black/10 transition-colors cursor-pointer"
              title="Expand Guided Tour"
              aria-label="Expand Guided Tour"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 dark:hover:bg-black/10 transition-colors cursor-pointer text-gray-400 hover:text-white dark:hover:text-black"
              title="Close Tour"
              aria-label="Close Tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-[440px] pointer-events-auto animate-in fade-in slide-in-from-bottom-5 duration-300 select-none shadow-2xl"
      id="tour-interactive-companion"
    >
      <div className="bg-[#FAF9F6] dark:bg-[#161614] border-2 border-[#1A1A1A] dark:border-[#F9F7F2]/40 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-[#1A1A1A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-amber-400 text-black">
              <Compass className="w-3.5 h-3.5" />
            </span>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] font-black text-amber-400">
                Interactive Tour Guide
              </span>
              <span className="text-[11px] font-mono text-gray-300">
                Step {currentStepIndex + 1} of {activeSteps.length} &bull; {currentStep.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Minimize Tour Widget"
              aria-label="Minimize Tour"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Tour"
              aria-label="Close Tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* View Mode Tour Track Switcher: All | Simple View | Studio Suite */}
        <div className="px-3 py-2 bg-[#222220] text-white border-b border-white/10 flex items-center justify-between gap-2">
          <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400 shrink-0">
            Tour Focus:
          </span>
          <div className="inline-flex p-0.5 bg-black/40 border border-white/20">
            <button
              type="button"
              onClick={() => setSelectedTrack('all')}
              className={`px-2 py-0.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer ${
                selectedTrack === 'all'
                  ? 'bg-amber-400 text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Tour the complete experience from Simple View to Studio Suite"
            >
              Complete Tour
            </button>
            <button
              type="button"
              onClick={() => setSelectedTrack('simple')}
              className={`px-2 py-0.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer ${
                selectedTrack === 'simple'
                  ? 'bg-amber-400 text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Tour the 1-Page Simple Executive View"
            >
              Simple View
            </button>
            <button
              type="button"
              onClick={() => setSelectedTrack('studio')}
              className={`px-2 py-0.5 text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer ${
                selectedTrack === 'studio'
                  ? 'bg-amber-400 text-black font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Tour the 6-Module Studio Suite"
            >
              Studio Suite
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-zinc-800 h-1">
          <div
            className="bg-amber-400 h-1 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / activeSteps.length) * 100}%` }}
          />
        </div>

        {/* Showcase Brand Selector Bar */}
        <div className="px-4 py-2 bg-gray-100 dark:bg-zinc-900/90 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-500 shrink-0">
              Active Brand:
            </span>
            <span className="font-bold text-[#1A1A1A] dark:text-[#F9F7F2] truncate">
              {activeBrand?.brandName || 'Showcase Brand'}
            </span>
            <span className="text-[9px] text-gray-500 dark:text-gray-500 font-serif italic truncate hidden sm:inline">
              ({activeBrand?.industry || 'Brand Bible'})
            </span>
          </div>

          {savedBrands.length > 1 && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsBrandPickerOpen(!isBrandPickerOpen)}
                className="px-2 py-1 text-[9px] uppercase tracking-wider font-black bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[#1A1A1A] dark:text-[#F9F7F2] hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex items-center gap-1"
                title="Switch Showcase Brand"
              >
                <span>Switch Brand</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isBrandPickerOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 shadow-xl z-50 p-1 space-y-1">
                  <span className="text-[8px] uppercase tracking-widest font-black text-gray-400 px-2 py-1 block">
                    Select Brand to Tour:
                  </span>
                  {savedBrands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        onSelectBrand(b);
                        setIsBrandPickerOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        activeBrand?.id === b.id
                          ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] font-bold'
                          : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-200'
                      }`}
                    >
                      <span className="truncate">{b.brandName}</span>
                      {activeBrand?.id === b.id && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tour Step Content Area */}
        <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
          {/* Step Header with Active View Mode Badge */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-none bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] flex items-center justify-center shrink-0 shadow-sm">
              <StepIcon className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 ${
                    currentStep.viewMode === 'simple'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-800'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                  }`}
                >
                  {currentStep.viewMode === 'simple' ? 'Simple View' : 'Studio Suite'}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-500 font-mono">
                  Module {currentStepIndex + 1}/{activeSteps.length}
                </span>
              </div>
              <h4 className="text-sm font-serif italic text-[#1A1A1A] dark:text-[#F9F7F2] font-bold">
                {currentStep.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Interactive "Try It on Your Screen" Action Box */}
          <div className="bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
              <MousePointerClick className="w-3.5 h-3.5 animate-bounce" />
              <span className="text-[9px] uppercase tracking-widest font-black">
                Try It on This Page Now:
              </span>
            </div>
            <p className="text-xs text-[#1A1A1A] dark:text-[#F9F7F2] font-medium leading-normal">
              {currentStep.interactiveTask.instruction}
            </p>
            {currentStep.interactiveTask.actionLabel && (
              <button
                type="button"
                onClick={handlePerformInteractiveAction}
                className="w-full mt-1 px-3 py-1.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[9px] uppercase tracking-widest font-black hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{currentStep.interactiveTask.actionLabel}</span>
              </button>
            )}
          </div>

          {/* Key Capabilities Bullet Points */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[8px] uppercase tracking-widest font-black text-gray-400 block">
              Key Features &amp; Capabilities:
            </span>
            <ul className="space-y-1 text-[11px] text-gray-700 dark:text-zinc-300">
              {currentStep.features.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Step Navigation Dots & Control Buttons */}
        <div className="p-3 bg-gray-100 dark:bg-[#141412] border-t border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-2">
          {/* Quick Jump Step Dots */}
          <div className="flex items-center gap-1">
            {activeSteps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStep(idx)}
                className={`w-2.5 h-2.5 transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'bg-black dark:bg-white scale-125'
                    : 'bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400'
                }`}
                title={`Jump to Step ${idx + 1}: ${s.title}`}
                aria-label={`Jump to Step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Back & Next Controls */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-2.5 py-1.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Prev</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[9px] uppercase tracking-widest font-black hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span>{isLastStep ? 'Finish Tour' : 'Next Step'}</span>
              {isLastStep ? <CheckCircle2 className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
