# GABI — Generate. Align. Build. Inspire.

> **Turning brand ideas into complete, consistent identities.**

GABI is a production-grade **brand identity studio**: describe your idea in a sentence, and get a complete, downloadable "Brand Bible" — name, tagline, positioning, personality, values, a WCAG-validated color palette, Google Fonts pairing, vector logo suite, tone of voice, and social-ready content.

## The name

**GABI** is an acronym for what the studio does — **Generate. Align. Build. Inspire.** — and it is also the name it was built under: the acronym and the founder are two in one. Every surface in the product carries the same identity: the header wordmark, the tagline on the home screen, share snippets, pitch decks, exported asset kits, and the footer.

> **Repository rename note:** the codebase was previously published as `AI-Brand-Studio`. To match the GABI identity, rename the GitHub repository to `GABI` (Settings → rename; GitHub automatically redirects the old URL) and update the local remote with `git remote set-url origin git@github.com:GABIs-Hub/GABI.git`.

## Highlights

- **Multi-provider AI gateway** — text and image generation cascade across **OpenAI (ChatGPT) → Anthropic (Claude) → Google Gemini** for text, and **OpenAI `gpt-image-1` → Gemini Imagen → Higgsfield Flux** for images, with per-provider circuit breakers, cooldowns, timeouts, and schema-constrained output. A provider picker in the render studio, chat, and social tools lets you choose the engine per request.
- **Zero-key resilience** — a fully deterministic procedural synthesis engine generates complete brand identities (including a 6-archetype logo suite) offline, so the app never breaks without API keys.
- **Deterministic harmony color engine** — palettes are derived from a brand-seeded hue with real color-harmony schemes (analogous, complementary, triadic, split-complementary, monochromatic) and are **WCAG AA/AAA contrast-validated at generation time**.
- **Real accounts** — email/password + Google sign-in via **Auth.js**, persisted brands in **Neon Postgres**, rendered images in **Cloudflare R2**.
- **Two experience modes** — a plain-language **Simple view** for non-technical users, and an organized, explanatory **Studio view** for designers and developers.
- **Perfect dark & light mode** — every surface, card, and text token is explicitly themed; no light-mode leftovers in dark mode.

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4 |
| Server | Express (TypeScript, `tsx` in dev, esbuild-bundled in prod) |
| Database | Neon Postgres (`@neondatabase/serverless`) — JSONB brand documents + relational indexes |
| Auth | Auth.js (`@auth/express`) with credentials (email/password, bcrypt) + Google OAuth, Neon adapter, JWT sessions |
| AI text | OpenAI → Anthropic Claude → Google Gemini (fallback cascade, provider pickable per request) |
| AI images | OpenAI `gpt-image-1` → Gemini Imagen → Higgsfield Flux (with the SVG raytracer as final fallback) |
| Image storage | Cloudflare R2 (S3-compatible, presigned uploads) |
| Tests | Vitest (46 unit tests across the color engine, procedural synthesis, evolution, share, sanitization) |

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values you need (see below)
npm run dev            # http://localhost:3000
```

Everything is optional: with **no** env vars at all, the app runs fully procedurally (offline brand synthesis). Each provider you configure is added to the fallback cascade.

### Environment variables

See `.env.example` for the complete annotated list:

- **Server** — `APP_URL` (used for the same-origin API guard).
- **Database** — `DATABASE_URL` (Neon connection string). Required for accounts and cloud brand sync. The schema lives in [`db/schema.sql`](db/schema.sql).
- **Auth** — `AUTH_SECRET` (generate with `openssl rand -base64 32`); `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional).
- **AI** — `GEMINI_API_KEY`, `OPENAI_API_KEY` (+ optional `OPENAI_MODEL`, `OPENAI_IMAGE_MODEL`), `ANTHROPIC_API_KEY` (+ `ANTHROPIC_MODEL`), `HF_CREDENTIALS` (Higgsfield `KEY_ID:KEY_SECRET`, + optional `HIGGSFIELD_ENDPOINT`).
- **Images** — `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, optional `R2_PUBLIC_BASE_URL`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server (Express + Vite middleware) with HMR |
| `npm run build` | Vite client build + esbuild server bundle → `dist/` |
| `npm start` | Run the production server (`node dist/server.cjs`) |
| `npm run lint` | Typecheck (`tsc --noEmit`) |
| `npm test` | Run the Vitest unit test suite |
| `npm run clean` | Remove build artifacts |

## API

The server exposes a JSON API under `/api`. Auth-protected routes require a session cookie from `/api/auth`.

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/health` | GET | — | Liveness check |
| `/api/auth/*` | — | — | Auth.js routes (sign in / sign out / session / OAuth callbacks) |
| `/api/auth/register` | POST | — | Create an email/password account |
| `/api/generate-brand` | POST | — | Generate a full Brand Bible (AI → procedural fallback) |
| `/api/generate-logo-variations` | POST | — | 6 archetype logo variations for a brand |
| `/api/refine-logo-prompt` | POST | — | Chain-of-thought prompt refinement |
| `/api/generate-logo-image` | POST | — | High-res AI logo render (provider-pickable) |
| `/api/generate-viral-topics` | POST | — | Viral content topic hooks |
| `/api/audit-brand` | POST | — | Brand-health audit scorecard |
| `/api/chat` | POST | — | AI brand assistant chat (provider-pickable) |
| `/api/generate-social-post` | POST | — | Platform-ready social copy |
| `/api/generate-social-image` | POST | — | AI social visual |
| `/api/brand-case-study` | POST | — | Popular-brand research case study |
| `/api/brands` | GET / PUT | ✓ | List / upsert the signed-in user's brands |
| `/api/brands/:id` | DELETE | ✓ | Delete a brand |
| `/api/images` | POST | ✓ | Upload an AI-rendered image to R2 |

All AI endpoints are rate-limited and enforce a same-origin check. Generated images are stored in R2 for signed-in users and returned as URLs; guest renders stay session-only in the browser.

## Architecture

```
src/
├── server/                  # Express backend (bundled separately for prod)
│   ├── index.ts             # App entry: routes, middleware, static hosting
│   ├── aiGateway.ts         # Multi-provider text/image cascade + circuit breakers
│   ├── auth.ts              # Auth.js config, Neon adapter, register endpoint
│   ├── db.ts                # Neon client + brands CRUD
│   ├── imageStore.ts        # Cloudflare R2 uploads
│   └── proceduralBrands.ts  # Deterministic offline brand synthesis engine
├── components/              # React UI (30+ components: tabs, modals, studios)
├── lib/                     # Client libraries: authClient, share, evolution
├── utils/                   # Pure, testable modules: colorEngine, sanitizeSvg,
│                            #   brandAssetKit, imageExport, faviconUtils
├── data/                    # Curated presets (popular brands, archetypes)
├── App.tsx                  # App shell: auth, persistence, mode switching
└── types.ts                 # Shared domain model (BrandBible, …)
db/
└── schema.sql               # Postgres schema (brands table + indexes)
```

The server is a single Express app that also serves the built client from `dist/` in production, so one deployable unit runs the whole product. Brand assets live in `public/` (favicon, social card).

## Color engine

`src/utils/colorEngine.ts` is a pure, deterministic palette generator used by both the AI path and the procedural fallback:

1. A seed hue is derived (FNV-1a hash) from the brand context.
2. A harmony scheme is selected from the aesthetic (triadic for tech, analogous for organic, monochromatic for luxury, …).
3. Primary / secondary / accent hues are offset around the seed and tuned (saturation/lightness) per aesthetic.
4. Neutral light/dark are brand-tinted near-white/near-black, then a bounded correction loop guarantees **≥ 7:1 between neutrals** and **≥ 4.5:1 for primary/secondary on the light canvas**.

## Database

```sql
-- db/schema.sql (abridged)
CREATE TABLE brands (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  data        JSONB NOT NULL,        -- full BrandBible document
  name        TEXT,                  -- denormalized for listing
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX brands_user_id_idx ON brands (user_id);
```

Apply it once with `psql $DATABASE_URL -f db/schema.sql`.

## Contributing

- Keep pure logic in `src/utils/` or `src/server/` modules with Vitest coverage — never in components.
- Never render AI/user-supplied SVG without routing it through `sanitizeSvg()`.
- Add `dark:` variants for every new surface or text token — the audit treats a missing dark mode pair as a bug.
- Branding: the product name is **GABI**, the expansion is **Generate. Align. Build. Inspire.**, and the tagline is *Turning brand ideas into complete, consistent identities.* New UI copy should carry the identity, never a legacy name.