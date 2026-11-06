import { aiEngine } from "../../ai/engine";
import { sendApiError, sendInternalApiError } from "../../security/requestSecurity";
import type { Express } from "express";
import type { AiRouteDependencies } from "./types";

export function registerGenerateSocialImageRoute(app: Express, { imageRateLimiter }: AiRouteDependencies): void {
  app.post("/api/generate-social-image", imageRateLimiter, async (req, res) => {
    try {
      const { prompt, aspectRatio } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return sendApiError(res, 400, "VALIDATION_ERROR", "Image prompt is required.");
      }

      const validAspectRatio = ["1:1", "9:16", "4:3", "16:9", "3:4"].includes(aspectRatio)
        ? aspectRatio
        : "1:1";

      try {
        const result = (await aiEngine.executeImage("social_image", {
          prompt: `High-end editorial aesthetic background photograph for social media template: ${prompt}. Atmospheric, sophisticated lighting, artistic depth of field, minimalist composition.`,
          aspectRatio: validAspectRatio as any,
          preferred: req.body?.provider,
        })).output;
        if (result) {
          return res.json({ imageUrl: result.imageUrl, engine: result.engine });
        }
      } catch (imgErr: any) {
        console.warn("[AI Gateway] Social visual generation failed, engaging SVG fallback:", imgErr?.message || imgErr);
      }

      const isStory = validAspectRatio === "9:16";
      const width = isStory ? 720 : 1080;
      const height = isStory ? 1280 : 1080;

      const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <defs>
          <radialGradient id="meshGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#1E293B" />
            <stop offset="50%" stop-color="#0F172A" />
            <stop offset="100%" stop-color="#020617" />
          </radialGradient>
          <pattern id="dotPattern" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.06)" />
          </pattern>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#meshGrad)" />
        <rect width="${width}" height="${height}" fill="url(#dotPattern)" />
        <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${width * 0.35}" fill="none" stroke="rgba(99,102,241,0.12)" stroke-width="1.5" />
        <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${width * 0.45}" fill="none" stroke="rgba(99,102,241,0.06)" stroke-width="1" />
      </svg>`;

      const base64Bg = Buffer.from(bgSvg).toString("base64");
      const fallbackBgUrl = `data:image/svg+xml;base64,${base64Bg}`;
      return res.json({ imageUrl: fallbackBgUrl });
    } catch (error: any) {
      console.error("Error generating social visual image:", error);
      return sendInternalApiError(res, error, "Failed to generate AI social post artwork.");
    }
  });
}
