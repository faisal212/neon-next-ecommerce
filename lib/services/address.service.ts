import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { addresses } from '@/lib/db/schema/users';
import { NotFoundError } from '@/lib/errors/api-error';
import type { AddressInput } from '@/lib/validators/user.validators';

export async function listAddresses(userId: string) {
  return db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId));
}

export async function createAddress(userId: string, input: AddressInput) {
  // If this address is default, clear other defaults first
  if (input.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)));
  }

  const [address] = await db
    .insert(addresses)
    .values({
      userId,
      fullName: input.fullName,
      phonePk: input.phonePk,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2 ?? null,
      city: input.city,
      province: input.province,
      postalCode: input.postalCode ?? null,
      isDefault: input.isDefault ?? false,
      isGuest: false,
    })
    .returning();

  return address;
}

export async function createGuestAddress(input: AddressInput) {
  const [address] = await db
    .insert(addresses)
    .values({
      userId: null,
      fullName: input.fullName,
      phonePk: input.phonePk,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2 ?? null,
      city: input.city,
      province: input.province,
      postalCode: input.postalCode ?? null,
      isDefault: false,
      isGuest: true,
    })
    .returning();

  return address;
}

export async function updateAddress(addressId: string, userId: string, input: Partial<AddressInput>) {
  // If setting as default, clear other defaults first
  if (input.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)));
  }

  const [address] = await db
    .update(addresses)
    .set(input)
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
    .returning();

  if (!address) throw new NotFoundError('Address not found');
  return address;
}

export async function deleteAddress(addressId: string, userId: string) {
  const [address] = await db
    .delete(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
    .returning();

  if (!address) throw new NotFoundError('Address not found');
  return address;
}
