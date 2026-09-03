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
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 pointer-events-auto"
      id="floating-ai-director-container"
    >
      <button
        type="button"
        onClick={onToggle}
        className={`group flex items-center gap-2.5 p-2.5 sm:px-4 sm:py-3 border shadow-2xl transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:border-[#F9F7F2]'
            : 'bg-[#1A1A1A] text-white hover:bg-black dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:hover:bg-white border-[#1A1A1A] dark:border-[#F9F7F2]'
        }`}
        title={isOpen ? 'Close AI Brand Director' : 'Open AI Brand Director Co-Pilot'}
        aria-label="Toggle AI Brand Director"
        id="floating-ai-director-btn"
      >
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          ) : (
            <Bot className="w-4 h-4 text-amber-400 dark:text-amber-600 group-hover:scale-110 transition-transform" />
          )}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse ring-2 ring-black dark:ring-white" />
          )}
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.25em] font-black leading-none">
              AI Director
            </span>
            <span className="hidden md:inline-block px-1 py-0.2 text-[7px] font-mono uppercase bg-white/20 dark:bg-black/10 text-white dark:text-black font-bold">
              Gemini
            </span>
          </div>
          {brand && !isOpen && (
            <span className="hidden sm:inline-block text-[8px] opacity-75 font-serif italic truncate max-w-[130px] leading-tight mt-0.5">
              {brand.brandName}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
