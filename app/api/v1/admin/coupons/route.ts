import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createCouponSchema } from '@/lib/validators/coupon.validators';
import { listCoupons, createCoupon } from '@/lib/services/coupon.service';
import { paginated, created } from '@/lib/utils/api-response';
import { parsePagination } from '@/lib/utils/pagination';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const pagination = parsePagination(request.nextUrl.searchParams);
    const { data, total } = await listCoupons(pagination);

    return paginated(data, {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const body = await request.json();
    const data = createCouponSchema.parse(body);
    const coupon = await createCoupon(data);
    return created(coupon);
  } catch (error) {
    return handleApiError(error);
  }
}
