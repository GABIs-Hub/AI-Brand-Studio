import { useState, useEffect, useCallback } from 'react';
import { BrandBible, GenerateBrandRequest, UserStudioSettings } from './types';
import { DEFAULT_SAVED_BRANDS } from './data/defaultBrands';
import { Header } from './components/Header';
import { BrandInputForm } from './components/BrandInputForm';
import { BrandDashboard } from './components/BrandDashboard';
import { AiBrandAssistant } from './components/AiBrandAssistant';
import { ExportModal } from './components/ExportModal';
import { AccountModal } from './components/AccountModal';
import { ProjectTour } from './components/ProjectTour';
import { FloatingAiDirector } from './components/FloatingAiDirector';
import { BrandDeckPresentationModal } from './components/BrandDeckPresentationModal';
import { TabType } from './components/BrandDashboard';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, googleProvider, signInWithPopup, signOut, db, User } from './lib/firebase';
import { shareBrandBible } from './lib/share';
import { createMilestoneCheckpoint } from './lib/evolution';

// Storage keys
const SAVED_BRANDS_KEY = 'brand_studio_saved_brands';
const GUEST_SESSION_KEY = 'brand_studio_guest_session_bibles';
const STUDIO_SETTINGS_KEY = 'brand_studio_user_settings';

// Comprehensive loader that recovers all saved brands from local and session storage with default flagship fallbacks
function loadInitialSavedBrands(): BrandBible[] {
  const foundMap = new Map<string, BrandBible>();

  // 1. Recover from all possible localStorage locations
  const localKeys = [
    SAVED_BRANDS_KEY,
    GUEST_SESSION_KEY,
    'brand_studio_bibles',
    'saved_brands',
    'brands'
  ];
  for (const k of localKeys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((b: BrandBible) => {
            if (b && b.id && b.brandName) {
              foundMap.set(b.id, b);
            }
          });
        }
      }
    } catch {
      // Ignore parse error
    }
  }

  // 2. Recover from sessionStorage
  try {
    const raw = sessionStorage.getItem(GUEST_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((b: BrandBible) => {
          if (b && b.id && b.brandName) {
            foundMap.set(b.id, b);
          }
        });
      }
    }
  } catch {
    // Ignore parse error
  }

  // 3. If no user brands were found or to complement the studio library, incorporate default flagship brands
  if (foundMap.size === 0) {
    DEFAULT_SAVED_BRANDS.forEach((b) => foundMap.set(b.id, b));
  } else {
    // Ensure flagship showcase brands exist in library if not already present
    DEFAULT_SAVED_BRANDS.forEach((b) => {
      if (!foundMap.has(b.id)) {
        const existsByName = Array.from(foundMap.values()).some(
          (existing) => existing.brandName.toLowerCase() === b.brandName.toLowerCase()
        );
        if (!existsByName) {
          foundMap.set(b.id, b);
        }
      }
    });
  }

  const result = Array.from(foundMap.values());
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  try {
    localStorage.setItem(SAVED_BRANDS_KEY, JSON.stringify(result));
  } catch {
    // Ignore storage quota
  }

  return result;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initialBrandToUpgrade, setInitialBrandToUpgrade] = useState<BrandBible | null>(null);

  // Initialize saved brands with persistent recovery & flagship default brand bibles
  const [savedBrands, setSavedBrands] = useState<BrandBible[]>(() => {
    return loadInitialSavedBrands();
  });

  const [activeBrand, setActiveBrand] = useState<BrandBible | null>(() => {
    const initial = loadInitialSavedBrands();
    return initial.length > 0 ? initial[0] : null;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('brand_studio_dark_mode');
      if (stored !== null) {
        return stored === 'true';
      }
      return false;
    } catch {
      return false;
    }
  });

  const [studioSettings, setStudioSettings] = useState<UserStudioSettings>(() => {
    try {
      const stored = localStorage.getItem(STUDIO_SETTINGS_KEY);
      return stored
        ? JSON.parse(stored)
        : {
            studioName: 'Independent Creative Studio',
            creativeDirector: 'Creative Director',
            defaultIndustry: 'Technology & SaaS',
            defaultAesthetic: 'Minimalist Swiss & Neo-Modern',
            autoRecordMilestones: true,
            highResRenderMode: 'high_definition',
            colorPaletteHarmony: 'balanced',
          };
    } catch {
      return {
        studioName: 'Independent Creative Studio',
        creativeDirector: 'Creative Director',
        defaultIndustry: 'Technology & SaaS',
        defaultAesthetic: 'Minimalist Swiss & Neo-Modern',
        autoRecordMilestones: true,
        highResRenderMode: 'high_definition',
        colorPaletteHarmony: 'balanced',
      };
    }
  });

  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourTabOverride, setTourTabOverride] = useState<TabType>('overview');
  const [tourViewModeOverride, setTourViewModeOverride] = useState<'simple' | 'studio' | undefined>(undefined);
  const [isLoadingBrand, setIsLoadingBrand] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [isGeneratingLogoImage, setIsGeneratingLogoImage] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Check if first-time visitor should see the interactive tour
  useEffect(() => {
    try {
      const tourSeen = localStorage.getItem('brand_studio_tour_seen');
      if (!tourSeen) {
        // Automatically pop tour for new users
        setIsTourOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleOpenTour = () => {
    // If no brand selected, select the first saved showcase brand
    if (!activeBrand && savedBrands.length > 0) {
      setActiveBrand(savedBrands[0]);
    }
    setTourTabOverride('overview');
    setTourViewModeOverride('simple');
    setIsTourOpen(true);
  };

  const handleTourNavigateTab = (tab: TabType) => {
    // If no active brand, select the first saved showcase brand
    if (!activeBrand && savedBrands.length > 0) {
      setActiveBrand(savedBrands[0]);
    }
    setTourTabOverride(tab);
  };

  const handleTourSetViewMode = (mode: 'simple' | 'studio') => {
    if (!activeBrand && savedBrands.length > 0) {
      setActiveBrand(savedBrands[0]);
    }
    setTourViewModeOverride(mode);
  };

  // Persistently synchronize saved brands across local and session storage
  useEffect(() => {
    try {
      if (savedBrands && savedBrands.length > 0) {
        localStorage.setItem(SAVED_BRANDS_KEY, JSON.stringify(savedBrands));
        sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(savedBrands));
      }
    } catch (e) {
      console.error('Failed to sync saved brands to local storage', e);
    }
  }, [savedBrands]);

  // Sync dark mode class to both html and body elements
  useEffect(() => {
    try {
      localStorage.setItem('brand_studio_dark_mode', String(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed to sync dark mode', e);
    }
  }, [isDarkMode]);

  // Firebase Authentication and Firestore synchronization listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Fetch brands from Firestore for authenticated user
          const fetchPromise = (async () => {
            const q = query(
              collection(db, 'brands'),
              where('userId', '==', firebaseUser.uid)
            );
            const querySnapshot = await getDocs(q);
            const cloudBrands: BrandBible[] = [];
            querySnapshot.forEach((docSnap) => {
              cloudBrands.push(docSnap.data() as BrandBible);
            });
            return cloudBrands;
          })();

          const timeoutPromise = new Promise<BrandBible[]>((_, reject) =>
            setTimeout(() => reject(new Error('Firestore sync timeout')), 4000)
          );

          const cloudBrands = await Promise.race([fetchPromise, timeoutPromise]);

          // Merge local and cloud brands so no user creation is lost
          const localBrands = loadInitialSavedBrands();
          const mergedMap = new Map<string, BrandBible>();

          // Add cloud brands first
          cloudBrands.forEach((b) => mergedMap.set(b.id, b));

          // Add any local brand that hasn't been synced yet
          localBrands.forEach((b) => {
            if (!mergedMap.has(b.id)) {
              mergedMap.set(b.id, { ...b, userId: firebaseUser.uid });
              // Backfill to Firestore
              setDoc(doc(db, 'brands', b.id), { ...b, userId: firebaseUser.uid }).catch(() => {});
            }
          });

          const mergedBrands = Array.from(mergedMap.values());
          mergedBrands.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          setSavedBrands(mergedBrands);
          try {
            localStorage.setItem(SAVED_BRANDS_KEY, JSON.stringify(mergedBrands));
          } catch {}

          if (mergedBrands.length > 0) {
            setActiveBrand((prev) => prev || mergedBrands[0]);
          }
        } catch (e) {
          console.info('Cloud database offline or unreachable; using local storage:', e);
          const localBrands = loadInitialSavedBrands();
          setSavedBrands(localBrands);
          if (localBrands.length > 0) {
            setActiveBrand((prev) => prev || localBrands[0]);
          }
        }
      } else {
        // Logged out / Guest: read from persistent local storage
        const localBrands = loadInitialSavedBrands();
        setSavedBrands(localBrands);
        if (localBrands.length > 0) {
          setActiveBrand((prev) => prev || localBrands[0]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Google Login action
  const handleLogin = async () => {
    try {
      setErrorMessage(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        // User closed popup intentionally
        return;
      }
      console.warn('Google login notice:', err?.message || err);
      setErrorMessage(err.message || 'Google authentication could not be completed.');
    }
  };

  // Handle Logout action - preserve local library
  const handleLogout = async () => {
    try {
      setErrorMessage(null);
      await signOut(auth);
      // Keep existing brands in local library rather than wiping them
      const localBrands = loadInitialSavedBrands();
      setSavedBrands(localBrands);
      if (localBrands.length > 0) {
        setActiveBrand((prev) => prev || localBrands[0]);
      }
      setShareToast('Logged out of cloud sync. Your local library remains intact.');
      setTimeout(() => setShareToast(null), 3000);
    } catch (err: any) {
      console.warn('Logout notice:', err);
    }
  };

  // Handle Brand Bible Generation / Upgrade
  const handleGenerateBrand = async (req: GenerateBrandRequest) => {
    setIsLoadingBrand(true);
    setLoadingStep(req.isExistingBrandRefresh ? 'Analyzing existing brand equity & mission...' : 'Analyzing brand mission & category...');
    setErrorMessage(null);

    try {
      setTimeout(() => setLoadingStep('Synthesizing 5-color harmony & typography pairings...'), 1500);
      setTimeout(() => setLoadingStep('Crafting primary & secondary vector marks...'), 3500);
      setTimeout(() => setLoadingStep('Building Brand Bible Dashboard...'), 5500);

      const res = await fetch('/api/generate-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      if (!res.ok) {
        let errorDetail = 'Failed to generate brand identity.';
        try {
          const errJson = await res.json();
          if (errJson?.error) errorDetail = errJson.error;
        } catch {
          const rawText = await res.text().catch(() => '');
          if (rawText) errorDetail = `Server response error (${res.status})`;
        }
        throw new Error(errorDetail);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newBrand: BrandBible = data;

      // Record Milestone in Brand Evolution
      if (req.isExistingBrandRefresh) {
        createMilestoneCheckpoint(newBrand, {
          title: `Brand Upgrade & Modernization`,
          changeNote: `Upgraded visual identity, typography pairing, vector mark suite, and brand guidelines while preserving brand equity.`,
          category: 'identity_refresh',
          tags: ['Identity Upgrade', 'Modernization', req.aesthetic || 'Brand Bible'],
        });
      }

      // If user is authenticated, save permanently to Firestore Cloud Database
      if (user) {
        newBrand.userId = user.uid;
        await setDoc(doc(db, 'brands', newBrand.id), newBrand);
      }

      setSavedBrands((prev) => {
        const updated = [newBrand, ...prev.filter((b) => b.id !== newBrand.id)];
        try {
          localStorage.setItem(SAVED_BRANDS_KEY, JSON.stringify(updated));
          sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Storage write error:', e);
        }
        return updated;
      });
      setActiveBrand(newBrand);
      setInitialBrandToUpgrade(null);
    } catch (err: any) {
      console.error('Error generating brand:', err);
      setErrorMessage(err.message || 'Failed to generate brand identity.');
    } finally {
      setIsLoadingBrand(false);
      setLoadingStep('');
    }
  };

  // Handle Delete Brand
  const handleDeleteBrand = async (id: string) => {
    try {
      if (user) {
        await deleteDoc(doc(db, 'brands', id));
      }
      const updated = savedBrands.filter((b) => b.id !== id);
      setSavedBrands(updated);
      try {
        localStorage.setItem(SAVED_BRANDS_KEY, JSON.stringify(updated));
        sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage write error:', e);
      }
      if (activeBrand?.id === id) {
        setActiveBrand(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      console.error('Error deleting brand:', err);
      setErrorMessage('Failed to delete brand.');
    }
  };

  // Handle High-Res AI Logo Image Generation
  const handleGenerateLogoImage = async (prompt: string, resolution: string) => {
    if (!activeBrand) return;
    setIsGeneratingLogoImage(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate-logo-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          resolution,
          brandName: activeBrand.brandName,
          industry: activeBrand.industry,
          palette: activeBrand.palette,
          logoSvg: activeBrand.logo?.primaryLogoSvg,
          tagline: activeBrand.tagline,
          typography: activeBrand.typography,
        }),
      });

      if (!res.ok) {
        let errorDetail = 'Failed to generate AI logo rendering.';
        try {
          const errJson = await res.json();
          if (errJson?.error) errorDetail = errJson.error;
        } catch {
          // ignore fallback
        }
        throw new Error(errorDetail);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const updatedBrand: BrandBible = {
        ...activeBrand,
        generatedLogoImageUrl: data.imageUrl,
        generatedLogoResolution: data.resolution,
      };

      // Record AI Polish milestone in brand evolution timeline
      createMilestoneCheckpoint(updatedBrand, {
        title: `AI High-Res Logomark (${data.resolution || '1024x1024'})`,
        changeNote: `Generated photorealistic 3D high-resolution mark rendering using Imagen 3 model.`,
        category: 'ai_enhancement',
        tags: ['AI Rendering', 'High-Res Mark', 'Imagen 3'],
      });

      if (user) {
        updatedBrand.userId = user.uid;
        await setDoc(doc(db, 'brands', updatedBrand.id), updatedBrand);
      } else {
        const currentGuest = JSON.parse(sessionStorage.getItem(GUEST_SESSION_KEY) || '[]');
        const updatedGuest = currentGuest.map((b: BrandBible) => b.id === updatedBrand.id ? updatedBrand : b);
        sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(updatedGuest));
      }

      setActiveBrand(updatedBrand);
      setSavedBrands((prev) =>
        prev.map((b) => (b.id === updatedBrand.id ? updatedBrand : b))
      );
    } catch (err: any) {
      console.error('Error generating logo image:', err);
      setErrorMessage(err.message || 'Failed to generate AI logo rendering.');
    } finally {
      setIsGeneratingLogoImage(false);
    }
  };

  // Handle Share Brand using Web Share API with clipboard fallback
  const handleShareBrand = async () => {
    if (!activeBrand) return;
    try {
      const res = await shareBrandBible(activeBrand);
      if (res.success) {
        setShareToast(
          res.method === 'native-share'
            ? 'Brand Bible shared successfully!'
            : 'Brand summary snippet copied to clipboard!'
        );
        setTimeout(() => setShareToast(null), 3500);
      } else if (!res.aborted && res.error) {
        setErrorMessage('Unable to share brand summary snippet.');
      }
    } catch (err) {
      console.error('Error sharing brand:', err);
      setErrorMessage('Failed to initiate brand share.');
    }
  };

  const handleTriggerUpgrade = (brandToUpgrade: BrandBible) => {
    setInitialBrandToUpgrade(brandToUpgrade);
    setActiveBrand(null);
    setIsChatOpen(false);
  };

  // Re-fetch and synchronize cloud library with Firestore
  const handleRefreshCloudSync = async () => {
    if (user) {
      try {
        const q = query(
          collection(db, 'brands'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const cloudBrands: BrandBible[] = [];
        querySnapshot.forEach((docSnap) => {
          cloudBrands.push(docSnap.data() as BrandBible);
        });
        cloudBrands.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (cloudBrands.length > 0) {
          setSavedBrands(cloudBrands);
          try {
            localStorage.setItem(SAVED_BRANDS_KEY, JSON.stringify(cloudBrands));
          } catch {}
          if (!activeBrand) setActiveBrand(cloudBrands[0]);
          return;
        }
      } catch (e) {
        console.warn('Firestore refresh query notice:', e);
      }
    }
    const localBrands = loadInitialSavedBrands();
    setSavedBrands(localBrands);
    if (localBrands.length > 0 && !activeBrand) {
      setActiveBrand(localBrands[0]);
    }
  };

  // Handle Importing a Brand Bible (JSON)
  const handleImportBrand = async (brandToImport: BrandBible) => {
    const brandWithOwnership = { ...brandToImport };
    if (user) {
      brandWithOwnership.userId = user.uid;
      try {
        await setDoc(doc(db, 'brands', brandWithOwnership.id), brandWithOwnership);
      } catch (e) {
        console.warn('Could not save imported brand to Firestore:', e);
      }
    }
    setSavedBrands((prev) => {
      const exists = prev.some((b) => b.id === brandWithOwnership.id);
      const updated = exists
        ? prev.map((b) => (b.id === brandWithOwnership.id ? brandWithOwnership : b))
        : [brandWithOwnership, ...prev];
      try {
        localStorage.setItem(SAVED_BRANDS_KEY, JSON.stringify(updated));
        sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setActiveBrand(brandWithOwnership);
    setShareToast(`Imported "${brandWithOwnership.brandName}" to your library!`);
    setTimeout(() => setShareToast(null), 3000);
  };

  // Save studio settings
  const handleUpdateStudioSettings = (newSettings: UserStudioSettings) => {
    setStudioSettings(newSettings);
    try {
      localStorage.setItem(STUDIO_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save studio settings to localStorage', e);
    }
  };

  return (
    <div className={`min-h-screen bg-[#F9F7F2] dark:bg-[#181816] text-[#1A1A1A] dark:text-[#F9F7F2] font-sans flex flex-col selection:bg-[#1A1A1A] selection:text-[#F9F7F2] dark:selection:bg-[#F9F7F2] dark:selection:text-[#1A1A1A] transition-colors duration-300 relative`}>
      {/* Header Bar */}
      <Header
        activeBrand={activeBrand}
        savedBrands={savedBrands}
        onSelectBrand={(brand) => {
          setActiveBrand(brand);
          setInitialBrandToUpgrade(null);
        }}
        onNewBrand={() => {
          setActiveBrand(null);
          setInitialBrandToUpgrade(null);
          setIsChatOpen(false);
        }}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenDeck={() => setIsDeckOpen(true)}
        onOpenTour={handleOpenTour}
        onOpenResearch={() => {
          setActiveBrand(null);
          setInitialBrandToUpgrade(null);
          setIsChatOpen(false);
          // Wait a tick then click the research tab
          setTimeout(() => {
            const researchTab = document.getElementById('tab-research-brands-mode');
            if (researchTab) researchTab.click();
          }, 50);
        }}
        onShareBrand={handleShareBrand}
        isChatOpen={isChatOpen}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Share Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#1A1A1A] dark:bg-[#F9F7F2] text-[#F9F7F2] dark:text-[#1A1A1A] px-4 py-3 rounded-none shadow-2xl border border-[#F9F7F2]/20 dark:border-[#1A1A1A]/20 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">{shareToast}</span>
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto mt-4 px-4 w-full">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200 text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold hover:underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main App Body */}
      <main className="flex-1">
        {!activeBrand || isLoadingBrand ? (
          <BrandInputForm
            onGenerate={handleGenerateBrand}
            isLoading={isLoadingBrand}
            loadingStep={loadingStep}
            savedBrands={savedBrands}
            user={user}
            initialBrandToUpgrade={initialBrandToUpgrade}
            onClearInitialBrand={() => setInitialBrandToUpgrade(null)}
          />
        ) : (
          <BrandDashboard
            brand={activeBrand}
            onGenerateLogoImage={handleGenerateLogoImage}
            isGeneratingLogoImage={isGeneratingLogoImage}
            savedBrands={savedBrands}
            onSelectBrand={(b) => setActiveBrand(b)}
            onDeleteBrand={handleDeleteBrand}
            onUpgradeBrand={handleTriggerUpgrade}
            user={user}
            activeTabOverride={tourTabOverride}
            viewModeOverride={tourViewModeOverride}
            onViewModeChange={(mode) => setTourViewModeOverride(mode)}
          />
        )}
      </main>

      {/* Interactive Project Tour Floating Companion */}
      <ProjectTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={handleTourNavigateTab}
        onSetViewMode={handleTourSetViewMode}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        savedBrands={savedBrands}
        activeBrand={activeBrand}
        onSelectBrand={(brand) => {
          setActiveBrand(brand);
          setInitialBrandToUpgrade(null);
        }}
      />

      {/* Floating AI Director Trigger in Bottom-Right */}
      <FloatingAiDirector
        brand={activeBrand}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((prev) => !prev)}
      />

      {/* AI Assistant Drawer */}
      <AiBrandAssistant
        brand={activeBrand}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Export Modal */}
      <ExportModal
        brand={activeBrand}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onOpenPitchDeck={() => setIsDeckOpen(true)}
      />

      {/* Client Pitch Deck Presentation Modal */}
      <BrandDeckPresentationModal
        brand={activeBrand}
        isOpen={isDeckOpen}
        onClose={() => setIsDeckOpen(false)}
      />

      {/* Account Settings & Brand Library Hub Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={user}
        savedBrands={savedBrands}
        activeBrand={activeBrand}
        onSelectBrand={(brand) => {
          setActiveBrand(brand);
          setInitialBrandToUpgrade(null);
        }}
        onDeleteBrand={handleDeleteBrand}
        onUpgradeBrand={handleTriggerUpgrade}
        onImportBrand={handleImportBrand}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onRefreshCloudSync={handleRefreshCloudSync}
        studioSettings={studioSettings}
        onUpdateStudioSettings={handleUpdateStudioSettings}
      />

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] dark:border-[#F9F7F2]/20 mt-8 py-6 text-center transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] font-black uppercase tracking-[0.5em] opacity-40 text-[#1A1A1A] dark:text-[#F9F7F2]">
          <span>Brand Studio AI // Generator</span>
          <div className="flex gap-10">
            <span>Powered by Gemini</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
