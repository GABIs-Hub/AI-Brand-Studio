import DOMPurify from 'dompurify';

/**
 * Sanitizes AI-generated or user-supplied SVG markup before it is rendered
 * into the DOM via dangerouslySetInnerHTML. Strips scripts, event handlers,
 * active content, and external references while preserving the SVG rendering
 * surface used across the brand dashboards.
 */
export function sanitizeSvg(svg: string | undefined | null): string {
  if (!svg) return '';
  try {
    return DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
      FORBID_TAGS: ['foreignObject', 'iframe', 'object', 'embed', 'script'],
      FORBID_ATTR: [
        'onload',
        'onerror',
        'onclick',
        'ondblclick',
        'onmousedown',
        'onmouseup',
        'onmouseover',
        'onmouseout',
        'onmousemove',
        'onfocus',
        'onblur',
        'onkeydown',
        'onkeyup',
        'onkeypress',
      ],
    });
  } catch {
    return '';
  }
}