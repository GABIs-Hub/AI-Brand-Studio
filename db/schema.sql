-- GABI — Generate. Align. Build. Inspire. — Neon (Postgres) schema
-- Auth.js adapter tables (users, accounts, sessions, verification_token) + brand library.
-- Apply with:  npm run db:migrate     (or: tsx db/migrate.ts)
-- NOTE: the quoted camelCase columns ("emailVerified", "userId", "providerAccountId",
-- "sessionToken") are REQUIRED by @auth/neon-adapter — do not rename them.
-- The `brands` table is our own and intentionally uses snake_case.

-- ── Auth.js (Neon adapter) core tables ─────────────────────────────
create table if not exists users (
  id text primary key,
  name text,
  email text unique,
  "emailVerified" timestamp with time zone,
  image text,
  password_hash text,
  created_at timestamp with time zone default now()
);

create table if not exists accounts (
  id text primary key,
  "userId" text not null references users(id) on delete cascade,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  unique (provider, "providerAccountId")
);

create table if not exists sessions (
  id text primary key,
  "sessionToken" text unique not null,
  "userId" text not null references users(id) on delete cascade,
  expires timestamp with time zone not null
);

create table if not exists verification_token (
  identifier text,
  token text,
  expires timestamp with time zone not null,
  primary key (identifier, token)
);

-- ── Brand library ──────────────────────────────────────────────────
-- The full BrandBible is stored as JSONB in `data`; the relational columns
-- are denormalized copies used for fast listing/search.
create table if not exists brands (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  data jsonb not null,
  brand_name text,
  industry text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists brands_user_id_idx on brands (user_id);
create index if not exists brands_created_at_idx on brands (created_at desc);
create index if not exists brands_name_idx on brands (brand_name);