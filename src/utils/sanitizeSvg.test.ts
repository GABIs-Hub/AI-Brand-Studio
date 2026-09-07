import { describe, it, expect } from 'vitest';
import { sanitizeSvg } from './sanitizeSvg';

describe('sanitizeSvg', () => {
  it('returns empty string for null/undefined', () => {
    expect(sanitizeSvg(null)).toBe('');
    expect(sanitizeSvg(undefined)).toBe('');
  });

  it('keeps a clean SVG intact', () => {
    const svg = '<svg viewBox="0 0 100 100"><rect width="50" height="50" fill="#2563EB"/></svg>';
    const out = sanitizeSvg(svg);
    expect(out).toContain('<svg');
    expect(out).toContain('viewBox');
    expect(out).toContain('#2563EB');
  });

  it('strips <script> tags', () => {
    const svg = '<svg><script>alert("pwned")</script><rect fill="red"/></svg>';
    expect(sanitizeSvg(svg)).not.toContain('script');
  });

  it('strips on* event handler attributes', () => {
    const svg = '<svg onload="alert(1)"><rect onclick="steal()" fill="red"/></svg>';
    const out = sanitizeSvg(svg);
    expect(out).not.toContain('onload');
    expect(out).not.toContain('onclick');
  });

  it('strips javascript: URLs', () => {
    const svg = '<svg><a href="javascript:alert(1)">x</a><rect fill="red"/></svg>';
    expect(sanitizeSvg(svg)).not.toContain('javascript:');
  });

  it('keeps standard presentation attributes', () => {
    const svg = '<svg><path d="M0 0L10 10" stroke="#111827" stroke-width="2" fill="none"/></svg>';
    const out = sanitizeSvg(svg);
    expect(out).toContain('stroke="#111827"');
    expect(out).toContain('stroke-width');
  });
});