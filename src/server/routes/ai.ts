import type { Express } from "express";
import type { AiRouteDependencies } from "./ai/types";
import { registerGenerateBrandRoute } from "./ai/brand";
import { registerGenerateLogoVariationsRoute, registerRefineLogoPromptRoute, registerBrandLogoHistoryRoute } from "./ai/logos";
import { registerGenerateViralTopicsRoute, registerChatRoute, registerGenerateSocialPostRoute, registerAiDirectorStatusRoute } from "./ai/content";
import { registerAuditBrandRoute } from "./ai/audit";
import { registerGenerateLogoImageRoute, registerGenerateSocialImageRoute, registerGenerateMockupRoute } from "./ai/images";
import { registerBrandCaseStudyRoute } from "./ai/research";

export type { AiRouteDependencies } from "./ai/types";

export function registerAiRoutes(app: Express, dependencies: AiRouteDependencies): void {
  registerGenerateBrandRoute(app, dependencies);
  registerGenerateLogoVariationsRoute(app, dependencies);
  registerRefineLogoPromptRoute(app, dependencies);
  registerGenerateViralTopicsRoute(app, dependencies);
  registerAuditBrandRoute(app, dependencies);
  registerGenerateLogoImageRoute(app, dependencies);
  registerChatRoute(app, dependencies);
  registerGenerateSocialPostRoute(app, dependencies);
  registerGenerateSocialImageRoute(app, dependencies);
  registerGenerateMockupRoute(app, dependencies);
  registerBrandLogoHistoryRoute(app, dependencies);
  registerBrandCaseStudyRoute(app, dependencies);
  registerAiDirectorStatusRoute(app, dependencies);
}
