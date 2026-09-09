// Pure logic for `npm run env:check` — no I/O, unit-testable.
//
// The guard enforces the env-file contract documented in PROJECT_STATUS.md:
//   (a) .env.example must never carry a real secret (only placeholders),
//   (b) .env (when present) must have the same key set as .env.example,
//   (c) .env must not still hold leftover <...> template placeholders.
// It only ever prints key names — never values.

export interface EnvFile {
  /** Keys in file order (first occurrence wins for ordering; last value wins). */
  keys: string[];
  keySet: Set<string>;
  values: Record<string, string>;
}

/** Parses a dotenv-style file: # comments, KEY=value lines, optional quotes. */
export function parseEnvFile(text: string): EnvFile {
  const keys: string[] = [];
  const values: Record<string, string> = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in values)) keys.push(key);
    values[key] = value;
  }
  return { keys, keySet: new Set(keys), values };
}

/**
 * Value shapes that indicate a live secret leaked into a tracked template.
 * Keep conservative: only flag unmistakably secret-looking strings.
 */
export const REAL_SECRET_PATTERNS: RegExp[] = [
  /GOCSPX-[A-Za-z0-9_]+/, // Google OAuth client secret
  /re_[A-Za-z0-9]{10,}/, // Resend API key
  /sk-[A-Za-z0-9]{10,}/, // OpenAI / Anthropic API key
  /AIza[A-Za-z0-9_-]{20,}/, // Google API key
  /AKIA[0-9A-Z]{16}/, // AWS access key id
  /gh[pousr]_[A-Za-z0-9]{20,}/, // GitHub token
  /postgres(ql)?:\/\/[^:\/\s]+:[^@\s]+@/, // postgres URL with an embedded password
];

/** Keys whose value in the given file looks like a real secret. */
export function findSecretValues(env: EnvFile): string[] {
  return env.keys.filter((k) => REAL_SECRET_PATTERNS.some((re) => re.test(env.values[k])));
}

/** Keys whose value is a leftover "<...>" template token (unconfigured). */
export function findLeftoverPlaceholders(env: EnvFile): string[] {
  return env.keys.filter((k) => {
    const v = env.values[k];
    return v.startsWith("<") && v.endsWith(">");
  });
}

/** Keys present in one file but not the other. Order is template order. */
export function keySetDiff(
  template: EnvFile,
  env: EnvFile
): { missingFromEnv: string[]; extraInEnv: string[] } {
  return {
    missingFromEnv: template.keys.filter((k) => !env.keySet.has(k)),
    extraInEnv: env.keys.filter((k) => !template.keySet.has(k)),
  };
}
