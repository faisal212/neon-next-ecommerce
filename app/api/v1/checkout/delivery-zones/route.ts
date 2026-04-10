import { type NextRequest, connection } from 'next/server';
import { eq, and, ilike } from 'drizzle-orm';
import { db } from '@/lib/db';
import { deliveryZones } from '@/lib/db/schema/orders';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

export async function GET(request: NextRequest) {
  try {
    await connection();
    const city = request.nextUrl.searchParams.get('city');

    const conditions = [eq(deliveryZones.isActive, true)];
    if (city) {
      conditions.push(ilike(deliveryZones.city, `%${city}%`));
    }

    const zones = await db
      .select()
      .from(deliveryZones)
      .where(and(...conditions));

    return success({ zones });
  } catch (error) {
    return handleApiError(error);
  }
}
