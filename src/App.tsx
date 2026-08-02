import { useState, useEffect } from 'react';
import { BrandBible, GenerateBrandRequest } from './types';
import { Header } from './components/Header';
import { BrandInputForm } from './components/BrandInputForm';
import { BrandDashboard } from './components/BrandDashboard';
import { AiBrandAssistant } from './components/AiBrandAssistant';
import { ExportModal } from './components/ExportModal';
import { AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'brand_studio_saved_bibles';

export default function App() {
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

  const [isLoadingBrand, setIsLoadingBrand] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [isGeneratingLogoImage, setIsGeneratingLogoImage] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedBrands));
    } catch (e) {
      console.error('Failed to save brands to localStorage', e);
    }
  }, [savedBrands]);

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

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newBrand: BrandBible = data;
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

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const updatedBrand: BrandBible = {
        ...activeBrand,
        generatedLogoImageUrl: data.imageUrl,
        generatedLogoResolution: data.resolution,
      };

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

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#1A1A1A] selection:text-[#F9F7F2]">
      {/* Header Bar */}
      <Header
        activeBrand={activeBrand}
        savedBrands={savedBrands}
        onSelectBrand={(brand) => setActiveBrand(brand)}
        onNewBrand={() => setActiveBrand(null)}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        onOpenExport={() => setIsExportOpen(true)}
        isChatOpen={isChatOpen}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto mt-4 px-4 w-full">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
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
      <footer className="border-t border-[#1A1A1A] mt-8 py-6 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] font-black uppercase tracking-[0.5em] opacity-40">
          <span>Brand Studio AI // Generator</span>
          <div className="flex gap-10">
            <span>Powered by Gemini</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
