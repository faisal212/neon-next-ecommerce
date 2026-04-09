import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(1).max(40),
  discountType: z.enum(['flat_pkr', 'percentage']),
  discountValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number'),
  minOrderPkr: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  maxDiscountPkr: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().optional().nullable(), // ISO date string
  isActive: z.boolean().optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
