import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

// Restores a db/backups/gabi-backup-*.json export created by db/backup.ts.
// No psql required. Usage:
//   npm run db:restore -- db/backups/gabi-backup-<stamp>.json
// The restore refuses to overwrite a non-empty database unless --force is
// passed (the whole DB is replaced: tables are emptied then reloaded).
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "[db:restore] DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string."
  );
  process.exit(1);
}

const fileArg = process.argv[2];
const force = process.argv.includes("--force");
if (!fileArg) {
  console.error("[db:restore] Usage: npm run db:restore -- db/backups/gabi-backup-<stamp>.json [--force]");
  process.exit(1);
}

const file = path.resolve(process.cwd(), fileArg);
let raw: string;
try {
  raw = fs.readFileSync(file, "utf8");
} catch {
  console.error(`[db:restore] Cannot read backup file: ${file}`);
  process.exit(1);
}

let backup: any;
try {
  backup = JSON.parse(raw);
} catch {
  console.error("[db:restore] Backup file is not valid JSON.");
  process.exit(1);
}

if (backup?.app !== "gabi" || backup?.format !== "gabi-db-backup") {
  console.error("[db:restore] Not a GABI backup file (missing app/format metadata). Refusing.");
  process.exit(1);
}

// Exact column contract per table — quoted identifiers as in db/schema.sql.
// Row keys in the backup carry these same names (select * preserves them).
const TABLES: Record<string, string[]> = {
  users: ["id", "name", "email", "emailVerified", "image", "password_hash", "created_at"],
  accounts: [
    "id",
    "userId",
    "type",
    "provider",
    "providerAccountId",
    "refresh_token",
    "access_token",
    "expires_at",
    "token_type",
    "scope",
    "id_token",
    "session_state",
  ],
  sessions: ["id", "sessionToken", "userId", "expires"],
  verification_token: ["identifier", "token", "expires"],
  brands: ["id", "user_id", "data", "brand_name", "industry", "created_at", "updated_at"],
};

const loaded = backup.tables as Record<string, unknown[]>;
for (const table of Object.keys(TABLES)) {
  const rows = loaded[table];
  if (!Array.isArray(rows)) {
    console.error(`[db:restore] Backup is missing the "${table}" table. Refusing.`);
    process.exit(1);
  }
  const known = new Set(TABLES[table]);
  if (rows.some((r) => Object.keys(r).some((k) => !known.has(k)))) {
    console.error(`[db:restore] Backup "${table}" rows contain unexpected columns. Refusing.`);
    process.exit(1);
  }
}

const db = neon(url);

async function countRows(table: string): Promise<number> {
  const rows = await db.query(`select count(*)::int as n from "${table}"`);
  return (rows[0] as { n: number }).n;
}

const before: Record<string, number> = {};
let existing = 0;
for (const table of Object.keys(TABLES)) {
  before[table] = await countRows(table);
  existing += before[table];
}
if (existing > 0 && !force) {
  console.error(
    `[db:restore] Database is not empty (${existing} rows across ${Object.keys(TABLES).join(", ")}). ` +
      "Pass --force to replace everything. Refusing."
  );
  process.exit(1);
}
if (force) {
  console.log("[db:restore] --force passed; emptying tables before restore.");
}

function buildInsert(
  table: string,
  row: Record<string, unknown>
): { text: string; values: unknown[] } {
  const cols = TABLES[table];
  const values: unknown[] = cols.map((c) => {
    const v = row[c];
    if (v === null || v === undefined) return null;
    // The brands.data column is jsonb — stringify objects and cast in SQL.
    if (c === "data") return typeof v === "string" ? v : JSON.stringify(v);
    return v;
  });
  const placeholders = cols.map(
    (c, i) => `$${i + 1}${table === "brands" && c === "data" ? "::jsonb" : ""}`
  );
  const quoted = cols.map((c) => `"${c}"`).join(", ");
  return {
    text: `insert into "${table}" (${quoted}) values (${placeholders.join(", ")})`,
    values,
  };
}

// Empty in FK-safe order: users cascades to accounts/sessions/brands;
// verification_token has no dependencies.
await db.query('delete from "verification_token"');
await db.query('delete from "users"');

const totals: Record<string, number> = {};
for (const table of Object.keys(TABLES)) {
  let inserted = 0;
  for (const row of loaded[table]) {
    const { text, values } = buildInsert(table, row as Record<string, unknown>);
    await db.query(text, values);
    inserted += 1;
  }
  totals[table] = inserted;
  console.log(`[db:restore] ${table}: +${inserted} rows`);
}

const after: Record<string, number> = {};
for (const table of Object.keys(TABLES)) {
  after[table] = await countRows(table);
}
console.log(
  `[db:restore] Done. Before: ${JSON.stringify(before)} → After: ${JSON.stringify(after)}`
);
