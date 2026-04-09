import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { removeFlashSaleProduct } from '@/lib/services/flash-sale.service';
import { noContent } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { productId } = await params;
    await removeFlashSaleProduct(productId);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
