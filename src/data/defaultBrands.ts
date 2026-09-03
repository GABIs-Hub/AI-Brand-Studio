import { BrandBible } from '../types';

export const DEFAULT_SAVED_BRANDS: BrandBible[] = [
  {
    id: 'brand_gabis_atelier_00',
    brandName: "Gabi's",
    tagline: 'Specialty Single-Origin Micro-Roastery & Slow Provisions',
    industry: 'Artisanal Coffee & Gourmet Provisions',
    mission: 'To elevate daily rituals through obsessively sourced single-origin micro-lot coffees and artisanal culinary provisions, roasted in small batches with uncompromising attention to origin transparency, ethical direct trade, and sensory depth.',
    vision: 'To build a timeless global benchmark for conscious culinary craftsmanship where sustainable farming, zero-waste roasting, and heartfelt hospitality meet.',
    positioningStatement: "For discerning coffee connoisseurs and epicures, Gabi's delivers vintage-modern elegance paired with master-roasted micro-lot beans and small-batch provisions crafted for elevated living.",
    targetAudience: 'Design-conscious coffee purists, creative professionals, culinary explorers, and discerning hosts aged 24–48 seeking thoughtful everyday luxury.',
    createdAt: '2026-08-27T02:00:00.000Z',
    version: '1.0.0',
    personalityTraits: [
      { trait: 'Warmth vs Clinical', rating: 5, minLabel: 'Sterile', maxLabel: 'Warm & Welcoming' },
      { trait: 'Artisanship', rating: 5, minLabel: 'Industrial', maxLabel: 'Obsessive Craft' },
      { trait: 'Elegance', rating: 4, minLabel: 'Rustic', maxLabel: 'Refined Atelier' },
      { trait: 'Authenticity', rating: 5, minLabel: 'Commercial', maxLabel: 'Pure Direct-Trade' }
    ],
    values: [
      { title: 'Direct-Trade Sourcing', description: 'Paying 300% above fair-trade floor price directly to generational coffee farmers.', iconName: 'Compass' },
      { title: 'Artisanal Small-Batch Roasting', description: 'Zero industrial blending; flame-roasted in custom 12kg cast-iron drums to highlight terroir.', iconName: 'Flame' },
      { title: 'Conscious Packaging', description: '100% home-compostable barrier bags and refillable Japanese airtight steel tins.', iconName: 'Feather' }
    ],
    palette: [
      { name: 'Espresso Obsidian', hex: '#1F1A17', rgb: '31, 26, 23', role: 'Neutral Dark', usage: 'Primary typography, premium coffee canister packaging, and hero contrast backgrounds.', contrastNote: 'Passes AAA contrast on parchment.' },
      { name: 'Terracotta Roaster', hex: '#C45D3E', rgb: '196, 93, 62', role: 'Primary', usage: 'Primary brand badges, logotype accent, and signature wax seals.', contrastNote: 'Warm heritage focal accent.' },
      { name: 'Roasted Crema', hex: '#D99B5A', rgb: '217, 155, 90', role: 'Accent', usage: 'Highlight notes, tasting descriptors, and seasonal micro-lot stamps.', contrastNote: 'Rich golden-caramel warmth.' },
      { name: 'Botanical Sage', hex: '#5C6B5E', rgb: '92, 107, 94', role: 'Secondary', usage: 'Origin farm tags, sustainability badges, and secondary packaging labels.', contrastNote: 'Passes AA contrast on light cream.' },
      { name: 'Unbleached Linen', hex: '#F6F3EC', rgb: '246, 243, 236', role: 'Neutral Light', usage: 'Canvas background, burlap label backing, and editorial layout substrate.', contrastNote: 'Soft warm glare-free parchment.' }
    ],
    typography: {
      headingFont: 'Playfair Display',
      headingFontCategory: 'Serif',
      headingWeights: ['600', '700'],
      bodyFont: 'Plus Jakarta Sans',
      bodyFontCategory: 'Sans-Serif',
      bodyWeights: ['400', '500', '600'],
      accentFont: 'Cinzel',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap',
      rationale: "Playfair Display delivers timeless European cafe heritage, while Plus Jakarta Sans brings modern readability to brew guides and flavor tasting notes.",
      cssSnippet: "font-family: 'Playfair Display', serif;\nfont-family: 'Plus Jakarta Sans', sans-serif;"
    },
    logo: {
      primaryLogoSvg: `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" fill="none">
  <g transform="translate(12, 10)">
    <circle cx="30" cy="30" r="26" stroke="#1F1A17" stroke-width="2.5" fill="#F6F3EC"/>
    <path d="M30 14 C24 18 20 25 20 32 C20 40 30 46 30 46 C30 46 40 40 40 32 C40 25 36 18 30 14 Z" fill="#C45D3E"/>
    <path d="M30 20 V40 M30 26 Q36 24 37 30 M30 32 Q24 30 23 36" stroke="#F6F3EC" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="30" cy="18" r="3" fill="#D99B5A"/>
  </g>
  <text x="80" y="44" font-family="'Playfair Display', serif" font-size="24" font-weight="700" letter-spacing="1.5" fill="#1F1A17">GABI’S</text>
  <text x="80" y="60" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="600" letter-spacing="3.5" fill="#C45D3E">ROASTERY &amp; PROVISIONS</text>
</svg>`,
      concept: 'Single-Origin Coffee Seed Embryo in Concentric Heritage Seal with Radial Terroir Coordinates.',
      symbolism: 'The central seed leaf represents direct-from-soil vitality, encased in an artisan roastery roundel.',
      geometryDetails: 'Crafted on a 60px circular baseline with golden ratio internal leaf curvatures.',
      aiImagePrompt: 'Artisan coffee roastery interior with matte black cast iron roaster, linen bags of green coffee beans, and bespoke ceramic cups on warm oak counters, soft morning light'
    },
    secondaryMarks: [
      {
        id: 'mark_gabis_monogram',
        title: "Gabi's Heritage Seal Monogram",
        description: 'Iconic 1:1 circular monogram for bag stamps, wax seals, and espresso cup bases.',
        svg: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" fill="none">
  <rect width="80" height="80" rx="14" fill="#1F1A17"/>
  <circle cx="40" cy="40" r="32" stroke="#D99B5A" stroke-width="2" stroke-dasharray="4 2"/>
  <path d="M40 20 C32 24 26 32 26 42 C26 52 40 60 40 60 C40 60 54 52 54 42 C54 32 48 24 40 20 Z" fill="#C45D3E"/>
  <path d="M40 28 V52 M40 34 Q48 32 50 40 M40 42 Q32 40 30 48" stroke="#F6F3EC" stroke-width="2"/>
  <circle cx="40" cy="25" r="3" fill="#D99B5A"/>
</svg>`
      },
      {
        id: 'mark_gabis_horizontal',
        title: "Gabi's Micro-Lot Wordmark",
        description: 'Clean typographic wordmark for bag labels, receipt headers, and store signage.',
        svg: `<svg viewBox="0 0 180 40" xmlns="http://www.w3.org/2000/svg" fill="none">
  <text x="10" y="27" font-family="'Playfair Display', serif" font-size="20" font-weight="700" letter-spacing="2" fill="#1F1A17">GABI’S</text>
  <text x="105" y="27" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="600" letter-spacing="3" fill="#C45D3E">// ATELIER</text>
</svg>`
      }
    ],
    toneOfVoice: [
      {
        trait: 'Warm, Tactile & Knowledgeable',
        description: 'Speak like an authentic master roaster and passionate host sharing a treasured reserve lot.',
        doExample: 'Grown at 2,100 meters in the high volcanic soils of Yirgacheffe, this washed heirloom lot reveals jasmine florals, bergamot tea, and crystallized honey.',
        dontExample: 'Our super-strong caffeinated drink will wake you up fast and gives you big energy.'
      },
      {
        trait: 'Transparent & Respectful of Origin',
        description: 'Highlight the farming families and ecological stewardship behind every harvest.',
        doExample: 'Harvested in partnership with the Assefa family cooperative, fermented for 36 hours in mountain spring water.',
        dontExample: 'We made this coffee in our factory.'
      }
    ],
    imageryStyle: {
      moodboardKeywords: ['Cast Iron Roaster', 'Single-Origin Coffee Beans', 'Ceramic Dripper', 'Warm Oak Countertops'],
      photographyGuidance: 'Warm natural side-lighting emphasizing textures of burlap sacks, crema bubbles, roasted beans, and handcrafted pottery.',
      dos: ['Close-up bean surface oils', 'Warm steam rising from ceramic cups', 'Natural earthy materials'],
      donts: ['Artificial neon tints', 'Commercial paper cups', 'Clinical studio setups']
    }
  },
  {
    id: 'brand_lumina_audio_01',
    brandName: 'Lumina Audio',
    tagline: 'Acoustic Precision in Pure Titanium',
    industry: 'Consumer Tech & Spatial Audio',
    mission: 'To pioneer studio-grade spatial audio headphones crafted from aerospace-grade recycled titanium, delivering pure acoustic immersion for creators and audio connoisseurs without ecological compromise.',
    vision: 'To redefine personal acoustic listening through sustainable engineering and zero-loss wireless transducers.',
    positioningStatement: 'For sound engineers and discerning audiophiles, Lumina Audio delivers master-quality fidelity paired with Swiss-minimalist industrial titanium craftsmanship.',
    targetAudience: 'Music producers, sound designers, audio engineers, and design-forward professionals aged 24–45.',
    createdAt: '2026-08-20T10:00:00.000Z',
    version: '1.2.0',
    personalityTraits: [
      { trait: 'Precision vs Casual', rating: 5, minLabel: 'Casual', maxLabel: 'Surgical Precision' },
      { trait: 'Aesthetic Focus', rating: 5, minLabel: 'Ornamental', maxLabel: 'Pure Functionalism' },
      { trait: 'Tone Warmth', rating: 3, minLabel: 'Clinical', maxLabel: 'Warm & Empathetic' },
      { trait: 'Boldness', rating: 4, minLabel: 'Subdued', maxLabel: 'Authoritative' }
    ],
    values: [
      { title: 'Acoustic Purity', description: 'Zero coloration, zero distortion, pure sonic master fidelity.', iconName: 'Activity' },
      { title: 'Sustainable Engineering', description: 'Machined from 100% recycled titanium with circular disassembly.', iconName: 'Feather' },
      { title: 'Swiss Ergonomics', description: 'Weightless spatial comfort tailored for 12-hour studio sessions.', iconName: 'Compass' }
    ],
    palette: [
      { name: 'Titanium Graphite', hex: '#1C1D21', rgb: '28, 29, 33', role: 'Neutral Dark', usage: 'Primary typography, hero containers, and premium hardware bodies.', contrastNote: 'Passes AAA contrast on crisp off-white.' },
      { name: 'Acoustic Indigo', hex: '#2B3A67', rgb: '43, 58, 103', role: 'Primary', usage: 'Core brand accents, interactive elements, and studio hardware badges.', contrastNote: 'Passes AA contrast on light backgrounds.' },
      { name: 'Frequency Cyan', hex: '#48CAE4', rgb: '72, 202, 228', role: 'Accent', usage: 'Audio frequency visualizers, dynamic indicators, and highlights.', contrastNote: 'High vibrance for dark UI surfaces.' },
      { name: 'Matte Slate', hex: '#8D99AE', rgb: '141, 153, 174', role: 'Secondary', usage: 'Secondary text, borders, specifications, and neutral accents.', contrastNote: 'Subtle high-clarity demarcation.' },
      { name: 'Anodized Silver', hex: '#F0F2F5', rgb: '240, 242, 245', role: 'Neutral Light', usage: 'Canvas background, packaging substrate, and light mode interfaces.', contrastNote: 'Glare-free optical background.' }
    ],
    typography: {
      headingFont: 'Space Grotesk',
      headingFontCategory: 'Display',
      headingWeights: ['500', '700'],
      bodyFont: 'Plus Jakarta Sans',
      bodyFontCategory: 'Sans-Serif',
      bodyWeights: ['400', '500', '600'],
      accentFont: 'JetBrains Mono',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap',
      rationale: 'Space Grotesk gives structural engineering authority to headlines, while Plus Jakarta Sans guarantees high legibility on digital apps and documentation.',
      cssSnippet: "font-family: 'Space Grotesk', sans-serif;\nfont-family: 'Plus Jakarta Sans', sans-serif;"
    },
    logo: {
      primaryLogoSvg: `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" fill="none">
  <g transform="translate(10, 10)">
    <circle cx="30" cy="30" r="26" stroke="#1C1D21" stroke-width="3" fill="none"/>
    <path d="M20 30 C20 22 25 18 30 18 C35 18 40 22 40 30 C40 38 35 42 30 42 C25 42 20 38 20 30 Z" fill="#2B3A67"/>
    <circle cx="30" cy="30" r="4" fill="#48CAE4"/>
    <path d="M12 30 H16 M44 30 H48 M30 12 V16 M30 44 V48" stroke="#1C1D21" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <text x="82" y="44" font-family="'Space Grotesk', sans-serif" font-size="24" font-weight="700" letter-spacing="3" fill="#1C1D21">LUMINA</text>
  <text x="82" y="60" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="600" letter-spacing="4" fill="#8D99AE">ACOUSTIC TITANIUM</text>
</svg>`,
      concept: 'Harmonic Concentric Acoustic Diaphragm with Precision Radial Calipers.',
      symbolism: 'The concentric geometry represents acoustic wave propagation and transducer precision.',
      geometryDetails: 'Built on a 60px circular baseline with golden ratio concentric frequency nodes.',
      aiImagePrompt: 'Minimalist luxury titanium headphones on dark slate pedestal with soft cinematic blue studio lighting, 8k resolution, product photography'
    },
    secondaryMarks: [
      {
        id: 'mark_lumina_monogram',
        title: 'Radial Diaphragm Monogram',
        description: 'Single-color 1:1 icon for app icons, hardware laser engraving, and headphone earcups.',
        svg: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" fill="none">
  <rect width="80" height="80" rx="16" fill="#1C1D21"/>
  <circle cx="40" cy="40" r="24" stroke="#F0F2F5" stroke-width="2.5"/>
  <circle cx="40" cy="40" r="14" stroke="#48CAE4" stroke-width="2" stroke-dasharray="4 3"/>
  <circle cx="40" cy="40" r="5" fill="#F0F2F5"/>
</svg>`
      },
      {
        id: 'mark_lumina_horizontal',
        title: 'Technical Specification Wordmark',
        description: 'Compact horizontal wordmark for packaging labels and schematics.',
        svg: `<svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg" fill="none">
  <text x="10" y="26" font-family="'Space Grotesk', sans-serif" font-size="16" font-weight="700" letter-spacing="4" fill="#1C1D21">LUMINA // 01</text>
</svg>`
      }
    ],
    toneOfVoice: [
      {
        trait: 'Authoritative yet Minimalist',
        description: 'Speak through engineering benchmarks and acoustic clarity rather than marketing hype.',
        doExample: 'Equipped with 50mm custom-milled planar magnetic drivers calibrated to ±0.5dB across 10Hz–48kHz.',
        dontExample: 'Experience magical sound that will blow your mind and change your universe!'
      },
      {
        trait: 'Transparent & Direct',
        description: 'State facts and materials with precision.',
        doExample: 'CNC-machined from Grade 5 aerospace titanium with breathable sheepskin memory foam pads.',
        dontExample: 'Made from the best stuff on earth for total comfort.'
      }
    ],
    imageryStyle: {
      moodboardKeywords: ['Precision Machining', 'Titanium Texture', 'Low-Key Studio Lighting', 'Minimalist Architecture'],
      photographyGuidance: 'High-contrast directional side-lighting with matte black and natural stone textures. Avoid saturated colorful backgrounds.',
      dos: ['Feature raw metal grain', 'Clean shallow depth of field', 'Authentic sound studio settings'],
      donts: ['Artificial lens flares', 'Cluttered environments', 'Overly stylized neon filters']
    }
  },
  {
    id: 'brand_verde_botanica_02',
    brandName: 'Verde Botanica',
    tagline: 'Bio-Identical Plant Nutrition for Barrier Vitality',
    industry: 'Clean Beauty & Botanical Skincare',
    mission: 'To formulate zero-waste, cold-pressed botanical skincare serums rooted in circular agriculture and bio-identical skin nutrients that nourish both barrier health and the planet.',
    vision: 'To eliminate synthetic fillers from luxury personal care through regenerative regenerative bio-ferments.',
    positioningStatement: 'For eco-conscious skincare purists, Verde Botanica provides clinical botanical potency through wild-harvested cold-pressed extractions in refillable glass vessels.',
    targetAudience: 'Holistic wellness enthusiasts and clean beauty consumers aged 26–52 looking for non-toxic luxury skincare.',
    createdAt: '2026-08-21T14:30:00.000Z',
    version: '1.0.0',
    personalityTraits: [
      { trait: 'Natural vs Synthetic', rating: 5, minLabel: 'Synthetic', maxLabel: 'Pure Botanical' },
      { trait: 'Warmth', rating: 5, minLabel: 'Clinical', maxLabel: 'Earthy & Nurturing' },
      { trait: 'Craftsmanship', rating: 4, minLabel: 'Industrial', maxLabel: 'Small Batch Artisan' },
      { trait: 'Elegance', rating: 5, minLabel: 'Rustic', maxLabel: 'Refined Luxury' }
    ],
    values: [
      { title: 'Regenerative Flora', description: '100% wild-harvested botanicals from ethical regenerative farm cooperatives.', iconName: 'Feather' },
      { title: 'Barrier Biocompatibility', description: 'Zero emulsifiers or petroleum derivatives—pure bio-compatible plant lipids.', iconName: 'Shield' },
      { title: 'Refillable Glass Vessel', description: 'Zero single-use plastic packaging; infinitely recyclable frosted amber glass.', iconName: 'Archive' }
    ],
    palette: [
      { name: 'Forest Moss', hex: '#2D4A3E', rgb: '45, 74, 62', role: 'Primary', usage: 'Hero packaging, primary typography, and editorial backdrops.', contrastNote: 'Passes AAA contrast on linen and cream surfaces.' },
      { name: 'Wild Olive', hex: '#5A6B5C', rgb: '90, 107, 92', role: 'Secondary', usage: 'Ingredient badges, subheadings, and secondary dividers.', contrastNote: 'Passes AA contrast on light parchment.' },
      { name: 'Terracotta Clay', hex: '#C86D51', rgb: '200, 109, 81', role: 'Accent', usage: 'Callouts, botanical actives, and warm highlight badges.', contrastNote: 'Warm organic focal point.' },
      { name: 'Botanical Linen', hex: '#F4F1EA', rgb: '244, 241, 234', role: 'Neutral Light', usage: 'Primary canvas, packaging paperboard, and editorial layout.', contrastNote: 'Soft warm natural parchment.' },
      { name: 'Deep Bark', hex: '#1E2421', rgb: '30, 36, 33', role: 'Neutral Dark', usage: 'High-contrast typography and legal copy.', contrastNote: 'Optimal reading legibility.' }
    ],
    typography: {
      headingFont: 'Playfair Display',
      headingFontCategory: 'Serif',
      headingWeights: ['400', '600', '700'],
      bodyFont: 'Plus Jakarta Sans',
      bodyFontCategory: 'Sans-Serif',
      bodyWeights: ['400', '500'],
      accentFont: 'Cinzel',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500&display=swap',
      rationale: 'Playfair Display infuses timeless editorial elegance and artisanal heritage into botanical headlines, while Plus Jakarta Sans keeps ingredient lists crisp and modern.',
      cssSnippet: "font-family: 'Playfair Display', serif;\nfont-family: 'Plus Jakarta Sans', sans-serif;"
    },
    logo: {
      primaryLogoSvg: `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" fill="none">
  <g transform="translate(12, 12)">
    <path d="M28 6 C16 6 8 16 8 28 C8 42 28 50 28 50 C28 50 48 42 48 28 C48 16 40 6 28 6 Z" stroke="#2D4A3E" stroke-width="2.5" fill="#F4F1EA"/>
    <path d="M28 14 V42 M28 24 Q36 20 38 28 M28 32 Q20 28 18 36" stroke="#2D4A3E" stroke-width="2" stroke-linecap="round"/>
    <circle cx="28" cy="20" r="2.5" fill="#C86D51"/>
  </g>
  <text x="78" y="42" font-family="'Playfair Display', serif" font-size="22" font-weight="700" letter-spacing="1.5" fill="#2D4A3E">VERDE</text>
  <text x="78" y="58" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="600" letter-spacing="3" fill="#5A6B5C">BOTANICA • APOTHECARY</text>
</svg>`,
      concept: 'Botanical Leaf Embryo with Circulatory Stem and Active Droplet.',
      symbolism: 'The leaf outline represents natural vitality, with the internal veins denoting biological nutrient transport.',
      geometryDetails: 'Symmetric parabolic curves balanced with a central vertical stem axis.',
      aiImagePrompt: 'Luxury frosted amber glass dropper bottle with minimalist cream label on raw travertine stone, surrounded by dried botanical herbs and gentle morning sunlight'
    },
    secondaryMarks: [
      {
        id: 'mark_verde_seal',
        title: 'Artisanal Wax Seal',
        description: 'Circular heritage seal for bottle caps and product packaging seals.',
        svg: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" fill="none">
  <circle cx="40" cy="40" r="36" fill="#2D4A3E"/>
  <circle cx="40" cy="40" r="30" stroke="#C86D51" stroke-width="1.5" stroke-dasharray="3 3"/>
  <path d="M40 22 C32 22 26 28 26 36 C26 46 40 54 40 54 C40 54 54 46 54 36 C54 28 48 22 40 22 Z" fill="#F4F1EA"/>
  <path d="M40 28 V48 M40 34 Q46 32 48 38 M40 40 Q34 38 32 44" stroke="#2D4A3E" stroke-width="1.5"/>
</svg>`
      }
    ],
    toneOfVoice: [
      {
        trait: 'Earthy & Poetic',
        description: 'Celebrate the natural origin and sensory experience of wild botanicals.',
        doExample: 'Cold-pressed from wild rosehips gathered at dawn in the high valleys of Patagonia.',
        dontExample: 'Our chemical mix is formulated to hydrate your skin quickly.'
      }
    ],
    imageryStyle: {
      moodboardKeywords: ['Raw Travertine', 'Dappled Sunlight', 'Botanical Macro', 'Amber Glass'],
      photographyGuidance: 'Natural warm morning light, tactile stone textures, real water droplets, and unretouched skin textures.',
      dos: ['Natural skin pores', 'Organic plant cuttings', 'Warm tactile linen'],
      donts: ['Heavy plastic cosmetics', 'Artificial studio flash', 'Over-smoothed skin']
    }
  },
  {
    id: 'brand_apex_capital_03',
    brandName: 'Apex Capital',
    tagline: 'Algorithmic Wealth Intelligence for Modern Founders',
    industry: 'FinTech & Quantitative Asset Management',
    mission: 'To democratize institutional venture investing and algorithmic wealth management for next-generation tech founders and digital asset builders.',
    vision: 'To build the sovereign financial platform where quantitative intelligence powers generational wealth creation.',
    positioningStatement: 'For technology entrepreneurs and quantitative investors, Apex Capital delivers real-time algorithmic portfolio optimization with private banking prestige.',
    targetAudience: 'Tech founders, software executives, venture capitalists, and family offices aged 28–50.',
    createdAt: '2026-08-22T08:15:00.000Z',
    version: '2.1.0',
    personalityTraits: [
      { trait: 'Analytical vs Intuitive', rating: 5, minLabel: 'Intuitive', maxLabel: 'Quantitative Data' },
      { trait: 'Prestige', rating: 5, minLabel: 'Mass Retail', maxLabel: 'Institutional Private Banking' },
      { trait: 'Speed & Agility', rating: 4, minLabel: 'Bureaucratic', maxLabel: 'Real-Time Dynamic' },
      { trait: 'Modernism', rating: 5, minLabel: 'Traditional Brick', maxLabel: 'Cryptographic Precision' }
    ],
    values: [
      { title: 'Mathematical Integrity', description: 'Zero emotional bias; every investment allocation is validated by proprietary quantitative models.', iconName: 'Activity' },
      { title: 'Fiduciary Sovereignty', description: 'Direct custodial asset control with zero hidden counterparty liabilities.', iconName: 'Shield' },
      { title: 'Institutional Execution', description: 'Sub-millisecond smart order routing across global equities and private secondary markets.', iconName: 'TrendingUp' }
    ],
    palette: [
      { name: 'Obsidian Black', hex: '#0B0C10', rgb: '11, 12, 16', role: 'Neutral Dark', usage: 'Primary canvas for terminal interfaces, executive dossiers, and typography.', contrastNote: 'Deepest luxury black with zero optical noise.' },
      { name: 'Sovereign Gold', hex: '#D4AF37', rgb: '212, 175, 55', role: 'Accent', usage: 'Wealth indicators, premium tiers, logomarks, and key metrics.', contrastNote: 'High-contrast luxury bullion gold.' },
      { name: 'Algorithmic Cobalt', hex: '#1F3A60', rgb: '31, 58, 96', role: 'Primary', usage: 'Data visualizations, secondary buttons, and structured card headers.', contrastNote: 'Commanding institutional navy.' },
      { name: 'Steel Platinum', hex: '#C5C6C7', rgb: '197, 198, 199', role: 'Secondary', usage: 'Grid lines, tick marks, labels, and secondary interface elements.', contrastNote: 'Crisp technical readability.' },
      { name: 'Pure Frost', hex: '#F8F9FA', rgb: '248, 249, 250', role: 'Neutral Light', usage: 'Executive light mode paper stock and PDF report backgrounds.', contrastNote: 'Crisp editorial contrast.' }
    ],
    typography: {
      headingFont: 'Space Grotesk',
      headingFontCategory: 'Display',
      headingWeights: ['600', '700'],
      bodyFont: 'Plus Jakarta Sans',
      bodyFontCategory: 'Sans-Serif',
      bodyWeights: ['400', '500', '600', '700'],
      accentFont: 'JetBrains Mono',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap',
      rationale: 'High-density numeric legibility paired with powerful architectural headlines that convey financial stability and algorithmic acumen.',
      cssSnippet: "font-family: 'Space Grotesk', sans-serif;\nfont-family: 'Plus Jakarta Sans', sans-serif;"
    },
    logo: {
      primaryLogoSvg: `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" fill="none">
  <g transform="translate(10, 10)">
    <polygon points="30,8 52,48 8,48" stroke="#D4AF37" stroke-width="3" fill="none"/>
    <polygon points="30,22 42,44 18,44" fill="#0B0C10"/>
    <line x1="30" y1="8" x2="30" y2="48" stroke="#D4AF37" stroke-width="2" stroke-dasharray="3 2"/>
    <circle cx="30" cy="8" r="3.5" fill="#D4AF37"/>
  </g>
  <text x="76" y="42" font-family="'Space Grotesk', sans-serif" font-size="22" font-weight="700" letter-spacing="3" fill="#0B0C10">APEX</text>
  <text x="76" y="58" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="700" letter-spacing="4" fill="#1F3A60">CAPITAL MANAGEMENT</text>
</svg>`,
      concept: 'Ascending Triangular Apex with Central Convergence Meridian.',
      symbolism: 'The geometric tetrahedron signifies capital preservation, alpha generation, and structural integrity.',
      geometryDetails: 'Equilateral 60° triangular bounds with a vertical symmetry axis.',
      aiImagePrompt: 'Sleek black glass corporate building lobby with gold brushed steel Apex logo, architectural reflections, cinematic lighting, 8k resolution'
    },
    secondaryMarks: [
      {
        id: 'mark_apex_crest',
        title: 'Institutional Gold Apex Crest',
        description: 'Square monogram for security tokens, mobile cards, and biometric authentication.',
        svg: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" fill="none">
  <rect width="80" height="80" rx="12" fill="#0B0C10"/>
  <polygon points="40,16 64,60 16,60" stroke="#D4AF37" stroke-width="3"/>
  <polygon points="40,30 52,54 28,54" fill="#1F3A60"/>
  <circle cx="40" cy="16" r="3" fill="#D4AF37"/>
</svg>`
      }
    ],
    toneOfVoice: [
      {
        trait: 'Sovereign & Disciplined',
        description: 'Maintain the composure of an institutional investment committee.',
        doExample: 'Our delta-neutral automated liquidity strategies produced 14.8% net annualized alpha with 0.18 correlation to the S&P 500.',
        dontExample: 'Make massive crypto profits and get rich with our cool investment bot!'
      }
    ],
    imageryStyle: {
      moodboardKeywords: ['Obsidian Glass', 'Brushed Brass', 'Monochrome Architectural Lines', 'Financial Terminals'],
      photographyGuidance: 'Crisp geometric angles, dark obsidian surfaces with precise warm amber highlights.',
      dos: ['Architectural symmetry', 'High quality dark mode interfaces', 'Crisp typography'],
      donts: ['Generic stock handshake photos', 'Piggy banks or cheesy coins', 'Amateur charts']
    }
  },
  {
    id: 'brand_kinstone_04',
    brandName: 'Kinstone Bakehouse',
    tagline: '72-Hour Wild Fermentation & Hearth Heritage',
    industry: 'Artisanal Bakery & Specialty Coffee',
    mission: 'To honor 72-hour wild sourdough fermentation and single-origin micro-roasted coffee, creating a neighborhood sanctuary where ancient grain heritage meets warm communal hospitality.',
    vision: 'To restore stone-milled regional heritage grains to everyday community life.',
    positioningStatement: 'For food purists and neighborhood gathering seekers, Kinstone Bakehouse crafts slow-fermented organic breads baked daily on volcanic stone hearths.',
    targetAudience: 'Culinary enthusiasts, families, coffee connoisseurs, and neighborhood locals seeking authentic slow food.',
    createdAt: '2026-08-23T06:00:00.000Z',
    version: '1.0.0',
    personalityTraits: [
      { trait: 'Warmth', rating: 5, minLabel: 'Industrial', maxLabel: 'Warm Hearth & Welcoming' },
      { trait: 'Tradition', rating: 5, minLabel: 'Modern Sterile', maxLabel: 'Ancient Hearth Craft' },
      { trait: 'Authenticity', rating: 5, minLabel: 'Mass Production', maxLabel: 'Hand-Shaped Artisan' },
      { trait: 'Approachable', rating: 5, minLabel: 'Intimidating', maxLabel: 'Friendly Neighborhood' }
    ],
    values: [
      { title: 'Stone-Milled Heritage Grains', description: '100% regional identity-preserved ancient grains milled on stone daily.', iconName: 'Feather' },
      { title: 'Time as Ingredient', description: 'Zero commercial yeast acceleration; naturally leavened over 72 hours.', iconName: 'Compass' },
      { title: 'Communal Table', description: 'A welcoming physical hearth where food brings community together.', iconName: 'Coffee' }
    ],
    palette: [
      { name: 'Toasted Rye', hex: '#3E2723', rgb: '62, 39, 35', role: 'Neutral Dark', usage: 'Main typography, chalkboard menus, and packaging text.', contrastNote: 'Deep warm espresso brown with exceptional legibility.' },
      { name: 'Warm Hearth Terracotta', hex: '#D87A4F', rgb: '216, 122, 79', role: 'Primary', usage: 'Primary brand badges, bakery storefront signage, and wax paper print.', contrastNote: 'Inviting artisanal warmth.' },
      { name: 'Golden Crumb', hex: '#E8A858', rgb: '232, 168, 88', role: 'Accent', usage: 'Crust highlights, specials, and stamp impressions.', contrastNote: 'Rich sourdough golden-crust hue.' },
      { name: 'Milled Flour Linen', hex: '#FBF8F2', rgb: '251, 248, 242', role: 'Neutral Light', usage: 'Bakery paper bags, menu cards, and canvas backgrounds.', contrastNote: 'Soft warm unbleached parchment.' },
      { name: 'Olive Rosemary', hex: '#6B705C', rgb: '107, 112, 92', role: 'Secondary', usage: 'Herbal accents, secondary badges, and sustainable packaging icons.', contrastNote: 'Earthy botanical complement.' }
    ],
    typography: {
      headingFont: 'Playfair Display',
      headingFontCategory: 'Serif',
      headingWeights: ['600', '700'],
      bodyFont: 'Plus Jakarta Sans',
      bodyFontCategory: 'Sans-Serif',
      bodyWeights: ['400', '500'],
      accentFont: 'Cinzel',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500&display=swap',
      rationale: 'Playfair Display captures the artisanal charm of old-world European hearth baking with tactile warmth.',
      cssSnippet: "font-family: 'Playfair Display', serif;\nfont-family: 'Plus Jakarta Sans', sans-serif;"
    },
    logo: {
      primaryLogoSvg: `<svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" fill="none">
  <g transform="translate(12, 12)">
    <circle cx="28" cy="28" r="24" stroke="#3E2723" stroke-width="2.5" fill="#FBF8F2"/>
    <path d="M16 28 Q28 14 40 28 Q28 42 16 28 Z" fill="#E8A858" stroke="#3E2723" stroke-width="1.5"/>
    <path d="M22 28 H34 M28 20 V36" stroke="#3E2723" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="28" cy="28" r="2" fill="#D87A4F"/>
  </g>
  <text x="76" y="42" font-family="'Playfair Display', serif" font-size="20" font-weight="700" letter-spacing="1" fill="#3E2723">KINSTONE</text>
  <text x="76" y="58" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="600" letter-spacing="3.5" fill="#D87A4F">BAKEHOUSE & HEARTH</text>
</svg>`,
      concept: 'Scored Artisan Sourdough Boule with Wheat Stalk Cross.',
      symbolism: 'The traditional hand-scored baker slash represents natural wild fermentation and craftsmanship.',
      geometryDetails: 'Balanced concentric circle with organic curved leaf scoring.',
      aiImagePrompt: 'Artisan sourdough loaf with flour dusting on dark wooden table next to fresh butter and steaming ceramic coffee mug, warm morning bakery window light'
    },
    secondaryMarks: [
      {
        id: 'mark_kinstone_stamp',
        title: 'Kraft Paper Bag Stamp',
        description: 'Circular bakery stamp for packaging boxes and bread wrappers.',
        svg: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" fill="none">
  <circle cx="40" cy="40" r="36" stroke="#3E2723" stroke-width="2.5" stroke-dasharray="4 2"/>
  <circle cx="40" cy="40" r="30" fill="#D87A4F"/>
  <path d="M28 40 Q40 24 52 40 Q40 56 28 40 Z" fill="#FBF8F2"/>
  <path d="M34 40 H46 M40 32 V48" stroke="#3E2723" stroke-width="1.5"/>
</svg>`
      }
    ],
    toneOfVoice: [
      {
        trait: 'Warm, Welcoming & Tactile',
        description: 'Speak like a passionate neighborhood baker sharing a fresh warm loaf from the oven.',
        doExample: 'Our Country Sourdough is fermented for 72 hours with our 12-year-old starter, yielding a caramelized blistered crust and custard-like open crumb.',
        dontExample: 'Buy our bread fast before it expires!'
      }
    ],
    imageryStyle: {
      moodboardKeywords: ['Flour Dusting', 'Golden Caramelized Crust', 'Morning Sunlight', 'Rustic Oak Wood'],
      photographyGuidance: 'Warm, soft natural light highlighting crust textures, crumb bubbles, and steam rising from fresh bread.',
      dos: ['Close-up crumb structure', 'Real flour dusted hands', 'Warm amber morning light'],
      donts: ['Cold fluorescent lighting', 'Plastic wrapped food', 'Sterile white backgrounds']
    }
  }
];
