import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

// Applies db/schema.sql to the Neon database. No psql required.
// Idempotent: every statement in the schema uses IF NOT EXISTS, so
// re-running is safe. Usage: npm run db:migrate
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "[db:migrate] DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string."
  );
  process.exit(1);
}

const schemaPath = path.join(process.cwd(), "db", "schema.sql");
const sqlText = fs.readFileSync(schemaPath, "utf8");

// The schema contains only CREATE TABLE / CREATE INDEX statements, so
// splitting on ";" is safe. Comment-only lines are stripped FIRST so that
// semicolons inside prose comments never split a statement.
const statements = sqlText
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

const db = neon(url);

for (const statement of statements) {
  try {
    await db.query(statement);
    console.log(`[db:migrate] applied: ${statement.slice(0, 60).replace(/\s+/g, " ")}...`);
  } catch (err) {
    console.error("[db:migrate] FAILED on statement:\n", statement);
    throw err;
  }
}

// ── Self-healing constraint check ────────────────────────────────────────────
// CREATE TABLE IF NOT EXISTS silently skips tables that already exist, so a
// database created from an older schema can drift (e.g. a `brands` table
// missing its ON DELETE CASCADE foreign key). Verify the FKs the app relies on
// and add any that are missing.
async function ensureForeignKey(
  constraint: string,
  table: string,
  column: string,
  refTable: string,
  refColumn: string
) {
  const found = await db`select 1 from pg_constraint where conname = ${constraint}`;
  if (found.length === 0) {
    await db.query(
      `alter table ${table} add constraint ${constraint} foreign key (${column}) references ${refTable}(${refColumn}) on delete cascade`
    );
    console.log(`[db:migrate] added missing FK: ${constraint}`);
  }
}

await ensureForeignKey("brands_user_id_fkey", "brands", "user_id", "users", "id");
await ensureForeignKey("accounts_userId_fkey", "accounts", '"userId"', "users", "id");
await ensureForeignKey("sessions_userId_fkey", "sessions", '"userId"', "users", "id");

const rows = await db`select table_name from information_schema.tables where table_schema = 'public' order by table_name`;
console.log(
  `[db:migrate] Done. Tables in database (${rows.length}): ${rows
    .map((r: any) => r.table_name)
    .join(", ")}`
);