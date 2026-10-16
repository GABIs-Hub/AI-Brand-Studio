import React, { useState } from 'react';
import { BrandColor } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Sliders,
  Sun,
  Moon,
} from 'lucide-react';

interface ColorAccessibilityMatrixProps {
  palette: BrandColor[];
}

/**
 * Calculates relative luminance according to WCAG 2.1 specifications
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const sRGB = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculates contrast ratio between two hex colors (1:1 to 21:1)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Number(ratio.toFixed(2));
}

export function getWcagLevel(ratio: number): {
  normalText: 'AAA' | 'AA' | 'Fail';
  largeText: 'AAA' | 'AA' | 'Fail';
  uiComponent: 'Pass' | 'Fail';
  status: 'excellent' | 'good' | 'poor';
} {
  const normalText = ratio >= 7.0 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail';
  const largeText = ratio >= 4.5 ? 'AAA' : ratio >= 3.0 ? 'AA' : 'Fail';
  const uiComponent = ratio >= 3.0 ? 'Pass' : 'Fail';

  let status: 'excellent' | 'good' | 'poor' = 'poor';
  if (normalText === 'AAA') status = 'excellent';
  else if (normalText === 'AA' || largeText === 'AAA') status = 'good';

  return { normalText, largeText, uiComponent, status };
}

export function ColorAccessibilityMatrix({ palette }: ColorAccessibilityMatrixProps) {
  const [selectedBgHex, setSelectedBgHex] = useState<string>(
    palette.find((c) => c.role.includes('Light'))?.hex || '#FFFFFF'
  );
  const [selectedFgHex, setSelectedFgHex] = useState<string>(
    palette.find((c) => c.role.includes('Dark') || c.role.includes('Primary'))?.hex || '#111827'
  );
  const [copiedNote, setCopiedNote] = useState<string | null>(null);

  // Add Pure White and Pure Black to the testing matrix alongside brand colors, deduplicating by hex
  const rawColors = [
    { role: 'White Canvas', name: 'Pure White', hex: '#FFFFFF' },
    { role: 'Dark Canvas', name: 'Pure Black', hex: '#0F172A' },
    ...palette.map((c) => ({ role: c.role, name: c.name, hex: c.hex })),
  ];

  // Deduplicate by normalized hex to prevent duplicate columns/rows
  const allColors = Array.from(
    new Map(rawColors.map((c) => [c.hex.toUpperCase(), c])).values()
  );

  const currentRatio = getContrastRatio(selectedFgHex, selectedBgHex);
  const currentWcag = getWcagLevel(currentRatio);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNote(label);
    setTimeout(() => setCopiedNote(null), 2000);
  };

  return (
    <div className="space-y-6" id="wcag-accessibility-matrix">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-xl-full bg-emerald-500" />
            <h3 className="text-xs uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              WCAG 2.1 Color Accessibility Matrix
            </h3>
          </div>
          <p className="text-xs font-display text-gray-600 dark:text-gray-600 dark:text-gray-400 mt-1">
            Automated luminance auditing across all color pairings for WCAG AA/AAA compliance and accessible interface design.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 dark:text-gray-400">
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
            AAA &ge; 7.0:1
          </span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold">
            AA &ge; 4.5:1
          </span>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
            UI &ge; 3.0:1
          </span>
        </div>
      </div>

      {/* Live Interactive Pair Tester Hero Card */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-[#1A1A1A] dark:border-zinc-700 shadow-xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Interactive Canvas Render */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-gray-400">
            <span>Live Render Specimen</span>
            <button
              onClick={() => {
                const temp = selectedBgHex;
                setSelectedBgHex(selectedFgHex);
                setSelectedFgHex(temp);
              }}
              className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-bold cursor-pointer transition-colors"
              title="Invert Background and Foreground"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Invert Swatches</span>
            </button>
          </div>

          <div
            className="p-8 border border-gray-300 dark:border-gray-300 dark:border-zinc-700 shadow-inner flex flex-col justify-between min-h-[220px] transition-colors duration-300"
            style={{ backgroundColor: selectedBgHex }}
          >
            <div>
              <span
                className="text-[9px] uppercase tracking-[0.3em] font-black block mb-2 opacity-80"
                style={{ color: selectedFgHex }}
              >
                Accessible Typography Specimen
              </span>
              <h2
                className="text-2xl sm:text-3xl font-display font-bold tracking-tight mb-2"
                style={{ color: selectedFgHex }}
              >
                Clear, Legible Brand Aesthetics
              </h2>
              <p
                className="text-xs sm:text-sm font-sans leading-relaxed max-w-lg"
                style={{ color: selectedFgHex }}
              >
                This live preview validates typography legibility, contrast depth, and interactive component visibility on this background.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap gap-2 items-center">
              <div
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border"
                style={{
                  backgroundColor: selectedFgHex,
                  color: selectedBgHex,
                  borderColor: selectedFgHex,
                }}
              >
                Solid Button
              </div>
              <div
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border"
                style={{
                  backgroundColor: 'transparent',
                  color: selectedFgHex,
                  borderColor: selectedFgHex,
                }}
              >
                Outline Button
              </div>
            </div>
          </div>
        </div>

        {/* Right: Metrics & Compliance Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-baseline justify-between border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 pb-3">
            <div>
              <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block">
                Contrast Ratio
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-4xl sm:text-5xl font-mono font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                  {currentRatio}
                </span>
                <span className="text-xl font-mono text-gray-400">:1</span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-widest border ${
                  currentWcag.normalText === 'AAA'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : currentWcag.normalText === 'AA'
                    ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300'
                }`}
              >
                {currentWcag.normalText === 'AAA' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {currentWcag.normalText === 'AA' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {currentWcag.normalText === 'Fail' && <AlertTriangle className="w-3.5 h-3.5" />}
                <span>WCAG {currentWcag.normalText}</span>
              </span>
            </div>
          </div>

          {/* Compliance Checklist Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-gray-200 dark:border-zinc-700">
              <span className="text-[8px] uppercase tracking-wider font-bold text-gray-400 block mb-1">
                Body Text
              </span>
              <span
                className={`text-xs font-black font-mono ${
                  currentWcag.normalText !== 'Fail' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                }`}
              >
                {currentWcag.normalText}
              </span>
              <span className="text-[7px] text-gray-400 block mt-0.5">&ge; 4.5:1</span>
            </div>

            <div className="p-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-gray-200 dark:border-zinc-700">
              <span className="text-[8px] uppercase tracking-wider font-bold text-gray-400 block mb-1">
                Large / Headings
              </span>
              <span
                className={`text-xs font-black font-mono ${
                  currentWcag.largeText !== 'Fail' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                }`}
              >
                {currentWcag.largeText}
              </span>
              <span className="text-[7px] text-gray-400 block mt-0.5">&ge; 3.0:1</span>
            </div>

            <div className="p-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-gray-200 dark:border-zinc-700">
              <span className="text-[8px] uppercase tracking-wider font-bold text-gray-400 block mb-1">
                UI &amp; Icons
              </span>
              <span
                className={`text-xs font-black font-mono ${
                  currentWcag.uiComponent === 'Pass' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                }`}
              >
                {currentWcag.uiComponent}
              </span>
              <span className="text-[7px] text-gray-400 block mt-0.5">&ge; 3.0:1</span>
            </div>
          </div>

          {/* Quick Swatch Choosers */}
          <div className="space-y-2 pt-2">
            <div>
              <span className="text-[8px] uppercase tracking-widest font-black text-gray-400 block mb-1.5">
                Select Background Color
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allColors.map((c) => (
                  <button
                    key={'bg-' + c.hex + c.role}
                    type="button"
                    onClick={() => setSelectedBgHex(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-6 h-6 rounded-xl-full border-2 transition-transform cursor-pointer ${
                      selectedBgHex.toLowerCase() === c.hex.toLowerCase()
                        ? 'scale-125 ring-2 ring-black dark:ring-white border-white'
                        : 'border-gray-300 dark:border-gray-300 dark:border-zinc-600 hover:scale-110'
                    }`}
                    title={`Background: ${c.role} (${c.hex})`}
                  />
                ))}
              </div>
            </div>

            <div>
              <span className="text-[8px] uppercase tracking-widest font-black text-gray-400 block mb-1.5">
                Select Foreground / Text Color
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allColors.map((c) => (
                  <button
                    key={'fg-' + c.hex + c.role}
                    type="button"
                    onClick={() => setSelectedFgHex(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-6 h-6 rounded-xl-full border-2 transition-transform cursor-pointer ${
                      selectedFgHex.toLowerCase() === c.hex.toLowerCase()
                        ? 'scale-125 ring-2 ring-black dark:ring-white border-white'
                        : 'border-gray-300 dark:border-gray-300 dark:border-zinc-600 hover:scale-110'
                    }`}
                    title={`Foreground: ${c.role} (${c.hex})`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Cross-Matrix Table */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="p-4 bg-gray-50 dark:bg-zinc-800/40 border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gray-500 dark:text-gray-500" />
            <h4 className="text-xs uppercase tracking-widest font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              Complete Matrix: Text (Rows) on Backgrounds (Columns)
            </h4>
          </div>
          <span className="text-[9px] text-gray-400 font-mono">Click any cell to test</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 bg-gray-100/50 dark:bg-zinc-800/30">
                <th className="p-3 font-mono text-[9px] uppercase tracking-widest text-gray-500 dark:text-gray-500 font-bold border-r border-gray-200 dark:border-gray-200 dark:border-zinc-800">
                  Text / BG &rarr;
                </th>
                {allColors.map((bg, bgIdx) => (
                  <th
                    key={'th-' + bg.hex + '-' + bg.role + '-' + bgIdx}
                    className="p-3 text-center border-r border-gray-200 dark:border-gray-200 dark:border-zinc-800 min-w-[90px]"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="w-4 h-4 rounded-xl-full border border-black/10 shadow-xs inline-block"
                        style={{ backgroundColor: bg.hex }}
                      />
                      <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300 truncate max-w-[80px]">
                        {bg.role.split(' ')[0]}
                      </span>
                      <span className="text-[8px] font-mono text-gray-400">{bg.hex}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allColors.map((fg, fgIdx) => (
                <tr
                  key={'row-' + fg.hex + '-' + fg.role + '-' + fgIdx}
                  className="border-b border-gray-200 dark:border-gray-200 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-800/20"
                >
                  <td className="p-3 font-bold border-r border-gray-200 dark:border-gray-200 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-800/10">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-xl-full border border-black/10 shadow-xs shrink-0"
                        style={{ backgroundColor: fg.hex }}
                      />
                      <div>
                        <span className="text-xs text-[#1A1A1A] dark:text-[#F9F7F2] block">{fg.name}</span>
                        <span className="text-[8px] font-mono text-gray-400 block">{fg.hex}</span>
                      </div>
                    </div>
                  </td>

                  {allColors.map((bg, bgIdx) => {
                    const ratio = getContrastRatio(fg.hex, bg.hex);
                    const wcag = getWcagLevel(ratio);
                    const isSelected =
                      selectedFgHex.toLowerCase() === fg.hex.toLowerCase() &&
                      selectedBgHex.toLowerCase() === bg.hex.toLowerCase();

                    return (
                      <td
                        key={'cell-' + fgIdx + '-' + bgIdx + '-' + fg.hex + '-' + bg.hex}
                        onClick={() => {
                          setSelectedFgHex(fg.hex);
                          setSelectedBgHex(bg.hex);
                        }}
                        className={`p-2.5 text-center border-r border-gray-200 dark:border-gray-200 dark:border-zinc-800 cursor-pointer transition-all ${
                          isSelected
                            ? 'ring-2 ring-amber-400 bg-amber-50 dark:bg-amber-950/30'
                            : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <div
                          className="p-1.5 rounded-xl-xs flex flex-col items-center justify-center gap-0.5"
                          style={{ backgroundColor: bg.hex, color: fg.hex }}
                        >
                          <span className="font-mono font-black text-xs leading-none">{ratio}</span>
                          <span
                            className={`text-[7px] font-black uppercase px-1 rounded-xl-xs ${
                              wcag.normalText === 'AAA'
                                ? 'bg-emerald-500 text-white'
                                : wcag.normalText === 'AA'
                                ? 'bg-blue-500 text-white'
                                : 'bg-red-500/80 text-white'
                            }`}
                          >
                            {wcag.normalText === 'Fail' ? wcag.largeText : wcag.normalText}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
