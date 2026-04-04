import dotenv from 'dotenv';
import { vi } from 'vitest';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Fallback to .env.local if .env.test doesn't exist
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: '.env.local' });
}

// Safety mock: next/headers doesn't exist in vitest node environment.
// If a route handler imports auth without mocking @/lib/auth first, this gives a clear error.
vi.mock('next/headers', () => ({
  headers: () => { throw new Error('next/headers is not available in tests. Mock @/lib/auth instead.'); },
  cookies: () => { throw new Error('next/cookies is not available in tests. Mock @/lib/auth instead.'); },
}));
