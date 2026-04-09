CREATE TABLE "nav_menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar(120) NOT NULL,
	"type" varchar(20) NOT NULL,
	"category_id" uuid,
	"href" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"open_in_new_tab" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "delivery_zones" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "is_ecosystem_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "ecosystem_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "title_highlight" varchar(200);--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "subtitle" varchar(200);--> statement-breakpoint
ALTER TABLE "banners" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "nav_menu_items" ADD CONSTRAINT "nav_menu_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;