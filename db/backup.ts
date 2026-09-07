import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

// Logical backup of the whole GABI database (all 5 tables) to a JSON file.
// No psql required. Usage: npm run db:backup
// Safety net: Neon's native branching / point-in-time restore is the first
// line of defense — this script covers portable, inspectable exports.
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "[db:backup] DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string."
  );
  process.exit(1);
}

// Quoted identifiers must be spelled exactly as in db/schema.sql.
const TABLES = [
  "users",
  "accounts",
  "sessions",
  "verification_token",
  "brands",
] as const;

const db = neon(url);

const backup: Record<string, unknown> = {
  app: "gabi",
  format: "gabi-db-backup",
  version: 1,
  exportedAt: new Date().toISOString(),
  tables: {},
};

for (const table of TABLES) {
  const rows = await db.query(`select * from "${table}"`);
  (backup.tables as Record<string, unknown>)[table] = rows;
  console.log(`[db:backup] ${table}: ${(rows as unknown[]).length} rows`);
}

const dir = path.join(process.cwd(), "db", "backups");
fs.mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const file = path.join(dir, `gabi-backup-${stamp}.json`);
fs.writeFileSync(file, JSON.stringify(backup, null, 2));

const total = TABLES.reduce(
  (sum, t) => sum + ((backup.tables as Record<string, unknown[]>)[t] as unknown[]).length,
  0
);
console.log(`[db:backup] Done — ${total} total rows → ${file}`);
