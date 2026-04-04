import { describe, it, expect } from 'vitest';
import {
  placeOrderSchema,
  updateOrderStatusSchema,
  assignCourierSchema,
  recordCodSchema,
  STATUS_TRANSITIONS,
} from '@/lib/validators/order.validators';

describe('placeOrderSchema', () => {
  it('accepts valid order with address only', () => {
    const result = placeOrderSchema.safeParse({
      addressId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('accepts order with coupon and notes', () => {
    const result = placeOrderSchema.safeParse({
      addressId: '550e8400-e29b-41d4-a716-446655440000',
      couponCode: 'EID2026',
      customerNotes: 'Please call before delivery',
    });
    expect(result.success).toBe(true);
  });

  it('accepts guest order with phone', () => {
    const result = placeOrderSchema.safeParse({
      addressId: '550e8400-e29b-41d4-a716-446655440000',
      guestPhone: '0312-1234567',
      guestEmail: 'guest@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid guest phone', () => {
    const result = placeOrderSchema.safeParse({
      addressId: '550e8400-e29b-41d4-a716-446655440000',
      guestPhone: '123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing addressId', () => {
    expect(placeOrderSchema.safeParse({}).success).toBe(false);
  });
});

describe('updateOrderStatusSchema', () => {
  it('accepts valid status', () => {
    expect(updateOrderStatusSchema.safeParse({ status: 'confirmed' }).success).toBe(true);
  });

  it('rejects invalid status', () => {
    expect(updateOrderStatusSchema.safeParse({ status: 'flying' }).success).toBe(false);
  });

  it('accepts optional notes', () => {
    const result = updateOrderStatusSchema.safeParse({ status: 'shipped', notes: 'Dispatched via TCS' });
    expect(result.success).toBe(true);
  });
});

describe('STATUS_TRANSITIONS', () => {
  it('allows pending -> confirmed', () => {
    expect(STATUS_TRANSITIONS['pending']).toContain('confirmed');
  });

  it('allows pending -> cancelled', () => {
    expect(STATUS_TRANSITIONS['pending']).toContain('cancelled');
  });

  it('does not allow pending -> shipped', () => {
    expect(STATUS_TRANSITIONS['pending']).not.toContain('shipped');
  });

  it('delivered is terminal', () => {
    expect(STATUS_TRANSITIONS['delivered']).toEqual([]);
  });

  it('cancelled is terminal', () => {
    expect(STATUS_TRANSITIONS['cancelled']).toEqual([]);
  });

  it('shipped can go to delivered or returned', () => {
    expect(STATUS_TRANSITIONS['shipped']).toContain('delivered');
    expect(STATUS_TRANSITIONS['shipped']).toContain('returned');
  });
});

describe('assignCourierSchema', () => {
  it('accepts valid courier', () => {
    const result = assignCourierSchema.safeParse({ courierName: 'TCS' });
    expect(result.success).toBe(true);
  });

  it('rejects unknown courier', () => {
    const result = assignCourierSchema.safeParse({ courierName: 'FedEx' });
    expect(result.success).toBe(false);
  });

  it('accepts all Pakistan couriers', () => {
    for (const name of ['TCS', 'Leopards', 'BlueEx', 'Trax', 'PostEx']) {
      expect(assignCourierSchema.safeParse({ courierName: name }).success).toBe(true);
    }
  });
});

describe('recordCodSchema', () => {
  it('accepts valid COD amount', () => {
    expect(recordCodSchema.safeParse({ amountCollectedPkr: '2500.00' }).success).toBe(true);
  });

  it('rejects invalid amount', () => {
    expect(recordCodSchema.safeParse({ amountCollectedPkr: 'abc' }).success).toBe(false);
  });
});
