import { describe, it, expect } from 'vitest';
import { rateLimit, rateLimitResponse } from '@/lib/utils/rate-limit';

describe('rateLimit', () => {
  it('allows first request', () => {
    const result = rateLimit(`test-${Date.now()}-1`, 5, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('decrements remaining on each call', () => {
    const key = `test-${Date.now()}-2`;
    rateLimit(key, 3, 60000);
    const r2 = rateLimit(key, 3, 60000);
    expect(r2.remaining).toBe(1);
    const r3 = rateLimit(key, 3, 60000);
    expect(r3.remaining).toBe(0);
  });

  it('blocks after max requests reached', () => {
    const key = `test-${Date.now()}-3`;
    rateLimit(key, 2, 60000);
    rateLimit(key, 2, 60000);
    const r3 = rateLimit(key, 2, 60000);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it('resets after window expires', async () => {
    const key = `test-${Date.now()}-4`;
    rateLimit(key, 1, 50); // 50ms window
    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 60));
    const r2 = rateLimit(key, 1, 50);
    expect(r2.allowed).toBe(true);
  });

  it('rateLimitResponse returns 429 with headers', () => {
    const res = rateLimitResponse({ allowed: false, remaining: 0, resetAt: Date.now() + 30000 });
    expect(res.status).toBe(429);
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(res.headers.get('Retry-After')).toBeDefined();
  });
});
