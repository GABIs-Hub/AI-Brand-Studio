import { Type } from "@google/genai";
import { aiEngine } from "../../ai/engine";
import { generateProceduralLogoVariations, synthesizeProceduralBrand } from "../../proceduralBrands";
import { resolveIndustryDirection } from "../../industryContext";
import { routeTask, getDirectorStatus } from "../../aiDirector";
import { sendApiError, sendInternalApiError } from "../../security/requestSecurity";
import type { Express } from "express";
import type { AiRouteDependencies } from "./types";

export function registerGenerateBrandRoute(app: Express, { apiRateLimiter }: AiRouteDependencies): void {
  app.post("/api/generate-brand", apiRateLimiter, async (req, res) => {
    try {
      const {
        brandName,
        mission,
        industry,
        aesthetic,
        targetAudience,
        isExistingBrandRefresh,
        existingColors,
        existingTagline,
        baseBrandId,
        previousVersionDetails,
        isRebrand,
        currentLogo,
        currentLogoType,
        currentTypography,
        preferredTypography,
        rebrandMode,
        customRebrandPrompt,
        // GABI Brand Intelligence & Contextual parameters
        powerLevel = 'pro',
        productsServices,
        geographicMarket,
        brandArchetype,
        competitiveEnvironment,
        primaryColorPreference,
        tonePreference,
      } = req.body;

      if (!mission || typeof mission !== "string" || mission.trim().length === 0) {
        return sendApiError(
          res,
          400,
          "VALIDATION_ERROR",
          "Mission statement or current company core is required."
        );
      }

      const resolvedIndustry = industry?.trim() || "Independent & Cross-Industry";
      const industryDir = resolveIndustryDirection(resolvedIndustry, mission);
      const chosenColors = primaryColorPreference
        ? [primaryColorPreference, ...(existingColors || []).slice(1)]
        : existingColors;

      // Fast-path: Legacy Mode runs the high-aesthetic deterministic synthesis engine directly
      if (powerLevel === 'legacy') {
        const synthesized: any = synthesizeProceduralBrand({
          brandName,
          mission,
          industry: resolvedIndustry,
          aesthetic,
          targetAudience,
          productsServices,
          geographicMarket,
          brandArchetype,
          competitiveEnvironment,
          primaryColorPreference,
          preferredTypography,
          tonePreference,
          isExistingBrandRefresh,
          existingColors: chosenColors,
          existingTagline,
          isRebrand,
          currentLogo,
          currentLogoType,
          currentTypography,
          rebrandMode,
          customRebrandPrompt,
        });
        synthesized.powerLevel = 'legacy';
        synthesized.productsServices = productsServices;
        synthesized.geographicMarket = geographicMarket;
        synthesized.brandArchetype = brandArchetype || synthesized.brandArchetype || industryDir.logoArchetypes[0];
        synthesized.competitiveEnvironment = competitiveEnvironment;
        return res.json(synthesized);
      }

      const startTime = Date.now();
      const decision = routeTask('brand_strategy', {
        powerLevel,
        userPreferredProvider: req.body?.provider,
      });

      // Attempt AI generation across the provider gateway (routed by AI Director)
      try {
          let refreshInstruction = "Generate a brand identity from scratch.";
          if (isRebrand) {
            const modeDescription = rebrandMode === 'custom_prompt'
              ? `USER'S CUSTOM REBRAND VISION & SPECIFIC INSTRUCTIONS:\n"${customRebrandPrompt || "Modernize the brand with elevated polish and authority"}"\nExecute these specific instructions meticulously while ensuring world-class design standards.`
              : `GABI AUTONOMOUS STRATEGIC REASONING MANDATE:\nAnalyze the user's legacy brand assets below. Diagnose visual bottlenecks, outdated tropes, accessibility or contrast shortcomings, and formulate an ambitious, visionary transformation that positions this brand as an undisputed industry leader.`;

            refreshInstruction = `NOTE: THIS IS AN OFFICIAL STRATEGIC REBRAND & MODERNIZATION PROJECT.
  The user is rebranding their company/product from its previous identity to an elevated, modern new phase.

  Current Legacy Brand Assets:
  - Current Brand Name: "${brandName || "Legacy Brand"}"
  - Current Colors: ${chosenColors && chosenColors.length > 0 ? chosenColors.join(", ") : "Not specified"}
  - Current Typography: ${currentTypography ? `Heading: ${currentTypography.headingFont || "Unspecified"}, Body: ${currentTypography.bodyFont || "Unspecified"}` : "Not specified"}
  - Current Logo: ${currentLogo ? (currentLogoType === "description" ? currentLogo : "Existing logo graphic provided") : "Legacy emblem provided"}

  Strategic Mode:
  ${modeDescription}

  MANDATORY REBRAND DELIVERABLE:
  You MUST generate a cohesive 'rebrandStory' containing:
  1. 'rebrandTitle': A punchy, inspiring rebrand campaign title (e.g. "From Utility to Artistry: The Next Era of ${brandName || "Brand"}").
  2. 'rebrandBio': An inspiring, eloquent 2-3 paragraph strategic story / announcement bio ("Why We're Moving Towards This New Phase") explaining the heritage, why the company is shifting now, what the new identity represents, and how it aligns with modern customer expectations.
  3. 'strategicDiagnosis': A sharp 1-2 sentence assessment of what needed evolution in the previous identity.
  4. 'keyEvolutionPoints': 3-4 structured comparison items with 'title', 'before', 'after', and 'strategicWhy'.`;
          } else if (isExistingBrandRefresh) {
            refreshInstruction = `NOTE: THIS IS AN EXISTING BRAND REFRESH & MODERNIZATION UPGRADE.
  Preserve the user's established Brand Name ("${brandName}"), existing identity equity, and harmonize the colors/tagline without completely discarding their recognizable history.`;
            if (previousVersionDetails) {
              refreshInstruction += `
  Previous Version Context:
  - Previous Typography: ${previousVersionDetails.typography || "Not specified"}
  - Previous Logo Concept: ${previousVersionDetails.logoConcept || "Not specified"}
  - Previous Core Values: ${previousVersionDetails.values ? previousVersionDetails.values.join(", ") : "Not specified"}
  Upgrade this brand to a higher tier of modern polish and visual distinction while maintaining recognizable continuity.`;
            }
          }

          const prompt = `
  You are a world-class Creative Director and Brand Strategist at an award-winning identity design firm.
  Your task is to generate a comprehensive, highly cohesive, production-grade "Brand Bible" strictly tailored to the specific business context, industry benchmarks, and strategic requirements below.

  ${refreshInstruction}

  STRATEGIC BRIEF:
  - Brand Name: ${brandName || "Please invent a memorable, premium, distinctive brand name"}
  - Industry & Domain: ${resolvedIndustry} (${industryDir.name})
  - Core Mission & Purpose: ${mission}
  - Products & Services: ${productsServices || "High-craft core offerings aligned with mission"}
  - Target Audience & User Persona: ${targetAudience || "Discerning modern clients and practitioners"}
  - Geographic / Cultural Market: ${geographicMarket || "Global / Prime Metropolitan"}
  - Competitive Landscape: ${competitiveEnvironment || "Fast-moving, quality-conscious landscape requiring unmistakable differentiation"}
  - Preferred Brand Archetype: ${brandArchetype || industryDir.logoArchetypes[0]} (Alternatives: ${industryDir.logoArchetypes.join(', ')})
  - Aesthetic Vibe & Tone: ${aesthetic || "Modern, Clean, High-Contrast"} ${tonePreference ? `| Specific Tone: ${tonePreference}` : ""}
  ${existingTagline ? `- Established Tagline: ${existingTagline}` : ""}
  ${chosenColors && chosenColors.length > 0 ? `- Established Color Anchors: ${chosenColors.join(", ")}` : ""}
  ${preferredTypography?.headingFont ? `- User-Specified Preferred Heading Font: ${preferredTypography.headingFont} (from Google Fonts)` : ""}
  ${preferredTypography?.bodyFont ? `- User-Specified Preferred Body Font: ${preferredTypography.bodyFont} (from Google Fonts)` : ""}

  INDUSTRY CREATIVE INTELLIGENCE GUIDELINES:
  1. Color Architecture Philosophy:
     - Hue Family: ${industryDir.colorPhilosophy.hueFamily}
     - Palette Rationale: ${industryDir.colorPhilosophy.paletteRationale}
     - Recommended Seed Hues: ${industryDir.colorPhilosophy.suggestedSeedHues.join(', ')}
     - Surface Treatment: ${industryDir.colorPhilosophy.surfaceTreatment}
     - Follow 60-30-10 distribution (60% Neutral canvas, 30% Primary family, 10% Accent CTA pop).
     - Ensure WCAG AA compliance (Primary/Secondary >= 4.5:1 against Neutral Light; Light vs Dark >= 7:1).
  2. Typographic Rules:
     - Heading Stance: ${industryDir.typographyRules.headingStyle}
     - Body Stance: ${industryDir.typographyRules.bodyStyle}
     - Curated Reference Pairings: ${industryDir.typographyRules.recommendedPairings.map(p => `${p.heading} + ${p.body} (${p.rationale})`).join(' | ')}
  3. Logo Geometry & Vector Architecture:
     - Structural Guidance: ${industryDir.logoGeometryGuidance}
     - Target Archetypes: ${industryDir.logoArchetypes.join(', ')}
     - primaryLogoSvg MUST be an agency-quality vector SVG with <defs>, gradients or negative space/interlocking paths, viewBox="0 0 320 100".
  4. Applied Photography & Material Direction:
     - Camera & Lens: ${industryDir.photographyDirection.lens}
     - Lighting Physics: ${industryDir.photographyDirection.lighting}
     - Materials & Texture: ${industryDir.photographyDirection.materials}
     - Color Grade: ${industryDir.photographyDirection.colorGrade}

  DELIVERABLE REQUIREMENTS:
  1. Brand Core: brandName, tagline, industry, mission, vision, positioningStatement, personalityTraits (4 items with trait, rating 1-5, minLabel, maxLabel), values (4 items with title, description, iconName among Lucide icons).
  2. 5-Color Hex Palette: Exactly 5 colors (Primary, Secondary, Accent, Neutral Light, Neutral Dark) with name, hex, rgb, role, usage, contrastNote.
  3. Typography & Google Fonts: headingFont, headingFontCategory, headingWeights, bodyFont, bodyFontCategory, bodyWeights, googleFontsUrl, rationale, cssSnippet.
  4. Primary Logo Design: primaryLogoSvg, concept, symbolism, geometryDetails, aiImagePrompt.
  5. Secondary Marks: 3 marks with id, title, description, and svg (viewBox="0 0 160 160").
  6. Tone of Voice: 4 guidelines with trait, description, doExample, dontExample.
  7. Imagery Style: moodboardKeywords, photographyGuidance, dos, donts.
  8. targetAudience string.
  ${isRebrand ? "9. rebrandStory object: rebrandTitle, rebrandBio, strategicDiagnosis, keyEvolutionPoints." : ""}
  `;

          const responseText = (await aiEngine.executeText("brand_generation", {
            prompt,
            preferred: req.body?.provider,
            taskType: 'brand_strategy',
            powerLevel,
            jsonSchema: {
                type: Type.OBJECT,
                properties: {
                  brandName: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  industry: { type: Type.STRING },
                  mission: { type: Type.STRING },
                  vision: { type: Type.STRING },
                  positioningStatement: { type: Type.STRING },
                  personalityTraits: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        trait: { type: Type.STRING },
                        rating: { type: Type.NUMBER },
                        minLabel: { type: Type.STRING },
                        maxLabel: { type: Type.STRING },
                      },
                      required: ["trait", "rating", "minLabel", "maxLabel"],
                    },
                  },
                  values: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        iconName: { type: Type.STRING },
                      },
                      required: ["title", "description", "iconName"],
                    },
                  },
                  palette: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        hex: { type: Type.STRING },
                        rgb: { type: Type.STRING },
                        role: { type: Type.STRING },
                        usage: { type: Type.STRING },
                        contrastNote: { type: Type.STRING },
                      },
                      required: ["name", "hex", "rgb", "role", "usage", "contrastNote"],
                    },
                  },
                  typography: {
                    type: Type.OBJECT,
                    properties: {
                      headingFont: { type: Type.STRING },
                      headingFontCategory: { type: Type.STRING },
                      headingWeights: { type: Type.ARRAY, items: { type: Type.STRING } },
                      bodyFont: { type: Type.STRING },
                      bodyFontCategory: { type: Type.STRING },
                      bodyWeights: { type: Type.ARRAY, items: { type: Type.STRING } },
                      accentFont: { type: Type.STRING },
                      googleFontsUrl: { type: Type.STRING },
                      rationale: { type: Type.STRING },
                      cssSnippet: { type: Type.STRING },
                    },
                    required: [
                      "headingFont",
                      "headingFontCategory",
                      "headingWeights",
                      "bodyFont",
                      "bodyFontCategory",
                      "bodyWeights",
                      "googleFontsUrl",
                      "rationale",
                      "cssSnippet",
                    ],
                  },
                  logo: {
                    type: Type.OBJECT,
                    properties: {
                      primaryLogoSvg: { type: Type.STRING },
                      concept: { type: Type.STRING },
                      symbolism: { type: Type.STRING },
                      geometryDetails: { type: Type.STRING },
                      aiImagePrompt: { type: Type.STRING },
                    },
                    required: [
                      "primaryLogoSvg",
                      "concept",
                      "symbolism",
                      "geometryDetails",
                      "aiImagePrompt",
                    ],
                  },
                  secondaryMarks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        svg: { type: Type.STRING },
                      },
                      required: ["id", "title", "description", "svg"],
                    },
                  },
                  toneOfVoice: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        trait: { type: Type.STRING },
                        description: { type: Type.STRING },
                        doExample: { type: Type.STRING },
                        dontExample: { type: Type.STRING },
                      },
                      required: ["trait", "description", "doExample", "dontExample"],
                    },
                  },
                  imageryStyle: {
                    type: Type.OBJECT,
                    properties: {
                      moodboardKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                      photographyGuidance: { type: Type.STRING },
                      dos: { type: Type.ARRAY, items: { type: Type.STRING } },
                      donts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["moodboardKeywords", "photographyGuidance", "dos", "donts"],
                  },
                  targetAudience: { type: Type.STRING },
                  rebrandStory: {
                    type: Type.OBJECT,
                    properties: {
                      rebrandTitle: { type: Type.STRING },
                      rebrandBio: { type: Type.STRING },
                      strategicDiagnosis: { type: Type.STRING },
                      keyEvolutionPoints: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                            before: { type: Type.STRING },
                            after: { type: Type.STRING },
                            strategicWhy: { type: Type.STRING },
                          },
                          required: ["title", "before", "after", "strategicWhy"],
                        },
                      },
                    },
                  },
                },
                required: [
                  "brandName",
                  "tagline",
                  "industry",
                  "mission",
                  "vision",
                  "positioningStatement",
                  "personalityTraits",
                  "values",
                  "palette",
                  "typography",
                  "logo",
                  "secondaryMarks",
                  "toneOfVoice",
                  "imageryStyle",
                  "targetAudience",
                ],
              },
          })).output;

          if (responseText) {
            const brandData = JSON.parse(responseText);
            brandData.id = "brand-" + Date.now();
            brandData.createdAt = new Date().toISOString();

            // Stash context-aware fields and AI Director telemetry
            brandData.powerLevel = powerLevel;
            brandData.productsServices = productsServices;
            brandData.geographicMarket = geographicMarket;
            brandData.brandArchetype = brandArchetype || industryDir.logoArchetypes[0];
            brandData.competitiveEnvironment = competitiveEnvironment;
            brandData.photographyDirection = industryDir.photographyDirection;
            brandData.directorMetadata = {
              model: decision.modelName,
              provider: decision.selectedEngine,
              routingRationale: decision.routingRationale,
              powerLevel,
              latencyMs: Date.now() - startTime,
            };

            if (isRebrand) {
              brandData.rebrandStory = {
                isRebrand: true,
                previousBrandName: brandName,
                previousLogo: currentLogo,
                previousLogoType: currentLogoType,
                previousTypography: currentTypography,
                previousColors: chosenColors,
                rebrandMode: rebrandMode || 'impress_me',
                customPrompt: customRebrandPrompt,
                rebrandTitle: brandData.rebrandStory?.rebrandTitle || `${brandName || "Brand"}: The Next Strategic Era`,
                rebrandBio:
                  brandData.rebrandStory?.rebrandBio ||
                  `As we enter this next phase, our rebranding reflects a deliberate evolution toward elevated craftsmanship, clarity, and enduring relevance in an evolving market.`,
                strategicDiagnosis:
                  brandData.rebrandStory?.strategicDiagnosis ||
                  (rebrandMode === 'custom_prompt'
                    ? `Executed custom transformation vision: ${customRebrandPrompt}`
                    : "Diagnostic analysis modernized visual architecture and elevated brand presence for contemporary touchpoints."),
                keyEvolutionPoints:
                  brandData.rebrandStory?.keyEvolutionPoints && brandData.rebrandStory.keyEvolutionPoints.length > 0
                    ? brandData.rebrandStory.keyEvolutionPoints
                    : [
                        {
                          title: "Visual Identity & Emblem Modernization",
                          before: currentLogo ? "Legacy mark with visual friction and dated geometry" : "Initial uncalibrated logo concept",
                          after: "Sculpted vector identity with mathematical geometry and negative space harmony",
                          strategicWhy: "Ensures unmistakable recognition across digital touchpoints, app icons, and physical packaging.",
                        },
                        {
                          title: "Typographic Hierarchy & Editorial Authority",
                          before: currentTypography?.headingFont ? `Legacy ${currentTypography.headingFont} font pairing` : "System font lacking distinct brand voice",
                          after: `${brandData.typography?.headingFont || "Modern Sans"} paired with ${brandData.typography?.bodyFont || "Clean Sans"}`,
                          strategicWhy: brandData.typography?.rationale || "Elevates readability and signals premium editorial craft.",
                        },
                        {
                          title: "Color Atmosphere & Accessibility",
                          before: chosenColors?.length ? `Legacy palette (${chosenColors.join(', ')})` : "Uncalibrated primary colors",
                          after: `5-Color balanced palette with 60-30-10 distribution and WCAG AA verification`,
                          strategicWhy: "Eliminates contrast barriers while projecting contemporary sophistication.",
                        },
                      ],
                createdAt: new Date().toISOString(),
              };
            }

            return res.json(brandData);
          }
      } catch (aiError: any) {
        console.warn("[AI Gateway] Live generation failed, engaging procedural synthesis engine:", aiError?.message || aiError);
      }

      // High-quality Procedural fallback synthesis
      console.log("[Synthesis Engine] Generating brand identity deterministically...");
      const synthesized: any = synthesizeProceduralBrand({
        brandName,
        mission,
        industry: resolvedIndustry,
        aesthetic,
        targetAudience,
        productsServices,
        geographicMarket,
        brandArchetype,
        competitiveEnvironment,
        primaryColorPreference,
        preferredTypography,
        tonePreference,
        isExistingBrandRefresh,
        existingColors: chosenColors,
        existingTagline,
        isRebrand,
        currentLogo,
        currentLogoType,
        currentTypography,
        rebrandMode,
        customRebrandPrompt,
      });
      synthesized.powerLevel = powerLevel;
      synthesized.productsServices = productsServices;
      synthesized.geographicMarket = geographicMarket;
      synthesized.brandArchetype = brandArchetype || synthesized.brandArchetype || industryDir.logoArchetypes[0];
      synthesized.competitiveEnvironment = competitiveEnvironment;
      synthesized.directorMetadata = {
        model: 'GABI Procedural Architecture Engine',
        provider: 'local',
        routingRationale: `Autonomous Failover: Deterministic mathematical vector synthesis with WCAG AA compliance engaged.`,
        powerLevel,
        latencyMs: Date.now() - startTime,
      };
      return res.json(synthesized);
    } catch (error: any) {
      console.error("Critical error in /api/generate-brand:", error);
      return sendInternalApiError(res, error, "Failed to generate brand bible identity.");
    }
  });
}
