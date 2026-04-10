ALTER TABLE "products" ADD COLUMN "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "products" SET "is_published" = true;