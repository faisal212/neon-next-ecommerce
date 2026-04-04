import { describe, it, expect } from 'vitest';
import { generateOrderNumber, generateTicketNumber } from '@/lib/utils/order-number';

describe('generateOrderNumber', () => {
  it('starts with ORD-', () => {
    const num = generateOrderNumber();
    expect(num).toMatch(/^ORD-/);
  });

  it('contains date in YYYYMMDD format', () => {
    const num = generateOrderNumber();
    const dateStr = num.split('-')[1];
    expect(dateStr).toMatch(/^\d{8}$/);

    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6));
    const day = parseInt(dateStr.substring(6, 8));
    expect(year).toBeGreaterThanOrEqual(2024);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
  });

  it('has 6-char uppercase suffix', () => {
    const num = generateOrderNumber();
    const suffix = num.split('-')[2];
    expect(suffix).toMatch(/^[A-Z0-9_-]{6}$/);
  });

  it('generates unique numbers', () => {
    const numbers = new Set(Array.from({ length: 100 }, () => generateOrderNumber()));
    expect(numbers.size).toBe(100);
  });
});

describe('generateTicketNumber', () => {
  it('starts with TKT-', () => {
    expect(generateTicketNumber()).toMatch(/^TKT-/);
  });

  it('has 8-char uppercase suffix', () => {
    const num = generateTicketNumber();
    const suffix = num.substring(4);
    expect(suffix).toMatch(/^[A-Z0-9_-]{8}$/);
  });

  it('generates unique numbers', () => {
    const numbers = new Set(Array.from({ length: 100 }, () => generateTicketNumber()));
    expect(numbers.size).toBe(100);
  });
});
