import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateProductSchema } from '@/lib/validators/product.validators';
import { getProductById, updateProduct } from '@/lib/services/product.service';
import { success } from '@/lib/utils/api-response';
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
    const product = await updateProduct(id, data);
    return success(product);
  } catch (error) {
    return handleApiError(error);
  }
}
