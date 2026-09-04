import { PopularBrandCaseStudy } from '../types/brandCaseStudies';

// NOTE: Curated case-study logos rely on the third-party Clearbit Logo API
// (https://logo.clearbit.com/<domain>). The service is unauthenticated and can
// rate-limit or change availability; the UI gracefully falls back to a text
// monogram via ImageWithFallback when a logo cannot be loaded.
export const CURATED_POPULAR_BRANDS: PopularBrandCaseStudy[] = [
  {
    id: 'nike',
    brandName: 'Nike',
    tagline: 'Just Do It',
    foundingYear: 1964,
    founders: ['Phil Knight', 'Bill Bowerman'],
    headquarters: 'Beaverton, Oregon, USA',
    industry: 'Athletics, Footwear & Apparel',
    category: 'Athletics & Lifestyle',
    originStory:
      'Started out of the trunk of Phil Knight’s green Plymouth Valiant as Blue Ribbon Sports (BRS), importing Onitsuka Tiger running shoes from Japan. Track coach Bill Bowerman famously experimented with melting rubber in his wife’s waffle iron to create a lighter, high-traction sole.',
    initialStruggle:
      'In 1971, the relationship with Onitsuka Tiger fractured, forcing Knight to launch an independent brand overnight without retail distribution, immense capital, or a recognized trademark.',
    thePivotalBreakthrough:
      'Student Carolyn Davidson was paid $35 to design a fluid mark representing motion and the wing of Nike, the Greek goddess of victory. Combined with authentic athlete endorsements (Steve Prefontaine, Michael Jordan) and the 1988 "Just Do It" campaign, Nike shifted from selling athletic gear to selling human potential and heroic perseverance.',
    coreBrandPillars: [
      {
        title: 'Authentic Athletic Innovation',
        description: 'Constantly engineering performance breakthroughs (Air, Flyknit, Vaporfly) grounded in direct athlete biomechanics.',
      },
      {
        title: 'Heroic Emotional Branding',
        description: 'Focusing advertisements on universal internal struggle, grit, and triumph rather than product specifications.',
      },
      {
        title: 'Iconic Minimalist Vector Symbolism',
        description: 'A singular, instantly recognizable graphic mark capable of standing entirely alone without typography.',
      },
    ],
    logoEvolution: [
      {
        era: '1971 - 1978',
        title: 'The Original $35 Outline Swoosh',
        description: 'Designed by graphic design student Carolyn Davidson. Featured a cursive lowercase "nike" rendered in serif outline overlapping the fluid check mark.',
        keyDesignChanges: ['Lowercase cursive typography', 'Fluid outline swoosh', 'Black line weight over white'],
        imageUrl: "",
      },
      {
        era: '1978 - 1985',
        title: 'Futura Bold Condensed Lockup',
        description: 'The typography was updated to bold, geometric uppercase Futura Extra Bold Condensed italicized, layered over a solid silhouette swoosh.',
        keyDesignChanges: ['Geometric Futura typography', 'Solid black silhouette swoosh', 'Dynamic forward tilt italic'],
        imageUrl: "",
      },
      {
        era: '1995 - Present',
        title: 'The Pure Standalone Swoosh',
        description: 'Nike eliminated all typography from the primary mark. The Swoosh achieved universal global recognition, becoming one of the purest semiotic symbols in world commerce.',
        keyDesignChanges: ['Removal of wordmark', 'Maximum geometric balance', 'Pure standalone silhouette'],
        imageUrl: "https://logo.clearbit.com/nike.com",
      },
    ],
    colorPaletteHeritage: [
      { name: 'Core Black', hex: '#111111', role: 'Dominant (60%)', psychology: 'Power, authority, high-performance athletic discipline.' },
      { name: 'Pure White', hex: '#FFFFFF', role: 'Structural (30%)', psychology: 'Precision, clarity, breathability, and contrast.' },
      { name: 'Volt / Crimson Accent', hex: '#E11D48', role: 'Accent (10%)', psychology: 'High energy, adrenaline, urgency, and athletic victory.' },
    ],
    typographyEvolution: [
      { era: '1971 - 1978', fontName: 'Script Cursive Serif', style: 'Light Outline Cursive', rationale: 'Friendly, organic craft feel common in early 70s boutique retail.' },
      { era: '1978 - Present', fontName: 'Futura Bold Condensed', style: 'Geometric Italicized Sans', rationale: 'Forward momentum, industrial speed, and uncompromising physical strength.' },
    ],
    keyMilestones: [
      { year: '1971', headline: 'Creation of the Swoosh', summary: 'Carolyn Davidson drafts the mark for $35; Phil Knight initially remarked, "I don’t love it, but maybe it will grow on me."', takeaway: 'Iconic marks often feel unfamiliar at first; brand equity is built through consistent execution, not instant initial consensus.' },
      { year: '1984', headline: 'Signing Michael Jordan', summary: 'Nike took a $2.5M gamble on a rookie player, creating Air Jordan and defying NBA color regulations.', takeaway: 'Aligning with authentic cultural trailblazers creates generational cultural momentum.' },
      { year: '1988', headline: 'Launch of "Just Do It"', summary: 'Wieden+Kennedy created the slogan inspired by Gary Gilmore’s final words, democratizing fitness for every human body.', takeaway: 'Elevate your core message beyond product specs to universal human motivation.' },
    ],
    actionableLessons: [
      {
        lessonTitle: 'The Power of De-Branded Simplicity',
        explanation: 'Nike evolved from a cluttered wordmark-with-icon lockup to a pure silhouette. Ensure your vector logomark is geometrically memorable enough to be sketched on a napkin in 3 seconds.',
        actionableStepForYourBrand: 'Test your brand logo at 16px and in pure monochrome silhouette. If it loses definition, simplify its geometric contour.',
      },
      {
        lessonTitle: 'Sell the Aspiration, Not the Hardware',
        explanation: 'Nike rarely talks about shoe stitching in prime campaigns; they celebrate overcoming internal self-doubt.',
        actionableStepForYourBrand: 'Frame your brand mission around the emotional transformation of your customer, not just feature bullets.',
      },
    ],
    starterPromptInspiration: {
      recommendedMission: 'Empowering everyday individuals to push their physical and mental boundaries through precision-engineered lifestyle gear and uncompromising grit.',
      recommendedAesthetic: 'Bold & Energetic',
      recommendedTargetAudience: 'Active achievers, competitive athletes, and driven individuals pursuing peak personal performance.',
      recommendedIndustry: 'Athletics & Performance Lifestyle',
    },
  },
  {
    id: 'apple',
    brandName: 'Apple',
    tagline: 'Think Different',
    foundingYear: 1976,
    founders: ['Steve Jobs', 'Steve Wozniak', 'Ronald Wayne'],
    headquarters: 'Cupertino, California, USA',
    industry: 'Consumer Technology, Hardware & Software',
    category: 'Tech & Software',
    originStory:
      'Founded in the garage of Steve Jobs’ childhood home in Los Altos, California. Steve Wozniak hand-built the Apple I circuit board, while Jobs envisioned computers as "bicycles for the mind" accessible to everyday humans, not just electrical engineers.',
    initialStruggle:
      'The initial Apple logo drawn by Ronald Wayne was an intricate Victorian woodcut of Sir Isaac Newton under an apple tree—far too complex and ornate to engrave or scale down to small hardware chassis.',
    thePivotalBreakthrough:
      'Jobs commissioned Rob Janoff in 1977 to create a modern graphic mark. Janoff added the "bite" for scale so people wouldn’t mistake it for a cherry. Jobs added 6 vibrant horizontal rainbow stripes to humanize the tech and showcase Apple II’s color display capability. Later in 1997, Jobs stripped the rainbow for monochromatic metallic elegance.',
    coreBrandPillars: [
      {
        title: 'Design as How It Works',
        description: 'Design is not just what it looks like and feels like. Design is how it works down to sub-millimeter tolerances.',
      },
      {
        title: 'Ruthless Editorial Subtraction',
        description: 'Saying no to a thousand good ideas to focus completely on the one revolutionary experience.',
      },
      {
        title: 'Humanizing Complex Technology',
        description: 'Translating intimidating computing power into intuitive, delightful everyday touch and gesture interfaces.',
      },
    ],
    logoEvolution: [
      {
        era: '1976',
        title: 'The Isaac Newton Woodcut',
        description: 'Drawn by co-founder Ronald Wayne. Depicted Isaac Newton reading under an apple tree framed by a classical banner poem.',
        keyDesignChanges: ['Intricate hand-drawn engraving', 'Classical banner typography', 'Extreme decorative detail'],
        imageUrl: "",
      },
      {
        era: '1977 - 1998',
        title: 'The Rob Janoff Rainbow Apple',
        description: 'Rob Janoff simplified the mark into the iconic bitten silhouette with 6 vivid horizontal color bands celebrating the Apple II’s color monitor.',
        keyDesignChanges: ['Geometric bitten fruit silhouette', '6 vibrant rainbow stripes', 'Humanized approachable aesthetic'],
        imageUrl: "",
      },
      {
        era: '1998 - Present',
        title: 'Monochrome Minimalist Silhouette',
        description: 'Steve Jobs returned and eliminated the rainbow stripes in favor of solid translucent, metallic, and deep monochrome finishes matched to industrial anodized aluminum.',
        keyDesignChanges: ['Pure solid monochrome fill', 'Harmonized with aluminum & glass hardware', 'Maximum premium restraint'],
        imageUrl: "https://logo.clearbit.com/apple.com",
      },
    ],
    colorPaletteHeritage: [
      { name: 'Space Gray / Obsidian', hex: '#1D1D1F', role: 'Dominant (60%)', psychology: 'Understated luxury, precision engineering, focus.' },
      { name: 'Apple Silver', hex: '#E5E5EA', role: 'Structural (30%)', psychology: 'Purity, aerospace craftsmanship, timeless industrial durability.' },
      { name: 'Interface Accent Blue', hex: '#0071E3', role: 'Accent (10%)', psychology: 'Intuitive digital touchpoint, clarity, frictionless action.' },
    ],
    typographyEvolution: [
      { era: '1977 - 1984', fontName: 'Motter Tektura', style: 'Futuristic Curved Sans', rationale: 'Tech-forward novelty in the dawn of personal computing.' },
      { era: '1984 - 2002', fontName: 'Apple Garamond', style: 'Condensed Literary Serif', rationale: 'Positioned Apple as an intellectual, creative tool for thinkers and writers.' },
      { era: '2015 - Present', fontName: 'SF Pro (San Francisco)', style: 'Bespoke Variable Sans', rationale: 'Engineered for pixel-perfect legibility from a 40mm Apple Watch to a 32-inch 6K display.' },
    ],
    keyMilestones: [
      { year: '1977', headline: 'The Rob Janoff Redesign', summary: 'Simplified an unscalable woodcut into the world’s most recognizable silhouette with a single bite.', takeaway: 'Early logos often suffer from over-illustration; simplify early before scaling.' },
      { year: '1997', headline: 'The "Think Different" Campaign', summary: 'Jobs rallied the company around celebrating the "crazy ones, the misfits, the rebels" without showcasing a single product spec.', takeaway: 'When reviving a brand, reclaim your core philosophy and moral purpose first.' },
      { year: '2007', headline: 'The iPhone Launch', summary: 'Consolidated a phone, widescreen iPod, and internet communicator into a single glass slate.', takeaway: 'True category leadership comes from eliminating friction across disparate experiences.' },
    ],
    actionableLessons: [
      {
        lessonTitle: 'Subtraction Over Addition',
        explanation: 'Apple’s brand grew stronger by removing things: removing floppy drives, removing headphone jacks, removing logo colors, removing unnecessary physical buttons.',
        actionableStepForYourBrand: 'Audit your brand offerings and messaging. Identify three things you can eliminate to sharpen your core value proposition.',
      },
      {
        lessonTitle: 'The Unboxing Ritual as Brand Theater',
        explanation: 'Apple treats hardware packaging as a sacred sensorial handoff, calibrating box lid slide speeds to 3 seconds of anticipation.',
        actionableStepForYourBrand: 'Map out the first 60 seconds a customer interacts with your digital product or physical delivery; make it feel deliberate and ceremonial.',
      },
    ],
    starterPromptInspiration: {
      recommendedMission: 'Crafting minimalist, intuitive hardware and software tools that disappear into the background and amplify human creative potential.',
      recommendedAesthetic: 'Modern & Minimalist',
      recommendedTargetAudience: 'Discerning creative professionals, engineers, and digital connoisseurs who demand uncompromising elegance.',
      recommendedIndustry: 'Consumer Hardware & Digital Systems',
    },
  },
  {
    id: 'starbucks',
    brandName: 'Starbucks',
    tagline: 'To inspire and nurture the human spirit',
    foundingYear: 1971,
    founders: ['Jerry Baldwin', 'Zev Siegl', 'Gordon Bowker'],
    headquarters: 'Seattle, Washington, USA',
    industry: 'Specialty Coffee & Retail Hospitality',
    category: 'Food & Beverage',
    originStory:
      'Started in Seattle’s historic Pike Place Market selling premium whole bean coffee, tea, and spices. It was not originally a cafe—founders only roasted and packaged high-grade beans.',
    initialStruggle:
      'Howard Schultz visited Milan, Italy in 1983 and fell in love with espresso bars as community gathering hubs ("The Third Place" between work and home). The original founders rejected serving liquid espresso drinks, prompting Schultz to leave and start Il Giornale before buying Starbucks in 1987.',
    thePivotalBreakthrough:
      'Schultz merged Il Giornale with Starbucks, adopted the green palette, and systematized the Italian espresso experience worldwide. The siren was redesigned from a raw 16th-century Norse woodcut into a warm, approachable modern icon.',
    coreBrandPillars: [
      {
        title: 'The Third Place Phenomenon',
        description: 'Creating an inviting community oasis between the demands of home and the pressures of the workplace.',
      },
      {
        title: 'Personalized Barista Rituals',
        description: 'Writing names on cups and crafting customized beverage recipes that turn a commodity into an identity statement.',
      },
      {
        title: 'Ethical Origin Transparency (C.A.F.E. Practices)',
        description: 'Investing in coffee farmer communities, agronomy centers, and sustainable single-origin supply chains.',
      },
    ],
    logoEvolution: [
      {
        era: '1971 - 1987',
        title: 'The Brown Twin-Tailed Norse Siren',
        description: 'A rustic coffee-brown woodcut engraving of a bare-chested twin-tailed mermaid inspired by a 16th-century Nordic marine illustration.',
        keyDesignChanges: ['Deep espresso brown color', 'Detailed mythological woodcut', 'Circular seal typography'],
        imageUrl: "",
      },
      {
        era: '1987 - 2011',
        title: 'The Emerald Green Circular Badge',
        description: 'Schultz merged Il Giornale’s green aesthetic with Starbucks. The siren was stylized, modest, and enclosed within an emerald circular badge with two stars.',
        keyDesignChanges: ['Transition to iconic Kelly Green', 'Stylized symmetrical siren face', 'Bold uppercase sans typography with stars'],
        imageUrl: "",
      },
      {
        era: '2011 - Present',
        title: 'The Liberated Global Siren',
        description: 'For their 40th anniversary, Starbucks removed the outer ring, the company name, and the word "coffee", letting the pure green siren emerge unobstructed.',
        keyDesignChanges: ['Removal of wordmark and outer circle', 'Asymmetrical subtle human facial contour', 'Pure monochrome emerald green'],
        imageUrl: "https://logo.clearbit.com/starbucks.com",
      },
    ],
    colorPaletteHeritage: [
      { name: 'Starbucks House Green', hex: '#006241', role: 'Dominant (60%)', psychology: 'Freshness, prosperity, botanical warmth, and organic heritage.' },
      { name: 'Warm Cream Parchment', hex: '#F2EFEB', role: 'Structural (30%)', psychology: 'Hospitality, comforting cafe atmosphere, tactile paper warmth.' },
      { name: 'Roast Gold Accent', hex: '#CBA258', role: 'Accent (10%)', psychology: 'Artisanal micro-lot quality, master roasting, subtle craft luxury.' },
    ],
    typographyEvolution: [
      { era: '1971 - 1987', fontName: 'Traditional Woodcut Serif', style: 'Rustic Engraved Caps', rationale: 'Conveyed Maritime Pacific Northwest trading roots.' },
      { era: '1987 - 2011', fontName: 'Trade Gothic Bold Condensed', style: 'Industrial Sans Caps', rationale: 'Clean, bold legibility on retail cups and storefront signage.' },
      { era: '2011 - Present', fontName: 'Santana & Sodo Sans', style: 'Warm Humanist Sans', rationale: 'Approachable, editorial warmth across mobile apps and digital ordering.' },
    ],
    keyMilestones: [
      { year: '1987', headline: 'The Il Giornale Merger', summary: 'Howard Schultz acquired Starbucks for $3.8M, transforming it from a bean merchant to an experiential cafe chain.', takeaway: 'Customer experience and environmental atmosphere often out-value the physical core commodity.' },
      { year: '2008', headline: 'Closing 7,100 Stores for Barista Training', summary: 'Schultz returned as CEO and temporarily halted US operations for 3 hours to retrain baristas on pulling the perfect espresso shot.', takeaway: 'Never sacrifice your foundational craftsmanship at the altar of hyper-scale.' },
      { year: '2011', headline: 'Dropping "Coffee" from the Logo', summary: 'Freed the brand to expand into food, tea, retail merchandise, and global hospitality without semantic category friction.', takeaway: 'Design your brand name and visual identity so it doesn’t box you into your initial narrow product line.' },
    ],
    actionableLessons: [
      {
        lessonTitle: 'The Power of the Third Place',
        explanation: 'Starbucks didn’t just sell caffeinated water; they sold the right to sit in a comfortable leather chair with free Wi-Fi for 4 hours.',
        actionableStepForYourBrand: 'Define what emotional space your brand occupies in your user’s daily mental routine. Are you their sanctuary, their catalyst, or their command center?',
      },
      {
        lessonTitle: 'Subtle Asymmetry for Human Warmth',
        explanation: 'In 2011, designers intentionally made the Siren’s facial shadow slightly asymmetrical so she looked approachable rather than an uncanny, cold vector mask.',
        actionableStepForYourBrand: 'Avoid clinical, lifeless perfection. Inject organic human nuance into your typography pairings and copywriting voice.',
      },
    ],
    starterPromptInspiration: {
      recommendedMission: 'Building warm, sensory gathering spaces and artisanal morning rituals through ethically sourced direct-trade botanicals and handcrafted hospitality.',
      recommendedAesthetic: 'Warm & Organic Artisanal',
      recommendedTargetAudience: 'Neighborhood dwellers, remote professionals, and culinary explorers seeking thoughtful everyday warmth.',
      recommendedIndustry: 'Artisanal Food & Hospitality',
    },
  },
  {
    id: 'tesla',
    brandName: 'Tesla',
    tagline: 'Accelerating the world’s transition to sustainable energy',
    foundingYear: 2003,
    founders: ['Martin Eberhard', 'Marc Tarpenning', 'Elon Musk', 'JB Straubel', 'Ian Wright'],
    headquarters: 'Austin, Texas, USA',
    industry: 'Electric Vehicles, Clean Energy & Robotics',
    category: 'Automotive & Space',
    originStory:
      'Incorporated in 2003 by Martin Eberhard and Marc Tarpenning, named after electrical engineer Nikola Tesla. Elon Musk led the Series A round in 2004 with a radical Master Plan: build an expensive low-volume sports car (Roadster) to fund a medium-volume luxury sedan (Model S), to fund high-volume affordable cars (Model 3) and sustainable energy infrastructure.',
    initialStruggle:
      'Traditional automakers believed electric vehicles had to be slow, ugly golf-cart compromises with 60-mile range. Tesla nearly went bankrupt in Christmas 2008 during the global financial crisis.',
    thePivotalBreakthrough:
      'Proving that electric vehicles could outperform the fastest supercars on Earth in zero-to-sixty acceleration while achieving five-star safety ratings. The brand logo was engineered by RO-Studio to represent the cross-section of an electric motor rotor.',
    coreBrandPillars: [
      {
        title: 'Zero Compromise Performance',
        description: 'Sustainable products must be undeniably superior in speed, safety, and delight compared to legacy fossil alternatives.',
      },
      {
        title: 'First-Principles Engineering',
        description: 'Breaking problems down to fundamental physics and rebuilding manufacturing from raw atomic costs up.',
      },
      {
        title: 'Direct-to-Consumer Ecosystem',
        description: 'Bypassing dealership markups with seamless app-driven purchasing, over-the-air software updates, and Supercharger networks.',
      },
    ],
    logoEvolution: [
      {
        era: '2003 - 2008',
        title: 'The Shield Emblem',
        description: 'The early mark featured the stylized "T" set inside a dark metallic automotive crest shield.',
        keyDesignChanges: ['Classic automotive heraldic shield', 'Textured chrome bezel', 'Traditional sports car badge style'],
        imageUrl: "",
      },
      {
        era: '2008 - Present',
        title: 'The Cross-Section Rotor "T"',
        description: 'Stripped the enclosing shield. The "T" represents the rotor pole of an electric motor, with the curved top bar representing the stator armature gap.',
        keyDesignChanges: ['Removal of shield enclosure', 'Direct motor physics symbolism', 'Sharp futuristic geometric cutouts'],
        imageUrl: "https://logo.clearbit.com/tesla.com",
      },
    ],
    colorPaletteHeritage: [
      { name: 'Tesla Racing Red', hex: '#E82127', role: 'Dominant (60%)', psychology: 'Instant torque, passionate disruption, high-voltage intensity.' },
      { name: 'Stealth Matte Black', hex: '#111111', role: 'Structural (30%)', psychology: 'Minimalist dashboard cockpits, aerodynamic stealth.' },
      { name: 'Pure White Titanium', hex: '#FFFFFF', role: 'Accent (10%)', psychology: 'Clean energy, futuristic cabin luxury, high-tech purity.' },
    ],
    typographyEvolution: [
      { era: '2003 - Present', fontName: 'TESLA Custom Geometric Display', style: 'Segmented Futuristic Sans', rationale: 'Engineered with 45-degree angle cuts and open geometric terminals mirroring solar panels and circuit traces.' },
    ],
    keyMilestones: [
      { year: '2006', headline: 'The Secret Master Plan', summary: 'Musk published the 4-step mission publicly on the Tesla blog, establishing total strategic transparency.', takeaway: 'A clear, bold master plan turns early adopters into passionate evangelists.' },
      { year: '2012', headline: 'The Model S Launch', summary: 'Won MotorTrend Car of the Year unanimously, proving EVs could be the safest and most exhilarating sedans in automotive history.', takeaway: 'Win over critics by producing a product that is objectively 10x better, not marginally cheaper.' },
    ],
    actionableLessons: [
      {
        lessonTitle: 'Embed Scientific Meaning in Your Logomark',
        explanation: 'The Tesla "T" is not just a letter; it’s an engineering schematic of an electric induction motor.',
        actionableStepForYourBrand: 'Infuse your visual mark with a double meaning that reflects your proprietary process, technology, or core philosophy.',
      },
      {
        lessonTitle: 'The Master Plan as Marketing',
        explanation: 'Tesla spends $0 on traditional television advertisements; their product roadmap and radical transparency generate infinite earned media.',
        actionableStepForYourBrand: 'Publish your brand’s 10-year vision openly. Give your community a compelling future to root for.',
      },
    ],
    starterPromptInspiration: {
      recommendedMission: 'Pioneering breakthrough autonomous robotics and sustainable energy grids to accelerate the planetary transition to clean abundance.',
      recommendedAesthetic: 'Futuristic & High-Tech',
      recommendedTargetAudience: 'Tech pioneers, aerospace engineers, and forward-looking innovators seeking high-performance sustainability.',
      recommendedIndustry: 'Deep Tech & Autonomous Systems',
    },
  },
  {
    id: 'airbnb',
    brandName: 'Airbnb',
    tagline: 'Belong Anywhere',
    foundingYear: 2008,
    founders: ['Brian Chesky', 'Joe Gebbia', 'Nathan Blecharczyk'],
    headquarters: 'San Francisco, California, USA',
    industry: 'Travel, Hospitality & Experience Marketplaces',
    category: 'Tech & Software',
    originStory:
      'Design school graduates Brian Chesky and Joe Gebbia couldn’t afford their San Francisco loft rent. When a major industrial design conference came to town and hotels booked out, they inflated 3 airbeds on their living room floor and offered guests homemade pop-tarts and "AirBed & Breakfast".',
    initialStruggle:
      'Venture capitalists rejected them repeatedly, believing sleeping on strangers’ airbeds was weird and unsafe. To stay alive in 2008, the founders designed and sold $40 novelty political cereal boxes ("Obama O’s" and "Cap’n McCain’s") to fund their startup with $30,000 in cash.',
    thePivotalBreakthrough:
      'In 2014, Airbnb worked with DesignStudio to rebrand from a utilitarian lodging directory into a global universal symbol of hospitality: the "Bélo", an iconic single-line glyph combining People, Places, Love, and Airbnb.',
    coreBrandPillars: [
      {
        title: 'Belonging Over Booking',
        description: 'Transforming travel from transactional hotel room keys into living like a local and being welcomed into a home.',
      },
      {
        title: 'High-Trust Bilateral Community',
        description: 'Building mutual review systems and verified identities that overcome ancient tribal stranger-danger fears.',
      },
      {
        title: 'Founder-Led Design Rigor',
        description: 'Treating the entire company culture, app UI, and host onboarding through an industrial designer’s lens of empathy and storytelling.',
      },
    ],
    logoEvolution: [
      {
        era: '2008 - 2014',
        title: 'AirBed&Breakfast / Blue Bubble Wordmark',
        description: 'A blue-and-pink bubble font logo with glossy Web 2.0 gradients typical of early Y Combinator prototypes.',
        keyDesignChanges: ['Glossy bubble typography', 'Dual-color pink/blue scheme', 'Casual startup aesthetic'],
        imageUrl: "",
      },
      {
        era: '2014 - Present',
        title: 'The Bélo (Universal Belonging)',
        description: 'Designed by DesignStudio. An iconic continuous loop uniting 4 core symbols: a person (arms open), a location pin (places), a heart (love), and the letter "A" (Airbnb).',
        keyDesignChanges: ['The Rausch Coral color introduction', 'Continuous single-stroke loop geometry', 'Open-source symbol anyone can draw'],
        imageUrl: "https://logo.clearbit.com/airbnb.com",
      },
    ],
    colorPaletteHeritage: [
      { name: 'Rausch Coral Red', hex: '#FF5A5F', role: 'Dominant (60%)', psychology: 'Warmth, love, hospitality, energy, and unmissable human emotion.' },
      { name: 'Babu Teal', hex: '#00A699', role: 'Structural (30%)', psychology: 'Trust, refreshing wanderlust, coastal serenity.' },
      { name: 'Fog Soft White', hex: '#F7F7F7', role: 'Accent (10%)', psychology: 'Cleanliness, airy spatial layouts, visual comfort.' },
    ],
    typographyEvolution: [
      { era: '2008 - 2014', fontName: 'VAG Rounded', style: 'Soft Rounded Sans', rationale: 'Playful and unpretentious startup utility.' },
      { era: '2018 - Present', fontName: 'Airbnb Cereal', style: 'Bespoke Functional Sans', rationale: 'Named in honor of the "Obama O’s" cereal boxes that saved the company; designed for razor-sharp multi-device UI legibility.' },
    ],
    keyMilestones: [
      { year: '2009', headline: 'The Professional Photography Pivot', summary: 'Founders rented a $5,000 camera and visited New York hosts in person to photograph apartments, immediately doubling weekly revenue.', takeaway: 'High-fidelity visual aesthetics directly drive trust and transaction conversion.' },
      { year: '2014', headline: 'The "Bélo" Launch', summary: 'Invited millions of users worldwide to customize their own Bélo glyph, turning the logo into an open community badge.', takeaway: 'A great brand symbol is simple enough for any customer to draw from memory.' },
    ],
    actionableLessons: [
      {
        lessonTitle: 'The Story Behind the Symbol',
        explanation: 'Airbnb created a video explaining how the Bélo merges a person, a place, a heart, and an A. The story gave the abstract shape immense emotional gravity.',
        actionableStepForYourBrand: 'Write a 3-sentence symbolic rationale for your logomark. What hidden metaphors live inside its contours?',
      },
      {
        lessonTitle: 'Do Things That Don’t Scale',
        explanation: 'Paul Graham told Airbnb founders to visit every host in person. Quality and customer intimacy in early days trump automated vanity metrics.',
        actionableStepForYourBrand: 'Reach out to your first 10 customers with obsessive personal care to understand their deepest emotional needs.',
      },
    ],
    starterPromptInspiration: {
      recommendedMission: 'Connecting global travelers with authentic, host-curated neighborhood residences that foster genuine human belonging and cultural immersion.',
      recommendedAesthetic: 'Sophisticated & Editorial',
      recommendedTargetAudience: 'Curious global travelers, digital nomads, and cultural seekers who prioritize authenticity over corporate hotels.',
      recommendedIndustry: 'Travel & Experiential Hospitality',
    },
  },
  {
    id: 'chanel',
    brandName: 'Chanel',
    tagline: 'A girl should be two things: classy and fabulous',
    foundingYear: 1910,
    founders: ['Gabrielle "Coco" Chanel'],
    headquarters: 'Paris, France',
    industry: 'Haute Couture, Luxury Fashion & Fragrance',
    category: 'Luxury & Fashion',
    originStory:
      'Gabrielle Chanel opened a small millinery boutique at 21 Rue Cambon in Paris named "Chanel Modes". She rebelled against the suffocating, corset-bound Belle Époque fashion of the era, borrowing menswear jersey fabrics and relaxed silhouettes to give women physical freedom and timeless elegance.',
    initialStruggle:
      'Jersey fabric was considered low-class, used strictly for men’s underwear. Chanel transformed it into high fashion out of necessity during WWI fabric shortages.',
    thePivotalBreakthrough:
      'In 1921, she launched Chanel No. 5—the first synthetic aldehyde luxury perfume in a stark, clinical laboratory flask that defied ornate crystal perfume bottles. In 1925, she created the interlocking "CC" monogram, inspired by the stained glass geometric curves of the Aubazine Abbey orphanage where she grew up.',
    coreBrandPillars: [
      {
        title: 'Timeless Liberation Over Fleeting Trends',
        description: 'Fashion passes, style remains. Liberating women with functional, comfortable, enduring silhouettes (The Little Black Dress, The Tweed Jacket).',
      },
      {
        title: 'The Stark Power of Monochromatic Contrast',
        description: 'Black and white as the ultimate supreme colors of light, depth, and eternal chic.',
      },
      {
        title: 'Uncompromising French Métiers d’Art Craftsmanship',
        description: 'Preserving master artisan ateliers (embroidery, featherwork, goldsmithing, shoemaking) across generations.',
      },
    ],
    logoEvolution: [
      {
        era: '1925 - Present',
        title: 'The Interlocking Double-C Monogram',
        description: 'Designed personally by Coco Chanel. Two mirrored, perfectly overlapping sans-serif letter "C"s based on the Romanesque curves of Aubazine Abbey.',
        keyDesignChanges: ['Mathematical geometric circular perfection', 'Unaltered for over a century', 'Unmatched status of luxury elegance'],
        imageUrl: "https://logo.clearbit.com/chanel.com",
      },
    ],
    colorPaletteHeritage: [
      { name: 'Absolute Noir (Black)', hex: '#000000', role: 'Dominant (60%)', psychology: 'Absolute elegance, mystery, dramatic presence, timeless authority.' },
      { name: 'Pure Blanc (White)', hex: '#FFFFFF', role: 'Structural (30%)', psychology: 'Purity, radiance, crisp Parisian light, pristine clarity.' },
      { name: 'Cambon Gold Accent', hex: '#D4AF37', role: 'Accent (10%)', psychology: 'Haute horology, chain-strap luxury, gilded French opulence.' },
    ],
    typographyEvolution: [
      { era: '1910 - Present', fontName: 'CHANEL Custom Geometric Sans', style: 'High-Contrast Clean Capitalized Sans', rationale: 'Bold, unadorned, egalitarian uppercase lettering that strips away baroque serif flourishes.' },
    ],
    keyMilestones: [
      { year: '1921', headline: 'The Launch of Chanel No. 5', summary: 'Chose sample number 5 presented by master perfumer Ernest Beaux; packaged it in a clean pharmaceutical glass flask.', takeaway: 'Contrasting a luxurious formula with an austere, understated container amplifies its intrigue.' },
      { year: '1926', headline: 'Vogue Proclaims the Little Black Dress', summary: 'Transformed black from a color of mourning into the uniform of the modern independent woman, dubbed the "Ford of fashion".', takeaway: 'True icons recontextualize ordinary cultural tropes into high-status staples.' },
      { year: '1983', headline: 'Karl Lagerfeld’s Reinvention', summary: 'Lagerfeld took the helm and remixed Coco’s signature codes (tweed, chains, pearls, CCs) with pop culture edge.', takeaway: 'Protect your brand codes with religious zeal, but play with their execution playfully.' },
    ],
    actionableLessons: [
      {
        lessonTitle: 'The Strength of Monochromatic Discipline',
        explanation: 'Chanel never relies on loud neon gradients. Pure black, white, and a touch of gold have sustained over 110 years of supreme prestige.',
        actionableStepForYourBrand: 'Test your brand palette in pure high-contrast black and white. If your branding fails without color, refine its layout and typography first.',
      },
      {
        lessonTitle: 'Build Repeatable Brand Codes',
        explanation: 'Chanel has 5 untouchable codes: The CC mark, the tweed fabric, the camellia flower, the quilted leather, and the chain strap.',
        actionableStepForYourBrand: 'Define 3 distinct visual or physical "codes" unique to your customer experience that instantly identify you without a name.',
      },
    ],
    starterPromptInspiration: {
      recommendedMission: 'Handcrafting timeless, heirloom luxury goods and fragrances that celebrate classic craftsmanship, monochromatic sophistication, and enduring personal grace.',
      recommendedAesthetic: 'Heritage & Luxury',
      recommendedTargetAudience: 'Connoisseurs of fine art, luxury collectors, and fashion leaders seeking timeless French elegance.',
      recommendedIndustry: 'Haute Couture & Luxury Goods',
    },
  },
];
