# GABI — Project Status, Roadmap & Rationale
**File:** `PROJECT_STATUS.md` (proposed, repo root) · **Updated:** from current `main` (HEAD `1048fbc`)

> Status legend: ✅ done & committed · 🔶 started, not finished · ⬜ planned · ⚠️ risk / action needed

## 1 · One-paragraph status

GABI (formerly *AI Brand Studio*) is functionally complete as a brand-identity generator: a React 19 + Vite client, an Express/Auth.js server, and a Neon Postgres database, with multi-provider AI (OpenAI, Claude, Gemini, Higgsfield), procedural offline fallbacks, and a full brand-library with cloud sync. The working tree is **clean — everything shipped is committed**. What remains is a short tail of finishing work (server-side sanitization, end-to-end Google proof, consent-screen rebrand), the env-file consolidation you asked me to plan, and **one urgent security item: real live secrets are committed inside `.env.example`**.

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

## 3 · Started but not finished 🔶 (what, where it stands, why it matters)

**3.1 Google sign-in end-to-end proof — blocked on one human click.**
Code is done and verified *up to the consent screen*: real `GOOGLE_CLIENT_ID/SECRET` are in `.env`, `/api/auth/providers` lists Google, the UI click now POSTs a CSRF-protected form (this Auth.js build **throws on GET provider sign-ins** — that bug is fixed), and the chain reaches Google's real login page. *Remaining:* type a Google account into the live preview, then confirm `users` + `accounts` rows land in Neon and the library works under the Google session. **Why:** proves OAuth + Neon + the auto-verify stamping together. **Blocked on:** your Google credentials + a fresh dev server/preview (processes died in restarts).

**3.2 Server-side brand sanitization — sanitizer exists, not applied at the API.**
`brandValidation.ts` guards every **client** entry point, but `PUT /api/brands/:id` (index.ts:279) writes whatever it receives straight into Neon. **Why implement:** a malformed row saved from another client (cURL, a future mobile app, a buggy front-end build) re-creates the boot-crash class server-side, and garbage rows pollute the shared library. Small, safe change: reuse the same pure sanitizer at the route.

**3.3 Google OAuth consent-screen rebrand — external console work.**
The sign-in page currently says *"Sign in with Google · to continue to **AI Brand Studio**"*. Google Cloud Console → OAuth consent screen → edit app name to **GABI**, add logo + support email. **Why:** the identity leak you'll see on every Google login. Low friction: we only request openid/email/profile, so renaming does **not** trigger Google's app-verification review.

**3.4 GitHub repo rename `AI-Brand-Studio` → `GABI` — your action, documented.**
README line 11 has the exact steps (Settings → rename; GitHub auto-redirects old URLs). **Why:** repo identity should match product identity. **Why not urgent:** GitHub redirects the old URL, so nothing breaks while you defer.

## 4 · Planned / needs implementing ⬜

**4.1 Env-file consolidation (your requested merge) — full plan in §7.**
**4.2 `npm run env:check` guard** — a script (dev-only) that fails CI/pre-commit when (a) `.env` and `.env.example` key sets diverge, (b) `.env.example` contains a real-looking secret instead of a placeholder, or (c) `.env` still holds a placeholder. **Why:** the two files *already drifted once* and real secrets *already leaked into the template* (§5.1). This makes the merged state stick.
**4.3 QA audit of older requests** — dark/light theme "perfect at every point", simple-vs-studio mode UX, and palette quality were requested in earlier sessions and partially addressed (color-engine commit exists). **Why:** they were never formally verified; a focused audit pass (theme toggle across every tab/studio, empty/error states) is the honest way to close them.

## 5 · What needs to be removed / fixed ⚠️

**5.1 [URGENT] Real secrets inside tracked `.env.example`.**
`.env.example` — committed at HEAD (`1048fbc`) and pushed to the GitHub remote — contains the **real Google OAuth client secret** (`GOCSPX-…`) and the **real Resend API key** (`re_…`). `.gitignore` correctly excludes `.env` but whitelists `.env.example`, so the template became a secret carrier.

- **What to do:** (1) replace every real value in `.env.example` with a placeholder; (2) **rotate** the Google client secret and the Resend key at their consoles — treat anything ever pushed to GitHub as compromised; (3) add the §4.2 guard so it can't recur.
- **Why:** a committed secret on a GitHub remote is a credential leak — anyone with repo access can send email as your Resend account or abuse the OAuth client.
- **Why NOT "just delete the values from history":** rewriting git history on a pushed repo (force-push) is disruptive and doesn't un-leak the secret anyway. Rotation is the only real fix; scrubbing the current file is what stops future exposure.

**5.2 `[TEMPLATE]` header + layout drift in `.env.example`.** A stale `[TEMPLATE]` marker line, an outdated opening comment, and the R2 block written with a different format than the rest of the file (the R2 lines don't even match the file's own key syntax). **Remove/fix:** during the §7 rewrite. **Why:** the file is the onboarding contract — it must be copy-paste clean.

**5.3 No stray code to delete.** Verified: no leftover `db/_*.tmp` scripts, no orphaned Firebase files (the Firestore→Neon migration is fully landed), no duplicate auth paths. Nothing else qualifies for removal.

## 6 · The "Why and why not" decisions

| Decision | Why | Why not the alternative |
|---|---|---|
| Keep Auth.js + Neon adapter | Session/account/token logic is battle-tested; adapter already proven against your live DB | Rolling a hand-rolled auth layer is more code to audit for less trust |
| Keep `.env` **and** `.env.example` as two files | One is your live untracked config; one is the tracked template others copy | A single merged committed file would commit your secrets — the merge must produce *two reconciled files*, never one |
| Rotate, don't scrub | Rotation actually invalidates the leaked credential | History rewriting is disruptive and the secret stays valid in old clones |
| Server-side sanitization reuses the client sanitizer | One source of truth for the Brand Bible contract | A second, server-only validator drifts and double-maintains |
| Renaming GABI is mostly done in code | The visible surfaces (title, UI, package) are consistent | Only the repo name + consent screen remain — both external console actions |

## 7 · The .env merge — implementation plan

**Problem:** `.env` (untracked, real) and `.env.example` (tracked, template) share 16 keys + 5 R2 keys, but they conflict on *philosophy*: the template currently holds **real** Google/Resend values and placeholder DB/secret values; `.env` holds real values; R2 block formatting diverges; consumers read `process.env.*` from 7 server files, all fed by one loader (`src/server/env.ts`, imported first in `index.ts`).

**End state (the "one file after merging"):** two files, byte-for-byte identical in **key set, order, comments, and layout**; identical except values — `.env` real, `.env.example` placeholders.

1. **Canonical layout** — rewrite `.env.example` cleanly: drop `[TEMPLATE]`, normalize CRLF to LF, fix the R2 block format, order sections Server → Database → Auth → Mail → AI providers → Image storage (R2). Placeholders only, including `DATABASE_URL` and `AUTH_SECRET`.
2. **Reconcile `.env`** to the same key order/sections, keeping its real values (no secret values printed or committed).
3. **Wire every call to the one loader** — audit confirmed all 7 `process.env` consumers (`aiGateway`, `auth`, `db`, `env`, `imageStore`, `index`, `mail`) already go through `dotenv` → nothing reads a file path directly. The one real gap: `dotenv.config()` resolves `.env` from the **process working directory**, so `node dist/server.cjs` started outside the repo root would miss it. Harden `env.ts` to resolve `.env` robustly (cwd first, then repo-root candidates for the bundled server). No client rewiring needed — the client has zero `VITE_*`/`import.meta.env` usage.
4. **Rotation + placeholders** (§5.1) land in the same pass.
5. **Add `npm run env:check`** (§4.2) and run it.
6. **Verify:** `npm run env:check`, `npm run lint`, `npm test`, boot the server, confirm health + a sign-in still work.

## 8 · Suggested priority order

1. **§5.1 — secret rotation + placeholder scrub** (security, today)
2. **§7 — env consolidation + `env:check`**
3. **§3.2 — server-side sanitization on `PUT /api/brands/:id`**
4. **§3.1 — finish Google proof in the preview** (needs you)
5. **§3.3 / §3.4 — consent-screen + repo rename** (needs you)
6. **§4.3 — theme/simple-vs-studio QA audit**

---

*Notes: every claim in this document was verified against the live repo (git log, file inventory, route greps, env key comparison) rather than from memory — only key names and match/mismatch booleans were printed, never secret values.*
