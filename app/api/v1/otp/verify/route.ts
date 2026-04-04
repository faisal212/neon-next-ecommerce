import { type NextRequest } from 'next/server';
import { verifyOtp } from '@/lib/services/otp.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { z } from 'zod';

const verifyOtpSchema = z.object({
  phonePk: z.string().regex(/^03\d{2}-?\d{7}$/),
  otp: z.string().length(6),
  purpose: z.enum(['guest_checkout', 'phone_verify']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = verifyOtpSchema.parse(body);
    const result = await verifyOtp(data.phonePk, data.otp, data.purpose);
    return success(result);
  } catch (error) {
    return handleApiError(error);
  }
}
