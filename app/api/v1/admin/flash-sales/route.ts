import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listFlashSales, createFlashSale } from '@/lib/services/flash-sale.service';
import { invalidateFlashSales } from '@/lib/cache/revalidate';
import { success, created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { z } from 'zod';

const createFlashSaleSchema = z.object({
  name: z.string().min(1).max(120),
  discountType: z.enum(['flat_pkr', 'percentage']),
  discountValue: z.string().regex(/^\d+(\.\d{1,2})?$/),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const sales = await listFlashSales();
    return success(sales);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const body = await request.json();
    const data = createFlashSaleSchema.parse(body);
    const sale = await createFlashSale({
      ...data,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
    });
    invalidateFlashSales();
    return created(sale);
  } catch (error) {
    return handleApiError(error);
  }
}
