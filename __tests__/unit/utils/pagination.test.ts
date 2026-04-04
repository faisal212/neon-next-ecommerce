import { describe, it, expect } from 'vitest';
import { parsePagination } from '@/lib/utils/pagination';

describe('parsePagination', () => {
  it('returns defaults when no params provided', () => {
    const params = new URLSearchParams();
    const result = parsePagination(params);
    expect(result).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  it('parses valid page and limit', () => {
    const params = new URLSearchParams({ page: '3', limit: '10' });
    const result = parsePagination(params);
    expect(result).toEqual({ page: 3, limit: 10, offset: 20 });
  });

  it('defaults page to 1 when page is 0', () => {
    const params = new URLSearchParams({ page: '0' });
    const result = parsePagination(params);
    expect(result.page).toBe(1);
  });

  it('defaults page to 1 when page is negative', () => {
    const params = new URLSearchParams({ page: '-5' });
    const result = parsePagination(params);
    expect(result.page).toBe(1);
  });

  it('defaults limit to 20 when limit is 0', () => {
    const params = new URLSearchParams({ limit: '0' });
    const result = parsePagination(params);
    expect(result.limit).toBe(20);
  });

  it('defaults limit to 20 when limit is negative', () => {
    const params = new URLSearchParams({ limit: '-10' });
    const result = parsePagination(params);
    expect(result.limit).toBe(20);
  });

  it('caps limit at 100', () => {
    const params = new URLSearchParams({ limit: '500' });
    const result = parsePagination(params);
    expect(result.limit).toBe(100);
  });

  it('defaults when non-numeric values provided', () => {
    const params = new URLSearchParams({ page: 'abc', limit: 'xyz' });
    const result = parsePagination(params);
    expect(result).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  it('calculates offset correctly for page 2 limit 25', () => {
    const params = new URLSearchParams({ page: '2', limit: '25' });
    const result = parsePagination(params);
    expect(result.offset).toBe(25);
  });
});
