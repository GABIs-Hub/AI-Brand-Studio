// `npm run env:check` — dev-time guard for the env-file contract.
// Run from the repo root. Never prints secret values, only key names.
import fs from "node:fs";
import { runEnvCheck } from './envCheckRunner';

runEnvCheck({
  cwd: () => process.cwd(),
  existsSync: (file) => fs.existsSync(file),
  readFileSync: (file, encoding) => fs.readFileSync(file, encoding),
  error: (message) => console.error(message),
  warn: (message) => console.warn(message),
  log: (message) => console.log(message),
  exit: (code) => process.exit(code),
});
