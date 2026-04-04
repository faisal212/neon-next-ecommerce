import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { presignSchema } from '@/lib/validators/product.validators';
import { generatePresignedUploadUrl } from '@/lib/r2/client';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const data = presignSchema.parse(body);
    const result = await generatePresignedUploadUrl(data.context, data.filename, data.contentType);
    return success(result);
  } catch (error) {
    return handleApiError(error);
  }
}
