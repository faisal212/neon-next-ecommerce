import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

const SESSION_COOKIE = 'cover-session';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Get session token from cookies (server-side only).
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

/**
 * Get or create session token (server-side only).
 * Sets the cookie if it doesn't exist.
 */
export async function ensureSessionToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const token = nanoid(32);
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  return token;
}
