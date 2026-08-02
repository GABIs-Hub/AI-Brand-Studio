import React from 'react';
import { BrandBible } from '../types';
import { Target, Compass, Sparkles, Award, Shield, Zap, Heart, Globe, Feather, Layers, Crown, Anchor, Flame } from 'lucide-react';

interface BrandOverviewTabProps {
  brand: BrandBible;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Shield: <Shield className="w-5 h-5 text-indigo-600" />,
  Zap: <Zap className="w-5 h-5 text-indigo-600" />,
  Sparkles: <Sparkles className="w-5 h-5 text-indigo-600" />,
  Heart: <Heart className="w-5 h-5 text-indigo-600" />,
  Globe: <Globe className="w-5 h-5 text-indigo-600" />,
  Target: <Target className="w-5 h-5 text-indigo-600" />,
  Feather: <Feather className="w-5 h-5 text-indigo-600" />,
  Compass: <Compass className="w-5 h-5 text-indigo-600" />,
  Layers: <Layers className="w-5 h-5 text-indigo-600" />,
  Crown: <Crown className="w-5 h-5 text-indigo-600" />,
  Anchor: <Anchor className="w-5 h-5 text-indigo-600" />,
  Flame: <Flame className="w-5 h-5 text-indigo-600" />,
};

export function BrandOverviewTab({ brand }: BrandOverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Hero Brand Statement */}
      <div className="bg-[#1A1A1A] p-8 sm:p-12 text-[#F9F7F2] border border-[#1A1A1A] relative overflow-hidden rounded-none">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="px-3 py-1.5 bg-transparent border border-[#F9F7F2] text-[10px] font-black uppercase tracking-[0.3em]">
              {brand.industry}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">
              Generated {new Date(brand.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif italic font-light tracking-tighter">
            {brand.brandName}
          </h1>

          <p className="text-xl sm:text-2xl font-serif italic opacity-80 border-l-2 border-[#F9F7F2] pl-6">
            "{brand.tagline}"
          </p>

          <div className="pt-8 border-t border-dashed border-[#F9F7F2]/40 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
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
      <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 rounded-none space-y-4">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-[#1A1A1A]" />
          <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A]">Strategic Market Positioning</h2>
        </div>
        <p className="font-serif text-lg leading-relaxed italic opacity-80">{brand.positioningStatement}</p>
        <div className="pt-4 border-t border-dashed border-[#1A1A1A]/40 text-xs flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-widest font-bold">Target Audience Profile:</span>
          <span className="font-serif italic">{brand.targetAudience}</span>
        </div>
      </div>

      {/* Brand Personality Matrix */}
      <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 rounded-none space-y-6">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A]">Brand Personality Matrix</h2>
          <p className="text-xs mt-2 font-serif italic opacity-70">
            Visual spectrum of the brand's core behavioral and aesthetic attributes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
          {brand.personalityTraits.map((item) => (
            <div key={item.trait} className="space-y-3">
              <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold">
                <span className="opacity-50">{item.minLabel}</span>
                <span className="text-[#1A1A1A]">{item.trait}</span>
                <span className="opacity-50">{item.maxLabel}</span>
              </div>
              <div className="h-[2px] bg-gray-200 relative">
                <div
                  style={{ width: `${(item.rating / 5) * 100}%` }}
                  className="absolute h-[6px] -top-[2px] left-0 bg-[#1A1A1A] transition-all duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Values Grid */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] mb-6 flex items-center gap-3">
          <Award className="w-5 h-5" />
          <span>Core Brand Values</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brand.values.map((val, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#1A1A1A] p-6 space-y-4 hover:bg-[#1A1A1A] hover:text-white transition-colors group rounded-none"
            >
              <div className="w-10 h-10 border border-[#1A1A1A] group-hover:border-white flex items-center justify-center rounded-none text-[#1A1A1A] group-hover:text-white transition-colors">
                {ICON_MAP[val.iconName] || <Sparkles className="w-5 h-5" />}
              </div>
              <h3 className="text-[10px] uppercase tracking-widest font-bold">{val.title}</h3>
              <p className="text-sm font-serif italic opacity-80 leading-relaxed group-hover:opacity-100">{val.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
