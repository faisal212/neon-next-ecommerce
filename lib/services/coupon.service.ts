import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema/orders';
import { ValidationError, NotFoundError } from '@/lib/errors/api-error';

export interface CouponResult {
  couponId: string;
  code: string;
  discountType: string;
  discountValue: string;
  discountAmount: string;
}

export async function validateCoupon(code: string, cartTotal: string): Promise<CouponResult> {
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code.toUpperCase()))
    .limit(1);

  if (!coupon) throw new NotFoundError('Coupon not found');

  if (!coupon.isActive) {
    throw new ValidationError('Coupon is no longer active');
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    throw new ValidationError('Coupon has expired');
  }

  if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
    throw new ValidationError('Coupon usage limit reached');
  }

  const total = parseFloat(cartTotal);
  const minOrder = parseFloat(coupon.minOrderPkr);

  if (total < minOrder) {
    throw new ValidationError(`Minimum order amount is Rs. ${minOrder}`);
  }

  // Calculate discount
  let discountAmount: number;

  if (coupon.discountType === 'flat_pkr') {
    discountAmount = parseFloat(coupon.discountValue);
  } else {
    // percentage
    discountAmount = total * (parseFloat(coupon.discountValue) / 100);

    // Cap at maxDiscountPkr
    if (coupon.maxDiscountPkr) {
      const cap = parseFloat(coupon.maxDiscountPkr);
      if (discountAmount > cap) {
        discountAmount = cap;
      }
    }
  }

  // Discount cannot exceed cart total
  if (discountAmount > total) {
    discountAmount = total;
  }

  return {
    couponId: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: discountAmount.toFixed(2),
  };
}

export async function incrementCouponUsage(couponId: string) {
  await db
    .update(coupons)
    .set({ usesCount: sql`${coupons.usesCount} + 1` })
    .where(eq(coupons.id, couponId));
}
