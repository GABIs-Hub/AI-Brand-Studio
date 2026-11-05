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
  logoSymbol: 'structure' | 'monogram' | 'network' | 'care' | 'vault' | 'botanical' | 'book' | 'home' | 'beauty' | 'planet' | 'compass' | 'media' | 'orbit';
  logoGeometryGuidance: string;
  brandPromise: string;
  taglineOptions: string[];
  brandValues: Array<{ title: string; description: string }>;
  voice: {
    style: string;
    doExample: string;
    dontExample: string;
  };
  colorPhilosophy: {
    hueFamily: string;
    paletteRationale: string;
    suggestedSeedHues: string[];
    surfaceTreatment: string;
    harmony: 'analogous' | 'complementary' | 'triadic' | 'split-complementary' | 'monochromatic';
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
    logoSymbol: 'structure',
    logoGeometryGuidance:
      'Tectonic, load-bearing geometry with structural triangulation, orthogonal trusses, monolithic forms, and weight-balanced negative space. Avoid soft organic blobs or playful curls.',
    brandPromise: 'engineering confidence into the places and systems people depend on',
    taglineOptions: ['Built to stand. Designed to advance.', 'Confidence at every connection.', 'Strength with purpose.'],
    brandValues: [
      { title: 'Structural Integrity', description: 'Treat safety, precision, and long-term performance as non-negotiable design requirements.' },
      { title: 'Accountable Delivery', description: 'Make complex projects legible, decisions traceable, and commitments dependable.' },
      { title: 'Built for Generations', description: 'Favor durable solutions that serve communities well beyond the handover date.' },
      { title: 'Practical Innovation', description: 'Use new methods where they measurably improve resilience, efficiency, or safety.' },
    ],
    voice: {
      style: 'measured, precise, and assured; explain technical choices in plain language',
      doExample: 'Designed around real site conditions, clear tolerances, and dependable maintenance.',
      dontExample: 'A revolutionary, world-changing solution that is simply the best.',
    },
    colorPhilosophy: {
      hueFamily: 'Steel, Slate, High-Visibility Safety Accent, Earth Ochre',
      paletteRationale: 'Grounds the brand in enduring industrial authority, structural steel, and high-visibility field safety.',
      suggestedSeedHues: ['#1E293B', '#334155', '#D97706', '#0284C7', '#475569'],
      surfaceTreatment: 'Matte, textured, powder-coated, reinforced concrete, architectural glass',
      harmony: 'split-complementary',
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
    logoSymbol: 'monogram',
    logoGeometryGuidance:
      'High optical contrast, delicate hairline terminals, interlocking ligatures, generous kerning, and sculptural minimalism. Avoid bulky industrial blocks.',
    brandPromise: 'making considered craft and lasting form feel unmistakable',
    taglineOptions: ['A study in lasting form.', 'Made to be remembered.', 'Considered in every detail.'],
    brandValues: [
      { title: 'Considered Craft', description: 'Give materials, construction, and finishing the same attention as the finished silhouette.' },
      { title: 'Quiet Distinction', description: 'Create recognition through proportion and detail rather than volume or excess.' },
      { title: 'Enduring Design', description: 'Choose forms and materials with a life beyond a single season or trend.' },
      { title: 'Provenance with Purpose', description: 'Make the origin and making of each piece part of its value.' },
    ],
    voice: {
      style: 'considered, sensory, and editorial; let precise details convey quality',
      doExample: 'Cut in small runs, finished by hand, and designed to be worn for years.',
      dontExample: 'The ultimate luxury must-have that everyone is talking about.',
    },
    colorPhilosophy: {
      hueFamily: 'Monochrome, Champagne Gold, Deep Burgundy, Warm Cream, Obsidian',
      paletteRationale: 'Restrained, understated opulence where white space does 80% of the emotional heavy lifting.',
      suggestedSeedHues: ['#121212', '#FDFBF7', '#C5A880', '#5B1924', '#2C2B29'],
      surfaceTreatment: 'Heavy cotton rag, hot-stamped gold foil, pebbled calfskin, brushed brass',
      harmony: 'monochromatic',
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
    categoryKeywords: ['software', 'saas', 'technology', 'tech', 'cloud', 'ai', 'artificial intelligence', 'developer', 'data', 'api', 'platform', 'cyber', 'code'],
    logoArchetypes: ['geometric_minimalist', 'negative_space', 'modern_wordmark'],
    logoSymbol: 'network',
    logoGeometryGuidance:
      'Algorithmic precision, mathematical modularity, continuous isometric vectors, multi-state components, clean line weight consistency.',
    brandPromise: 'turning complexity into clear, capable tools people can rely on',
    taglineOptions: ['Complexity, made capable.', 'Tools that move work forward.', 'Clarity for what comes next.'],
    brandValues: [
      { title: 'Useful Intelligence', description: 'Apply technology to a clear user need rather than adding complexity for its own sake.' },
      { title: 'Dependable by Design', description: 'Make performance, privacy, and predictable behavior part of the product experience.' },
      { title: 'Open Progress', description: 'Improve continuously through clear systems, honest feedback, and thoughtful iteration.' },
      { title: 'Human-Scale Tools', description: 'Give people more control and capability without making them work around the software.' },
    ],
    voice: {
      style: 'clear, curious, and technically credible; explain the benefit before the mechanism',
      doExample: 'Ship a reliable workflow in minutes, then adapt it as your team grows.',
      dontExample: 'A disruptive, next-generation platform that revolutionizes everything.',
    },
    colorPhilosophy: {
      hueFamily: 'Deep Indigo, Carbon Dark, Electric Cyan or Acid Emerald, Phosphor Violet',
      paletteRationale: 'Evokes dark mode terminal ergonomics, luminous data visualization, and computational velocity.',
      suggestedSeedHues: ['#0F172A', '#3B82F6', '#10B981', '#6366F1', '#F8FAFC'],
      surfaceTreatment: 'Precision anodized aluminum, OLED glass, anti-reflective matte coatings',
      harmony: 'triadic',
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
    categoryKeywords: ['health', 'healthcare', 'medical', 'medtech', 'biotech', 'clinic', 'wellness', 'pharma', 'care', 'doctor', 'therapy', 'life sciences'],
    logoArchetypes: ['geometric_minimalist', 'abstract_emblem', 'negative_space'],
    logoSymbol: 'care',
    logoGeometryGuidance:
      'Continuous protective curves, molecular symmetry, dynamic balance, cellular or organic resonance. Avoid sharp threatening spikes.',
    brandPromise: 'bringing trusted expertise and human care closer together',
    taglineOptions: ['Care shaped around people.', 'Science with a human touch.', 'Better care, thoughtfully delivered.'],
    brandValues: [
      { title: 'People Before Process', description: 'Make each interaction clearer, more respectful, and easier to navigate for the person receiving care.' },
      { title: 'Evidence with Empathy', description: 'Pair scientific rigor with communication that recognizes individual needs and uncertainty.' },
      { title: 'Safety in Every Detail', description: 'Treat accuracy, privacy, and consistent standards as essential parts of care.' },
      { title: 'Progress that Matters', description: 'Measure innovation by its meaningful impact on health, access, and quality of life.' },
    ],
    voice: {
      style: 'reassuring, respectful, and evidence-aware; avoid guarantees and unexplained jargon',
      doExample: 'Understand your options with clear guidance from a care team that listens.',
      dontExample: 'Our breakthrough guarantees the best possible result for every patient.',
    },
    colorPhilosophy: {
      hueFamily: 'Clinical Aquamarine, Calming Sage, Deep Oceanic Blue, Pure Sterile White',
      paletteRationale: 'Promotes psychological reassurance, clinical credibility, biological harmony, and sterile trust.',
      suggestedSeedHues: ['#0D9488', '#0284C7', '#10B981', '#134E4A', '#F0FDFA'],
      surfaceTreatment: 'Frosted medical glass, clean antimicrobial matte polymers, clean white ceramic',
      harmony: 'analogous',
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
    logoSymbol: 'vault',
    logoGeometryGuidance:
      'Stable hexagonal or vault geometry, interlocking pillars, balance scales, bilateral symmetry, unwavering horizontal anchor lines.',
    brandPromise: 'making financial decisions clearer, steadier, and more accountable',
    taglineOptions: ['Clarity for the long view.', 'Confidence built on stewardship.', 'Progress, held to account.'],
    brandValues: [
      { title: 'Trust through Clarity', description: 'Explain costs, trade-offs, and decisions so people can act with informed confidence.' },
      { title: 'Stewardship', description: 'Protect the responsibility entrusted to the brand with care, consistency, and accountability.' },
      { title: 'Long-Term Thinking', description: 'Favor durable financial health over short-term excitement or unsupported promises.' },
      { title: 'Responsible Progress', description: 'Use new tools and ideas without compromising transparency, security, or sound judgment.' },
    ],
    voice: {
      style: 'calm, transparent, and measured; distinguish facts, estimates, and risk clearly',
      doExample: 'See the fees, assumptions, and risks before you decide what works for you.',
      dontExample: 'Get rich fast with guaranteed returns and zero risk.',
    },
    colorPhilosophy: {
      hueFamily: 'Deep Vault Navy, Sovereign Forest Green, Fine Bronze / Champagne Gold, Pure Alabaster',
      paletteRationale: 'Instills institutional security, fiduciary responsibility, steady compound growth, and discretion.',
      suggestedSeedHues: ['#0F2942', '#064E3B', '#D97706', '#1E3A8A', '#F8FAFC'],
      surfaceTreatment: 'Heavy bank-note guilloche, brushed metal cards, security watermark parchment',
      harmony: 'monochromatic',
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
    logoSymbol: 'botanical',
    logoGeometryGuidance:
      'Warm artisanal craft emblems, seal stamps, organic flourishes, woodcut line weights, stamp-friendly silhouettes.',
    brandPromise: 'turning thoughtful ingredients and genuine hospitality into moments worth sharing',
    taglineOptions: ['Made with care. Shared with pleasure.', 'A little more worth gathering for.', 'Rooted in craft, served with warmth.'],
    brandValues: [
      { title: 'Ingredient Integrity', description: 'Let sourcing, seasonality, and preparation show in the quality of what reaches the table.' },
      { title: 'Generous Hospitality', description: 'Make every guest feel considered through attentive service and an inviting atmosphere.' },
      { title: 'Craft You Can Taste', description: 'Respect technique and detail while keeping the experience approachable and enjoyable.' },
      { title: 'A Place to Gather', description: 'Create rituals and spaces that bring people together, not just products to consume.' },
    ],
    voice: {
      style: 'warm, sensory, and welcoming; describe real craft without becoming precious',
      doExample: 'Slow-fermented dough, local fruit, and a table ready when you are.',
      dontExample: 'The most amazing food experience ever—your taste buds will explode.',
    },
    colorPhilosophy: {
      hueFamily: 'Roasted Espresso, Warm Terracotta, Olive Sage, Honey Amber, Parchment Cream',
      paletteRationale: 'Triggers appetite, sensory aroma, tactile craft, and community warmth.',
      suggestedSeedHues: ['#3E2723', '#C2410C', '#65A30D', '#D97706', '#FFFBEB'],
      surfaceTreatment: 'Unbleached kraft paper, letterpress deboss, ceramic stoneware, warm reclaimed oak',
      harmony: 'analogous',
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

const technologyProfile = INDUSTRY_INTELLIGENCE.software_tech;

Object.assign(INDUSTRY_INTELLIGENCE, {
  education_learning: {
    ...technologyProfile,
    name: 'Education, Learning & Knowledge Services',
    categoryKeywords: ['education', 'educational', 'school', 'university', 'learning', 'teaching', 'tutor', 'course', 'curriculum', 'literacy', 'training'],
    logoArchetypes: ['modern_wordmark', 'geometric_minimalist', 'negative_space'],
    logoSymbol: 'book',
    logoGeometryGuidance: 'Open, modular forms suggesting discovery, progression, and shared knowledge; stay welcoming and legible at small sizes.',
    brandPromise: 'making meaningful learning clearer, more accessible, and easier to sustain',
    taglineOptions: ['Make room to grow.', 'Learning that moves with you.', 'Knowledge, put into practice.'],
    brandValues: [
      { title: 'Curiosity for Life', description: 'Make questions, exploration, and continued growth part of the learning experience.' },
      { title: 'Access by Design', description: 'Reduce barriers so more learners can participate and progress with confidence.' },
      { title: 'Progress You Can See', description: 'Turn learning goals into clear steps, useful feedback, and measurable milestones.' },
      { title: 'Knowledge in Practice', description: 'Connect ideas to skills learners can use in study, work, and everyday life.' },
    ],
    voice: { style: 'encouraging, clear, and curious; explain without talking down to the learner', doExample: 'Start with one useful skill and build on it at your own pace.', dontExample: 'Unlock your full potential instantly with our revolutionary method.' },
    colorPhilosophy: { ...technologyProfile.colorPhilosophy, hueFamily: 'Open sky blue, confident indigo, optimistic warm accents, paper white', paletteRationale: 'Balances trust and focus with the optimism and approachability needed for learning.', suggestedSeedHues: ['#2563EB', '#4F46E5', '#F59E0B', '#0F766E', '#F8FAFC'], harmony: 'analogous' },
    typographyRules: { ...technologyProfile.typographyRules, headingStyle: 'Open, humanist sans-serif with a confident but welcoming hierarchy', bodyStyle: 'Highly legible, calm sans-serif built for sustained reading', recommendedPairings: [{ heading: 'Plus Jakarta Sans', body: 'Inter', rationale: 'Approachable display character with dependable reading clarity.' }, { heading: 'Outfit', body: 'Inter', rationale: 'Clear geometric headings paired with comfortable long-form text.' }] },
    personalityDefaults: [{ trait: 'Curiosity', rating: 5, minLabel: 'Passive', maxLabel: 'Exploratory' }, { trait: 'Clarity', rating: 5, minLabel: 'Overwhelming', maxLabel: 'Understandable' }, { trait: 'Encouragement', rating: 5, minLabel: 'Judgmental', maxLabel: 'Supportive' }, { trait: 'Progress', rating: 4, minLabel: 'Static', maxLabel: 'Empowering' }],
    photographyDirection: { lens: 'Sony 35mm f/1.8 for natural classroom context and collaborative learning moments', lighting: 'Soft daylight with even, low-glare illumination for an open and focused atmosphere', materials: 'Recycled paper, natural wood, notebooks, tactile learning tools, clean digital screens', composition: 'Show active participation, learner perspective, and visible examples of work', colorGrade: 'Clear daylight neutrals with confident blue and warm, optimistic accents' },
    recommendedMockups: ['course_workbook', 'learning_platform_dashboard', 'campus_wayfinding', 'certificate_and_stationery'],
    iconConcepts: ['BookOpen', 'Lightbulb', 'Compass', 'Layers', 'GraduationCap', 'Sparkles'],
  },
  beauty_personal_care: {
    ...technologyProfile,
    name: 'Beauty, Skincare & Personal Care',
    categoryKeywords: ['beauty', 'skincare', 'skin care', 'cosmetic', 'cosmetics', 'makeup', 'salon', 'fragrance', 'personal care', 'haircare', 'spa'],
    logoArchetypes: ['interlocking_monogram', 'modern_wordmark', 'abstract_emblem'],
    logoSymbol: 'beauty',
    logoGeometryGuidance: 'Tactile, balanced forms with refined curves and intentional negative space; make the mark feel distinctive on small labels and premium packaging.',
    brandPromise: 'making everyday care feel considered, personal, and worth returning to',
    taglineOptions: ['Care, made personal.', 'A ritual of your own.', 'Thoughtful by nature.'],
    brandValues: [
      { title: 'Care with Intention', description: 'Make formulation, use, and everyday ritual feel thoughtful rather than complicated.' },
      { title: 'Honest Ingredients', description: 'Communicate what is in each product and what it is designed to do with clarity.' },
      { title: 'Confidence without Pressure', description: 'Celebrate individual needs without prescribing a single standard of beauty.' },
      { title: 'Sensory Craft', description: 'Give texture, scent, packaging, and use the same considered attention as the formula.' },
    ],
    voice: { style: 'sensory, reassuring, and inclusive; describe benefits without exploiting insecurity', doExample: 'A gentle daily formula that leaves skin feeling comfortable and cared for.', dontExample: 'Fix every flaw and get flawless skin overnight.' },
    colorPhilosophy: { ...technologyProfile.colorPhilosophy, hueFamily: 'Warm porcelain, botanical sage, soft rose, mineral earth, quiet ink', paletteRationale: 'Creates a calm, tactile impression while leaving room for distinct product families.', suggestedSeedHues: ['#B76E79', '#9A6B53', '#75866A', '#D6A3A8', '#F8F3EF'], harmony: 'analogous' },
    typographyRules: { ...technologyProfile.typographyRules, headingStyle: 'Refined editorial serif or soft humanist display with clear product hierarchy', bodyStyle: 'Warm, highly legible sans-serif for ingredient and usage details', recommendedPairings: [{ heading: 'Fraunces', body: 'Inter', rationale: 'Distinctive editorial warmth paired with clear practical labeling.' }, { heading: 'Playfair Display', body: 'Plus Jakarta Sans', rationale: 'A polished beauty counterpoint with accessible digital readability.' }] },
    personalityDefaults: [{ trait: 'Care', rating: 5, minLabel: 'Transactional', maxLabel: 'Considerate' }, { trait: 'Honesty', rating: 5, minLabel: 'Opaque', maxLabel: 'Transparent' }, { trait: 'Sensory', rating: 4, minLabel: 'Clinical', maxLabel: 'Tactile' }, { trait: 'Inclusivity', rating: 5, minLabel: 'Prescriptive', maxLabel: 'Personal' }],
    photographyDirection: { lens: 'Sony 90mm macro for formula texture, packaging details, and natural skin detail', lighting: 'Soft diffused daylight with gentle highlights and no artificial skin smoothing', materials: 'Frosted glass, ceramic, botanical textures, uncoated paper, brushed aluminum', composition: 'Close tactile product studies balanced with diverse, natural human portraits', colorGrade: 'Soft warm neutrals with restrained botanical or rose accents and true-to-life skin tones' },
    recommendedMockups: ['skincare_glass_bottle', 'cosmetic_carton', 'salon_product_shelf', 'beauty_campaign_editorial'],
    iconConcepts: ['Droplets', 'Flower2', 'Sparkles', 'Sun', 'HandHeart', 'Circle'],
  },
  real_estate_property: {
    ...technologyProfile,
    name: 'Real Estate, Property & Architecture',
    categoryKeywords: ['real estate', 'realty', 'property', 'properties', 'residential', 'commercial property', 'brokerage', 'realtor', 'housing', 'interior design'],
    logoArchetypes: ['architectural_badge', 'modern_wordmark', 'geometric_minimalist'],
    logoSymbol: 'home',
    logoGeometryGuidance: 'Use measured architectural proportions, floor-plan logic, and stable silhouettes; avoid generic roofline clip-art and overdecorated crests.',
    brandPromise: 'helping people make confident decisions about the places they live, work, and invest',
    taglineOptions: ['A better place to begin.', 'Space for what comes next.', 'Good places. Clear decisions.'],
    brandValues: [
      { title: 'Local Understanding', description: 'Ground recommendations in the character, needs, and realities of each place.' },
      { title: 'Clear Guidance', description: 'Make the process, trade-offs, and next steps easier to understand for every client.' },
      { title: 'Care for the Long Term', description: 'Consider how a property serves its people and community beyond the transaction.' },
      { title: 'Trust at Every Step', description: 'Communicate consistently and handle important decisions with accountability.' },
    ],
    voice: { style: 'grounded, locally informed, and clear; describe real features rather than promising outcomes', doExample: 'A sunlit two-bedroom near the station, with the floor plan and service costs clearly laid out.', dontExample: 'Your dream home and a guaranteed investment opportunity await.' },
    colorPhilosophy: { ...technologyProfile.colorPhilosophy, hueFamily: 'Architectural stone, deep navy, warm limestone, muted olive, restrained brass', paletteRationale: 'Combines dependable expertise with material warmth and a sense of place.', suggestedSeedHues: ['#44515C', '#8A735B', '#6B755B', '#B28C5B', '#F5F2EA'], harmony: 'monochromatic' },
    typographyRules: { ...technologyProfile.typographyRules, headingStyle: 'Confident architectural sans or editorial serif with balanced proportions', bodyStyle: 'Clear, neutral sans-serif for listings, contracts, and practical details', recommendedPairings: [{ heading: 'Plus Jakarta Sans', body: 'Inter', rationale: 'Contemporary confidence with clear legibility across listings and documents.' }, { heading: 'Playfair Display', body: 'Inter', rationale: 'Editorial property storytelling balanced by practical information design.' }] },
    personalityDefaults: [{ trait: 'Trust', rating: 5, minLabel: 'Uncertain', maxLabel: 'Dependable' }, { trait: 'Local Knowledge', rating: 5, minLabel: 'Generic', maxLabel: 'Place-Specific' }, { trait: 'Clarity', rating: 5, minLabel: 'Opaque', maxLabel: 'Straightforward' }, { trait: 'Welcome', rating: 4, minLabel: 'Exclusive', maxLabel: 'Inviting' }],
    photographyDirection: { lens: 'Sony 16-35mm at a corrected architectural perspective for honest room proportions', lighting: 'Natural window light with balanced exposure and no misleading artificial glow', materials: 'Limestone, oak, brick, steel, glass, and neighborhood details', composition: 'Show room flow and relationship to place; keep verticals straight and scale credible', colorGrade: 'Neutral daylight with natural material warmth and accurate interior color' },
    recommendedMockups: ['property_signage', 'residential_listing_brochure', 'building_wayfinding', 'realty_mobile_listing'],
    iconConcepts: ['House', 'MapPin', 'Building2', 'Compass', 'KeyRound', 'Ruler'],
  },
  sustainability_climate: {
    ...technologyProfile,
    name: 'Sustainability, Climate & Environmental Services',
    categoryKeywords: ['sustainability', 'sustainable', 'climate', 'environment', 'environmental', 'renewable', 'clean energy', 'circular economy', 'conservation', 'recycling', 'ecological'],
    logoArchetypes: ['abstract_emblem', 'negative_space', 'geometric_minimalist'],
    logoSymbol: 'planet',
    logoGeometryGuidance: 'Prefer regenerative cycles, connected systems, and evidence-led natural forms; avoid default leaf clichés unless the leaf is integral to the brand idea.',
    brandPromise: 'turning environmental responsibility into practical, measurable progress',
    taglineOptions: ['Progress with the planet in mind.', 'Better systems, lighter footprint.', 'Make change take root.'],
    brandValues: [
      { title: 'Evidence over Greenwash', description: 'Substantiate environmental claims and make scope, trade-offs, and progress visible.' },
      { title: 'Systems Thinking', description: 'Consider lifecycle, supply chains, and community effects rather than a single isolated metric.' },
      { title: 'Practical Transition', description: 'Make lower-impact choices actionable, accessible, and realistic to adopt.' },
      { title: 'Shared Accountability', description: 'Treat progress as an ongoing responsibility across partners, teams, and customers.' },
    ],
    voice: { style: 'optimistic, specific, and evidence-led; state the scope behind environmental claims', doExample: 'Our reusable shipping system reduced single-use packaging by 38% across these orders.', dontExample: '100% planet-positive and completely guilt-free in every way.' },
    colorPhilosophy: { ...technologyProfile.colorPhilosophy, hueFamily: 'Forest canopy, mineral soil, clear water, sunlit straw, recycled paper', paletteRationale: 'Signals ecological systems and measured action without relying on a single green cue.', suggestedSeedHues: ['#356859', '#557C55', '#486B72', '#9A7B4F', '#F3F1E8'], harmony: 'analogous' },
    typographyRules: { ...technologyProfile.typographyRules, headingStyle: 'Humanist, grounded typography with confident editorial hierarchy', bodyStyle: 'Accessible, plain-language sans-serif for claims and impact data', recommendedPairings: [{ heading: 'Fraunces', body: 'Inter', rationale: 'Natural editorial warmth with clear evidence presentation.' }, { heading: 'Plus Jakarta Sans', body: 'Inter', rationale: 'Modern, transparent communication with strong data readability.' }] },
    personalityDefaults: [{ trait: 'Integrity', rating: 5, minLabel: 'Unsubstantiated', maxLabel: 'Evidence-Led' }, { trait: 'Optimism', rating: 4, minLabel: 'Fatalistic', maxLabel: 'Constructive' }, { trait: 'Responsibility', rating: 5, minLabel: 'Short-Term', maxLabel: 'Lifecycle-Minded' }, { trait: 'Action', rating: 5, minLabel: 'Aspirational', maxLabel: 'Measurable' }],
    photographyDirection: { lens: 'Sony 35mm for environmental context and 90mm macro for material lifecycle details', lighting: 'Honest natural light with realistic atmosphere and no artificial green tint', materials: 'Reclaimed timber, recycled fibers, durable metals, soil, water, native plants', composition: 'Show working systems, people, and material flows instead of abstract nature-only imagery', colorGrade: 'True-to-life earth and water tones with restrained natural greens' },
    recommendedMockups: ['recycled_packaging_system', 'impact_report', 'clean_energy_dashboard', 'reuse_program_signage'],
    iconConcepts: ['Recycle', 'Globe2', 'Leaf', 'Sun', 'Waves', 'Sprout'],
  },
  travel_experiences: {
    ...technologyProfile,
    name: 'Travel, Tourism & Experiences',
    categoryKeywords: ['travel', 'tourism', 'tourist', 'hotel', 'resort', 'destination', 'adventure', 'hospitality', 'journey', 'tour operator'],
    logoArchetypes: ['abstract_emblem', 'modern_wordmark', 'interlocking_monogram'],
    logoSymbol: 'compass',
    logoGeometryGuidance: 'Build from route, horizon, landmark, or wayfinding geometry; balance discovery with clear recognition on mobile and physical signage.',
    brandPromise: 'making it easier to find experiences that stay with you',
    taglineOptions: ['Find your way somewhere new.', 'Go beyond the itinerary.', 'The journey, thoughtfully found.'],
    brandValues: [
      { title: 'Curiosity with Care', description: 'Encourage discovery while respecting local people, culture, and place.' },
      { title: 'Reliable Details', description: 'Make logistics, expectations, and support clear before and throughout the journey.' },
      { title: 'Meaningful Encounters', description: 'Prioritize experiences that connect travelers with the character of a destination.' },
      { title: 'Room to Explore', description: 'Make space for personal pace and unexpected moments, not just a packed itinerary.' },
    ],
    voice: { style: 'inviting, vivid, and useful; pair inspiration with practical details and cultural respect', doExample: 'Take the coastal path at sunrise, then meet the family running the harbor bakery.', dontExample: 'Escape the crowds and discover an untouched paradise no one else knows.' },
    colorPhilosophy: { ...technologyProfile.colorPhilosophy, hueFamily: 'Sea glass, deep ocean, sun-warmed clay, foliage, open-sky neutrals', paletteRationale: 'Suggests place and movement while staying legible across maps, booking tools, and signage.', suggestedSeedHues: ['#167D8D', '#1D5C63', '#D37A4A', '#577C61', '#F6F1E8'], harmony: 'split-complementary' },
    typographyRules: { ...technologyProfile.typographyRules, headingStyle: 'Distinctive editorial display with open forms and a sense of movement', bodyStyle: 'Friendly, high-legibility sans-serif for schedules, maps, and booking flows', recommendedPairings: [{ heading: 'Fraunces', body: 'Inter', rationale: 'Place-rich editorial personality with reliable travel information clarity.' }, { heading: 'Outfit', body: 'Plus Jakarta Sans', rationale: 'Contemporary movement balanced with approachable digital reading.' }] },
    personalityDefaults: [{ trait: 'Discovery', rating: 5, minLabel: 'Routine', maxLabel: 'Wonder-Filled' }, { trait: 'Reliability', rating: 5, minLabel: 'Uncertain', maxLabel: 'Well-Prepared' }, { trait: 'Respect', rating: 5, minLabel: 'Extractive', maxLabel: 'Locally Minded' }, { trait: 'Ease', rating: 4, minLabel: 'Complicated', maxLabel: 'Effortless' }],
    photographyDirection: { lens: 'Sony 24-70mm for contextual scenes and 85mm for intimate cultural details', lighting: 'Natural location light that preserves the actual atmosphere of the destination', materials: 'Local stone, woven textiles, weathered timber, water, trail surfaces, printed maps', composition: 'Mix establishing views with human-scale moments and clearly recognizable place details', colorGrade: 'Authentic location color with restrained warmth and natural skin tones' },
    recommendedMockups: ['destination_field_guide', 'hotel_keycard', 'tour_booking_mobile', 'wayfinding_map'],
    iconConcepts: ['Compass', 'Map', 'Mountain', 'Sun', 'Luggage', 'Route'],
  },
  media_entertainment: {
    ...technologyProfile,
    name: 'Media, Entertainment & Creative Production',
    categoryKeywords: ['media', 'entertainment', 'film', 'cinema', 'music', 'podcast', 'publishing', 'broadcast', 'production studio', 'streaming', 'performing arts'],
    logoArchetypes: ['abstract_emblem', 'modern_wordmark', 'negative_space'],
    logoSymbol: 'media',
    logoGeometryGuidance: 'Use a memorable silhouette with rhythm, framing, or motion; ensure it survives monochrome reproduction, thumbnails, and animated use.',
    brandPromise: 'bringing distinctive stories and creative work to the people ready to experience them',
    taglineOptions: ['Stories worth staying for.', 'Make a moment resonate.', 'Ideas in their element.'],
    brandValues: [
      { title: 'Original Point of View', description: 'Make creative choices with a recognizable perspective rather than following every trend.' },
      { title: 'Craft Behind the Moment', description: 'Respect the research, collaboration, and production detail that make the final work resonate.' },
      { title: 'Audience Connection', description: 'Create with a clear understanding of who the work is for and how they will encounter it.' },
      { title: 'Room for New Voices', description: 'Make space for different perspectives, formats, and ways of telling a story.' },
    ],
    voice: { style: 'expressive, distinctive, and audience-aware; keep the voice specific to the work', doExample: 'A six-part audio series following the people restoring the city’s historic theaters.', dontExample: 'The biggest, boldest, most epic content experience of all time.' },
    colorPhilosophy: { ...technologyProfile.colorPhilosophy, hueFamily: 'Theatrical ink, vivid signal accents, warm stage light, paper and film neutrals', paletteRationale: 'Creates strong contrast for expressive campaigns, moving images, and small-format discovery.', suggestedSeedHues: ['#5B2C83', '#B23A48', '#D97706', '#1D3557', '#F4F0E8'], harmony: 'complementary' },
    typographyRules: { ...technologyProfile.typographyRules, headingStyle: 'Expressive display typography with a strong, ownable silhouette', bodyStyle: 'Neutral and highly legible text for credits, captions, and program information', recommendedPairings: [{ heading: 'Space Grotesk', body: 'Inter', rationale: 'A contemporary creative voice that stays crisp in small digital formats.' }, { heading: 'Playfair Display', body: 'Plus Jakarta Sans', rationale: 'Editorial storytelling balanced with practical screen readability.' }] },
    personalityDefaults: [{ trait: 'Originality', rating: 5, minLabel: 'Derivative', maxLabel: 'Distinctive' }, { trait: 'Emotion', rating: 4, minLabel: 'Detached', maxLabel: 'Resonant' }, { trait: 'Craft', rating: 5, minLabel: 'Rough', maxLabel: 'Considered' }, { trait: 'Cultural Relevance', rating: 4, minLabel: 'Insular', maxLabel: 'In Conversation' }],
    photographyDirection: { lens: 'Sony 35mm and 85mm primes for both environmental production scenes and expressive portraits', lighting: 'Intentional motivated lighting that supports the mood without obscuring the subject', materials: 'Stage curtains, film grain, print stock, instruments, production equipment, set textures', composition: 'Frame strong subjects and gestures with negative space for titles and campaign crops', colorGrade: 'A deliberate tonal signature while preserving accurate skin and scene detail' },
    recommendedMockups: ['streaming_title_card', 'film_poster', 'podcast_cover_art', 'festival_wayfinding'],
    iconConcepts: ['Clapperboard', 'Play', 'Music2', 'Mic2', 'Aperture', 'Sparkles'],
  },
});

export const DEFAULT_INDUSTRY_DIRECTION: IndustryCreativeDirection = {
  ...technologyProfile,
  name: 'Independent & Cross-Industry Brands',
  categoryKeywords: [],
  logoArchetypes: ['modern_wordmark', 'geometric_minimalist', 'abstract_emblem'],
  logoSymbol: 'orbit',
  logoGeometryGuidance: 'Build a clear, adaptable mark from the brand name and brief; avoid assuming a sector-specific symbol when the niche is unclear.',
  brandPromise: 'making a useful difference for the people it serves',
  taglineOptions: ['Made for what matters.', 'A clearer way forward.', 'Good work, thoughtfully done.'],
  brandValues: [
    { title: 'Useful by Design', description: 'Start with a real need and make the experience straightforward to use.' },
    { title: 'Earned Trust', description: 'Communicate honestly and follow through on the promises the brand makes.' },
    { title: 'Thoughtful Craft', description: 'Give the details care while keeping the result practical and accessible.' },
    { title: 'Progress with Purpose', description: 'Improve with intention and make the benefit clear to the people affected.' },
  ],
  voice: { style: 'clear, considered, and human; avoid claims that the brief does not substantiate', doExample: 'A practical service, built around the needs you shared.', dontExample: 'The world’s leading solution for everything you need.' },
};

/**
 * Resolves the best-supported industry profile, prioritizing the explicit industry
 * over incidental words in the mission and avoiding partial-word matches.
 */
export function resolveIndustryDirection(industryInput?: string, missionInput?: string): IndustryCreativeDirection {
  const scoreField = (input: string, weight: number, profile: IndustryCreativeDirection): number => {
    if (!input.trim()) return 0;
    const normalized = input.toLowerCase();
    return profile.categoryKeywords.reduce((score, keyword) => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matcher = new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'i');
      return matcher.test(normalized) ? score + weight + Math.min(keyword.length, 20) / 10 : score;
    }, 0);
  };

  let bestProfile: IndustryCreativeDirection | undefined;
  let bestScore = 0;
  for (const profile of Object.values(INDUSTRY_INTELLIGENCE)) {
    const score =
      scoreField(industryInput || '', 10, profile) +
      scoreField(missionInput || '', 1, profile);
    if (score > bestScore) {
      bestScore = score;
      bestProfile = profile;
    }
  }
  return bestProfile || DEFAULT_INDUSTRY_DIRECTION;
}
