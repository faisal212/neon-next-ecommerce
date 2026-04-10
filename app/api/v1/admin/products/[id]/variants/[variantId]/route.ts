import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateVariantSchema } from '@/lib/validators/product.validators';
import { updateVariant, deleteVariant } from '@/lib/services/variant.service';
import { invalidateProductById } from '@/lib/cache/revalidate';
import { success, noContent } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id, variantId } = await params;
    const body = await request.json();
    const data = updateVariantSchema.parse(body);
    const variant = await updateVariant(variantId, data);
    await invalidateProductById(id);
    return success(variant);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const { id, variantId } = await params;
    // Invalidate while the product still exists — only the variant
    // is being removed, the product row stays.
    await invalidateProductById(id);
    await deleteVariant(variantId);
    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
