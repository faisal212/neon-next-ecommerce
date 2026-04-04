import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '@/lib/errors/api-error';

describe('API Error classes', () => {
  it('AppError carries statusCode and code', () => {
    const err = new AppError('test', 418, 'TEAPOT');
    expect(err.message).toBe('test');
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe('TEAPOT');
    expect(err).toBeInstanceOf(Error);
  });

  it('ValidationError is 400', () => {
    const err = new ValidationError('bad input', [{ field: 'email' }]);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual([{ field: 'email' }]);
  });

  it('ValidationError details default to undefined', () => {
    const err = new ValidationError('bad');
    expect(err.details).toBeUndefined();
  });

  it('AuthenticationError is 401', () => {
    const err = new AuthenticationError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('AUTHENTICATION_ERROR');
    expect(err.message).toBe('Authentication required');
  });

  it('AuthenticationError accepts custom message', () => {
    const err = new AuthenticationError('Token expired');
    expect(err.message).toBe('Token expired');
  });

  it('ForbiddenError is 403', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  it('NotFoundError is 404', () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Resource not found');
  });

  it('NotFoundError accepts custom message', () => {
    const err = new NotFoundError('User not found');
    expect(err.message).toBe('User not found');
  });

  it('ConflictError is 409', () => {
    const err = new ConflictError();
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });

  it('all errors are instances of AppError', () => {
    expect(new ValidationError('x')).toBeInstanceOf(AppError);
    expect(new AuthenticationError()).toBeInstanceOf(AppError);
    expect(new ForbiddenError()).toBeInstanceOf(AppError);
    expect(new NotFoundError()).toBeInstanceOf(AppError);
    expect(new ConflictError()).toBeInstanceOf(AppError);
  });
});
