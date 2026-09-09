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

- **Server** — `APP_URL` (used for the same-origin API guard + emailed links); `TRUST_PROXY` (set to `1` when deployed behind a hosting proxy so rate limiting and secure cookies see the real client).
- **Database** — `DATABASE_URL` (Neon connection string). Required for accounts and cloud brand sync. The schema lives in [`db/schema.sql`](db/schema.sql) and is applied with `npm run db:migrate` (see [Database setup](#database)).
- **Auth** — `AUTH_SECRET` (generate with `openssl rand -base64 32`; **required in production** — the server refuses to boot without it); `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional, see [Google sign-in](#google-sign-in)).
- **Mail** — `RESEND_API_KEY` / `RESEND_FROM` (optional — powers email verification and password reset; with no key, emailed links print to the server console instead).
- **AI** — `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `HF_CREDENTIALS` (Higgsfield `KEY_ID:KEY_SECRET`, + optional `HIGGSFIELD_ENDPOINT`). Text providers use **model ladders**: the strongest model is tried first and the gateway steps down when a model is quota-limited or busy, so light requests never wait behind flagships. Brand-Bible generation runs the whole ladder (`max` tier); chat runs the cheapest rung (`lite`). Override per provider with comma-separated `GEMINI_TEXT_MODELS` / `OPENAI_TEXT_MODELS` / `ANTHROPIC_TEXT_MODELS` (strongest first), image models with `GEMINI_IMAGE_MODELS` / `OPENAI_IMAGE_MODEL`. The legacy singular `OPENAI_MODEL` / `ANTHROPIC_MODEL` still work — they pin their model to the front of the ladder.
- **Images** — `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, optional `R2_PUBLIC_BASE_URL`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server (Express + Vite middleware) with HMR |
| `npm run build` | Vite client build + esbuild server bundle → `dist/` |
| `npm start` | Run the production server (`node dist/server.js`) |
| `npm run lint` | Typecheck (`tsc --noEmit`) |
| `npm test` | Run the Vitest unit test suite |
| `npm run db:migrate` | Apply `db/schema.sql` to Neon (idempotent, no psql needed) |
| `npm run db:verify` | Check the Neon connection and list tables |
| `npm run db:backup` | Dump all tables to `db/backups/gabi-backup-<timestamp>.json` |
| `npm run db:restore -- <file> [--force]` | Restore a backup (refuses to overwrite non-empty DBs without `--force`) |
| `npm run clean` | Remove build artifacts |
| `npm run env:check` | Guard: fails if `.env.example` carries a secret-shaped value, `.env` key set diverges from the template, or `.env` still holds `<...>` placeholders; warns on duplicated keys (dotenv silently keeps the last value) |

## API

The server exposes a JSON API under `/api`. Auth-protected routes require a session cookie from `/api/auth`.

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/health` | GET | — | Liveness check |
| `/api/auth/*` | — | — | Auth.js routes (sign in / sign out / session / OAuth callbacks) |
| `/api/auth/register` | POST | — | Create an email/password account (sends a verification email) |
| `/api/auth/verify-email` | POST | — | Confirm an emailed verification token |
| `/api/auth/forgot-password` | POST | — | Email a one-hour password-reset link (generic response, no account enumeration) |
| `/api/auth/reset-password` | POST | — | Consume the reset token and set a new password |
| `/api/auth/resend-verification` | POST | ✓ | Re-send the verification email to the signed-in user |
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
│   ├── auth.ts              # Auth.js config, Neon adapter, register endpoint,
│   │                        #   AUTH_SECRET enforcement, verification tokens
│   ├── mail.ts              # Transactional email (Resend REST + console fallback)
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
├── schema.sql               # Postgres schema (Auth.js tables + brands)
├── migrate.ts               # Idempotent schema applier (+ FK drift self-heal)
├── verify.ts                # Connection + table listing
├── backup.ts                # Full logical backup → db/backups/*.json
├── restore.ts               # Restore a backup (FK-safe, guarded)
└── backups/                 # Generated backups (gitignored)
```

The server is a single Express app that also serves the built client from `dist/` in production, so one deployable unit runs the whole product. Brand assets live in `public/` (favicon, social card).

## Color engine

`src/utils/colorEngine.ts` is a pure, deterministic palette generator used by both the AI path and the procedural fallback:

1. A seed hue is derived (FNV-1a hash) from the brand context.
2. A harmony scheme is selected from the aesthetic (triadic for tech, analogous for organic, monochromatic for luxury, …).
3. Primary / secondary / accent hues are offset around the seed and tuned (saturation/lightness) per aesthetic.
4. Neutral light/dark are brand-tinted near-white/near-black, then a bounded correction loop guarantees **≥ 7:1 between neutrals** and **≥ 4.5:1 for primary/secondary on the light canvas**.

## Database

The schema in [`db/schema.sql`](db/schema.sql) defines the Auth.js adapter tables (`users`, `accounts`, `sessions`, `verification_token`) plus the `brands` library table. It is applied with an idempotent Node script — **no `psql` required**:

```bash
npm run db:migrate   # creates all tables + indexes (safe to re-run)
npm run db:verify    # confirms the connection and lists tables
```

Setup steps:

1. Create a project at [neon.tech](https://neon.tech) and copy its connection string.
2. Put it in `.env` as `DATABASE_URL` (see `.env.example`).
3. Run `npm run db:migrate`.
4. Start the app and check the API: `curl http://localhost:3000/api/health` should report `"db": "connected"`.

**Backups & restores** (no `psql` required):

```bash
npm run db:backup                          # → db/backups/gabi-backup-<timestamp>.json
npm run db:restore -- db/backups/gabi-backup-<timestamp>.json
npm run db:restore -- db/backups/gabi-backup-<timestamp>.json --force  # replace a non-empty DB
```

Neon's native **branching / point-in-time restore** (in the Neon console or `neonctl`) is the recommended first-line disaster recovery; the backup script provides portable, inspectable exports you can move between projects.

> **Schema contract:** the Auth.js tables use the quoted camelCase columns the `@auth/neon-adapter` requires (`"emailVerified"`, `"userId"`, `"providerAccountId"`, `"sessionToken"`). Don't rename them to snake_case — Google OAuth and session flows depend on the exact names. The `brands` table is ours and intentionally uses `snake_case`.

## Google sign-in

1. Create an **OAuth Client ID** (Web application) at [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).
2. Add the authorized redirect URI `{APP_URL}/api/auth/callback/google` — for local development: `http://localhost:3000/api/auth/callback/google`.
3. Paste the Client ID and Secret into `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
4. Restart the server. "Continue With Google" in the Account Hub then completes the real consent flow, creating the user + account rows in Neon.

Google-verified accounts are automatically marked email-verified on first sign-in.

## Email verification & password reset

Email/password accounts start **unverified**: sign-in is allowed, and the Account Hub shows a "verify your email" banner (with a resend action) until the link is confirmed. Password recovery is available via the "Forgot password?" link on the sign-in form.

Both flows use single-use Auth.js verification tokens stored in the `verification_token` table (1-hour expiry for resets, 24-hour for verification) and are delivered through the mail module — Resend when `RESEND_API_KEY` is set, otherwise the link is printed to the server console. Emailed links look like `{APP_URL}/?verify=…&email=…` and `{APP_URL}/?reset=…&email=…`; the app consumes them on load and cleans the URL.

## Contributing

- Keep pure logic in `src/utils/` or `src/server/` modules with Vitest coverage — never in components.
- Never render AI/user-supplied SVG without routing it through `sanitizeSvg()`.
- Add `dark:` variants for every new surface or text token — the audit treats a missing dark mode pair as a bug.
- Branding: the product name is **GABI**, the expansion is **Generate. Align. Build. Inspire.**, and the tagline is *Turning brand ideas into complete, consistent identities.* New UI copy should carry the identity, never a legacy name.
