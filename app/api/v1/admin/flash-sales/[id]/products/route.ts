import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getFlashSaleProducts, addFlashSaleProduct } from '@/lib/services/flash-sale.service';
import { invalidateFlashSales, invalidateProductById } from '@/lib/cache/revalidate';
import { success, created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { z } from 'zod';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const products = await getFlashSaleProducts(id);
    return success(products);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id } = await params;
    const body = await request.json();
    const data = z.object({
      productId: z.string().uuid(),
      overridePricePkr: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
      stockLimit: z.number().int().min(1).optional(),
    }).parse(body);
    const item = await addFlashSaleProduct(id, data);
    invalidateFlashSales();
    await invalidateProductById(data.productId);
    return created(item);
  } catch (error) {
    return handleApiError(error);
  }
}
