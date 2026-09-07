import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getLogoHistory,
  matchImagesToEras,
  applyLogoHistoryToEras,
  generatePlaceholderSvg,
  clearLogoHistoryCache,
  LogoHistoryResult,
} from './logoHistory';

function jsonResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as any;
}

function mockWikimediaFetch(routes: Record<string, any>) {
  const fn = vi.fn(async (url: string) => {
    for (const [needle, data] of Object.entries(routes)) {
      if (url.includes(needle)) return jsonResponse(data);
    }
    throw new Error(`Unexpected URL: ${url}`);
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

const NIKE_ROUTES = {
  'en.wikipedia.org/api/rest_v1/page/summary/': {
    title: 'Nike, Inc.',
    description: 'American sportswear corporation',
    wikibase_item: 'Q483915',
  },
  'wikidata.org/w/api.php': {
    entities: {
      Q483915: {
        claims: {
          P154: [{ mainsnak: { datavalue: { value: 'Logo NIKE.svg' } } }],
        },
      },
    },
  },
  // Batch metadata lookup (titles=...&iiprop=extmetadata)
  'iiprop=extmetadata': {
    query: {
      pages: {
        '1': {
          title: 'File:Nike logo 1978.svg',
          imageinfo: [
            {
              extmetadata: {
                LicenseShortName: { value: 'Public domain' },
                Artist: { value: 'Someone' },
              },
            },
          ],
        },
        '2': {
          title: 'File:Logo NIKE.svg',
          imageinfo: [
            { extmetadata: { LicenseShortName: { value: 'Public domain' } } },
          ],
        },
      },
    },
  },
  // Commons file search (generator=search)
  'generator=search': {
    query: {
      pages: {
        '1': { title: 'File:Nike logo 1978.svg' },
        '2': { title: 'File:Nike logo 2000.svg' },
      },
    },
  },
};

describe('logoHistory enrichment', () => {
  beforeEach(() => clearLogoHistoryCache());
  afterEach(() => vi.unstubAllGlobals());

  it('resolves the current logo (Wikidata P154) and historical files (Commons search)', async () => {
    mockWikimediaFetch(NIKE_ROUTES);
    const history = await getLogoHistory('Nike');

    expect(history).not.toBeNull();
    expect(history!.currentLogo?.title).toBe('File:Logo NIKE.svg');
    const titles = history!.history.map((f) => f.title);
    expect(titles).toContain('File:Nike logo 1978.svg');
    expect(titles).toContain('File:Nike logo 2000.svg');
  });

  it('matches year-stamped files to eras and fills gaps with labeled placeholders', async () => {
    mockWikimediaFetch(NIKE_ROUTES);
    const history = (await getLogoHistory('Nike')) as LogoHistoryResult;

    const eras = ['1964 - 1971', '1978 - 1995', '1995 - Present'].map((era) => ({ era }));
    const matched = await matchImagesToEras(eras, history, 'Nike');

    expect(matched).toHaveLength(3);

    // No archival file for the 1964 era → clearly-labeled stylized placeholder.
    expect(matched[0].isStylizedPlaceholder).toBe(true);
    expect(matched[0].imageUrl.startsWith('data:image/svg+xml')).toBe(true);

    // The 1978 file lands on the 1978 era with CC attribution.
    expect(matched[1].isStylizedPlaceholder).toBe(false);
    expect(matched[1].imageUrl).toContain('Nike%20logo%201978.svg');
    expect(matched[1].attribution?.license).toBe('Public domain');
    expect(matched[1].attribution?.pageUrl).toContain('commons.wikimedia.org');

    // The "Present" era wins the CURRENT official logo over a dated file.
    expect(matched[2].isStylizedPlaceholder).toBe(false);
    expect(matched[2].imageUrl).toContain('Logo%20NIKE.svg');
  });

  it('retries disambiguation pages with company suffixes to find the current logo', async () => {
    // "Nike" alone → disambiguation page; "Nike Inc." → the real article.
    mockWikimediaFetch({
      'page/summary/Nike%20Inc.': {
        title: 'Nike, Inc.',
        wikibase_item: 'Q483915',
      },
      'en.wikipedia.org/api/rest_v1/page/summary/': {
        type: 'disambiguation',
        title: 'Nike',
        wikibase_item: 'Q218202',
      },
      'wikidata.org/w/api.php': {
        entities: {
          Q483915: {
            claims: {
              P154: [{ mainsnak: { datavalue: { value: 'Logo NIKE.svg' } } }],
            },
          },
        },
      },
      'generator=search': { query: { pages: {} } },
      'iiprop=extmetadata': { query: { pages: {} } },
    });

    const history = await getLogoHistory('Nike');
    expect(history?.currentLogo?.title).toBe('File:Logo NIKE.svg');
  });

  it('filters out photo captures (storefronts, stadiums) that merely contain the brand name', async () => {
    mockWikimediaFetch({
      'en.wikipedia.org/api/rest_v1/page/summary/': {
        title: 'Nike, Inc.',
        wikibase_item: 'Q483915',
      },
      'wikidata.org/w/api.php': { entities: {} },
      'generator=search': {
        query: {
          pages: {
            '1': { title: 'File:Nike logo 1978.svg' },
            '2': { title: 'File:LG Nike Berlin storefront.jpg' },
            '3': { title: 'File:Nike logo at Stamford Bridge 2026.jpg' },
          },
        },
      },
      'iiprop=extmetadata': { query: { pages: {} } },
    });

    const history = (await getLogoHistory('Nike')) as LogoHistoryResult;
    const titles = history.history.map((f) => f.title);
    expect(titles).toContain('File:Nike logo 1978.svg');
    expect(titles).not.toContain('File:LG Nike Berlin storefront.jpg');
    expect(titles).not.toContain('File:Nike logo at Stamford Bridge 2026.jpg');
  });

  it('excludes logos of same-name companies (Banco Patagonia ≠ Patagonia)', async () => {
    mockWikimediaFetch({
      'en.wikipedia.org/api/rest_v1/page/summary/': {
        title: 'Patagonia, Inc.',
        wikibase_item: 'Q714509',
      },
      'wikidata.org/w/api.php': { entities: {} },
      'generator=search': {
        query: {
          pages: {
            '1': { title: 'File:Patagonia logo.svg' },
            '2': { title: 'File:Logo Banco Patagonia.svg' },
            '3': { title: 'File:Logo of Patagonia 1990.svg' },
          },
        },
      },
      'iiprop=extmetadata': { query: { pages: {} } },
    });

    const history = (await getLogoHistory('Patagonia')) as LogoHistoryResult;
    const titles = history.history.map((f) => f.title);
    expect(titles).toContain('File:Patagonia logo.svg');
    expect(titles).toContain('File:Logo of Patagonia 1990.svg');
    expect(titles).not.toContain('File:Logo Banco Patagonia.svg');
  });

  it('collapses duplicated Wikimedia artist metadata ("Unknown authorUnknown author")', async () => {
    mockWikimediaFetch({
      'en.wikipedia.org/api/rest_v1/page/summary/': { title: 'TestCo', wikibase_item: 'Q1' },
      'wikidata.org/w/api.php': { entities: { Q1: { claims: {} } } },
      'generator=search': { query: { pages: { '1': { title: 'File:TestCo logo.svg' } } } },
      'iiprop=extmetadata': {
        query: {
          pages: {
            '1': {
              title: 'File:TestCo logo.svg',
              imageinfo: [
                {
                  extmetadata: {
                    LicenseShortName: { value: 'Public domain' },
                    Artist: { value: 'Unknown authorUnknown author' },
                  },
                },
              ],
            },
          },
        },
      },
    });

    const history = (await getLogoHistory('TestCo')) as LogoHistoryResult;
    const matched = await matchImagesToEras([{ era: '2000 - Present' }], history, 'TestCo');

    expect(matched[0].attribution?.license).toBe('Public domain');
    expect(matched[0].attribution?.artist).toBeUndefined();
  });

  it('drops files that do not exist on Commons and substitutes a placeholder', async () => {
    // Metadata lookup returns nothing for the current logo → it cannot be used.
    mockWikimediaFetch({
      'en.wikipedia.org/api/rest_v1/page/summary/': {
        title: 'Small Co',
        wikibase_item: 'Q999',
      },
      'wikidata.org/w/api.php': {
        entities: {
          Q999: {
            claims: {
              P154: [{ mainsnak: { datavalue: { value: 'File:Local only.svg' } } }],
            },
          },
        },
      },
      'iiprop=extmetadata': { query: { pages: {} } },
      'generator=search': { query: { pages: {} } },
    });

    const history = (await getLogoHistory('Small Co')) as LogoHistoryResult;
    const matched = await matchImagesToEras([{ era: '2015 - Present' }], history, 'Small Co');

    expect(matched[0].isStylizedPlaceholder).toBe(true);
    expect(matched[0].attribution).toBeUndefined();
  });

  it('degrades gracefully on network failure — every era still gets a labeled placeholder', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      })
    );

    const original = [
      { era: '1985 - 1995', title: 'First Mark', description: 'd', keyDesignChanges: [] },
    ];
    // Must NOT throw even though every Wikimedia call fails.
    const out = await applyLogoHistoryToEras(original as any, 'Patagonia');

    expect(out).toHaveLength(1);
    expect(out[0].imageUrl).toMatch(/^data:image\/svg\+xml/);
    expect(out[0].isStylizedPlaceholder).toBe(true);
    // Original narrative fields survive enrichment.
    expect(out[0].title).toBe('First Mark');
    expect(out[0].era).toBe('1985 - 1995');
  });

  it('generates era-styled placeholder SVGs with escaped brand names', () => {
    const heritage = generatePlaceholderSvg('C&A <Co>', '1960 - 1975');
    expect(heritage.startsWith('data:image/svg+xml;utf8,')).toBe(true);
    expect(decodeURIComponent(heritage)).toContain('&lt;Co&gt;');

    const modern = generatePlaceholderSvg('Nike', '2015 - Present');
    expect(decodeURIComponent(modern)).toContain('<circle');

    const transitional = generatePlaceholderSvg('Acme', '1985 - 1995');
    expect(decodeURIComponent(transitional)).not.toContain('<circle');
  });
});