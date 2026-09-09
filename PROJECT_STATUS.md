# GABI — Project Status, Roadmap & Rationale
**File:** `PROJECT_STATUS.md` (repo root) · **Updated:** post-§7 — env consolidation implemented, template scrubbed

> Status legend: ✅ done & committed · 🔶 started, not finished · ⬜ planned · ⚠️ risk / action needed

## 1 · One-paragraph status

GABI (formerly *AI Brand Studio*) is functionally complete as a brand-identity generator: a React 19 + Vite client, an Express/Auth.js server, and a Neon Postgres database, with multi-provider AI (OpenAI, Claude, Gemini, Higgsfield), procedural offline fallbacks, and a full brand-library with cloud sync. The working tree is **clean — everything shipped is committed**. What remains is a short tail of finishing work (server-side sanitization, end-to-end Google proof, consent-screen rebrand) plus two of your actions: **rotating the credentials that were historically committed to `.env.example`** (the tracked file itself is now scrubbed — §7.1) and **recreating `.env` locally** from the new template (it is absent from the current checkout).

## 2 · What is implemented ✅ (why it's there)

| Area | What | Why |
|---|---|---|
| Identity | Full rename to **GABI — Generate. Align. Build. Inspire.** in code: `package.json` name, `index.html` title/OG/favicon, README, all UI chrome | Product/studio identity is now consistent everywhere code can reach |
| Database | Neon Postgres via `@auth/neon-adapter`; `db/schema.sql` matches the adapter's exact contract (camelCase quoted columns, `verification_token`); `npm run db:migrate` / `db:verify` (self-healing FK cascade) | Auth.js + brand sync need a real relational store; the migrator needed no `psql` |
| Auth | Email/password (bcrypt) **and** Google OAuth; Auth.js sessions over `@auth/express`; `requireAuth` fixed to use `getSession()` | Accounts + cloud brand sync; prior `req.auth` approach 401'd every protected route |
| Email flows | Verification + password reset via Auth.js single-use `verification_token`; `mail.ts` sends through **Resend**, console dev-fallback; `emailVerified` surfaced live in sessions; verify/reset/resend endpoints; UI banner, forgot-password, reset page | Trust + recovery; Google users are auto-stamped verified (Google already proved the email) |
| Hardening | Prod `AUTH_SECRET` fail-fast (< 32 chars refuses to boot); `TRUST_PROXY` env drives Express trust-proxy; backups: `npm run db:backup` / `db:restore --force` (JSON, FK-safe); `db/backups/` gitignored | Fail fast beats silent misconfig; correct client IPs/cookies behind Render/Fly/Railway; recoverable data |
| Brand engine | Multi-provider AI gateway with model fallback cascade + cooldowns; procedural offline generators; color engine + WCAG palette generation; **archival logo history** for popular-brand research (Wikipedia-backed evolution timelines) | Logo generation is no longer single-provider — best-of-cascade; app works even with zero API keys |
| Data integrity | `src/lib/brandValidation.ts` sanitizer (never throws: repairs missing `typography`, drops junk palette entries, returns `null` for non-brands) wired into storage load, JSON import, cloud fetch, AI responses | Malformed Brand Bibles previously **crashed the whole app** on boot |
| Quality | 78 unit tests (auth secret, mail builders, sanitizer, logo history, procedural brands, sharing, evolution), typecheck/lint = `tsc --noEmit`, README documents stack/API/DB/Google/mail | Regression net for the riskiest pure logic |
| Env hygiene | `.env.example` scrubbed to placeholder-only values (LF line endings); `npm run env:check` guard (fails on secret-shaped values in the template, `.env` key-set divergence, leftover `<...>` placeholders — unit-tested); `env.ts` resolves `.env` independent of cwd (dev + bundled server) | One canonical template to copy; no more secret leaks or drift |

## 3 · Started but not finished 🔶 (what, where it stands, why it matters)

**3.1 Google sign-in end-to-end proof — blocked on one human click.**
Code is done and verified *up to the consent screen*: real `GOOGLE_CLIENT_ID/SECRET` are in `.env`, `/api/auth/providers` lists Google, the UI click now POSTs a CSRF-protected form (this Auth.js build **throws on GET provider sign-ins** — that bug is fixed), and the chain reaches Google's real login page. *Remaining:* type a Google account into the live preview, then confirm `users` + `accounts` rows land in Neon and the library works under the Google session. **Why:** proves OAuth + Neon + the auto-verify stamping together. **Blocked on:** your Google credentials + a fresh dev server/preview (processes died in restarts) — and `.env` must first be recreated from the new template (§7.1).

**3.2 Server-side brand sanitization — sanitizer exists, not applied at the API.**
`brandValidation.ts` guards every **client** entry point, but `PUT /api/brands/:id` (index.ts:279) writes whatever it receives straight into Neon. **Why implement:** a malformed row saved from another client (cURL, a future mobile app, a buggy front-end build) re-creates the boot-crash class server-side, and garbage rows pollute the shared library. Small, safe change: reuse the same pure sanitizer at the route.

**3.3 Google OAuth consent-screen rebrand — external console work.**
The sign-in page currently says *"Sign in with Google · to continue to **AI Brand Studio**"*. Google Cloud Console → OAuth consent screen → edit app name to **GABI**, add logo + support email. **Why:** the identity leak you'll see on every Google login. Low friction: we only request openid/email/profile, so renaming does **not** trigger Google's app-verification review.

**3.4 GitHub repo rename `AI-Brand-Studio` → `GABI` — your action, documented.**
README line 11 has the exact steps (Settings → rename; GitHub auto-redirects old URLs). **Why:** repo identity should match product identity. **Why not urgent:** GitHub redirects the old URL, so nothing breaks while you defer.

## 4 · Planned / needs implementing ⬜

**4.1 Env-file consolidation (your requested merge) — ✅ implemented (§7.1).**
**4.2 `npm run env:check` guard — ✅ implemented.** A dev-only script that fails when (a) `.env` and `.env.example` key sets diverge, (b) `.env.example` contains a real-looking secret instead of a placeholder, or (c) `.env` still holds a `<...>` placeholder. **Why:** the two files *already drifted once* and real secrets *already leaked into the template* (§5.1); this makes the merged state stick.
**4.3 QA audit of older requests** — dark/light theme "perfect at every point", simple-vs-studio mode UX, and palette quality were requested in earlier sessions and partially addressed (color-engine commit exists). **Why:** they were never formally verified; a focused audit pass (theme toggle across every tab/studio, empty/error states) is the honest way to close them.

## 5 · What needs to be removed / fixed ⚠️

**5.1 ⚠️ [RESOLVED in code / PENDING: your rotation] Real secrets were committed in tracked `.env.example`.**
`.env.example` was committed and pushed with the **real Google OAuth client secret** (`GOCSPX-…`) and the **real Resend API key** (`re_…`); `.gitignore` whitelists `.env.example`, so the template became a secret carrier. **The tracked file is now scrubbed to placeholders (§7.1) — but the credentials remain live in git history and must be rotated.**

- **Done:** (1) every real value in `.env.example` is now a placeholder ✅; (3) the §4.2 guard is in place ✅.
- **Still yours to do:** (2) **rotate** the Google client secret and the Resend key at their consoles — treat anything ever pushed to GitHub as compromised. Optionally reset the Neon DB password too: the old template's `DATABASE_URL` embedded a connection-string password.
- **Why:** a committed secret on a GitHub remote is a credential leak — anyone with repo access can send email as your Resend account or abuse the OAuth client.
- **Why NOT "just delete the values from history":** rewriting git history on a pushed repo (force-push) is disruptive and doesn't un-leak the secret anyway. Rotation is the only real fix; scrubbing the current file is what stops future exposure.

**5.2 `[TEMPLATE]` header + layout drift — ✅ fixed in the §7 rewrite.** `.env.example` is now one canonical layout (LF endings, consistent quoting, section-ordered). **Why it mattered:** the file is the onboarding contract — it must stay copy-paste clean.

**5.3 No stray code to delete.** Verified: no leftover `db/_*.tmp` scripts, no orphaned Firebase files (the Firestore→Neon migration is fully landed), no duplicate auth paths. Nothing else qualifies for removal.

## 6 · The "Why and why not" decisions

| Decision | Why | Why not the alternative |
|---|---|---|
| Keep Auth.js + Neon adapter | Session/account/token logic is battle-tested; adapter already proven against your live DB | Rolling a hand-rolled auth layer is more code to audit for less trust |
| Keep `.env` **and** `.env.example` as two files | One is your live untracked config; one is the tracked template others copy | A single merged committed file would commit your secrets — the merge must produce *two reconciled files*, never one |
| Rotate, don't scrub | Rotation actually invalidates the leaked credential | History rewriting is disruptive and the secret stays valid in old clones |
| Server-side sanitization reuses the client sanitizer | One source of truth for the Brand Bible contract | A second, server-only validator drifts and double-maintains |
| Renaming GABI is mostly done in code | The visible surfaces (title, UI, package) are consistent | Only the repo name + consent screen remain — both external console actions |

## 7 · The .env merge — ✅ implemented

**Problem:** `.env` (untracked, real) and `.env.example` (tracked, template) shared 21 keys but conflicted on *philosophy* — and the template carried **real** Google/Resend values. Consumers read `process.env.*` from 7 server files, all fed by one loader (`src/server/env.ts`, imported first in `index.ts`).

**§7.1 What landed**

1. ✅ **Canonical template** — `.env.example` rewritten: LF endings, consistent quoting, sections Server → Database → Auth → Mail → AI → R2, **placeholders only** (`DATABASE_URL`, `AUTH_SECRET`, `GOOGLE_*`, `RESEND_API_KEY` are `<...>` tokens; optional keys `""`; non-secret defaults like model names kept).
2. ⏳ **Reconcile `.env` — yours to do.** `.env` is **absent from the current checkout** (gitignored). Recreate it locally: `cp .env.example .env`, paste your real values in the new order, then `npm run env:check` + `npm run dev`. No secret values were ever printed or committed.
3. ✅ **One loader, cwd-independent** — `env.ts` now resolves `.env` robustly: cwd first (same as before), then relative to the module (`../../.env` in dev, `../.env` for the bundled `dist/server.js`), then a walk-up from cwd. Verified: all 7 consumers (`aiGateway`, `auth`, `db`, `env`, `imageStore`, `index`, `mail`) read `process.env.*` only via dotenv; the client has zero `VITE_*`/`import.meta.env` usage.
4. ⏳ **Rotation — yours to do** (§5.1): rotate the Google client secret + Resend key; optionally reset the Neon DB password (the old template's `DATABASE_URL` embedded one).
5. ✅ **`npm run env:check`** — new guard (§4.2), unit-tested in `scripts/envCheckCore.test.ts`.
6. ✅ **Verified** — `env:check` clean, `tsc --noEmit` clean, `npm test` green (78 + new), `npm run build` produces a working bundle, server boots and `/api/health` answers. Full sign-in verification still needs your `.env`.
7. ✅ **`npm start` fixed (ESM bundle)** — the server bundle is emitted as ESM (`dist/server.js`); the old CJS bundle crashed on boot because `@auth/neon-adapter` is ESM-only (`ERR_PACKAGE_PATH_NOT_EXPORTED`). Verified: bundle boots from repo root and a foreign cwd, answers `/api/health` both ways.

## 8 · Suggested priority order

1. **§5.1 — rotate the leaked Google client secret + Resend key** (security — today; the template scrub itself is done)
2. **§3.2 — server-side sanitization on `PUT /api/brands/:id`**
3. **§7.1 — recreate `.env` from the new template** (you; unblocks §3.1)
4. **§3.1 — finish Google proof in the preview** (needs you)
5. **§3.3 / §3.4 — consent-screen + repo rename** (needs you)
6. **§4.3 — theme/simple-vs-studio QA audit**

---

*Notes: every claim in this document was verified against the live repo (git log, file inventory, route greps, env key comparison) rather than from memory — only key names and match/mismatch booleans were printed, never secret values.*
