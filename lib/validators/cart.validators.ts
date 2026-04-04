import { z } from 'zod';

export const addCartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});

export const mergeCartSchema = z.object({
  guestSessionToken: z.string().min(1),
  strategy: z.enum(['keep_higher_qty', 'keep_user_cart', 'merge_all']).default('merge_all'),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1).max(40),
  cartTotal: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid amount'),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type MergeCartInput = z.infer<typeof mergeCartSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
