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
  /** Keys that appear more than once — dotenv would silently keep only the last value. */
  duplicateKeys: string[];
}

/**
 * Parses dotenv-style content into environment keys, values, and duplicate-key metadata.
 *
 * Blank lines, comments, malformed lines, and invalid identifiers are ignored. Keys retain
 * their first-seen order, while repeated keys use their last value.
 *
 * @param text - The dotenv-style content to parse
 * @returns Parsed keys, values, key set, and duplicate keys
 */
export function parseEnvFile(text: string): EnvFile {
  const keys: string[] = [];
  const values: Record<string, string> = {};
  const seen = new Set<string>();
  const duplicates: string[] = [];
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
    if (!seen.has(key)) {
      seen.add(key);
      keys.push(key);
    } else if (!duplicates.includes(key)) {
      duplicates.push(key);
    }
    values[key] = value;
  }
  return { keys, keySet: new Set(keys), values, duplicateKeys: duplicates };
}

/**
 * Identifies keys defined more than once in an environment file.
 *
 * @param env - The parsed environment file
 * @returns The duplicated keys, listed once each
 */
export function findDuplicateKeys(env: EnvFile): string[] {
  return env.duplicateKeys;
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

/**
 * Identifies environment keys whose values resemble recognizable real secrets.
 *
 * @returns Keys whose values match a known secret pattern
 */
export function findSecretValues(env: EnvFile): string[] {
  return env.keys.filter((k) => REAL_SECRET_PATTERNS.some((re) => re.test(env.values[k])));
}

/**
 * Identifies environment keys whose values remain placeholder tokens.
 *
 * @param env - The parsed environment data
 * @returns Keys whose values start with `<` and end with `>`
 */
export function findLeftoverPlaceholders(env: EnvFile): string[] {
  return env.keys.filter((k) => {
    const v = env.values[k];
    return v.startsWith("<") && v.endsWith(">");
  });
}

/**
 * Compares the keys in a template and environment file.
 *
 * @param template - The template environment file
 * @param env - The environment file to compare
 * @returns Keys missing from the environment file and keys absent from the template, each in source-file order
 */
export function keySetDiff(
  template: EnvFile,
  env: EnvFile
): { missingFromEnv: string[]; extraInEnv: string[] } {
  return {
    missingFromEnv: template.keys.filter((k) => !env.keySet.has(k)),
    extraInEnv: env.keys.filter((k) => !template.keySet.has(k)),
  };
}
