import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateCategorySchema } from '@/lib/validators/product.validators';
import { getCategoryById, updateCategory } from '@/lib/services/category.service';
import {
  invalidateCategoryBySlug,
  invalidateHomepage,
  invalidateStoreLayout,
} from '@/lib/cache/revalidate';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const category = await getCategoryById(id);
    return success(category);
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
    const data = updateCategorySchema.parse(body);

    // Capture the current slug BEFORE the update — a rename regenerates
    // the slug (see category.service.ts::updateCategory), so we need to
    // flush both the old and new cache entries.
    const before = await getCategoryById(id);
    const category = await updateCategory(id, data);

    invalidateCategoryBySlug(before.slug);
    if (category.slug !== before.slug) {
      invalidateCategoryBySlug(category.slug);
    }
    invalidateHomepage();
    invalidateStoreLayout();

    return success(category);
  } catch (error) {
    return handleApiError(error);
  }
}
