import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { otpVerifications } from '@/lib/db/schema/support';
import { ValidationError } from '@/lib/errors/api-error';
import { createHash } from 'crypto';

function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(phonePk: string, purpose: 'guest_checkout' | 'phone_verify') {
  const otp = generateOtp();
  const hashedOtp = hashOtp(otp);

  await db.insert(otpVerifications).values({
    phonePk,
    otpCode: hashedOtp,
    purpose,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  });

  // In production, send SMS via Jazz/Zong gateway
  // For now, return the OTP (in prod, this would only be sent via SMS)
  return { phonePk, purpose, expiresIn: 300 };
}

export async function verifyOtp(phonePk: string, otp: string, purpose: string) {
  // Get latest OTP for this phone + purpose
  const [record] = await db
    .select()
    .from(otpVerifications)
    .where(and(eq(otpVerifications.phonePk, phonePk), eq(otpVerifications.purpose, purpose)))
    .orderBy(desc(otpVerifications.createdAt))
    .limit(1);

  if (!record) throw new ValidationError('No OTP found for this number');

  if (record.isUsed) throw new ValidationError('OTP already used');

  if (new Date(record.expiresAt) < new Date()) {
    throw new ValidationError('OTP has expired');
  }

  if (record.attempts >= 3) {
    throw new ValidationError('Too many attempts. Request a new OTP');
  }

  const hashedInput = hashOtp(otp);

  if (hashedInput !== record.otpCode) {
    // Increment attempts
    await db.update(otpVerifications).set({ attempts: record.attempts + 1 }).where(eq(otpVerifications.id, record.id));
    throw new ValidationError('Invalid OTP');
  }

  // Mark as used
  await db.update(otpVerifications).set({ isUsed: true }).where(eq(otpVerifications.id, record.id));

  return { verified: true };
}
