import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load .env BEFORE any other server module evaluates. ES module imports are
// hoisted above the importing file's body, so without this prelude, modules
// like ./auth would read process.env (DATABASE_URL, AUTH_SECRET, ...) before
// dotenv.config() ran and cache null/fallback values forever.
// Import first in the server entry: import "./env";

// dotenv resolves ".env" from process.cwd(), so a bundled server started
// outside the repo root would silently miss the file. Resolve it robustly:
// cwd first (the existing behavior), then relative to this module — which
// works both in dev (src/server/index.ts -> repo root) and in the bundled
// server (dist/server.js -> repo root) — then walk up from cwd as a last
// resort. The bundle is emitted as ESM, so import.meta.url is always a real
/**
 * Gets the directory containing the current ES module.
 *
 * @returns The module directory, or `undefined` when the module URL cannot be converted to a filesystem path.
 */
function moduleDirOf(): string | undefined {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return undefined; // non-file URL (edge runtime, exotic loader)
  }
}

/**
 * Locates the first existing `.env` file among the working directory, module-relative paths, and its parent directories.
 *
 * @returns The path to the first existing `.env` file, or `undefined` if none is found.
 */
function findEnvFile(): string | undefined {
  const candidates = new Set<string>([path.join(process.cwd(), ".env")]);

  const moduleDir = moduleDirOf();
  if (moduleDir) {
    candidates.add(path.resolve(moduleDir, "..", "..", ".env")); // src/server/index.ts
    candidates.add(path.resolve(moduleDir, "..", ".env")); // dist/server.js
  }

  let dir = process.cwd();
  for (let i = 0; i < 20; i++) {
    candidates.add(path.join(dir, ".env"));
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

const envFile = findEnvFile();
if (envFile) {
  if (envFile !== path.join(process.cwd(), ".env")) {
    console.log(`[env] loading environment from ${envFile}`);
  }
  dotenv.config({ path: envFile });
}
