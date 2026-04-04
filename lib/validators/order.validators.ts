import { z } from 'zod';

export const ORDER_STATUSES = [
  'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned',
] as const;

// Valid status transitions
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['shipped'],
  shipped: ['delivered', 'returned'],
  delivered: [],
  cancelled: [],
  returned: [],
};

export const placeOrderSchema = z.object({
  addressId: z.string().uuid(),
  couponCode: z.string().max(40).optional(),
  customerNotes: z.string().max(500).optional(),
  // Guest fields (required when not authenticated)
  guestPhone: z.string().regex(/^03\d{2}-?\d{7}$/).optional(),
  guestEmail: z.string().email().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  notes: z.string().max(500).optional(),
});

export const assignCourierSchema = z.object({
  courierName: z.enum(['TCS', 'Leopards', 'BlueEx', 'Trax', 'PostEx']),
  trackingNumber: z.string().max(80).optional(),
  riderName: z.string().max(120).optional(),
  riderPhone: z.string().max(20).optional(),
  estimatedDelivery: z.string().optional(),
});

export const recordCodSchema = z.object({
  amountCollectedPkr: z.string().regex(/^\d+(\.\d{1,2})?$/),
  remarks: z.string().max(500).optional(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AssignCourierInput = z.infer<typeof assignCourierSchema>;
export type RecordCodInput = z.infer<typeof recordCodSchema>;
