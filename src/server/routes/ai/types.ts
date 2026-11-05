import type { NextFunction, Request, Response } from "express";

export interface AiRouteDependencies {
  apiRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
  imageRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
}
