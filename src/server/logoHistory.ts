// ─────────────────────────────────────────────────────────────────────────────
// Archival logo-history enrichment (Wikimedia Commons / Wikipedia / Wikidata).
//
// The brand case-study feature previously relied on the Clearbit Logo API
// (logo.clearbit.com), which was shut down in December 2025 — every image URL
// it produced is dead. This module replaces that with Wikimedia's free,
// keyless APIs:
//
//   1. Wikipedia REST summary  → canonical title + wikibase_item id
//   2. Wikidata claim P154     → the brand's CURRENT official logo file
//   3. Commons file search     → historical logo files ("Nike logo 1978.svg")
//   4. Special:FilePath?width= → working thumbnail URLs (SVG→PNG included)
//   5. imageinfo extmetadata   → license + artist (CC attribution)
//
// Every failure degrades gracefully: callers always receive a result and the
// case study never breaks. Images are cached per brand for 24h so repeat
// research does not hammer the Wikimedia APIs.
// ─────────────────────────────────────────────────────────────────────────────

import type { BrandHistoricalLogo, LogoAttribution } from '../types';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
const WIKIPEDIA_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const USER_AGENT =
  'GABI/1.0 (brand identity studio research; https://github.com/GABIs-Hub/GABI)';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface CandidateFile {
  title: string; // "File:..."
  year?: number;
}

export interface LogoHistoryResult {
  brandName: string;
  currentLogo?: CandidateFile;
  history: CandidateFile[];
}

export interface MatchedEraImage {
  imageUrl: string;
  attribution?: LogoAttribution;
  isStylizedPlaceholder: boolean;
}

// ── Low-level HTTP helpers ───────────────────────────────────────────────────

async function fetchJson(url: string, timeoutMs = 10000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url.slice(0, 80)}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function extractYear(text: string): number | undefined {
  const m = String(text).match(/\b(19|20)\d{2}\b/);
  return m ? parseInt(m[0], 10) : undefined;
}

const IMAGE_EXTS = new Set(['png', 'svg', 'jpg', 'jpeg', 'gif', 'webp', 'ico']);

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * True when the Commons file is DIRECTLY this brand's logo (e.g. "File:Nike logo
 * 1978.svg", "File:Logo NIKE.svg", "File:The Coca-Cola logo.png") — not a
 * different company that happens to share the name ("Logo Banco Patagonia").
 */
function isDirectBrandLogo(fileTitle: string, brand: string): boolean {
  const rest = fileTitle.replace(/^file:/i, '');
  const brandPattern = escapeRegExp(brand.trim()).replace(/\s+/g, '[_\\s]');
  // Starts with the brand (optionally after "The"): "Nike logo 1978.svg"
  if (new RegExp(`^(the\\s+)?${brandPattern}`, 'i').test(rest)) return true;
  // "Logo <brand>..." or "Logo of <brand>...": "Logo NIKE.svg"
  if (new RegExp(`^logos?(\\s+(of|for)\\s+|\\s+)${brandPattern}`, 'i').test(rest)) return true;
  return false;
}

function buildImageUrl(fileTitle: string): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileTitle)}?width=400`;
}

function stripHtml(value: string): string {
  return String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// ── Wikimedia lookups ────────────────────────────────────────────────────────

async function getWikipediaSummary(brand: string): Promise<{
  title: string;
  description?: string;
  wikibaseItem?: string;
} | null> {
  // Short names like "Nike" or "Apple" often land on disambiguation pages;
  // retry with company suffixes until a real article answers.
  const attempts = [brand, `${brand} Inc.`, `${brand} Corporation`, `${brand} (company)`];
  for (const attempt of attempts) {
    try {
      const data = await fetchJson(WIKIPEDIA_SUMMARY + encodeURIComponent(attempt), 8000);
      if (data && data.type !== 'disambiguation' && data.title) {
        return {
          title: String(data.title),
          description: data.description ? String(data.description) : undefined,
          wikibaseItem: data.wikibase_item ? String(data.wikibase_item) : undefined,
        };
      }
    } catch (err) {
      console.warn('[LogoHistory] Wikipedia summary lookup failed:', (err as Error)?.message || err);
    }
  }
  return null;
}

/** Returns the brand's current logo file name via Wikidata property P154. */
async function getWikidataLogoFile(wikibaseItem: string): Promise<string | null> {
  try {
    const data = await fetchJson(
      `${WIKIDATA_API}?action=wbgetentities&ids=${encodeURIComponent(wikibaseItem)}&props=claims&format=json`
    );
    const claims = data?.entities?.[wikibaseItem]?.claims;
    const p154 = claims?.P154;
    const value = Array.isArray(p154) ? p154[0]?.mainsnak?.datavalue?.value : undefined;
    if (!value) return null;
    const name = String(value);
    return name.startsWith('File:') ? name : `File:${name}`;
  } catch (err) {
    console.warn('[LogoHistory] Wikidata P154 lookup failed:', (err as Error)?.message || err);
    return null;
  }
}

async function searchCommonsFiles(brand: string): Promise<CandidateFile[]> {
  const queries = [
    `intitle:"${brand}" intitle:"logo"`,
    `intitle:"${brand}" "logo evolution"`,
    `intitle:"${brand}" "logo history"`,
    `"logo of ${brand}"`,
    `"${brand} logo" filetype:bitmap|drawing`,
  ];
  const seen = new Map<string, CandidateFile>();
  for (const q of queries) {
    try {
      const data = await fetchJson(
        `${COMMONS_API}?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&format=json`
      );
      const pages = data?.query?.pages;
      if (!pages) continue;
      for (const page of Object.values<any>(pages)) {
        const title = page?.title;
        if (!title || !title.startsWith('File:')) continue;
        const ext = title.split('.').pop()?.toLowerCase() || '';
        if (!IMAGE_EXTS.has(ext)) continue;
        // Relevance filter: the file must clearly be a LOGO, not a photo of a
        // storefront/sign/campus that merely contains the brand name.
        const low = title.toLowerCase();
        if (!/\blogos?\b/.test(low)) continue;
        if (
          /( at | in |stadium|arena|campus|store|shop|headquarter|building|bridge|berlin|tokyo|match\b|game\b|sign\b|door|wall|billboard)/.test(low)
        ) {
          continue;
        }
        // Only files that are DIRECTLY this brand's logo (string-matched) —
        // prevents same-name companies ("Logo Banco Patagonia") or photos from
        // landing in the timeline.
        if (!isDirectBrandLogo(title, brand)) continue;
        if (!seen.has(title)) {
          seen.set(title, { title, year: extractYear(title) });
        }
      }
    } catch {
      // A single query failing must not sink the whole enrichment.
    }
  }
  return Array.from(seen.values());
}

/** Batch license/artist metadata for a set of Commons file titles. */
async function getFileMetadataBatch(fileTitles: string[]): Promise<Map<string, LogoAttribution>> {
  const result = new Map<string, LogoAttribution>();
  if (fileTitles.length === 0) return result;
  try {
    const data = await fetchJson(
      `${COMMONS_API}?action=query&titles=${encodeURIComponent(fileTitles.join('|'))}&prop=imageinfo&iiprop=extmetadata&format=json`
    );
    const pages = data?.query?.pages;
    if (!pages) return result;
    for (const page of Object.values<any>(pages)) {
      const title = page?.title;
      const meta = page?.imageinfo?.[0]?.extmetadata;
      if (!title || !meta) continue;
      const license = stripHtml(meta.LicenseShortName?.value) || 'See file page';
      let artist = stripHtml(meta.Artist?.value) || undefined;
      // Wikimedia metadata sometimes duplicates the artist text verbatim
      // ("Unknown authorUnknown author") — collapse exact repeats and drop
      // generic placeholders so attribution lines stay clean.
      if (artist) {
        if (artist.length % 2 === 0 && artist.slice(0, artist.length / 2) === artist.slice(artist.length / 2)) {
          artist = artist.slice(0, artist.length / 2);
        }
        artist = artist.replace(/^unknown\s*authors?$/i, '').trim();
        if (!artist) artist = undefined;
      }
      result.set(title, {
        fileTitle: title,
        license,
        ...(artist ? { artist } : {}),
        pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
      });
    }
  } catch (err) {
    console.warn('[LogoHistory] Commons metadata batch failed:', (err as Error)?.message || err);
  }
  return result;
}

// ── In-memory cache (per brand, 24h) ─────────────────────────────────────────

const historyCache = new Map<string, { at: number; data: LogoHistoryResult | null }>();

/** Test utility — clears the in-memory brand cache. */
export function clearLogoHistoryCache(): void {
  historyCache.clear();
}

export async function getLogoHistory(brand: string): Promise<LogoHistoryResult | null> {
  const key = brand.trim().toLowerCase();
  if (!key) return null;
  const hit = historyCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  let result: LogoHistoryResult | null = null;
  try {
    const summary = await getWikipediaSummary(brand);
    let currentLogo: CandidateFile | undefined;
    if (summary?.wikibaseItem) {
      const p154File = await getWikidataLogoFile(summary.wikibaseItem);
      if (p154File) {
        currentLogo = { title: p154File, year: new Date().getFullYear() };
      }
    }
    const history = await searchCommonsFiles(brand);
    result = { brandName: brand, currentLogo, history };
  } catch (err) {
    console.warn('[LogoHistory] Enrichment lookup failed:', (err as Error)?.message || err);
    result = null;
  }

  historyCache.set(key, { at: Date.now(), data: result });
  return result;
}

// ── Era matching + placeholder generation ────────────────────────────────────

/** Matches archival files to logo-evolution eras; fills gaps with labeled placeholders. */
export async function matchImagesToEras(
  eras: Array<{ era: string }>,
  history: LogoHistoryResult,
  brandName: string
): Promise<MatchedEraImage[]> {
  if (eras.length === 0) return [];

  // Anchor each era to an approximate year (from its label, else spread 1900→2000).
  const eraAnchors = eras.map((e, i) => ({
    i,
    anchor: extractYear(e.era) ?? 1900 + Math.round((i / Math.max(eras.length - 1, 1)) * 100),
  }));

  const assignments = new Array<CandidateFile | null>(eras.length).fill(null);

  // 1. Year-stamped files → nearest era by year.
  const yearFiles = history.history
    .filter((f) => f.year !== undefined)
    .sort((a, b) => (a.year as number) - (b.year as number));
  const used = new Set<string>();
  for (const file of yearFiles) {
    let best = -1;
    let bestDist = Infinity;
    for (const ea of eraAnchors) {
      const d = Math.abs(ea.anchor - (file.year as number));
      if (d < bestDist) {
        bestDist = d;
        best = ea.i;
      }
    }
    if (best >= 0 && assignments[best] === null) {
      assignments[best] = file;
      used.add(file.title);
    }
  }

  // 2. Leftover files fill remaining eras in order.
  const leftovers = history.history.filter((f) => !used.has(f.title));
  let li = 0;
  for (let i = 0; i < eras.length && li < leftovers.length; i++) {
    if (assignments[i] === null) {
      assignments[i] = leftovers[li++];
      used.add(leftovers[li - 1].title);
    }
  }

  // 3. The current official logo anchors the present era. If an era label
  //    explicitly reads as present/current, it wins that slot (a real "today"
  //    logo is more accurate than any dated historical file). Otherwise the
  //    current logo fills the latest era still without an image.
  if (history.currentLogo) {
    const presentIdx = eras.findIndex((e) => /present|now|current|today/i.test(e.era));
    let target = -1;
    if (presentIdx >= 0) {
      target = presentIdx;
    } else {
      for (let i = eras.length - 1; i >= 0; i--) {
        if (assignments[i] === null) {
          target = i;
          break;
        }
      }
    }
    if (target >= 0) {
      assignments[target] = history.currentLogo;
      used.add(history.currentLogo.title);
    }
  }

  // 4. Verify each assigned file actually exists on Commons (drops en.wikipedia-local files).
  const assignedTitles = assignments
    .filter((f): f is CandidateFile => f !== null)
    .map((f) => f.title);
  const metadata = await getFileMetadataBatch(assignedTitles);
  const finalAssignments = assignments.map((f) =>
    f && metadata.has(f.title) ? f : null
  );

  // 5. Build the output; gaps become clearly-labeled stylized placeholders.
  return finalAssignments.map((file, i) => {
    if (file) {
      return {
        imageUrl: buildImageUrl(file.title),
        attribution: metadata.get(file.title),
        isStylizedPlaceholder: false,
      };
    }
    return {
      imageUrl: generatePlaceholderSvg(brandName, eras[i].era),
      isStylizedPlaceholder: true,
    };
  });
}

/** Applies enrichment to a case study's logoEvolution array (never throws). */
export async function applyLogoHistoryToEras(
  logoEvolution: BrandHistoricalLogo[],
  brandName: string
): Promise<BrandHistoricalLogo[]> {
  if (!logoEvolution || logoEvolution.length === 0) return logoEvolution;
  try {
    const history = await getLogoHistory(brandName);
    if (!history) return logoEvolution;
    const matched = await matchImagesToEras(logoEvolution, history, brandName);
    return logoEvolution.map((era, i) => {
      const m = matched[i];
      if (!m) return era;
      return {
        ...era,
        imageUrl: m.imageUrl,
        attribution: m.attribution,
        isStylizedPlaceholder: m.isStylizedPlaceholder,
      };
    });
  } catch (err) {
    console.warn('[LogoHistory] Enrichment skipped:', (err as Error)?.message || err);
    return logoEvolution;
  }
}

// ── Stylized placeholder SVGs (clearly not the real logo) ────────────────────

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generatePlaceholderSvg(brandName: string, eraLabel: string): string {
  const year = extractYear(eraLabel) ?? 0;
  const isModern = year >= 1995 || /present|now|current|today|2\d{3}/i.test(eraLabel);
  const isHeritage = year > 0 && year < 1975;
  const name = escapeXml(brandName.length > 22 ? brandName.slice(0, 21) + '…' : brandName);
  const initial = escapeXml((brandName.charAt(0) || 'G').toUpperCase());

  let svg: string;
  if (isModern) {
    // Geometric monogram — the "modern" era visual language.
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" fill="#F9F7F2"/>
  <circle cx="160" cy="78" r="50" fill="none" stroke="#1A1A1A" stroke-width="3"/>
  <text x="160" y="98" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="54" font-weight="700" fill="#1A1A1A" text-anchor="middle">${initial}</text>
  <text x="160" y="140" font-family="Helvetica, Arial, sans-serif" font-size="${name.length > 14 ? 12 : 15}" letter-spacing="3" font-weight="700" fill="#1A1A1A" text-anchor="middle">${name}</text>
</svg>`;
  } else if (isHeritage) {
    // Heritage emblem — double-rule serif lockup for pre-1975 eras.
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" fill="#F9F7F2"/>
  <rect x="60" y="58" width="200" height="3" fill="#1A1A1A"/>
  <rect x="60" y="100" width="200" height="3" fill="#1A1A1A"/>
  <text x="160" y="93" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="${name.length > 14 ? 20 : 26}" font-weight="700" fill="#1A1A1A" text-anchor="middle">${name}</text>
</svg>`;
  } else {
    // Transitional lockup — bold small-caps with a single rule.
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160">
  <rect width="320" height="160" fill="#F9F7F2"/>
  <text x="160" y="86" font-family="Georgia, 'Times New Roman', serif" font-size="${name.length > 14 ? 22 : 30}" font-weight="700" fill="#1A1A1A" text-anchor="middle" letter-spacing="2">${name}</text>
  <rect x="110" y="104" width="100" height="3" fill="#1A1A1A"/>
</svg>`;
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}