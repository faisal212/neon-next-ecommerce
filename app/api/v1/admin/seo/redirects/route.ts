import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listRedirects, createRedirect } from '@/lib/services/seo.service';
import { success, created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET() {
  try {
    await requireAdmin();
    const redirects = await listRedirects();
    return success(redirects);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const body = await request.json();
    const redirect = await createRedirect(body.fromPath, body.toPath, body.redirectType);
    return created(redirect);
  } catch (error) {
    return handleApiError(error);
  }
}
