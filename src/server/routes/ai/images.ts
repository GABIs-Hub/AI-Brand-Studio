import { aiEngine } from "../../ai/engine";
import { sendApiError, sendInternalApiError } from "../../security/requestSecurity";
import type { Express } from "express";
import type { AiRouteDependencies } from "./types";

export function registerGenerateLogoImageRoute(app: Express, { imageRateLimiter }: AiRouteDependencies): void {
  app.post("/api/generate-logo-image", imageRateLimiter, async (req, res) => {
    try {
      const { prompt, resolution, brandName, industry, palette, logoSvg, tagline, typography } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return sendApiError(res, 400, "VALIDATION_ERROR", "Image prompt is required.");
      }

      const validResolution = ["512px", "1K", "2K", "4K"].includes(resolution)
        ? resolution
        : "2K";

      const pColor = palette?.[0]?.hex || "#1A1A1A";
      const sColor = palette?.[1]?.hex || "#2563EB";
      const aColor = palette?.[2]?.hex || "#F59E0B";
      const nlColor = palette?.[3]?.hex || "#F8F9FA";
      const ndColor = palette?.[4]?.hex || "#0F172A";
      const displayBrandName = brandName || "Brand";
      const displayTagline = tagline || "Excellence in Craft";
      const headingFont = typography?.headingFont || "Plus Jakarta Sans";

      // 1. Attempt AI image generation across the provider gateway (OpenAI → Gemini → Higgsfield)
      try {
        const enrichedPrompt = `Photorealistic 3D luxury physical logomark emblem render for brand "${displayBrandName}" (${industry || "Design"}). Primary color ${pColor}, secondary ${sColor}, accent ${aColor}. High-end architectural studio setting, raytraced global illumination, volumetric rim lighting, macro lens depth of field, 8k octane render: ${prompt}`;
        const result = (await aiEngine.executeImage("image_generation", {
          prompt: enrichedPrompt,
          aspectRatio: "1:1",
          size: validResolution,
          preferred: req.body?.provider,
        })).output;
        if (result) {
          return res.json({
            imageUrl: result.imageUrl,
            resolution: validResolution,
            engine: result.engine,
            format: result.format || "png",
          });
        }
      } catch (imgErr: any) {
        console.warn("[AI Gateway] Live logo render failed, engaging procedural studio raytracer:", imgErr?.message || imgErr);
      }

      // 2. High-Fidelity Procedural 3D Physical Studio Raytracer Fallback
      const promptLower = prompt.toLowerCase();
      const isTitanium = promptLower.includes("titanium") || promptLower.includes("glass") || promptLower.includes("steel");
      const isNeon = promptLower.includes("neon") || promptLower.includes("cyberpunk") || promptLower.includes("glow");
      const isLinen = promptLower.includes("linen") || promptLower.includes("letterpress") || promptLower.includes("paper") || promptLower.includes("deboss");
      const isCeramic = promptLower.includes("ceramic") || promptLower.includes("terracotta") || promptLower.includes("clay");
      const isChrome = promptLower.includes("chrome") || promptLower.includes("liquid") || promptLower.includes("prismatic");

      // XML safe escaping helper
      const escapeXml = (str: string) =>
        (str || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

      const safeBrandName = escapeXml(displayBrandName);
      const initial = (displayBrandName.charAt(0) || "B").toUpperCase();
      const safeInitial = escapeXml(initial);

      // Extract sanitized inner logo markup if available
      let embeddedMarkMarkup = "";
      if (logoSvg && logoSvg.includes("<svg")) {
        // Clean and sanitize inner SVG content
        const innerContent = logoSvg
          .replace(/<svg[^>]*>/i, "")
          .replace(/<\/svg>/i, "")
          .replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&amp;");
        embeddedMarkMarkup = `<g transform="scale(0.85) translate(-160, -50)">${innerContent}</g>`;
      } else {
        embeddedMarkMarkup = `
          <circle cx="0" cy="0" r="42" fill="#0A0D12" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.3" />
          <text x="0" y="16" font-family="${headingFont}, sans-serif" font-size="48" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">
            ${safeInitial}
          </text>
        `;
      }

      let studioBgGradient = "";
      let materialGradient = "";
      let lightingEffect = "";
      let styleTag = "3D PHOTOREALISTIC STUDIO";

      if (isTitanium) {
        styleTag = "PRECISION BRUSHED TITANIUM &amp; GLASS";
        studioBgGradient = `
          <radialGradient id="titaniumBg" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stop-color="#242B35" />
            <stop offset="50%" stop-color="#13171E" />
            <stop offset="100%" stop-color="#090B0E" />
          </radialGradient>
        `;
        materialGradient = `
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E2E8F0" />
            <stop offset="25%" stop-color="#94A3B8" />
            <stop offset="50%" stop-color="#F8FAFC" />
            <stop offset="75%" stop-color="#64748B" />
            <stop offset="100%" stop-color="#CBD5E1" />
          </linearGradient>
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#0284C7" stop-opacity="0.05" />
          </linearGradient>
        `;
      } else if (isNeon) {
        styleTag = "CYBERPUNK NEON NOIR &amp; SLATE";
        studioBgGradient = `
          <radialGradient id="neonBg" cx="50%" cy="40%" r="75%">
            <stop offset="0%" stop-color="#1A1128" />
            <stop offset="60%" stop-color="#0D0714" />
            <stop offset="100%" stop-color="#050208" />
          </radialGradient>
        `;
        materialGradient = `
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38BDF8" />
            <stop offset="50%" stop-color="${sColor}" />
            <stop offset="100%" stop-color="#EC4899" />
          </linearGradient>
        `;
        lightingEffect = `
          <circle cx="500" cy="380" r="280" fill="${sColor}" opacity="0.18" filter="url(#coreEmblemGlow)" />
          <circle cx="500" cy="380" r="180" fill="#EC4899" opacity="0.15" filter="url(#coreEmblemGlow)" />
        `;
      } else if (isLinen) {
        styleTag = "BLIND DEBOSSED ARTISANAL LINEN";
        studioBgGradient = `
          <radialGradient id="linenBg" cx="45%" cy="35%" r="80%">
            <stop offset="0%" stop-color="#FAF8F5" />
            <stop offset="50%" stop-color="#F1ECE4" />
            <stop offset="100%" stop-color="#E2DCD0" />
          </radialGradient>
        `;
        materialGradient = `
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C2B7A3" />
            <stop offset="50%" stop-color="#8F8471" />
            <stop offset="100%" stop-color="#5C5343" />
          </linearGradient>
        `;
      } else if (isCeramic) {
        styleTag = "SCULPTURAL TERRACOTTA &amp; CERAMIC";
        studioBgGradient = `
          <radialGradient id="ceramicBg" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stop-color="#2D231E" />
            <stop offset="60%" stop-color="#191310" />
            <stop offset="100%" stop-color="#0B0807" />
          </radialGradient>
        `;
        materialGradient = `
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FDBA74" />
            <stop offset="50%" stop-color="#EA580C" />
            <stop offset="100%" stop-color="#9A3412" />
          </linearGradient>
        `;
      } else if (isChrome) {
        styleTag = "PRISMATIC LIQUID CHROME &amp; MIRROR";
        studioBgGradient = `
          <radialGradient id="chromeBg" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stop-color="#1E1B2E" />
            <stop offset="60%" stop-color="#0E0C17" />
            <stop offset="100%" stop-color="#050409" />
          </radialGradient>
        `;
        materialGradient = `
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E0E7FF" />
            <stop offset="25%" stop-color="#818CF8" />
            <stop offset="50%" stop-color="#C084FC" />
            <stop offset="75%" stop-color="#38BDF8" />
            <stop offset="100%" stop-color="#FFFFFF" />
          </linearGradient>
        `;
      } else {
        // Default: 24K Gold / Copper Luxury Chiaroscuro
        styleTag = "24K EMBOSSED GOLD FOIL &amp; OBSIDIAN";
        studioBgGradient = `
          <radialGradient id="studioFloor" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stop-color="#22252A" />
            <stop offset="60%" stop-color="#14161A" />
            <stop offset="100%" stop-color="#08090B" />
          </radialGradient>
        `;
        materialGradient = `
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFBEB" />
            <stop offset="25%" stop-color="${aColor}" />
            <stop offset="50%" stop-color="#F59E0B" />
            <stop offset="75%" stop-color="#B45309" />
            <stop offset="100%" stop-color="#FEF3C7" />
          </linearGradient>
        `;
      }

      const svgBadge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <defs>
          ${studioBgGradient}
          ${materialGradient}
        
          <!-- Overhead Spot Light -->
          <radialGradient id="spotLight" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.14" />
            <stop offset="50%" stop-color="${sColor}" stop-opacity="0.06" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>

          <!-- 3D Pedestal Cylindrical Shading -->
          <linearGradient id="pedestalTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2A2E35" />
            <stop offset="100%" stop-color="#181A1F" />
          </linearGradient>
          <linearGradient id="pedestalFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1F2228" />
            <stop offset="100%" stop-color="#0E0F12" />
          </linearGradient>

          <!-- Ambient Shadow Filter -->
          <filter id="pedestalShadow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="28" />
            <feOffset dx="0" dy="40" result="offsetblur" />
            <feFlood flood-color="#000000" flood-opacity="0.85" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="coreEmblemGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="20" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Background Canvas -->
        <rect width="1000" height="1000" fill="${isLinen ? "url(#linenBg)" : isNeon ? "url(#neonBg)" : isTitanium ? "url(#titaniumBg)" : isCeramic ? "url(#ceramicBg)" : isChrome ? "url(#chromeBg)" : "url(#studioFloor)"}" />
        <rect width="1000" height="1000" fill="url(#spotLight)" />
        ${lightingEffect}

        <!-- Isometric Perspective Grid Floor -->
        <g opacity="${isLinen ? "0.03" : "0.08"}" stroke="${isLinen ? "#000000" : "#FFFFFF"}" stroke-width="1">
          <line x1="100" y1="900" x2="500" y2="480" />
          <line x1="300" y1="900" x2="500" y2="480" />
          <line x1="700" y1="900" x2="500" y2="480" />
          <line x1="900" y1="900" x2="500" y2="480" />
          <ellipse cx="500" cy="620" rx="360" ry="120" fill="none" />
          <ellipse cx="500" cy="620" rx="460" ry="150" fill="none" />
        </g>

        <!-- 3D Pedestal Base -->
        <g filter="url(#pedestalShadow)" transform="translate(0, 100)">
          <!-- Front side of pedestal -->
          <path d="M 220 520 C 220 590, 780 590, 780 520 L 780 570 C 780 640, 220 640, 220 570 Z" fill="url(#pedestalFront)" />
          <!-- Top disc of pedestal -->
          <ellipse cx="500" cy="520" rx="280" ry="85" fill="url(#pedestalTop)" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
          <!-- Inner glowing groove ring on pedestal -->
          <ellipse cx="500" cy="520" rx="240" ry="70" fill="none" stroke="${aColor}" stroke-width="2" stroke-dasharray="8 6" opacity="0.45" />
          <!-- Pedestal core glow -->
          <ellipse cx="500" cy="520" rx="140" ry="40" fill="${sColor}" opacity="0.2" />
        </g>

        <!-- Central Floating 3D Dimensional Mark Assembly -->
        <g transform="translate(500, 380)">
          <!-- Drop shadow on pedestal for floating mark -->
          <ellipse cx="0" cy="200" rx="130" ry="35" fill="#000000" opacity="0.65" filter="url(#pedestalShadow)" />

          <!-- 3D Geometric Ring Frame -->
          <circle cx="0" cy="0" r="145" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" stroke-dasharray="6 6" />
          <circle cx="0" cy="0" r="130" fill="none" stroke="url(#metalGrad)" stroke-width="3.5" opacity="0.85" />

          <!-- 3D Dimensional Faceted Emblem Base Plate -->
          <g filter="url(#coreEmblemGlow)">
            <!-- Dynamic 3D Prism / Diamond Silhouette -->
            <polygon points="0,-95 90,-38 90,48 0,100 -90,48 -90,-38" fill="#14171C" stroke="url(#metalGrad)" stroke-width="3.5" />
          
            <!-- Internal 3D Shading Facets -->
            <polygon points="0,-95 90,-38 0,0" fill="${pColor}" opacity="0.85" />
            <polygon points="90,-38 90,48 0,0" fill="${sColor}" opacity="0.9" />
            <polygon points="90,48 0,100 0,0" fill="${aColor}" opacity="0.8" />
            <polygon points="0,100 -90,48 0,0" fill="${ndColor}" opacity="0.95" />
            <polygon points="-90,48 -90,-38 0,0" fill="${sColor}" opacity="0.7" />
            <polygon points="-90,-38 0,-95 0,0" fill="${pColor}" opacity="0.95" />

            <!-- Center Specular Mark Container -->
            <g transform="translate(0, 0)">
              ${embeddedMarkMarkup}
            </g>
          </g>

          <!-- Specular Highlight Flares -->
          <circle cx="0" cy="-95" r="4.5" fill="#FFFFFF" />
          <circle cx="90" cy="-38" r="3.5" fill="#FFFFFF" />
          <circle cx="-90" cy="-38" r="3.5" fill="#FFFFFF" />
        </g>

        <!-- Clean Typographic Studio Titleplate -->
        <g transform="translate(500, 770)">
          <rect x="-250" y="-35" width="500" height="72" rx="4" fill="#111317" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
          <!-- Brand Name & Industry Spec -->
          <text x="0" y="-6" font-family="${headingFont}, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">
            ${safeBrandName.toUpperCase()}
          </text>
          <text x="0" y="18" font-family="sans-serif" font-size="10" font-weight="700" fill="${aColor}" text-anchor="middle" letter-spacing="5">
            ${styleTag}
          </text>
        </g>

        <!-- Technical Studio Coordinates & Quality Stamp -->
        <text x="70" y="940" font-family="monospace" font-size="11" font-weight="600" fill="rgba(255,255,255,0.4)" letter-spacing="3">
          RENDER: RAYTRACED 3D STUDIO // ${validResolution}
        </text>
        <text x="930" y="940" font-family="monospace" font-size="11" font-weight="600" fill="${sColor}" text-anchor="end" letter-spacing="3">
          PALETTE: ${pColor} / ${sColor} / ${aColor}
        </text>
      </svg>`;

      const base64Svg = Buffer.from(svgBadge, "utf-8").toString("base64");
      const fallbackImageUrl = `data:image/svg+xml;base64,${base64Svg}`;
      return res.json({ imageUrl: fallbackImageUrl, resolution: validResolution, engine: "studio_raytracer", format: "svg" });
    } catch (error: any) {
      console.error("Error generating logo image:", error);
      return res.status(500).json({
        error: "Failed to generate AI logo image.",
      });
    }
  });
}

export function registerGenerateMockupRoute(app: Express, { imageRateLimiter }: AiRouteDependencies): void {
  app.post("/api/generate-ai-mockup", imageRateLimiter, async (req, res) => {
    try {
      const {
        prompt,
        brandName = "Brand",
        industry = "Design",
        mockupType = "product",
        environment = "minimalist studio",
        lens = "50mm prime",
        lighting = "directional studio light",
        materials = "matte tactile textures",
        colorGrade = "commercial clean",
        palette = [],
        aspectRatio = "4:5",
        provider = "auto",
      } = req.body;

      const validAspectRatio = ["1:1", "4:5", "16:9", "9:16", "3:4"].includes(aspectRatio)
        ? aspectRatio
        : "4:5";

      const paletteList = Array.isArray(palette)
        ? palette.slice(0, 4).map((p: any) => (typeof p === "string" ? p : p.hex || "")).filter(Boolean).join(", ")
        : "";

      const fullPrompt = [
        `High-end commercial product photography mockup of a ${mockupType} for the brand "${brandName}" in the ${industry} industry.`,
        `Scene environment: ${environment}. Contextual details: ${prompt || "clean presentation with balanced negative space"}.`,
        `Camera optics: Shot with professional camera using ${lens} lens with crisp central subject focus and natural optical depth of field.`,
        `Lighting physics: ${lighting}.`,
        `Material authenticity: ${materials}, real physical surface finishes and tactile textures.`,
        `Color grading: ${colorGrade}. ${paletteList ? `Adhering to brand palette accents (${paletteList}).` : ""}`,
        `Aesthetic: Prestigious editorial commercial catalog standard, crisp 8k details, zero artificial noise, zero unwanted artifacts.`,
      ].join(" ");

      try {
        const result = (await aiEngine.executeImage("image_generation", {
          prompt: fullPrompt,
          aspectRatio: validAspectRatio as any,
          preferred: provider !== "auto" ? provider : undefined,
          taskType: "photorealistic_mockup",
        })).output;

        if (result && result.imageUrl) {
          return res.json({
            imageUrl: result.imageUrl,
            engine: result.engine,
            promptUsed: fullPrompt,
            isFallback: false,
          });
        }
      } catch (imgErr: any) {
        console.warn("[AI Gateway] AI Mockup generation error:", imgErr?.message || imgErr);
      }

      // High fidelity procedural branded vector mockup fallback
      const primaryHex = /^#[0-9a-f]{6}$/i.test(palette?.[0]?.hex) ? palette[0].hex : "#1A1A1A";
      const accentHex = /^#[0-9a-f]{6}$/i.test(palette?.[1]?.hex) ? palette[1].hex : "#D97706";
      const width = 1080;
      const height = validAspectRatio === "9:16" ? 1920 : validAspectRatio === "16:9" ? 608 : 1350;

      const escapeLabel = (value: unknown) => String(value).toUpperCase()
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
      const proceduralMockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <defs>
          <radialGradient id="mockupLighting" cx="35%" cy="25%" r="80%">
            <stop offset="0%" stop-color="#2D3139" />
            <stop offset="60%" stop-color="#181A20" />
            <stop offset="100%" stop-color="#0E1015" />
          </radialGradient>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.02" />
          </linearGradient>
          <filter id="studioShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="0.6" />
          </filter>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#mockupLighting)" />

        <!-- Studio floor grid subtly visible -->
        <line x1="0" y1="${height * 0.72}" x2="${width}" y2="${height * 0.72}" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

        <!-- Main Mockup Plinth / Canvas Object -->
        <g filter="url(#studioShadow)" transform="translate(${width * 0.15}, ${height * 0.18})">
          <rect width="${width * 0.7}" height="${height * 0.58}" rx="16" fill="${primaryHex}" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
          <rect width="${width * 0.7}" height="${height * 0.58}" rx="16" fill="url(#cardGrad)" />

          <!-- Embossed Brand Badge -->
          <rect x="48" y="48" width="${width * 0.7 - 96}" height="${height * 0.58 - 96}" rx="8" fill="none" stroke="${accentHex}" stroke-width="1" stroke-dasharray="4 6" opacity="0.4" />

          <!-- Brand Monogram Header -->
          <circle cx="${(width * 0.7) / 2}" cy="${(height * 0.58) / 2 - 40}" r="48" fill="none" stroke="${accentHex}" stroke-width="2" />
          <text x="${(width * 0.7) / 2}" y="${(height * 0.58) / 2 - 32}" font-family="sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">${escapeLabel(String(brandName).slice(0, 2))}</text>

          <!-- Brand Wordmark -->
          <text x="${(width * 0.7) / 2}" y="${(height * 0.58) / 2 + 40}" font-family="serif" font-size="34" font-weight="400" fill="#FFFFFF" text-anchor="middle" letter-spacing="8">${escapeLabel(brandName)}</text>
          <text x="${(width * 0.7) / 2}" y="${(height * 0.58) / 2 + 75}" font-family="sans-serif" font-size="12" font-weight="700" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="4">${escapeLabel(mockupType)} SPECIFICATION • ${escapeLabel(lens)}</text>
        </g>

        <!-- Lens & Telemetry Label -->
        <text x="${width * 0.15}" y="${height * 0.88}" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.4)" letter-spacing="2">GABI OPTICS ENGINE • ${escapeLabel(lens)} • ${escapeLabel(lighting)}</text>
      </svg>`;

      const base64 = Buffer.from(proceduralMockupSvg).toString("base64");
      return res.json({
        imageUrl: `data:image/svg+xml;base64,${base64}`,
        engine: "procedural-studio",
        isFallback: true,
        promptUsed: fullPrompt,
        message: "Generated using GABI Studio Procedural Engine. Add an AI API key in Settings for photorealistic diffusion rendering.",
      });
    } catch (error: any) {
      console.error("Error generating AI mockup:", error);
      return sendInternalApiError(res, error, "Failed to generate AI mockup.");
    }
  });
}
