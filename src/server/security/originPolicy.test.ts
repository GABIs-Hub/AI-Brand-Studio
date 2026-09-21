import { describe, expect, it } from 'vitest';
import { isAllowedOrigin } from './originPolicy';

const allowed = ['https://trusted.example.com', 'http://localhost:3000'];

describe('isAllowedOrigin', () => {
  it('allows an exact configured origin', () => {
    expect(isAllowedOrigin('https://trusted.example.com', allowed)).toBe(true);
  });

  it('allows an explicitly configured development origin and port', () => {
    expect(isAllowedOrigin('http://localhost:3000', allowed)).toBe(true);
  });

  it('allows requests without an Origin header', () => {
    expect(isAllowedOrigin(undefined, allowed)).toBe(true);
  });

  it.each([
    'https://trusted.example.com.attacker.test',
    'https://trusted.example.com.evil.example',
    'https://trusted.example.com:444',
    'http://trusted.example.com',
    'https://attacker.trusted.example.com',
    'https://unrelated.example.test',
    'null',
    'not-an-origin',
  ])('rejects an origin that is not an exact match: %s', (origin) => {
    expect(isAllowedOrigin(origin, allowed)).toBe(false);
  });
});
