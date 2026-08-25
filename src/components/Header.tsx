import { BrandBible } from '../types';
import { Sparkles, Bookmark, Download, MessageSquarePlus, Plus, Compass, Sun, Moon, LogOut, Share2, Check } from 'lucide-react';
import { User } from '../lib/firebase';

interface HeaderProps {
  activeBrand: BrandBible | null;
  savedBrands: BrandBible[];
  onSelectBrand: (brand: BrandBible) => void;
  onNewBrand: () => void;
  onOpenChat: () => void;
  onOpenExport: () => void;
  onShareBrand?: () => void;
  isChatOpen: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  user: User | null;
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
  onShareBrand,
  isChatOpen,
  isDarkMode,
  onToggleDarkMode,
  user,
  onLogin,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#F9F7F2]/90 dark:bg-[#181816]/90 backdrop-blur-md border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 pb-4 pt-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-baseline justify-between gap-4">
        {/* Logo & App Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNewBrand}
            className="flex flex-col text-left group focus:outline-hidden"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-50 mb-1">Project Dossier</span>
            <h1 className="text-3xl font-serif italic font-light tracking-tighter text-[#1A1A1A] dark:text-[#F9F7F2]">Brand Studio</h1>
          </button>
        </div>

        {/* Saved Brands Selector & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {savedBrands.length > 0 && (
            <div className="relative hidden md:block">
              <select
                value={activeBrand?.id || ''}
                onChange={(e) => {
                  const selected = savedBrands.find((b) => b.id === e.target.value);
                  if (selected) onSelectBrand(selected);
                }}
                className="bg-transparent hover:bg-white dark:hover:bg-zinc-900 text-[#1A1A1A] dark:text-[#F9F7F2] text-[10px] uppercase tracking-widest font-bold py-2 pl-3 pr-8 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 transition-colors focus:ring-1 focus:ring-[#1A1A1A] dark:focus:ring-[#F9F7F2] focus:outline-hidden cursor-pointer rounded-none"
              >
                <option value="" disabled className="bg-[#F9F7F2] dark:bg-[#181816] text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Saved Brand Bibles ({savedBrands.length})
                </option>
                {savedBrands.map((brand) => (
                  <option key={brand.id} value={brand.id} className="bg-[#F9F7F2] dark:bg-[#181816] text-[#1A1A1A] dark:text-[#F9F7F2]">
                    {brand.brandName} — {brand.industry}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 hover:bg-[#1A1A1A]/5 dark:hover:bg-white/5 transition-colors text-[#1A1A1A] dark:text-[#F9F7F2] rounded-none flex items-center justify-center"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            id="theme-toggle-btn"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {activeBrand && onShareBrand && (
            <button
              onClick={onShareBrand}
              className="flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] bg-transparent hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-[#F9F7F2] dark:hover:text-[#1A1A1A] transition-colors border border-[#1A1A1A] dark:border-[#F9F7F2]/30 rounded-none cursor-pointer"
              title="Share Brand Bible via Web Share API or Clipboard"
              id="share-brand-btn"
            >
              <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          {activeBrand && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] bg-transparent hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-[#F9F7F2] dark:hover:text-[#1A1A1A] transition-colors border border-[#1A1A1A] dark:border-[#F9F7F2]/30 rounded-none"
              title="Export Brand Bible JSON & CSS"
            >
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {activeBrand && (
            <button
              onClick={onOpenChat}
              className={`flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors border border-[#1A1A1A] dark:border-[#F9F7F2]/30 rounded-none ${
                isChatOpen
                  ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                  : 'bg-transparent text-[#1A1A1A] dark:text-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-[#F9F7F2] dark:hover:text-[#1A1A1A]'
              }`}
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span className="hidden sm:inline">AI Director</span>
            </button>
          )}

          {/* User Account / Google Login Integration */}
          {user ? (
            <div className="flex items-center gap-2 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 px-2.5 py-1.5 bg-transparent text-[#1A1A1A] dark:text-[#F9F7F2]">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-4 h-4 rounded-full object-cover border border-[#1A1A1A]/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-[#1A1A1A] text-white text-[9px] flex items-center justify-center font-bold">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-[9px] uppercase tracking-wider font-bold hidden md:inline-block max-w-[90px] truncate">
                {user.displayName?.split(' ')[0] || 'Member'}
              </span>
              <button
                onClick={onLogout}
                className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 p-0.5 transition-colors cursor-pointer"
                title="Sign Out"
                id="sign-out-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] bg-transparent hover:bg-[#1A1A1A]/5 dark:hover:bg-white/5 transition-colors border border-[#1A1A1A] dark:border-[#F9F7F2]/30 rounded-none cursor-pointer"
              title="Secure Cloud Sync with Google"
              id="google-signin-btn"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Sign In</span>
            </button>
          )}

          <button
            onClick={onNewBrand}
            className="flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-white bg-[#1A1A1A] hover:bg-[#2C3333] dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:hover:bg-white transition-all rounded-none"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </button>
        </div>
      </div>
    </header>
  );
}
