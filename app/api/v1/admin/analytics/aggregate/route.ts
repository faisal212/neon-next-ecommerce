import { requireAdmin } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { success } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/errors/handler';

/**
 * Daily aggregation endpoint — call via Vercel Cron or manually.
 * Aggregates yesterday's data into daily_product_stats and daily_traffic_stats.
 */
export async function POST() {
  try {
    await requireAdmin(['super_admin']);
    const sql = neon(process.env.DATABASE_URL!);

    // Aggregate product stats for yesterday
    await sql`
      INSERT INTO daily_product_stats (id, stat_date, product_id, views, add_to_cart_count, orders_count, revenue_pkr, returns_count)
      SELECT
        gen_random_uuid(),
        (CURRENT_DATE - INTERVAL '1 day')::date,
        pv.product_id,
        COUNT(DISTINCT pv.id),
        COALESCE((SELECT COUNT(*) FROM cart_events ce WHERE ce.variant_id IN (SELECT id FROM product_variants WHERE product_id = pv.product_id) AND ce.event_type = 'add' AND ce.created_at >= CURRENT_DATE - INTERVAL '1 day' AND ce.created_at < CURRENT_DATE), 0),
        COALESCE((SELECT COUNT(DISTINCT oi.order_id) FROM order_items oi JOIN product_variants v ON oi.variant_id = v.id WHERE v.product_id = pv.product_id AND oi.id IN (SELECT id FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE))), 0),
        COALESCE((SELECT SUM(oi.total_pkr::numeric) FROM order_items oi JOIN product_variants v ON oi.variant_id = v.id WHERE v.product_id = pv.product_id AND oi.order_id IN (SELECT id FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE)), 0),
        0
      FROM product_views pv
      WHERE pv.viewed_at >= CURRENT_DATE - INTERVAL '1 day' AND pv.viewed_at < CURRENT_DATE
      GROUP BY pv.product_id
      ON CONFLICT DO NOTHING
    `;

    // Aggregate traffic stats for yesterday
    await sql`
      INSERT INTO daily_traffic_stats (id, stat_date, utm_source, utm_medium, province, sessions_count, orders_count, revenue_pkr, conversion_rate)
      SELECT
        gen_random_uuid(),
        (CURRENT_DATE - INTERVAL '1 day')::date,
        s.utm_source,
        s.utm_medium,
        s.province,
        COUNT(DISTINCT s.id),
        COALESCE((SELECT COUNT(*) FROM orders o WHERE o.user_id IN (SELECT u.id FROM users u WHERE u.auth_user_id IN (SELECT nau.id FROM neon_auth."user" nau)) AND o.created_at >= CURRENT_DATE - INTERVAL '1 day' AND o.created_at < CURRENT_DATE), 0),
        0,
        0
      FROM sessions s
      WHERE s.started_at >= CURRENT_DATE - INTERVAL '1 day' AND s.started_at < CURRENT_DATE
      GROUP BY s.utm_source, s.utm_medium, s.province
      ON CONFLICT DO NOTHING
    `;

    return success({ aggregated: true, date: new Date(Date.now() - 86400000).toISOString().slice(0, 10) });
  } catch (error) {
    return handleApiError(error);
  }
}
