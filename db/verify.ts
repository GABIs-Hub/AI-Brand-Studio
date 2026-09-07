import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

// Verifies the Neon connection and lists the tables in the database.
// Usage: npm run db:verify
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "[db:verify] DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string."
  );
  process.exit(1);
}

const db = neon(url);

try {
  const ok = await db`select 1 as ok`;
  const tables = await db`select table_name from information_schema.tables where table_schema = 'public' order by table_name`;
  console.log(`[db:verify] Connection OK: ${ok[0]?.ok === 1 ? "yes" : "no"}`);
  const names = tables.map((r: any) => r.table_name);
  console.log(`[db:verify] Tables (${names.length}): ${names.join(", ") || "(none)"}`);
} catch (err) {
  console.error("[db:verify] Connection FAILED:", (err as Error).message);
  process.exit(1);
}