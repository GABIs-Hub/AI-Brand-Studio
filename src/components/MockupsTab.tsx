import { useState } from 'react';
import { BrandBible } from '../types';
import { sanitizeSvg } from '../utils/sanitizeSvg';
import {
  Monitor,
  CreditCard,
  Share2,
  Package,
  Sparkles,
  ArrowRight,
  Download,
  Check,
  Building2,
  SlidersHorizontal,
  Compass,
  Layers,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface MockupsTabProps {
  brand: BrandBible;
}

type MockupCategory = 'all' | 'website' | 'packaging' | 'stationery' | 'outdoor' | 'social';

export function MockupsTab({ brand }: MockupsTabProps) {
  const [activeCategory, setActiveCategory] = useState<MockupCategory>('all');
  const [webLayout, setWebLayout] = useState<'saas' | 'luxury_editorial' | 'commerce' | 'architectural'>('saas');
  const [packagingType, setPackagingType] = useState<'box' | 'bag' | 'hangtag'>('box');
  const [cardFinish, setCardFinish] = useState<'matte_black' | 'gold_foil' | 'pure_minimal' | 'silver_chrome'>('gold_foil');

  // Interactive Stationery State
  const [cardName, setCardName] = useState('Elena Vance');
  const [cardTitle, setCardTitle] = useState('Founder & Creative Director');
  const [cardEmail, setCardEmail] = useState(`elena@${brand.brandName.toLowerCase().replace(/\s+/g, '')}.com`);
  const [cardPhone, setCardPhone] = useState('+1 (415) 890-2041');
  const [cardCity, setCardCity] = useState('San Francisco • London • Tokyo');

  // Extract color hexes conveniently
  const primaryColor = brand.palette.find((c) => c.role === 'Primary')?.hex || '#1A1A1A';
  const secondaryColor = brand.palette.find((c) => c.role === 'Secondary')?.hex || '#2563EB';
  const accentColor = brand.palette.find((c) => c.role === 'Accent')?.hex || '#F59E0B';
  const lightColor = brand.palette.find((c) => c.role === 'Neutral Light')?.hex || '#F8F9FA';
  const darkColor = brand.palette.find((c) => c.role === 'Neutral Dark')?.hex || '#0F172A';

  const headingFont = `'${brand.typography.headingFont}', serif, sans-serif`;
  const bodyFont = `'${brand.typography.bodyFont}', sans-serif`;

  const cleanBrandDomain = `www.${brand.brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 pb-4 transition-colors">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
            Dynamic Brand Application Mockups
          </h2>
          <p className="font-serif italic text-lg opacity-80 mt-2 text-[#1A1A1A] dark:text-[#F9F7F2]">
            Industry-tailored live simulations applying generated palette, logomarks, typography, and messaging.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 dark:bg-[#151514] border border-gray-200 dark:border-gray-200 dark:border-zinc-800">
          {[
            { id: 'all', label: 'All Touchpoints', icon: Layers },
            { id: 'website', label: 'Web Platform', icon: Monitor },
            { id: 'packaging', label: 'Packaging & Merch', icon: Package },
            { id: 'stationery', label: 'Stationery Suite', icon: CreditCard },
            { id: 'outdoor', label: 'Urban Billboard', icon: Building2 },
            { id: 'social', label: 'Social Campaign', icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as MockupCategory)}
                className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] shadow-xs'
                    : 'text-gray-600 dark:text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Website Landing Page / Storefront Simulation */}
      {(activeCategory === 'all' || activeCategory === 'website') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-2.5 text-[#1A1A1A] dark:text-[#F9F7F2]">
              <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Digital Touchpoint: Web Experience &amp; Storefront</span>
            </h3>

            {/* Layout Archetype Switcher */}
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold">
              <span className="opacity-50 mr-1 text-gray-500 dark:text-gray-500">Archetype:</span>
              {[
                { id: 'saas', label: 'SaaS Platform' },
                { id: 'luxury_editorial', label: 'Haute Editorial' },
                { id: 'commerce', label: 'E-Commerce' },
                { id: 'architectural', label: 'Architectural Grid' },
              ].map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => setWebLayout(layout.id as any)}
                  className={`px-2.5 py-1 border transition-all cursor-pointer ${
                    webLayout === layout.id
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'bg-transparent text-gray-600 dark:text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {layout.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-[#1A1A1A] dark:border-[#F9F7F2]/20 overflow-hidden bg-white dark:bg-[#121210] shadow-xl">
            {/* Mock Browser Top Bar */}
            <div className="bg-[#1A1A1A] dark:bg-[#0E0E0D] px-4 py-3 flex items-center justify-between text-[#F9F7F2]">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                {/* Active Tab */}
                <div className="bg-[#F9F7F2] dark:bg-[#1C1C1A] text-[#1A1A1A] dark:text-[#F9F7F2] px-3.5 py-1 flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold max-w-[220px] truncate border border-black/20">
                  <div
                    className="w-3.5 h-3.5 shrink-0"
                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.secondaryMarks[0]?.svg || brand.logo.primaryLogoSvg) }}
                  />
                  <span className="truncate">{brand.brandName}</span>
                </div>
              </div>
              <div className="px-4 py-1 text-[9px] font-mono opacity-60 border border-[#F9F7F2]/20 hidden sm:flex items-center gap-2">
                <span className="text-emerald-400 text-xs">•</span>
                <span>https://{cleanBrandDomain}</span>
              </div>
            </div>

            {/* Render selected Web Archetype */}
            {webLayout === 'saas' && (
              <div
                style={{ backgroundColor: lightColor, color: darkColor, fontFamily: bodyFont }}
                className="p-6 sm:p-12 transition-colors space-y-12"
              >
                {/* Header Nav */}
                <div className="flex items-center justify-between border-b border-current/15 pb-4">
                  <div
                    className="h-9 max-w-[190px] flex items-center"
                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.logo.primaryLogoSvg) }}
                  />
                  <div className="hidden md:flex items-center gap-8 text-[9px] uppercase tracking-widest font-bold opacity-80">
                    <span className="hover:opacity-100 cursor-pointer">Platform</span>
                    <span className="hover:opacity-100 cursor-pointer">Engine</span>
                    <span className="hover:opacity-100 cursor-pointer">Manifesto</span>
                    <span className="hover:opacity-100 cursor-pointer">Documentation</span>
                  </div>
                  <button
                    style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                    className="px-6 py-2 text-[9px] uppercase tracking-widest font-black hover:opacity-90 transition-opacity border-none cursor-pointer shadow-sm"
                  >
                    Launch Platform
                  </button>
                </div>

                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center space-y-6 py-8">
                  <div
                    style={{ color: secondaryColor, borderColor: `${secondaryColor}40`, backgroundColor: `${secondaryColor}10` }}
                    className="inline-flex items-center gap-2 px-3.5 py-1 text-[9px] uppercase tracking-widest font-bold border"
                  >
                    <Zap className="w-3 h-3" />
                    <span>The Next Standard in {brand.industry}</span>
                  </div>

                  <h1
                    style={{ fontFamily: headingFont }}
                    className="text-4xl sm:text-6xl font-light italic tracking-tight leading-tight"
                  >
                    {brand.tagline}
                  </h1>

                  <p className="text-sm sm:text-base font-light opacity-80 leading-relaxed max-w-2xl mx-auto">
                    {brand.mission}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <button
                      style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                      className="px-8 py-3.5 font-black text-[9px] uppercase tracking-widest flex items-center gap-2.5 hover:opacity-95 shadow-md cursor-pointer"
                    >
                      <span>Start Free Trial</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      style={{ borderColor: darkColor, color: darkColor }}
                      className="px-8 py-3.5 font-bold text-[9px] uppercase tracking-widest border bg-transparent hover:bg-black/5 cursor-pointer"
                    >
                      Explore Documentation
                    </button>
                  </div>
                </div>

                {/* Dashboard Metrics UI Simulation */}
                <div
                  style={{ backgroundColor: darkColor, borderColor: `${lightColor}20` }}
                  className="max-w-4xl mx-auto border p-6 text-white space-y-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">
                        {brand.brandName} Core Engine Active
                      </span>
                    </div>
                    <span className="text-[9px] font-mono opacity-50">v4.1.0 • Latency: 12ms</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">System Throughput</span>
                      <p className="text-2xl font-mono font-bold" style={{ color: accentColor }}>99.98%</p>
                      <span className="text-[9px] opacity-60">Precision calibrated</span>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Workflow Velocity</span>
                      <p className="text-2xl font-mono font-bold" style={{ color: secondaryColor }}>14.8x</p>
                      <span className="text-[9px] opacity-60">Accelerated deployment</span>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 space-y-1">
                      <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">Industry Authority</span>
                      <p className="text-2xl font-mono font-bold text-emerald-400">Rank #1</p>
                      <span className="text-[9px] opacity-60">{brand.industry} Category</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {webLayout === 'luxury_editorial' && (
              <div
                style={{ backgroundColor: '#0C0D0E', color: '#F9F7F2', fontFamily: bodyFont }}
                className="p-8 sm:p-16 space-y-14"
              >
                <div className="flex items-center justify-between border-b border-white/15 pb-6">
                  <span className="text-[9px] uppercase tracking-[0.3em] opacity-60">EST. 2026 // COLLECTION</span>
                  <div
                    className="h-10 max-w-[200px] flex items-center"
                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.logo.primaryLogoSvg) }}
                  />
                  <span className="text-[9px] uppercase tracking-widest font-bold opacity-80 cursor-pointer hover:text-amber-400">
                    Private Concierge &rarr;
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-7 space-y-8">
                    <span className="text-[9px] uppercase tracking-[0.4em] font-black" style={{ color: accentColor }}>
                      UNCOMPROMISING PRECISION
                    </span>
                    <h1
                      style={{ fontFamily: headingFont }}
                      className="text-4xl sm:text-6xl font-light italic leading-tight"
                    >
                      &ldquo;{brand.tagline}&rdquo;
                    </h1>
                    <p className="text-base font-light text-white/70 leading-relaxed max-w-xl">
                      {brand.mission}
                    </p>
                    <div className="pt-4 flex items-center gap-6">
                      <button
                        style={{ backgroundColor: accentColor, color: '#000000' }}
                        className="px-8 py-3.5 text-[9px] uppercase tracking-[0.25em] font-black hover:opacity-90 cursor-pointer"
                      >
                        Inquire Bespoke Access
                      </button>
                      <span className="text-[9px] uppercase tracking-widest opacity-60 underline cursor-pointer">
                        View The Manifesto
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 border border-white/20 p-8 space-y-6 bg-white/5 relative">
                    <div className="w-12 h-12" dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.secondaryMarks[0]?.svg || brand.logo.primaryLogoSvg) }} />
                    <span className="text-xs uppercase tracking-widest font-bold block" style={{ color: accentColor }}>
                      {brand.brandName} Atelier
                    </span>
                    <p className="text-xs font-light text-white/60 leading-relaxed">
                      {brand.positioningStatement}
                    </p>
                    <div className="pt-4 border-t border-white/10 flex justify-between text-[9px] uppercase tracking-widest text-white/40">
                      <span>Limited Edition</span>
                      <span>Certified Authentic</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {webLayout === 'commerce' && (
              <div
                style={{ backgroundColor: lightColor, color: darkColor, fontFamily: bodyFont }}
                className="p-6 sm:p-12 space-y-10"
              >
                <div className="flex items-center justify-between border-b border-current/20 pb-4">
                  <div
                    className="h-8 max-w-[160px] flex items-center"
                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.logo.primaryLogoSvg) }}
                  />
                  <div className="flex items-center gap-6 text-[9px] uppercase tracking-widest font-bold">
                    <span>New Arrivals</span>
                    <span>Signature Line</span>
                    <span>Accessories</span>
                    <span>Journal</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-1.5 border border-current text-[9px] uppercase tracking-widest font-bold cursor-pointer hover:bg-black hover:text-white">
                      Bag (0)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: `Signature ${brand.industry} Edition 01`, price: '$240', badge: 'Best Seller' },
                    { name: `Artisanal Edition 02`, price: '$310', badge: 'Limited Reserve' },
                    { name: `Archive Studio Edition`, price: '$185', badge: 'New Arrival' },
                  ].map((product, idx) => (
                    <div key={idx} className="border border-current/20 bg-white dark:bg-[#1A1A18] p-6 space-y-4 shadow-sm flex flex-col justify-between">
                      <div className="aspect-square bg-gray-100 dark:bg-zinc-900 border border-current/10 flex items-center justify-center p-8 relative overflow-hidden">
                        <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold bg-black text-white">
                          {product.badge}
                        </span>
                        <div
                          className="w-20 h-20 opacity-85 hover:scale-110 transition-transform duration-300"
                          dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.secondaryMarks[idx % brand.secondaryMarks.length]?.svg || brand.logo.primaryLogoSvg) }}
                        />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">{brand.brandName}</span>
                        <h4 className="text-base font-bold mt-1" style={{ fontFamily: headingFont }}>{product.name}</h4>
                        <span className="text-sm font-mono font-bold mt-2 block" style={{ color: primaryColor }}>{product.price}</span>
                      </div>
                      <button
                        style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                        className="w-full py-2.5 text-[9px] uppercase tracking-widest font-black cursor-pointer hover:opacity-90"
                      >
                        Add To Bag
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {webLayout === 'architectural' && (
              <div
                style={{ backgroundColor: '#141619', color: '#FFFFFF', fontFamily: bodyFont }}
                className="p-8 sm:p-14 space-y-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 border border-white/20 divide-y md:divide-y-0 md:divide-x divide-white/20">
                  <div className="p-6 space-y-4">
                    <div
                      className="h-8 max-w-[140px]"
                      dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.logo.primaryLogoSvg) }}
                    />
                    <span className="text-[9px] uppercase tracking-widest font-bold opacity-50 block">PROJECT INDEX // 2026</span>
                  </div>
                  <div className="p-6 md:col-span-2 space-y-4">
                    <h2 style={{ fontFamily: headingFont }} className="text-2xl sm:text-3xl font-light italic">
                      {brand.mission}
                    </h2>
                  </div>
                  <div className="p-6 flex flex-col justify-between space-y-4">
                    <span className="text-[9px] uppercase tracking-widest font-bold opacity-50">DISCIPLINE: {brand.industry}</span>
                    <button
                      style={{ backgroundColor: accentColor, color: '#000000' }}
                      className="py-2.5 px-4 text-[9px] uppercase tracking-widest font-black cursor-pointer hover:opacity-90"
                    >
                      Access Blueprint &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Physical Packaging & Merchandise Mockup */}
      {(activeCategory === 'all' || activeCategory === 'packaging') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-2.5 text-[#1A1A1A] dark:text-[#F9F7F2]">
              <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Physical Touchpoint: Packaging &amp; Merchandise</span>
            </h3>

            {/* Packaging Type Switcher */}
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold">
              <span className="opacity-50 mr-1 text-gray-500 dark:text-gray-500">Format:</span>
              {[
                { id: 'box', label: 'Luxury Box Sleeve' },
                { id: 'bag', label: 'Artisan Pouch / Bag' },
                { id: 'hangtag', label: 'Apparel Hangtag' },
              ].map((format) => (
                <button
                  key={format.id}
                  type="button"
                  onClick={() => setPackagingType(format.id as any)}
                  className={`px-2.5 py-1 border transition-all cursor-pointer ${
                    packagingType === format.id
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'bg-transparent text-gray-600 dark:text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {format.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Packaging Render View */}
            <div className="bg-[#181A1E] border border-white/20 p-8 sm:p-12 flex items-center justify-center min-h-[380px] relative overflow-hidden shadow-2xl">
              {/* Studio Backdrop Light */}
              <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />

              {packagingType === 'box' && (
                <div
                  style={{ backgroundColor: darkColor, borderColor: accentColor }}
                  className="w-full max-w-[340px] aspect-[4/5] border-2 p-8 flex flex-col justify-between shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative"
                >
                  {/* Top Seal Stamp */}
                  <div className="flex justify-between items-center border-b border-white/20 pb-4">
                    <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/50">SERIES 01 // ARCHIVE</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border" style={{ borderColor: accentColor, color: accentColor }}>
                      SEALED QUALITY
                    </span>
                  </div>

                  {/* Centered Embossed Brand Mark */}
                  <div className="text-center space-y-4 py-8">
                    <div
                      className="w-24 h-24 mx-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
                      dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.secondaryMarks[0]?.svg || brand.logo.primaryLogoSvg) }}
                    />
                    <h3 className="text-xl font-bold uppercase tracking-[0.25em] text-white" style={{ fontFamily: headingFont }}>
                      {brand.brandName}
                    </h3>
                    <p className="text-[9px] uppercase tracking-widest text-white/60 font-medium">
                      {brand.tagline}
                    </p>
                  </div>

                  {/* Bottom Product Details */}
                  <div className="border-t border-white/20 pt-4 flex justify-between items-end text-white/60 text-[8px] font-mono uppercase">
                    <div>
                      <span>ORIGIN: SF ATELIER</span>
                      <br />
                      <span>BATCH: #2026-9A</span>
                    </div>
                    <div className="text-right">
                      <span style={{ color: accentColor }}>CERTIFIED AUTHENTIC</span>
                      <br />
                      <span>NET WT. 500G</span>
                    </div>
                  </div>
                </div>
              )}

              {packagingType === 'bag' && (
                <div
                  style={{ backgroundColor: '#202226', borderColor: 'rgba(255,255,255,0.2)' }}
                  className="w-full max-w-[300px] aspect-[1/1.4] border-2 p-6 flex flex-col justify-between shadow-[0_30px_60px_rgba(0,0,0,0.7)] relative"
                >
                  <div className="w-12 h-2 mx-auto bg-white/20 rounded-full mb-2" />
                  <div className="text-center space-y-3">
                    <span className="text-[8px] uppercase tracking-[0.3em] text-amber-400 font-bold">ARTISAN HARVEST</span>
                    <div
                      className="w-16 h-16 mx-auto"
                      dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.logo.primaryLogoSvg) }}
                    />
                    <p className="text-xs italic font-serif text-white/80 max-w-[200px] mx-auto">
                      &ldquo;{brand.mission.slice(0, 70)}...&rdquo;
                    </p>
                  </div>
                  <div className="bg-black/40 p-3 border border-white/10 text-center">
                    <span className="text-[8px] uppercase tracking-widest font-mono text-white/70 block">DIRECT TRADE RESTRAINT</span>
                    <span className="text-[9px] font-bold text-white uppercase mt-0.5 block">{brand.industry}</span>
                  </div>
                </div>
              )}

              {packagingType === 'hangtag' && (
                <div
                  style={{ backgroundColor: lightColor, color: darkColor }}
                  className="w-full max-w-[240px] aspect-[1/2] border-2 border-black p-6 flex flex-col justify-between shadow-2xl relative"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-current mx-auto mb-2" />
                  <div className="text-center space-y-3">
                    <div
                      className="w-16 h-16 mx-auto"
                      dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.secondaryMarks[1]?.svg || brand.logo.primaryLogoSvg) }}
                    />
                    <h4 className="text-base font-black tracking-widest uppercase" style={{ fontFamily: headingFont }}>
                      {brand.brandName}
                    </h4>
                    <span className="text-[8px] uppercase tracking-widest font-bold opacity-60 block">
                      GARMENT &amp; GOODS
                    </span>
                  </div>
                  <div className="border-t border-dashed border-current/40 pt-4 space-y-1 text-[8px] font-mono">
                    <p>STYLE: 0884-BK</p>
                    <p>FABRIC: 100% ORGANIC</p>
                    <p className="font-bold text-[9px] mt-2">PRICE: $180.00</p>
                  </div>
                </div>
              )}
            </div>

            {/* Packaging Specification Notes */}
            <div className="border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-6 sm:p-8 bg-white dark:bg-[#181816] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-500 dark:text-gray-400 block">
                  Material &amp; Production Specs
                </span>
                <h4 className="text-xl font-light italic" style={{ fontFamily: headingFont }}>
                  Tactile Unboxing Experience
                </h4>
                <p className="text-sm font-sans text-gray-700 dark:text-gray-300 leading-relaxed">
                  Crafted with heavy-weight 350gsm FSC-certified cotton paper, soft-touch matte lamination, and targeted blind debossing for the primary mark.
                </p>

                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-200 dark:border-zinc-800 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-500 dark:text-gray-500">Substrate:</span>
                    <span className="font-bold">Heavyweight 350gsm Uncoated Board</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-500 dark:text-gray-500">Foil Finish:</span>
                    <span className="font-bold" style={{ color: primaryColor }}>Custom Spot Matte Color</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-500 dark:text-gray-500">Sustainability:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Recyclable &amp; Plastic Free</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-600 dark:text-zinc-400">
                <span className="font-bold text-[#1A1A1A] dark:text-[#F9F7F2] block mb-1">Production Tip:</span>
                Provide the vector SVG from the &apos;Logo &amp; Marks&apos; tab directly to your packaging manufacturer for flawless die-cutting and plate stamping.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Executive Stationery & Business Card Suite */}
      {(activeCategory === 'all' || activeCategory === 'stationery') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-2.5 text-[#1A1A1A] dark:text-[#F9F7F2]">
              <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Physical Touchpoint: Executive Stationery &amp; Metal Cards</span>
            </h3>

            {/* Foil Finish Switcher */}
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold">
              <span className="opacity-50 mr-1 text-gray-500 dark:text-gray-500">Finish:</span>
              {[
                { id: 'gold_foil', label: 'Gold Foil' },
                { id: 'matte_black', label: 'Matte Obsidian' },
                { id: 'silver_chrome', label: 'Silver Chrome' },
                { id: 'pure_minimal', label: 'Ivory Minimal' },
              ].map((finish) => (
                <button
                  key={finish.id}
                  type="button"
                  onClick={() => setCardFinish(finish.id as any)}
                  className={`px-2.5 py-1 border transition-all cursor-pointer ${
                    cardFinish === finish.id
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'bg-transparent text-gray-600 dark:text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {finish.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Cardholder Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white dark:bg-[#1A1A18] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-4 transition-colors">
            <div>
              <label className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-gray-500 dark:text-gray-400">Cardholder Name</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-300 dark:border-zinc-700 py-1 text-sm font-bold text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden focus:border-black dark:focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-gray-500 dark:text-gray-400">Title / Role</label>
              <input
                type="text"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-300 dark:border-zinc-700 py-1 text-sm font-bold text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden focus:border-black dark:focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-gray-500 dark:text-gray-400">Executive Email</label>
              <input
                type="text"
                value={cardEmail}
                onChange={(e) => setCardEmail(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-300 dark:border-zinc-700 py-1 text-sm font-mono text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden focus:border-black dark:focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest font-bold mb-1 text-gray-500 dark:text-gray-400">HQ Locations</label>
              <input
                type="text"
                value={cardCity}
                onChange={(e) => setCardCity(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-300 dark:border-zinc-700 py-1 text-sm font-bold text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Front Card */}
            <div
              style={{
                backgroundColor: cardFinish === 'pure_minimal' ? lightColor : '#121418',
                color: cardFinish === 'pure_minimal' ? darkColor : '#FFFFFF',
                borderColor: cardFinish === 'gold_foil' ? '#F59E0B' : cardFinish === 'silver_chrome' ? '#E2E8F0' : 'rgba(255,255,255,0.2)',
              }}
              className="p-8 aspect-[1.75/1] border-2 flex flex-col justify-between relative overflow-hidden group shadow-2xl"
            >
              {/* Subtle geometric background watermarks */}
              <div className="absolute inset-0 opacity-[0.05] flex items-center justify-center pointer-events-none">
                <div className="w-[140%] h-px bg-current rotate-45 transform" />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div
                  className="w-36 h-12 flex items-center"
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.logo.primaryLogoSvg) }}
                />
                <span className="text-[9px] uppercase tracking-widest opacity-50 font-mono">OBVERSE // 01</span>
              </div>

              <div className="relative z-10 space-y-2">
                <p style={{ fontFamily: headingFont }} className="text-xl font-light italic">
                  &ldquo;{brand.tagline}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-70" style={{ color: accentColor }}>
                    {brand.industry}
                  </span>
                  <span className="text-[8px] opacity-40 font-mono">• 38.8951° N, 77.0364° W</span>
                </div>
              </div>
            </div>

            {/* Back Card */}
            <div
              style={{
                backgroundColor: cardFinish === 'matte_black' ? '#0A0A0B' : lightColor,
                color: cardFinish === 'matte_black' ? '#FFFFFF' : darkColor,
                fontFamily: bodyFont,
                borderColor: 'rgba(0,0,0,0.15)',
              }}
              className="p-8 aspect-[1.75/1] border flex flex-col justify-between relative group shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 style={{ fontFamily: headingFont }} className="font-bold text-2xl tracking-tight">
                    {cardName}
                  </h4>
                  <p className="text-[9px] uppercase tracking-widest font-black opacity-70 mt-1" style={{ color: primaryColor }}>
                    {cardTitle}
                  </p>
                </div>
                <div
                  className="w-12 h-12"
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.secondaryMarks[0]?.svg || brand.logo.primaryLogoSvg) }}
                />
              </div>

              <div className="space-y-2 text-[10px] uppercase tracking-widest font-bold border-t border-dashed border-current/25 pt-4">
                <div className="flex justify-between items-center">
                  <span>{cardEmail}</span>
                  <span className="font-mono text-[9px] opacity-70">{cardPhone}</span>
                </div>
                <p className="text-[9px] opacity-60 font-medium">{cardCity}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Urban Architectural Billboard Simulation */}
      {(activeCategory === 'all' || activeCategory === 'outdoor') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-2.5 text-[#1A1A1A] dark:text-[#F9F7F2]">
              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Out-of-Home: Metropolitan Architectural Billboard</span>
            </h3>
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-50 text-[#1A1A1A] dark:text-[#F9F7F2]">
              High-Impact Display (16:9)
            </span>
          </div>

          <div className="border border-[#1A1A1A] dark:border-[#F9F7F2]/20 bg-[#0E1013] p-8 sm:p-14 overflow-hidden relative shadow-2xl">
            {/* Simulated Concrete Architectural Building Framework */}
            <div className="max-w-4xl mx-auto border-4 border-[#252830] bg-[#14171D] p-4 shadow-[0_40px_90px_rgba(0,0,0,0.9)] relative">
              {/* Top Overhead Floodlights */}
              <div className="flex justify-around mb-2">
                <div className="w-12 h-1.5 bg-zinc-600 rounded-full shadow-[0_10px_20px_rgba(255,255,255,0.4)]" />
                <div className="w-12 h-1.5 bg-zinc-600 rounded-full shadow-[0_10px_20px_rgba(255,255,255,0.4)]" />
                <div className="w-12 h-1.5 bg-zinc-600 rounded-full shadow-[0_10px_20px_rgba(255,255,255,0.4)]" />
              </div>

              {/* Billboard Screen Surface */}
              <div
                style={{ backgroundColor: darkColor, color: '#FFFFFF' }}
                className="aspect-[16/9] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Visual Ambient Texture */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `linear-gradient(45deg, ${primaryColor} 25%, transparent 25%, transparent 75%, ${primaryColor} 75%, ${primaryColor}), linear-gradient(45deg, ${primaryColor} 25%, transparent 25%, transparent 75%, ${primaryColor} 75%, ${primaryColor})`,
                    backgroundSize: '40px 40px',
                    backgroundPosition: '0 0, 20px 20px',
                  }}
                />

                <div className="flex items-center justify-between relative z-10">
                  <div
                    className="h-12 max-w-[220px]"
                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(brand.logo.primaryLogoSvg) }}
                  />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black px-4 py-1.5 border border-white/30 text-white">
                    {brand.industry}
                  </span>
                </div>

                <div className="max-w-2xl relative z-10 space-y-4 my-auto">
                  <h2
                    style={{ fontFamily: headingFont }}
                    className="text-3xl sm:text-5xl font-light italic leading-tight text-white drop-shadow-md"
                  >
                    &ldquo;{brand.tagline}&rdquo;
                  </h2>
                  <p className="text-xs sm:text-sm font-light text-white/80 leading-relaxed max-w-lg">
                    {brand.mission}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/20 pt-4 relative z-10 text-[9px] uppercase tracking-widest text-white/60 font-mono">
                  <span>{cleanBrandDomain}</span>
                  <span style={{ color: accentColor }} className="font-bold font-sans">
                    NOW LIVE WORLDWIDE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
