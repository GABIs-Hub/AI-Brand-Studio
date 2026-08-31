export interface BrandColor {
  name: string;
  hex: string;
  rgb: string;
  role: 'Primary' | 'Secondary' | 'Accent' | 'Neutral Light' | 'Neutral Dark';
  usage: string;
  contrastNote: string;
}

export interface FontPairing {
  headingFont: string;
  headingFontCategory: 'Serif' | 'Sans-Serif' | 'Display' | 'Monospace';
  headingWeights: string[];
  bodyFont: string;
  bodyFontCategory: 'Serif' | 'Sans-Serif' | 'Monospace';
  bodyWeights: string[];
  accentFont?: string;
  googleFontsUrl: string;
  rationale: string;
  cssSnippet: string;
}

export interface LogoSpec {
  primaryLogoSvg: string;
  concept: string;
  symbolism: string;
  geometryDetails: string;
  aiImagePrompt: string;
}

export interface SecondaryMark {
  id: string;
  title: string;
  description: string;
  svg: string;
}

export interface BrandValue {
  title: string;
  description: string;
  iconName: string;
}

export interface ToneGuideline {
  trait: string;
  description: string;
  doExample: string;
  dontExample: string;
}

export interface PersonalityTrait {
  trait: string;
  rating: number; // 1 to 5
  minLabel: string;
  maxLabel: string;
}

export interface ImageryStyle {
  moodboardKeywords: string[];
  photographyGuidance: string;
  dos: string[];
  donts: string[];
}

export interface BrandBible {
  id: string;
  userId?: string;
  brandName: string;
  tagline: string;
  industry: string;
  mission: string;
  vision: string;
  positioningStatement: string;
  personalityTraits: PersonalityTrait[];
  values: BrandValue[];
  palette: BrandColor[];
  typography: FontPairing;
  logo: LogoSpec;
  secondaryMarks: SecondaryMark[];
  toneOfVoice: ToneGuideline[];
  targetAudience: string;
  imageryStyle: ImageryStyle;
  createdAt: string;
  updatedAt?: string;
  generatedLogoImageUrl?: string;
  generatedLogoResolution?: string;
  version?: string;
}

export type MilestoneCategory = 'genesis' | 'checkpoint' | 'refinement' | 'pivot' | 'ai_enhancement' | 'identity_refresh';

export interface BrandMilestone {
  id: string;
  brandId: string;
  versionLabel: string;
  title: string;
  changeNote: string;
  timestamp: string;
  category: MilestoneCategory;
  tags: string[];
  snapshot: BrandBible;
}

export type SocialPlatform =
  | 'instagram_square'
  | 'instagram_story'
  | 'linkedin_feed'
  | 'linkedin_carousel'
  | 'tiktok_video'
  | 'whatsapp_status'
  | 'whatsapp_broadcast';

export type SocialPostType =
  | 'announcement'
  | 'thought_leadership'
  | 'value_pillar'
  | 'quote'
  | 'feature_spotlight'
  | 'hiring'
  | 'event'
  | 'social_proof';

export type SocialPostLayout =
  | 'editorial_minimal'
  | 'bold_hero'
  | 'split_visual'
  | 'metrics_card'
  | 'framed_quote'
  | 'badge_stamp';

export type SocialThemePreset =
  | 'brand_dark'
  | 'brand_light'
  | 'vibrant_accent'
  | 'contrast_primary'
  | 'minimal_editorial';

export interface VideoScene {
  step: number;
  title: string;
  action: string;
  narration: string;
  duration: string;
}

export interface SocialPostData {
  id: string;
  platform: SocialPlatform;
  postType: SocialPostType;
  layout: SocialPostLayout;
  theme: SocialThemePreset;
  badgeLabel?: string;
  headline: string;
  subheadline?: string;
  bodyCopy: string;
  quoteAuthor?: string;
  quoteRole?: string;
  metricNumber?: string;
  metricLabel?: string;
  callToAction?: string;
  hashtags: string[];
  fullCaption: string;
  aiImagePrompt?: string;
  aiGeneratedImageUrl?: string;
  // Extended video and broadcast capabilities
  videoHookScript?: string;
  videoScenes?: VideoScene[];
  viralAudioSuggestion?: string;
  whatsappMessageTemplate?: string;
}

export interface GenerateBrandRequest {
  brandName?: string;
  mission: string;
  industry?: string;
  aesthetic?: string;
  targetAudience?: string;
  isExistingBrandRefresh?: boolean;
  existingColors?: string[];
  existingTagline?: string;
  baseBrandId?: string;
  previousVersionDetails?: {
    typography?: string;
    logoConcept?: string;
    values?: string[];
  };
}

export type LogoArchetype =
  | 'negative_space'
  | 'interlocking_monogram'
  | 'abstract_emblem'
  | 'geometric_minimalist'
  | 'architectural_badge'
  | 'modern_wordmark';

export interface LogoVariation {
  id: string;
  title: string;
  archetype: LogoArchetype;
  archetypeLabel: string;
  svg: string;
  concept: string;
  symbolism: string;
  geometryDetails: string;
  aiImagePrompt?: string;
  tags: string[];
}

export type HookAngle =
  | 'contrarian'
  | 'curiosity'
  | 'storytelling'
  | 'framework'
  | 'future_trend'
  | 'data_insight'
  | 'behind_the_scenes';

export interface ViralTopicHook {
  id: string;
  headline: string;
  hookAngle: HookAngle;
  hookAngleLabel: string;
  pitch: string;
  suggestedFormat: 'carousel' | 'single_post' | 'thread' | 'video_script' | 'manifesto';
  engagementPrediction: 'High Viral Potential' | 'Deep Authority & Trust' | 'High Conversation Starter' | 'High Saves & Shares';
  targetEmotion: string;
  sampleOutline: string[];
  suggestedHashtags: string[];
}

export interface BrandAuditRecommendation {
  id: string;
  category: 'Visual & Logo' | 'Color & Contrast' | 'Typography' | 'Voice & Messaging' | 'Market Positioning';
  severity: 'High Priority' | 'Enhancement' | 'Strength';
  finding: string;
  recommendation: string;
  actionableStep: string;
}

export interface BrandAuditResult {
  overallScore: number; // 0 to 100
  brandMaturityLevel: 'Emerging' | 'Scaling' | 'Established Leader' | 'Heritage Icon';
  summary: string;
  keyStrengths: string[];
  criticalGaps: string[];
  recommendations: BrandAuditRecommendation[];
  quickFixPivots: string[];
}

export interface ExistingBrandInput {
  brandName: string;
  tagline?: string;
  industry: string;
  currentMission: string;
  targetAudience?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  currentAesthetic?: string;
  actionFocus: 'refresh_logos' | 'viral_topics' | 'social_campaign' | 'full_dossier_upgrade' | 'brand_audit';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ChainOfThoughtStep {
  stepNumber: number;
  stepName: string;
  focus: string;
  reasoning: string;
  extractedMetaphors?: string[];
  geometryRules?: string[];
}

export interface LogoPromptRefinementRequest {
  brandName: string;
  industry?: string;
  mission?: string;
  aesthetic?: string;
  targetAudience?: string;
  archetype?: LogoArchetype;
  customDirectives?: string;
  complexityLevel?: 'minimalist_precision' | 'intricate_geometric' | 'architectural_dimensional' | 'metaphoric_duality';
  currentPrompt?: string;
}

export interface LogoPromptRefinementResult {
  brandName: string;
  archetype: LogoArchetype;
  conceptualMetaphor: string;
  chainOfThought: ChainOfThoughtStep[];
  refinedVectorPrompt: string;
  refinedStudioPrompt: string;
  svgPathBlueprint: string;
  visualComplexityAnalysis: string;
  generatedSvg?: string;
  suggestedArchetypes?: { archetype: LogoArchetype; name: string; rationale: string }[];
}

export interface SamplePreset {
  id: string;
  name: string;
  industry: string;
  aesthetic: string;
  mission: string;
  targetAudience: string;
  icon: string;
}

export interface UserStudioSettings {
  studioName?: string;
  creativeDirector?: string;
  defaultIndustry?: string;
  defaultAesthetic?: string;
  autoRecordMilestones?: boolean;
  highResRenderMode?: 'standard' | 'high_definition' | 'cinematic';
  colorPaletteHarmony?: 'balanced' | 'vibrant' | 'minimalist_earthy' | 'monochromatic';
}

export * from './types/brandCaseStudies';

