import { nanoid } from 'nanoid';

/**
 * Generate order number in format: ORD-YYYYMMDD-XXXX
 * Uses nanoid for the suffix to avoid DB sequence complexity.
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');

  const suffix = nanoid(6).toUpperCase();
  return `ORD-${date}-${suffix}`;
}

/**
 * Generate ticket number in format: TKT-XXXXXXXX
 */
export function generateTicketNumber(): string {
  return `TKT-${nanoid(8).toUpperCase()}`;
}
