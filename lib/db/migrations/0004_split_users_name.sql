-- 0004: split users.name into users.first_name + users.last_name
--
-- At the time this migration was authored, the `users` table was empty
-- on every environment (storefront signup was never wired before this
-- commit). The multi-step form below is used anyway as defense in depth:
--
--   1. Add the new columns as NULLABLE so existing rows (if any) aren't
--      rejected by a NOT NULL add.
--   2. Backfill from the legacy `name` column. Handles NULL, empty,
--      single-word, and multi-word names.
--   3. Assert every row was populated, rolling the whole migration back
--      via a RAISE EXCEPTION if something slipped through.
--   4. Flip the new columns to NOT NULL now that every row is covered.
--   5. Drop the legacy `name` column.
--
-- drizzle-kit wraps every migration in a single PG transaction, so any
-- failure rolls all steps back and leaves `users` untouched.

ALTER TABLE "users" ADD COLUMN "first_name" varchar(60);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_name" varchar(60);--> statement-breakpoint

UPDATE "users" SET
  "first_name" = COALESCE(
    NULLIF(split_part(trim("name"), ' ', 1), ''),
    'Unknown'
  ),
  "last_name" = CASE
    WHEN "name" IS NULL OR trim("name") = '' THEN 'User'
    WHEN position(' ' in trim("name")) = 0 THEN '—'
    ELSE trim(substring(trim("name") from position(' ' in trim("name")) + 1))
  END;--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "users" WHERE "first_name" IS NULL OR "last_name" IS NULL
  ) THEN
    RAISE EXCEPTION 'Backfill left NULL first_name/last_name — aborting migration';
  END IF;
END $$;--> statement-breakpoint

ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL;--> statement-breakpoint

ALTER TABLE "users" DROP COLUMN "name";
