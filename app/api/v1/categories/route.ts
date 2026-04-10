import { connection } from 'next/server';
import { getCategoryTree } from '@/lib/services/category.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET() {
  try {
    await connection();
    const tree = await getCategoryTree();
    return success(tree);
  } catch (error) {
    return handleApiError(error);
  }
}
