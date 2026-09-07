import { describe, it, expect } from 'vitest';
import { resolveAuthSecret, AUTH_SECRET_MIN_LENGTH } from './auth';

describe('resolveAuthSecret', () => {
  it('falls back to the dev secret outside production when nothing is set', () => {
    const secret = resolveAuthSecret('development', undefined);
    expect(secret).toBeTruthy();
    expect(secret.length).toBeGreaterThan(0);
  });

  it('prefers a configured secret in development', () => {
    const custom = 'my-local-secret';
    expect(resolveAuthSecret('development', custom)).toBe(custom);
  });

  it('accepts a long enough secret in production', () => {
    const good = 'a'.repeat(AUTH_SECRET_MIN_LENGTH);
    expect(resolveAuthSecret('production', good)).toBe(good);
  });

  it('throws in production when the secret is missing', () => {
    expect(() => resolveAuthSecret('production', undefined)).toThrow(/AUTH_SECRET/);
  });

  it('throws in production when the secret is too short', () => {
    expect(() => resolveAuthSecret('production', 'short-secret')).toThrow(/AUTH_SECRET/);
  });
});
