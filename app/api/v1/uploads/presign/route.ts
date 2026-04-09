import { type NextRequest } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { presignSchema } from '@/lib/validators/product.validators';
import { generatePresignedUploadUrl } from '@/lib/r2/client';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function POST(request: NextRequest) {
  try {
    // Accept either regular user or admin
    try {
      await requireAuth();
    } catch {
      await requireAdmin();
    }
    const body = await request.json();
    const data = presignSchema.parse(body);
    const result = await generatePresignedUploadUrl(data.context, data.filename, data.contentType);
    return success(result);
  } catch (error) {
    return handleApiError(error);
  }
}
