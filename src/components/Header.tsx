import { BrandBible } from '../types';
import { Sparkles, Bookmark, Download, MessageSquarePlus, Plus, Compass } from 'lucide-react';

interface HeaderProps {
  activeBrand: BrandBible | null;
  savedBrands: BrandBible[];
  onSelectBrand: (brand: BrandBible) => void;
  onNewBrand: () => void;
  onOpenChat: () => void;
  onOpenExport: () => void;
  isChatOpen: boolean;
}

export function Header({
  activeBrand,
  savedBrands,
  onSelectBrand,
  onNewBrand,
  onOpenChat,
  onOpenExport,
  isChatOpen,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#F9F7F2]/90 backdrop-blur-md border-b border-[#1A1A1A] pb-4 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-baseline justify-between gap-4">
        {/* Logo & App Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNewBrand}
            className="flex flex-col text-left group focus:outline-hidden"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-50 mb-1">Project Dossier</span>
            <h1 className="text-3xl font-serif italic font-light tracking-tighter">Brand Studio</h1>
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
                className="bg-transparent hover:bg-white text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold py-2 pl-3 pr-8 border border-[#1A1A1A] transition-colors focus:ring-1 focus:ring-[#1A1A1A] focus:outline-hidden cursor-pointer rounded-none"
              >
                <option value="" disabled>
                  Saved Brand Bibles ({savedBrands.length})
                </option>
                {savedBrands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.brandName} — {brand.industry}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeBrand && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] bg-transparent hover:bg-[#1A1A1A] hover:text-white transition-colors border border-[#1A1A1A] rounded-none"
              title="Export Brand Bible JSON & CSS"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {activeBrand && (
            <button
              onClick={onOpenChat}
              className={`flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors border border-[#1A1A1A] rounded-none ${
                isChatOpen
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-transparent text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
              }`}
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span className="hidden sm:inline">AI Director</span>
            </button>
          )}

          <button
            onClick={onNewBrand}
            className="flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-white bg-[#1A1A1A] hover:bg-[#2C3333] transition-all rounded-none"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </button>
        </div>
      </div>
    </header>
  );
}
