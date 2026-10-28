import {
  findDuplicateKeys,
  findLeftoverPlaceholders,
  findSecretValues,
  keySetDiff,
  parseEnvFile,
} from './envCheckCore';
import path from 'node:path';

export interface EnvCheckIo {
  cwd: () => string;
  existsSync: (file: string) => boolean;
  readFileSync: (file: string, encoding: 'utf8') => string;
  error: (message: string) => void;
  warn: (message: string) => void;
  log: (message: string) => void;
  exit: (code: number) => never;
}

export function runEnvCheck(io: EnvCheckIo): void {
  const templatePath = path.join(io.cwd(), '.env.example');
  const envPath = path.join(io.cwd(), '.env');
  let failures = 0;
  const fail = (message: string) => { io.error(`[env:check] FAIL ${message}`); failures += 1; };
  const warn = (message: string) => io.warn(`[env:check] warn ${message}`);

  if (!io.existsSync(templatePath)) {
    io.error('[env:check] .env.example not found — run from the repo root (npm run env:check).');
    io.exit(1);
  }
  const template = parseEnvFile(io.readFileSync(templatePath, 'utf8'));
  const dupes = findDuplicateKeys(template);
  if (dupes.length) warn(`.env.example defines keys more than once (only the last value applies): ${dupes.join(', ')}`);
  const leaked = findSecretValues(template);
  if (leaked.length) fail(`.env.example contains secret-looking values for: ${leaked.join(', ')}. Replace with placeholders (e.g. "<your key>") — see PROJECT_STATUS.md §5.1.`);

  const envPresent = io.existsSync(envPath);
  if (!envPresent) {
    warn('no .env found — copy the template and fill in real values: cp .env.example .env');
  } else {
    const env = parseEnvFile(io.readFileSync(envPath, 'utf8'));
    const envDupes = findDuplicateKeys(env);
    if (envDupes.length) warn(`.env defines keys more than once (only the last value applies): ${envDupes.join(', ')}`);
    const { missingFromEnv, extraInEnv } = keySetDiff(template, env);
    if (missingFromEnv.length) fail(`.env is missing keys from .env.example: ${missingFromEnv.join(', ')}`);
    if (extraInEnv.length) fail(`.env has keys not in .env.example: ${extraInEnv.join(', ')}`);
    const placeholders = findLeftoverPlaceholders(env);
    if (placeholders.length) fail(`.env still holds template placeholders (values like <...>) for: ${placeholders.join(', ')}. Paste real values.`);
  }
  if (failures > 0) { io.error(`[env:check] ${failures} problem(s) found.`); io.exit(1); }
  io.log(`[env:check] OK — .env.example is scrubbed${envPresent ? ' and .env matches the template.' : ' (no .env present).'}`);
}
