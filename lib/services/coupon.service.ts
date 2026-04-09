import { eq, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema/orders';
import { ValidationError, NotFoundError } from '@/lib/errors/api-error';
import type { CreateCouponInput } from '@/lib/validators/coupon.validators';
import type { PaginationParams } from '@/lib/utils/pagination';

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

export async function listCoupons(pagination: PaginationParams) {
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(coupons);

  const data = await db
    .select()
    .from(coupons)
    .orderBy(desc(coupons.id))
    .limit(pagination.limit)
    .offset(pagination.offset);

  return { data, total: countResult?.count ?? 0 };
}

export async function getCouponById(id: string) {
  const [coupon] = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);

  if (!coupon) throw new NotFoundError('Coupon not found');
  return coupon;
}

export async function createCoupon(input: CreateCouponInput) {
  const [coupon] = await db
    .insert(coupons)
    .values({
      code: input.code.toUpperCase(),
      discountType: input.discountType,
      discountValue: input.discountValue,
      minOrderPkr: input.minOrderPkr ?? '0',
      maxDiscountPkr: input.maxDiscountPkr ?? null,
      maxUses: input.maxUses ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      isActive: input.isActive ?? true,
    })
    .returning();

  return coupon;
}

export async function updateCoupon(id: string, input: Partial<CreateCouponInput>) {
  const updates: Record<string, unknown> = {};

  if (input.code !== undefined) updates.code = input.code.toUpperCase();
  if (input.discountType !== undefined) updates.discountType = input.discountType;
  if (input.discountValue !== undefined) updates.discountValue = input.discountValue;
  if (input.minOrderPkr !== undefined) updates.minOrderPkr = input.minOrderPkr;
  if (input.maxDiscountPkr !== undefined) updates.maxDiscountPkr = input.maxDiscountPkr ?? null;
  if (input.maxUses !== undefined) updates.maxUses = input.maxUses ?? null;
  if (input.expiresAt !== undefined) updates.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  if (input.isActive !== undefined) updates.isActive = input.isActive;

  const [coupon] = await db
    .update(coupons)
    .set(updates)
    .where(eq(coupons.id, id))
    .returning();

  if (!coupon) throw new NotFoundError('Coupon not found');
  return coupon;
}

export async function deactivateCoupon(id: string) {
  await db
    .update(coupons)
    .set({ isActive: false })
    .where(eq(coupons.id, id));
}
