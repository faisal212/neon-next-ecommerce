import { z } from 'zod';

export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'KPK',
  'Balochistan',
  'ICT',
  'GB',
  'AJK',
] as const;

export const ADMIN_ROLES = [
  'super_admin',
  'manager',
  'support',
  'warehouse',
] as const;

const phonePkRegex = /^03\d{2}-?\d{7}$/;

export const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  phonePk: z
    .string()
    .regex(phonePkRegex, 'Invalid Pakistan phone number (format: 03XX-XXXXXXX)')
    .optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phonePk: z
    .string()
    .regex(phonePkRegex, 'Invalid Pakistan phone number (format: 03XX-XXXXXXX)')
    .optional(),
});

export const addressSchema = z.object({
  fullName: z.string().min(1).max(120),
  phonePk: z.string().regex(phonePkRegex, 'Invalid Pakistan phone number'),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1).max(80),
  province: z.enum(PAKISTAN_PROVINCES),
  postalCode: z.string().max(10).optional(),
  isDefault: z.boolean().optional(),
});

export const guestAddressSchema = addressSchema.extend({
  isGuest: z.literal(true),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
