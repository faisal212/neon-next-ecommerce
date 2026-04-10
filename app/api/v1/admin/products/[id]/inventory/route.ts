import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { updateInventorySchema } from '@/lib/validators/product.validators';
import { getInventory, updateStock } from '@/lib/services/inventory.service';
import { invalidateProductById } from '@/lib/cache/revalidate';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const inv = await getInventory(id);
    return success(inv);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(['super_admin', 'manager', 'warehouse']);
    const { id } = await params;
    const body = await request.json();
    const data = updateInventorySchema.parse(body);
    const inv = await updateStock(id, data);
    await invalidateProductById(id);
    return success(inv);
  } catch (error) {
    return handleApiError(error);
  }
}
