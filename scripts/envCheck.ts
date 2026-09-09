// `npm run env:check` — dev-time guard for the env-file contract.
// Run from the repo root. Never prints secret values, only key names.
import fs from "node:fs";
import path from "node:path";
import {
  findLeftoverPlaceholders,
  findSecretValues,
  keySetDiff,
  parseEnvFile,
} from "./envCheckCore";

const TEMPLATE_PATH = path.join(process.cwd(), ".env.example");
const ENV_PATH = path.join(process.cwd(), ".env");

let failures = 0;
function fail(msg: string) {
  console.error(`[env:check] FAIL ${msg}`);
  failures += 1;
}
function warn(msg: string) {
  console.warn(`[env:check] warn ${msg}`);
}

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error("[env:check] .env.example not found — run from the repo root (npm run env:check).");
  process.exit(1);
}

const template = parseEnvFile(fs.readFileSync(TEMPLATE_PATH, "utf8"));

// (a) The tracked template must never carry a real secret.
const leaked = findSecretValues(template);
if (leaked.length) {
  fail(
    `.env.example contains secret-looking values for: ${leaked.join(", ")}. ` +
      "Replace with placeholders (e.g. \"<your key>\") — see PROJECT_STATUS.md §5.1."
  );
}

// (b) + (c) A present .env must mirror the template's key set and hold real values.
if (!fs.existsSync(ENV_PATH)) {
  warn(
    "no .env found — copy the template and fill in real values: cp .env.example .env"
  );
} else {
  const env = parseEnvFile(fs.readFileSync(ENV_PATH, "utf8"));
  const { missingFromEnv, extraInEnv } = keySetDiff(template, env);
  if (missingFromEnv.length) {
    fail(`.env is missing keys from .env.example: ${missingFromEnv.join(", ")}`);
  }
  if (extraInEnv.length) {
    fail(`.env has keys not in .env.example: ${extraInEnv.join(", ")}`);
  }
  const placeholders = findLeftoverPlaceholders(env);
  if (placeholders.length) {
    fail(
      `.env still holds template placeholders (values like <...>) for: ${placeholders.join(", ")}. ` +
        "Paste real values."
    );
  }
}

if (failures > 0) {
  console.error(`[env:check] ${failures} problem(s) found.`);
  process.exit(1);
}

console.log(
  `[env:check] OK — .env.example is scrubbed${
    fs.existsSync(ENV_PATH) ? " and .env matches the template." : " (no .env present)."
  }`
);
