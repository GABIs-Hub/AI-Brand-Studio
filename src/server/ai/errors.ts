export type AiErrorCategory =
  | "invalid_input"
  | "authentication"
  | "authorization"
  | "rate_limit"
  | "timeout"
  | "transient_provider"
  | "provider_policy"
  | "malformed_provider_response"
  | "configuration"
  | "internal";

export class AiEngineError extends Error {
  constructor(
    message: string,
    readonly category: AiErrorCategory,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = "AiEngineError";
  }
}

export function classifyAiError(error: unknown): AiErrorCategory {
  if (error instanceof AiEngineError) return error.category;
  const message = error instanceof Error ? error.message : String(error);
  if (/401|403|invalid.*key|unauthori[sz]ed|authentication/i.test(message)) return "authentication";
  if (/429|quota|rate.?limit|resource_exhausted|insufficient_quota/i.test(message)) return "rate_limit";
  if (/timeout|timed out|ETIMEDOUT|ECONNRESET|temporar|503|unavailable|overloaded|busy/i.test(message)) {
    return "transient_provider";
  }
  if (/policy|safety|blocked|content filter|害/i.test(message)) return "provider_policy";
  if (/invalid.*(request|input)|bad request|validation/i.test(message)) return "invalid_input";
  return "internal";
}

export function normalizeAiError(error: unknown): AiEngineError {
  if (error instanceof AiEngineError) return error;
  const category = classifyAiError(error);
  const message = error instanceof Error ? error.message : String(error);
  return new AiEngineError(`AI operation failed (${category}).`, category, message);
}
