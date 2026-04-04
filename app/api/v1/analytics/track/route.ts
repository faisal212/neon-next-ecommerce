import { type NextRequest } from 'next/server';
import { createOrResumeSession, trackPageView, trackProductView, trackCartEvent, trackSearch } from '@/lib/services/analytics.service';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';
import { z } from 'zod';

const trackEventSchema = z.object({
  sessionToken: z.string().min(1),
  type: z.enum(['page_view', 'product_view', 'cart_event', 'search']),
  data: z.record(z.string(), z.unknown()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, type, data } = trackEventSchema.parse(body);

    const session = await createOrResumeSession(sessionToken, data as Record<string, string>);

    let result;
    switch (type) {
      case 'page_view':
        result = await trackPageView(session.id, data as { pageUrl: string; pageType?: string });
        break;
      case 'product_view':
        result = await trackProductView(session.id, data.productId as string, data.variantId as string | undefined);
        break;
      case 'cart_event':
        result = await trackCartEvent(session.id, data as { variantId: string; eventType: string; quantity: number; pricePkr: string });
        break;
      case 'search':
        result = await trackSearch(session.id, data.query as string, (data.resultsCount as number) ?? 0);
        break;
    }

    return success(result);
  } catch (error) {
    return handleApiError(error);
  }
}
