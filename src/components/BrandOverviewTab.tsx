import React, { useState } from 'react';
import { BrandBible } from '../types';
import { AnimatedDottedBorder } from './AnimatedDottedBorder';
import { Target, Compass, Sparkles, Award, Shield, Zap, Heart, Globe, Feather, Layers, Crown, Anchor, Flame, Share2, Check, Cpu, Camera, MapPin, Package, Crosshair, Activity } from 'lucide-react';
import { shareBrandBible } from '../lib/share';

interface BrandOverviewTabProps {
  brand: BrandBible;
  onNavigateToRebrandStory?: () => void;
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

export function BrandOverviewTab({ brand, onNavigateToRebrandStory }: BrandOverviewTabProps) {
  const primaryColor = brand.palette.find(c => c.role === 'Primary' || c.role.toLowerCase().includes('primary'))?.hex || '#1A1A1A';
  const textOnPrimary = brand.palette.find(c => c.role === 'Neutral Light' || c.role.toLowerCase().includes('light'))?.hex || '#F9F7F2';
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [selectedValIdx, setSelectedValIdx] = useState<number | null>(null);

  const handleShare = async () => {
    const res = await shareBrandBible(brand);
    if (res.success) {
      setShareStatus(res.method === 'native-share' ? 'Shared!' : 'Copied Summary!');
      setTimeout(() => setShareStatus(null), 2500);
    }
  };

  return (
    <div className="space-y-8" style={{ "--font-display": `"${brand.typography.headingFont}", "Plus Jakarta Sans", sans-serif`, "--font-sans": `"${brand.typography.bodyFont}", "Inter", sans-serif` } as React.CSSProperties}>
      {/* Rebrand Spotlight Banner */}
      {brand.rebrandStory && (
        <div className="bg-amber-400 text-black p-4 sm:p-5 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-black text-white">
                Rebranded Identity
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">
                {brand.rebrandStory.rebrandTitle}
              </span>
            </div>
            <p className="text-xs text-black/85 font-display max-w-2xl line-clamp-2">
              "{brand.rebrandStory.rebrandBio}"
            </p>
          </div>
          {onNavigateToRebrandStory && (
            <button
              onClick={onNavigateToRebrandStory}
              className="shrink-0 px-3.5 py-1.5 bg-black text-white hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
              id="overview-view-rebrand-btn"
            >
              View Rebrand Story →
            </button>
          )}
        </div>
      )}

      {/* Hero Brand Statement */}
      <div className="p-8 sm:p-12 relative overflow-hidden rounded-xl" style={{ backgroundColor: primaryColor, color: textOnPrimary }}>
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-3 py-1.5 bg-transparent border border-current text-[10px] font-black uppercase tracking-[0.3em]">
                {brand.industry}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">
                Generated {new Date(brand.createdAt).toLocaleDateString()}
              </span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 bg-transparent hover:bg-white hover:text-black text-current border border-current/40 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl cursor-pointer"
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

          <h1 className="text-5xl md:text-7xl font-display font-light tracking-tighter text-current">
            {brand.brandName}
          </h1>

          <p className="text-xl sm:text-2xl font-display opacity-80 border-l-2 border-current/30 pl-6">
            "{brand.tagline}"
          </p>

          <div className="pt-8 border-t border-dashed border-current/20 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
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
      <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-current/20 p-6 sm:p-8 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-[#1A1A1A] dark:text-current" />
          <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-current">Strategic Market Positioning</h2>
        </div>
        <p className="font-display text-lg leading-relaxed italic opacity-80 text-[#1A1A1A] dark:text-current">{brand.positioningStatement}</p>
        <div className="pt-4 border-t border-dashed border-[#1A1A1A]/40 dark:border-current/20 text-xs flex items-center gap-2 text-[#1A1A1A] dark:text-current">
          <span className="text-[9px] uppercase tracking-widest font-bold">Target Audience Profile:</span>
          <span className="font-display">{brand.targetAudience}</span>
        </div>
      </div>

      {/* GABI Director Intelligence Telemetry */}
      {brand.directorMetadata && (
        <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] uppercase tracking-widest font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                Autonomous Director Telemetry
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest bg-amber-400/20 text-amber-600 dark:text-amber-400 font-bold rounded">
                {brand.directorMetadata.powerLevel.toUpperCase()}
              </span>
              <span className="text-[9px] font-mono text-gray-400">
                {brand.directorMetadata.latencyMs}ms latency
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[8px] uppercase tracking-widest font-bold text-gray-400 block">Synthesized By</span>
              <span className="font-mono text-[11px] text-[#1A1A1A] dark:text-[#F9F7F2] font-semibold">
                {brand.directorMetadata.model} ({brand.directorMetadata.provider})
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] uppercase tracking-widest font-bold text-gray-400 block">Routing Rationale</span>
              <span className="text-[10px] text-gray-600 dark:text-zinc-300 line-clamp-2">
                {brand.directorMetadata.routingRationale}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Business Context & Differentiators */}
      {(brand.productsServices || brand.geographicMarket || brand.brandArchetype || brand.competitiveEnvironment) && (
        <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-current/20 p-6 sm:p-8 rounded-xl space-y-5">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#1A1A1A] dark:text-[#F9F7F2]" />
            <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              Strategic Business Intelligence & Market Footprint
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {brand.productsServices && (
              <div className="p-4 bg-gray-50 dark:bg-zinc-900/80 border border-gray-100 dark:border-zinc-800 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-gray-500 text-[8px] uppercase tracking-widest font-bold">
                  <Package className="w-3 h-3" />
                  <span>Core Offerings</span>
                </div>
                <p className="text-xs font-display font-medium text-[#1A1A1A] dark:text-[#F9F7F2]">
                  {brand.productsServices}
                </p>
              </div>
            )}
            {brand.geographicMarket && (
              <div className="p-4 bg-gray-50 dark:bg-zinc-900/80 border border-gray-100 dark:border-zinc-800 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-gray-500 text-[8px] uppercase tracking-widest font-bold">
                  <MapPin className="w-3 h-3" />
                  <span>Geographic Market</span>
                </div>
                <p className="text-xs font-display font-medium text-[#1A1A1A] dark:text-[#F9F7F2]">
                  {brand.geographicMarket}
                </p>
              </div>
            )}
            {brand.brandArchetype && (
              <div className="p-4 bg-gray-50 dark:bg-zinc-900/80 border border-gray-100 dark:border-zinc-800 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-gray-500 text-[8px] uppercase tracking-widest font-bold">
                  <Layers className="w-3 h-3" />
                  <span>Logo Archetype</span>
                </div>
                <p className="text-xs font-display font-medium text-[#1A1A1A] dark:text-[#F9F7F2]">
                  {brand.brandArchetype}
                </p>
              </div>
            )}
            {brand.competitiveEnvironment && (
              <div className="p-4 bg-gray-50 dark:bg-zinc-900/80 border border-gray-100 dark:border-zinc-800 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-gray-500 text-[8px] uppercase tracking-widest font-bold">
                  <Crosshair className="w-3 h-3" />
                  <span>Competitive Landscape</span>
                </div>
                <p className="text-xs font-display font-medium text-[#1A1A1A] dark:text-[#F9F7F2]">
                  {brand.competitiveEnvironment}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Applied Photography & Material Direction */}
      {brand.photographyDirection && (
        <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-current/20 p-6 sm:p-8 rounded-xl space-y-5">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#1A1A1A] dark:text-[#F9F7F2]" />
            <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              Applied Photography & Material Direction
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/80 border border-gray-100 dark:border-zinc-800 rounded-lg space-y-1">
              <span className="text-[8px] uppercase tracking-widest font-bold text-gray-400 block">Lens & Optics</span>
              <p className="text-xs font-sans text-[#1A1A1A] dark:text-[#F9F7F2] font-medium leading-relaxed">
                {brand.photographyDirection.lens}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/80 border border-gray-100 dark:border-zinc-800 rounded-lg space-y-1">
              <span className="text-[8px] uppercase tracking-widest font-bold text-gray-400 block">Lighting Physics</span>
              <p className="text-xs font-sans text-[#1A1A1A] dark:text-[#F9F7F2] font-medium leading-relaxed">
                {brand.photographyDirection.lighting}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/80 border border-gray-100 dark:border-zinc-800 rounded-lg space-y-1">
              <span className="text-[8px] uppercase tracking-widest font-bold text-gray-400 block">Materials & Textures</span>
              <p className="text-xs font-sans text-[#1A1A1A] dark:text-[#F9F7F2] font-medium leading-relaxed">
                {brand.photographyDirection.materials}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/80 border border-gray-100 dark:border-zinc-800 rounded-lg space-y-1">
              <span className="text-[8px] uppercase tracking-widest font-bold text-gray-400 block">Color Grading</span>
              <p className="text-xs font-sans text-[#1A1A1A] dark:text-[#F9F7F2] font-medium leading-relaxed">
                {brand.photographyDirection.colorGrade}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Brand Personality Matrix */}
      <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-current/20 p-6 sm:p-8 rounded-xl space-y-6">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-current">Brand Personality Matrix</h2>
          <p className="text-xs mt-2 font-display opacity-70 text-[#1A1A1A] dark:text-current">
            Visual spectrum of the brand's core behavioral and aesthetic attributes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
          {brand.personalityTraits.map((item) => (
            <div key={item.trait} className="space-y-4">
              <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-current">
                <span className="opacity-50">{item.minLabel}</span>
                <span className="text-[#1A1A1A] dark:text-current font-black">{item.trait}</span>
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
                  className="absolute w-3.5 h-3.5 border border-[#1A1A1A] dark:border-current/50 bg-white dark:bg-zinc-900 -top-[6px] -translate-x-1/2 transition-all duration-500 shadow-sm flex items-center justify-center cursor-default hover:scale-110"
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
        <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-current mb-6 flex items-center gap-3">
          <Award className="w-5 h-5" />
          <span>Core Brand Values</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brand.values.map((val, idx) => {
            const IconComponent = ICON_MAP[val.iconName] || Sparkles;
            const isSelected = selectedValIdx === idx;
            return (
              <AnimatedDottedBorder
                key={idx}
                isActive={isSelected}
                onClick={() => setSelectedValIdx(isSelected ? null : idx)}
                label={isSelected ? 'Active Value' : undefined}
                className="bg-white dark:bg-[#1C1C1A] p-6 space-y-4 text-[#1A1A1A] dark:text-current transition-colors duration-300 group rounded-xl h-full shadow-xs"
              >
                <div className="w-10 h-10 border border-[#1A1A1A] group-hover:border-current dark:border-current/30 dark:group-hover:border-[#1A1A1A] flex items-center justify-center rounded-xl text-[#1A1A1A] group-hover:text-current dark:text-current dark:group-hover:text-black transition-all duration-300">
                  <IconComponent className="w-5 h-5 transition-colors duration-300" />
                </div>
                <h3 className="text-[10px] uppercase tracking-widest font-bold">{val.title}</h3>
                <p className="text-sm font-display opacity-80 leading-relaxed group-hover:opacity-100">{val.description}</p>
              </AnimatedDottedBorder>
            );
          })}
        </div>
      </div>
    </div>
  );
}
