import { type NextRequest } from 'next/server';
import { validateCouponSchema } from '@/lib/validators/cart.validators';
import { validateCoupon } from '@/lib/services/coupon.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = validateCouponSchema.parse(body);
    const result = await validateCoupon(data.code, data.cartTotal);
    return success(result);
  } catch (error) {
    return handleApiError(error);
  }
}
