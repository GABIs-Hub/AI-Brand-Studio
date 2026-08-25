import { useState, useEffect } from 'react';
import { BrandBible, BrandAuditResult } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Award,
  Zap,
  ArrowRight,
  Sliders,
  Check,
} from 'lucide-react';

interface BrandAuditTabProps {
  brand: BrandBible;
  onNavigateToTab?: (tabId: string) => void;
}

export function BrandAuditTab({ brand, onNavigateToTab }: BrandAuditTabProps) {
  const [audit, setAudit] = useState<BrandAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBrandAudit = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/audit-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brand.brandName,
          industry: brand.industry,
          currentMission: brand.mission,
          palette: brand.palette,
          typography: brand.typography,
          toneStyle: brand.toneOfVoice?.[0]?.trait || 'Standard',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete brand audit.');
      }

      const data = await response.json();
      setAudit(data);
    } catch (err: any) {
      console.error('Audit fetch error:', err);
      setErrorMsg(err.message || 'Could not complete brand audit.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandAudit();
  }, [brand.brandName]);

  return (
    <div className="space-y-8" id="brand-audit-container">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] uppercase tracking-[0.3em] font-black bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] px-2 py-0.5">
                Brand Equity &amp; Health
              </span>
              <span className="text-[9px] uppercase tracking-widest font-mono text-gray-500">
                Non-Destructive Modernization
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif italic text-[#1A1A1A] dark:text-[#F9F7F2]">
              Strategic Brand Health Audit
            </h2>
            <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 max-w-2xl">
              An objective evaluation of your current brand identity. Discover what brand equity to fiercely preserve, identify visual or verbal friction points, and apply surgical upgrades without disrupting existing customer trust.
            </p>
          </div>

          <button
            onClick={() => fetchBrandAudit()}
            disabled={isLoading}
            className="px-5 py-2.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start lg:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Auditing Identity...' : 'Re-Run Brand Audit'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
          {errorMsg}
        </div>
      )}

      {audit && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Metric Cards: Score, Maturity, Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Score Metric (4 cols) */}
            <div className="md:col-span-4 bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block mb-2">
                  Brand Equity Score
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-serif italic font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                    {audit.overallScore}
                  </span>
                  <span className="text-sm font-mono text-gray-500">/ 100</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 mt-4 overflow-hidden">
                  <div
                    className="bg-[#1A1A1A] dark:bg-[#F9F7F2] h-full transition-all duration-1000"
                    style={{ width: `${audit.overallScore}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 mt-4 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500">
                  Maturity Phase:
                </span>
                <span className="text-[10px] uppercase tracking-widest font-black bg-gray-100 dark:bg-zinc-800 text-black dark:text-white px-2 py-0.5 border border-gray-200 dark:border-zinc-700">
                  {audit.brandMaturityLevel}
                </span>
              </div>
            </div>

            {/* Executive Summary (8 cols) */}
            <div className="md:col-span-8 bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-[9px] uppercase tracking-widest font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                    Executive Strategic Evaluation
                  </span>
                </div>
                <p className="text-sm font-serif italic leading-relaxed text-[#1A1A1A] dark:text-[#F9F7F2] opacity-90">
                  "{audit.summary}"
                </p>
              </div>

              {/* Quick Pivots */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 mt-4 space-y-2">
                <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                  High-Impact Quick Upgrades:
                </span>
                <div className="flex flex-wrap gap-2">
                  {audit.quickFixPivots.map((pivot, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 px-2.5 py-1 font-sans flex items-center gap-1.5"
                    >
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>{pivot}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Core Strengths vs Critical Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths to Fiercely Preserve */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest font-black">
                  Core Brand Equity to Preserve
                </span>
              </div>
              <ul className="space-y-3">
                {audit.keyStrengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Friction Gaps */}
            <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest font-black">
                  Friction Points &amp; Modernization Gaps
                </span>
              </div>
              <ul className="space-y-3">
                {audit.criticalGaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Recommendations List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                Targeted Action Plan ({audit.recommendations.length} Steps)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {audit.recommendations.map((rec) => {
                const isHigh = rec.severity === 'High Priority';
                return (
                  <div
                    key={rec.id}
                    className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] uppercase tracking-widest font-black bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-300 px-2 py-0.5 border border-gray-200 dark:border-zinc-700">
                          {rec.category}
                        </span>
                        <span
                          className={`text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {rec.severity}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-[#F9F7F2]">
                        {rec.finding}
                      </h4>
                      <p className="text-xs font-serif italic text-gray-600 dark:text-zinc-400">
                        {rec.recommendation}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-dashed border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-500">
                        {rec.actionableStep}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
