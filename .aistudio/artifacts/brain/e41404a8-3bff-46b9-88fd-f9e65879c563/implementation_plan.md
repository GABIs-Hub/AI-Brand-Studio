# GABI — Architecture & Project Structure Overview

A unified overview and architectural roadmap detailing how the frontend and backend operate together in this single repository, along with upcoming architectural and feature enhancements.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Yes, both the frontend and backend are housed together in this repository.** This is a unified full-stack Node.js + React monorepo architecture where Express directly serves backend API routes and middleware alongside the Vite client.

- **Frontend & Backend Coupling**: Unified (both client and server live in `src/`, run in one process during development via `tsx src/server/index.ts`, and bundle together for production).
- **Database & Auth Status**: Connected to Neon PostgreSQL via `@neondatabase/serverless` and Auth.js (`@auth/express`), with local storage fallback when offline.
- **AI Integration Pipeline**: Multi-provider fallback chain (Claude, OpenAI, Gemini, Higgsfield) routed securely through server-side endpoints in `/api/*`.

---

## 1. Overview & Core Concept

- **What It Does**: GABI (Generate, Align, Build, Inspire) is a complete brand identity and creative direction engine. It generates full Brand Bibles—including logos, WCAG-compliant color palettes, font pairings, tone-of-voice guides, viral social campaigns, 3D mockups, video generation prompts, and editable PowerPoint pitch decks.
- **Unified Architecture**:
  - **Frontend (Client)**: React 18 SPA built with Vite and Tailwind CSS.
  - **Backend (Server)**: Express.js API server running inside the same repository (`src/server/`), proxying AI APIs, managing Neon database persistence, authentication sessions, and R2 asset storage.

---

## 2. Technical Architecture & System Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (BROWSER)                              │
│  React 18 + Vite + Tailwind CSS                                        │
│  - Brand Overview, Palette & WCAG Matrix                               │
│  - Logo Archetype & 3D Render Studio                                   │
│  - Motion & Video Studio, Social Templates                             │
│  - Export Engine (PDF, JSON, CSS, PPTX)                                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (/api/*)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS BACKEND (src/server/)                      │
│                                                                        │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │   Auth & Session      │  │  Brand Storage  │  │ AI Generation    │  │
│  │  @auth/express        │  │  CRUD Routes    │  │ Fallback Proxy   │  │
│  │  Neon Adapter         │  │  Neon Postgres  │  │ Claude / GPT /   │  │
│  │  Credentials & Google │  │  PostgreSQL Pool│  │ Gemini / Flux    │  │
│  └───────────────────────┘  └─────────────────┘  └──────────────────┘  │
│                                                                        │
│  Development Mode: Express mounts `vite.middlewares` on Port 3000      │
│  Production Mode:  Express serves compiled static SPA from `dist/`     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│  Neon DB     │             │ AI Providers │             │  Cloudflare  │
│  Serverless  │             │ Anthropic    │             │  R2 Storage  │
│  PostgreSQL  │             │ OpenAI       │             │  Asset &     │
│  Pooler      │             │ Gemini       │             │  Export Kit  │
│              │             │ Higgsfield   │             │  Bucket      │
└──────────────┘             └──────────────┘             └──────────────┘
```

---

## 3. How Frontend and Backend Run Together

1. **Development (`npm run dev`)**:
   - The dev script executes `tsx src/server/index.ts`.
   - The Express server starts on port `3000`.
   - Express attaches the Vite development middleware (`vite.middlewares`).
   - Requests to `/api/*` are handled by Express route controllers (Auth, AI proxy, Brand persistence).
   - All other HTTP requests are passed directly to Vite HMR and client bundle compilation.

2. **Production Build (`npm run build`)**:
   - Compiles the React client using `vite build` into `/dist`.
   - Compiles the Express server using `esbuild` into `/dist/server.cjs`.
   - In production (`npm start`), Express serves the `/api/*` routes and serves the static files from `/dist`.

3. **No CORS / Port Mismatch Issues**:
   - Because the frontend and backend share the same origin on port `3000`, fetch requests like `fetch('/api/brands')` or `fetch('/api/generate')` work seamlessly without complex CORS or separate proxy layers.

---

## 4. Key Subsystems in this Repository

| Subsystem | Location | Description |
| :--- | :--- | :--- |
| **Frontend Views** | `src/components/*` | Studio tabs (Overview, Logo, Palette, Mockups, Motion Video, 3D Render, Pitch Deck, Export) |
| **Backend Entry** | `src/server/index.ts` | Express server setup, Vite middleware mounting, and API routing |
| **Authentication** | `src/server/auth.ts` | Auth.js configuration, Neon database adapter, user sessions, credentials and Google OAuth |
| **Database Pool** | `src/server/db.ts` | Neon Serverless PostgreSQL client (`@neondatabase/serverless`) |
| **AI Fallbacks** | `src/services/*` | Multi-LLM client abstractions with retry and fallback chains |
| **Export Engines** | `src/services/presentationService.ts`, `src/utils/brandAssetKit.ts` | PowerPoint `.pptx` generation, PDF compilation, zip archive packaging |

---

## 5. Next Steps & Recommendations

1. **Explore Specific Features**: Feel free to ask any specific questions about how the server routes data, how the AI models communicate, or how Neon manages user accounts.
2. **Continue Feature Development**: We can enhance existing studios, add new export formats, or build additional brand tools.
