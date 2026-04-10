import dotenv from 'dotenv';
import { vi } from 'vitest';

// Load test environment variables. `.env.test` takes priority (e.g. test DB URL),
// then `.env.local` fills in any vars it doesn't define (NEON_AUTH_*, R2_*, etc.).
// dotenv.config() does NOT override existing env vars by default, so the order matters.
dotenv.config({ path: '.env.test' });
dotenv.config({ path: '.env.local' });

// Safety mock: next/headers doesn't exist in vitest node environment.
// If a route handler imports auth without mocking @/lib/auth first, this gives a clear error.
vi.mock('next/headers', () => ({
  headers: () => { throw new Error('next/headers is not available in tests. Mock @/lib/auth instead.'); },
  cookies: () => { throw new Error('next/cookies is not available in tests. Mock @/lib/auth instead.'); },
}));
