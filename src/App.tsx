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
import {
  getSession,
  signInWithEmail,
  registerAccount,
  signInWithGoogle,
  signOut as authSignOut,
  fetchBrandLibrary,
  saveBrandToCloud,
  deleteBrandFromCloud,
  uploadRenderedImage,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  SessionUser,
} from './lib/authClient';
import { shareBrandBible } from './lib/share';
import { createMilestoneCheckpoint } from './lib/evolution';
import { sanitizeBrandBible, sanitizeBrandList } from './lib/brandValidation';

// Storage keys — GABI-prefixed. Legacy brand_studio_* keys are still read as
// a one-time migration fallback so existing users keep their libraries.
const SAVED_BRANDS_KEY = 'gabi_saved_brands';
const GUEST_SESSION_KEY = 'gabi_guest_session_bibles';
const STUDIO_SETTINGS_KEY = 'gabi_user_settings';
const DARK_MODE_KEY = 'gabi_dark_mode';
const TOUR_SEEN_KEY = 'gabi_tour_seen';

// Legacy (pre-rebrand) keys — read-only fallbacks for one-time migration.
const LEGACY_KEYS = {
  savedBrands: ['brand_studio_saved_brands', 'brand_studio_bibles', 'saved_brands', 'brands'],
  guestSession: ['brand_studio_guest_session_bibles'],
  darkMode: 'brand_studio_dark_mode',
  tourSeen: 'brand_studio_tour_seen',
};

// AI-rendered logo images arrive as base64 data URLs that would bloat
// localStorage. Strip oversized payloads before persisting; the in-memory
// brand keeps the full URL for display.
const DATA_URL_SAFE_LIMIT = 900 * 1024;
function sanitizeBrandForPersistence(brand: BrandBible): BrandBible {
  const url = brand.generatedLogoImageUrl;
  if (url && url.startsWith('data:') && url.length > DATA_URL_SAFE_LIMIT) {
    const { generatedLogoImageUrl, generatedLogoResolution, ...rest } = brand;
    return rest as BrandBible;
  }
  return brand;
}

// Writes the brand library to storage: localStorage gets oversized base64 data
// URLs stripped, sessionStorage keeps the full state for the current session.
// Cloud-synced accounts persist the full library server-side (Neon Postgres).
function writeSavedBrands(updated: BrandBible[]) {
  try {
    // Never persist a malformed doc: sanitize on the way out as well as in.
    const clean = updated
      .map(sanitizeBrandBible)
      .filter((b): b is BrandBible => b !== null);
    localStorage.setItem(SAVED_BRANDS_KEY, JSON.stringify(clean.map(sanitizeBrandForPersistence)));
    sessionStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(clean));
  } catch (e) {
    console.warn('Storage write error:', e);
  }
}

// Comprehensive loader that recovers the user's saved brands from local and
// session storage. Only brands the user actually created or imported are
// restored — demo/showcase brands are never injected into the library (they
// would otherwise be backfilled to the user's cloud account on login).
function loadInitialSavedBrands(): BrandBible[] {
  const foundMap = new Map<string, BrandBible>();

  // 1. Recover from all possible localStorage locations — new GABI keys first,
  //    then legacy brand_studio_* keys so fresh data wins on id collisions.
  const localKeys = [
    SAVED_BRANDS_KEY,
    GUEST_SESSION_KEY,
    ...LEGACY_KEYS.savedBrands,
    ...LEGACY_KEYS.guestSession,
  ];
  for (const k of localKeys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((b: unknown) => {
            const clean = sanitizeBrandBible(b);
            if (clean) foundMap.set(clean.id, clean);
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
        parsed.forEach((b: unknown) => {
          const clean = sanitizeBrandBible(b);
          if (clean) foundMap.set(clean.id, clean);
        });
      }
    }
  } catch {
    // Ignore parse error
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
  const [user, setUser] = useState<SessionUser | null>(null);
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
      const stored = localStorage.getItem(DARK_MODE_KEY) ?? localStorage.getItem(LEGACY_KEYS.darkMode);
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
  const [pendingReset, setPendingReset] = useState<{ token: string; email: string } | null>(null);

  // Check if first-time visitor should see the interactive tour
  useEffect(() => {
    try {
      const tourSeen = localStorage.getItem(TOUR_SEEN_KEY) ?? localStorage.getItem(LEGACY_KEYS.tourSeen);
      if (!tourSeen) {
        // Automatically pop tour for new users
        setIsTourOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // The tour needs a brand to demo; fall back to a showcase demo brand
  // (display-only — never persisted to the user's library or cloud).
  const ensureBrandForTour = () => {
    if (activeBrand) return;
    const candidate = savedBrands[0] || DEFAULT_SAVED_BRANDS[0];
    if (candidate) setActiveBrand(candidate);
  };

  const handleOpenTour = () => {
    ensureBrandForTour();
    setTourTabOverride('overview');
    setTourViewModeOverride('simple');
    setIsTourOpen(true);
  };

  const handleTourNavigateTab = (tab: TabType) => {
    ensureBrandForTour();
    setTourTabOverride(tab);
  };

  const handleTourSetViewMode = (mode: 'simple' | 'studio') => {
    ensureBrandForTour();
    setTourViewModeOverride(mode);
  };

  // Persistently synchronize saved brands across local and session storage.
  // localStorage always reflects the latest library (even when emptied) with
  // oversized base64 image payloads stripped; sessionStorage keeps full state.
  useEffect(() => {
    writeSavedBrands(savedBrands);
  }, [savedBrands]);

  // Sync dark mode class to both html and body elements
  useEffect(() => {
    try {
      localStorage.setItem(DARK_MODE_KEY, String(isDarkMode));
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

  // Auth session check + cloud library synchronization (Neon via server API)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (cancelled) return;
      setUser(session?.user || null);
      if (session?.user?.id) {
        try {
          const cloudBrands = await fetchBrandLibrary();
          if (cancelled) return;

          // Merge local and cloud brands so no user creation is lost
          const localBrands = loadInitialSavedBrands();
          const mergedMap = new Map<string, BrandBible>();
          sanitizeBrandList(cloudBrands).forEach((b) => mergedMap.set(b.id, b));

          // Backfill any local brand that hasn't been synced yet
          localBrands.forEach((b) => {
            if (!mergedMap.has(b.id)) {
              const owned = { ...b, userId: session.user!.id };
              mergedMap.set(b.id, owned);
              saveBrandToCloud(owned).catch(() => {});
            }
          });

          const mergedBrands = Array.from(mergedMap.values());
          mergedBrands.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          setSavedBrands(mergedBrands);
          writeSavedBrands(mergedBrands);

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
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // After an email/Google sign-in, merge the local library into the cloud account.
  const syncLocalLibraryAfterLogin = async (sessionUser: SessionUser) => {
    const cloudBrands = await fetchBrandLibrary();
    const localBrands = loadInitialSavedBrands();
    const mergedMap = new Map<string, BrandBible>();
    sanitizeBrandList(cloudBrands).forEach((b) => mergedMap.set(b.id, b));
    localBrands.forEach((b) => {
      if (!mergedMap.has(b.id)) {
        const owned = { ...b, userId: sessionUser.id };
        mergedMap.set(b.id, owned);
        saveBrandToCloud(owned).catch(() => {});
      }
    });
    const mergedBrands = Array.from(mergedMap.values());
    mergedBrands.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setSavedBrands(mergedBrands);
    writeSavedBrands(mergedBrands);
    if (mergedBrands.length > 0) {
      setActiveBrand((prev) => prev || mergedBrands[0]);
    }
  };

  // Google OAuth — full-page redirect to the Auth.js provider flow
  const handleLogin = async () => {
    setErrorMessage(null);
    signInWithGoogle();
  };

  // Email + password sign-in
  const handleEmailLogin = async (email: string, password: string) => {
    setErrorMessage(null);
    try {
      const session = await signInWithEmail(email, password);
      if (session?.user) {
        setUser(session.user);
        await syncLocalLibraryAfterLogin(session.user);
        setShareToast('Signed in — your library is now cloud-synced.');
        setTimeout(() => setShareToast(null), 3500);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not sign in with email and password.');
    }
  };

  // Create a new email/password account, then sign in
  const handleRegister = async (email: string, password: string, name?: string) => {
    setErrorMessage(null);
    try {
      await registerAccount(email, password, name);
      const session = await signInWithEmail(email, password);
      if (session?.user) {
        setUser(session.user);
        setShareToast('Account created — welcome to GABI! Check your inbox for a verification link.');
        setTimeout(() => setShareToast(null), 4500);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not create your account.');
    }
  };

  // Handle Logout action - preserve local library
  const handleLogout = async () => {
    try {
      setErrorMessage(null);
      await authSignOut();
      setUser(null);
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

  // ── Email verification & password reset ────────────────────────────────
  const handleForgotPassword = async (email: string) => {
    setErrorMessage(null);
    try {
      // Server always answers ok (no account enumeration); toast is generic.
      await forgotPassword(email);
      setShareToast('If an account exists for that email, a reset link is on its way.');
      setTimeout(() => setShareToast(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not start the password reset.');
    }
  };

  const handleResetPassword = async (token: string, email: string, password: string) => {
    setErrorMessage(null);
    try {
      await resetPassword(token, email, password);
      setPendingReset(null);
      // Sign the user in with the new password for a seamless continuation.
      const session = await signInWithEmail(email, password);
      if (session?.user) {
        setUser(session.user);
        await syncLocalLibraryAfterLogin(session.user);
      }
      setShareToast('Password updated — you are signed in.');
      setTimeout(() => setShareToast(null), 3500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not reset your password.');
    }
  };

  const handleResendVerification = async () => {
    setErrorMessage(null);
    try {
      await resendVerificationEmail();
      setShareToast(`Verification email sent to ${user?.email || 'your inbox'} — check spam too.`);
      setTimeout(() => setShareToast(null), 4500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not resend the verification email.');
    }
  };

  // Consume emailed auth links (?verify=…&email=… / ?reset=…&email=…) once on
  // load, then strip the parameters so the URL stays clean.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verify');
    const resetToken = params.get('reset');
    const email = (params.get('email') || '').trim().toLowerCase();
    if (!email) return;
    const strip = () => {
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch {
        // ignore
      }
    };
    if (verifyToken) {
      strip();
      (async () => {
        try {
          await verifyEmail(verifyToken, email);
          setShareToast('Email verified — your GABI account is fully protected.');
          const session = await getSession(true);
          setUser(session?.user || null);
        } catch (err: any) {
          setErrorMessage(err?.message || 'This verification link is invalid or has expired.');
        }
        setTimeout(() => setShareToast(null), 5000);
      })();
    } else if (resetToken) {
      strip();
      setPendingReset({ token: resetToken, email });
      setIsAccountOpen(true);
    }
  }, []);

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

      // Defense in depth: never let a partial engine response into the app.
      const newBrand = sanitizeBrandBible(data);
      if (!newBrand) {
        throw new Error('The engine returned an incomplete Brand Bible — please try again.');
      }

      // Record Milestone in Brand Evolution
      if (req.isExistingBrandRefresh) {
        createMilestoneCheckpoint(newBrand, {
          title: `Brand Upgrade & Modernization`,
          changeNote: `Upgraded visual identity, typography pairing, vector mark suite, and brand guidelines while preserving brand equity.`,
          category: 'identity_refresh',
          tags: ['Identity Upgrade', 'Modernization', req.aesthetic || 'Brand Bible'],
        });
      }

      // If user is authenticated, save permanently to the cloud (Neon via server API)
      if (user?.id) {
        newBrand.userId = user.id;
        try {
          await saveBrandToCloud(newBrand);
        } catch (e) {
          console.warn('Cloud save failed; keeping brand locally:', e);
        }
      }

      setSavedBrands((prev) => {
        const updated = [newBrand, ...prev.filter((b) => b.id !== newBrand.id)];
        writeSavedBrands(updated);
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
      if (user?.id) {
        try {
          await deleteBrandFromCloud(id);
        } catch (e) {
          console.warn('Cloud delete failed; removing locally:', e);
        }
      }
      const updated = savedBrands.filter((b) => b.id !== id);
      setSavedBrands(updated);
      writeSavedBrands(updated);
      if (activeBrand?.id === id) {
        setActiveBrand(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      console.error('Error deleting brand:', err);
      setErrorMessage('Failed to delete brand.');
    }
  };

  // Handle High-Res AI Logo Image Generation
  const handleGenerateLogoImage = async (prompt: string, resolution: string, provider?: string) => {
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
          provider: provider || 'auto',
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

      let imageUrl: string | undefined = data.imageUrl;
      if (user?.id && imageUrl && imageUrl.startsWith('data:')) {
        try {
          // Persist the render to server-side object storage (R2) so multi-MB
          // base64 payloads never bloat the database; fall back to the data URL.
          imageUrl = await uploadRenderedImage(imageUrl, activeBrand.id);
        } catch (e) {
          console.warn('Failed to upload rendered logo to object storage:', e);
        }
      }

      const updatedBrand: BrandBible = {
        ...activeBrand,
        generatedLogoImageUrl: imageUrl,
        generatedLogoResolution: data.resolution,
      };

      // Record AI Polish milestone in brand evolution timeline
      createMilestoneCheckpoint(updatedBrand, {
        title: `AI High-Res Logomark (${data.resolution || '1024x1024'})`,
        changeNote: `Generated photorealistic 3D high-resolution mark rendering (${data.engine || 'AI'}).`,
        category: 'ai_enhancement',
        tags: ['AI Rendering', 'High-Res Mark', data.engine || 'AI'],
      });

      if (user?.id) {
        updatedBrand.userId = user.id;
        try {
          await saveBrandToCloud(updatedBrand);
        } catch (e) {
          console.warn('Cloud save failed; keeping render locally:', e);
        }
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

  // Re-fetch and synchronize the cloud library (Neon via server API)
  const handleRefreshCloudSync = async () => {
    if (user?.id) {
      try {
        const cloudBrands = await fetchBrandLibrary();
        cloudBrands.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (cloudBrands.length > 0) {
          setSavedBrands(cloudBrands);
          writeSavedBrands(cloudBrands);
          if (!activeBrand) setActiveBrand(cloudBrands[0]);
          return;
        }
      } catch (e) {
        console.warn('Cloud refresh query notice:', e);
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
    const clean = sanitizeBrandBible(brandToImport);
    if (!clean) {
      setShareToast('Import failed — that file is not a valid Brand Bible.');
      setTimeout(() => setShareToast(null), 3500);
      return;
    }
    const brandWithOwnership = { ...clean };
    if (user?.id) {
      brandWithOwnership.userId = user.id;
      try {
        await saveBrandToCloud(brandWithOwnership);
      } catch (e) {
        console.warn('Could not save imported brand to the cloud:', e);
      }
    }
    setSavedBrands((prev) => {
      const exists = prev.some((b) => b.id === brandWithOwnership.id);
      const updated = exists
        ? prev.map((b) => (b.id === brandWithOwnership.id ? brandWithOwnership : b))
        : [brandWithOwnership, ...prev];
      writeSavedBrands(updated);
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
            onSelectShowcaseBrand={(brand) => setActiveBrand(brand)}
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
        onEmailLogin={handleEmailLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        onForgotPassword={handleForgotPassword}
        onResetPassword={handleResetPassword}
        onResendVerification={handleResendVerification}
        pendingReset={pendingReset}
        onClearPendingReset={() => setPendingReset(null)}
        onRefreshCloudSync={handleRefreshCloudSync}
        studioSettings={studioSettings}
        onUpdateStudioSettings={handleUpdateStudioSettings}
      />

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] dark:border-[#F9F7F2]/20 mt-8 py-6 text-center transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] font-black uppercase tracking-[0.5em] opacity-40 text-[#1A1A1A] dark:text-[#F9F7F2]">
          <span>GABI // Generate. Align. Build. Inspire.</span>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-10">
            <span>Turning brand ideas into complete, consistent identities.</span>
            <span>Powered by OpenAI · Claude · Gemini · Higgsfield</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
