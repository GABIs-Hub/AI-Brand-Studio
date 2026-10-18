import React from 'react';
import { BrandBible } from '../types';
import { Bot, Sparkles, MessageSquare, X } from 'lucide-react';

interface FloatingAiDirectorProps {
  brand: BrandBible | null;
  isOpen: boolean;
  onToggle: () => void;
}

export function FloatingAiDirector({
  brand,
  isOpen,
  onToggle,
}: FloatingAiDirectorProps) {
  // Only active and visible when a brand has been created and is active
  if (!brand) return null;

  return (
    <div
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center pointer-events-auto"
      id="floating-ai-director-container"
    >
      <button
        type="button"
        onClick={onToggle}
        className={`group relative flex items-center justify-center w-12 h-12 rounded-full border shadow-xl transition-all duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 ${
          isOpen
            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:border-[#F9F7F2] scale-95'
            : 'bg-[#1A1A1A] text-white hover:bg-black hover:scale-105 dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:hover:bg-white border-[#1A1A1A] dark:border-[#F9F7F2]'
        }`}
        title={isOpen ? 'Close AI Brand Director' : `Open AI Brand Director (${brand.brandName})`}
        aria-label="Toggle AI Brand Director"
        id="floating-ai-director-btn"
      >
        {isOpen ? (
          <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
        ) : (
          <Bot className="w-5 h-5 text-amber-400 dark:text-amber-600 transition-transform group-hover:scale-110" />
        )}

        {/* Live Active Status Indicator Dot */}
        {!isOpen && (
          <span
            className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#1A1A1A] dark:ring-[#F9F7F2] animate-pulse"
            aria-hidden="true"
          />
        )}

        {/* Subtle Accessible Hover Tooltip */}
        <span className="pointer-events-none absolute right-14 whitespace-nowrap bg-[#1A1A1A] dark:bg-[#F9F7F2] text-white dark:text-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150">
          AI Director
        </span>
      </button>
    </div>
  );
}
