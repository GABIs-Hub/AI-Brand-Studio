export interface BrandHistoricalLogo {
  era: string; // e.g. "1971 - 1987", "1976", "1998"
  title: string; // e.g. "The Carolyn Davidson Swoosh ($35 design)"
  description: string;
  keyDesignChanges: string[];
  imageUrl?: string; // Direct URL to historical logo image
}

export interface BrandMilestone {
  year: string;
  headline: string;
  summary: string;
  takeaway: string;
}

export interface BrandArchetypeLesson {
  lessonTitle: string;
  explanation: string;
  actionableStepForYourBrand: string;
}

export interface PopularBrandCaseStudy {
  id: string;
  brandName: string;
  tagline: string;
  foundingYear: number;
  founders: string[];
  headquarters: string;
  industry: string;
  category: 'Tech & Software' | 'Luxury & Fashion' | 'Athletics & Lifestyle' | 'Food & Beverage' | 'Automotive & Space' | 'Media & Entertainment';
  originStory: string;
  initialStruggle: string;
  thePivotalBreakthrough: string;
  coreBrandPillars: { title: string; description: string }[];
  logoEvolution: BrandHistoricalLogo[];
  colorPaletteHeritage: { name: string; hex: string; role: string; psychology: string }[];
  typographyEvolution: { era: string; fontName: string; style: string; rationale: string }[];
  keyMilestones: BrandMilestone[];
  actionableLessons: BrandArchetypeLesson[];
  starterPromptInspiration: {
    recommendedMission: string;
    recommendedAesthetic: string;
    recommendedTargetAudience: string;
    recommendedIndustry: string;
  };
}
