import React, { useState } from 'react';
import { BrandBible } from '../types';
import { Target, Compass, Sparkles, Award, Shield, Zap, Heart, Globe, Feather, Layers, Crown, Anchor, Flame, Share2, Check } from 'lucide-react';
import { shareBrandBible } from '../lib/share';

interface BrandOverviewTabProps {
  brand: BrandBible;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Zap,
  Sparkles,
  Heart,
  Globe,
  Target,
  Feather,
  Compass,
  Layers,
  Crown,
  Anchor,
  Flame,
};

export function BrandOverviewTab({ brand }: BrandOverviewTabProps) {
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const handleShare = async () => {
    const res = await shareBrandBible(brand);
    if (res.success) {
      setShareStatus(res.method === 'native-share' ? 'Shared!' : 'Copied Summary!');
      setTimeout(() => setShareStatus(null), 2500);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Brand Statement */}
      <div className="bg-[#1A1A1A] dark:bg-[#111110] p-8 sm:p-12 text-[#F9F7F2] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 relative overflow-hidden rounded-none">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-3 py-1.5 bg-transparent border border-[#F9F7F2] text-[10px] font-black uppercase tracking-[0.3em]">
                {brand.industry}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">
                Generated {new Date(brand.createdAt).toLocaleDateString()}
              </span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 bg-transparent hover:bg-white hover:text-[#1A1A1A] text-[#F9F7F2] border border-[#F9F7F2]/40 text-[10px] font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer"
              title="Share Brand Bible via Web Share API or Copy Text Snippet"
              id="hero-share-brand-btn"
            >
              {shareStatus ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{shareStatus}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 opacity-80" />
                  <span>Share Brand</span>
                </>
              )}
            </button>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif italic font-light tracking-tighter text-[#F9F7F2]">
            {brand.brandName}
          </h1>

          <p className="text-xl sm:text-2xl font-serif italic opacity-80 border-l-2 border-[#F9F7F2]/30 pl-6">
            "{brand.tagline}"
          </p>

          <div className="pt-8 border-t border-dashed border-[#F9F7F2]/20 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-black block mb-3 opacity-60">
                Core Mission
              </span>
              <p className="leading-relaxed font-sans font-light text-base opacity-90">{brand.mission}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-black block mb-3 opacity-60">
                Long-Term Vision
              </span>
              <p className="leading-relaxed font-sans font-light text-base opacity-90">{brand.vision}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Positioning Statement Card */}
      <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8 rounded-none space-y-4">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-[#1A1A1A] dark:text-[#F9F7F2]" />
          <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">Strategic Market Positioning</h2>
        </div>
        <p className="font-serif text-lg leading-relaxed italic opacity-80 text-[#1A1A1A] dark:text-[#F9F7F2]">{brand.positioningStatement}</p>
        <div className="pt-4 border-t border-dashed border-[#1A1A1A]/40 dark:border-[#F9F7F2]/20 text-xs flex items-center gap-2 text-[#1A1A1A] dark:text-[#F9F7F2]">
          <span className="text-[9px] uppercase tracking-widest font-bold">Target Audience Profile:</span>
          <span className="font-serif italic">{brand.targetAudience}</span>
        </div>
      </div>

      {/* Brand Personality Matrix */}
      <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8 rounded-none space-y-6">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">Brand Personality Matrix</h2>
          <p className="text-xs mt-2 font-serif italic opacity-70 text-[#1A1A1A] dark:text-[#F9F7F2]">
            Visual spectrum of the brand's core behavioral and aesthetic attributes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
          {brand.personalityTraits.map((item) => (
            <div key={item.trait} className="space-y-4">
              <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">
                <span className="opacity-50">{item.minLabel}</span>
                <span className="text-[#1A1A1A] dark:text-[#F9F7F2] font-black">{item.trait}</span>
                <span className="opacity-50">{item.maxLabel}</span>
              </div>
              <div className="h-[2px] bg-gray-200 dark:bg-zinc-800 relative">
                {/* Tickmarks for reference */}
                <div className="absolute inset-0 flex justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map((tick) => (
                    <div key={tick} className="w-[1px] h-1.5 -top-[2px] bg-gray-300 dark:bg-zinc-700" />
                  ))}
                </div>
                {/* Active slider thumb */}
                <div
                  style={{ left: `${((item.rating - 1) / 4) * 100}%` }}
                  className="absolute w-3.5 h-3.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/50 bg-white dark:bg-zinc-900 -top-[6px] -translate-x-1/2 transition-all duration-500 shadow-sm flex items-center justify-center cursor-default hover:scale-110"
                  title={`Rating: ${item.rating}/5`}
                >
                  <div className="w-1.5 h-1.5 bg-[#1A1A1A] dark:bg-[#F9F7F2]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Values Grid */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] mb-6 flex items-center gap-3">
          <Award className="w-5 h-5" />
          <span>Core Brand Values</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brand.values.map((val, idx) => {
            const IconComponent = ICON_MAP[val.iconName] || Sparkles;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 space-y-4 hover:bg-[#1A1A1A] hover:text-[#F9F7F2] dark:hover:bg-[#F9F7F2] dark:hover:text-[#1A1A1A] text-[#1A1A1A] dark:text-[#F9F7F2] transition-colors duration-300 group rounded-none"
              >
                <div className="w-10 h-10 border border-[#1A1A1A] group-hover:border-[#F9F7F2] dark:border-[#F9F7F2]/30 dark:group-hover:border-[#1A1A1A] flex items-center justify-center rounded-none text-[#1A1A1A] group-hover:text-[#F9F7F2] dark:text-[#F9F7F2] dark:group-hover:text-[#1A1A1A] transition-all duration-300">
                  <IconComponent className="w-5 h-5 transition-colors duration-300" />
                </div>
                <h3 className="text-[10px] uppercase tracking-widest font-bold">{val.title}</h3>
                <p className="text-sm font-serif italic opacity-80 leading-relaxed group-hover:opacity-100">{val.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
