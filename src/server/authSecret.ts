export const AUTH_SECRET_MIN_LENGTH = 32;

/** Resolves the signing secret without permitting a predictable fallback. */
export function resolveAuthSecret(
  nodeEnv: string | undefined,
  envSecret: string | undefined
): string {
  if (!envSecret || envSecret.length < AUTH_SECRET_MIN_LENGTH) {
    const environment = nodeEnv || 'unknown';
    throw new Error(
      `AUTH_SECRET is required in ${environment} and must be at least ${AUTH_SECRET_MIN_LENGTH} characters ` +
        '(generate with: openssl rand -base64 32). Refusing to start without it.'
    );
  }
  return envSecret;
}
