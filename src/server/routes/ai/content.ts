import { Type } from "@google/genai";
import { aiEngine } from "../../ai/engine";
import { routeTask, getDirectorStatus } from "../../aiDirector";
import { sendApiError, sendInternalApiError } from "../../security/requestSecurity";
import type { Express } from "express";
import type { AiRouteDependencies } from "./types";

export function registerGenerateViralTopicsRoute(app: Express, { apiRateLimiter }: AiRouteDependencies): void {
  app.post("/api/generate-viral-topics", apiRateLimiter, async (req, res) => {
    try {
      const { brandName, industry, mission, targetAudience, toneStyle, goal } = req.body;

      if (!brandName) {
        return sendApiError(res, 400, "VALIDATION_ERROR", "Brand name is required.");
      }

      try {
          const prompt = `
  You are a viral growth strategist and creative director who creates world-class, high-engagement content for top brands on LinkedIn, Instagram, and X.
  Generate 6 highly distinct, viral topic angles and hooks tailored specifically for:
  Brand Name: "${brandName}"
  Industry: "${industry || "Innovation"}"
  Core Mission: "${mission || "Empowering leaders with craft"}"
  Target Audience: "${targetAudience || "Modern creators and executives"}"
  Tone: "${toneStyle || "Authoritative, Insightful, Unapologetic"}"
  Campaign Goal: "${goal || "High engagement, brand authority, and community shares"}"

  Generate structured JSON matching the schema for 6 diverse hook angles:
  1. "contrarian" (challenges common industry myths)
  2. "curiosity" (surprising insight or behind-the-scenes metric)
  3. "storytelling" (the hero's journey / founding conviction)
  4. "framework" (actionable step-by-step blueprint)
  5. "future_trend" (provocative 2027+ prediction)
  6. "data_insight" (counter-intuitive data point or realization)
  `;

          const responseText = (await aiEngine.executeText("content_generation", {
            prompt,
            preferred: req.body?.provider,
            jsonSchema: {
                type: Type.OBJECT,
                properties: {
                  hooks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        headline: { type: Type.STRING },
                        hookAngle: { type: Type.STRING },
                        hookAngleLabel: { type: Type.STRING },
                        pitch: { type: Type.STRING },
                        suggestedFormat: { type: Type.STRING },
                        engagementPrediction: { type: Type.STRING },
                        targetEmotion: { type: Type.STRING },
                        sampleOutline: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestedHashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: [
                        "id",
                        "headline",
                        "hookAngle",
                        "hookAngleLabel",
                        "pitch",
                        "suggestedFormat",
                        "engagementPrediction",
                        "targetEmotion",
                        "sampleOutline",
                        "suggestedHashtags",
                      ],
                    },
                  },
                },
                required: ["hooks"],
              },
          })).output;

          if (responseText) {
            const parsed = JSON.parse(responseText);
            if (parsed.hooks && parsed.hooks.length > 0) {
              return res.json({ hooks: parsed.hooks });
            }
          }
      } catch (aiError: any) {
        console.warn("[AI Gateway] Viral topic generator notice:", aiError?.message || aiError);
      }

      // Procedural viral topics fallback
      const fallbackHooks = [
        {
          id: "hook-1",
          headline: `Why 90% of ${industry || "Industry"} Brands Are Solving the Wrong Problem in 2026`,
          hookAngle: "contrarian",
          hookAngleLabel: "The Contrarian Angle",
          pitch: "Dissects standard market assumptions and positions your brand's philosophy as the intelligent paradigm shift.",
          suggestedFormat: "carousel",
          engagementPrediction: "High Viral Potential",
          targetEmotion: "Intellectual Curiosity & Paradigm Shift",
          sampleOutline: [
            "Slide 1: The uncomfortable truth most companies ignore",
            "Slide 2: Breakdown of the 3 outdated industry habits",
            "Slide 3: Why incremental improvements no longer work",
            "Slide 4: The new framework pioneered by " + brandName,
            "Slide 5: Actionable checklist for creators to adapt today",
          ],
          suggestedHashtags: [brandName.replace(/\s+/g, ""), "BrandStrategy", "FutureOfWork", "Innovation"],
        },
        {
          id: "hook-2",
          headline: `The Unseen Craft Behind ${brandName}: What It Actually Takes to Build Enduring Quality`,
          hookAngle: "storytelling",
          hookAngleLabel: "Founding Conviction Story",
          pitch: "An authentic, deep-dive narrative revealing the trade secrets, obsessive iterations, and craftsmanship behind your work.",
          suggestedFormat: "manifesto",
          engagementPrediction: "Deep Authority & Trust",
          targetEmotion: "Respect & Authentic Connection",
          sampleOutline: [
            "Hook: What we threw in the trash before launching",
            "Story: The 14 iterations that failed our standards",
            "Philosophy: Why speed without intention is a trap",
            "Takeaway: The standard we hold ourselves to every day",
          ],
          suggestedHashtags: [brandName.replace(/\s+/g, ""), "Craftsmanship", "BehindTheScenes", "DesignSystem"],
        },
        {
          id: "hook-3",
          headline: `The 5-Step System to Master ${industry || "Design & Growth"} Without the Noise`,
          hookAngle: "framework",
          hookAngleLabel: "Actionable Framework",
          pitch: "A bulletproof, step-by-step roadmap that your audience can screenshot, bookmark, and apply immediately.",
          suggestedFormat: "carousel",
          engagementPrediction: "High Saves & Shares",
          targetEmotion: "Clarity & Empowerment",
          sampleOutline: [
            "Phase 1: Zero-noise audit",
            "Phase 2: Defining the core standard",
            "Phase 3: Relentless execution loop",
            "Phase 4: Feedback distillation",
            "Phase 5: Scalable ecosystem design",
          ],
          suggestedHashtags: [brandName.replace(/\s+/g, ""), "Playbook", "Framework", "ActionableInsights"],
        },
        {
          id: "hook-4",
          headline: `The Shift Nobody Is Talking About: Where ${industry || "Our Market"} is Headed in 2027`,
          hookAngle: "future_trend",
          hookAngleLabel: "Future Trend Forecast",
          pitch: "Positions your brand as the forward-thinking lighthouse predicting macro shifts before they become mainstream.",
          suggestedFormat: "thread",
          engagementPrediction: "High Conversation Starter",
          targetEmotion: "Anticipation & Strategic Urgency",
          sampleOutline: [
            "Trend 1: The death of generic mass-production",
            "Trend 2: The rise of radical aesthetic precision",
            "Trend 3: Why community ownership beats advertising",
            "Conclusion: How to prepare your business right now",
          ],
          suggestedHashtags: [brandName.replace(/\s+/g, ""), "FutureTrends", "IndustryForecast", "StrategicLeadership"],
        },
      ];

      return res.json({ hooks: fallbackHooks });
    } catch (error: any) {
      console.error("Error generating viral topics:", error);
      return sendInternalApiError(res, error, "Failed to generate viral topic hooks.");
    }
  });
}

export function registerChatRoute(app: Express, { apiRateLimiter }: AiRouteDependencies): void {
  app.post("/api/chat", apiRateLimiter, async (req, res) => {
    try {
      const { messages, brandContext, model, provider } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return sendApiError(res, 400, "VALIDATION_ERROR", "Messages array is required.");
      }

      const lastUserMsg = messages[messages.length - 1]?.text || "";

      try {
          let systemInstruction = `You are a world-class AI Brand Director & Strategy Consultant. 
  You help clients refine their brand identity, tagline, copy, color palettes, visual hierarchy, tone of voice, and brand guidelines.
  Be insightful, actionable, elegant, professional, and clear. Never use emojis in your responses.`;

          if (model === "gemini-3.1-pro-preview") {
            systemInstruction += `\n\n[MODE: COMPLEX STRATEGIC CRITIQUE]\nProvide multi-layered creative critiques, analyze market positioning loopholes, and offer advanced visual/verbal upgrades.`;
          } else if (model === "gemini-3.1-flash-lite") {
            systemInstruction += `\n\n[MODE: FAST COPYWRITING]\nProvide ultra-concise, punchy, high-conversion copy ideas and taglines.`;
          }

          if (brandContext) {
            systemInstruction += `\n\nActive Brand Context:
  Brand Name: ${brandContext.brandName || "N/A"}
  Tagline: ${brandContext.tagline || "N/A"}
  Industry: ${brandContext.industry || "N/A"}
  Mission: ${brandContext.mission || "N/A"}
  Colors: ${brandContext.palette?.map((c: any) => `${c.role}: ${c.hex} (${c.name})`).join(", ")}
  Typography: Heading: ${brandContext.typography?.headingFont}, Body: ${brandContext.typography?.bodyFont}`;
          }

          const transcript = messages
            .map((msg: any) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
            .join("\n\n");
          const decision = routeTask('chat_director', {
            powerLevel: model === 'gemini-3.1-flash-lite' ? 'lite' : 'pro',
            userPreferredProvider: provider,
          });
          const responseText = (await aiEngine.executeText("assistant", {
            prompt: `${transcript}\n\nAssistant:`,
            system: systemInstruction,
            preferred: provider || "auto",
            taskType: 'chat_director',
            powerLevel: model === 'gemini-3.1-flash-lite' ? 'lite' : 'pro',
          })).output;
          if (responseText) {
            return res.json({ reply: responseText, directorDecision: decision });
          }
      } catch (chatError: any) {
        console.warn("[AI Gateway] Chat fallback notice:", chatError?.message || chatError);
      }

      // Procedural brand director response fallback
      const brandName = brandContext?.brandName || "your brand";
      let proceduralReply = `Here is a strategic creative recommendation for ${brandName}:\n\n` +
        `1. **Messaging Alignment**: Ensure your value proposition highlights key differentiators rather than generic market claims.\n` +
        `2. **Visual Rhythm**: Maintain generous negative space around your primary logomark to ensure high visual hierarchy.\n` +
        `3. **Color Balance**: Keep your 60-30-10 rule active (60% Neutral canvas, 30% Primary structural tone, 10% Accent pop for CTAs).\n\n` +
        `How would you like to refine your copy or design assets next?`;

      if (lastUserMsg.toLowerCase().includes("tagline")) {
        proceduralReply = `Here are 3 refined tagline variations crafted for ${brandName}:\n\n` +
          `• "Clarity in Motion." (Minimalist & Punchy)\n` +
          `• "Engineered for Tomorrow." (Forward-Thinking Authority)\n` +
          `• "Pure Craft. Uncompromised Vision." (High-End Artisan)`;
      } else if (lastUserMsg.toLowerCase().includes("color") || lastUserMsg.toLowerCase().includes("palette")) {
        proceduralReply = `Your palette is strategically balanced for high contrast accessibility:\n\n` +
          `• **Primary Tone**: Establishes structural gravitas across headings.\n` +
          `• **Accent Tone**: Reserved strictly for high-conversion buttons and badge highlights.\n` +
          `• **Canvas Neutral**: Off-white tone preventing digital eye fatigue.`;
      }

      return res.json({ reply: proceduralReply });
    } catch (error: any) {
      console.error("Error in chat endpoint:", error);
      return sendInternalApiError(res, error, "Failed to complete chat response.");
    }
  });
}

export function registerGenerateSocialPostRoute(app: Express, { apiRateLimiter }: AiRouteDependencies): void {
  app.post("/api/generate-social-post", apiRateLimiter, async (req, res) => {
    try {
      const { brand, postType, platform, topicPrompt } = req.body;

      if (!brand || !brand.brandName) {
        return sendApiError(res, 400, "VALIDATION_ERROR", "Brand Bible context is required.");
      }

      const selectedType = postType || "thought_leadership";
      const selectedPlatform = platform || "instagram_square";

      try {
          const prompt = `
  You are an expert Social Media Creative Director and Video Strategist specializing in high-conversion, aesthetically elevated social media campaigns for premium brands on Instagram, LinkedIn, TikTok, and WhatsApp.

  Brand Name: ${brand.brandName}
  Industry: ${brand.industry}
  Tagline: ${brand.tagline}
  Mission: ${brand.mission}
  Platform Target: ${selectedPlatform} (Options: instagram_square, instagram_story, linkedin_feed, linkedin_carousel, tiktok_video, whatsapp_status, whatsapp_broadcast)
  Post Archetype: ${selectedType}
  Topic Focus: ${topicPrompt || "Core brand vision and impact"}

  CRITICAL RULE: DO NOT USE ANY EMOJIS IN ANY PART OF YOUR OUTPUT. Write clean, professional copy without emoji icons.

  Generate structured JSON matching the schema:
  1. headline (4-8 words)
  2. subheadline (6-12 words)
  3. bodyCopy (1-3 crisp sentences)
  4. badgeLabel (e.g. "Brand Manifesto", "Perspective", "Product Drop")
  5. quoteAuthor (optional)
  6. quoteRole (optional)
  7. metricNumber (optional)
  8. metricLabel (optional)
  9. callToAction (short button text)
  10. hashtags (array of 4-6 strings without #)
  11. fullCaption (complete ready-to-post caption with line breaks, zero emojis)
  12. aiImagePrompt (descriptive visual prompt)
  13. recommendedLayout ("editorial_minimal" | "bold_hero" | "split_visual" | "metrics_card" | "framed_quote" | "badge_stamp")
  14. recommendedTheme ("brand_dark" | "brand_light" | "vibrant_accent" | "contrast_primary" | "minimal_editorial")
  15. videoHookScript (for TikTok / Video: opening 3-second hook voiceover or text overlay)
  16. videoScenes (array of 3 objects with step, title, action, narration, duration)
  17. viralAudioSuggestion (audio track archetype or sound genre)
  18. whatsappMessageTemplate (clean, markdown-formatted message with bolding and call to action for WhatsApp Broadcast)
  `;

          const responseText = (await aiEngine.executeText("social_post", {
            prompt,
            preferred: req.body?.provider,
            jsonSchema: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  subheadline: { type: Type.STRING },
                  bodyCopy: { type: Type.STRING },
                  badgeLabel: { type: Type.STRING },
                  quoteAuthor: { type: Type.STRING },
                  quoteRole: { type: Type.STRING },
                  metricNumber: { type: Type.STRING },
                  metricLabel: { type: Type.STRING },
                  callToAction: { type: Type.STRING },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  fullCaption: { type: Type.STRING },
                  aiImagePrompt: { type: Type.STRING },
                  recommendedLayout: { type: Type.STRING },
                  recommendedTheme: { type: Type.STRING },
                  videoHookScript: { type: Type.STRING },
                  viralAudioSuggestion: { type: Type.STRING },
                  whatsappMessageTemplate: { type: Type.STRING },
                  videoScenes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        step: { type: Type.INTEGER },
                        title: { type: Type.STRING },
                        action: { type: Type.STRING },
                        narration: { type: Type.STRING },
                        duration: { type: Type.STRING },
                      },
                      required: ["step", "title", "action", "narration", "duration"],
                    },
                  },
                },
                required: [
                  "headline",
                  "bodyCopy",
                  "badgeLabel",
                  "callToAction",
                  "hashtags",
                  "fullCaption",
                  "aiImagePrompt",
                  "recommendedLayout",
                  "recommendedTheme",
                ],
              },
          })).output;

          if (responseText) {
            const postData = JSON.parse(responseText);
            postData.id = "post-" + Date.now();
            postData.platform = selectedPlatform;
            postData.postType = selectedType;
            postData.layout = postData.recommendedLayout || "editorial_minimal";
            postData.theme = postData.recommendedTheme || "brand_dark";
            return res.json(postData);
          }
      } catch (aiError: any) {
        console.warn("[AI Gateway] Social post generation notice:", aiError?.message || aiError);
      }

      // Procedural social post fallback with TikTok and WhatsApp awareness
      const cleanBrandName = brand.brandName.replace(/\s+/g, "");
      const cleanIndustry = (brand.industry || "Design").replace(/\s+/g, "");

      const isTikTok = selectedPlatform === "tiktok_video";
      const isWhatsApp = selectedPlatform === "whatsapp_status" || selectedPlatform === "whatsapp_broadcast";

      const postData = {
        id: "post-" + Date.now(),
        platform: selectedPlatform,
        postType: selectedType,
        layout: "editorial_minimal",
        theme: "brand_dark",
        badgeLabel: isTikTok ? "TikTok Video Concept" : isWhatsApp ? "WhatsApp Broadcast" : "Brand Perspective",
        headline: `The New Standard in ${brand.industry || "Design"}`,
        subheadline: `How ${brand.brandName} is redefining category conventions.`,
        bodyCopy: brand.positioningStatement || `We believe in relentless craftsmanship, intentional simplicity, and creating enduring value for our community.`,
        callToAction: isWhatsApp ? "Reply to Learn More" : "Read The Full Story",
        quoteAuthor: "Creative Leadership",
        quoteRole: `${brand.brandName} Studio`,
        metricNumber: "100%",
        metricLabel: "Dedicated Craftsmanship",
        hashtags: [cleanBrandName, cleanIndustry, "BrandDesign", "Innovation", "Typography", "ModernIdentity"],
        fullCaption: `Exploring the philosophy behind ${brand.brandName}.\n\n` +
          `"${brand.mission}"\n\n` +
          `In an era of fleeting trends, we anchor our vision in timeless precision and thoughtful execution.\n\n` +
          `Swipe or tap to explore our core values and design system.\n\n` +
          `#${cleanBrandName} #${cleanIndustry} #BrandDesign #CreativeDirection #Innovation`,
        aiImagePrompt: `Studio aesthetic background for ${brand.brandName}, architectural lighting, minimalist shadows, ${brand.palette?.[0]?.name || "slate"} tones`,
        videoHookScript: `Stop settling for generic solutions in ${brand.industry || "your daily workflow"}. Here is why ${brand.brandName} does things differently.`,
        viralAudioSuggestion: "Deep atmospheric lo-fi beats with ambient vinyl texture (120 BPM)",
        videoScenes: [
          {
            step: 1,
            title: "The Hook (0-3s)",
            action: `Close-up macro pan of ${brand.brandName} logomark with fast text overlay on screen.`,
            narration: `Most companies in ${brand.industry} cut corners here. We took the opposite path.`,
            duration: "3s",
          },
          {
            step: 2,
            title: "The Craft & Proof (3-12s)",
            action: "Split-screen or dynamic cut showing the tactile product details and design system precision.",
            narration: `"${brand.mission.slice(0, 120)}..."`,
            duration: "9s",
          },
          {
            step: 3,
            title: "The Takeaway & CTA (12-18s)",
            action: `Full-screen reveal of ${brand.tagline} with link in bio prompt.`,
            narration: `Follow ${brand.brandName} for the next chapter in modern craft.`,
            duration: "6s",
          },
        ],
        whatsappMessageTemplate: `*ANNOUNCEMENT FROM ${brand.brandName.toUpperCase()}*\n\n` +
          `_${brand.tagline}_\n\n` +
          `Hello everyone,\n\n` +
          `We are proud to share our latest update with our inner circle.\n\n` +
          `*Core Vision:* ${brand.mission}\n\n` +
          `• High-precision design & engineering\n` +
          `• Uncompromising materials and attention to detail\n` +
          `• Designed specifically for discerning creators\n\n` +
          `Read our full brand manifesto: https://www.${cleanBrandName.toLowerCase()}.com\n\n` +
          `Reply to this message directly if you have any questions!`,
      };

      return res.json(postData);
    } catch (error: any) {
      console.error("Error generating social post:", error);
      return sendInternalApiError(res, error, "Failed to generate social post template.");
    }
  });
}

export function registerAiDirectorStatusRoute(app: Express, { apiRateLimiter }: AiRouteDependencies): void {
  app.get("/api/ai-director/status", (_req, res) => {
    try {
      const status = getDirectorStatus();
      return res.json(status);
    } catch (error: any) {
      return sendInternalApiError(res, error, "Failed to retrieve director status.");
    }
  });
}
