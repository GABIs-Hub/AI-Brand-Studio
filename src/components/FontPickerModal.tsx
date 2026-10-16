import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Check,
  Sparkles,
  ExternalLink,
  Sliders,
  Type,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  GOOGLE_FONTS_CATALOG,
  GoogleFontItem,
  FontCategory,
  CURATED_GOOGLE_FONT_PAIRINGS,
  CuratedFontPairing,
  loadGoogleFontDynamically,
} from '../data/googleFontsCatalog';

interface FontPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFont: (fontName: string, category?: string) => void;
  onSelectPairing?: (pairing: CuratedFontPairing) => void;
  currentFont?: string;
  currentHeadingFont?: string;
  currentBodyFont?: string;
  targetRole?: 'heading' | 'body' | 'general';
  title?: string;
  subtitle?: string;
}

const CATEGORIES: FontCategory[] = [
  'All',
  'Sans-Serif',
  'Serif',
  'Display',
  'Monospace',
  'Handwriting',
  'Classic/Legacy',
];

export const FontPickerModal: React.FC<FontPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFont,
  onSelectPairing,
  currentFont = '',
  currentHeadingFont = '',
  currentBodyFont = '',
  targetRole = 'general',
  title = 'Select Typography',
  subtitle = 'Choose from a vast collection of typefaces sourced from fonts.google.com',
}) => {
  const effectiveCurrentFont =
    currentFont ||
    (targetRole === 'heading' ? currentHeadingFont : currentBodyFont) ||
    '';
  const [activeTab, setActiveTab] = useState<'catalog' | 'pairings'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FontCategory>('All');
  const [sampleText, setSampleText] = useState('Sphinx of black quartz, judge my vow');
  const [customFontInput, setCustomFontInput] = useState('');

  // Load preview fonts for visible items
  useEffect(() => {
    if (!isOpen) return;
    // Load current font
    if (effectiveCurrentFont) loadGoogleFontDynamically(effectiveCurrentFont);
    // Pre-load top 20 visible fonts
    GOOGLE_FONTS_CATALOG.slice(0, 25).forEach((item) => {
      if (item.isGoogleFont) loadGoogleFontDynamically(item.name);
    });
  }, [isOpen, effectiveCurrentFont]);

  const filteredFonts = useMemo(() => {
    return GOOGLE_FONTS_CATALOG.filter((font) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        font.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        font.designer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        font.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || font.category === selectedCategory;

      const matchesRole =
        targetRole === 'general' ||
        font.bestFor === 'both' ||
        font.bestFor === targetRole;

      return matchesSearch && matchesCategory && matchesRole;
    });
  }, [searchQuery, selectedCategory, targetRole]);

  if (!isOpen) return null;

  const handleSelect = (font: GoogleFontItem) => {
    loadGoogleFontDynamically(font.name);
    onSelectFont(font.name, font.category);
    onClose();
  };

  const handleApplyCustomFont = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customFontInput.trim()) return;
    const fontName = customFontInput.trim();
    loadGoogleFontDynamically(fontName);
    onSelectFont(fontName, 'Google Font');
    onClose();
  };

  return (
    <div
      id="font-picker-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="font-picker-modal-container"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-800 bg-neutral-950/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Type className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-neutral-100">{title}</h2>
              {targetRole !== 'general' && (
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Target: {targetRole}
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-400">{subtitle}</p>
          </div>
          <button
            id="close-font-picker-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Catalog vs. Curated Pairings */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-neutral-800/80 bg-neutral-900/40">
          <div className="flex items-center gap-2">
            <button
              id="font-picker-catalog-tab"
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Google Fonts Catalog ({GOOGLE_FONTS_CATALOG.length}+)
            </button>
            {onSelectPairing && (
              <button
                id="font-picker-pairings-tab"
                onClick={() => setActiveTab('pairings')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'pairings'
                    ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Curated Pairings
              </button>
            )}
          </div>
          <a
            href="https://fonts.google.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-emerald-400 transition-colors"
          >
            fonts.google.com
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {activeTab === 'catalog' ? (
          <>
            {/* Filter Controls & Search */}
            <div className="p-5 border-b border-neutral-800/80 bg-neutral-950/30 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    id="font-picker-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by font name, designer, or tag (e.g. Modern, Editorial, Tech)..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sample Preview Text Editor */}
                <div className="w-full sm:w-64 relative">
                  <input
                    id="font-picker-sample-text-input"
                    type="text"
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    placeholder="Type preview specimen..."
                    className="w-full px-3 py-2 text-xs bg-neutral-950/80 border border-neutral-800 rounded-xl text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    id={`font-cat-btn-${cat.toLowerCase().replace('/', '-')}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                        : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Google Font Quick Adder */}
            <div className="px-5 py-2.5 bg-neutral-950/50 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-neutral-500" />
                Want another font from Google Fonts?
              </span>
              <form
                onSubmit={handleApplyCustomFont}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <input
                  id="custom-google-font-input"
                  type="text"
                  placeholder="e.g. Cinzel Decorative, Bungee Shade"
                  value={customFontInput}
                  onChange={(e) => setCustomFontInput(e.target.value)}
                  className="px-3 py-1 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 flex-1 sm:w-56"
                />
                <button
                  type="submit"
                  id="apply-custom-google-font-btn"
                  disabled={!customFontInput.trim()}
                  className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  Apply Font
                </button>
              </form>
            </div>

            {/* Scrollable Font Grid */}
            <div
              id="font-picker-grid"
              className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[300px] max-h-[50vh]"
            >
              {filteredFonts.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 space-y-2">
                  <p className="text-sm">No typography matches found for "{searchQuery}".</p>
                  <p className="text-xs">
                    You can still type any font name directly in the "Want another font" field
                    above to load it directly from fonts.google.com!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredFonts.map((font) => {
                    const isSelected =
                      effectiveCurrentFont.toLowerCase() === font.name.toLowerCase();

                    return (
                      <div
                        key={font.name}
                        id={`font-item-${font.name.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => handleSelect(font)}
                        onMouseEnter={() => {
                          if (font.isGoogleFont) loadGoogleFontDynamically(font.name);
                        }}
                        className={`group relative p-4 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                            : 'bg-neutral-950/60 hover:bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-100 group-hover:text-emerald-400 transition-colors text-sm">
                                {font.name}
                              </span>
                              {font.isGoogleFont && (
                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                                  Google Font
                                </span>
                              )}
                              {!font.isGoogleFont && (
                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  System
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                              <span>{font.category}</span>
                              {font.designer && <span>• {font.designer}</span>}
                              <span>• {font.weights.length} weights</span>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="p-1 rounded-full bg-emerald-500 text-neutral-950">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {/* Live Typeface Render Preview */}
                        <div className="mt-2 pt-2 border-t border-neutral-800/60">
                          <p
                            style={{ fontFamily: `"${font.name}", sans-serif` }}
                            className="text-base sm:text-lg text-neutral-200 leading-snug line-clamp-2"
                          >
                            {sampleText || font.previewText}
                          </p>
                        </div>

                        {/* Tags */}
                        {font.tags && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {font.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Curated Pairings Tab */
          <div
            id="curated-pairings-list"
            className="p-5 space-y-4 overflow-y-auto max-h-[60vh]"
          >
            <p className="text-xs text-neutral-400">
              Hand-crafted, mathematically proportioned Heading + Body pairings tested for maximum
              visual authority and reading cadence:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CURATED_GOOGLE_FONT_PAIRINGS.map((pairing) => (
                <div
                  key={pairing.id}
                  id={`pairing-${pairing.id}`}
                  onClick={() => {
                    loadGoogleFontDynamically(pairing.heading);
                    loadGoogleFontDynamically(pairing.body);
                    if (onSelectPairing) onSelectPairing(pairing);
                    onClose();
                  }}
                  onMouseEnter={() => {
                    loadGoogleFontDynamically(pairing.heading);
                    loadGoogleFontDynamically(pairing.body);
                  }}
                  className="group p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900/80 hover:border-emerald-500/40 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-100 group-hover:text-emerald-400 transition-colors">
                        {pairing.name}
                      </h4>
                      <p className="text-[11px] text-emerald-400/90">{pairing.vibe}</p>
                    </div>
                    <span className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 group-hover:text-emerald-400 group-hover:bg-neutral-700 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Specimen Preview */}
                  <div className="p-3 rounded-lg bg-neutral-900/90 border border-neutral-800/80 space-y-1.5">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-neutral-400">
                        Heading: {pairing.heading}
                      </div>
                      <div
                        style={{ fontFamily: `"${pairing.heading}", serif` }}
                        className="text-lg font-bold text-neutral-100"
                      >
                        Strategic Modern Authority
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-neutral-800">
                      <div className="text-[10px] uppercase font-semibold text-neutral-400">
                        Body: {pairing.body}
                      </div>
                      <div
                        style={{ fontFamily: `"${pairing.body}", sans-serif` }}
                        className="text-xs text-neutral-300 leading-relaxed"
                      >
                        Crafting timeless visual identities with enduring geometric precision.
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {pairing.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-neutral-950/80 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All fonts fully compatible with Google Fonts web embed links & CSS exports</span>
          </div>
          <button
            id="cancel-font-picker-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
