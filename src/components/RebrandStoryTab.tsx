import React, { useState } from 'react';
import {
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Shield,
  Palette,
  Type as TypeIcon,
  Download,
  Share2,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { BrandBible, RebrandStory } from '../types';

interface RebrandStoryTabProps {
  brand: BrandBible;
  onTriggerRebrand?: (brand: BrandBible) => void;
}

export function RebrandStoryTab({ brand, onTriggerRebrand }: RebrandStoryTabProps) {
  const [copiedBio, setCopiedBio] = useState(false);
  const [copiedAnnouncement, setCopiedAnnouncement] = useState(false);
  const [showSvgCode, setShowSvgCode] = useState(false);

  const story: RebrandStory = brand.rebrandStory || {
    isRebrand: true,
    previousBrandName: brand.brandName,
    rebrandMode: 'impress_me',
    rebrandTitle: `${brand.brandName}: The Next Strategic Era`,
    rebrandBio: `As we enter this next phase, our rebranding reflects a deliberate evolution toward elevated craftsmanship, clarity, and enduring relevance in an evolving market.`,
    strategicDiagnosis: 'Elevating visual hierarchy, typographic authority, and multi-channel brand presence.',
    keyEvolutionPoints: [
      {
        title: 'Visual Identity & Emblem Modernization',
        before: 'Legacy mark with visual friction and dated geometry',
        after: 'Sculpted vector identity with mathematical geometry and negative space harmony',
        strategicWhy: 'Ensures unmistakable recognition across digital touchpoints, app icons, and physical packaging.',
      },
      {
        title: 'Typographic Hierarchy & Editorial Authority',
        before: 'Standard system typography lacking distinct brand voice',
        after: `${brand.typography?.headingFont || 'Modern Sans'} paired with ${brand.typography?.bodyFont || 'Clean Sans'}`,
        strategicWhy: brand.typography?.rationale || 'Elevates readability and signals premium craft.',
      },
      {
        title: 'Color Atmosphere & Accessibility',
        before: 'Uncalibrated primary colors',
        after: `5-Color balanced palette with 60-30-10 distribution and WCAG AA verification`,
        strategicWhy: 'Eliminates contrast barriers while projecting contemporary sophistication.',
      },
    ],
  };

  const handleCopyBio = () => {
    navigator.clipboard.writeText(story.rebrandBio);
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2000);
  };

  const handleCopyAnnouncement = () => {
    const announcement = `🚀 Exciting News: Announcing the New ${brand.brandName}

${story.rebrandBio}

Key Changes:
${story.keyEvolutionPoints.map((pt) => `• ${pt.title}: ${pt.after} (${pt.strategicWhy})`).join('\n')}

Explore our new brand identity: ${brand.tagline}`;
    navigator.clipboard.writeText(announcement);
    setCopiedAnnouncement(true);
    setTimeout(() => setCopiedAnnouncement(false), 2000);
  };

  const handleDownloadBrief = () => {
    const brief = {
      rebrandTitle: story.rebrandTitle,
      brandName: brand.brandName,
      tagline: brand.tagline,
      rebrandBio: story.rebrandBio,
      strategicDiagnosis: story.strategicDiagnosis,
      rebrandMode: story.rebrandMode,
      customPrompt: story.customPrompt,
      keyEvolutionPoints: story.keyEvolutionPoints,
      previousAssets: {
        logo: story.previousLogo,
        typography: story.previousTypography,
        colors: story.previousColors,
      },
      newIdentity: {
        palette: brand.palette,
        typography: brand.typography,
        mission: brand.mission,
        positioningStatement: brand.positioningStatement,
      },
      generatedAt: story.createdAt || new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(brief, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brand.brandName.toLowerCase().replace(/\s+/g, '-')}-rebrand-brief.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="rebrand-story-dossier">
      {/* Top Banner & Header */}
      <div className="bg-[#1A1A1A] text-white p-6 sm:p-8 border border-black/10 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden sm:block">
          <RefreshCw className="w-64 h-64 -mr-16 -mt-16 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-amber-400 text-black">
              <RefreshCw className="w-3 h-3" />
              Strategic Rebrand Dossier
            </span>
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-mono text-zinc-300 bg-white/10 border border-white/10">
              {story.rebrandMode === 'custom_prompt' ? 'User Vision Directed' : 'GABI Strategic Reasoning'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 text-[#F9F7F2]">
            {story.rebrandTitle}
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans mb-6">
            {brand.tagline} • Transitioning from heritage equity to an elevated, future-proof market posture.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyAnnouncement}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
              id="rebrand-copy-announcement-btn"
            >
              {copiedAnnouncement ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedAnnouncement ? 'Announcement Copied!' : 'Copy Launch Announcement'}
            </button>

            <button
              onClick={handleDownloadBrief}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-transparent text-white border border-white/30 hover:bg-white/10 transition-colors cursor-pointer"
              id="rebrand-download-brief-btn"
            >
              <Download className="w-3.5 h-3.5" />
              Download Rebrand Brief (.JSON)
            </button>

            {onTriggerRebrand && (
              <button
                onClick={() => onTriggerRebrand(brand)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30 transition-colors cursor-pointer"
                id="rebrand-iterate-btn"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Iterate Rebrand
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Editorial: The Rebrand Bio ("Why We're Moving Towards This New Phase") */}
      <div className="bg-white dark:bg-[#242424] border border-[#1A1A1A]/10 dark:border-[#F9F7F2]/10 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2]">
                Why We’re Moving Towards This New Phase
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono">
                Official Rebrand Manifesto & Press Narrative
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyBio}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider uppercase border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            id="rebrand-copy-bio-btn"
            title="Copy Rebrand Bio"
          >
            {copiedBio ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedBio ? 'Copied' : 'Copy Bio'}</span>
          </button>
        </div>

        {/* Narrative Card */}
        <div className="relative pl-6 border-l-2 border-amber-500 py-1">
          <p className="text-base sm:text-lg text-gray-800 dark:text-zinc-200 leading-relaxed font-display whitespace-pre-line italic">
            "{story.rebrandBio}"
          </p>
        </div>

        {/* Strategic Diagnosis Sub-panel */}
        {story.strategicDiagnosis && (
          <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 flex items-start gap-3 bg-amber-50/50 dark:bg-amber-950/20 p-4 border border-amber-200/50 dark:border-amber-800/30">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-gray-900 dark:text-zinc-100 uppercase tracking-wider block mb-0.5">
                Strategic Diagnosis & Creative Logic:
              </span>
              <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
                {story.strategicDiagnosis}
              </p>
              {story.customPrompt && (
                <p className="mt-2 text-[11px] text-amber-800 dark:text-amber-300 font-mono">
                  Prompt mandate: "{story.customPrompt}"
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Visual Transformation Matrix: Before vs After */}
      <div>
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2]">
            Visual Transformation Matrix
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Side-by-side comparison of legacy brand assets vs. upgraded modern identity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Logo Transformation */}
          <div className="bg-white dark:bg-[#242424] border border-[#1A1A1A]/10 dark:border-[#F9F7F2]/10 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Logo & Emblem
                </span>
              </div>

              {/* Before Mark */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Legacy Logo
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">Before</span>
                </div>
                <div className="h-28 bg-[#F4F4F0] dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 flex items-center justify-center p-3 overflow-hidden text-center">
                  {story.previousLogo ? (
                    story.previousLogoType === 'svg' || story.previousLogo.includes('<svg') ? (
                      <div
                        className="w-full h-full flex items-center justify-center [&>svg]:max-h-20 [&>svg]:w-auto"
                        dangerouslySetInnerHTML={{ __html: story.previousLogo }}
                      />
                    ) : story.previousLogo.startsWith('data:') || story.previousLogo.startsWith('http') ? (
                      <img
                        src={story.previousLogo}
                        alt="Legacy Logo"
                        className="max-h-20 max-w-full object-contain"
                      />
                    ) : (
                      <div className="p-2 text-xs text-gray-600 dark:text-zinc-400 italic">
                        "{story.previousLogo}"
                      </div>
                    )
                  ) : (
                    <div className="text-xs text-gray-400 italic">
                      Legacy uncalibrated mark
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-2">
                <div className="p-1 bg-amber-400 text-black rounded-xl-full">
                  <ArrowRight className="w-3 h-3 rotate-90 lg:rotate-0" />
                </div>
              </div>

              {/* After Mark */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                    Rebranded Vector Emblem
                  </span>
                  <span className="text-[10px] font-mono text-green-600 dark:text-green-400">After</span>
                </div>
                <div className="h-28 bg-[#FDFCF7] dark:bg-[#161616] border-2 border-green-500/20 flex items-center justify-center p-3 relative overflow-hidden">
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:max-h-24 [&>svg]:w-auto"
                    dangerouslySetInnerHTML={{ __html: brand.logo?.primaryLogoSvg || '' }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
              <p className="text-[11px] text-gray-600 dark:text-zinc-400 leading-tight">
                <strong className="text-gray-900 dark:text-zinc-100">Evolution: </strong>
                {brand.logo?.concept || 'High-precision mathematical vector geometry optimized for multi-screen scalability.'}
              </p>
            </div>
          </div>

          {/* 2. Typography Transformation */}
          <div className="bg-white dark:bg-[#242424] border border-[#1A1A1A]/10 dark:border-[#F9F7F2]/10 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                <TypeIcon className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Typography Architecture
                </span>
              </div>

              {/* Before Typography */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Legacy Type Stack
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">Before</span>
                </div>
                <div className="p-3.5 bg-[#F4F4F0] dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 min-h-[7rem]">
                  <div className="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                    Heading:{' '}
                    <span className="font-mono text-gray-500">
                      {story.previousTypography?.headingFont || 'Standard Generic Sans'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-zinc-400 mb-2">
                    Body:{' '}
                    <span className="font-mono text-gray-500">
                      {story.previousTypography?.bodyFont || 'System Default'}
                    </span>
                  </div>
                  <p
                    className="text-xs text-gray-500 italic truncate"
                    style={{
                      fontFamily: story.previousTypography?.headingFont || 'sans-serif',
                    }}
                  >
                    "Sphinx of black quartz, judge my vow."
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-2">
                <div className="p-1 bg-amber-400 text-black rounded-xl-full">
                  <ArrowRight className="w-3 h-3 rotate-90 lg:rotate-0" />
                </div>
              </div>

              {/* After Typography */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                    Google Fonts Pairing
                  </span>
                  <span className="text-[10px] font-mono text-green-600 dark:text-green-400">After</span>
                </div>
                <div className="p-3.5 bg-[#FDFCF7] dark:bg-[#161616] border-2 border-green-500/20 min-h-[7rem]">
                  <div className="text-xs font-bold text-gray-900 dark:text-zinc-100 mb-1">
                    Heading:{' '}
                    <span className="font-mono text-green-600 dark:text-green-400">
                      {brand.typography?.headingFont}
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 dark:text-zinc-300 mb-2">
                    Body:{' '}
                    <span className="font-mono text-green-600 dark:text-green-400">
                      {brand.typography?.bodyFont}
                    </span>
                  </div>
                  <p
                    className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate"
                    style={{ fontFamily: brand.typography?.headingFont }}
                  >
                    "Sphinx of black quartz, judge my vow."
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
              <p className="text-[11px] text-gray-600 dark:text-zinc-400 leading-tight">
                <strong className="text-gray-900 dark:text-zinc-100">Evolution: </strong>
                {brand.typography?.rationale || 'High typographic contrast engineered for commanding readability.'}
              </p>
            </div>
          </div>

          {/* 3. Color Palette Transformation */}
          <div className="bg-white dark:bg-[#242424] border border-[#1A1A1A]/10 dark:border-[#F9F7F2]/10 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                <Palette className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Color Palette & WCAG
                </span>
              </div>

              {/* Before Palette */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Legacy Palette
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">Before</span>
                </div>
                <div className="p-3 bg-[#F4F4F0] dark:bg-[#1A1A1A] border border-black/5 dark:border-white/5 min-h-[5.5rem] flex flex-col justify-center">
                  {story.previousColors && story.previousColors.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {story.previousColors.map((hex, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div
                            className="w-7 h-7 border border-black/10 shadow-xs"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="text-[9px] font-mono text-gray-500 mt-1 uppercase">
                            {hex}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">
                      Legacy unverified palette
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-2">
                <div className="p-1 bg-amber-400 text-black rounded-xl-full">
                  <ArrowRight className="w-3 h-3 rotate-90 lg:rotate-0" />
                </div>
              </div>

              {/* After Palette */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                    WCAG AA 5-Color Harmony
                  </span>
                  <span className="text-[10px] font-mono text-green-600 dark:text-green-400">After</span>
                </div>
                <div className="p-3 bg-[#FDFCF7] dark:bg-[#161616] border-2 border-green-500/20 min-h-[5.5rem] flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {brand.palette?.map((col, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="w-7 h-7 border border-black/10 shadow-xs relative group"
                          style={{ backgroundColor: col.hex }}
                          title={`${col.role}: ${col.hex} (${col.name})`}
                        />
                        <span className="text-[9px] font-mono font-bold text-gray-800 dark:text-zinc-200 mt-1 uppercase">
                          {col.hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
              <p className="text-[11px] text-gray-600 dark:text-zinc-400 leading-tight">
                <strong className="text-gray-900 dark:text-zinc-100">Evolution: </strong>
                60-30-10 distribution calibrated for high contrast, digital accessibility, and emotional depth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Evolution Pillars (The Why Behind Every Decision) */}
      <div className="bg-white dark:bg-[#242424] border border-[#1A1A1A]/10 dark:border-[#F9F7F2]/10 p-6 sm:p-8">
        <div className="mb-6 pb-3 border-b border-black/5 dark:border-white/5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2]">
            Strategic Transformation Pillars
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Explicit audit of what was retired, what was elevated, and why.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {story.keyEvolutionPoints.map((point, index) => (
            <div
              key={index}
              className="p-4 bg-[#FAF9F6] dark:bg-[#1E1E1E] border border-black/5 dark:border-white/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black font-mono text-[10px] font-bold">
                    0{index + 1}
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                    {point.title}
                  </h3>
                </div>

                <div className="space-y-2 my-3 text-xs">
                  <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-900 dark:text-red-300">
                    <span className="font-bold uppercase tracking-wider block text-[10px] text-red-600 dark:text-red-400">
                      Before (Retired):
                    </span>
                    <p className="mt-0.5 leading-snug">{point.before}</p>
                  </div>

                  <div className="p-2 bg-green-500/10 border border-green-500/20 text-green-900 dark:text-green-300">
                    <span className="font-bold uppercase tracking-wider block text-[10px] text-green-600 dark:text-green-400">
                      After (Elevated):
                    </span>
                    <p className="mt-0.5 leading-snug">{point.after}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-0.5">
                  Strategic Why:
                </span>
                <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">
                  {point.strategicWhy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
