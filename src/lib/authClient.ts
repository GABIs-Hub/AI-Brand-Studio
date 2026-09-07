import { BrandBible } from '../types';
import { sanitizeBrandList } from './brandValidation';

// Browser-side client for Auth.js (Express) REST endpoints + the app's
// brand library and image upload APIs. No Firebase, no database credentials
// in the browser — everything goes through the server.

export interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  /** ISO timestamp when the email was verified; null/undefined = unverified. */
  emailVerified?: string | null;
}

export interface Session {
  user?: SessionUser;
  expires?: string;
}

let cachedSession: Session | null | undefined;

export async function getSession(force = false): Promise<Session | null> {
  if (!force && cachedSession !== undefined) return cachedSession;
  try {
    const res = await fetch('/api/auth/session', { credentials: 'same-origin' });
    if (!res.ok) {
      cachedSession = null;
      return null;
    }
    const data = await res.json();
    cachedSession = data && data.user ? (data as Session) : null;
    return cachedSession;
  } catch {
    cachedSession = null;
    return null;
  }
}

async function getCsrfToken(): Promise<string> {
  try {
    const res = await fetch('/api/auth/csrf', { credentials: 'same-origin' });
    const data = await res.json();
    return data?.csrfToken || '';
  } catch {
    return '';
  }
}

export async function signInWithEmail(email: string, password: string): Promise<Session> {
  const csrfToken = await getCsrfToken();
  await fetch('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ csrfToken, email, password, callbackUrl: '/' }).toString(),
    redirect: 'manual',
    credentials: 'same-origin',
  });
  cachedSession = undefined;
  const session = await getSession(true);
  if (!session?.user) {
    throw new Error('Invalid email or password.');
  }
  return session;
}

export async function registerAccount(
  email: string,
  password: string,
  name?: string
): Promise<{ id: string; email: string; name: string | null }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Registration failed.');
  }
  return data.user;
}

/**
 * Google OAuth requires a full-page CSRF-protected POST (this Auth.js build
 * rejects plain GETs to /api/auth/signin/google with UnknownAction). The form
 * submit keeps cookies flowing and bounces the user through Google's consent.
 */
export async function signInWithGoogle(): Promise<void> {
  const csrfToken = await getCsrfToken();
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/api/auth/signin/google';
  form.style.display = 'none';
  const csrfInput = document.createElement('input');
  csrfInput.type = 'hidden';
  csrfInput.name = 'csrfToken';
  csrfInput.value = csrfToken;
  form.appendChild(csrfInput);
  document.body.appendChild(form);
  form.submit();
}

// ── Email verification & password reset ─────────────────────────────────
// All responses are generic by design — the server never reveals whether an
// email has an account (prevents account enumeration).

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'Could not start the password reset.');
  }
}

export async function resetPassword(
  token: string,
  email: string,
  password: string
): Promise<void> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, email, password }),
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'This reset link is invalid or has expired.');
  }
}

export async function verifyEmail(token: string, email: string): Promise<void> {
  const res = await fetch('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, email }),
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'This verification link is invalid or has expired.');
  }
}

export async function resendVerificationEmail(): Promise<void> {
  const res = await fetch('/api/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Could not resend the verification email.');
  }
}

export async function signOut(): Promise<void> {
  try {
    const csrfToken = await getCsrfToken();
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ csrfToken, callbackUrl: '/' }).toString(),
      redirect: 'manual',
      credentials: 'same-origin',
    });
  } catch {
    // Best-effort; the session cookie may already be gone.
  }
  cachedSession = undefined;
}

// ── Brand library API ─────────────────────────────────────────────────────
export async function fetchBrandLibrary(): Promise<BrandBible[]> {
  const res = await fetch('/api/brands', { credentials: 'same-origin' });
  if (res.status === 401) return [];
  if (!res.ok) throw new Error('Failed to load your brand library.');
  const data = await res.json();
  // Sanitize cloud rows so a malformed/partial brand can never crash the app
  // or leak into the library (bad rows are dropped, never throw).
  return sanitizeBrandList(data.brands);
}

export async function saveBrandToCloud(brand: BrandBible): Promise<void> {
  const res = await fetch(`/api/brands/${encodeURIComponent(brand.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brand),
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'Failed to save your brand to the cloud.');
  }
}

export async function deleteBrandFromCloud(id: string): Promise<void> {
  const res = await fetch(`/api/brands/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  if (!res.ok) throw new Error('Failed to delete your brand.');
}

/** Uploads an AI-rendered image (base64 data URL) to server-side storage (R2). */
export async function uploadRenderedImage(dataUrl: string, brandId: string): Promise<string> {
  const res = await fetch('/api/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, brandId }),
    credentials: 'same-origin',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to store image.');
  return data.url;
}