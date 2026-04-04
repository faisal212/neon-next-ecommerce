import { type NextRequest } from 'next/server';
import { sendOtp } from '@/lib/services/otp.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { rateLimit, rateLimitResponse } from '@/lib/utils/rate-limit';
import { z } from 'zod';

const sendOtpSchema = z.object({
  phonePk: z.string().regex(/^03\d{2}-?\d{7}$/),
  purpose: z.enum(['guest_checkout', 'phone_verify']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = sendOtpSchema.parse(body);

    // Rate limit: 5 OTPs per phone per 15 minutes
    const rl = rateLimit(`otp:${data.phonePk}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) return rateLimitResponse(rl);

    const result = await sendOtp(data.phonePk, data.purpose);
    return success(result);
  } catch (error) {
    return handleApiError(error);
  }
}
