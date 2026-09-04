import React, { useState, useEffect } from 'react';
import { BrandBible } from '../types';
import { sanitizeSvg } from '../utils/sanitizeSvg';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Shield,
  Palette,
  Type,
  Monitor,
  Award,
  Check,
  AlertOctagon,
  Copy,
  Download,
  Share2,
} from 'lucide-react';
import { getContrastRatio, getWcagLevel } from './ColorAccessibilityMatrix';

interface BrandDeckPresentationModalProps {
  brand: BrandBible | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BrandDeckPresentationModal({
  brand,
  isOpen,
  onClose,
}: BrandDeckPresentationModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !brand) return null;

  const primaryColor = brand.palette[0]?.hex || '#1E40AF';
  const darkColor = brand.palette.find((c) => c.role.includes('Dark'))?.hex || '#111827';
  const lightColor = brand.palette.find((c) => c.role.includes('Light'))?.hex || '#F9F7F2';
  const headingFont = brand.typography.headingFont;
  const bodyFont = brand.typography.bodyFont;

  const slides = [
    {
      id: 'cover',
      title: 'Brand Title & Overview',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 sm:p-16 relative overflow-hidden bg-[#F9F7F2] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F9F7F2]">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 dark:border-[#F9F7F2]/20 pb-4">
            <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-60">
              Brand Identity Presentation &bull; {brand.industry}
            </span>
            <span className="text-[10px] font-mono opacity-50 font-bold">
              CONFIDENTIAL &bull; {new Date().getFullYear()}
            </span>
          </div>

          <div className="my-auto max-w-3xl space-y-6">
            <span
              className="text-xs uppercase tracking-[0.3em] font-black px-3 py-1 bg-black text-white dark:bg-white dark:text-black inline-block"
            >
              Official Brand Bible
            </span>
            <h1
              className="text-5xl sm:text-7xl font-light tracking-tighter"
              style={{ fontFamily: `"${headingFont}", serif` }}
            >
              {brand.brandName}
            </h1>
            <p className="text-xl sm:text-2xl font-serif italic opacity-85 leading-relaxed">
              &ldquo;{brand.tagline}&rdquo;
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#1A1A1A]/20 dark:border-[#F9F7F2]/20 text-xs opacity-75">
            <div>
              <span className="font-bold block">Strategic Positioning:</span>
              <span className="truncate max-w-md block font-serif italic">{brand.positioningStatement}</span>
            </div>
            <div className="flex items-center gap-2">
              {brand.palette.map((c) => (
                <div
                  key={'cover-dot-' + c.hex}
                  className="w-4 h-4 rounded-full border border-black/10"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'manifesto',
      title: 'Mission, Vision & Core Values',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 sm:p-16 bg-[#FAF9F6] dark:bg-[#161614] text-[#1A1A1A] dark:text-[#F9F7F2]">
          <div className="border-b border-[#1A1A1A]/20 dark:border-[#F9F7F2]/20 pb-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">
              01 &bull; Strategic Foundation
            </span>
            <h2 className="text-3xl font-light tracking-tight mt-1" style={{ fontFamily: `"${headingFont}", serif` }}>
              Brand Purpose &amp; Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto">
            <div className="space-y-6">
              <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 shadow-sm">
                <span className="text-[9px] uppercase tracking-widest font-black opacity-50 block mb-2">
                  Mission Statement
                </span>
                <p className="text-sm sm:text-base leading-relaxed opacity-90 font-serif italic">
                  {brand.mission}
                </p>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 shadow-sm">
                <span className="text-[9px] uppercase tracking-widest font-black opacity-50 block mb-2">
                  Long-Term Vision
                </span>
                <p className="text-sm sm:text-base leading-relaxed opacity-90">
                  {brand.vision}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest font-black opacity-60 block mb-1">
                Guiding Brand Values
              </span>
              {brand.values.map((v, i) => (
                <div
                  key={'val-' + i}
                  className="p-4 bg-white dark:bg-zinc-900 border-l-4 border-gray-300 dark:border-gray-300 dark:border-zinc-700 shadow-xs"
                  style={{ borderLeftColor: brand.palette[i % brand.palette.length]?.hex || primaryColor }}
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ fontFamily: `"${headingFont}", serif` }}>
                    {v.title}
                  </h4>
                  <p className="text-[11px] opacity-80 leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] opacity-50 font-mono pt-4 border-t border-[#1A1A1A]/10 dark:border-[#F9F7F2]/10">
            {brand.brandName} &bull; Voice: {brand.toneOfVoice?.[0]?.trait || 'Authoritative & Inspiring'}
          </div>
        </div>
      ),
    },
    {
      id: 'logo',
      title: 'Vector Logomark & Construction',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 sm:p-16 bg-[#FAF9F6] dark:bg-[#161614] text-[#1A1A1A] dark:text-[#F9F7F2]">
          <div className="border-b border-[#1A1A1A]/20 dark:border-[#F9F7F2]/20 pb-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">
              02 &bull; Visual Identity
            </span>
            <h2 className="text-3xl font-light tracking-tight mt-1" style={{ fontFamily: `"${headingFont}", serif` }}>
              Primary Vector Mark &amp; Construction
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto">
            <div className="md:col-span-6 flex items-center justify-center p-12 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-gray-300 dark:border-zinc-700 shadow-xl">
              <div
                className="w-48 h-48 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.logo.primaryLogoSvg) }}
              />
            </div>

            <div className="md:col-span-6 space-y-4">
              <div className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                <span className="text-[9px] uppercase tracking-widest font-black opacity-50 block mb-1">
                  Design Concept
                </span>
                <p className="text-xs leading-relaxed opacity-90">{brand.logo.concept}</p>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                <span className="text-[9px] uppercase tracking-widest font-black opacity-50 block mb-1">
                  Symbolism &amp; Rationale
                </span>
                <p className="text-xs leading-relaxed opacity-90 font-serif italic">{brand.logo.symbolism}</p>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                <span className="text-[9px] uppercase tracking-widest font-black opacity-50 block mb-1">
                  Geometric Precision
                </span>
                <p className="text-xs leading-relaxed opacity-90 font-mono text-[11px]">{brand.logo.geometryDetails}</p>
              </div>
            </div>
          </div>

          <div className="text-[10px] opacity-50 font-mono pt-4 border-t border-[#1A1A1A]/10 dark:border-[#F9F7F2]/10">
            Vector Mark &bull; Scalable SVG Architecture
          </div>
        </div>
      ),
    },
    {
      id: 'palette',
      title: '5-Color Palette & WCAG Passes',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 sm:p-16 bg-[#FAF9F6] dark:bg-[#161614] text-[#1A1A1A] dark:text-[#F9F7F2]">
          <div className="border-b border-[#1A1A1A]/20 dark:border-[#F9F7F2]/20 pb-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">
              03 &bull; Color System
            </span>
            <h2 className="text-3xl font-light tracking-tight mt-1" style={{ fontFamily: `"${headingFont}", serif` }}>
              5-Color Palette &amp; Contrast Audits
            </h2>
          </div>

          <div className="space-y-6 my-auto">
            {/* Color Swatch Strips */}
            <div className="grid grid-cols-5 gap-3">
              {brand.palette.map((c) => {
                const ratioOnWhite = getContrastRatio(c.hex, '#FFFFFF');
                const ratioOnBlack = getContrastRatio(c.hex, '#0F172A');
                const wcagWhite = getWcagLevel(ratioOnWhite);

                return (
                  <div
                    key={'slide-color-' + c.role}
                    className="p-4 flex flex-col justify-between min-h-[160px] border border-black/10 shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] font-mono uppercase font-black px-1.5 py-0.5 bg-white/90 text-black">
                        {c.role.split(' ')[0]}
                      </span>
                    </div>

                    <div className="p-2 bg-black/70 text-white rounded-xs">
                      <span className="text-xs font-bold block">{c.name}</span>
                      <span className="text-[9px] font-mono block opacity-80">{c.hex}</span>
                      <span className="text-[7px] font-mono block mt-1 text-emerald-400">
                        {wcagWhite.normalText} vs W
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Semantic Role Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                <span className="text-[9px] uppercase tracking-widest font-black opacity-50 block">Dominant (60%)</span>
                <p className="text-xs mt-1 font-bold">{brand.palette[0]?.name} ({brand.palette[0]?.hex})</p>
                <p className="text-[11px] opacity-75 mt-0.5">{brand.palette[0]?.usage}</p>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                <span className="text-[9px] uppercase tracking-widest font-black opacity-50 block">Structural (30%)</span>
                <p className="text-xs mt-1 font-bold">{brand.palette[1]?.name} ({brand.palette[1]?.hex})</p>
                <p className="text-[11px] opacity-75 mt-0.5">{brand.palette[1]?.usage}</p>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                <span className="text-[9px] uppercase tracking-widest font-black opacity-50 block">Accent Focus (10%)</span>
                <p className="text-xs mt-1 font-bold">{brand.palette[2]?.name} ({brand.palette[2]?.hex})</p>
                <p className="text-[11px] opacity-75 mt-0.5">{brand.palette[2]?.usage}</p>
              </div>
            </div>
          </div>

          <div className="text-[10px] opacity-50 font-mono pt-4 border-t border-[#1A1A1A]/10 dark:border-[#F9F7F2]/10">
            Color System &bull; WCAG 2.1 Contrast Passes
          </div>
        </div>
      ),
    },
    {
      id: 'typography',
      title: 'Typography & Live Hierarchy',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 sm:p-16 bg-[#FAF9F6] dark:bg-[#161614] text-[#1A1A1A] dark:text-[#F9F7F2]">
          <div className="border-b border-[#1A1A1A]/20 dark:border-[#F9F7F2]/20 pb-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">
              04 &bull; Editorial Typography
            </span>
            <h2 className="text-3xl font-light tracking-tight mt-1" style={{ fontFamily: `"${headingFont}", serif` }}>
              Type Hierarchy &amp; Specimen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto">
            <div className="p-6 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-gray-300 dark:border-zinc-700 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest font-black opacity-60">Primary Display Font</span>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 font-bold">
                  {brand.typography.headingFontCategory}
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: `"${headingFont}", serif` }}>
                {headingFont}
              </h3>
              <p className="text-xs opacity-75 font-mono">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789 (!@#$%&amp;*)
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-gray-300 dark:border-zinc-700 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest font-black opacity-60">Body Text Font</span>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 font-bold">
                  {brand.typography.bodyFontCategory}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: `"${bodyFont}", sans-serif` }}>
                {bodyFont}
              </h3>
              <p className="text-xs opacity-85 leading-relaxed" style={{ fontFamily: `"${bodyFont}", sans-serif` }}>
                Designed for optimal baseline readability and comfortable multi-paragraph reading across high-density mobile interfaces and desktop web platforms.
              </p>
            </div>
          </div>

          <div className="text-[10px] opacity-50 font-mono pt-4 border-t border-[#1A1A1A]/10 dark:border-[#F9F7F2]/10">
            Typography System &bull; Google Fonts Active Link
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200"
      id="brand-presentation-deck-modal"
    >
      {/* Top Deck Control Bar */}
      <div className="p-4 sm:px-8 bg-black/60 border-b border-white/10 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-black block">
              Presentation Deck &bull; {brand.brandName}
            </span>
            <span className="text-[10px] text-gray-400 font-serif italic">
              Slide {currentSlide + 1} of {slides.length}: {slides[currentSlide].title}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1 text-[9px] font-mono text-gray-400 mr-2">
            <span className="px-1.5 py-0.5 bg-white/10 rounded-xs">&larr; / &rarr; Navigate</span>
            <span className="px-1.5 py-0.5 bg-white/10 rounded-xs">ESC Exit</span>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer"
            title="Exit Presentation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Stage Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex items-center justify-center overflow-hidden">
        <div className="w-full h-full max-h-[750px] shadow-2xl border-2 border-white/20 overflow-hidden flex flex-col">
          {slides[currentSlide].render()}
        </div>
      </div>

      {/* Bottom Deck Navigation Bar */}
      <div className="p-4 sm:px-8 bg-black/60 border-t border-white/10 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={'dot-nav-' + s.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 transition-all cursor-pointer ${
                currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              title={`Jump to ${s.title}`}
            />
          ))}
        </div>

        <span className="hidden sm:block text-[9px] uppercase tracking-[0.3em] font-bold opacity-50 font-serif italic whitespace-nowrap">
          Created with GABI
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-black disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer shadow-md font-black"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
