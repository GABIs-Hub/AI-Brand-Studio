import { useState } from 'react';
import { BrandBible } from '../types';
import { BrandOverviewTab } from './BrandOverviewTab';
import { PaletteTab } from './PaletteTab';
import { TypographyTab } from './TypographyTab';
import { LogoTab } from './LogoTab';
import { ToneTab } from './ToneTab';
import { MockupsTab } from './MockupsTab';
import { FontLoader } from './FontLoader';
import { LayoutDashboard, Palette, Type, Shield, MessageSquare, Monitor } from 'lucide-react';

interface BrandDashboardProps {
  brand: BrandBible;
  onGenerateLogoImage: (prompt: string, resolution: string) => Promise<string | void>;
  isGeneratingLogoImage: boolean;
}

type TabType = 'overview' | 'palette' | 'typography' | 'logos' | 'tone' | 'mockups';

export function BrandDashboard({
  brand,
  onGenerateLogoImage,
  isGeneratingLogoImage,
}: BrandDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview & Core', icon: LayoutDashboard },
    { id: 'palette', label: '5-Color Palette', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'logos', label: 'Logos & Marks', icon: Shield },
    { id: 'tone', label: 'Tone & Voice', icon: MessageSquare },
    { id: 'mockups', label: 'Live Mockups', icon: Monitor },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Inject Google Font Link Dynamically */}
      <FontLoader url={brand.typography.googleFontsUrl} />

      {/* Navigation Tab Bar */}
      <div className="bg-white border border-[#1A1A1A] p-2 flex items-center overflow-x-auto scrollbar-none rounded-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all rounded-none border ${
                isActive
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'text-[#1A1A1A] border-transparent hover:border-dashed hover:border-[#1A1A1A]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && <BrandOverviewTab brand={brand} />}
        {activeTab === 'palette' && <PaletteTab palette={brand.palette} />}
        {activeTab === 'typography' && (
          <TypographyTab typography={brand.typography} brandName={brand.brandName} />
        )}
        {activeTab === 'logos' && (
          <LogoTab
            logo={brand.logo}
            secondaryMarks={brand.secondaryMarks}
            brandName={brand.brandName}
            onGenerateLogoImage={onGenerateLogoImage}
            generatedImageUrl={brand.generatedLogoImageUrl}
            generatedImageResolution={brand.generatedLogoResolution}
            isGeneratingImage={isGeneratingLogoImage}
          />
        )}
        {activeTab === 'tone' && (
          <ToneTab toneOfVoice={brand.toneOfVoice} imageryStyle={brand.imageryStyle} />
        )}
        {activeTab === 'mockups' && <MockupsTab brand={brand} />}
      </div>
    </div>
  );
}
