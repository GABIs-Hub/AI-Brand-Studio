export interface LogoAttribution {
  fileTitle: string; // Wikimedia Commons file name (e.g. "File:Nike logo 1978.svg")
  license: string; // e.g. "Public domain" | "CC BY-SA 4.0"
  artist?: string;
  pageUrl: string; // Link to the Commons file page (for licensing/attribution)
}

export interface BrandHistoricalLogo {
  era: string; // e.g. "1971 - 1987", "1976", "1998"
  title: string; // e.g. "The Carolyn Davidson Swoosh ($35 design)"
  description: string;
  keyDesignChanges: string[];
  imageUrl?: string; // Real archival image URL (Wikimedia Commons) or placeholder SVG data URI
  attribution?: LogoAttribution; // Set when imageUrl is a real archival image (CC attribution)
  isStylizedPlaceholder?: boolean; // True when imageUrl is an illustrative reconstruction, not the actual logo
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
