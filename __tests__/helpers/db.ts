import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/lib/db/schema';

// Create a dedicated test DB connection
const sql = neon(process.env.DATABASE_URL!);
export const testDb = drizzle(sql, { schema });

/**
 * Truncate all application tables, then clean neon_auth test users.
 * TRUNCATE CASCADE handles FK ordering automatically.
 */
export async function truncateAll() {
  await sql`
    TRUNCATE TABLE
      admin_activity_logs,
      app_settings,
      ticket_messages,
      support_tickets,
      notification_logs,
      notification_templates,
      otp_verifications,
      return_items,
      return_requests,
      recently_viewed,
      referrals,
      points_transactions,
      loyalty_points,
      flash_sale_products,
      flash_sales,
      wishlist_items,
      wishlists,
      banners,
      daily_traffic_stats,
      daily_product_stats,
      site_searches,
      checkout_funnel,
      cart_events,
      product_views,
      page_views,
      sessions,
      sitemap_entries,
      url_redirects,
      static_page_seo,
      category_seo,
      product_seo,
      cart_merge_log,
      cart_items,
      carts,
      cod_collections,
      courier_assignments,
      order_status_history,
      order_items,
      orders,
      coupons,
      delivery_zones,
      reviews,
      product_tags,
      inventory,
      product_images,
      product_variants,
      products,
      categories,
      addresses,
      admin_users,
      users
    CASCADE
  `;
  // Clean neon_auth tables that reference neon_auth.user, then remove test users
  await sql`DELETE FROM neon_auth.session WHERE "userId" IN (SELECT id FROM neon_auth."user" WHERE email LIKE 'auth-%@test.com')`;
  await sql`DELETE FROM neon_auth.account WHERE "userId" IN (SELECT id FROM neon_auth."user" WHERE email LIKE 'auth-%@test.com')`;
  await sql`DELETE FROM neon_auth.member WHERE "userId" IN (SELECT id FROM neon_auth."user" WHERE email LIKE 'auth-%@test.com')`;
  await sql`DELETE FROM neon_auth.invitation WHERE "inviterId" IN (SELECT id FROM neon_auth."user" WHERE email LIKE 'auth-%@test.com')`;
  await sql`DELETE FROM neon_auth."user" WHERE email LIKE 'auth-%@test.com'`;
}
