import { useState } from 'react';
import { BrandBible } from '../types';
import { Monitor, CreditCard, Share2, Globe, ArrowRight, ExternalLink, Check } from 'lucide-react';

interface MockupsTabProps {
  brand: BrandBible;
}

export function MockupsTab({ brand }: MockupsTabProps) {
  const [activeMockup, setActiveMockup] = useState<'all' | 'card' | 'website' | 'social'>('all');
  const [cardName, setCardName] = useState('Elena Vance');
  const [cardTitle, setCardTitle] = useState('Founder & Creative Director');
  const [cardEmail, setCardEmail] = useState(`hello@${brand.brandName.toLowerCase().replace(/\s+/g, '')}.com`);

  // Extract color hexes conveniently
  const primaryColor = brand.palette.find((c) => c.role === 'Primary')?.hex || '#2563EB';
  const secondaryColor = brand.palette.find((c) => c.role === 'Secondary')?.hex || '#4F46E5';
  const accentColor = brand.palette.find((c) => c.role === 'Accent')?.hex || '#F59E0B';
  const lightColor = brand.palette.find((c) => c.role === 'Neutral Light')?.hex || '#F8F9FA';
  const darkColor = brand.palette.find((c) => c.role === 'Neutral Dark')?.hex || '#0F172A';

  const headingFont = `'${brand.typography.headingFont}', serif, sans-serif`;
  const bodyFont = `'${brand.typography.bodyFont}', sans-serif`;

  return (
    <div className="space-y-10">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 pb-4 transition-colors">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">Live Brand Application Mockups</h2>
          <p className="font-serif italic text-lg opacity-80 mt-2 text-[#1A1A1A] dark:text-[#F9F7F2]">
            Real-time interactive application of generated colors, typography, logos, and messaging across touchpoints.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'card', 'website', 'social'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMockup(tab)}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all border border-[#1A1A1A] dark:border-[#F9F7F2]/30 rounded-none cursor-pointer ${
                activeMockup === tab
                  ? 'bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                  : 'bg-transparent text-[#1A1A1A] dark:text-[#F9F7F2] hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tab === 'card' ? 'Business Cards' : tab === 'website' ? 'Web Landing Hero' : tab === 'social' ? 'Social Graphic' : 'All Touchpoints'}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Website Landing Page Hero Component */}
      {(activeMockup === 'all' || activeMockup === 'website') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-3 text-[#1A1A1A] dark:text-[#F9F7F2]">
              <Monitor className="w-4 h-4" />
              <span>Digital Touchpoint: Web Header & Hero Section</span>
            </h3>
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-50 text-[#1A1A1A] dark:text-[#F9F7F2]">Responsive Preview</span>
          </div>

          <div className="border border-[#1A1A1A] dark:border-[#F9F7F2]/20 overflow-hidden bg-white rounded-none">
            {/* Mock Browser Top Bar */}
            <div className="bg-[#1A1A1A] dark:bg-[#111110] px-4 py-3 flex items-center justify-between text-[#F9F7F2]">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[#F9F7F2]/50" />
                  <div className="w-2 h-2 bg-[#F9F7F2]/50" />
                  <div className="w-2 h-2 bg-[#F9F7F2]/50" />
                </div>
                {/* Tab preview */}
                <div className="bg-[#F9F7F2] text-[#1A1A1A] px-4 py-1 flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold max-w-[200px] truncate border border-[#1A1A1A]">
                  <div
                    className="w-3 h-3 shrink-0"
                    dangerouslySetInnerHTML={{ __html: brand.secondaryMarks[1]?.svg || brand.logo.primaryLogoSvg }}
                  />
                  <span className="truncate">{brand.brandName}</span>
                </div>
              </div>
              <div className="px-3 py-1 text-[9px] font-mono opacity-50 border border-[#F9F7F2]/30 hidden sm:block">
                https://www.{brand.brandName.toLowerCase().replace(/\s+/g, '')}.com
              </div>
            </div>

            {/* Live Website Canvas */}
            <div
              style={{ backgroundColor: lightColor, color: darkColor, fontFamily: bodyFont }}
              className="p-6 sm:p-12 transition-colors space-y-10"
            >
              {/* Web Header Nav */}
              <div className="flex items-center justify-between border-b border-current/20 pb-4">
                <div
                  className="h-9 max-w-[180px] flex items-center"
                  dangerouslySetInnerHTML={{ __html: brand.logo.primaryLogoSvg }}
                />
                <div className="hidden md:flex items-center gap-6 text-[9px] uppercase tracking-widest font-bold">
                  <span>Product</span>
                  <span>Solutions</span>
                  <span>About Us</span>
                  <span>Pricing</span>
                </div>
                <button
                  style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                  className="px-6 py-2 text-[9px] uppercase tracking-widest font-bold hover:opacity-90 transition-opacity border-none rounded-none cursor-pointer"
                >
                  Get Started
                </button>
              </div>

              {/* Web Hero Content */}
              <div className="max-w-3xl mx-auto text-center space-y-8 py-12">
                <div
                  style={{ color: secondaryColor, borderColor: secondaryColor }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 text-[9px] uppercase tracking-widest font-bold border rounded-none"
                >
                  <span>Introducing Next-Gen {brand.industry}</span>
                </div>

                <h1
                  style={{ fontFamily: headingFont }}
                  className="text-4xl sm:text-6xl font-light italic tracking-tighter leading-tight"
                >
                  {brand.tagline}
                </h1>

                <p className="text-sm sm:text-lg font-light opacity-80 leading-relaxed max-w-xl mx-auto">
                  {brand.mission}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <button
                    style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                    className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 hover:opacity-95 rounded-none border-none cursor-pointer"
                  >
                    <span>Explore Platform</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    style={{ borderColor: darkColor, color: darkColor }}
                    className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest border bg-transparent hover:bg-black/5 rounded-none cursor-pointer"
                  >
                    Read Whitepaper
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Business Cards Preview */}
      {(activeMockup === 'all' || activeMockup === 'card') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-3 text-[#1A1A1A] dark:text-[#F9F7F2]">
              <CreditCard className="w-4 h-4" />
              <span>Physical Touchpoint: Premium Business Cards</span>
            </h3>
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-50 text-[#1A1A1A] dark:text-[#F9F7F2]">Front & Back Design</span>
          </div>

          {/* Interactive Business Card Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-4 rounded-none transition-colors">
            <div>
              <label className="block text-[9px] uppercase tracking-widest font-bold mb-2 text-[#1A1A1A] dark:text-[#F9F7F2]">Card Holder Name</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Elena Vance"
                className="w-full bg-transparent border-b border-[#1A1A1A] dark:border-[#F9F7F2]/30 px-0 py-2 text-sm text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest font-bold mb-2 text-[#1A1A1A] dark:text-[#F9F7F2]">Card Holder Title</label>
              <input
                type="text"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                placeholder="Founder & Creative Director"
                className="w-full bg-transparent border-b border-[#1A1A1A] dark:border-[#F9F7F2]/30 px-0 py-2 text-sm text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Front Card */}
            <div
              style={{ backgroundColor: darkColor, color: '#ffffff' }}
              className="p-8 aspect-[1.75/1] border-2 border-white dark:border-zinc-800 flex flex-col justify-between relative overflow-hidden group shadow-2xl rounded-none"
            >
              <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                 <div className="w-[120%] h-px bg-white rotate-45 transform" />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <div
                  className="w-36 h-12 flex items-center"
                  dangerouslySetInnerHTML={{ __html: brand.logo.primaryLogoSvg }}
                />
                <span className="text-[9px] uppercase tracking-widest opacity-50">Front</span>
              </div>
              <div className="relative z-10">
                <p style={{ fontFamily: headingFont }} className="text-xl font-light italic text-gray-200">
                  "{brand.tagline}"
                </p>
                <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400 mt-4">{brand.industry}</p>
              </div>
            </div>

            {/* Back Card */}
            <div
              style={{ backgroundColor: lightColor, color: darkColor, fontFamily: bodyFont }}
              className="p-8 aspect-[1.75/1] border border-[#1A1A1A] dark:border-[#F9F7F2]/10 flex flex-col justify-between relative group rounded-none"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 style={{ fontFamily: headingFont }} className="font-light italic text-2xl">
                    {cardName}
                  </h4>
                  <p className="text-[9px] uppercase tracking-widest font-bold opacity-70 mt-1">{cardTitle}</p>
                </div>
                <div
                  className="w-12 h-12"
                  dangerouslySetInnerHTML={{ __html: brand.secondaryMarks[0]?.svg || brand.logo.primaryLogoSvg }}
                />
              </div>

              <div className="space-y-2 text-[10px] uppercase tracking-widest font-bold border-t border-dashed border-[#1A1A1A]/30 dark:border-white/10 pt-4">
                <p>{cardEmail}</p>
                <p>+1 (555) 839-2041</p>
                <p className="text-[9px] opacity-50 mt-1">San Francisco • Tokyo • London</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Social Media Instagram Post Graphic */}
      {(activeMockup === 'all' || activeMockup === 'social') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-black flex items-center gap-3 text-[#1A1A1A] dark:text-[#F9F7F2]">
              <Share2 className="w-4 h-4" />
              <span>Social Media Touchpoint: Brand Campaign Card (1:1)</span>
            </h3>
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-50 text-[#1A1A1A] dark:text-[#F9F7F2]">Instagram / LinkedIn</span>
          </div>

          <div className="max-w-md mx-auto">
            <div
              style={{
                backgroundColor: darkColor,
                color: '#ffffff',
              }}
              className="p-10 aspect-square border-4 border-[#F9F7F2] dark:border-zinc-800 flex flex-col justify-between relative overflow-hidden rounded-none shadow-2xl"
            >
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <div className="flex items-center justify-between relative z-10">
                <div
                  className="w-12 h-12"
                  dangerouslySetInnerHTML={{ __html: brand.secondaryMarks[1]?.svg || brand.logo.primaryLogoSvg }}
                />
                <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 border border-white/20 text-white rounded-none">
                  Brand Manifesto
                </span>
              </div>

              <div className="space-y-6 my-auto relative z-10">
                <div className="w-12 h-px bg-white/30" />
                <p
                  style={{ fontFamily: headingFont }}
                  className="text-2xl sm:text-3xl font-light italic leading-snug"
                >
                  "{brand.mission}"
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/20 pt-6 relative z-10">
                <div>
                  <span className="text-[11px] uppercase tracking-widest font-black block text-white">{brand.brandName}</span>
                  <span className="text-white/60 text-[9px] uppercase tracking-widest font-bold mt-1 block">{brand.tagline}</span>
                </div>
                <div
                  className="h-8 w-24"
                  dangerouslySetInnerHTML={{ __html: brand.logo.primaryLogoSvg }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
