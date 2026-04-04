import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  updateProfileSchema,
  addressSchema,
  PAKISTAN_PROVINCES,
} from '@/lib/validators/user.validators';

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      name: 'Ali Khan',
      email: 'ali@example.com',
      phonePk: '0312-1234567',
    });
    expect(result.success).toBe(true);
  });

  it('accepts registration without phone', () => {
    const result = registerSchema.safeParse({
      name: 'Ali Khan',
      email: 'ali@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = registerSchema.safeParse({
      name: '',
      email: 'ali@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'Ali',
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid Pakistan phone format', () => {
    const result = registerSchema.safeParse({
      name: 'Ali',
      email: 'ali@example.com',
      phonePk: '1234567890',
    });
    expect(result.success).toBe(false);
  });

  it('accepts phone without dash', () => {
    const result = registerSchema.safeParse({
      name: 'Ali',
      email: 'ali@example.com',
      phonePk: '03121234567',
    });
    expect(result.success).toBe(true);
  });

  it('accepts phone with dash', () => {
    const result = registerSchema.safeParse({
      name: 'Ali',
      email: 'ali@example.com',
      phonePk: '0312-1234567',
    });
    expect(result.success).toBe(true);
  });

  it('rejects name longer than 120 chars', () => {
    const result = registerSchema.safeParse({
      name: 'A'.repeat(121),
      email: 'ali@example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  it('accepts partial updates', () => {
    expect(updateProfileSchema.safeParse({ name: 'New Name' }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ phonePk: '0300-1234567' }).success).toBe(true);
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
  });

  it('rejects invalid phone in update', () => {
    const result = updateProfileSchema.safeParse({ phonePk: 'bad' });
    expect(result.success).toBe(false);
  });
});

describe('addressSchema', () => {
  const validAddress = {
    fullName: 'Ali Khan',
    phonePk: '0312-1234567',
    addressLine1: '123 Main St',
    city: 'Lahore',
    province: 'Punjab' as const,
  };

  it('accepts valid address', () => {
    const result = addressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it('accepts all 7 Pakistan provinces', () => {
    for (const province of PAKISTAN_PROVINCES) {
      const result = addressSchema.safeParse({ ...validAddress, province });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid province', () => {
    const result = addressSchema.safeParse({ ...validAddress, province: 'California' });
    expect(result.success).toBe(false);
  });

  it('requires fullName, phonePk, addressLine1, city, province', () => {
    expect(addressSchema.safeParse({}).success).toBe(false);
    expect(addressSchema.safeParse({ fullName: 'Ali' }).success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = addressSchema.safeParse({
      ...validAddress,
      addressLine2: 'Apt 4B',
      postalCode: '54000',
      isDefault: true,
    });
    expect(result.success).toBe(true);
  });
});
