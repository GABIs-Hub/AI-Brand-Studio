import React, { useState } from 'react';
import { SAMPLE_PRESETS } from '../data/presets';
import { GenerateBrandRequest, SamplePreset } from '../types';
import { Sparkles, Wand2, Compass, ArrowRight, CheckCircle2, Headphones, Leaf, TrendingUp, Coffee, RefreshCw } from 'lucide-react';

interface BrandInputFormProps {
  onGenerate: (req: GenerateBrandRequest) => void;
  isLoading: boolean;
  loadingStep?: string;
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

const PRESET_ICONS: Record<string, React.ReactNode> = {
  Headphones: <Headphones className="w-5 h-5 text-indigo-600" />,
  Leaf: <Leaf className="w-5 h-5 text-emerald-600" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-blue-600" />,
  Coffee: <Coffee className="w-5 h-5 text-amber-600" />,
};

export function BrandInputForm({ onGenerate, isLoading, loadingStep }: BrandInputFormProps) {
  const [brandName, setBrandName] = useState('');
  const [mission, setMission] = useState('');
  const [industry, setIndustry] = useState('');
  const [aesthetic, setAesthetic] = useState('Modern & Minimalist');
  const [targetAudience, setTargetAudience] = useState('');

  const handleSelectPreset = (preset: SamplePreset) => {
    setBrandName(preset.name);
    setMission(preset.mission);
    setIndustry(preset.industry);
    setAesthetic(preset.aesthetic);
    setTargetAudience(preset.targetAudience);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission.trim()) return;
    onGenerate({
      brandName: brandName.trim() || undefined,
      mission: mission.trim(),
      industry: industry.trim() || undefined,
      aesthetic,
      targetAudience: targetAudience.trim() || undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Intro Heading */}
      <div className="mb-10 flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-50 mb-4">AI-Powered Brand Director</span>
        <h1 className="text-4xl sm:text-5xl font-serif italic font-light tracking-tighter text-[#1A1A1A]">
          Generate a Complete Brand Bible
        </h1>
        <p className="mt-6 text-lg font-serif italic opacity-80 max-w-2xl leading-relaxed">
          Describe your company mission and vision. AI will craft a full design system containing primary logos, secondary marks, 5-color palette, Google Font pairings, tone of voice, and live mockups.
        </p>
      </div>

      {/* Preset Inspiration Cards */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A]">
            Sample Brand Briefs
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectPreset(preset)}
              className="p-4 border border-[#1A1A1A] bg-white hover:bg-[#1A1A1A] hover:text-white transition-all text-left group flex flex-col justify-between rounded-none"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                    {preset.aesthetic.split(' ')[0]}
                  </span>
                </div>
                <h3 className="font-serif italic text-xl group-hover:text-white transition-colors">
                  {preset.name}
                </h3>
                <p className="text-xs opacity-70 line-clamp-2 mt-2 leading-normal">
                  {preset.mission}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-dashed border-current text-[9px] uppercase tracking-widest font-bold flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                <span>Use brief</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Input Form Card */}
      <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 rounded-none">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mission Input */}
          <div>
            <label htmlFor="mission-input" className="block text-[11px] uppercase tracking-[0.3em] font-black mb-3 text-[#1A1A1A]">
              Company Mission & Core Purpose <span className="opacity-50">*</span>
            </label>
            <textarea
              id="mission-input"
              required
              rows={4}
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="Describe what your company does..."
              className="w-full rounded-none border border-[#1A1A1A] bg-transparent px-4 py-3 text-[#1A1A1A] placeholder-gray-400 text-sm focus:ring-1 focus:ring-[#1A1A1A] focus:outline-hidden transition-all font-serif italic"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Brand Name (Optional) */}
            <div>
              <label htmlFor="brand-name-input" className="block text-[9px] uppercase tracking-widest font-bold mb-2 text-[#1A1A1A]">
                Brand Name <span className="opacity-50 font-normal">(Optional)</span>
              </label>
              <input
                id="brand-name-input"
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Lumina Audio"
                className="w-full rounded-none border border-[#1A1A1A] bg-transparent px-3.5 py-2.5 text-[#1A1A1A] text-sm focus:ring-1 focus:ring-[#1A1A1A] focus:outline-hidden transition-all"
              />
            </div>

            {/* Industry / Category */}
            <div>
              <label htmlFor="industry-input" className="block text-[9px] uppercase tracking-widest font-bold mb-2 text-[#1A1A1A]">
                Industry / Category <span className="opacity-50 font-normal">(Optional)</span>
              </label>
              <input
                id="industry-input"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Clean Energy"
                className="w-full rounded-none border border-[#1A1A1A] bg-transparent px-3.5 py-2.5 text-[#1A1A1A] text-sm focus:ring-1 focus:ring-[#1A1A1A] focus:outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Aesthetic Vibe Selector */}
          <div>
            <label className="block text-[9px] uppercase tracking-widest font-bold mb-3 text-[#1A1A1A]">
              Aesthetic Vibe & Personality
            </label>
            <div className="flex flex-wrap gap-3">
              {AESTHETIC_VIBES.map((vibe) => (
                <button
                  key={vibe}
                  type="button"
                  onClick={() => setAesthetic(vibe)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all border border-[#1A1A1A] rounded-none ${
                    aesthetic === vibe
                      ? 'bg-[#1A1A1A] text-white'
                      : 'bg-transparent text-[#1A1A1A] hover:bg-gray-100'
                  }`}
                >
                  {vibe}
                </button>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label htmlFor="audience-input" className="block text-[9px] uppercase tracking-widest font-bold mb-2 text-[#1A1A1A]">
              Target Audience <span className="opacity-50 font-normal">(Optional)</span>
            </label>
            <input
              id="audience-input"
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Eco-conscious urban professionals"
              className="w-full rounded-none border border-[#1A1A1A] bg-transparent px-3.5 py-2.5 text-[#1A1A1A] text-sm focus:ring-1 focus:ring-[#1A1A1A] focus:outline-hidden transition-all"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !mission.trim()}
              className="w-full py-5 px-6 rounded-none border border-[#1A1A1A] bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.3em] font-black hover:bg-[#2C3333] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || 'Synthesizing Dossier...'}</span>
                </>
              ) : (
                <>
                  <span>Generate Brand Dossier</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
