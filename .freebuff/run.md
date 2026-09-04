# GABI — Dev server run doc

## Reproduce artifacts (fresh checkout)

1. **Install dependencies:** `npm install` (lockfile is `package-lock.json`; package manager is npm).
2. **Environment file:** none required — the app runs fully procedurally without any keys. If a `.env` exists in the main checkout, copy it here (`cp .env .env` is a no-op in the main worktree; per-worktree copies may need `APP_URL`/ports adapted). Template: `.env.example`. All providers/database/storage are optional fallback tiers.
3. **Database schema (optional):** only needed for accounts/cloud sync — `psql "$DATABASE_URL" -f db/schema.sql`.

No other build step is needed for dev (`tsx` runs TypeScript directly).

## Run the server

- **Command:** `npm run dev` → `tsx src/server/index.ts`
- **Port:** hardcoded **3000** in `src/server/index.ts` (`const PORT = 3000`) — must be free.
- **URL:** http://localhost:3000 (API: `/api/health`; full app served with Vite middleware + HMR).
- **Detached start (Windows):**
  ```powershell
  powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
  ```
  stdout and stderr must go to DIFFERENT files. Confirm survival with `Get-Process -Id <pid>`; wait for `http://localhost:3000/api/health` to answer `200` before use.
- **Production equivalent:** `npm run build` (Vite client + esbuild server bundle → `dist/`) then `npm start`.

## Notes

- The server-side AI/auth/image modules (`src/server/*`) do NOT hot-reload — restart the process after editing them. Client (Vite) changes hot-reload.
- No AI keys configured → `/api/generate-brand` and `/api/brand-case-study` use the deterministic procedural fallback; `/api/brand-logo-history` works keyless against Wikimedia Commons.