import { neon } from '@neondatabase/serverless';
import { BrandBible } from '../types';

// Server-side only: the Postgres connection string must never reach the browser.
let sql: any = null;

export function getSql(): any {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!sql) {
    sql = neon(url);
  }
  return sql;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Fetches all brands owned by a user, newest first. */
export async function getBrandsByUser(userId: string): Promise<BrandBible[]> {
  const db = getSql();
  if (!db) throw new Error('Database is not configured.');
  const rows = await db`
    select data from brands
    where user_id = ${userId}
    order by created_at desc
  `;
  return (rows || []).map((r: any) => r.data as BrandBible);
}

/** Upserts a brand row for a user. Ownership is enforced by the WHERE clause on conflict. */
export async function upsertBrand(userId: string, brand: BrandBible): Promise<void> {
  const db = getSql();
  if (!db) throw new Error('Database is not configured.');
  await db`
    insert into brands (id, user_id, data, brand_name, industry, created_at, updated_at)
    values (
      ${brand.id},
      ${userId},
      ${JSON.stringify(brand)}::jsonb,
      ${brand.brandName || ''},
      ${brand.industry || null},
      now(),
      now()
    )
    on conflict (id) do update set
      data = excluded.data,
      brand_name = excluded.brand_name,
      industry = excluded.industry,
      updated_at = now()
    where brands.user_id = ${userId}
  `;
}

/** Deletes a brand only if it belongs to the requesting user. */
export async function deleteBrand(userId: string, brandId: string): Promise<void> {
  const db = getSql();
  if (!db) throw new Error('Database is not configured.');
  await db`
    delete from brands
    where id = ${brandId} and user_id = ${userId}
  `;
}