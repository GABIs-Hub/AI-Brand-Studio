import { ExpressAuth } from '@auth/express';
import NeonAdapter from '@auth/neon-adapter';
import Credentials from '@auth/core/providers/credentials';
import Google from '@auth/core/providers/google';
import { hash, compare } from 'bcryptjs';
import { Pool } from '@neondatabase/serverless';
import { getSql, isDbConfigured } from './db';

// ── Configuration ──────────────────────────────────────────────────────
// AUTH_SECRET is required in production. In local dev it falls back to a
// fixed dev-only secret (documented in .env.example and the README).
const DEV_SECRET = 'brand-studio-dev-only-secret-change-me';
const authSecret =
  process.env.AUTH_SECRET || (process.env.NODE_ENV !== 'production' ? DEV_SECRET : undefined);

if (!authSecret) {
  console.error('[Auth] AUTH_SECRET is required in production. Set it in your environment.');
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
        select id, name, email, password_hash
        from users
        where lower(email) = ${email}
      `;
      const user = rows?.[0];
      if (!user || !user.password_hash) return null;
      const valid = await compare(password, user.password_hash);
      if (!valid) return null;
      return { id: user.id, name: user.name, email: user.email };
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

export const authConfig = {
  secret: authSecret,
  trustHost: true,
  basePath: '/api/auth',
  adapter: isDbConfigured()
    ? NeonAdapter(new Pool({ connectionString: process.env.DATABASE_URL! }))
    : undefined,
  session: { strategy: 'jwt' as const },
  providers,
  callbacks: {
    // Expose the stable user id on the session so /api/brands can scope rows.
    jwt({ token, user }: any) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }: any) {
      if (session.user) {
        session.user.id = token?.id || token?.sub || null;
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