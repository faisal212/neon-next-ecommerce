import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getFlashSaleById, updateFlashSale } from '@/lib/services/flash-sale.service';
import { invalidateFlashSales } from '@/lib/cache/revalidate';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const sale = await getFlashSaleById(id);
    return success(sale);
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
    const updates: Record<string, unknown> = { ...body };
    if (body.startsAt) updates.startsAt = new Date(body.startsAt);
    if (body.endsAt) updates.endsAt = new Date(body.endsAt);
    const sale = await updateFlashSale(id, updates);
    invalidateFlashSales();
    return success(sale);
  } catch (error) {
    return handleApiError(error);
  }
}
