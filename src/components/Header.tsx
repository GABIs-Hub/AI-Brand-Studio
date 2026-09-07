import React, { useState, useEffect, useRef } from 'react';
import { BrandBible } from '../types';
import {
  Sparkles,
  Bookmark,
  Download,
  MessageSquarePlus,
  Plus,
  Compass,
  Sun,
  Moon,
  LogOut,
  Share2,
  Check,
  User as UserIcon,
  Settings,
  FolderHeart,
  Menu,
  X,
  Bot,
  Sliders,
  Layers,
  ArrowLeftRight,
  ExternalLink,
  ChevronRight,
  Presentation,
  Package,
} from 'lucide-react';
import { SessionUser } from '../lib/authClient';

interface HeaderProps {
  activeBrand: BrandBible | null;
  savedBrands: BrandBible[];
  onSelectBrand: (brand: BrandBible) => void;
  onNewBrand: () => void;
  onOpenChat: () => void;
  onOpenExport: () => void;
  onOpenAccount: () => void;
  onOpenDeck?: () => void;
  onOpenTour?: () => void;
  onOpenResearch?: () => void;
  onShareBrand?: () => void;
  isChatOpen: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  user: SessionUser | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function Header({
  activeBrand,
  savedBrands,
  onSelectBrand,
  onNewBrand,
  onOpenChat,
  onOpenExport,
  onOpenAccount,
  onOpenDeck,
  onOpenTour,
  onOpenResearch,
  onShareBrand,
  isChatOpen,
  isDarkMode,
  onToggleDarkMode,
  user,
  onLogin,
  onLogout,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-[#F9F7F2]/90 dark:bg-[#181816]/90 backdrop-blur-md border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 pb-4 pt-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-baseline justify-between gap-4">
        {/* Logo & App Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNewBrand}
            className="flex flex-col text-left group focus:outline-hidden cursor-pointer"
          >
            <span className="hidden md:block text-[9px] uppercase tracking-[0.35em] font-bold opacity-50 mb-1 whitespace-nowrap">
              Generate · Align · Build · Inspire
            </span>
            <h1 className="text-3xl font-serif italic font-light tracking-tighter text-[#1A1A1A] dark:text-[#F9F7F2]">
              GABI
            </h1>
          </button>
        </div>

        {/* Clean, Uncluttered Top Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3" ref={menuRef}>
          {/* Quick Brand Library Button */}
          <button
            onClick={onOpenAccount}
            className="flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] bg-transparent hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-[#F9F7F2] dark:hover:text-[#1A1A1A] transition-colors border border-[#1A1A1A] dark:border-[#F9F7F2]/30 rounded-none cursor-pointer"
            title="Open Brand Library & Compare"
            id="open-library-btn"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Library</span>
            <span className="ml-0.5 px-1 py-0.2 bg-black/10 dark:bg-white/20 text-[9px] font-mono font-black">
              {savedBrands.length}
            </span>
          </button>

          {/* Create New Brand Primary Action */}
          <button
            onClick={onNewBrand}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-white bg-[#1A1A1A] hover:bg-[#2C3333] dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:hover:bg-white transition-all rounded-none cursor-pointer shadow-xs"
            id="header-create-brand-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Create New</span>
            <span className="xs:hidden">New</span>
          </button>

          {/* Hamburger / Studio Tools Menu Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-widest font-bold border transition-colors cursor-pointer rounded-none ${
                isMenuOpen
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:border-[#F9F7F2]'
                  : 'bg-transparent text-[#1A1A1A] dark:text-[#F9F7F2] border-[#1A1A1A] dark:border-[#F9F7F2]/30 hover:bg-[#1A1A1A]/10 dark:hover:bg-white/10'
              }`}
              title="Open Studio Menu & Tools"
              aria-expanded={isMenuOpen}
              aria-label="Studio Menu"
              id="studio-hamburger-menu-btn"
            >
              {isMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Menu</span>
            </button>

            {/* Dropdown Menu Container */}
            {isMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FAF9F6] dark:bg-[#161614] border-2 border-[#1A1A1A] dark:border-[#F9F7F2]/40 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden"
                id="studio-hamburger-dropdown"
              >
                {/* Menu Header / Active Brand Context */}
                <div className="p-3.5 bg-[#1A1A1A] text-white border-b border-black flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.25em] font-black text-amber-400 block">
                        Studio Navigation
                      </span>
                      <p className="text-xs font-serif italic text-white/90 truncate max-w-[200px]">
                        {activeBrand ? activeBrand.brandName : 'Brand Identity Suite'}
                      </p>
                    </div>
                  </div>
                  {user && (
                    <div className="flex items-center gap-1.5 text-[9px] text-white/70 font-mono">
                      <UserIcon className="w-3 h-3" />
                      <span className="truncate max-w-[90px]">{user.name?.split(' ')[0] || 'User'}</span>
                    </div>
                  )}
                </div>

                {/* Section 1: Active Brand Tools */}
                {activeBrand && (
                  <div className="p-3 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[8px] uppercase tracking-widest font-black text-gray-400 dark:text-zinc-500 px-2 block mb-1">
                      Active Brand Tools &bull; {activeBrand.brandName}
                    </span>

                    {/* AI Director Action */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenChat();
                      }}
                      className="w-full flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F9F7F2] block group-hover:underline">
                            AI Brand Director
                          </span>
                          <span className="text-[9px] text-gray-500 dark:text-zinc-400">
                            Strategy brainstorms, copywriting &amp; critique
                          </span>
                        </div>
                      </div>
                      <span className="text-[8px] uppercase tracking-widest font-mono font-bold px-1.5 py-0.5 bg-amber-400 text-black">
                        Gemini
                      </span>
                    </button>

                    {/* Share Brand Action */}
                    {onShareBrand && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onShareBrand();
                        }}
                        className="w-full flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-gray-200 dark:bg-zinc-800 text-[#1A1A1A] dark:text-[#F9F7F2] border border-gray-300 dark:border-gray-300 dark:border-zinc-700">
                            <Share2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F9F7F2] block group-hover:underline">
                              Share Brand Bible
                            </span>
                            <span className="text-[9px] text-gray-500 dark:text-zinc-400">
                              Generate link &amp; export presentation
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}

                    {/* Presentation Pitch Deck Action */}
                    {onOpenDeck && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenDeck();
                        }}
                        className="w-full flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                            <Presentation className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F9F7F2] block group-hover:underline">
                              Pitch Deck Presentation
                            </span>
                            <span className="text-[9px] text-gray-500 dark:text-zinc-400">
                              Full-screen interactive slide deck mode
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}

                    {/* Export Dossier Action */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenExport();
                      }}
                      className="w-full flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-gray-200 dark:bg-zinc-800 text-[#1A1A1A] dark:text-[#F9F7F2] border border-gray-300 dark:border-gray-300 dark:border-zinc-700">
                          <Download className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F9F7F2] block group-hover:underline">
                            Export Tokens &amp; JSON
                          </span>
                          <span className="text-[9px] text-gray-500 dark:text-zinc-400">
                            Tailwind CSS tokens, SVG assets &amp; specs
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                )}

                {/* Section 2: Studio Discovery & Comparison */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[8px] uppercase tracking-widest font-black text-gray-400 dark:text-zinc-500 px-2 block mb-1">
                    Studio Discovery &amp; Workspace
                  </span>

                  {/* Brand Research & History Action */}
                  {onOpenResearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenResearch();
                      }}
                      className="w-full flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                          <Compass className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F9F7F2] block group-hover:underline">
                            Iconic Brand Case Studies
                          </span>
                          <span className="text-[9px] text-gray-500 dark:text-zinc-400">
                            Research brand origins &amp; logo history
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}

                  {/* Guided Tour */}
                  {onOpenTour && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenTour();
                      }}
                      className="w-full flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-gray-200 dark:bg-zinc-800 text-[#1A1A1A] dark:text-[#F9F7F2] border border-gray-300 dark:border-gray-300 dark:border-zinc-700">
                          <Compass className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F9F7F2] block group-hover:underline">
                            Guided Tour of Features
                          </span>
                          <span className="text-[9px] text-gray-500 dark:text-zinc-400">
                            Walkthrough of Simple &amp; Studio Suite modes
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}

                  {/* Brand Library & Comparison */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenAccount();
                    }}
                    className="w-full flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-gray-200 dark:bg-zinc-800 text-[#1A1A1A] dark:text-[#F9F7F2] border border-gray-300 dark:border-gray-300 dark:border-zinc-700">
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F9F7F2] block group-hover:underline">
                          Brand Library &amp; Comparison
                        </span>
                        <span className="text-[9px] text-gray-500 dark:text-zinc-400">
                          {savedBrands.length} saved {savedBrands.length === 1 ? 'brand' : 'brands'} &bull; Side-by-side matrix
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                {/* Section 3: System, Theme & Account */}
                <div className="p-3 bg-gray-50/50 dark:bg-zinc-950/50 space-y-2">
                  <span className="text-[8px] uppercase tracking-widest font-black text-gray-400 dark:text-zinc-500 px-2 block">
                    Settings &amp; Preferences
                  </span>

                  {/* Dark Mode Switcher */}
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      {isDarkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                      <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">
                        {isDarkMode ? 'Dark Studio Theme' : 'Light Studio Theme'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onToggleDarkMode}
                      className="px-2 py-1 text-[9px] uppercase tracking-widest font-bold border border-gray-300 dark:border-gray-300 dark:border-zinc-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
                    >
                      {isDarkMode ? 'Light' : 'Dark'}
                    </button>
                  </div>

                  {/* Account & Profile */}
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 truncate">
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt={user.name || 'User'}
                          className="w-5 h-5 rounded-full object-cover border border-black/10"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#1A1A1A] text-white text-[9px] flex items-center justify-center font-bold">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="truncate">
                        <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F9F7F2] block truncate">
                          {user ? user.name || user.email : 'Studio Workspace'}
                        </span>
                        <span className="text-[8px] text-gray-400 uppercase tracking-wider block font-mono">
                          {user ? 'Authenticated' : 'Local Sandbox Mode'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenAccount();
                      }}
                      className="px-2 py-1 text-[9px] uppercase tracking-widest font-bold border border-gray-300 dark:border-gray-300 dark:border-zinc-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer shrink-0"
                    >
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

