import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateCouponSchema } from '@/lib/validators/coupon.validators';
import { getCouponById, updateCoupon, deactivateCoupon } from '@/lib/services/coupon.service';
import { success, noContent } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const coupon = await getCouponById(id);
    return success(coupon);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id } = await params;
    const body = await request.json();
    const data = updateCouponSchema.parse(body);
    const coupon = await updateCoupon(id, data);
    return success(coupon);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id } = await params;
    await deactivateCoupon(id);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
