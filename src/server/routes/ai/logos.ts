import { Type } from "@google/genai";
import { aiEngine } from "../../ai/engine";
import { applyLogoHistoryToEras, getLogoHistory, matchImagesToEras } from "../../logoHistory";
import { generateProceduralLogoVariations, synthesizeProceduralBrand } from "../../proceduralBrands";
import { resolveIndustryDirection } from "../../industryContext";
import { sendApiError, sendInternalApiError } from "../../security/requestSecurity";
import type { Express } from "express";
import type { AiRouteDependencies } from "./types";

export function registerGenerateLogoVariationsRoute(app: Express, { apiRateLimiter }: AiRouteDependencies): void {
  app.post("/api/generate-logo-variations", apiRateLimiter, async (req, res) => {
    try {
      const { brandName, industry, mission, palette, typography, archetypeFilter, stylePrompt } = req.body;

      if (!brandName) {
        return sendApiError(res, 400, "VALIDATION_ERROR", "Brand name is required.");
      }

      const pColor = palette?.[0]?.hex || "#1A1A1A";
      const sColor = palette?.[1]?.hex || "#2563EB";
      const aColor = palette?.[2]?.hex || "#F59E0B";
      const nlColor = palette?.[3]?.hex || "#FAF9F6";
      const ndColor = palette?.[4]?.hex || "#111827";
      const hFont = typography?.headingFont || "Plus Jakarta Sans";
      const bFont = typography?.bodyFont || "Plus Jakarta Sans";
      const industryDir = resolveIndustryDirection(industry || "Technology", mission);

      try {
          const prompt = `
  You are a master identity designer & vector craft specialist at Pentagram / Wolff Olins.
  Generate 6 distinct, stunning, production-ready logo variations tailored to the brand's industry context:
  Brand Name: "${brandName}"
  Industry: "${industry || "Modern Innovation"}" (${industryDir.name})
  Mission/Philosophy: "${mission || "Leading with craft and vision"}"
  Palette: Primary=${pColor}, Secondary=${sColor}, Accent=${aColor}, NeutralLight=${nlColor}, NeutralDark=${ndColor}
  Heading Font: ${hFont}
  Industry Logo Guidance: ${industryDir.logoGeometryGuidance}
  Industry Recommended Archetypes: ${industryDir.logoArchetypes.join(', ')}
  ${stylePrompt ? `Special Aesthetic Direction: ${stylePrompt}` : ""}

  FOR EACH LOGO VARIATION:
  Create a complete, clean SVG string (viewBox="0 0 320 100", width="100%", height="100%") matching one of the 6 archetypes:
  1. "negative_space" (clever optical illusion cutout)
  2. "interlocking_monogram" (woven ribbon curves, golden ratio)
  3. "abstract_emblem" (3D kinetic prism / isometric geometric metaphor)
  4. "architectural_badge" (concentric rings, radial ticks, certified seal)
  5. "geometric_minimalist" (Bauhaus precision strokes)
  6. "modern_wordmark" (responsive horizontal mark + letterspaced lockup)

  Return strict JSON schema with an array of variations.
  `;

          const responseText = (await aiEngine.executeText("logo_variations", {
            prompt,
            preferred: req.body?.provider,
            taskType: 'logo_vector',
            powerLevel: req.body?.powerLevel || 'pro',
            jsonSchema: {
                type: Type.OBJECT,
                properties: {
                  variations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        archetype: { type: Type.STRING },
                        archetypeLabel: { type: Type.STRING },
                        svg: { type: Type.STRING },
                        concept: { type: Type.STRING },
                        symbolism: { type: Type.STRING },
                        geometryDetails: { type: Type.STRING },
                        aiImagePrompt: { type: Type.STRING },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: [
                        "id",
                        "title",
                        "archetype",
                        "archetypeLabel",
                        "svg",
                        "concept",
                        "symbolism",
                        "geometryDetails",
                        "tags",
                      ],
                    },
                  },
                },
                required: ["variations"],
              },
          })).output;

          if (responseText) {
            const parsed = JSON.parse(responseText);
            if (parsed.variations && parsed.variations.length > 0) {
              return res.json({ variations: parsed.variations });
            }
          }
      } catch (aiError: any) {
        console.warn("[AI Gateway] Logo variations fallback engaged:", aiError?.message || aiError);
      }

      // Procedural fallback with 6 handcrafted agency archetypes
      const proceduralVariations = generateProceduralLogoVariations({
        brandName,
        industry,
        pColor,
        sColor,
        aColor,
        nlColor,
        ndColor,
        headingFont: hFont,
        bodyFont: bFont,
        logoSymbol: industryDir.logoSymbol,
        preferredArchetypes: industryDir.logoArchetypes,
        preferredArchetype: req.body?.brandArchetype,
        logoGeometryGuidance: industryDir.logoGeometryGuidance,
      });

      return res.json({ variations: proceduralVariations });
    } catch (error: any) {
      console.error("Error in /api/generate-logo-variations:", error);
      return sendInternalApiError(res, error, "Failed to generate logo variations.");
    }
  });
}

export function registerRefineLogoPromptRoute(app: Express, { apiRateLimiter }: AiRouteDependencies): void {
  app.post("/api/refine-logo-prompt", apiRateLimiter, async (req, res) => {
    try {
      const {
        brandName,
        industry,
        mission,
        aesthetic,
        targetAudience,
        archetype,
        customDirectives,
        complexityLevel,
        currentPrompt,
        palette,
        typography,
      } = req.body;

      if (!brandName) {
        return sendApiError(res, 400, "VALIDATION_ERROR", "Brand name is required.");
      }

      const pColor = palette?.[0]?.hex || "#1A1A1A";
      const sColor = palette?.[1]?.hex || "#2563EB";
      const aColor = palette?.[2]?.hex || "#F59E0B";
      const nlColor = palette?.[3]?.hex || "#FAF9F6";
      const ndColor = palette?.[4]?.hex || "#111827";
      const hFont = typography?.headingFont || "Plus Jakarta Sans";
      const bFont = typography?.bodyFont || "Plus Jakarta Sans";

      try {
          const prompt = `
  You are a legendary Creative Director, Principal Vector Architect, and Brand Semiotician at a top-tier global identity studio (Pentagram, Wolff Olins, Collins).
  Your mission is to perform deep CHAIN-OF-THOUGHT (CoT) REASONING to refine a logo prompt and generate a complex, professional-grade vector visual concept that completely transcends generic, basic shapes (no solo circles, squares, or naive clip-art).

  INPUT BRAND CONTEXT:
  Brand Name: "${brandName}"
  Industry: "${industry || "Creative Technology"}"
  Mission / Philosophy: "${mission || "Innovating with precision and craft"}"
  Aesthetic Vibe: "${aesthetic || "Modern, Clean, High-Contrast"}"
  Target Audience: "${targetAudience || "Discerning professionals and global leaders"}"
  Selected Archetype: "${archetype || "negative_space"}"
  Complexity Directive: "${complexityLevel || "intricate_geometric"}"
  ${customDirectives ? `User Custom Directives: "${customDirectives}"` : ""}
  ${currentPrompt ? `Current Prompt to Refine: "${currentPrompt}"` : ""}
  Color Palette: Primary=${pColor}, Secondary=${sColor}, Accent=${aColor}, NeutralLight=${nlColor}, NeutralDark=${ndColor}
  Typography: Heading=${hFont}, Body=${bFont}

  MANDATORY CHAIN-OF-THOUGHT STAGES:
  1. Stage 1 (Semiotic & Metaphor Deconstruction): Break down the brand's core tension, emotional resonance, and uncover 3 non-obvious visual metaphors.
  2. Stage 2 (Spatial Topology & Mathematical Grid): Design an explicit geometric blueprint (golden ratio curves, isometric 3D projections, optical negative space boolean subtractions, or interwoven ribbon splines). Explicitly ban basic primitive shapes.
  3. Stage 3 (Vector Craft & Path Synthesis): Synthesize exact SVG directives with <defs>, multi-stop linear/radial gradients, dynamic masks, smooth cubic Bézier curves (M... C... Q... Z), and responsive letterspaced wordmark lockup (viewBox="0 0 320 100").
  4. Stage 4 (Photometric 3D Studio Prompt): Formulate a hyper-detailed studio rendering prompt (materiality, lighting, caustics, macro lens, 8k render).
  5. Stage 5 (Anti-Basic Complexity Analysis): Provide an analysis explaining why this concept is agency-grade and mathematically superior to naive basic shapes.

  Return strict JSON adhering to the schema.
  `;

          const responseText = (await aiEngine.executeText("logo_refinement", {
            prompt,
            preferred: req.body?.provider,
            jsonSchema: {
                type: Type.OBJECT,
                properties: {
                  brandName: { type: Type.STRING },
                  archetype: { type: Type.STRING },
                  conceptualMetaphor: { type: Type.STRING },
                  chainOfThought: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        stepNumber: { type: Type.NUMBER },
                        stepName: { type: Type.STRING },
                        focus: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        extractedMetaphors: { type: Type.ARRAY, items: { type: Type.STRING } },
                        geometryRules: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ["stepNumber", "stepName", "focus", "reasoning"],
                    },
                  },
                  refinedVectorPrompt: { type: Type.STRING },
                  refinedStudioPrompt: { type: Type.STRING },
                  svgPathBlueprint: { type: Type.STRING },
                  visualComplexityAnalysis: { type: Type.STRING },
                  generatedSvg: { type: Type.STRING },
                  suggestedArchetypes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        archetype: { type: Type.STRING },
                        name: { type: Type.STRING },
                        rationale: { type: Type.STRING },
                      },
                      required: ["archetype", "name", "rationale"],
                    },
                  },
                },
                required: [
                  "brandName",
                  "archetype",
                  "conceptualMetaphor",
                  "chainOfThought",
                  "refinedVectorPrompt",
                  "refinedStudioPrompt",
                  "svgPathBlueprint",
                  "visualComplexityAnalysis",
                  "generatedSvg",
                ],
              },
          })).output;

          if (responseText) {
            const parsed = JSON.parse(responseText);
            return res.json(parsed);
          }
      } catch (aiError: any) {
        console.warn("[AI Gateway] CoT Logo Prompt Refinement notice:", aiError?.message || aiError);
      }

      // Procedural deterministic fallback for CoT Prompt Refinement
      const proceduralCoT = refineProceduralLogoPromptCoT({
        brandName,
        industry,
        mission,
        aesthetic,
        targetAudience,
        archetype,
        customDirectives,
        complexityLevel,
        palette,
        typography,
      });

      return res.json(proceduralCoT);
    } catch (error: any) {
      console.error("Error in /api/refine-logo-prompt:", error);
      return sendInternalApiError(res, error, "Failed to refine logo prompt.");
    }
  });
}

export function registerBrandLogoHistoryRoute(app: Express, { apiRateLimiter }: AiRouteDependencies): void {
  app.get("/api/brand-logo-history", apiRateLimiter, async (req, res) => {
    const brand = String(req.query.brand || "").trim();
    if (!brand) {
      return sendApiError(res, 400, "VALIDATION_ERROR", "brand query parameter is required.");
    }
    try {
      const history = await getLogoHistory(brand);
      if (!history) {
        return res.json({ brand, currentLogo: null, eras: [] });
      }
      // Optional era labels (pipe-separated, e.g. "1971 - 1980|1998 - 2015|2017 - Present")
      // so the archival files are matched chronologically to each era slot.
      const eras = req.query.eras
        ? String(req.query.eras)
            .split("|")
            .map((era) => ({ era: era.trim() }))
            .filter((e) => e.era.length > 0)
        : [];
      const matched = await matchImagesToEras(eras, history, brand);
      return res.json({
        brand,
        currentLogo: history.currentLogo
          ? {
              title: history.currentLogo.title,
              imageUrl: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(history.currentLogo.title)}?width=400`,
            }
          : null,
        eras: matched,
      });
    } catch (error: any) {
      console.warn("Error in /api/brand-logo-history:", error?.message || error);
      return sendApiError(res, 502, "PROVIDER_ERROR", "Archival logo lookup failed.");
    }
  });
}
