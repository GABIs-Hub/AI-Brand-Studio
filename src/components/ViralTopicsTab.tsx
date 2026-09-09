import { useState, useEffect } from 'react';
import { BrandBible, ViralTopicHook, HookAngle } from '../types';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Flame,
  Lightbulb,
  Target,
  ArrowRight,
  BookOpen,
  Compass,
  Cpu,
} from 'lucide-react';

interface ViralTopicsTabProps {
  brand: BrandBible;
  onSendToSocialTemplate?: (topicHeadline: string, hook: ViralTopicHook) => void;
}

const HOOK_ANGLE_META: Record<
  HookAngle,
  { label: string; bg: string; text: string; icon: any }
> = {
  contrarian: {
    label: 'Contrarian Take',
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    text: 'text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
    icon: Flame,
  },
  curiosity: {
    label: 'Curiosity Gap',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    icon: Lightbulb,
  },
  storytelling: {
    label: 'Founding Conviction',
    bg: 'bg-indigo-100 dark:bg-indigo-950/60',
    text: 'text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    icon: BookOpen,
  },
  framework: {
    label: 'Actionable Framework',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    icon: Target,
  },
  future_trend: {
    label: '2027 Trend Forecast',
    bg: 'bg-purple-100 dark:bg-purple-950/60',
    text: 'text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    icon: Compass,
  },
  data_insight: {
    label: 'Data & Metric Insight',
    bg: 'bg-blue-100 dark:bg-blue-950/60',
    text: 'text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    icon: TrendingUp,
  },
  behind_the_scenes: {
    label: 'Behind The Scenes',
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700',
    icon: Zap,
  },
};

export function ViralTopicsTab({ brand, onSendToSocialTemplate }: ViralTopicsTabProps) {
  const [hooks, setHooks] = useState<ViralTopicHook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAngleFilter, setSelectedAngleFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiEngine, setAiEngine] = useState<'gemini' | 'gpt_viral' | 'claude_manifesto'>('gemini');

  const fetchViralTopics = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/generate-viral-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brand.brandName,
          industry: brand.industry,
          mission: brand.mission,
          targetAudience: brand.targetAudience,
          toneStyle: brand.toneOfVoice?.[0]?.trait || 'Authoritative & Inspiring',
          goal: customGoal || 'High engagement, brand authority, and community shares',
        }),
      });

      let data: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Viral topics service returned an unexpected response format.');
        }
      }
      const _contentType = response.headers.get('content-type') || '';
      if (_contentType.includes('text/html')) {
        throw new Error('Server is currently unavailable or restarting. Please try again in a few seconds.');
      }

      if (!response.ok || !data) {
        throw new Error(data?.error || 'Failed to generate viral topics.');
      }

      if (data.hooks && data.hooks.length > 0) {
        setHooks(data.hooks);
      }
    } catch (err: any) {
      console.error('Error fetching viral hooks:', err);
      setErrorMsg(err.message || 'Could not generate viral topic hooks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchViralTopics();
  }, [brand.brandName]);

  const copyHookOutline = (hook: ViralTopicHook) => {
    const textToCopy = `TOPIC HOOK: ${hook.headline}\n\n` +
      `ANGLE: ${hook.hookAngleLabel}\n` +
      `PITCH: ${hook.pitch}\n` +
      `FORMAT: ${hook.suggestedFormat.toUpperCase()}\n\n` +
      `OUTLINE BREAKDOWN:\n` +
      hook.sampleOutline.map((item, idx) => `  ${idx + 1}. ${item}`).join('\n') +
      `\n\n#${hook.suggestedHashtags.join(' #')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(hook.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredHooks = selectedAngleFilter === 'all'
    ? hooks
    : hooks.filter((h) => h.hookAngle === selectedAngleFilter);

  return (
    <div className="space-y-8" id="viral-topics-studio">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] uppercase tracking-[0.3em] font-black bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] px-2 py-0.5">
                Content Growth Engine
              </span>
              <span className="text-[9px] uppercase tracking-widest font-mono text-gray-500 dark:text-gray-500">
                Tailored for {brand.brandName}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif italic text-[#1A1A1A] dark:text-[#F9F7F2]">
              Eye-Catching Topic &amp; Viral Hook Lab
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-400 mt-1 max-w-2xl">
              Never run out of campaign ideas or high-performing social content. Generate provocative contrarian viewpoints, high-authority blueprints, and magnetic hooks that position <span className="font-bold text-black dark:text-white">{brand.brandName}</span> at the center of your industry conversation.
            </p>
          </div>

          {/* AI Specialist Persona Selector & Refresh */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800/80 p-1 border border-gray-200 dark:border-gray-200 dark:border-zinc-700">
              <span className="text-[8px] uppercase tracking-widest font-bold px-2 text-gray-500 dark:text-gray-500">
                AI Persona:
              </span>
              {[
                { id: 'gemini', label: 'Gemini 3.7 Strategic' },
                { id: 'gpt_viral', label: 'GPT Viral Strategist' },
                { id: 'claude_manifesto', label: 'Claude Manifesto Copy' },
              ].map((engine) => (
                <button
                  key={engine.id}
                  onClick={() => setAiEngine(engine.id as any)}
                  className={`px-2.5 py-1 text-[8px] uppercase tracking-widest font-black transition-all cursor-pointer ${
                    aiEngine === engine.id
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {engine.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchViralTopics()}
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Synthesizing Hooks...' : 'Generate New Angles'}</span>
            </button>
          </div>
        </div>

        {/* Custom Angle / Topic Filter Search */}
        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedAngleFilter('all')}
              className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold border transition-all cursor-pointer ${
                selectedAngleFilter === 'all'
                  ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] border-[#1A1A1A] dark:border-[#F9F7F2]'
                  : 'bg-transparent text-gray-600 dark:text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-gray-200 dark:border-zinc-800 hover:border-gray-400'
              }`}
            >
              All Angles ({hooks.length})
            </button>
            {Object.entries(HOOK_ANGLE_META).map(([key, meta]) => {
              const count = hooks.filter((h) => h.hookAngle === key).length;
              if (count === 0 && selectedAngleFilter !== key) return null;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedAngleFilter(key)}
                  className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold border transition-all cursor-pointer ${
                    selectedAngleFilter === key
                      ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] border-[#1A1A1A] dark:border-[#F9F7F2]'
                      : 'bg-transparent text-gray-600 dark:text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-gray-200 dark:border-zinc-800 hover:border-gray-400'
                  }`}
                >
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-72">
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="Focus goal (e.g. Q3 product launch)..."
              className="w-full bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-gray-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-[#1A1A1A] dark:text-[#F9F7F2] placeholder-gray-400 focus:outline-hidden focus:border-[#1A1A1A]"
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
          {errorMsg}
        </div>
      )}

      {/* Grid of Viral Topic Hooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHooks.map((hook) => {
          const meta = HOOK_ANGLE_META[hook.hookAngle] || HOOK_ANGLE_META.contrarian;
          const Icon = meta.icon;

          return (
            <div
              key={hook.id}
              className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 flex flex-col justify-between space-y-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Badge and Prediction */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[8px] uppercase tracking-widest font-black px-2.5 py-1 border flex items-center gap-1.5 ${meta.bg} ${meta.text}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{hook.hookAngleLabel || meta.label}</span>
                  </span>

                  <span className="text-[8px] uppercase tracking-widest font-mono font-bold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-2 py-0.5 border border-gray-200 dark:border-gray-200 dark:border-zinc-700">
                    {hook.engagementPrediction}
                  </span>
                </div>

                {/* Headline */}
                <h3 className="font-serif italic text-lg sm:text-xl text-[#1A1A1A] dark:text-[#F9F7F2] leading-snug">
                  "{hook.headline}"
                </h3>

                {/* Pitch */}
                <p className="text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-400 font-sans leading-relaxed">
                  {hook.pitch}
                </p>

                {/* Sample Outline */}
                <div className="bg-gray-50 dark:bg-zinc-900/60 p-3.5 border border-gray-100 dark:border-zinc-800 space-y-2">
                  <span className="text-[9px] uppercase tracking-widest font-black text-gray-500 dark:text-zinc-400 block">
                    Recommended {hook.suggestedFormat.toUpperCase()} Breakdown:
                  </span>
                  <ul className="space-y-1 text-[11px] text-gray-700 dark:text-zinc-300 font-mono">
                    {hook.sampleOutline.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-gray-400 shrink-0 font-bold">{idx + 1}.</span>
                        <span className="line-clamp-1">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1.5">
                  {hook.suggestedHashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => copyHookOutline(hook)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[9px] uppercase tracking-widest font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {copiedId === hook.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied Pitch!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Outline</span>
                    </>
                  )}
                </button>

                {onSendToSocialTemplate && (
                  <button
                    type="button"
                    onClick={() => onSendToSocialTemplate(hook.headline, hook)}
                    className="px-3 py-2 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[9px] uppercase tracking-widest font-black hover:opacity-85 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Create Social Post</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
