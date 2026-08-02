import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client lazily or safely
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Generate Brand Bible Endpoint
app.post("/api/generate-brand", async (req, res) => {
  try {
    const { brandName, mission, industry, aesthetic, targetAudience } = req.body;

    if (!mission || typeof mission !== "string" || mission.trim().length === 0) {
      return res.status(400).json({ error: "Mission statement is required." });
    }

    const ai = getGeminiClient();

    const prompt = `
You are an world-class Creative Director and Brand Strategist at an award-winning identity firm.
Your task is to generate a comprehensive, cohesive, professional "Brand Bible" for a brand based on the following input brief:

${brandName ? `Brand Name: ${brandName}` : "Brand Name: Please invent a memorable, premium, distinctive brand name appropriate for the mission."}
Industry / Category: ${industry || "Auto-detect from mission"}
Aesthetic Vibe: ${aesthetic || "Modern, Clean, High-Contrast"}
Mission & Purpose: ${mission}
Target Audience: ${targetAudience || "General discerning audience"}

REQUIREMENTS FOR GENERATED BRAND BIBLE:
1. Brand Core:
   - brandName (string)
   - tagline (a catchy, punchy, elegant 3-6 word slogan)
   - industry (specific category name)
   - mission (refined, polished mission statement)
   - vision (inspiring 1-2 sentence long-term vision statement)
   - positioningStatement (detailed 2-3 sentence positioning statement describing market placement, uniqueness, and value)
   - personalityTraits: Array of 4 traits. Each trait has:
     - trait (e.g., "Innovation", "Approachability", "Luxury", "Authority")
     - rating (1-5 score)
     - minLabel (e.g. "Traditional")
     - maxLabel (e.g. "Cutting-Edge")
   - values: Array of 4 core brand values. Each with:
     - title
     - description
     - iconName (a valid Lucide icon name like "Shield", "Zap", "Sparkles", "Heart", "Globe", "Target", "Feather", "Compass", "Layers", "Crown", "Anchor", "Flame")

2. 5-Color Hex Palette:
   Must contain EXACTLY 5 colors:
   - Primary (Main brand color)
   - Secondary (Supporting brand color)
   - Accent (Pop color for CTAs & highlights)
   - Neutral Light (Background canvas tone, clean off-white like #F8F9FA or warm ivory)
   - Neutral Dark (Text & deep structural tone like #0F172A or charcoal)
   Each color object MUST have:
   - name (descriptive name like "Electric Indigo" or "Ceramic Slate")
   - hex (valid 6-digit hex code e.g. "#2563EB")
   - rgb (e.g. "37, 99, 235")
   - role ("Primary" | "Secondary" | "Accent" | "Neutral Light" | "Neutral Dark")
   - usage (specific guidelines on where to apply this color in digital & physical media)
   - contrastNote (accessibility note e.g. "Passes AAA against Neutral Light background")

3. Typography & Google Fonts:
   - headingFont (a real Google Font name like "Plus Jakarta Sans", "Playfair Display", "Outfit", "Syne", "Cabinet Grotesk", "Fraunces", "Space Grotesk", "Outfit", "Bricolage Grotesque", "Cinzel")
   - headingFontCategory ("Serif" | "Sans-Serif" | "Display" | "Monospace")
   - headingWeights (array e.g. ["600", "700", "800"])
   - bodyFont (a clean readable Google Font name like "Inter", "Plus Jakarta Sans", "DM Sans", "Outfit", "Lora", "Merriweather", "Work Sans")
   - bodyFontCategory ("Serif" | "Sans-Serif" | "Monospace")
   - bodyWeights (array e.g. ["400", "500", "600"])
   - accentFont (optional clean monospace or serif font for labels)
   - googleFontsUrl (a valid Google Fonts CSS import link e.g. "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap")
   - rationale (why this font pairing reflects the mission and audience)
   - cssSnippet (valid CSS font-family declaration snippet)

4. Primary Logo Design:
   - primaryLogoSvg: A complete, fully valid standalone inline SVG code string (starts with '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120"...>' and ends with '</svg>'). The SVG MUST feature a crisp, modern vector icon symbol alongside the brand name in clean SVG text or geometric shapes, styled using the generated palette hex colors! It must be beautifully rendered, scalable, professional, and readable on light backgrounds.
   - concept (2-3 sentences explaining the visual mark design concept)
   - symbolism (symbolic breakdown of shapes & geometry)
   - geometryDetails (proportions, symmetry, line weight rules)
   - aiImagePrompt (detailed high-definition prompt for AI photo/graphic image generator to render a 3D glass, metallic, or vector emblem logo mockup)

5. Secondary Marks (3 marks):
   Array of 3 objects with:
   - id ("mark-1", "mark-2", "mark-3")
   - title ("Monogram / Icon", "Favicon / App Icon", "Badge / Stamp")
   - description (guidelines on where to use this mark)
   - svg (complete standalone inline SVG string with viewBox="0 0 160 160", using brand colors)

6. Tone of Voice:
   Array of 4 tone guidelines. Each with:
   - trait (e.g. "Empathetic & Warm", "Decisive & Authoritative", "Witty & Direct")
   - description
   - doExample (a sample marketing line demonstrating the correct voice)
   - dontExample (a sample line showing what to avoid)

7. Imagery Style:
   - moodboardKeywords (array of 5-6 imagery keywords e.g. ["Natural Light", "Cinematic Depth", "Minimalist Architecture", "Tactile Textures"])
   - photographyGuidance (paragraph describing photo direction, lighting, color grading, and composition)
   - dos (array of 3 photography guidelines)
   - donts (array of 3 photography mistakes to avoid)

Ensure all JSON fields are complete, well-formed, and strictly follow the schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Failed to receive structured response from Gemini.");
    }

    const brandData = JSON.parse(responseText);
    brandData.id = "brand-" + Date.now();
    brandData.createdAt = new Date().toISOString();

    return res.json(brandData);
  } catch (error: any) {
    console.error("Error generating brand bible:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate brand bible identity.",
    });
  }
});

// 3. Generate High-Res Logo Image Endpoint using gemini-3.1-flash-image
app.post("/api/generate-logo-image", async (req, res) => {
  try {
    const { prompt, resolution } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Image prompt is required." });
    }

    const ai = getGeminiClient();
    const validResolution = ["512px", "1K", "2K", "4K"].includes(resolution)
      ? resolution
      : "1K";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: {
        parts: [
          {
            text: `High-resolution professional vector graphic logo mockup, studio lighting, clean white studio backdrop, vector minimalist style: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: validResolution,
        },
      },
    });

    let imageUrl: string | null = null;
    const candidates = response.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      return res
        .status(500)
        .json({ error: "Model did not output image binary data." });
    }

    return res.json({ imageUrl, resolution: validResolution });
  } catch (error: any) {
    console.error("Error generating logo image:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate AI logo image.",
    });
  }
});

// 4. Multi-turn AI Brand Strategist Chat Assistant
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, brandContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    let systemInstruction = `You are a world-class AI Brand Director & Strategy Consultant. 
You help clients refine their brand identity, tagline, copy, color palettes, visual hierarchy, tone of voice, and brand guidelines.
Be insightful, actionable, elegant, professional, and clear.`;

    if (brandContext) {
      systemInstruction += `\n\nActive Brand Context:
Brand Name: ${brandContext.brandName || "N/A"}
Tagline: ${brandContext.tagline || "N/A"}
Industry: ${brandContext.industry || "N/A"}
Mission: ${brandContext.mission || "N/A"}
Colors: ${brandContext.palette?.map((c: any) => `${c.role}: ${c.hex} (${c.name})`).join(", ")}
Typography: Heading: ${brandContext.typography?.headingFont}, Body: ${brandContext.typography?.bodyFont}`;
    }

    const contents = messages.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "I'm sorry, I couldn't process that response.";
    return res.json({ reply });
  } catch (error: any) {
    console.error("Error in chat endpoint:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to complete chat response." });
  }
});

// Vite Middleware & Static Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
