import { useState, useEffect } from 'react';
import { BrandBible, GenerateBrandRequest } from './types';
import { Header } from './components/Header';
import { BrandInputForm } from './components/BrandInputForm';
import { BrandDashboard } from './components/BrandDashboard';
import { AiBrandAssistant } from './components/AiBrandAssistant';
import { ExportModal } from './components/ExportModal';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, googleProvider, signInWithPopup, signOut, db, User } from './lib/firebase';
import { shareBrandBible } from './lib/share';
import { createMilestoneCheckpoint } from './lib/evolution';

const STORAGE_KEY = 'brand_studio_saved_bibles';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [savedBrands, setSavedBrands] = useState<BrandBible[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeBrand, setActiveBrand] = useState<BrandBible | null>(() => {
    return savedBrands.length > 0 ? savedBrands[0] : null;
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

  const [isLoadingBrand, setIsLoadingBrand] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [isGeneratingLogoImage, setIsGeneratingLogoImage] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedBrands));
    } catch (e) {
      console.error('Failed to save brands to localStorage', e);
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
          // Fetch brands from Firestore with a 4-second timeout to avoid long hanging
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

          // Sort by creation date descending
          cloudBrands.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          // Merge local-only brands to the cloud
          const localStored = localStorage.getItem(STORAGE_KEY);
          const localBrands: BrandBible[] = localStored ? JSON.parse(localStored) : [];
          const localOnlyBrands = localBrands.filter(
            (local) => !cloudBrands.some((cloud) => cloud.id === local.id)
          );

          if (localOnlyBrands.length > 0) {
            for (const brand of localOnlyBrands) {
              const brandWithOwner = { ...brand, userId: firebaseUser.uid };
              setDoc(doc(db, 'brands', brand.id), brandWithOwner).catch(() => {});
              cloudBrands.unshift(brandWithOwner);
            }
          }

          setSavedBrands(cloudBrands);
          if (cloudBrands.length > 0) {
            setActiveBrand(cloudBrands[0]);
          } else {
            setActiveBrand(null);
          }
        } catch (e) {
          // Graceful fallback to local persistence when Firestore is offline/unreachable
          console.info('Cloud database offline or unreachable; using local storage:', e);
          try {
            const localStored = localStorage.getItem(STORAGE_KEY);
            const localBrands: BrandBible[] = localStored ? JSON.parse(localStored) : [];
            setSavedBrands(localBrands);
            if (localBrands.length > 0) {
              setActiveBrand(localBrands[0]);
            }
          } catch {
            // No local brands found
          }
        }
      } else {
        // Logged out: fallback to local storage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          const localBrands = stored ? JSON.parse(stored) : [];
          setSavedBrands(localBrands);
          if (localBrands.length > 0) {
            setActiveBrand(localBrands[0]);
          } else {
            setActiveBrand(null);
          }
        } catch {
          setSavedBrands([]);
          setActiveBrand(null);
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
        // User closed or dismissed the popup intentionally; ignore silently
        return;
      }
      console.warn('Google login notice:', err?.message || err);
      setErrorMessage(err.message || 'Google authentication could not be completed.');
    }
  };

  // Handle Logout action
  const handleLogout = async () => {
    try {
      setErrorMessage(null);
      await signOut(auth);
    } catch (err: any) {
      console.warn('Logout notice:', err);
    }
  };

  // Handle Brand Bible Generation
  const handleGenerateBrand = async (req: GenerateBrandRequest) => {
    setIsLoadingBrand(true);
    setLoadingStep('Analyzing brand mission & category...');
    setErrorMessage(null);

    try {
      setTimeout(() => setLoadingStep('Synthesizing 5-color harmony & typography pairings...'), 1500);
      setTimeout(() => setLoadingStep('Crafting primary & secondary SVG marks...'), 3500);
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
      if (user) {
        newBrand.userId = user.uid;
        await setDoc(doc(db, 'brands', newBrand.id), newBrand);
      }

      setSavedBrands((prev) => [newBrand, ...prev]);
      setActiveBrand(newBrand);
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
      if (activeBrand?.id === id) {
        setActiveBrand(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      console.error('Error deleting brand:', err);
      setErrorMessage('Failed to delete brand from the cloud database.');
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
        body: JSON.stringify({ prompt, resolution }),
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

  return (
    <div className={`min-h-screen bg-[#F9F7F2] dark:bg-[#181816] text-[#1A1A1A] dark:text-[#F9F7F2] font-sans flex flex-col selection:bg-[#1A1A1A] selection:text-[#F9F7F2] dark:selection:bg-[#F9F7F2] dark:selection:text-[#1A1A1A] transition-colors duration-300 relative`}>
      {/* Header Bar */}
      <Header
        activeBrand={activeBrand}
        savedBrands={savedBrands}
        onSelectBrand={(brand) => setActiveBrand(brand)}
        onNewBrand={() => setActiveBrand(null)}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        onOpenExport={() => setIsExportOpen(true)}
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
              className="text-xs font-semibold hover:underline shrink-0"
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
          />
        ) : (
          <BrandDashboard
            brand={activeBrand}
            onGenerateLogoImage={handleGenerateLogoImage}
            isGeneratingLogoImage={isGeneratingLogoImage}
            savedBrands={savedBrands}
            onSelectBrand={(b) => setActiveBrand(b)}
            onDeleteBrand={handleDeleteBrand}
          />
        )}
      </main>

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
