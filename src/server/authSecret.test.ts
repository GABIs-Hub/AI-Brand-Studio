import { describe, expect, it } from 'vitest';
import { AUTH_SECRET_MIN_LENGTH, resolveAuthSecret } from './authSecret';

describe('resolveAuthSecret', () => {
  it('fails in explicit local development when the secret is missing', () => {
    expect(() => resolveAuthSecret('development', undefined)).toThrow(/AUTH_SECRET/);
  });

  it('prefers a configured secret in development', () => {
    const custom = 'a'.repeat(AUTH_SECRET_MIN_LENGTH);
    expect(resolveAuthSecret('development', custom)).toBe(custom);
  });

  it.each(['staging', 'preview', 'production'])(
    'fails in deployed environment %s when the secret is missing',
    (environment) => {
      expect(() => resolveAuthSecret(environment, undefined)).toThrow(/AUTH_SECRET/);
    }
  );

  it('does not activate a fallback for an unknown environment', () => {
    expect(() => resolveAuthSecret(undefined, undefined)).toThrow(/AUTH_SECRET/);
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
