-- 0005: convert products.description_en from text to jsonb (Tiptap doc).
--
-- The column is changing semantics: it was an opaque newline-separated
-- text blob whose paragraphs the storefront re-derived at render time;
-- it becomes a structured Tiptap doc that the new server renderer walks
-- to JSX. The grammar lives in `lib/rich-text/schema.ts`.
--
-- Postgres does not allow subqueries in ALTER COLUMN ... USING, so the
-- conversion runs as four steps inside drizzle-kit's per-migration
-- transaction:
--
--   1. Add description_en_new (nullable jsonb).
--   2. Backfill by walking each row's old text:
--        - NULL or whitespace-only → NULL
--        - otherwise → a Tiptap doc with one paragraph node per
--          non-empty newline-split line (mirrors the prior render
--          behaviour: split('\n').filter(Boolean))
--   3. Drop the old text column.
--   4. Rename the new column into place.
--
-- No retroactive parsing of `**bold**` or `- bullets`: the field never
-- advertised that grammar, so existing copy stays as plain text.
-- Admins format old copy in the new editor when they next edit.

ALTER TABLE "products" ADD COLUMN "description_en_new" jsonb;--> statement-breakpoint

UPDATE "products" SET "description_en_new" = CASE
  WHEN "description_en" IS NULL OR length(trim("description_en")) = 0 THEN NULL
  ELSE jsonb_build_object(
    'type', 'doc',
    'content', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', trim(line))
          )
        )
      )
      FROM regexp_split_to_table("description_en", E'\n+') AS line
      WHERE length(trim(line)) > 0
    )
  )
END;--> statement-breakpoint

ALTER TABLE "products" DROP COLUMN "description_en";--> statement-breakpoint

ALTER TABLE "products" RENAME COLUMN "description_en_new" TO "description_en";
