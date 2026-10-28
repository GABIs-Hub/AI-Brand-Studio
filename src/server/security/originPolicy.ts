/**
 * Returns true only when the request origin is one of the explicitly allowed
 * origins. Origins are compared structurally; prefix or suffix matching is
 * intentionally not permitted.
 */
export function isAllowedOrigin(
  requestOrigin: string | undefined,
  allowedOrigins: readonly string[]
): boolean {
  // Requests without Origin are allowed for same-process clients, health
  // probes, and non-browser integrations. Browser cross-origin requests carry
  // an Origin header and are checked below.
  if (requestOrigin === undefined) return true;

  let requested: URL;
  try {
    requested = new URL(requestOrigin);
  } catch {
    return false;
  }

  return allowedOrigins.some((allowedOrigin) => {
    try {
      const allowed = new URL(allowedOrigin);
      return requested.origin === allowed.origin;
    } catch {
      return false;
    }
  });
}
