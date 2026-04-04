import { describe, it, expect, vi } from 'vitest';
import { handleApiError } from '@/lib/errors/handler';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
} from '@/lib/errors/api-error';

describe('handleApiError', () => {
  it('maps ValidationError to 400 with details', async () => {
    const err = new ValidationError('bad input', [{ field: 'email' }]);
    const res = handleApiError(err);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'bad input',
        details: [{ field: 'email' }],
      },
    });
  });

  it('maps AuthenticationError to 401', async () => {
    const res = handleApiError(new AuthenticationError());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('maps NotFoundError to 404', async () => {
    const res = handleApiError(new NotFoundError('User not found'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.message).toBe('User not found');
  });

  it('maps ConflictError to 409', async () => {
    const res = handleApiError(new ConflictError());
    expect(res.status).toBe(409);
  });

  it('maps generic AppError with custom status', async () => {
    const res = handleApiError(new AppError('rate limited', 429, 'RATE_LIMITED'));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error.code).toBe('RATE_LIMITED');
  });

  it('maps Zod-like errors to 400 with field details', async () => {
    // Simulate a Zod error shape (has issues array)
    const zodLike = new Error('Validation failed');
    (zodLike as unknown as Record<string, unknown>).issues = [
      { message: 'Required', path: ['email'] },
      { message: 'Must be positive', path: ['price', 'amount'] },
    ];
    const res = handleApiError(zodLike);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toEqual([
      { path: 'email', message: 'Required' },
      { path: 'price.amount', message: 'Must be positive' },
    ]);
  });

  it('maps unknown errors to 500 without leaking details', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = handleApiError(new Error('secret db connection string'));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.message).toBe('An unexpected error occurred');
    expect(body.error.code).toBe('INTERNAL_ERROR');
    vi.restoreAllMocks();
  });

  it('handles non-Error objects gracefully', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = handleApiError('string error');
    expect(res.status).toBe(500);
    vi.restoreAllMocks();
  });
});
