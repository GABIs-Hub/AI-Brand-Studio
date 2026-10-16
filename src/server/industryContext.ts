// ────────────────────────────────────────────────────────────────────────────
// GABI Industry Intelligence & Creative Direction Matrix
// Provides deep contextual design guidelines tailored per industry so that
// civil engineering, fashion, software, healthcare, and hospitality never
// receive identical or generic visual identities.
// ────────────────────────────────────────────────────────────────────────────

export interface IndustryCreativeDirection {
  name: string;
  categoryKeywords: string[];
  logoArchetypes: string[];
  logoGeometryGuidance: string;
  colorPhilosophy: {
    hueFamily: string;
    paletteRationale: string;
    suggestedSeedHues: string[];
    surfaceTreatment: string;
  };
  typographyRules: {
    headingStyle: string;
    bodyStyle: string;
    recommendedPairings: Array<{ heading: string; body: string; rationale: string }>;
  };
  personalityDefaults: Array<{ trait: string; rating: number; minLabel: string; maxLabel: string }>;
  photographyDirection: {
    lens: string;
    lighting: string;
    materials: string;
    composition: string;
    colorGrade: string;
  };
  recommendedMockups: string[];
  iconConcepts: string[];
}

export const INDUSTRY_INTELLIGENCE: Record<string, IndustryCreativeDirection> = {
  civil_engineering: {
    name: 'Civil Engineering, Infrastructure & Construction',
    categoryKeywords: ['civil', 'construction', 'engineering', 'infrastructure', 'structural', 'building', 'concrete', 'heavy', 'architecture'],
    logoArchetypes: ['architectural_badge', 'geometric_minimalist', 'negative_space'],
    logoGeometryGuidance:
      'Tectonic, load-bearing geometry with structural triangulation, orthogonal trusses, monolithic forms, and weight-balanced negative space. Avoid soft organic blobs or playful curls.',
    colorPhilosophy: {
      hueFamily: 'Steel, Slate, High-Visibility Safety Accent, Earth Ochre',
      paletteRationale: 'Grounds the brand in enduring industrial authority, structural steel, and high-visibility field safety.',
      suggestedSeedHues: ['#1E293B', '#334155', '#D97706', '#0284C7', '#475569'],
      surfaceTreatment: 'Matte, textured, powder-coated, reinforced concrete, architectural glass',
    },
    typographyRules: {
      headingStyle: 'Structured, geometric, tectonic sans-serif with bold industrial stance and wide tracking',
      bodyStyle: 'Ultra-legible, highly structured sans-serif with tabular numerals',
      recommendedPairings: [
        { heading: 'Plus Jakarta Sans', body: 'Inter', rationale: 'Architectural precision paired with unyielding digital ergonomics.' },
        { heading: 'Outfit', body: 'Inter', rationale: 'Geometric modularity communicating industrial advancement.' },
      ],
    },
    personalityDefaults: [
      { trait: 'Reliability', rating: 5, minLabel: 'Experimental', maxLabel: 'Unshakable' },
      { trait: 'Aesthetic', rating: 2, minLabel: 'Industrial / Utilitarian', maxLabel: 'Ornamental' },
      { trait: 'Authority', rating: 5, minLabel: 'Casual', maxLabel: 'Institutional' },
      { trait: 'Innovation', rating: 4, minLabel: 'Traditional', maxLabel: 'Advanced' },
    ],
    photographyDirection: {
      lens: 'Sony 24-70mm f/2.8 GM II at f/8 for deep architectural sharpness and edge-to-edge structural resolution',
      lighting: 'Low-angle golden hour side-raking light highlighting raw concrete textures and steel joints',
      materials: 'Rebar, board-formed concrete, structural steel, safety fluor, drafting vellum',
      composition: 'One-point perspective with vanishing lines anchored to horizon, clean architectural planes',
      colorGrade: 'Desaturated industrial tones with calibrated amber/ochre warmth and deep slate shadows',
    },
    recommendedMockups: ['architectural_building_signage', 'jobsite_safety_helmet', 'blueprint_project_card', 'industrial_fleet_vehicle'],
    iconConcepts: ['HardHat', 'Layers', 'Ruler', 'Hammer', 'Shield', 'Compass'],
  },

  fashion_luxury: {
    name: 'Fashion, Haute Couture & Luxury Goods',
    categoryKeywords: ['fashion', 'luxury', 'couture', 'apparel', 'clothing', 'jewelry', 'timepiece', 'haute', 'leather', 'atelier'],
    logoArchetypes: ['interlocking_monogram', 'modern_wordmark', 'abstract_emblem'],
    logoGeometryGuidance:
      'High optical contrast, delicate hairline terminals, interlocking ligatures, generous kerning, and sculptural minimalism. Avoid bulky industrial blocks.',
    colorPhilosophy: {
      hueFamily: 'Monochrome, Champagne Gold, Deep Burgundy, Warm Cream, Obsidian',
      paletteRationale: 'Restrained, understated opulence where white space does 80% of the emotional heavy lifting.',
      suggestedSeedHues: ['#121212', '#FDFBF7', '#C5A880', '#5B1924', '#2C2B29'],
      surfaceTreatment: 'Heavy cotton rag, hot-stamped gold foil, pebbled calfskin, brushed brass',
    },
    typographyRules: {
      headingStyle: 'High-contrast editorial serif or ultra-spaced geometric display',
      bodyStyle: 'Refined, discreet neutral sans with generous leading',
      recommendedPairings: [
        { heading: 'Playfair Display', body: 'Inter', rationale: 'Haute editorial prestige grounded by immaculate readability.' },
        { heading: 'Fraunces', body: 'Plus Jakarta Sans', rationale: 'Tactile craftsmanship meeting modern Parisian sophistication.' },
      ],
    },
    personalityDefaults: [
      { trait: 'Exclusivity', rating: 5, minLabel: 'Accessible', maxLabel: 'Haute Couture' },
      { trait: 'Elegance', rating: 5, minLabel: 'Raw', maxLabel: 'Refined' },
      { trait: 'Tradition', rating: 4, minLabel: 'Fleeting', maxLabel: 'Timeless' },
      { trait: 'Volume', rating: 1, minLabel: 'Whisper Luxury', maxLabel: 'Loud' },
    ],
    photographyDirection: {
      lens: 'Sony 85mm f/1.4 GM at f/2.0 for buttery separation, tactile fabric weave, and luminous skin tones',
      lighting: 'Diffused Parisian window daylight paired with subtle negative fill on cheekbones',
      materials: 'Raw silk, hand-stitched leather, embossed cotton paper, antique bronze',
      composition: 'Generous negative space, asymmetric editorial framing, macro fabric details',
      colorGrade: 'Warm filmic curve with rolled-off highlights and gentle velvet blacks',
    },
    recommendedMockups: ['luxury_garment_tag', 'embossed_shopping_bag', 'editorial_lookbook', 'storefront_brass_plaque'],
    iconConcepts: ['Crown', 'Sparkles', 'Feather', 'Eye', 'Gem', 'CircleDot'],
  },

  software_tech: {
    name: 'Software, Cloud, SaaS & Developer Platforms',
    categoryKeywords: ['software', 'saas', 'tech', 'cloud', 'ai', 'developer', 'data', 'api', 'platform', 'cyber', 'code'],
    logoArchetypes: ['geometric_minimalist', 'negative_space', 'modern_wordmark'],
    logoGeometryGuidance:
      'Algorithmic precision, mathematical modularity, continuous isometric vectors, multi-state components, clean line weight consistency.',
    colorPhilosophy: {
      hueFamily: 'Deep Indigo, Carbon Dark, Electric Cyan or Acid Emerald, Phosphor Violet',
      paletteRationale: 'Evokes dark mode terminal ergonomics, luminous data visualization, and computational velocity.',
      suggestedSeedHues: ['#0F172A', '#3B82F6', '#10B981', '#6366F1', '#F8FAFC'],
      surfaceTreatment: 'Precision anodized aluminum, OLED glass, anti-reflective matte coatings',
    },
    typographyRules: {
      headingStyle: 'Tight tracking, clean geometric grotesque with high x-height',
      bodyStyle: 'Modern neo-grotesque optimized for screens and monospace accents',
      recommendedPairings: [
        { heading: 'Plus Jakarta Sans', body: 'Inter', rationale: 'The industry-standard tech stack for developer clarity and product poise.' },
        { heading: 'Space Grotesk', body: 'Inter', rationale: 'Subtle technical futurism paired with uncompromised UI readability.' },
      ],
    },
    personalityDefaults: [
      { trait: 'Speed', rating: 5, minLabel: 'Methodical', maxLabel: 'Instantaneous' },
      { trait: 'Intelligence', rating: 5, minLabel: 'Intuitive', maxLabel: 'Algorithmic' },
      { trait: 'Tone', rating: 3, minLabel: 'Casual', maxLabel: 'Technical' },
      { trait: 'Vibe', rating: 4, minLabel: 'Corporate', maxLabel: 'Cutting-Edge' },
    ],
    photographyDirection: {
      lens: 'Sony 35mm f/1.4 GM for natural perspective context showing developer setups and real engineering workflows',
      lighting: 'Cool ambient monitor glow balanced with soft key lighting and subtle rim highlights',
      materials: 'Matte black anodized aluminum, glass optics, mechanical switchboards, architectural glass',
      composition: 'Clean isometric workspaces, focus on hands interacting with code or physical hardware',
      colorGrade: 'Clean neutral balance with punchy OLED cyans and deep true blacks',
    },
    recommendedMockups: ['responsive_dashboard_mockup', 'developer_terminal_app_icon', 'company_security_id_card', 'metal_keycard_badge'],
    iconConcepts: ['Code2', 'Cpu', 'Terminal', 'Layers', 'Workflow', 'Zap'],
  },

  healthcare_wellness: {
    name: 'Healthcare, MedTech, Biotech & Life Sciences',
    categoryKeywords: ['health', 'medical', 'medtech', 'biotech', 'clinic', 'wellness', 'pharma', 'care', 'doctor', 'therapy'],
    logoArchetypes: ['geometric_minimalist', 'abstract_emblem', 'negative_space'],
    logoGeometryGuidance:
      'Continuous protective curves, molecular symmetry, dynamic balance, cellular or organic resonance. Avoid sharp threatening spikes.',
    colorPhilosophy: {
      hueFamily: 'Clinical Aquamarine, Calming Sage, Deep Oceanic Blue, Pure Sterile White',
      paletteRationale: 'Promotes psychological reassurance, clinical credibility, biological harmony, and sterile trust.',
      suggestedSeedHues: ['#0D9488', '#0284C7', '#10B981', '#134E4A', '#F0FDFA'],
      surfaceTreatment: 'Frosted medical glass, clean antimicrobial matte polymers, clean white ceramic',
    },
    typographyRules: {
      headingStyle: 'Humanist sans-serif with open apertures and comforting balance',
      bodyStyle: 'Highly legible clinical sans with generous letter-spacing',
      recommendedPairings: [
        { heading: 'Plus Jakarta Sans', body: 'Inter', rationale: 'Friendly humanist geometry with clinical precision.' },
        { heading: 'Outfit', body: 'Inter', rationale: 'Approachable modern clarity reducing patient cognitive load.' },
      ],
    },
    personalityDefaults: [
      { trait: 'Trust', rating: 5, minLabel: 'Exploratory', maxLabel: 'Clinical Gold Standard' },
      { trait: 'Empathy', rating: 5, minLabel: 'Detached', maxLabel: 'Compassionate' },
      { trait: 'Precision', rating: 5, minLabel: 'Approximated', maxLabel: 'Molecular' },
      { trait: 'Mood', rating: 4, minLabel: 'Sterile', maxLabel: 'Uplifting' },
    ],
    photographyDirection: {
      lens: 'Sony 50mm f/1.2 GM for gentle, natural human perspective with compassionate emotional depth',
      lighting: 'Soft overhead diffused daylight mimicking modern clinical atriums, clean wrap-around shadows',
      materials: 'Frosted medical acrylic, surgical stainless steel, pure cotton scrubs, biological glass',
      composition: 'Human-centered doctor-patient gestures, clean lab macro imagery, luminous transparency',
      colorGrade: 'High key, airy clinical whites with clean pastel cyan/sage undertones',
    },
    recommendedMockups: ['medical_packaging_box', 'clinic_staff_id_badge', 'telehealth_mobile_interface', 'glass_pharmacy_bottle'],
    iconConcepts: ['Heart', 'Shield', 'Activity', 'Sparkles', 'Stethoscope', 'Thermometer'],
  },

  finance_fintech: {
    name: 'Finance, Wealth Management & Fintech',
    categoryKeywords: ['finance', 'fintech', 'bank', 'invest', 'wealth', 'crypto', 'capital', 'fund', 'advisory', 'accounting'],
    logoArchetypes: ['architectural_badge', 'negative_space', 'geometric_minimalist'],
    logoGeometryGuidance:
      'Stable hexagonal or vault geometry, interlocking pillars, balance scales, bilateral symmetry, unwavering horizontal anchor lines.',
    colorPhilosophy: {
      hueFamily: 'Deep Vault Navy, Sovereign Forest Green, Fine Bronze / Champagne Gold, Pure Alabaster',
      paletteRationale: 'Instills institutional security, fiduciary responsibility, steady compound growth, and discretion.',
      suggestedSeedHues: ['#0F2942', '#064E3B', '#D97706', '#1E3A8A', '#F8FAFC'],
      surfaceTreatment: 'Heavy bank-note guilloche, brushed metal cards, security watermark parchment',
    },
    typographyRules: {
      headingStyle: 'Authoritative neo-grotesque or classic transitional serif',
      bodyStyle: 'High-density tabular sans-serif for numbers and fiscal charts',
      recommendedPairings: [
        { heading: 'Plus Jakarta Sans', body: 'Inter', rationale: 'Modern fintech agility supported by institutional firmness.' },
        { heading: 'Playfair Display', body: 'Inter', rationale: 'Private banking heritage married to modern fiscal software.' },
      ],
    },
    personalityDefaults: [
      { trait: 'Security', rating: 5, minLabel: 'Loose', maxLabel: 'Fortress Grade' },
      { trait: 'Discretion', rating: 5, minLabel: 'Flamboyant', maxLabel: 'Understated' },
      { trait: 'Growth', rating: 4, minLabel: 'Stagnant', maxLabel: 'Visionary' },
      { trait: 'Trust', rating: 5, minLabel: 'Speculative', maxLabel: 'Fiduciary' },
    ],
    photographyDirection: {
      lens: 'Sony 24-70mm f/2.8 GM II at 50mm f/4 for clean corporate environmental portraits and architecture',
      lighting: 'Sculpted executive board-room illumination with deep contrast and discreet architectural highlights',
      materials: 'Heavy metal credit card stock, dark walnut, brushed stainless steel, safety glass',
      composition: 'Clean vertical lines, formal symmetry, confident executive posture in modern glass headquarters',
      colorGrade: 'Deep oceanic blue shadows, warm skin tones, rich dark tones with zero noise',
    },
    recommendedMockups: ['metal_credit_card', 'executive_id_badge', 'financial_terminal_app', 'embossed_annual_report'],
    iconConcepts: ['Shield', 'TrendingUp', 'Vault', 'Lock', 'Coins', 'DollarSign'],
  },

  hospitality_food: {
    name: 'Hospitality, Specialty Food & Beverage',
    categoryKeywords: ['food', 'restaurant', 'coffee', 'cafe', 'hospitality', 'bakery', 'brewery', 'dining', 'culinary', 'bar'],
    logoArchetypes: ['interlocking_monogram', 'modern_wordmark', 'architectural_badge'],
    logoGeometryGuidance:
      'Warm artisanal craft emblems, seal stamps, organic flourishes, woodcut line weights, stamp-friendly silhouettes.',
    colorPhilosophy: {
      hueFamily: 'Roasted Espresso, Warm Terracotta, Olive Sage, Honey Amber, Parchment Cream',
      paletteRationale: 'Triggers appetite, sensory aroma, tactile craft, and community warmth.',
      suggestedSeedHues: ['#3E2723', '#C2410C', '#65A30D', '#D97706', '#FFFBEB'],
      surfaceTreatment: 'Unbleached kraft paper, letterpress deboss, ceramic stoneware, warm reclaimed oak',
    },
    typographyRules: {
      headingStyle: 'Characterful organic serif or hand-tooled display with warmth',
      bodyStyle: 'Approachable warm grotesque with legible menu sizing',
      recommendedPairings: [
        { heading: 'Fraunces', body: 'Plus Jakarta Sans', rationale: 'Sensory artisanal warmth paired with crisp modern menu legibility.' },
        { heading: 'Playfair Display', body: 'Inter', rationale: 'Fine-dining Michelin authority with clean modern service.' },
      ],
    },
    personalityDefaults: [
      { trait: 'Warmth', rating: 5, minLabel: 'Cold / Distant', maxLabel: 'Hearty & Welcoming' },
      { trait: 'Craft', rating: 5, minLabel: 'Mass Industrial', maxLabel: 'Artisanal Obsession' },
      { trait: 'Sensory', rating: 5, minLabel: 'Abstract', maxLabel: 'Visceral & Fragrant' },
      { trait: 'Pace', rating: 3, minLabel: 'Fast Food', maxLabel: 'Slow Food / Lingering' },
    ],
    photographyDirection: {
      lens: 'Sony 90mm f/2.8 Macro G OSS for mouth-watering micro-textures of steam, crema, sauces, and ingredients',
      lighting: 'Warm side-raking window light, soft rim glow illuminating culinary steam or cocktail mist',
      materials: 'Stoneware ceramics, linen napkins, charred wood, unbleached kraft paper',
      composition: 'Close-up tactile framing, dynamic pour/drizzle action frozen at 1/1000s',
      colorGrade: 'Rich saturated food tones, warm ember highlights, appetizing golden hues',
    },
    recommendedMockups: ['specialty_coffee_cup', 'kraft_takeaway_bag', 'restaurant_table_menu', 'apron_embroidered_patch'],
    iconConcepts: ['Utensils', 'Coffee', 'Flame', 'Sparkles', 'Heart', 'Award'],
  },
};

/**
 * Resolves the closest industry creative direction profile given user input strings.
 */
export function resolveIndustryDirection(industryInput?: string, missionInput?: string): IndustryCreativeDirection {
  const combined = `${industryInput || ''} ${missionInput || ''}`.toLowerCase();
  
  for (const [key, profile] of Object.entries(INDUSTRY_INTELLIGENCE)) {
    for (const kw of profile.categoryKeywords) {
      if (combined.includes(kw)) {
        return profile;
      }
    }
  }

  // Fallback to software/tech if no specific industry matches
  return INDUSTRY_INTELLIGENCE.software_tech;
}
