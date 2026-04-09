const SESSION_COOKIE = 'cover-session';
const SESSION_MAX_AGE_DAYS = 30;

/**
 * Get session token from document.cookie (client-side only).
 * Creates one if it doesn't exist.
 */
export function getClientSessionToken(): string {
  if (typeof document === 'undefined') return '';

  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]*)`));
  if (match?.[1]) return match[1];

  // Generate a simple random token client-side
  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  const expires = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${SESSION_COOKIE}=${token}; path=/; expires=${expires}; SameSite=Lax`;
  return token;
}
