import { describe, it, expect, beforeEach } from 'vitest';
import { truncateAll } from '../../helpers/db';
import { seedCoupon } from '../../helpers/factories';
import { validateCoupon } from '@/lib/services/coupon.service';

describe('Coupon Service (integration)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('validates a flat_pkr coupon and returns correct discount', async () => {
    const coupon = await seedCoupon({
      discountType: 'flat_pkr',
      discountValue: '300.00',
      minOrderPkr: '1000.00',
    });

    const result = await validateCoupon(coupon.code, '2500.00');
    expect(result.discountAmount).toBe('300.00');
    expect(result.couponId).toBe(coupon.id);
  });

  it('validates a percentage coupon and caps at maxDiscountPkr', async () => {
    const coupon = await seedCoupon({
      discountType: 'percentage',
      discountValue: '20.00',
      minOrderPkr: '500.00',
      maxDiscountPkr: '400.00',
    });

    // 20% of 5000 = 1000, but capped at 400
    const result = await validateCoupon(coupon.code, '5000.00');
    expect(result.discountAmount).toBe('400.00');
  });

  it('calculates percentage without cap when maxDiscountPkr is null', async () => {
    const coupon = await seedCoupon({
      discountType: 'percentage',
      discountValue: '10.00',
      minOrderPkr: '0.00',
      maxDiscountPkr: null,
    });

    const result = await validateCoupon(coupon.code, '3000.00');
    expect(result.discountAmount).toBe('300.00');
  });

  it('rejects expired coupon', async () => {
    await seedCoupon({
      expiresAt: new Date('2020-01-01'),
    });

    await expect(validateCoupon('COUPON-EXPIRED', '2000.00')).rejects.toThrow();
  });

  it('rejects coupon when cart total is below minimum', async () => {
    const coupon = await seedCoupon({
      minOrderPkr: '5000.00',
    });

    await expect(validateCoupon(coupon.code, '1000.00')).rejects.toThrow('Minimum order amount');
  });

  it('rejects coupon that has reached max uses', async () => {
    const coupon = await seedCoupon({
      maxUses: 5,
      usesCount: 5,
    });

    await expect(validateCoupon(coupon.code, '2000.00')).rejects.toThrow('usage limit');
  });

  it('rejects inactive coupon', async () => {
    const coupon = await seedCoupon({
      isActive: false,
    });

    await expect(validateCoupon(coupon.code, '2000.00')).rejects.toThrow('no longer active');
  });

  it('discount cannot exceed cart total', async () => {
    const coupon = await seedCoupon({
      discountType: 'flat_pkr',
      discountValue: '5000.00',
      minOrderPkr: '0.00',
    });

    const result = await validateCoupon(coupon.code, '200.00');
    expect(result.discountAmount).toBe('200.00');
  });
});
