import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createVariantSchema } from '@/lib/validators/product.validators';
import { listVariants, createVariant } from '@/lib/services/variant.service';
import { success, created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const variants = await listVariants(id);
    return success(variants);
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
    const data = createVariantSchema.parse(body);
    const variant = await createVariant(id, data);
    return created(variant);
  } catch (error) {
    return handleApiError(error);
  }
}
