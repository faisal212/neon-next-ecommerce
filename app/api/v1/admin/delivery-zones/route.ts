import { type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listZones, createZone } from '@/lib/services/delivery-zone.service';
import { success, created } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET() {
  try {
    await requireAdmin();
    const zones = await listZones();
    return success(zones);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(['super_admin', 'manager']);
    const body = await request.json();
    const zone = await createZone(body);
    return created(zone);
  } catch (error) {
    return handleApiError(error);
  }
}
