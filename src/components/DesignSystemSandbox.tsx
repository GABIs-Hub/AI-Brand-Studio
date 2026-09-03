import React, { useState } from 'react';
import { BrandBible } from '../types';
import {
  Sparkles,
  Layers,
  Check,
  Copy,
  Sliders,
  Bell,
  Search,
  ChevronRight,
  ShieldCheck,
  Star,
  Zap,
  ArrowRight,
  ExternalLink,
  Sun,
  Moon,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle2,
  Info,
  Smartphone,
  Monitor,
} from 'lucide-react';

interface DesignSystemSandboxProps {
  brand: BrandBible;
}

export function DesignSystemSandbox({ brand }: DesignSystemSandboxProps) {
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light');
  const [buttonState, setButtonState] = useState<'default' | 'loading' | 'disabled'>('default');
  const [toggleActive, setToggleActive] = useState(true);
  const [inputValue, setInputValue] = useState('Design Systems & Brand Tokens');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Extract brand colors
  const primaryColor = brand.palette.find((c) => c.role.toLowerCase().includes('primary'))?.hex || '#1E40AF';
  const secondaryColor = brand.palette.find((c) => c.role.toLowerCase().includes('secondary'))?.hex || '#3B82F6';
  const accentColor = brand.palette.find((c) => c.role.toLowerCase().includes('accent'))?.hex || '#F59E0B';
  const darkColor = brand.palette.find((c) => c.role.toLowerCase().includes('dark'))?.hex || '#111827';
  const lightColor = brand.palette.find((c) => c.role.toLowerCase().includes('light'))?.hex || '#F9F7F2';

  const headingFont = brand.typography.headingFont;
  const bodyFont = brand.typography.bodyFont;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(label);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-8" id="design-system-sandbox">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <h2 className="text-xs uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              Interactive UI Component &amp; Design System Sandbox
            </h2>
          </div>
          <p className="text-sm font-serif italic text-gray-600 dark:text-gray-400 mt-1">
            Real-time interactive component library styled dynamically with {brand.brandName}&apos;s typography, semantic color hierarchy, and border geometry.
          </p>
        </div>

        {/* Sandbox Theme Switcher */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 p-1 border border-gray-300 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setActiveTheme('light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
              activeTheme === 'light'
                ? 'bg-white text-black shadow-xs'
                : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>Light Stage</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTheme('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
              activeTheme === 'dark'
                ? 'bg-black text-white shadow-xs'
                : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>Dark Stage</span>
          </button>
        </div>
      </div>

      {/* Sandbox Stage Area */}
      <div
        className={`p-6 sm:p-10 border-2 border-[#1A1A1A] dark:border-zinc-700 shadow-2xl transition-colors duration-300 ${
          activeTheme === 'light' ? 'bg-[#FAFAF9] text-[#1A1A1A]' : 'bg-[#121212] text-[#F9F7F2]'
        }`}
        style={{ fontFamily: `"${bodyFont}", sans-serif` }}
      >
        <div className="space-y-12">
          {/* 1. Buttons & Action Elements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-zinc-800 pb-2">
              <span
                className="text-[10px] uppercase tracking-[0.25em] font-black opacity-60"
                style={{ fontFamily: `"${headingFont}", serif` }}
              >
                01 &bull; Button &amp; Action Hierarchy
              </span>
              <span className="text-[9px] font-mono opacity-50">Interactive States</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Primary Solid Button */}
              <button
                type="button"
                style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Primary Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Secondary Button */}
              <button
                type="button"
                style={{ backgroundColor: secondaryColor, color: '#FFFFFF' }}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95 shadow-xs cursor-pointer"
              >
                <span>Secondary</span>
              </button>

              {/* Accent Button */}
              <button
                type="button"
                style={{ backgroundColor: accentColor, color: '#000000' }}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all hover:brightness-105 active:scale-95 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Featured Action</span>
              </button>

              {/* Outline Button */}
              <button
                type="button"
                style={{ borderColor: primaryColor, color: primaryColor }}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-2 transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
              >
                <span>Outline Action</span>
              </button>

              {/* Ghost / Text Button */}
              <button
                type="button"
                style={{ color: primaryColor }}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Text Link</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 2. Badges, Pills & Indicators */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-zinc-800 pb-2">
              <span
                className="text-[10px] uppercase tracking-[0.25em] font-black opacity-60"
                style={{ fontFamily: `"${headingFont}", serif` }}
              >
                02 &bull; Badges, Tags &amp; Status Indicators
              </span>
              <span className="text-[9px] font-mono opacity-50">Semantic Chips</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span
                style={{ backgroundColor: primaryColor + '20', color: primaryColor, borderColor: primaryColor + '40' }}
                className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border"
              >
                {brand.brandName} Verified
              </span>
              <span
                style={{ backgroundColor: secondaryColor + '20', color: secondaryColor, borderColor: secondaryColor + '40' }}
                className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1"
              >
                <Star className="w-3 h-3 fill-current" />
                <span>Pro Tier</span>
              </span>
              <span
                style={{ backgroundColor: accentColor + '30', color: activeTheme === 'light' ? '#92400E' : '#FDE68A', borderColor: accentColor + '60' }}
                className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border"
              >
                New Feature
              </span>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Operational</span>
              </span>
            </div>
          </div>

          {/* 3. Form Inputs & Interactive Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-zinc-800 pb-2">
              <span
                className="text-[10px] uppercase tracking-[0.25em] font-black opacity-60"
                style={{ fontFamily: `"${headingFont}", serif` }}
              >
                03 &bull; Form Fields &amp; Input Controls
              </span>
              <span className="text-[9px] font-mono opacity-50">Data Entry</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5 opacity-80">
                  Search &amp; Text Input
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-3 pl-10 text-xs border-2 bg-transparent focus:outline-hidden transition-colors"
                    style={{ borderColor: primaryColor }}
                  />
                  <Search className="w-4 h-4 absolute left-3 top-3.5 opacity-50" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5 opacity-80">
                  Interactive Toggle Switch
                </label>
                <div className="flex items-center justify-between p-2.5 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Auto-Sync Brand System</span>
                    <span className="text-[10px] opacity-60">Push tokens directly to frontend repository</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToggleActive(!toggleActive)}
                    className="cursor-pointer transition-transform"
                  >
                    {toggleActive ? (
                      <ToggleRight className="w-8 h-8" style={{ color: primaryColor }} />
                    ) : (
                      <ToggleLeft className="w-8 h-8 opacity-40" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Notification & Alert Banners */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-zinc-800 pb-2">
              <span
                className="text-[10px] uppercase tracking-[0.25em] font-black opacity-60"
                style={{ fontFamily: `"${headingFont}", serif` }}
              >
                04 &bull; Feedback &amp; System Banners
              </span>
              <span className="text-[9px] font-mono opacity-50">Alerts</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="p-4 border-l-4 flex items-start gap-3 bg-white dark:bg-zinc-900 shadow-xs"
                style={{ borderLeftColor: primaryColor }}
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                <div>
                  <h4 className="text-xs font-bold" style={{ fontFamily: `"${headingFont}", serif` }}>
                    Brand Design Token Deployed
                  </h4>
                  <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">
                    All components are currently utilizing <strong>{headingFont}</strong> and <strong>{bodyFont}</strong> with strict color tokens.
                  </p>
                </div>
              </div>

              <div
                className="p-4 border-l-4 flex items-start gap-3 bg-white dark:bg-zinc-900 shadow-xs"
                style={{ borderLeftColor: accentColor }}
              >
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentColor }} />
                <div>
                  <h4 className="text-xs font-bold" style={{ fontFamily: `"${headingFont}", serif` }}>
                    Strategic Positioning
                  </h4>
                  <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed truncate max-w-sm">
                    &ldquo;{brand.positioningStatement}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Product & Pricing Showcase Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-zinc-800 pb-2">
              <span
                className="text-[10px] uppercase tracking-[0.25em] font-black opacity-60"
                style={{ fontFamily: `"${headingFont}", serif` }}
              >
                05 &bull; Rich Product Card Component
              </span>
              <span className="text-[9px] font-mono opacity-50">Composite Card</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 shadow-lg flex flex-col justify-between space-y-6">
                <div>
                  <span
                    className="text-[9px] font-mono font-bold uppercase tracking-widest block mb-2"
                    style={{ color: primaryColor }}
                  >
                    Core Edition
                  </span>
                  <h3
                    className="text-2xl font-bold tracking-tight mb-2"
                    style={{ fontFamily: `"${headingFont}", serif` }}
                  >
                    {brand.brandName} Studio
                  </h3>
                  <p className="text-xs opacity-80 leading-relaxed">
                    {brand.tagline}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-xs">
                    <Check className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span>Complete 5-Color Semantic Palette</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span>Google Font Pairings Loaded</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Check className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span>Direct Vector Logomark Exports</span>
                  </div>
                </div>

                <button
                  type="button"
                  style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                  className="w-full py-3 text-xs font-bold uppercase tracking-widest text-center shadow-md hover:brightness-110 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </div>

              {/* Brand Manifesto Feature Card */}
              <div className="md:col-span-2 p-6 sm:p-8 bg-white dark:bg-zinc-900 border-2 border-[#1A1A1A] dark:border-zinc-700 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-[9px] uppercase tracking-[0.3em] font-black opacity-60"
                      style={{ color: primaryColor }}
                    >
                      Featured Case Study
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 font-bold">
                      {brand.industry}
                    </span>
                  </div>

                  <h3
                    className="text-2xl sm:text-3xl font-bold tracking-tight mb-4"
                    style={{ fontFamily: `"${headingFont}", serif` }}
                  >
                    Empowering the future of {brand.industry.toLowerCase()} through deliberate design.
                  </h3>

                  <p className="text-xs sm:text-sm opacity-85 leading-relaxed max-w-xl mb-6">
                    {brand.mission}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center font-bold text-white shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {brand.brandName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{brand.brandName} Systems</span>
                      <span className="text-[10px] opacity-60 block font-serif italic">{brand.toneOfVoice?.[0]?.trait || brand.industry}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(brand.mission, 'Mission')}
                      className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border border-gray-300 dark:border-zinc-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedToken === 'Mission' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Text</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
