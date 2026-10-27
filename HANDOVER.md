# GABI — Developer & AI Agent Handover Documentation
**Generate. Align. Build. Inspire.**  
*Comprehensive Architecture, Feature Inventory, Database Schema, and Next Roadmap*

---

## 1. Executive Summary

**GABI** (formerly *AI Brand Studio*) is a full-stack, enterprise-grade brand strategy, visual identity generation, and creative direction platform. It transforms raw business concepts into comprehensive, production-ready **Brand Bibles**—complete with responsive logo suites, WCAG AA/AAA-validated color systems, Google Font pairings, brand voice guidelines, social media launch campaigns, 3D product mockups, motion/video generation prompts, and editable 16:9 pitch decks (.pptx / PDF / ZIP).

The application is architected as a **unified full-stack repository** pairing a **React 19** frontend with an **Express 4 + Auth.js + Neon PostgreSQL** backend running from a single origin on port 3000. It features an intelligent **multi-provider AI fallback cascade** (Anthropic Claude, OpenAI, Google Gemini, and Higgsfield Flux) alongside **procedural offline generators** that guarantee the application operates cleanly even if zero external API keys are configured.

---

## 2. System Architecture & Runtime Topology

### 2.1 Single-Origin Full-Stack Monorepo
GABI combines frontend and backend into a single Node.js runtime, eliminating CORS friction and multi-container coordination in development:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                                 │
│  React 19 SPA · Vite 6 · Tailwind CSS 4 · Motion · Lucide Icons            │
│  - Brand Overview & DNA         - Logo Archetype & 3D Render Studio         │
│  - WCAG Color Matrix            - Motion & Video Studio                     │
│  - Font Pairing & Typography    - Pitch Deck Modal & PPTX/PDF Exporter      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / JSON (/api/*)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EXPRESS 4 BACKEND (src/server/)                       │
│  Entry: `src/server/index.ts` (Port 3000)                                   │
│                                                                             │
│  ┌──────────────────────┐  ┌─────────────────────┐  ┌────────────────────┐  │
│  │   Auth & Security    │  │  Brand Persistence  │  │  AI Gateway & Dir  │  │
│  │  Auth.js / Express   │  │  Neon DB Pooler     │  │  Claude / GPT /    │  │
│  │  Bcrypt / Google     │  │  Drizzle Schema     │  │  Gemini / Flux     │  │
│  │  Rate Limiting (IP)  │  │  JSONB + Denorm     │  │  Procedural Engine │  │
│  └──────────────────────┘  └─────────────────────┘  └────────────────────┘  │
│                                                                             │
│  Development Mode: Express mounts `vite.middlewares` on Port 3000           │
│  Production Mode:  Express serves compiled client from `dist/`              │
└──────────────────┬───────────────────┬───────────────────┬──────────────────┘
                   │                   │                   │
                   ▼                   ▼                   ▼
          ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
          │  Neon Postgres  │ │  AI Providers   │ │  Cloudflare R2  │
          │  Serverless DB  │ │  Claude / OpenAI│ │  Object Storage │
          │  Auth & Brands  │ │  Gemini / Flux  │ │  Assets & Kits  │
          └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 2.2 Lifecycle & Execution Modes
1. **Development (`npm run dev`)**:
   - Runs `tsx src/server/index.ts`.
   - Express initializes on port 3000, loads `.env`, binds API routes under `/api/*`, and attaches Vite's middleware (`createViteServer({ server: { middlewareMode: true } })`).
   - Browser accesses `http://localhost:3000`; frontend assets are served with fast Hot Module Replacement.
2. **Production (`npm run build` -> `npm start`)**:
   - `npm run build` runs:
     1. `vite build` (outputs optimized client SPA to `/dist`).
     2. `esbuild src/server/index.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`.
   - `npm start` executes `node dist/server.cjs` which serves both static assets from `/dist` and all `/api/*` endpoints.

---

## 3. Technology Stack & Key Dependencies

| Domain | Technology / Library | Version | Role in GABI |
| :--- | :--- | :--- | :--- |
| **Language & Tooling** | TypeScript, Node.js, `tsx`, `esbuild` | TS ~5.8, Node >=20 | Type-safety across client and server |
| **Frontend Framework** | React 19, React DOM 19 | `^19.0.1` | Concurrent UI rendering and modern hook primitives |
| **Bundler & Styles** | Vite 6, Tailwind CSS 4 (`@tailwindcss/vite`) | Vite `^6.2.3`, TW `^4.1.14` | Modern CSS engine with `@import "tailwindcss";` |
| **Animation & Icons** | Motion (`motion`), Lucide React | Motion `^12.23`, Lucide `^0.546` | Micro-interactions, transitions, and system icons |
| **Backend Framework** | Express.js | `^4.21.2` | REST API routes, middleware, and Vite hosting |
| **Authentication** | Auth.js (`@auth/express`, `@auth/core`, `@auth/neon-adapter`) | `^0.12.3` / `^0.41.3` | Session management, Credentials (bcrypt), Google OAuth |
| **Database** | Neon Serverless PostgreSQL (`@neondatabase/serverless`) | `^1.1.0` | Cloud Postgres with connection pooling and scale-to-zero |
| **ORM / Migration** | Drizzle ORM, Drizzle Kit | Drizzle `^0.45.2`, Kit `^0.31.10` | SQL schema definitions, migrations, and Drizzle Studio |
| **AI Providers** | `@anthropic-ai/sdk`, `openai`, `@google/genai`, `@higgsfield/client` | Latest | Multi-model text, vision, and image synthesis |
| **Document & Slide Export** | `pptxgenjs`, `jspdf`, `html-to-image`, `jszip` | Latest | 16:9 PowerPoint pitch decks, PDFs, SVGs, and ZIP asset kits |
| **Object Storage** | AWS SDK for S3 (`@aws-sdk/client-s3`) | `^3.1126.0` | Cloudflare R2 bucket integration for asset persistence |
| **Security & Utilities** | `bcryptjs`, `dompurify` | Latest | Password hashing and client-side SVG sanitization |
| **Testing** | Vitest, JSDOM | Vitest `^5.0.0` | 78 unit and integration tests |

---

## 4. Codebase Directory Map

```
├── .env.example              # Exhaustive environment variable reference template
├── PROJECT_STATUS.md         # Historical changelog, decisions, and architectural rationale
├── package.json              # Monorepo dependencies and orchestration scripts
├── tsconfig.json             # TypeScript project compiler configuration
├── vite.config.ts            # Vite configuration with React & Tailwind plugins
├── drizzle.config.ts         # Drizzle ORM schema and migration config
├── db/                       # Database scripts and SQL migrations
│   ├── schema.sql            # Core Postgres schema (Auth.js + brands table)
│   ├── migrate.ts            # Programmatic database migrator
│   ├── verify.ts             # Health verification and schema validator
│   ├── backup.ts             # Automated JSON database backup script
│   └── restore.ts            # Safe database restoration script
├── src/
│   ├── App.tsx               # Root React component, route/view controller
│   ├── main.tsx              # React DOM entry point
│   ├── index.css             # Global styles and Tailwind v4 directives
│   ├── types.ts              # Canonical BrandBible and system TypeScript types
│   ├── components/           # UI Studios and Presentation Tabs
│   │   ├── BrandInputForm.tsx          # Multi-step brand generation wizard
│   │   ├── BrandDashboard.tsx          # Primary workspace orchestrator
│   │   ├── BrandOverviewTab.tsx        # High-level Brand DNA, mission, values
│   │   ├── LogoTab.tsx                 # Logo archetype inspector & SVG previewer
│   │   ├── LogoArchetypeStudio.tsx     # Deep-dive logo variations & geometry
│   │   ├── PaletteTab.tsx              # Color palette visualizer
│   │   ├── ColorAccessibilityMatrix.tsx# Real-time WCAG AA/AAA contrast grid
│   │   ├── TypographyTab.tsx           # Google Fonts pairing & scale calculator
│   │   ├── FontPickerModal.tsx         # Interactive font selector
│   │   ├── FontLoader.tsx              # Dynamic Google WebFont loader
│   │   ├── ToneTab.tsx                 # Voice, persona, vocabulary, dos & don'ts
│   │   ├── MockupsTab.tsx              # Static mockup gallery
│   │   ├── AiMockupsStudio.tsx         # AI-powered photorealistic mockups
│   │   ├── MotionVideoStudio.tsx       # AI motion prompts & video storyboard
│   │   ├── Render3DStudio.tsx          # 3D spatial branding & materials
│   │   ├── SocialTemplatesTab.tsx      # Multi-platform post copy & hashtags
│   │   ├── ViralTopicsTab.tsx          # Trend-jacking & viral campaign concepts
│   │   ├── RebrandStoryTab.tsx         # Historical transformation narrative
│   │   ├── BrandEvolutionTab.tsx       # Milestone timeline generator
│   │   ├── PopularBrandResearchStudio.tsx # Real-world brand analysis & logo history
│   │   ├── DesignSystemSandbox.tsx     # Interactive UI component testbed
│   │   ├── BrandDeckPresentationModal.tsx # Fullscreen interactive presentation deck
│   │   ├── ExportModal.tsx             # Multi-format export dialog (PPTX, PDF, ZIP)
│   │   ├── AccountModal.tsx            # Auth & user profile modal
│   │   ├── FloatingAiDirector.tsx      # Real-time AI Director suggestions
│   │   └── Header.tsx                  # App bar, brand switcher, and auth state
│   ├── services/             # Core export and communication services
│   │   ├── presentationService.ts      # Native 16:9 PPTX generation via pptxgenjs
│   │   └── visualShareService.ts       # Social share image and banner generator
│   ├── utils/                # Pure utility modules
│   │   ├── brandAssetKit.ts            # ZIP packaging, CSS variables, tokens
│   │   ├── colorEngine.ts              # OKLCH/HEX conversions, WCAG calculations
│   │   ├── imageExport.ts              # HTML-to-canvas and SVG rasterization
│   │   ├── sanitizeSvg.ts              # DOMPurify-based SVG sanitizer
│   │   └── faviconUtils.ts             # Dynamic in-browser favicon generation
│   ├── lib/                  # Validation and client-side guards
│   │   ├── brandValidation.ts          # Resilient BrandBible schema sanitizer
│   │   ├── evolution.ts                # Timeline generation logic
│   │   └── share.ts                    # Deep-linking and URL state sharing
│   └── server/               # Express backend & API endpoints
│       ├── index.ts          # Express server, rate limiters, API router
│       ├── env.ts            # Environment bootstrap and validation
│       ├── auth.ts           # Auth.js configuration, routes, and bcrypt logic
│       ├── db.ts             # Neon SQL client and Brand storage handlers
│       ├── aiGateway.ts      # Multi-provider LLM & Image synthesis gateway
│       ├── aiDirector.ts     # Task-routing heuristics and AI Director status
│       ├── aiModels.ts       # Model manifests, pricing, and capabilities
│       ├── proceduralBrands.ts # Deterministic offline brand generator
│       ├── logoHistory.ts    # Wikipedia-backed historical logo scraper
│       ├── imageStore.ts     # Cloudflare R2 presigned URLs and upload logic
│       └── mail.ts           # Resend email client with console fallback
```

---

## 5. Feature Inventory: What Has Been Done

### 5.1 Brand Generation & Intelligence
- **Multi-Step Onboarding Form (`BrandInputForm.tsx`)**: Collects company name, industry, personality traits, target demographics, aesthetic tone, and competitor context.
- **AI Gateway & Fallback Cascade (`src/server/aiGateway.ts`)**:
  - Automatically queries the best available model in order: Anthropic Claude 3.7/3.5 Sonnet -> OpenAI GPT-4o -> Google Gemini 2.5 Pro/Flash.
  - Automatic cooldown tracking for rate-limited (429) or degraded (503) models.
  - Image synthesis cascade: Higgsfield Flux -> OpenAI DALL-E 3 -> Google Gemini Flash Image.
- **Procedural Offline Fallback (`src/server/proceduralBrands.ts`)**: Generates an exhaustive, high-aesthetic Brand Bible locally using procedural color theory, geometric SVGs, and typographic heuristics if no API keys are configured.

### 5.2 Brand Dashboard & Studio Modules
1. **Brand Overview (`BrandOverviewTab.tsx`)**: High-level brand summary, core mission, vision, brand values, value proposition, and elevator pitch.
2. **Logo Suite & Archetypes (`LogoTab.tsx`, `LogoArchetypeStudio.tsx`)**:
   - Generates and renders vector SVGs across 4 archetypes (Abstract Geometric, Wordmark/Typographic, Monogram/Lettermark, Emblem/Badge).
   - Light and dark surface variants, monochrome versions, and minimum clearance bounding boxes.
   - Live SVG code inspector and instant SVG/PNG download.
3. **Color Palette & WCAG Matrix (`PaletteTab.tsx`, `ColorAccessibilityMatrix.tsx`)**:
   - Primary, secondary, accent, neutral, and background color swatches with HEX, RGB, HSL, and OKLCH color codes.
   - Comprehensive WCAG 2.1 contrast matrix calculating foreground-on-background legibility with pass/fail badges for Normal Text, Large Text, and UI Components (AA and AAA standards).
4. **Typography & Font Pairing (`TypographyTab.tsx`, `FontPickerModal.tsx`)**:
   - Curated Google Fonts combinations (Header, Subtitle, Body, Monospace).
   - Dynamic WebFont loading on-the-fly (`FontLoader.tsx`).
   - Modular typographic scale preview (Display, H1, H2, H3, Body, Caption).
5. **Brand Tone & Voice (`ToneTab.tsx`)**:
   - 4-quadrant brand persona spectrum (Formal vs. Casual, Serious vs. Playful, Modern vs. Classic, Reserved vs. Bold).
   - "Say This / Don't Say That" copy guidelines with practical sentence examples.
   - Messaging pillars and key buzzwords.
6. **AI Mockups Studio (`AiMockupsStudio.tsx`, `MockupsTab.tsx`)**:
   - Photorealistic mockup templates across digital screens, business cards, stationery, packaging, apparel, and outdoor billboards.
   - Prompt generation for AI image synthesis with brand identity overlay.
7. **Motion & Video Studio (`MotionVideoStudio.tsx`)**:
   - Generates cinematic video prompts, shot-by-shot storyboards, camera motion directions, and lighting guidelines tailored for runway/Sora/Luma/Higgsfield.
8. **3D Render Studio (`Render3DStudio.tsx`)**:
   - Material shaders, 3D emblem extrusions, lighting schemes, and spatial branding directions.
9. **Social Launch & Viral Campaigns (`SocialTemplatesTab.tsx`, `ViralTopicsTab.tsx`)**:
   - Formatted copy, caption hooks, hashtags, and visual descriptions for LinkedIn, X/Twitter, Instagram, and TikTok.
   - Trend-jacking concepts and campaign strategies.
10. **Rebrand & Evolution (`RebrandStoryTab.tsx`, `BrandEvolutionTab.tsx`)**:
    - "Before & After" rebrand story generation, rationales for modernization, and visual roadmap milestones.
11. **Popular Brand Research (`PopularBrandResearchStudio.tsx`)**:
    - Real-world brand tear-downs with archival Wikipedia-backed logo history timelines.

### 5.3 Export Engines
- **PowerPoint Presentation (`src/services/presentationService.ts`)**:
  - Generates a fully editable 16:9 `.pptx` deck via `pptxgenjs`.
  - Includes Title Slide, Brand Mission & Values, Logo Architecture, Complete Color Palette with HEX/RGB, Typographic System, Brand Voice & Persona, and Closing Slide.
  - Uses native PowerPoint shapes, text boxes, and color fills rather than flattened images so clients can edit copy directly.
- **PDF Export (`jspdf`)**: Complete multi-page Brand Bible document with vector typography and swatches.
- **Brand Asset ZIP Bundle (`src/utils/brandAssetKit.ts`)**:
  - `.svg` files for each logo variant.
  - `tokens.json` containing the design tokens.
  - `variables.css` ready to drop into web projects.
  - `README.md` summarizing font usage and color codes.
  - Full `brand.json` schema.
- **Interactive Pitch Deck (`BrandDeckPresentationModal.tsx`)**: Fullscreen, keyboard-navigable slide deck mode for client presentations.

### 5.4 Authentication & Data Persistence
- **Auth.js on Express (`src/server/auth.ts`)**:
  - Email/Password authentication with salted `bcryptjs` passwords.
  - Google OAuth provider (configured when `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are set).
  - Password reset and email verification workflows powered by **Resend** (with local console fallbacks).
- **Neon PostgreSQL Persistence (`src/server/db.ts`)**:
  - Connection pooling via `@neondatabase/serverless`.
  - Brand Bibles saved per authenticated user.
  - Fallback to browser local storage for guest / unauthenticated users.

---

## 6. Database Schema & Migration Architecture

The database runs on **Neon PostgreSQL** using the schema in `db/schema.sql`. Quoted camelCase columns (`"emailVerified"`, `"userId"`, `"sessionToken"`, `"providerAccountId"`) are strictly required by `@auth/neon-adapter`.

```sql
-- Core Auth.js Tables
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  "emailVerified" TIMESTAMP WITH TIME ZONE,
  image TEXT,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE (provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT,
  token TEXT,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Brand Library Table
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,                -- Full canonical BrandBible document
  brand_name TEXT,                    -- Denormalized for rapid search
  industry TEXT,                      -- Denormalized for filtering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS brands_user_id_idx ON brands (user_id);
CREATE INDEX IF NOT EXISTS brands_created_at_idx ON brands (created_at DESC);
CREATE INDEX IF NOT EXISTS brands_name_idx ON brands (brand_name);
```

### Database CLI Commands
- `npm run db:migrate`: Executes `db/migrate.ts` to run DDL migrations without requiring the external `psql` binary.
- `npm run db:verify`: Tests connection, ensures tables exist, and verifies foreign-key cascades.
- `npm run db:backup`: Generates a timestamped JSON backup in `db/backups/`.
- `npm run db:restore`: Restores data from the latest backup.
- `npm run db:studio`: Launches Drizzle Studio GUI for visual database management.

---

## 7. Security & API Protection

1. **Origin Enforcement**: Cross-origin API calls are blocked if `APP_URL` is configured in production (`src/server/index.ts`). Same-origin browser calls pass transparently.
2. **Sliding-Window Rate Limiting**:
   - General AI Generation endpoints: **30 requests/min** per IP.
   - Heavy Image Synthesis endpoints: **6 requests/min** per IP.
   - Account Security (password reset/email verification): **10 requests/min** per IP.
   - In-memory buckets pruned automatically every 2 minutes.
3. **Strict Secret Fail-Fast**:
   - `AUTH_SECRET` must be at least 32 characters long in production; server halts during boot if insecure (`src/server/auth.ts`).
4. **SVG & Content Sanitization**:
   - Client and server sanitize all rendered and uploaded SVGs using DOMPurify (`src/utils/sanitizeSvg.ts`).
   - `src/lib/brandValidation.ts` enforces non-crashing schema validation on every Brand Bible loaded from disk, cloud, or AI generation.

---

## 8. Configuration & Environment Variables (`.env`)

Refer to `.env.example` for the official template. Below is the operational reference:

```bash
# --- CORE APPLICATION & SECURITY ---
APP_URL=http://localhost:3000       # Base URL of application
AUTH_SECRET=                        # Min 32 chars in production (openssl rand -hex 32)
TRUST_PROXY=1                       # Set to 1 when behind Cloudflare/Render/Fly proxy

# --- DATABASE & PERSISTENCE ---
DATABASE_URL=postgresql://...       # Neon PostgreSQL connection string with SSL

# --- ANTHROPIC (CLAUDE) ---
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-7-sonnet-20250219
ANTHROPIC_FAST_MODEL=claude-3-5-haiku-latest
ANTHROPIC_FALLBACK_MODELS=claude-3-7-sonnet-20250219,claude-3-5-sonnet-latest,claude-3-5-haiku-latest

# --- OPENAI ---
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o
OPENAI_FAST_MODEL=gpt-4o-mini
OPENAI_IMAGE_MODEL=dall-e-3
OPENAI_FALLBACK_MODELS=gpt-4o,gpt-4o-mini,o3-mini

# --- GOOGLE GEMINI ---
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-pro
GEMINI_FAST_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image
GEMINI_FALLBACK_MODELS=gemini-2.5-flash,gemini-3.7-flash,gemini-2.5-pro

# --- HIGGSFIELD (IMAGE & VIDEO) ---
HF_CREDENTIALS=
HIGGSFIELD_ENDPOINT=flux-pro/kontext/max/text-to-image
HIGGSFIELD_FALLBACK_ENDPOINTS=flux-pro/kontext/max/text-to-image,flux-pro/v1.1,flux-dev

# --- GOOGLE OAUTH ---
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# --- RESEND EMAIL ---
RESEND_API_KEY=
RESEND_FROM=GABI <support@gabi.studio>

# --- CLOUDFLARE R2 STORAGE ---
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
```

---

## 9. Verification, Testing & Build Verification

The codebase has complete test and compilation coverage:
- **Linting & Type-Checking**:
  ```bash
  npm run lint    # runs `tsc --noEmit`
  ```
  *Current status: 0 type errors.*
- **Unit & Integration Tests**:
  ```bash
  npm test        # runs `vitest run`
  ```
  *Current status: 9 test suites passed, 78 tests passed.*
- **Build Verification**:
  ```bash
  npm run build   # builds client into dist/ and server into dist/server.cjs
  ```
  *Current status: clean compilation.*

---

## 10. Roadmap: What Needs to Be Done Next

For the incoming AI agent or software engineer, the remaining priorities are:

### Priority 1: Server-Side Brand Validation Route Guard
- **Status**: The pure sanitizer `src/lib/brandValidation.ts` guards all frontend imports, but the Express endpoint `PUT /api/brands/:id` currently saves payloads straight into Postgres.
- **Action**: Import `validateBrandBible` into `src/server/index.ts` and pass `req.body` through it before running `upsertBrand()`.

### Priority 2: Direct Cloudflare R2 Upload Pipeline for Brand Assets
- **Status**: `src/server/imageStore.ts` contains S3 client scaffolding, but asset exports currently download directly via browser memory blob.
- **Action**: Implement `/api/storage/upload` endpoint allowing clients to upload generated SVG logos, high-res renders, and exported `.pptx` decks directly to R2, returning persistent public CDN URLs.

### Priority 3: Organization & Multi-User Collaboration Workspaces
- **Status**: Brands currently link to individual `user_id`s in `brands` table.
- **Action**: Add an `organizations` and `organization_members` table allowing agency teams and brand managers to invite collaborators with `Editor` or `Viewer` permissions.

### Priority 4: Webhook Architecture for Async Video & Render Jobs
- **Status**: Video generation prompts in `MotionVideoStudio.tsx` currently provide prompt text and direct synchronous API requests.
- **Action**: Add a background job queue with webhook callback endpoints (`/api/webhooks/higgsfield`) to handle long-running video rendering tasks asynchronously with live SSE or polling status indicators.

### Priority 5: Split Deployment Architecture (Cloudflare Pages + Render)
- If the user decides to split hosting across Cloudflare (frontend) and Render (backend):
  1. Add CORS configuration (`cors` middleware) to `src/server/index.ts` allowing `https://<cloudflare-subdomain>.pages.dev`.
  2. Set `credentials: 'include'` on all client `fetch` calls to pass Auth.js session cookies across subdomains.
  3. Set cookie `SameSite=None` and `Secure=true` in `authConfig` when `NODE_ENV === 'production'`.

---

## 11. Quick Reference for Incoming Agents

- **Dev Server Port**: Always runs on port `3000`. If you see `EADDRINUSE`, do not launch a second dev server; the background dev server is already running.
- **Testing API Health**: Run `curl http://localhost:3000/api/health` to confirm the backend is up.
- **Brand Bible Types**: Always check `src/types.ts` for the canonical structure of `BrandBible`.
- **Zero API Key Fallback**: The app must NEVER crash if keys are missing. It automatically delegates to `src/server/proceduralBrands.ts`. Keep this behavior intact when adding features.
