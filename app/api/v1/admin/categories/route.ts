import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createCategorySchema } from '@/lib/validators/product.validators';
import { listCategories, createCategory } from '@/lib/services/category.service';
import { success, created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET() {
  try {
    await requireAdmin();
    const cats = await listCategories();
    return success(cats);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const body = await request.json();
    const data = createCategorySchema.parse(body);
    const category = await createCategory(data);
    return created(category);
  } catch (error) {
    return handleApiError(error);
  }
}
