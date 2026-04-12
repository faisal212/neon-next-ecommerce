import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateProductSchema } from '@/lib/validators/product.validators';
import { getProductById, updateProduct, deleteProduct } from '@/lib/services/product.service';
import { invalidateProductBySlug, invalidateHomepage } from '@/lib/cache/revalidate';
import { success, noContent } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await getProductById(id);
    return success(product);
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
    const data = updateProductSchema.parse(body);

    // Capture the current slug BEFORE the update — a rename regenerates
    // the slug (see product.service.ts::updateProduct), so we need to
    // flush both the old and new cache entries.
    const before = await getProductById(id);
    const product = await updateProduct(id, data);

    invalidateProductBySlug(before.slug);
    if (product.slug !== before.slug) {
      invalidateProductBySlug(product.slug);
    }
    invalidateHomepage();

    return success(product);
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

    // The product row is gone after `deleteProduct` returns, so the
    // service hands back the slug for cache-tag invalidation.
    const { slug } = await deleteProduct(id);

    invalidateProductBySlug(slug);
    invalidateHomepage();

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
