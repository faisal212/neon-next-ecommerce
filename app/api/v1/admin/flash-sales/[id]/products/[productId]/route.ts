import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { removeFlashSaleProduct } from '@/lib/services/flash-sale.service';
import { invalidateFlashSales, invalidateProductById } from '@/lib/cache/revalidate';
import { noContent } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { productId } = await params;
    // Invalidate the product cache BEFORE removing the flash sale link,
    // while we still have the productId. The product row itself is not
    // deleted — only the flash_sale_products join row is.
    await invalidateProductById(productId);
    await removeFlashSaleProduct(productId);
    invalidateFlashSales();
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
