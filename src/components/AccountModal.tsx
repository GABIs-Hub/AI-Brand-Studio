import React, { useState, useEffect, useRef } from 'react';
import { BrandBible, UserStudioSettings } from '../types';
import { sanitizeSvg } from '../utils/sanitizeSvg';
import { SessionUser } from '../lib/authClient';
import { BrandComparisonDashboard } from './BrandComparisonDashboard';
import {
  X,
  User as UserIcon,
  Bookmark,
  Settings,
  Sparkles,
  Cloud,
  CloudCheck,
  Download,
  Upload,
  Trash2,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  LogOut,
  LogIn,
  Search,
  Layers,
  Palette,
  Type,
  FileJson,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  Shield,
  Sliders,
  SlidersHorizontal,
  Compass,
  ArrowLeftRight,
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SessionUser | null;
  savedBrands: BrandBible[];
  activeBrand: BrandBible | null;
  onSelectBrand: (brand: BrandBible) => void;
  onDeleteBrand: (id: string) => void;
  onUpgradeBrand?: (brand: BrandBible) => void;
  onImportBrand: (importedBrand: BrandBible) => void;
  onLogin: () => void;
  onEmailLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string, name?: string) => void;
  onLogout: () => void;
  onRefreshCloudSync?: () => Promise<void>;
  studioSettings: UserStudioSettings;
  onUpdateStudioSettings: (settings: UserStudioSettings) => void;
}

type AccountTab = 'library' | 'compare' | 'settings' | 'ai_engine' | 'backups';

const DEFAULT_SETTINGS: UserStudioSettings = {
  studioName: 'Independent Creative Studio',
  creativeDirector: 'Creative Director',
  defaultIndustry: 'Technology & SaaS',
  defaultAesthetic: 'Minimalist Swiss & Neo-Modern',
  autoRecordMilestones: true,
  highResRenderMode: 'high_definition',
  colorPaletteHarmony: 'balanced',
};

export function AccountModal({
  isOpen,
  onClose,
  user,
  savedBrands,
  activeBrand,
  onSelectBrand,
  onDeleteBrand,
  onUpgradeBrand,
  onImportBrand,
  onLogin,
  onEmailLogin,
  onRegister,
  onLogout,
  onRefreshCloudSync,
  studioSettings,
  onUpdateStudioSettings,
}: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<AccountTab>('library');
  const [compareBrandAId, setCompareBrandAId] = useState<string | undefined>(undefined);
  const [compareBrandBId, setCompareBrandBId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState<string>('all');
  const [copiedUid, setCopiedUid] = useState(false);
  const [isRefreshingSync, setIsRefreshingSync] = useState(false);
  const [syncStatusNotice, setSyncStatusNotice] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [brandPendingDeletion, setBrandPendingDeletion] = useState<BrandBible | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for editable settings
  const [localSettings, setLocalSettings] = useState<UserStudioSettings>(studioSettings || DEFAULT_SETTINGS);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  useEffect(() => {
    if (studioSettings) {
      setLocalSettings(studioSettings);
    }
  }, [studioSettings]);

  if (!isOpen) return null;

  // Extract unique industries for filtering
  const uniqueIndustries = Array.from(new Set(savedBrands.map((b) => b.industry).filter(Boolean)));

  // Filtered brands
  const filteredBrands = savedBrands.filter((brand) => {
    const matchesSearch =
      brand.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (brand.tagline && brand.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesIndustry = selectedIndustryFilter === 'all' || brand.industry === selectedIndustryFilter;
    return matchesSearch && matchesIndustry;
  });

  const handleCopyUid = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id || '');
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStudioSettings(localSettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  const handleTriggerSync = async () => {
    if (!onRefreshCloudSync) return;
    setIsRefreshingSync(true);
    setSyncStatusNotice(null);
    try {
      await onRefreshCloudSync();
      setSyncStatusNotice('Cloud library successfully refreshed and synchronized with your account.');
      setTimeout(() => setSyncStatusNotice(null), 3500);
    } catch (e: any) {
      setSyncStatusNotice('Cloud sync refresh encountered a transient delay.');
    } finally {
      setIsRefreshingSync(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!brandPendingDeletion) return;
    const deletedName = brandPendingDeletion.brandName;
    onDeleteBrand(brandPendingDeletion.id);
    setBrandPendingDeletion(null);
    setSyncStatusNotice(`"${deletedName}" was removed from your Brand Library.`);
    setTimeout(() => setSyncStatusNotice(null), 3500);
  };

  // Bulk Export all saved Brand Bibles
  const handleBulkExportJson = () => {
    if (savedBrands.length === 0) return;
    const exportBundle = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        totalBrands: savedBrands.length,
        studioName: localSettings.studioName || 'Brand Studio AI',
        exportedBy: user ? user.name || user.email || 'User' : 'Guest Session User',
      },
      brands: savedBrands,
    };
    const jsonStr = JSON.stringify(exportBundle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand-studio-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export single Brand Bible
  const handleExportSingleJson = (brand: BrandBible, e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonStr = JSON.stringify(brand, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-brand-bible.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import Brand Bible JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        let brandToImport: BrandBible | null = null;

        if (parsed.brandName && parsed.palette && parsed.typography) {
          brandToImport = parsed as BrandBible;
        } else if (parsed.brands && Array.isArray(parsed.brands) && parsed.brands.length > 0) {
          // It's a bulk backup, import the first one or prompt
          brandToImport = parsed.brands[0] as BrandBible;
          parsed.brands.forEach((b: BrandBible) => {
            if (b.brandName && b.palette && b.typography) {
              onImportBrand(b);
            }
          });
          setImportSuccess(`Imported ${parsed.brands.length} brand bibles into your library!`);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        if (brandToImport && brandToImport.brandName) {
          // Ensure it has an ID and timestamp
          if (!brandToImport.id) brandToImport.id = 'imported_' + Date.now();
          if (!brandToImport.createdAt) brandToImport.createdAt = new Date().toISOString();
          onImportBrand(brandToImport);
          setImportSuccess(`"${brandToImport.brandName}" Brand Bible imported successfully!`);
          setTimeout(() => setImportSuccess(null), 3500);
        } else {
          setImportError('Invalid Brand Bible JSON format. Required keys: brandName, palette, typography.');
        }
      } catch (err: any) {
        setImportError('Could not parse JSON file: ' + (err.message || 'Unknown syntax error'));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      id="account-hub-modal"
    >
      <div className="bg-[#F9F7F2] dark:bg-[#181816] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 text-[#1A1A1A] dark:text-[#F9F7F2] w-full max-w-5xl h-[92vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 flex items-center justify-between gap-4 bg-white/40 dark:bg-zinc-900/40">
          <div className="flex items-center gap-3">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || 'Account'}
                className="w-9 h-9 rounded-full object-cover border border-[#1A1A1A]/20 dark:border-[#F9F7F2]/20 shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#1A1A1A] dark:bg-[#F9F7F2] text-[#F9F7F2] dark:text-[#1A1A1A] text-xs flex items-center justify-center font-bold">
                {user ? user.name?.charAt(0) || user.email?.charAt(0) || 'U' : <UserIcon className="w-4 h-4" />}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                  {user ? user.name || user.email?.split('@')[0] : 'Guest Studio Session'}
                </h2>
                {user ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] uppercase tracking-widest font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    <Cloud className="w-2.5 h-2.5" />
                    <span>Cloud Synced</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] uppercase tracking-widest font-black bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    <span>Guest Cache</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-mono">
                {user ? user.email : 'Local browser session • Log in to sync permanently across devices'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-300 dark:border-rose-900/40 transition-colors cursor-pointer"
                title="Sign out of account"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] hover:opacity-85 transition-opacity cursor-pointer shadow-xs"
                title="Sign in with Google"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In With Google</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 hover:bg-[#1A1A1A]/10 dark:hover:bg-white/10 transition-colors cursor-pointer text-[#1A1A1A] dark:text-[#F9F7F2]"
              title="Close Account Hub"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 px-6 bg-[#F9F7F2] dark:bg-[#181816] overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 py-3 px-4 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'library'
                ? 'border-[#1A1A1A] dark:border-[#F9F7F2] text-[#1A1A1A] dark:text-[#F9F7F2] font-black'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Brand Library ({savedBrands.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 py-3 px-4 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'compare'
                ? 'border-[#1A1A1A] dark:border-[#F9F7F2] text-[#1A1A1A] dark:text-[#F9F7F2] font-black'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Brand Comparison</span>
            {savedBrands.length >= 2 && (
              <span className="px-1.5 py-0.5 text-[8px] bg-amber-400 text-black font-black uppercase">
                Side-by-Side
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#1A1A1A] dark:border-[#F9F7F2] text-[#1A1A1A] dark:text-[#F9F7F2] font-black'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Studio Profile & Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai_engine')}
            className={`flex items-center gap-2 py-3 px-4 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ai_engine'
                ? 'border-[#1A1A1A] dark:border-[#F9F7F2] text-[#1A1A1A] dark:text-[#F9F7F2] font-black'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Engine & Directives</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backups')}
            className={`flex items-center gap-2 py-3 px-4 text-[10px] uppercase tracking-widest font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'backups'
                ? 'border-[#1A1A1A] dark:border-[#F9F7F2] text-[#1A1A1A] dark:text-[#F9F7F2] font-black'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export & Backup Vault</span>
          </button>
        </div>

        {/* Global Notice / Toasts */}
        {syncStatusNotice && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs px-6 py-2 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{syncStatusNotice}</span>
            </div>
            <button onClick={() => setSyncStatusNotice(null)} className="font-bold text-[10px] uppercase hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {importSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs px-6 py-2 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{importSuccess}</span>
            </div>
            <button onClick={() => setImportSuccess(null)} className="font-bold text-[10px] uppercase hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {importError && (
          <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-xs px-6 py-2 border-b border-rose-200 dark:border-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{importError}</span>
            </div>
            <button onClick={() => setImportError(null)} className="font-bold text-[10px] uppercase hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Contents Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SAVED BRAND LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-6" id="account-library-view">
              {/* Controls bar: Search, Filter, Bulk Actions & Import */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="library-search-input"
                      type="text"
                      placeholder="Search saved Brand Bibles by brand name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setSearchQuery('');
                      }}
                      aria-label="Filter saved Brand Bibles by brand name"
                      className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[#1A1A1A] dark:text-[#F9F7F2] placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-hidden focus:border-[#1A1A1A] dark:focus:border-[#F9F7F2] transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        title="Clear search"
                        aria-label="Clear search input"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {uniqueIndustries.length > 0 && (
                    <select
                      value={selectedIndustryFilter}
                      onChange={(e) => setSelectedIndustryFilter(e.target.value)}
                      className="py-2 px-3 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[#1A1A1A] dark:text-[#F9F7F2] cursor-pointer"
                    >
                      <option value="all">All Industries ({savedBrands.length})</option>
                      {uniqueIndustries.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 text-[9px] uppercase tracking-widest font-bold border border-[#1A1A1A] dark:border-[#F9F7F2]/30 hover:bg-[#1A1A1A]/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    title="Import Brand Bible JSON file into library"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBulkExportJson}
                    disabled={savedBrands.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 text-[9px] uppercase tracking-widest font-bold bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] hover:opacity-85 transition-opacity disabled:opacity-40 cursor-pointer shadow-xs"
                    title="Download all Brand Bibles in library as a single JSON backup"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Backup All</span>
                  </button>
                </div>
              </div>

              {/* Active Search / Filter Stats Bar */}
              {(searchQuery.trim() !== '' || selectedIndustryFilter !== 'all') && (
                <div className="flex items-center justify-between text-[11px] px-3 py-1.5 bg-[#1A1A1A]/5 dark:bg-white/5 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Search className="w-3 h-3 text-gray-500 dark:text-gray-500" />
                    <span>
                      Showing <strong>{filteredBrands.length}</strong> of <strong>{savedBrands.length}</strong> Brand Bibles
                      {searchQuery.trim() !== '' && (
                        <span> matching "<strong>{searchQuery}</strong>"</span>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedIndustryFilter('all');
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Grid of Saved Brand Bibles */}
              {filteredBrands.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-gray-300 dark:border-gray-300 dark:border-zinc-800 p-8 space-y-4">
                  <Bookmark className="w-10 h-10 text-gray-400 dark:text-zinc-600 mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                      {searchQuery || selectedIndustryFilter !== 'all'
                        ? 'No Brand Bibles Match Your Filters'
                        : 'No Brand Bibles Saved Yet'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                      {searchQuery || selectedIndustryFilter !== 'all'
                        ? 'Try clearing your search query or selecting "All Industries".'
                        : 'Generate a brand identity in the studio or import an existing Brand Bible JSON to build your strategic identity library.'}
                    </p>
                  </div>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedIndustryFilter('all');
                      }}
                      className="text-xs font-bold uppercase tracking-widest underline hover:opacity-75 cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBrands.map((brand) => {
                    const isCurrentlyActive = activeBrand?.id === brand.id;
                    return (
                      <div
                        key={brand.id}
                        onClick={() => {
                          onSelectBrand(brand);
                          onClose();
                        }}
                        className={`group border transition-all cursor-pointer p-4 bg-white dark:bg-zinc-900/90 flex flex-col justify-between relative hover:border-[#1A1A1A] dark:hover:border-[#F9F7F2] ${
                          isCurrentlyActive
                            ? 'border-[#1A1A1A] dark:border-[#F9F7F2] ring-1 ring-[#1A1A1A] dark:ring-[#F9F7F2]'
                            : 'border-gray-200 dark:border-gray-200 dark:border-zinc-800'
                        }`}
                      >
                        {/* Active Badge */}
                        {isCurrentlyActive && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]">
                            Active In Studio
                          </span>
                        )}

                        <div className="space-y-3">
                          {/* Logomark Thumbnail & Name */}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                              {brand.logo?.primaryLogoSvg ? (
                                <div
                                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.logo.primaryLogoSvg) }}
                                />
                              ) : (
                                <span className="text-xs font-serif font-black">{brand.brandName.slice(0, 2)}</span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2] truncate group-hover:underline">
                                {brand.brandName}
                              </h4>
                              <p className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-widest font-semibold truncate">
                                {brand.industry}
                              </p>
                            </div>
                          </div>

                          {/* Tagline / Mission excerpt */}
                          <p className="text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-300 line-clamp-2 italic font-serif leading-relaxed">
                            "{brand.tagline || brand.positioningStatement || brand.mission}"
                          </p>

                          {/* 5-Color Harmony Swatches */}
                          {brand.palette && brand.palette.length > 0 && (
                            <div className="flex h-3 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 overflow-hidden">
                              {brand.palette.map((c, i) => (
                                <div
                                  key={i}
                                  className="flex-1 h-full"
                                  style={{ backgroundColor: c.hex }}
                                  title={`${c.name} (${c.hex}) - ${c.role}`}
                                />
                              ))}
                            </div>
                          )}

                          {/* Typography Badges */}
                          {brand.typography && (
                            <div className="flex items-center gap-1.5 text-[9px] text-gray-500 dark:text-zinc-400 font-mono truncate">
                              <Type className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                {brand.typography.headingFont} + {brand.typography.bodyFont}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-1">
                          <span className="text-[8px] text-gray-400 font-mono">
                            {new Date(brand.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>

                          <div className="flex items-center gap-1">
                            {savedBrands.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCompareBrandAId(brand.id);
                                  const other = savedBrands.find((b) => b.id !== brand.id);
                                  if (other) setCompareBrandBId(other.id);
                                  setActiveTab('compare');
                                }}
                                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-zinc-300 transition-colors text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                                title="Compare side-by-side with another brand"
                              >
                                <ArrowLeftRight className="w-3 h-3 text-amber-500" />
                                <span className="hidden sm:inline">Compare</span>
                              </button>
                            )}

                            {onUpgradeBrand && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpgradeBrand(brand);
                                  onClose();
                                }}
                                className="p-1 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 transition-colors text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                                title="Upgrade and modernize this brand identity"
                              >
                                <Layers className="w-3 h-3" />
                                <span className="hidden sm:inline">Upgrade</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleExportSingleJson(brand, e)}
                              className="p-1 text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                              title="Export Brand Bible JSON"
                            >
                              <FileJson className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBrandPendingDeletion(brand);
                              }}
                              className="p-1 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Brand Bible"
                              aria-label={`Delete ${brand.brandName}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SIDE-BY-SIDE BRAND COMPARISON */}
          {activeTab === 'compare' && (
            <div id="account-comparison-view">
              <BrandComparisonDashboard
                savedBrands={savedBrands}
                activeBrand={activeBrand}
                onSelectBrand={onSelectBrand}
                onCloseModal={onClose}
                initialBrandAId={compareBrandAId}
                initialBrandBId={compareBrandBId}
              />
            </div>
          )}

          {/* TAB 3: STUDIO PROFILE & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl" id="account-settings-view">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Section 1: Studio Identity */}
                <div className="border border-gray-200 dark:border-gray-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
                    <Sliders className="w-4 h-4 text-gray-700 dark:text-zinc-300" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2]">
                      Creative Studio Identity & Agency Branding
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-600 dark:text-gray-600 dark:text-zinc-400 mb-1">
                        Studio / Agency Name
                      </label>
                      <input
                        type="text"
                        value={localSettings.studioName || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, studioName: e.target.value })}
                        placeholder="e.g. Apex Identity Lab, Studio Vanguard"
                        className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[#1A1A1A] dark:text-[#F9F7F2]"
                      />
                      <p className="text-[9px] text-gray-400 mt-1">Appears on exported Brand Bible covers, specs, and dossiers.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-600 dark:text-gray-600 dark:text-zinc-400 mb-1">
                        Creative Director / Lead Designer
                      </label>
                      <input
                        type="text"
                        value={localSettings.creativeDirector || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, creativeDirector: e.target.value })}
                        placeholder="e.g. Alexander Wright, Lead Brand Strategist"
                        className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[#1A1A1A] dark:text-[#F9F7F2]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-600 dark:text-gray-600 dark:text-zinc-400 mb-1">
                        Default Industry Focus
                      </label>
                      <input
                        type="text"
                        value={localSettings.defaultIndustry || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, defaultIndustry: e.target.value })}
                        placeholder="e.g. Tech & AI, Luxury Hospitality, FinTech"
                        className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[#1A1A1A] dark:text-[#F9F7F2]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-600 dark:text-gray-600 dark:text-zinc-400 mb-1">
                        Preferred Aesthetic Archetype
                      </label>
                      <select
                        value={localSettings.defaultAesthetic || 'Minimalist Swiss & Neo-Modern'}
                        onChange={(e) => setLocalSettings({ ...localSettings, defaultAesthetic: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 text-[#1A1A1A] dark:text-[#F9F7F2] cursor-pointer"
                      >
                        <option value="Minimalist Swiss & Neo-Modern">Minimalist Swiss & Neo-Modern</option>
                        <option value="Bold High-Contrast Neobrutalist">Bold High-Contrast Neobrutalist</option>
                        <option value="Warm Organic & Editorial Artisan">Warm Organic & Editorial Artisan</option>
                        <option value="High-Tech Futuristic & Cyber Precision">High-Tech Futuristic & Cyber Precision</option>
                        <option value="Luxury Serif & Heritage Monogram">Luxury Serif & Heritage Monogram</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Account & Cloud Storage Status */}
                <div className="border border-gray-200 dark:border-gray-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-gray-700 dark:text-zinc-300" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2]">
                        Cloud Database & Synchronization
                      </h3>
                    </div>
                    {user && (
                      <button
                        type="button"
                        onClick={handleTriggerSync}
                        disabled={isRefreshingSync}
                        className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isRefreshingSync ? 'animate-spin' : ''}`} />
                        <span>{isRefreshingSync ? 'Syncing...' : 'Sync Cloud Library'}</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-zinc-800/60">
                      <span className="text-gray-500 dark:text-zinc-400 font-medium">Storage Engine</span>
                      <span className="font-mono font-bold">
                        {user ? 'Neon Postgres (Cloud Sync)' : 'Session Storage (Guest Tab Mode)'}
                      </span>
                    </div>

                    {user && (
                      <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-zinc-800/60">
                        <span className="text-gray-500 dark:text-zinc-400 font-medium">Cloud Database ID</span>
                        <span className="font-mono text-[10px] opacity-75">
                          brand-studio-ai (Neon)
                        </span>
                      </div>
                    )}

                    {user && (
                      <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-zinc-800/60">
                        <span className="text-gray-500 dark:text-zinc-400 font-medium">User Unique ID (UID)</span>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-[10px] bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 max-w-[180px] truncate">
                            {user.id}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyUid}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                            title="Copy UID"
                          >
                            {copiedUid ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-500 dark:text-gray-500" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-500 dark:text-zinc-400 font-medium">Saved Brand Bibles</span>
                      <span className="font-bold">{savedBrands.length} Brands in Active Library</span>
                    </div>
                  </div>

                  {!user && (
                    <div className="space-y-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                      <div className="text-[11px] text-amber-800 dark:text-amber-200 font-bold uppercase tracking-wider">
                        Sign in to sync your library across devices
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (authMode === 'signup') {
                            onRegister(authEmail, authPassword, authName || undefined);
                          } else {
                            onEmailLogin(authEmail, authPassword);
                          }
                        }}
                        className="space-y-2"
                      >
                        {authMode === 'signup' && (
                          <input
                            type="text"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="Your name (optional)"
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-800 text-[#1A1A1A] dark:text-[#F9F7F2] placeholder-gray-400 dark:placeholder-zinc-600"
                          />
                        )}
                        <input
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="Email address"
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-800 text-[#1A1A1A] dark:text-[#F9F7F2] placeholder-gray-400 dark:placeholder-zinc-600"
                        />
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Password (8+ characters)"
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-800 text-[#1A1A1A] dark:text-[#F9F7F2] placeholder-gray-400 dark:placeholder-zinc-600"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="submit"
                            className="flex-1 px-3 py-2 bg-amber-800 text-white dark:bg-amber-300 dark:text-amber-950 font-bold uppercase text-[9px] tracking-wider cursor-pointer"
                          >
                            {authMode === 'signup' ? 'Create Account' : 'Sign In With Email'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
                            className="px-2 py-2 text-[9px] uppercase tracking-wider underline cursor-pointer text-amber-800 dark:text-amber-200"
                          >
                            {authMode === 'signup' ? 'Have an account? Sign in' : 'New here? Create account'}
                          </button>
                        </div>
                      </form>
                      <div className="flex items-center gap-2 text-[10px] text-amber-700 dark:text-amber-300/70">
                        <span className="flex-1 border-t border-amber-200 dark:border-amber-900/40" />
                        or
                        <span className="flex-1 border-t border-amber-200 dark:border-amber-900/40" />
                      </div>
                      <button
                        type="button"
                        onClick={onLogin}
                        className="w-full px-3 py-2 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] font-bold uppercase text-[9px] tracking-wider cursor-pointer flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-3 h-3" />
                        Continue With Google
                      </button>
                    </div>
                  )}
                </div>

                {/* Save Button Bar */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {settingsSavedToast && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Settings saved successfully!
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-xs uppercase tracking-widest font-black hover:opacity-85 transition-opacity cursor-pointer shadow-xs"
                  >
                    Save Studio Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: AI ENGINE & DIRECTIVES */}
          {activeTab === 'ai_engine' && (
            <div className="space-y-6 max-w-3xl" id="account-ai-engine-view">
              <div className="border border-gray-200 dark:border-gray-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
                  <Sparkles className="w-4 h-4 text-gray-700 dark:text-zinc-300" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2]">
                    Generative Intelligence Architecture
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                    <div className="p-1.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                        Gemini 3.7 Flash & 3.1 Flash Lite Multi-Model Cascade
                      </h4>
                      <p className="text-gray-500 dark:text-zinc-400 text-[11px] mt-1 leading-relaxed">
                        Automatic multi-model cascade with circuit-breaker protection ensures uninterrupted generation of strategic positioning, color theories, typography curation, and vector SVG specifications.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                    <div className="p-1.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                        Multi-Provider AI Rendering Engine
                      </h4>
                      <p className="text-gray-500 dark:text-zinc-400 text-[11px] mt-1 leading-relaxed">
                        Routes renders across OpenAI, Google Gemini, and Higgsfield with automatic fallback cascades — pick your engine for the best logo, mockup, and social visuals.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                    <div className="p-1.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] shrink-0">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                        Brand Evolution & Milestone Auto-Checkpointing
                      </h4>
                      <p className="text-gray-500 dark:text-zinc-400 text-[11px] mt-1 leading-relaxed">
                        Every brand upgrade, AI logo polish, or aesthetic iteration is recorded in the Brand Evolution Timeline with full rollback and delta comparison.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT & BACKUP VAULT */}
          {activeTab === 'backups' && (
            <div className="space-y-6 max-w-3xl" id="account-backups-view">
              <div className="border border-gray-200 dark:border-gray-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
                  <Download className="w-4 h-4 text-gray-700 dark:text-zinc-300" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2]">
                    Library Data Export & Portability
                  </h3>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-300 leading-relaxed">
                  Export complete data packages of your brand library for offline archiving, team sharing, or migration into external design tools.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                        Full Library JSON Backup
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1">
                        Consolidated backup containing all {savedBrands.length} saved Brand Bibles, SVG vectors, and typography specs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleBulkExportJson}
                      disabled={savedBrands.length === 0}
                      className="w-full py-2 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[9px] uppercase tracking-widest font-black hover:opacity-85 transition-opacity disabled:opacity-40 cursor-pointer text-center"
                    >
                      Export Full Library JSON
                    </button>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                        Import Brand Bible Backup
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1">
                        Restore single or bulk Brand Bible JSON files into your active workspace and cloud library.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 text-[#1A1A1A] dark:text-[#F9F7F2] text-[9px] uppercase tracking-widest font-black hover:bg-[#1A1A1A]/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-center"
                    >
                      Select JSON File To Import
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Ownership Notice */}
              <div className="border border-emerald-200 dark:border-emerald-900/40 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Commercial Rights & IP Ownership
                  </h4>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  All vector marks, custom SVG blueprints, color harmonies, typography curation, and brand strategy guidelines generated in Brand Studio AI are 100% royalty-free and owned by you and your studio.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3 border-t border-[#1A1A1A] dark:border-[#F9F7F2]/20 flex items-center justify-between text-[9px] uppercase tracking-widest text-gray-500 dark:text-zinc-400 bg-white/40 dark:bg-zinc-900/40">
          <span>Brand Studio AI // Account & Studio Workspace Hub</span>
          <span>{savedBrands.length} Saved Brands</span>
        </div>
      </div>

      {/* Delete Confirmation Dialog Modal */}
      {brandPendingDeletion && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
          id="delete-brand-confirmation-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setBrandPendingDeletion(null);
          }}
        >
          <div className="bg-[#F9F7F2] dark:bg-[#181816] border border-[#1A1A1A] dark:border-[#F9F7F2]/30 text-[#1A1A1A] dark:text-[#F9F7F2] w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 relative">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 id="delete-dialog-title" className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Delete Brand Bible?
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-400 leading-relaxed">
                  Are you sure you want to permanently remove <strong className="text-[#1A1A1A] dark:text-[#F9F7F2]">"{brandPendingDeletion.brandName}"</strong> from your studio library? This will delete all generated vector marks, color specs, and guidelines.
                </p>
              </div>
            </div>

            {/* Brand Card Preview */}
            <div className="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                {brandPendingDeletion.logo?.primaryLogoSvg ? (
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(brandPendingDeletion.logo.primaryLogoSvg) }}
                  />
                ) : (
                  <span className="text-xs font-serif font-black">{brandPendingDeletion.brandName.slice(0, 2)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2] truncate">
                  {brandPendingDeletion.brandName}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-widest truncate">
                  {brandPendingDeletion.industry}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                id="cancel-delete-brand-btn"
                onClick={() => setBrandPendingDeletion(null)}
                className="px-4 py-2 text-xs uppercase tracking-wider font-bold border border-gray-300 dark:border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-[#1A1A1A] dark:text-[#F9F7F2] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-brand-btn"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs uppercase tracking-wider font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Brand Bible</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
