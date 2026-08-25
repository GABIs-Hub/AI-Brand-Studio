import { useState, useRef, useEffect } from 'react';
import { BrandBible, SocialPostData, SocialPlatform, SocialPostType, SocialPostLayout, SocialThemePreset } from '../types';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Share2,
  Sliders,
  Type,
  Layout,
  Palette,
  Instagram,
  Linkedin,
  MessageSquare,
  Wand2,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';

interface SocialTemplatesTabProps {
  brand: BrandBible;
  initialTopicHeadline?: string;
}

const POST_TYPES: { type: SocialPostType; label: string; icon: string; promptHint: string }[] = [
  { type: 'thought_leadership', label: 'Thought Leadership', icon: '💡', promptHint: 'Our perspective on redefining the future of industry standards.' },
  { type: 'announcement', label: 'Major Announcement', icon: '🚀', promptHint: 'Announcing our revolutionary new product experience.' },
  { type: 'value_pillar', label: 'Brand Manifesto & Values', icon: '🏛️', promptHint: 'Why radical precision and craftsmanship drive everything we create.' },
  { type: 'quote', label: 'Founder / Visionary Quote', icon: '💬', promptHint: 'A bold statement about solving the hardest problems in modern workflows.' },
  { type: 'feature_spotlight', label: 'Feature Spotlight', icon: '⚡', promptHint: 'Highlighting our breakthrough capabilities and distinct advantages.' },
  { type: 'social_proof', label: 'Impact & Social Proof', icon: '📈', promptHint: 'How we empowered industry leaders to move 10x faster.' },
  { type: 'hiring', label: 'Careers & Culture', icon: '🎯', promptHint: 'Join our world-class engineering and design guild.' },
  { type: 'event', label: 'Keynote & Event', icon: '🎙️', promptHint: 'Join our upcoming live architectural keynote and masterclass.' },
];

const PLATFORMS: { id: SocialPlatform; label: string; aspect: string; aspectClass: string; icon: typeof Instagram; width: number; height: number }[] = [
  { id: 'instagram_square', label: 'Instagram Feed (1:1)', aspect: '1:1', aspectClass: 'aspect-square max-w-[480px]', icon: Instagram, width: 1080, height: 1080 },
  { id: 'instagram_story', label: 'Instagram Story (9:16)', aspect: '9:16', aspectClass: 'aspect-[9/16] max-w-[340px]', icon: Instagram, width: 1080, height: 1920 },
  { id: 'linkedin_feed', label: 'LinkedIn Post (4:5)', aspect: '4:5', aspectClass: 'aspect-[4/5] max-w-[440px]', icon: Linkedin, width: 1080, height: 1350 },
  { id: 'linkedin_carousel', label: 'LinkedIn Slide (4:5)', aspect: '4:5 (Slide)', aspectClass: 'aspect-[4/5] max-w-[440px]', icon: Linkedin, width: 1080, height: 1350 },
];

const LAYOUTS: { id: SocialPostLayout; label: string; desc: string }[] = [
  { id: 'editorial_minimal', label: 'Editorial Minimal', desc: 'Spacious typography, subtle divider, balanced symmetry' },
  { id: 'bold_hero', label: 'Bold Statement', desc: 'Punchy oversized headline with secondary mark emphasis' },
  { id: 'split_visual', label: 'Split Visual / Photo', desc: 'Dual container with visual artwork on top or backdrop' },
  { id: 'metrics_card', label: 'Metric Spotlight', desc: 'High-impact stat counter with supporting narrative' },
  { id: 'framed_quote', label: 'Framed Manifesto', desc: 'Decorative quotation glyphs with author attribution' },
  { id: 'badge_stamp', label: 'Badge & Stamp', desc: 'Geometric seal header with sharp categorized content' },
];

const THEMES: { id: SocialThemePreset; label: string; desc: string }[] = [
  { id: 'brand_dark', label: 'Brand Dark', desc: 'Neutral Dark base with Primary & Accent text' },
  { id: 'brand_light', label: 'Brand Light', desc: 'Neutral Light base with high-contrast Dark ink' },
  { id: 'vibrant_accent', label: 'Primary Brand Fill', desc: 'Dominant Primary hue with crisp Light contrast' },
  { id: 'contrast_primary', label: 'Secondary Interplay', desc: 'Secondary depth with Accent highlights' },
  { id: 'minimal_editorial', label: 'Monochrome Editorial', desc: 'Classic gallery noir & ivory minimalism' },
];

export function SocialTemplatesTab({ brand, initialTopicHeadline }: SocialTemplatesTabProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Extract color hexes conveniently
  const primaryColor = brand.palette.find((c) => c.role === 'Primary')?.hex || '#1E40AF';
  const secondaryColor = brand.palette.find((c) => c.role === 'Secondary')?.hex || '#3B82F6';
  const accentColor = brand.palette.find((c) => c.role === 'Accent')?.hex || '#F59E0B';
  const lightColor = brand.palette.find((c) => c.role === 'Neutral Light')?.hex || '#F8F9FA';
  const darkColor = brand.palette.find((c) => c.role === 'Neutral Dark')?.hex || '#0F172A';

  const headingFont = `'${brand.typography.headingFont}', serif, sans-serif`;
  const bodyFont = `'${brand.typography.bodyFont}', sans-serif`;

  // Active state
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('instagram_square');
  const [selectedType, setSelectedType] = useState<SocialPostType>('thought_leadership');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Template Post Data State initialized with brand-aligned defaults
  const [postData, setPostData] = useState<SocialPostData>({
    id: 'initial-post',
    platform: 'instagram_square',
    postType: 'thought_leadership',
    layout: 'editorial_minimal',
    theme: 'brand_dark',
    badgeLabel: 'Brand Perspective',
    headline: `Redefining ${brand.industry}`,
    subheadline: brand.tagline,
    bodyCopy: brand.mission,
    quoteAuthor: 'Founder & Creative Lead',
    quoteRole: brand.brandName,
    metricNumber: '10x',
    metricLabel: `Elevation in ${brand.industry} Velocity`,
    callToAction: 'Discover Our Vision',
    hashtags: [
      brand.brandName.replace(/\s+/g, ''),
      brand.industry.replace(/\s+/g, ''),
      'BrandDesign',
      'Innovation',
      'Excellence',
    ],
    fullCaption: `✨ Setting a new benchmark in ${brand.industry}.\n\n"${brand.mission}"\n\nAt ${brand.brandName}, we believe every touchpoint is a promise kept. Explore what we're building.\n\n🔗 Link in bio.\n\n#${brand.brandName.replace(/\s+/g, '')} #${brand.industry.replace(/\s+/g, '')} #BrandDesign #Innovation`,
    aiImagePrompt: `Minimalist modern architectural composition with elegant light shadows, representing ${brand.brandName} in ${brand.industry}`,
  });

  // When postData platform changes, sync selectedPlatform
  useEffect(() => {
    setPostData((prev) => ({ ...prev, platform: selectedPlatform }));
  }, [selectedPlatform]);

  useEffect(() => {
    if (initialTopicHeadline) {
      setPostData((prev) => ({
        ...prev,
        headline: initialTopicHeadline,
        fullCaption: `📌 ${initialTopicHeadline}\n\n"${brand.mission}"\n\nAt ${brand.brandName}, we believe every touchpoint is a promise kept.\n\n🔗 Link in bio.\n\n#${brand.brandName.replace(/\s+/g, '')} #${brand.industry.replace(/\s+/g, '')} #BrandStrategy #Innovation`,
      }));
      setCustomPrompt(`Focus post on the topic: "${initialTopicHeadline}"`);
    }
  }, [initialTopicHeadline, brand.brandName, brand.mission, brand.industry]);

  // Compute theme styles based on selected theme preset
  const getThemeStyles = () => {
    switch (postData.theme) {
      case 'brand_dark':
        return {
          bg: darkColor,
          cardBorder: `1px solid ${lightColor}20`,
          textPrimary: '#FFFFFF',
          textSecondary: `${lightColor}CC`,
          accent: accentColor,
          badgeBg: `${primaryColor}25`,
          badgeText: accentColor,
          badgeBorder: `1px solid ${accentColor}40`,
          divider: `${lightColor}20`,
          buttonBg: primaryColor,
          buttonText: '#FFFFFF',
          patternOpacity: 0.05,
        };
      case 'brand_light':
        return {
          bg: lightColor,
          cardBorder: `1px solid ${darkColor}25`,
          textPrimary: darkColor,
          textSecondary: `${darkColor}AA`,
          accent: primaryColor,
          badgeBg: `${darkColor}08`,
          badgeText: primaryColor,
          badgeBorder: `1px solid ${darkColor}20`,
          divider: `${darkColor}15`,
          buttonBg: darkColor,
          buttonText: lightColor,
          patternOpacity: 0.04,
        };
      case 'vibrant_accent':
        return {
          bg: primaryColor,
          cardBorder: `1px solid rgba(255,255,255,0.25)`,
          textPrimary: '#FFFFFF',
          textSecondary: 'rgba(255,255,255,0.85)',
          accent: accentColor,
          badgeBg: 'rgba(255,255,255,0.15)',
          badgeText: '#FFFFFF',
          badgeBorder: '1px solid rgba(255,255,255,0.3)',
          divider: 'rgba(255,255,255,0.2)',
          buttonBg: '#FFFFFF',
          buttonText: darkColor,
          patternOpacity: 0.07,
        };
      case 'contrast_primary':
        return {
          bg: secondaryColor,
          cardBorder: `1px solid ${accentColor}40`,
          textPrimary: '#FFFFFF',
          textSecondary: 'rgba(255,255,255,0.9)',
          accent: accentColor,
          badgeBg: `${accentColor}25`,
          badgeText: '#FFFFFF',
          badgeBorder: `1px solid ${accentColor}60`,
          divider: 'rgba(255,255,255,0.2)',
          buttonBg: accentColor,
          buttonText: darkColor,
          patternOpacity: 0.06,
        };
      case 'minimal_editorial':
      default:
        return {
          bg: '#0D0D0C',
          cardBorder: `1px solid rgba(255,255,255,0.15)`,
          textPrimary: '#F9F7F2',
          textSecondary: 'rgba(249, 247, 242, 0.7)',
          accent: '#F9F7F2',
          badgeBg: 'transparent',
          badgeText: '#F9F7F2',
          badgeBorder: '1px solid rgba(249, 247, 242, 0.4)',
          divider: 'rgba(249, 247, 242, 0.15)',
          buttonBg: '#F9F7F2',
          buttonText: '#0D0D0C',
          patternOpacity: 0.03,
        };
    }
  };

  const themeStyle = getThemeStyles();

  // Call API to generate post content
  const handleGeneratePost = async (overridePrompt?: string) => {
    setIsGenerating(true);
    setStatusMessage('Crafting AI brand copy and layout structure...');
    try {
      const response = await fetch('/api/generate-social-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          postType: selectedType,
          platform: selectedPlatform,
          topicPrompt: overridePrompt !== undefined ? overridePrompt : customPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate social template.');
      }

      const generated = (await response.json()) as SocialPostData;
      setPostData(generated);
      setStatusMessage('✨ Template generated successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      console.error('Social generation error:', err);
      setStatusMessage(`Error: ${err.message || 'Generation failed'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Call API to generate background visual image
  const handleGenerateVisual = async () => {
    if (!postData.aiImagePrompt) return;
    setIsGeneratingVisual(true);
    setStatusMessage('Generating AI background visual with Gemini...');
    try {
      const targetAspect = selectedPlatform === 'instagram_story' ? '9:16' : '1:1';
      const response = await fetch('/api/generate-social-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${postData.aiImagePrompt}, brand palette tones: ${primaryColor}, ${accentColor}, aesthetic: ${brand.imageryStyle?.moodboardKeywords?.join(', ') || 'modern minimalist'}`,
          aspectRatio: targetAspect,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Image generation failed');
      }

      const data = await response.json();
      if (data.imageUrl) {
        setPostData((prev) => ({ ...prev, aiGeneratedImageUrl: data.imageUrl }));
        setStatusMessage('Artwork generated and integrated into template!');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Visual generation error:', err);
      setStatusMessage(`Visual generation notice: ${err.message}`);
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  // Export card as PNG image
  const handleExportPng = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setStatusMessage('Rendering high-resolution PNG export...');
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // 2x crisp retina export
      });
      const link = document.createElement('a');
      link.download = `${brand.brandName.toLowerCase().replace(/\s+/g, '-')}-${selectedPlatform}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setStatusMessage('Graphic downloaded successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      console.error('PNG export failed:', err);
      setStatusMessage('Export error: Unable to rasterize card.');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Caption to Clipboard
  const handleCopyCaption = () => {
    const text = `${postData.fullCaption}\n\n${postData.hashtags.map((h) => `#${h}`).join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const currentPlatformObj = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  return (
    <div className="space-y-8" id="social-template-studio">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 pb-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
              AI Social Media Template Studio
            </span>
            <span className="bg-[#1A1A1A] dark:bg-[#F9F7F2] text-white dark:text-[#1A1A1A] text-[9px] uppercase tracking-widest font-black px-2 py-0.5">
              Multi-Channel
            </span>
          </div>
          <p className="font-serif italic text-lg opacity-80 mt-2 text-[#1A1A1A] dark:text-[#F9F7F2]">
            AI-rendered Instagram & LinkedIn campaign templates auto-infused with {brand.brandName}'s typography, palette, and vector marks.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPng}
            disabled={isExporting}
            id="download-social-card-btn"
            className="px-4 py-2.5 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Download PNG'}</span>
          </button>

          <button
            onClick={handleCopyCaption}
            id="copy-social-caption-btn"
            className="px-4 py-2.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 text-[#1A1A1A] dark:text-[#F9F7F2] text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="bg-zinc-100 dark:bg-zinc-800 border-l-2 border-[#1A1A1A] dark:border-[#F9F7F2] p-3 text-xs font-mono text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center justify-between animate-fadeIn">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Platform & Campaign Type Selector Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Generator Controls & Configuration */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Target Social Platform */}
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-5 space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5" />
              <span>1. Target Platform & Dimensions</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((plat) => {
                const Icon = plat.icon;
                const isSelected = selectedPlatform === plat.id;
                return (
                  <button
                    key={plat.id}
                    onClick={() => setSelectedPlatform(plat.id)}
                    className={`p-3 text-left border flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                        : 'bg-transparent text-[#1A1A1A] dark:text-[#F9F7F2] border-gray-200 dark:border-zinc-800 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="w-4 h-4" />
                      <span className="text-[9px] font-mono opacity-60">{plat.aspect}</span>
                    </div>
                    <span className="text-[10px] font-bold mt-2">{plat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Post Archetype & Tone */}
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-5 space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>2. Campaign Archetype</span>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {POST_TYPES.map((pt) => {
                const isSelected = selectedType === pt.type;
                return (
                  <button
                    key={pt.type}
                    onClick={() => {
                      setSelectedType(pt.type);
                      setCustomPrompt(pt.promptHint);
                    }}
                    className={`p-2.5 text-left border flex items-center gap-2.5 transition-all text-xs cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                        : 'bg-transparent text-[#1A1A1A] dark:text-[#F9F7F2] border-gray-200 dark:border-zinc-800 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-sm">{pt.icon}</span>
                    <span className="text-[10px] font-bold leading-tight truncate">{pt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Prompt Input */}
            <div className="pt-2">
              <label className="block text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 mb-1">
                Custom Topic / Focus Angle (Optional)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Announce our launch, focus on sustainable innovation, quote on design..."
                rows={2}
                className="w-full bg-transparent border border-[#1A1A1A] dark:border-[#F9F7F2]/30 p-2 text-xs text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden"
              />
            </div>

            <button
              onClick={() => handleGeneratePost()}
              disabled={isGenerating}
              id="generate-social-post-btn"
              className="w-full py-3 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] text-[10px] uppercase tracking-widest font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isGenerating ? 'Synthesizing with Gemini...' : 'Generate Post Content'}</span>
            </button>
          </div>

          {/* 3. Layout Archetype & Theme Selector */}
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-5 space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2 mb-2">
                <Layout className="w-3.5 h-3.5" />
                <span>3. Layout Architecture</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {LAYOUTS.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setPostData((prev) => ({ ...prev, layout: layout.id }))}
                    className={`p-2 text-left border transition-all cursor-pointer ${
                      postData.layout === layout.id
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                        : 'bg-transparent text-[#1A1A1A] dark:text-[#F9F7F2] border-gray-200 dark:border-zinc-800 hover:border-gray-400'
                    }`}
                  >
                    <p className="text-[9px] uppercase tracking-wider font-bold truncate">{layout.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2 mb-2">
                <Palette className="w-3.5 h-3.5" />
                <span>4. Color Palette Theme</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setPostData((prev) => ({ ...prev, theme: theme.id }))}
                    className={`p-2 text-left border transition-all cursor-pointer ${
                      postData.theme === theme.id
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                        : 'bg-transparent text-[#1A1A1A] dark:text-[#F9F7F2] border-gray-200 dark:border-zinc-800 hover:border-gray-400'
                    }`}
                  >
                    <p className="text-[9px] uppercase tracking-wider font-bold truncate">{theme.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Image Generation trigger */}
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <div className="text-[9px] opacity-70 text-[#1A1A1A] dark:text-[#F9F7F2] truncate">
                AI Visual: {postData.aiGeneratedImageUrl ? 'Custom Art Active' : 'Default Brand Vectors'}
              </div>
              <button
                onClick={handleGenerateVisual}
                disabled={isGeneratingVisual}
                className="px-3 py-1.5 border border-dashed border-[#1A1A1A] dark:border-[#F9F7F2]/40 text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 text-[#1A1A1A] dark:text-[#F9F7F2]"
              >
                {isGeneratingVisual ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                <span>{isGeneratingVisual ? 'Rendering...' : 'Render AI Artwork'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Live Social Canvas Render */}
        <div className="lg:col-span-7 space-y-6 flex flex-col items-center">
          {/* Card Canvas Container */}
          <div className="w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-gray-100 dark:bg-[#111110] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 transition-colors">
            {/* Aspect Ratio Frame */}
            <div
              ref={cardRef}
              style={{
                backgroundColor: themeStyle.bg,
                color: themeStyle.textPrimary,
                fontFamily: bodyFont,
              }}
              className={`w-full ${currentPlatformObj.aspectClass} p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl transition-all duration-300 rounded-none`}
            >
              {/* Optional AI Generated Background Image */}
              {postData.aiGeneratedImageUrl && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <img
                    src={postData.aiGeneratedImageUrl}
                    alt="AI Visual Backdrop"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-25 mix-blend-overlay"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, ${themeStyle.bg}E6 0%, ${themeStyle.bg}B3 50%, ${themeStyle.bg}F2 100%)`,
                    }}
                  />
                </div>
              )}

              {/* Geometric Grid Pattern Accent */}
              <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  opacity: themeStyle.patternOpacity,
                  backgroundImage: `radial-gradient(circle at 2px 2px, ${themeStyle.textPrimary} 1px, transparent 0)`,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* CARD TOP: Logo & Category Badge */}
              <div className="flex items-center justify-between relative z-10">
                {/* Secondary Monogram or Primary Logo */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center"
                    dangerouslySetInnerHTML={{
                      __html: brand.secondaryMarks[0]?.svg || brand.logo.primaryLogoSvg,
                    }}
                  />
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black" style={{ color: themeStyle.textPrimary }}>
                    {brand.brandName}
                  </span>
                </div>

                {/* Badge Tag */}
                {postData.badgeLabel && (
                  <span
                    style={{
                      backgroundColor: themeStyle.badgeBg,
                      color: themeStyle.badgeText,
                      border: themeStyle.badgeBorder,
                    }}
                    className="text-[8px] sm:text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-none shadow-xs"
                  >
                    {postData.badgeLabel}
                  </span>
                )}
              </div>

              {/* CARD MIDDLE CONTENT (Varies by Layout) */}
              <div className="my-auto py-6 relative z-10 space-y-4">
                {/* 1. Editorial Minimal Layout */}
                {postData.layout === 'editorial_minimal' && (
                  <div className="space-y-4">
                    <div className="w-8 h-0.5" style={{ backgroundColor: themeStyle.accent }} />
                    <h2
                      style={{ fontFamily: headingFont, color: themeStyle.textPrimary }}
                      className="text-2xl sm:text-4xl font-light italic leading-tight tracking-tight"
                    >
                      {postData.headline}
                    </h2>
                    {postData.subheadline && (
                      <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest opacity-80" style={{ color: themeStyle.accent }}>
                        {postData.subheadline}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm font-light leading-relaxed opacity-90 max-w-lg" style={{ color: themeStyle.textSecondary }}>
                      {postData.bodyCopy}
                    </p>
                  </div>
                )}

                {/* 2. Bold Hero Layout */}
                {postData.layout === 'bold_hero' && (
                  <div className="space-y-5">
                    <span
                      style={{ color: themeStyle.accent }}
                      className="text-[9px] uppercase tracking-[0.3em] font-bold block"
                    >
                      {brand.tagline}
                    </span>
                    <h2
                      style={{ fontFamily: headingFont, color: themeStyle.textPrimary }}
                      className="text-3xl sm:text-5xl font-light italic leading-none tracking-tighter"
                    >
                      {postData.headline}
                    </h2>
                    <div className="p-4 border-l-2" style={{ borderColor: themeStyle.accent, backgroundColor: `${themeStyle.accent}10` }}>
                      <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: themeStyle.textPrimary }}>
                        "{postData.bodyCopy}"
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Split Visual Layout */}
                {postData.layout === 'split_visual' && (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-7 space-y-3">
                      <h2
                        style={{ fontFamily: headingFont, color: themeStyle.textPrimary }}
                        className="text-2xl sm:text-3xl font-light italic leading-snug"
                      >
                        {postData.headline}
                      </h2>
                      <p className="text-xs leading-relaxed opacity-90" style={{ color: themeStyle.textSecondary }}>
                        {postData.bodyCopy}
                      </p>
                    </div>
                    <div className="sm:col-span-5 flex justify-center">
                      <div
                        className="w-24 h-24 sm:w-28 sm:h-28 p-4 border flex items-center justify-center relative overflow-hidden"
                        style={{ borderColor: themeStyle.divider, backgroundColor: `${themeStyle.textPrimary}08` }}
                      >
                        <div
                          className="w-full h-full flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: brand.secondaryMarks[1]?.svg || brand.logo.primaryLogoSvg }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Metrics Card Layout */}
                {postData.layout === 'metrics_card' && (
                  <div className="space-y-4 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span
                        style={{ fontFamily: headingFont, color: themeStyle.accent }}
                        className="text-5xl sm:text-7xl font-bold tracking-tighter leading-none"
                      >
                        {postData.metricNumber || '100%'}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest font-black opacity-80" style={{ color: themeStyle.textPrimary }}>
                        {postData.metricLabel || 'Verified Brand Velocity'}
                      </span>
                    </div>
                    <h3
                      style={{ fontFamily: headingFont, color: themeStyle.textPrimary }}
                      className="text-xl sm:text-2xl font-light italic"
                    >
                      {postData.headline}
                    </h3>
                    <p className="text-xs sm:text-sm font-light opacity-80 max-w-md" style={{ color: themeStyle.textSecondary }}>
                      {postData.bodyCopy}
                    </p>
                  </div>
                )}

                {/* 5. Framed Quote Layout */}
                {postData.layout === 'framed_quote' && (
                  <div className="space-y-4">
                    <span className="text-4xl sm:text-5xl opacity-40 leading-none font-serif block" style={{ color: themeStyle.accent }}>
                      “
                    </span>
                    <p
                      style={{ fontFamily: headingFont, color: themeStyle.textPrimary }}
                      className="text-xl sm:text-3xl font-light italic leading-snug -mt-4"
                    >
                      {postData.bodyCopy || postData.headline}
                    </p>
                    <div className="pt-2 flex items-center gap-3 border-t" style={{ borderColor: themeStyle.divider }}>
                      <div className="w-6 h-px" style={{ backgroundColor: themeStyle.accent }} />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: themeStyle.textPrimary }}>
                          {postData.quoteAuthor || brand.brandName}
                        </p>
                        <p className="text-[8px] uppercase tracking-widest font-bold opacity-60" style={{ color: themeStyle.textSecondary }}>
                          {postData.quoteRole || brand.tagline}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Badge & Stamp Layout */}
                {postData.layout === 'badge_stamp' && (
                  <div className="border p-5 space-y-4 text-center" style={{ borderColor: themeStyle.divider }}>
                    <div
                      className="w-10 h-10 mx-auto"
                      dangerouslySetInnerHTML={{ __html: brand.secondaryMarks[0]?.svg || brand.logo.primaryLogoSvg }}
                    />
                    <h2
                      style={{ fontFamily: headingFont, color: themeStyle.textPrimary }}
                      className="text-2xl sm:text-3xl font-light italic tracking-tight"
                    >
                      {postData.headline}
                    </h2>
                    <p className="text-xs font-light max-w-sm mx-auto" style={{ color: themeStyle.textSecondary }}>
                      {postData.bodyCopy}
                    </p>
                  </div>
                )}
              </div>

              {/* CARD BOTTOM: Primary Brand Logo + CTA */}
              <div
                className="pt-4 flex items-center justify-between border-t relative z-10"
                style={{ borderColor: themeStyle.divider }}
              >
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-black block" style={{ color: themeStyle.textPrimary }}>
                    @{brand.brandName.toLowerCase().replace(/\s+/g, '')}
                  </span>
                  <span className="text-[8px] uppercase tracking-widest font-bold opacity-60 block mt-0.5" style={{ color: themeStyle.textSecondary }}>
                    {brand.tagline}
                  </span>
                </div>

                {/* CTA Action Button */}
                {postData.callToAction && (
                  <div
                    style={{
                      backgroundColor: themeStyle.buttonBg,
                      color: themeStyle.buttonText,
                    }}
                    className="px-4 py-2 text-[8px] sm:text-[9px] uppercase tracking-widest font-black shadow-sm flex items-center gap-1.5 rounded-none"
                  >
                    <span>{postData.callToAction}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Dimension & Spec Tag */}
            <div className="mt-3 flex items-center gap-4 text-[9px] font-mono text-gray-500 dark:text-zinc-400">
              <span>Aspect: {currentPlatformObj.aspect}</span>
              <span>•</span>
              <span>Export Resolution: {currentPlatformObj.width} × {currentPlatformObj.height} px (Retina 2x)</span>
            </div>
          </div>

          {/* Real-time Content Editor Drawer */}
          <div className="w-full bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>Live Content & Typography Editor</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest font-mono text-gray-400">Instant Sync</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 mb-1">
                  Card Headline
                </label>
                <input
                  type="text"
                  value={postData.headline}
                  onChange={(e) => setPostData((prev) => ({ ...prev, headline: e.target.value }))}
                  className="w-full bg-transparent border border-gray-200 dark:border-zinc-700 p-2 text-xs text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 mb-1">
                  Badge Label / Category
                </label>
                <input
                  type="text"
                  value={postData.badgeLabel || ''}
                  onChange={(e) => setPostData((prev) => ({ ...prev, badgeLabel: e.target.value }))}
                  className="w-full bg-transparent border border-gray-200 dark:border-zinc-700 p-2 text-xs text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 mb-1">
                  Main Body Copy / Statement
                </label>
                <textarea
                  value={postData.bodyCopy}
                  onChange={(e) => setPostData((prev) => ({ ...prev, bodyCopy: e.target.value }))}
                  rows={2}
                  className="w-full bg-transparent border border-gray-200 dark:border-zinc-700 p-2 text-xs text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 mb-1">
                  Call-To-Action Button
                </label>
                <input
                  type="text"
                  value={postData.callToAction || ''}
                  onChange={(e) => setPostData((prev) => ({ ...prev, callToAction: e.target.value }))}
                  className="w-full bg-transparent border border-gray-200 dark:border-zinc-700 p-2 text-xs text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 mb-1">
                  Metric Highlight (Number & Label)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={postData.metricNumber || ''}
                    onChange={(e) => setPostData((prev) => ({ ...prev, metricNumber: e.target.value }))}
                    placeholder="99%"
                    className="w-1/3 bg-transparent border border-gray-200 dark:border-zinc-700 p-2 text-xs text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={postData.metricLabel || ''}
                    onChange={(e) => setPostData((prev) => ({ ...prev, metricLabel: e.target.value }))}
                    placeholder="Accuracy rate"
                    className="w-2/3 bg-transparent border border-gray-200 dark:border-zinc-700 p-2 text-xs text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Caption & Hashtag Box */}
          <div className="w-full bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ready-To-Post Caption & Hashtags</span>
              </span>
              <button
                onClick={handleCopyCaption}
                className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedCaption ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCaption ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>
            <textarea
              value={postData.fullCaption}
              onChange={(e) => setPostData((prev) => ({ ...prev, fullCaption: e.target.value }))}
              rows={4}
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-3 text-xs font-sans text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden leading-relaxed"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {postData.hashtags.map((ht, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-[#1A1A1A] dark:text-[#F9F7F2] text-[9px] font-mono border border-gray-200 dark:border-zinc-700"
                >
                  #{ht}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
