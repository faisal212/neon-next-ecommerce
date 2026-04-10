-- Custom SQL migration file, put your code below! --
-- Rewrite all stored image URLs from the Cloudflare R2 dev hostname
-- (pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev) to the custom domain
-- (assets.refine.pk). The bucket and paths are unchanged — only the host.
--
-- Each statement is idempotent: REPLACE() leaves rows that no longer
-- contain the old host untouched, and the WHERE LIKE clauses keep
-- the affected row count tight for auditability.

UPDATE "categories"
SET "image_url" = REPLACE("image_url", 'https://pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev', 'https://assets.refine.pk')
WHERE "image_url" LIKE 'https://pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev%';
--> statement-breakpoint
UPDATE "product_images"
SET "url" = REPLACE("url", 'https://pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev', 'https://assets.refine.pk')
WHERE "url" LIKE 'https://pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev%';
--> statement-breakpoint
UPDATE "banners"
SET "image_url" = REPLACE("image_url", 'https://pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev', 'https://assets.refine.pk')
WHERE "image_url" LIKE 'https://pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev%';
--> statement-breakpoint
UPDATE "product_seo"
SET "og_image_url" = REPLACE("og_image_url", 'https://pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev', 'https://assets.refine.pk')
WHERE "og_image_url" LIKE 'https://pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev%';
--> statement-breakpoint
UPDATE "category_seo"
SET "og_image_url" = REPLACE("og_image_url", 'https://pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev', 'https://assets.refine.pk')
WHERE "og_image_url" LIKE 'https://pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev%';
--> statement-breakpoint
UPDATE "static_page_seo"
SET "og_image_url" = REPLACE("og_image_url", 'https://pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev', 'https://assets.refine.pk')
WHERE "og_image_url" LIKE 'https://pub-6faf32fc2deb4ffa8a66595cbfd0abcd.r2.dev%';
