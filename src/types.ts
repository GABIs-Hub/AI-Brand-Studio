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
  generatedLogoImageUrl?: string;
  generatedLogoResolution?: string;
}

export interface GenerateBrandRequest {
  brandName?: string;
  mission: string;
  industry?: string;
  aesthetic?: string;
  targetAudience?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
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
