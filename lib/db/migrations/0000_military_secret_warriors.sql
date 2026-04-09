CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"first_name" varchar(60) NOT NULL,
	"last_name" varchar(60) NOT NULL,
	"phone_pk" varchar(20) NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" varchar(80) NOT NULL,
	"province" varchar(30) NOT NULL,
	"postal_code" varchar(10),
	"is_default" boolean DEFAULT false NOT NULL,
	"is_guest" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(30) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "neon_auth"."user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" boolean,
	"image" text,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone,
	"role" text,
	"banned" boolean,
	"banReason" text,
	"banExpires" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"name" varchar(120),
	"email" varchar(255) NOT NULL,
	"phone_pk" varchar(20),
	"is_phone_verified" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name_en" varchar(120) NOT NULL,
	"name_ur" varchar(120),
	"slug" varchar(160) NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity_on_hand" integer DEFAULT 0 NOT NULL,
	"quantity_reserved" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 5 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"url" text NOT NULL,
	"alt_text" varchar(200),
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"tag" varchar(80) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" varchar(80) NOT NULL,
	"color" varchar(60),
	"size" varchar(30),
	"extra_price_pkr" numeric(10, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ur" varchar(200),
	"slug" varchar(220) NOT NULL,
	"description_en" text,
	"description_ur" text,
	"base_price_pkr" numeric(12, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"rating" smallint NOT NULL,
	"comment" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cod_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"amount_expected_pkr" numeric(12, 2) NOT NULL,
	"amount_collected_pkr" numeric(12, 2),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"collected_by" uuid,
	"collected_at" timestamp with time zone,
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(40) NOT NULL,
	"discount_type" varchar(15) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_order_pkr" numeric(10, 2) DEFAULT '0' NOT NULL,
	"max_discount_pkr" numeric(10, 2),
	"max_uses" integer,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courier_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"courier_name" varchar(50) NOT NULL,
	"tracking_number" varchar(80),
	"rider_name" varchar(120),
	"rider_phone" varchar(20),
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"estimated_delivery" date,
	"actual_delivery" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "delivery_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" varchar(80) NOT NULL,
	"province" varchar(30) NOT NULL,
	"shipping_charge_pkr" numeric(8, 2) NOT NULL,
	"estimated_days" integer NOT NULL,
	"is_cod_available" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_pkr" numeric(12, 2) NOT NULL,
	"total_pkr" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"status" varchar(30) NOT NULL,
	"notes" text,
	"changed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(30) NOT NULL,
	"user_id" uuid,
	"guest_phone" varchar(20),
	"guest_email" varchar(255),
	"address_id" uuid NOT NULL,
	"coupon_id" uuid,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"subtotal_pkr" numeric(12, 2) NOT NULL,
	"shipping_charge_pkr" numeric(8, 2) DEFAULT '0' NOT NULL,
	"cod_charge_pkr" numeric(8, 2) DEFAULT '0' NOT NULL,
	"discount_pkr" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_pkr" numeric(12, 2) NOT NULL,
	"customer_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_pkr" numeric(12, 2) NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_merge_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_cart_id" uuid NOT NULL,
	"user_cart_id" uuid NOT NULL,
	"items_merged" integer NOT NULL,
	"strategy" varchar(30) NOT NULL,
	"merged_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_token" varchar(120) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_seo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"meta_title" varchar(70),
	"meta_description" varchar(180),
	"og_image_url" text,
	"canonical_url" text,
	"h1_override" varchar(200),
	"top_content" text,
	"bottom_content" text,
	"robots" varchar(30) DEFAULT 'index,follow',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_seo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"meta_title" varchar(70),
	"meta_description" varchar(180),
	"og_title" text,
	"og_description" text,
	"og_image_url" text,
	"canonical_url" text,
	"schema_markup" jsonb,
	"robots" varchar(30) DEFAULT 'index,follow',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sitemap_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"entity_type" varchar(20) NOT NULL,
	"entity_id" uuid,
	"change_freq" varchar(15) DEFAULT 'weekly',
	"priority" numeric(2, 1) DEFAULT '0.5',
	"last_modified" timestamp with time zone DEFAULT now(),
	"is_excluded" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "static_page_seo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_key" varchar(50) NOT NULL,
	"meta_title" varchar(70),
	"meta_description" varchar(180),
	"og_image_url" text,
	"canonical_url" text,
	"robots" varchar(30) DEFAULT 'index,follow',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "url_redirects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_path" text NOT NULL,
	"to_path" text NOT NULL,
	"redirect_type" smallint DEFAULT 301 NOT NULL,
	"hit_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid,
	"variant_id" uuid NOT NULL,
	"event_type" varchar(20) NOT NULL,
	"quantity" integer NOT NULL,
	"price_pkr" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_funnel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"order_id" uuid,
	"step" varchar(20) NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"drop_reason" varchar(60),
	"entered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"exited_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "daily_product_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stat_date" date NOT NULL,
	"product_id" uuid NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"add_to_cart_count" integer DEFAULT 0 NOT NULL,
	"orders_count" integer DEFAULT 0 NOT NULL,
	"revenue_pkr" numeric(14, 2) DEFAULT '0' NOT NULL,
	"returns_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_traffic_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stat_date" date NOT NULL,
	"utm_source" varchar(80),
	"utm_medium" varchar(80),
	"province" varchar(30),
	"sessions_count" integer DEFAULT 0 NOT NULL,
	"orders_count" integer DEFAULT 0 NOT NULL,
	"revenue_pkr" numeric(14, 2) DEFAULT '0' NOT NULL,
	"conversion_rate" numeric(6, 4) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"page_url" text NOT NULL,
	"page_type" varchar(20),
	"entity_id" uuid,
	"time_on_page_sec" integer,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"view_duration_sec" integer,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_token" varchar(120) NOT NULL,
	"ip_address" "inet",
	"city" varchar(80),
	"province" varchar(30),
	"device_type" varchar(15),
	"os" varchar(30),
	"browser" varchar(40),
	"utm_source" varchar(80),
	"utm_medium" varchar(80),
	"utm_campaign" varchar(120),
	"utm_content" varchar(120),
	"referrer_url" text,
	"landing_page" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_searches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"query" text NOT NULL,
	"results_count" integer DEFAULT 0 NOT NULL,
	"clicked_product_id" uuid,
	"led_to_order" boolean DEFAULT false NOT NULL,
	"searched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"image_url" text NOT NULL,
	"link_url" text,
	"placement" varchar(40) NOT NULL,
	"target_province" varchar(30),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "flash_sale_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flash_sale_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"override_price_pkr" numeric(12, 2),
	"stock_limit" integer,
	"units_sold" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flash_sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"discount_type" varchar(15) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"total_earned" integer DEFAULT 0 NOT NULL,
	"total_redeemed" integer DEFAULT 0 NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "points_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid,
	"type" varchar(15) NOT NULL,
	"points" integer NOT NULL,
	"description" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recently_viewed" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_user_id" uuid NOT NULL,
	"referred_user_id" uuid NOT NULL,
	"referral_code" varchar(20) NOT NULL,
	"reward_given" boolean DEFAULT false NOT NULL,
	"reward_points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wishlist_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(120) DEFAULT 'My Wishlist' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" varchar(80) NOT NULL,
	"entity_type" varchar(40) NOT NULL,
	"entity_id" uuid,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" "inet",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"template_id" uuid NOT NULL,
	"channel" varchar(15) NOT NULL,
	"recipient" varchar(255) NOT NULL,
	"status" varchar(15) DEFAULT 'queued' NOT NULL,
	"provider" varchar(40),
	"provider_ref" varchar(120),
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(80) NOT NULL,
	"channel" varchar(15) NOT NULL,
	"subject" varchar(200),
	"body" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_pk" varchar(20) NOT NULL,
	"otp_code" varchar(64) NOT NULL,
	"purpose" varchar(20) NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "return_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"return_request_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"condition" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "return_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"reason" varchar(60) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"resolution" varchar(20),
	"handled_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" varchar(20) NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid,
	"category" varchar(40) NOT NULL,
	"subject" varchar(200) NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"assigned_to" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"sender_type" varchar(10) NOT NULL,
	"sender_id" uuid NOT NULL,
	"message" text NOT NULL,
	"attachments" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_auth_user_id_user_id_fk" FOREIGN KEY ("auth_user_id") REFERENCES "neon_auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_auth_user_id_user_id_fk" FOREIGN KEY ("auth_user_id") REFERENCES "neon_auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cod_collections" ADD CONSTRAINT "cod_collections_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cod_collections" ADD CONSTRAINT "cod_collections_collected_by_admin_users_id_fk" FOREIGN KEY ("collected_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courier_assignments" ADD CONSTRAINT "courier_assignments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_admin_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_merge_log" ADD CONSTRAINT "cart_merge_log_guest_cart_id_carts_id_fk" FOREIGN KEY ("guest_cart_id") REFERENCES "public"."carts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_merge_log" ADD CONSTRAINT "cart_merge_log_user_cart_id_carts_id_fk" FOREIGN KEY ("user_cart_id") REFERENCES "public"."carts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_seo" ADD CONSTRAINT "category_seo_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_seo" ADD CONSTRAINT "product_seo_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_events" ADD CONSTRAINT "cart_events_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_events" ADD CONSTRAINT "cart_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_events" ADD CONSTRAINT "cart_events_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_funnel" ADD CONSTRAINT "checkout_funnel_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_funnel" ADD CONSTRAINT "checkout_funnel_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_product_stats" ADD CONSTRAINT "daily_product_stats_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_searches" ADD CONSTRAINT "site_searches_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_searches" ADD CONSTRAINT "site_searches_clicked_product_id_products_id_fk" FOREIGN KEY ("clicked_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flash_sale_products" ADD CONSTRAINT "flash_sale_products_flash_sale_id_flash_sales_id_fk" FOREIGN KEY ("flash_sale_id") REFERENCES "public"."flash_sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flash_sale_products" ADD CONSTRAINT "flash_sale_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_points" ADD CONSTRAINT "loyalty_points_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_user_id_users_id_fk" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_wishlists_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_updated_by_admin_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_template_id_notification_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."notification_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_return_request_id_return_requests_id_fk" FOREIGN KEY ("return_request_id") REFERENCES "public"."return_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_handled_by_admin_users_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_admin_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_auth_user_id_idx" ON "admin_users" USING btree ("auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_idx" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_auth_user_id_idx" ON "users" USING btree ("auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_pk_idx" ON "users" USING btree ("phone_pk");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_variant_id_idx" ON "inventory" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_sku_idx" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "cod_collections_order_id_idx" ON "cod_collections" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE UNIQUE INDEX "carts_session_token_idx" ON "carts" USING btree ("session_token");--> statement-breakpoint
CREATE UNIQUE INDEX "category_seo_category_id_idx" ON "category_seo" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_seo_product_id_idx" ON "product_seo" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sitemap_entries_url_idx" ON "sitemap_entries" USING btree ("url");--> statement-breakpoint
CREATE UNIQUE INDEX "static_page_seo_page_key_idx" ON "static_page_seo" USING btree ("page_key");--> statement-breakpoint
CREATE UNIQUE INDEX "url_redirects_from_path_idx" ON "url_redirects" USING btree ("from_path");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_session_token_idx" ON "sessions" USING btree ("session_token");--> statement-breakpoint
CREATE UNIQUE INDEX "loyalty_points_user_id_idx" ON "loyalty_points" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "referrals_referral_code_idx" ON "referrals" USING btree ("referral_code");--> statement-breakpoint
CREATE UNIQUE INDEX "app_settings_key_idx" ON "app_settings" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_templates_key_idx" ON "notification_templates" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "support_tickets_ticket_number_idx" ON "support_tickets" USING btree ("ticket_number");