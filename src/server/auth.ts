import { ExpressAuth, type ExpressAuthConfig } from '@auth/express';
import { skipCSRFCheck } from '@auth/core';
import NeonAdapter from '@auth/neon-adapter';
import Credentials from '@auth/core/providers/credentials';
import Google from '@auth/core/providers/google';
import { hash, compare } from 'bcryptjs';
import { Pool } from '@neondatabase/serverless';
import { randomBytes } from 'node:crypto';
import { getSql, isDbConfigured } from './db';

// ── AUTH_SECRET enforcement ─────────────────────────────────────────────
// A fixed dev-only secret keeps local development friction-free, but in
// production the app MUST boot with a real secret (>= 32 chars) — otherwise
// JWT cookies would be signed with a predictable key. We fail fast at boot
// instead of logging a warning and running insecure.
export const AUTH_SECRET_MIN_LENGTH = 32;
const DEV_SECRET = 'gabi-dev-only-secret-change-me';

export function resolveAuthSecret(
  nodeEnv: string | undefined,
  envSecret: string | undefined
): string {
  const isProd = nodeEnv === 'production';
  if (isProd && (!envSecret || envSecret.length < AUTH_SECRET_MIN_LENGTH)) {
    throw new Error(
      `AUTH_SECRET is required in production and must be at least ${AUTH_SECRET_MIN_LENGTH} characters ` +
        '(generate with: openssl rand -base64 32). Refusing to start without it.'
    );
  }
  return envSecret && envSecret.length > 0 ? envSecret : DEV_SECRET;
}

const authSecret = resolveAuthSecret(process.env.NODE_ENV, process.env.AUTH_SECRET);

// ── Database adapter (shared so tokens/brands use one pool) ──────────────
let adapterSingleton: any;

export function getAuthAdapter(): any {
  // Never cache a null: DATABASE_URL may not be readable yet when modules
  // first evaluate (see src/server/env.ts) — re-check on every call.
  if (!isDbConfigured()) return null;
  if (!adapterSingleton) {
    adapterSingleton = NeonAdapter(new Pool({ connectionString: process.env.DATABASE_URL! }));
  }
  return adapterSingleton;
}

// ── Verification tokens (email verification + password reset) ────────────
// Built on the Auth.js adapter's createVerificationToken / useVerificationToken,
// which persist to the `verification_token` table with a (identifier, token)
// primary key. A token is single-use and expires automatically.
const TOKEN_BYTES = 32;

/** Issues a single-use token stored under an identifier like `reset:user@x.com`. */
export async function createAuthToken(
  identifier: string,
  ttlMs: number
): Promise<string> {
  const adapter = getAuthAdapter();
  if (!adapter) {
    throw new Error('Email features require DATABASE_URL to be configured.');
  }
  const token = randomBytes(TOKEN_BYTES).toString('hex');
  await adapter.createVerificationToken({
    identifier,
    token,
    expires: new Date(Date.now() + ttlMs),
  });
  return token;
}

/** Consumes (and deletes) a token. Returns false when missing or expired. */
export async function consumeAuthToken(identifier: string, token: string): Promise<boolean> {
  const adapter = getAuthAdapter();
  if (!adapter) return false;
  try {
    const record = await adapter.useVerificationToken({ identifier, token });
    return Boolean(record);
  } catch (err) {
    console.warn('[Auth] Verification token lookup failed:', err);
    return false;
  }
}

const credentialsProvider = Credentials({
  id: 'credentials',
  name: 'Email & Password',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    const db = getSql();
    const email = credentials?.email ? String(credentials.email).trim().toLowerCase() : '';
    const password = credentials?.password ? String(credentials.password) : '';
    if (!db || !email || !password) return null;
    try {
      const rows = await db`
        select id, name, email, password_hash, "emailVerified"
        from users
        where lower(email) = ${email}
      `;
      const user = rows?.[0];
      if (!user || !user.password_hash) return null;
      const valid = await compare(password, user.password_hash);
      if (!valid) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified ?? null,
      };
    } catch (err) {
      console.warn('[Auth] Credentials lookup failed:', err);
      return null;
    }
  },
});

const providers: any[] = [credentialsProvider];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
} else {
  console.warn(
    '[Auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google sign-in disabled.'
  );
}

export const authConfig: ExpressAuthConfig = {
  secret: authSecret,
  trustHost: true,
  skipCSRFCheck,
  basePath: '/api/auth',
  adapter: getAuthAdapter() || undefined,
  session: { strategy: 'jwt' as const },
  providers,
  callbacks: {
    // Expose the stable user id on the session so /api/brands can scope rows.
    // Google-verified accounts are marked email-verified on first sign-in
    // (Google already proved ownership of the address).
    async jwt({ token, user, account }: any) {
      if (user?.id) token.id = user.id;
      if (account?.provider === 'google' && user?.id) {
        token.emailVerified = new Date().toISOString();
        try {
          const sql = getSql();
          if (sql) {
            await sql`
              update users set "emailVerified" = now()
              where id = ${user.id} and "emailVerified" is null
            `;
          }
        } catch (err) {
          console.warn('[Auth] Could not stamp Google email verification:', err);
        }
      }
      return token;
    },
    // The verified state can change after sign-in (a verification link is
    // clicked in another tab), so read it fresh from the DB instead of
    // trusting a JWT-stamped copy. One indexed lookup per session check.
    async session({ session, token }: any) {
      if (!session?.user) return session;
      const uid = token?.id || token?.sub || null;
      session.user.id = uid;
      session.user.emailVerified = null;
      if (uid) {
        try {
          const sql = getSql();
          if (sql) {
            const rows = await sql`
              select "emailVerified" from users where id = ${uid}
            `;
            session.user.emailVerified = rows?.[0]?.['emailVerified'] ?? null;
          }
        } catch (err) {
          console.warn('[Auth] Session emailVerified lookup failed:', err);
        }
      }
      return session;
    },
  },
};

export function authMiddleware() {
  return ExpressAuth(authConfig as any);
}

// ── Email/password registration (Auth.js Credentials has no built-in signup) ──
export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const db = getSql();
  if (!db) {
    throw new Error(
      'Cloud database is not configured. Set DATABASE_URL to enable accounts.'
    );
  }

  const email = input.email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!input.password || input.password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  const existing = await db`select id from users where lower(email) = ${email}`;
  if (existing?.length) {
    throw new Error('An account with this email already exists. Try signing in instead.');
  }

  const id = crypto.randomUUID();
  const passwordHash = await hash(input.password, 10);
  const displayName = input.name?.trim() || null;

  await db`
    insert into users (id, name, email, password_hash)
    values (${id}, ${displayName}, ${email}, ${passwordHash})
  `;

  return { id, email, name: displayName };
}
