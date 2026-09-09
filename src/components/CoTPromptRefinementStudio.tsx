import { useState, useEffect } from 'react';
import { sanitizeSvg } from '../utils/sanitizeSvg';
import {
  BrandBible,
  LogoArchetype,
  ChainOfThoughtStep,
  LogoPromptRefinementResult,
} from '../types';
import {
  Sparkles,
  Wand2,
  Brain,
  Layers,
  Compass,
  Eye,
  Shield,
  Zap,
  Layout,
  RefreshCw,
  Check,
  Download,
  Copy,
  ArrowRight,
  Maximize2,
  Sliders,
  ChevronRight,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Box,
} from 'lucide-react';

interface CoTPromptRefinementStudioProps {
  brand: BrandBible;
  onUpdatePrimaryLogo: (svg: string, concept: string, symbolism: string, geometry: string) => void;
  onSendTo3DRender?: (prompt: string) => void;
}

const ARCHETYPE_OPTIONS: { id: LogoArchetype; label: string; icon: string; desc: string }[] = [
  {
    id: 'negative_space',
    label: 'Negative Space Mark',
    icon: 'Eye',
    desc: 'Optical illusion cutouts revealing secondary symbolic depth.',
  },
  {
    id: 'interlocking_monogram',
    label: 'Dynamic Monogram',
    icon: 'Layers',
    desc: 'Intertwined golden-ratio continuous ribbon splines.',
  },
  {
    id: 'abstract_emblem',
    label: 'Kinetic 3D Emblem',
    icon: 'Zap',
    desc: 'Isometric multi-facet prism conveying perpetual momentum.',
  },
  {
    id: 'architectural_badge',
    label: 'Heritage Hallmark Seal',
    icon: 'Shield',
    desc: 'Concentric precision rings & guilloché micro-perforations.',
  },
  {
    id: 'geometric_minimalist',
    label: 'Bauhaus Minimalist',
    icon: 'Compass',
    desc: 'Strict mathematical purity with zero decorative clutter.',
  },
  {
    id: 'modern_wordmark',
    label: 'Responsive Lockup',
    icon: 'Layout',
    desc: 'Horizontal mark paired with letterspaced typographic structure.',
  },
];

const COMPLEXITY_MODES = [
  {
    id: 'intricate_geometric',
    label: 'Intricate Mathematical Topology',
    badge: 'Golden Ratio Splines',
    desc: 'Multi-point Bézier curves, interwoven ribbons, and parametric symmetry.',
  },
  {
    id: 'metaphoric_duality',
    label: 'Metaphoric Duality & Cutouts',
    badge: 'Optical Illusions',
    desc: 'Subtractive boolean masks that form dual storytelling layers in negative space.',
  },
  {
    id: 'architectural_dimensional',
    label: 'Architectural 3D Isometric',
    badge: 'Isometric Matrix',
    desc: '30-degree isometric vertices with directional facet lighting gradients.',
  },
  {
    id: 'minimalist_precision',
    label: 'Bauhaus Master Precision',
    badge: 'Dieter Rams Standard',
    desc: 'Strict mathematical ratios, razor-sharp negative space, essential purity.',
  },
];

const CREATIVE_DIRECTIVE_PRESETS = [
  'Möbius continuous ribbon with golden-ratio loops',
  'Negative space optical arrow & aperture cutout',
  'Isometric dimensional kinetic crystal with directional facet gradients',
  'Dual-glyph interwoven luxury ligature',
  'Guilloché micro-perforated certified heritage hallmark seal',
  'Cantilevered architectural monogram with high-contrast baseline',
];

const BACKGROUND_OPTIONS = [
  { id: 'light', label: 'Light Canvas', class: 'bg-[#FAF9F6] text-[#111827]' },
  { id: 'dark', label: 'Dark Noir', class: 'bg-[#111110] text-[#F9F7F2]' },
  { id: 'primary', label: 'Brand Primary', class: 'bg-[#1A1A1A] text-white' },
  { id: 'slate', label: 'Studio Slate', class: 'bg-[#1E293B] text-white' },
];

export function CoTPromptRefinementStudio({
  brand,
  onUpdatePrimaryLogo,
  onSendTo3DRender,
}: CoTPromptRefinementStudioProps) {
  const [selectedArchetype, setSelectedArchetype] = useState<LogoArchetype>('negative_space');
  const [complexityLevel, setComplexityLevel] = useState<
    'intricate_geometric' | 'metaphoric_duality' | 'architectural_dimensional' | 'minimalist_precision'
  >('intricate_geometric');
  const [customDirective, setCustomDirective] = useState('');
  const [refinementResult, setRefinementResult] = useState<LogoPromptRefinementResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [previewBg, setPreviewBg] = useState<'light' | 'dark' | 'primary' | 'slate'>('light');
  const [viewMode, setViewMode] = useState<'refined' | 'comparison'>('refined');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate a naive/basic shape for comparison demonstration
  const pColor = brand.palette[0]?.hex || '#1A1A1A';
  const sColor = brand.palette[1]?.hex || '#2563EB';
  const initial = brand.brandName.charAt(0).toUpperCase();

  const naiveBasicShapeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="100%" height="100%">
    <g transform="translate(25, 20)">
      <circle cx="30" cy="30" r="28" fill="${pColor}" />
      <text x="30" y="38" font-family="sans-serif" font-size="22" font-weight="700" fill="#FFFFFF" text-anchor="middle">${initial}</text>
    </g>
    <text x="96" y="55" font-family="sans-serif" font-size="22" font-weight="700" fill="#111827">${brand.brandName}</text>
    <text x="96" y="72" font-family="sans-serif" font-size="8" fill="#6B7280" letter-spacing="2">BASIC GENERIC LOGO</text>
  </svg>`;

  const runCoTRefinement = async (archetypeToUse?: LogoArchetype, directiveToUse?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/refine-logo-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brand.brandName,
          industry: brand.industry,
          mission: brand.mission,
          aesthetic: brand.imageryStyle?.moodboardKeywords?.join(', ') || 'Modern, Clean, High-Contrast',
          targetAudience: brand.targetAudience,
          archetype: archetypeToUse || selectedArchetype,
          customDirectives: directiveToUse !== undefined ? directiveToUse : customDirective,
          complexityLevel,
          palette: brand.palette,
          typography: brand.typography,
        }),
      });

      let data: LogoPromptRefinementResult | null = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = (await response.json()) as LogoPromptRefinementResult;
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text) as LogoPromptRefinementResult;
        } catch {
          throw new Error('Chain-of-Thought service returned invalid response format.');
        }
      }
      const _contentType = response.headers.get('content-type') || '';
      if (_contentType.includes('text/html')) {
        throw new Error('Server is currently unavailable or restarting. Please try again in a few seconds.');
      }

      if (!response.ok || !data) {
        throw new Error((data as any)?.error || 'Chain-of-Thought prompt refinement could not be completed.');
      }

      setRefinementResult(data);
      setActiveStepIndex(0);
    } catch (err: any) {
      console.error('CoT Logo Refinement error:', err);
      setErrorMsg(err.message || 'Error running Chain-of-Thought refinement.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runCoTRefinement();
  }, [brand.brandName]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

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

  const handleApplyToBrandBible = () => {
    if (!refinementResult || !refinementResult.generatedSvg) return;
    onUpdatePrimaryLogo(
      refinementResult.generatedSvg,
      refinementResult.conceptualMetaphor,
      refinementResult.chainOfThought?.[0]?.reasoning || 'Engineered with Chain-of-Thought semiotic depth.',
      refinementResult.chainOfThought?.[1]?.reasoning || refinementResult.svgPathBlueprint
    );
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 3500);
  };

  const currentBgClass = BACKGROUND_OPTIONS.find((b) => b.id === previewBg)?.class || 'bg-[#FAF9F6] text-[#111827]';

  return (
    <div className="space-y-10" id="cot-prompt-refinement-studio">
      {/* Top Banner: Chain-of-Thought Prompt Refinement Engine */}
      <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] uppercase tracking-[0.3em] font-black bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] px-2 py-0.5 flex items-center gap-1.5">
                <Brain className="w-3 h-3 text-amber-400" />
                Chain-of-Thought Engine
              </span>
              <span className="text-[9px] uppercase tracking-widest font-mono text-gray-500 dark:text-gray-500">
                5-Stage Vector Deconstruction
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif italic text-[#1A1A1A] dark:text-[#F9F7F2]">
              Chain-of-Thought Logo Prompt Refinement Lab
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-400 mt-1 max-w-2xl">
              Generic AI models produce simplistic circles and letters in boxes. Our multi-stage Chain-of-Thought engine deconstructs brand semiotics, formulates mathematical topologies (golden ratio Béziers, subtractive masks, isometric coordinates), and synthesizes complex, agency-grade vector marks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => runCoTRefinement()}
              disabled={isLoading}
              className="px-6 py-3 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Executing CoT Reasoning...' : 'Run CoT Refinement'}</span>
            </button>
          </div>
        </div>

        {/* Refinement Configuration Controls */}
        <div className="pt-6 border-t border-gray-100 dark:border-zinc-800/80 space-y-6">
          {/* 1. Archetype Selection Pills */}
          <div>
            <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-500 block mb-2">
              Step 1: Select Visual Archetype Target
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {ARCHETYPE_OPTIONS.map((arch) => (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => {
                    setSelectedArchetype(arch.id);
                    runCoTRefinement(arch.id, customDirective);
                  }}
                  className={`p-3 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedArchetype === arch.id
                      ? 'border-[#1A1A1A] dark:border-[#F9F7F2] bg-gray-50 dark:bg-zinc-900 ring-1 ring-[#1A1A1A] dark:ring-[#F9F7F2]'
                      : 'border-gray-200 dark:border-gray-200 dark:border-zinc-800 hover:border-gray-400 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="text-[10px] font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">
                    {arch.label}
                  </span>
                  <span className="text-[9px] text-gray-500 dark:text-zinc-400 line-clamp-2 mt-1 font-serif italic">
                    {arch.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Geometric Complexity Mode */}
          <div>
            <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-500 block mb-2">
              Step 2: Calibrate Mathematical Topology &amp; Complexity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {COMPLEXITY_MODES.map((mode) => (
                <div
                  key={mode.id}
                  onClick={() => {
                    setComplexityLevel(mode.id as any);
                  }}
                  className={`p-3.5 border transition-all cursor-pointer ${
                    complexityLevel === mode.id
                      ? 'border-[#1A1A1A] dark:border-[#F9F7F2] bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'border-gray-200 dark:border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold">{mode.label}</span>
                    <span className={`text-[8px] uppercase tracking-widest font-mono px-1.5 py-0.5 border ${
                      complexityLevel === mode.id
                        ? 'border-white/30 text-white dark:border-black/30 dark:text-black'
                        : 'border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-gray-500'
                    }`}>
                      {mode.badge}
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1.5 font-serif italic ${
                    complexityLevel === mode.id ? 'opacity-90' : 'text-gray-500 dark:text-zinc-400'
                  }`}>
                    {mode.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Custom Directives & 1-Click Injection Presets */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-500 block">
              Step 3: Custom Architectural Directives &amp; Quick Injections
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {CREATIVE_DIRECTIVE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCustomDirective(preset);
                    runCoTRefinement(selectedArchetype, preset);
                  }}
                  className="px-2.5 py-1 text-[9px] font-mono bg-gray-100 dark:bg-zinc-800/80 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-200 dark:border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-300 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  <span>+ {preset}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={customDirective}
                onChange={(e) => setCustomDirective(e.target.value)}
                placeholder="Enter specific geometric or metaphorical directives (e.g. 'Golden ratio Nautilus spiral intersecting central focal dot')..."
                className="flex-1 bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-gray-200 dark:border-zinc-700 px-4 py-2.5 text-xs font-serif italic text-[#1A1A1A] dark:text-[#F9F7F2] placeholder-gray-400 focus:outline-hidden focus:border-[#1A1A1A] dark:focus:border-[#F9F7F2]"
              />
              <button
                type="button"
                onClick={() => runCoTRefinement(selectedArchetype, customDirective)}
                disabled={isLoading}
                className="px-5 py-2.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[9px] uppercase tracking-widest font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Apply &amp; Refine</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Results Layout: CoT Reasoning Chain (Left 6 cols) + Interactive Visual Concept Sandbox (Right 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Columns: Interactive Chain-of-Thought Step-by-Step Inspector */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Chain-of-Thought Reasoning Pipeline
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest font-mono text-gray-400">
                {refinementResult?.chainOfThought?.length || 5} Verified Stages
              </span>
            </div>

            {/* Stepped CoT Pipeline Accordion */}
            <div className="space-y-3">
              {refinementResult?.chainOfThought?.map((step: ChainOfThoughtStep, index: number) => {
                const isExpanded = activeStepIndex === index || activeStepIndex === null;

                return (
                  <div
                    key={step.stepNumber}
                    className="border border-gray-200 dark:border-gray-200 dark:border-zinc-800 transition-all overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveStepIndex(activeStepIndex === index ? null : index)}
                      className="w-full p-3.5 bg-gray-50/70 dark:bg-zinc-900/40 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[10px] font-mono font-bold flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">
                            {step.stepName}
                          </h4>
                          <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-serif italic">
                            {step.focus}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white dark:bg-[#1C1C1A] border-t border-gray-100 dark:border-zinc-800/80 space-y-3 text-xs">
                        <p className="font-serif italic text-gray-700 dark:text-zinc-300 leading-relaxed">
                          {step.reasoning}
                        </p>

                        {step.extractedMetaphors && step.extractedMetaphors.length > 0 && (
                          <div className="pt-2 border-t border-dashed border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                            <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block mb-1">
                              Extracted Visual Metaphors:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {step.extractedMetaphors.map((metaphor, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[9px] font-mono text-amber-800 dark:text-amber-300"
                                >
                                  {metaphor}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {step.geometryRules && step.geometryRules.length > 0 && (
                          <div className="pt-2 border-t border-dashed border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                            <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block mb-1">
                              Mathematical Topology Rules:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {step.geometryRules.map((rule, rIdx) => (
                                <span
                                  key={rIdx}
                                  className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[9px] font-mono text-blue-800 dark:text-blue-300"
                                >
                                  {rule}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Visual Complexity & Anti-Basic Assessment */}
            {refinementResult?.visualComplexityAnalysis && (
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Anti-Basic Quality Benchmark: Passed</span>
                </div>
                <p className="text-[11px] font-serif italic text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  {refinementResult.visualComplexityAnalysis}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 6 Columns: Interactive Visual Concept Sandbox, Comparison & Export */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 space-y-6 sticky top-6">
            {/* Header & View Mode Switcher */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] block">
                  Synthesized Vector Concept
                </span>
                <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-serif italic">
                  {refinementResult?.conceptualMetaphor || 'CoT Precision Concept'}
                </span>
              </div>

              {/* Toggle: Refined vs Comparison */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('refined')}
                  className={`px-2.5 py-1 text-[8px] uppercase tracking-widest font-black transition-all cursor-pointer ${
                    viewMode === 'refined'
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-500 dark:text-gray-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Refined Concept
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('comparison')}
                  className={`px-2.5 py-1 text-[8px] uppercase tracking-widest font-black transition-all cursor-pointer ${
                    viewMode === 'comparison'
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-500 dark:text-gray-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  vs Basic Shape
                </button>
              </div>
            </div>

            {/* Background Canvas Selector */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-500">
                Sandbox Canvas:
              </span>
              <div className="flex gap-1">
                {BACKGROUND_OPTIONS.map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setPreviewBg(bg.id as any)}
                    className={`px-2 py-1 text-[8px] uppercase tracking-widest font-bold border transition-all cursor-pointer ${
                      previewBg === bg.id
                        ? 'border-[#1A1A1A] dark:border-[#F9F7F2] bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                        : 'border-gray-200 dark:border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {bg.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Interactive Concept Viewport */}
            {viewMode === 'refined' ? (
              <div
                className={`p-8 border border-gray-200 dark:border-gray-200 dark:border-zinc-700 min-h-[190px] flex items-center justify-center ${currentBgClass} transition-colors duration-300 relative group`}
              >
                <div
                  className="w-full max-w-[290px] h-24 flex items-center justify-center transition-transform group-hover:scale-105 duration-300"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeSvg(refinementResult?.generatedSvg || naiveBasicShapeSvg),
                  }}
                />
              </div>
            ) : (
              /* Side-by-Side Comparison: Basic Shape vs CoT Refined */
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-red-200 dark:border-red-950 p-3 bg-red-50/20 dark:bg-red-950/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] uppercase tracking-widest font-black text-red-700 dark:text-red-400">
                      Standard / Naive
                    </span>
                    <span className="text-[8px] font-mono text-red-500">Circle + Text</span>
                  </div>
                  <div
                    className="w-full h-16 flex items-center justify-center bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 p-2"
                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(naiveBasicShapeSvg) }}
                  />
                  <p className="text-[9px] text-gray-500 dark:text-gray-500 font-serif italic">
                    Low memorability, no optical tension or storytelling.
                  </p>
                </div>

                <div className="border border-emerald-300 dark:border-emerald-800 p-3 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] uppercase tracking-widest font-black text-emerald-700 dark:text-emerald-300">
                      CoT Refined
                    </span>
                    <span className="text-[8px] font-mono text-emerald-600">Agency Grade</span>
                  </div>
                  <div
                    className="w-full h-16 flex items-center justify-center bg-white dark:bg-black/40 border border-emerald-200 dark:border-emerald-900 p-2"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeSvg(refinementResult?.generatedSvg || naiveBasicShapeSvg),
                    }}
                  />
                  <p className="text-[9px] text-emerald-700 dark:text-emerald-300 font-serif italic">
                    Bespoke mathematical topology, gradients, and depth.
                  </p>
                </div>
              </div>
            )}

            {/* Generated High-Order Prompts Breakdown */}
            <div className="space-y-3 pt-2">
              {/* Refined Vector SVG Prompt */}
              <div className="p-3.5 bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-500 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-blue-500" />
                    Refined Vector Prompt (SVG Specification)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        refinementResult?.refinedVectorPrompt || '',
                        'vector_prompt'
                      )
                    }
                    className="text-[8px] uppercase tracking-widest font-bold text-gray-600 dark:text-gray-600 hover:text-black dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'vector_prompt' ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedKey === 'vector_prompt' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] font-mono text-gray-700 dark:text-zinc-300 line-clamp-3">
                  {refinementResult?.refinedVectorPrompt}
                </p>
              </div>

              {/* Refined 3D Studio Mockup Prompt */}
              <div className="p-3.5 bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-500 flex items-center gap-1">
                    <Box className="w-3 h-3 text-amber-500" />
                    Refined 3D Studio Render Prompt (Materiality &amp; Caustics)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        refinementResult?.refinedStudioPrompt || '',
                        'studio_prompt'
                      )
                    }
                    className="text-[8px] uppercase tracking-widest font-bold text-gray-600 dark:text-gray-600 hover:text-black dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'studio_prompt' ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedKey === 'studio_prompt' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] font-mono text-gray-700 dark:text-zinc-300 line-clamp-3">
                  {refinementResult?.refinedStudioPrompt}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-2">
              <button
                type="button"
                onClick={handleApplyToBrandBible}
                disabled={!refinementResult?.generatedSvg}
                className="w-full py-3 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[10px] uppercase tracking-[0.2em] font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {appliedNotice
                    ? 'Applied as Primary Brand Mark!'
                    : 'Set as Active Primary Brand Mark'}
                </span>
              </button>

              <div className="flex gap-2">
                {onSendTo3DRender && refinementResult?.refinedStudioPrompt && (
                  <button
                    type="button"
                    onClick={() => {
                      if (refinementResult.refinedStudioPrompt) {
                        onSendTo3DRender(refinementResult.refinedStudioPrompt);
                      }
                    }}
                    className="flex-1 py-2 bg-amber-500 text-black text-[9px] uppercase tracking-widest font-black hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Send to 3D Render</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (refinementResult?.generatedSvg) {
                      copyText(refinementResult.generatedSvg, 'raw_svg');
                    }
                  }}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[9px] uppercase tracking-widest font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'raw_svg' ? 'Copied SVG!' : 'Copy Raw SVG'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (refinementResult?.generatedSvg) {
                      downloadSvg(
                        refinementResult.generatedSvg,
                        `${brand.brandName.toLowerCase()}-cot-refined`
                      );
                    }
                  }}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[9px] uppercase tracking-widest font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Vector</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
