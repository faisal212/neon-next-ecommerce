import { describe, it, expect, beforeEach } from 'vitest';
import { truncateAll } from '../../helpers/db';
import { sendOtp, verifyOtp } from '@/lib/services/otp.service';
import { neon } from '@neondatabase/serverless';
import { eq, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { otpVerifications } from '@/lib/db/schema/support';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

describe('OTP Service (integration)', () => {
  const phone = '0312-1234567';

  beforeEach(async () => {
    await truncateAll();
  });

  it('sends OTP and creates a hashed record', async () => {
    const result = await sendOtp(phone, 'phone_verify');
    expect(result.phonePk).toBe(phone);
    expect(result.purpose).toBe('phone_verify');
    expect(result.expiresIn).toBe(300);

    // Verify the stored OTP is hashed (not plaintext 6-digit)
    const [record] = await db.select().from(otpVerifications)
      .where(eq(otpVerifications.phonePk, phone))
      .orderBy(desc(otpVerifications.createdAt))
      .limit(1);

    expect(record).toBeDefined();
    expect(record.otpCode.length).toBe(64); // SHA-256 hex is 64 chars
    expect(record.isUsed).toBe(false);
    expect(record.attempts).toBe(0);
  });

  it('rejects invalid OTP and increments attempts', async () => {
    await sendOtp(phone, 'guest_checkout');

    await expect(verifyOtp(phone, '000000', 'guest_checkout')).rejects.toThrow('Invalid OTP');

    // Check attempts incremented
    const [record] = await db.select().from(otpVerifications)
      .where(eq(otpVerifications.phonePk, phone))
      .orderBy(desc(otpVerifications.createdAt))
      .limit(1);

    expect(record.attempts).toBe(1);
  });

  it('locks out after 3 failed attempts', async () => {
    await sendOtp(phone, 'phone_verify');

    // 3 wrong attempts
    for (let i = 0; i < 3; i++) {
      try { await verifyOtp(phone, '000000', 'phone_verify'); } catch {}
    }

    // 4th attempt should be locked
    await expect(verifyOtp(phone, '999999', 'phone_verify')).rejects.toThrow('Too many attempts');
  });

  it('rejects expired OTP', async () => {
    await sendOtp(phone, 'phone_verify');

    // Manually expire the OTP
    await sql`UPDATE otp_verifications SET expires_at = NOW() - INTERVAL '1 minute' WHERE phone_pk = ${phone}`;

    await expect(verifyOtp(phone, '123456', 'phone_verify')).rejects.toThrow('expired');
  });

  it('rejects already-used OTP', async () => {
    await sendOtp(phone, 'phone_verify');

    // Manually mark as used
    await sql`UPDATE otp_verifications SET is_used = true WHERE phone_pk = ${phone}`;

    await expect(verifyOtp(phone, '123456', 'phone_verify')).rejects.toThrow('already used');
  });
});
