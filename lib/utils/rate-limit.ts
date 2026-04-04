/**
 * Simple in-memory rate limiter.
 * For production, use Redis/Upstash. This is sufficient for single-instance deployments.
 */
const store = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export function rateLimitResponse(result: RateLimitResult): Response {
  return Response.json(
    { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
    {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
        'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
      },
    },
  );
}
