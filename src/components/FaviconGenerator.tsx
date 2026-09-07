import { useState, useEffect, useRef } from 'react';
import { BrandBible, SecondaryMark } from '../types';
import { sanitizeSvg } from '../utils/sanitizeSvg';
import {
  FAVICON_SPECS,
  FaviconRenderOptions,
  renderSvgToCanvas,
  canvasToBlob,
  createMultiSizeIco,
} from '../utils/faviconUtils';
import JSZip from 'jszip';
import {
  Download,
  Copy,
  Check,
  Globe,
  Smartphone,
  Bookmark,
  Sliders,
  Sparkles,
  Layers,
  Code2,
  FileCode,
  PackageCheck,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface FaviconGeneratorProps {
  brand: BrandBible;
}

export function FaviconGenerator({ brand }: FaviconGeneratorProps) {
  // Brand color references
  const primaryColor = brand.palette.find((c) => c.role === 'Primary')?.hex || '#1E40AF';
  const darkColor = brand.palette.find((c) => c.role === 'Neutral Dark')?.hex || '#0F172A';
  const lightColor = brand.palette.find((c) => c.role === 'Neutral Light')?.hex || '#F8F9FA';

  // Mark options available for extraction
  const markOptions: { id: string; title: string; svg: string; description: string }[] = [
    { id: 'primary', title: 'Primary Logomark', svg: brand.logo.primaryLogoSvg, description: 'Direct extraction from main brand identity' },
    ...brand.secondaryMarks.map((m) => ({
      id: m.id,
      title: m.title,
      svg: m.svg,
      description: m.description,
    })),
  ];

  const [selectedMarkId, setSelectedMarkId] = useState<string>('primary');
  const [renderOptions, setRenderOptions] = useState<FaviconRenderOptions>({
    background: 'transparent',
    paddingPercent: 12,
    borderRadiusPercent: 0,
  });

  const [previewUrls, setPreviewUrls] = useState<{ [size: number]: string }>({});
  const [icoBlob, setIcoBlob] = useState<Blob | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [copiedType, setCopiedType] = useState<'html' | 'manifest' | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  const activeSvg = markOptions.find((m) => m.id === selectedMarkId)?.svg || brand.logo.primaryLogoSvg;

  // Re-render all favicon canvas previews when options or active mark changes
  useEffect(() => {
    let isCancelled = false;

    async function generateAllPreviews() {
      setIsRendering(true);
      const newUrls: { [size: number]: string } = {};

      try {
        const brandColors = { primary: primaryColor, dark: darkColor, light: lightColor };

        for (const spec of FAVICON_SPECS) {
          const canvas = await renderSvgToCanvas(activeSvg, spec.size, renderOptions, brandColors);
          const blob = await canvasToBlob(canvas);
          const url = URL.createObjectURL(blob);
          newUrls[spec.size] = url;
        }

        const ico = await createMultiSizeIco(activeSvg, renderOptions, brandColors);

        if (!isCancelled) {
          // Revoke previous URLs to avoid memory leaks
          Object.values(previewUrls).forEach((url) => {
            if (typeof url === 'string') URL.revokeObjectURL(url);
          });
          setPreviewUrls(newUrls);
          setIcoBlob(ico);
        }
      } catch (err: any) {
        // Fallback gracefully without throwing unhandled exceptions
        console.warn('Favicon preview generation notice:', err?.message || 'Using vector fallback');
      } finally {
        if (!isCancelled) setIsRendering(false);
      }
    }

    generateAllPreviews();

    return () => {
      isCancelled = true;
    };
  }, [selectedMarkId, renderOptions, activeSvg, primaryColor, darkColor, lightColor]);

  // Download a single PNG favicon size
  const handleDownloadSinglePng = (size: number, filename: string) => {
    const url = previewUrls[size];
    if (!url) return;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloadSuccessMsg(`Downloaded ${filename}`);
    setTimeout(() => setDownloadSuccessMsg(null), 2500);
  };

  // Download multi-size favicon.ico
  const handleDownloadIco = () => {
    if (!icoBlob) return;
    const url = URL.createObjectURL(icoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favicon.ico';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccessMsg('Downloaded favicon.ico (Multi-size bundle)');
    setTimeout(() => setDownloadSuccessMsg(null), 2500);
  };

  // Download full bundle .ZIP with all PNGs, .ico, manifest, and setup instructions
  const handleDownloadZipPackage = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const brandSlug = brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const folder = zip.folder(`${brandSlug}-favicons`) || zip;

      // Add all PNG sizes
      for (const spec of FAVICON_SPECS) {
        const canvas = await renderSvgToCanvas(activeSvg, spec.size, renderOptions, {
          primary: primaryColor,
          dark: darkColor,
          light: lightColor,
        });
        const blob = await canvasToBlob(canvas);
        const arrayBuffer = await blob.arrayBuffer();
        folder.file(spec.name, arrayBuffer);
      }

      // Add multi-size .ico
      if (icoBlob) {
        const icoBuffer = await icoBlob.arrayBuffer();
        folder.file('favicon.ico', icoBuffer);
      }

      // Add site.webmanifest
      const manifestJson = generateManifestJson();
      folder.file('site.webmanifest', manifestJson);

      // Add Readme / HTML snippet
      const readmeContent = `# ${brand.brandName} - Web Favicon & Touch Icon Package
Generated automatically by Brand Identity Studio.

## Included Assets:
- favicon.ico (Multi-size 16x16, 32x32, 48x48 icon bundle)
- favicon-16x16.png (Standard browser tab)
- favicon-32x32.png (Retina & High-DPI browser tab)
- favicon-48x48.png (Windows shortcut)
- favicon-64x64.png (High-res bookmark)
- apple-touch-icon.png (180x180 px iOS Safari bookmark)
- android-chrome-192x192.png (192x192 px Android Web App)
- android-chrome-512x512.png (512x512 px PWA splash icon)
- site.webmanifest (PWA configuration)

## HTML Header Setup:
Paste the following tags inside your <head> section:

\`\`\`html
${generateHtmlSnippet()}
\`\`\`
`;
      folder.file('README.md', readmeContent);

      // Generate zip and trigger download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `${brandSlug}-favicons.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);

      setDownloadSuccessMsg(`Downloaded complete ${brandSlug}-favicons.zip package!`);
      setTimeout(() => setDownloadSuccessMsg(null), 3000);
    } catch (err) {
      console.error('ZIP packaging failed:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Generate HTML <head> links
  const generateHtmlSnippet = () => {
    return `<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${primaryColor}">`;
  };

  // Generate site.webmanifest JSON
  const generateManifestJson = () => {
    const brandSlug = brand.brandName.toLowerCase().replace(/\s+/g, '');
    return JSON.stringify(
      {
        name: brand.brandName,
        short_name: brand.brandName,
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        theme_color: primaryColor,
        background_color: renderOptions.background === 'dark' ? darkColor : '#FFFFFF',
        display: 'standalone',
      },
      null,
      2
    );
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(generateHtmlSnippet());
    setCopiedType('html');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyManifest = () => {
    navigator.clipboard.writeText(generateManifestJson());
    setCopiedType('manifest');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const currentPreview32 = previewUrls[32] || previewUrls[64] || '';
  const currentPreview180 = previewUrls[180] || previewUrls[512] || '';

  return (
    <div className="space-y-8 bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-10 transition-colors">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#1A1A1A] dark:text-[#F9F7F2]" />
            <h3 className="text-xl font-serif italic tracking-tighter text-[#1A1A1A] dark:text-[#F9F7F2]">
              Favicon & Web Icon Suite
            </h3>
            <span className="bg-[#1A1A1A] dark:bg-[#F9F7F2] text-white dark:text-[#1A1A1A] text-[9px] uppercase tracking-widest font-black px-2 py-0.5">
              Production Ready
            </span>
          </div>
          <p className="font-sans text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-400 mt-1 max-w-xl">
            Automatically extracts pixel-calibrated icons from {brand.brandName}'s marks and renders all standard browser tab, iOS, Android, and PWA sizes.
          </p>
        </div>

        {/* Global Download Package Button */}
        <button
          onClick={handleDownloadZipPackage}
          disabled={isZipping || isRendering}
          id="download-all-favicons-btn"
          className="px-6 py-3 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-black flex items-center justify-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 shrink-0"
        >
          <PackageCheck className="w-4 h-4" />
          <span>{isZipping ? 'Packaging ZIP Archive...' : 'Download Web Icon Package (.ZIP)'}</span>
        </button>
      </div>

      {/* Download Alert Toast */}
      {downloadSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-l-2 border-emerald-600 p-3 text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{downloadSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Controls vs Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Extraction Source & Styling Customization */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Select Extraction Mark */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>1. Extract From Mark</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {markOptions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMarkId(m.id)}
                  className={`p-3 text-left border flex items-center gap-3 transition-all cursor-pointer ${
                    selectedMarkId === m.id
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'bg-transparent text-[#1A1A1A] dark:text-[#F9F7F2] border-gray-200 dark:border-gray-200 dark:border-zinc-800 hover:border-gray-400'
                  }`}
                >
                  <div
                    className="w-7 h-7 shrink-0 flex items-center justify-center p-1 rounded-none border border-current/20"
                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(m.svg) }}
                  />
                  <div className="truncate">
                    <p className="text-[10px] font-bold leading-tight truncate">{m.title}</p>
                    <p className="text-[8px] opacity-60 truncate">Vector</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Background Fill Style */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>2. Icon Background Fill</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'transparent', label: 'Transparent', hint: 'Clean SVG Knockout' },
                { id: 'dark', label: 'Brand Dark', hint: darkColor },
                { id: 'primary', label: 'Primary Brand', hint: primaryColor },
                { id: 'white', label: 'Pure White', hint: '#FFFFFF' },
                { id: 'light', label: 'Neutral Light', hint: lightColor },
              ].map((bg) => (
                <button
                  key={bg.id}
                  onClick={() =>
                    setRenderOptions((prev) => ({
                      ...prev,
                      background: bg.id as any,
                    }))
                  }
                  className={`p-2.5 text-left border transition-all cursor-pointer ${
                    renderOptions.background === bg.id
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                      : 'bg-transparent text-[#1A1A1A] dark:text-[#F9F7F2] border-gray-200 dark:border-gray-200 dark:border-zinc-800 hover:border-gray-400'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider font-bold block truncate">{bg.label}</span>
                  <span className="text-[8px] font-mono opacity-60 block truncate">{bg.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Inset Padding & Corner Radius Sliders */}
          <div className="space-y-4 p-4 border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30">
            <div>
              <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] mb-1.5">
                <span>Icon Safe Inset / Padding</span>
                <span className="font-mono">{renderOptions.paddingPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="2"
                value={renderOptions.paddingPercent}
                onChange={(e) =>
                  setRenderOptions((prev) => ({
                    ...prev,
                    paddingPercent: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-[#1A1A1A] dark:accent-[#F9F7F2] cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-mono text-gray-400 mt-0.5">
                <span>0% Full Bleed</span>
                <span>12% Balanced</span>
                <span>30% Inset</span>
              </div>
            </div>

            {renderOptions.background !== 'transparent' && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] mb-1.5">
                  <span>Tile Corner Radius</span>
                  <span className="font-mono">{renderOptions.borderRadiusPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={renderOptions.borderRadiusPercent}
                  onChange={(e) =>
                    setRenderOptions((prev) => ({
                      ...prev,
                      borderRadiusPercent: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-[#1A1A1A] dark:accent-[#F9F7F2] cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-mono text-gray-400 mt-0.5">
                  <span>0% Square</span>
                  <span>25% Squircle</span>
                  <span>50% Circle</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Contextual Previews & Deployment Specs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Realistic In-Context Browser Tab & Mobile Mockups */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" />
              <span>Real-Time Environmental Previews</span>
            </label>

            {/* Desktop Browser Tab Mockup */}
            <div className="border border-gray-200 dark:border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-[#111110] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-gray-500 dark:text-gray-500" />
                <span className="text-[9px] uppercase tracking-widest font-bold text-gray-600 dark:text-gray-600 dark:text-zinc-400">
                  Desktop Browser Tab (Chrome / Safari / Edge)
                </span>
              </div>

              {/* Tab Bar Chrome */}
              <div className="bg-gray-200 dark:bg-zinc-900 pt-2 px-3 flex items-center gap-2 rounded-t-lg">
                <div className="flex gap-1.5 pr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                {/* Active Tab */}
                <div className="bg-white dark:bg-[#1C1C1A] text-[#1A1A1A] dark:text-[#F9F7F2] px-3 py-1.5 rounded-t-md flex items-center gap-2 text-xs shadow-xs max-w-xs border-t border-x border-gray-300 dark:border-gray-300 dark:border-zinc-700">
                  {currentPreview32 ? (
                    <img src={currentPreview32} alt="Favicon" className="w-4 h-4 object-contain shrink-0" />
                  ) : (
                    <div className="w-4 h-4 bg-gray-300 animate-pulse" />
                  )}
                  <span className="font-medium truncate text-[11px]">{brand.brandName} — Official Site</span>
                  <span className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-600 ml-auto">×</span>
                </div>
              </div>
            </div>

            {/* Mobile iOS Home Screen Icon Mockup */}
            <div className="border border-gray-200 dark:border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-[#111110] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-gray-500 dark:text-gray-500" />
                <span className="text-[9px] uppercase tracking-widest font-bold text-gray-600 dark:text-gray-600 dark:text-zinc-400">
                  Mobile Home Screen (Apple Touch Icon / Android Chrome PWA)
                </span>
              </div>

              <div className="flex items-center gap-6 p-4 bg-white dark:bg-zinc-900/60 border border-dashed border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                {/* Mobile Icon Badge */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-black/10 bg-white flex items-center justify-center p-1">
                    {currentPreview180 ? (
                      <img src={currentPreview180} alt="Touch Icon" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-center truncate max-w-[80px] text-[#1A1A1A] dark:text-[#F9F7F2]">
                    {brand.brandName}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-gray-600 dark:text-gray-600 dark:text-zinc-400">
                  <p className="font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">180 × 180 & 192 × 192 px</p>
                  <p className="text-[11px] opacity-80">
                    High-resolution crisp retina icon calibrated for mobile bookmarks and standalone progressive web apps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Individual File Sizes & Download Buttons */}
      <div className="pt-6 border-t border-[#1A1A1A] dark:border-[#F9F7F2]/20 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2">
            <Download className="w-3.5 h-3.5" />
            <span>Ready-to-Deploy Individual File Specifications</span>
          </label>
          <span className="text-[9px] uppercase tracking-widest font-mono opacity-60 text-[#1A1A1A] dark:text-[#F9F7F2]">
            Total 8 Formats Generated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Multi-size favicon.ico Card */}
          <div className="border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-4 bg-gray-50 dark:bg-zinc-900/60 flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-black font-mono text-[#1A1A1A] dark:text-[#F9F7F2]">favicon.ico</p>
                <p className="text-[9px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">
                  Multi-size ICO (16, 32, 48)
                </p>
              </div>
              <div className="w-8 h-8 shrink-0 bg-white border border-gray-200 dark:border-gray-200 p-1 flex items-center justify-center">
                {currentPreview32 && <img src={currentPreview32} alt="ICO" className="w-6 h-6 object-contain" />}
              </div>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-zinc-400 leading-tight">
              Standard Windows & legacy browser container containing 16px, 32px, and 48px frames.
            </p>
            <button
              onClick={handleDownloadIco}
              className="w-full py-1.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Download .ICO</span>
            </button>
          </div>

          {/* PNG Size Cards */}
          {FAVICON_SPECS.map((spec) => (
            <div
              key={spec.name}
              className="border border-gray-200 dark:border-gray-200 dark:border-zinc-800 p-4 bg-white dark:bg-[#141413] flex flex-col justify-between space-y-3 hover:border-gray-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-mono font-bold text-[#1A1A1A] dark:text-[#F9F7F2] truncate">{spec.name}</p>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-gray-500 dark:text-zinc-400">
                    {spec.label}
                  </p>
                </div>
                <div className="w-8 h-8 shrink-0 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-200 dark:border-zinc-700 p-1 flex items-center justify-center">
                  {previewUrls[spec.size] && (
                    <img src={previewUrls[spec.size]} alt={spec.name} className="w-full h-full object-contain" />
                  )}
                </div>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-zinc-400 leading-tight truncate">{spec.usage}</p>
              <button
                onClick={() => handleDownloadSinglePng(spec.size, spec.name)}
                className="w-full py-1.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/40 text-[#1A1A1A] dark:text-[#F9F7F2] text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download PNG</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Code Snippets for Developers */}
      <div className="pt-6 border-t border-[#1A1A1A] dark:border-[#F9F7F2]/20 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HTML <head> code */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5" />
              <span>HTML &lt;head&gt; Integration Snippet</span>
            </span>
            <button
              onClick={copyHtml}
              className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-1 hover:underline cursor-pointer"
            >
              {copiedType === 'html' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === 'html' ? 'Copied' : 'Copy HTML'}</span>
            </button>
          </div>
          <pre className="p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 text-[10px] font-mono text-gray-800 dark:text-zinc-300 overflow-x-auto leading-relaxed">
            {generateHtmlSnippet()}
          </pre>
        </div>

        {/* site.webmanifest JSON */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5" />
              <span>site.webmanifest Configuration</span>
            </span>
            <button
              onClick={copyManifest}
              className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-1 hover:underline cursor-pointer"
            >
              {copiedType === 'manifest' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === 'manifest' ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 text-[10px] font-mono text-gray-800 dark:text-zinc-300 overflow-x-auto leading-relaxed">
            {generateManifestJson()}
          </pre>
        </div>
      </div>
    </div>
  );
}
