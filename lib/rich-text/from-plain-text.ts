import type { TiptapDoc } from './schema';

/**
 * Wrap a plain-text string into a Tiptap doc whose content is one
 * paragraph node per non-empty newline-split line. Mirrors the
 * conversion used by migration 0005 for existing rows.
 *
 * Used by seed scripts (`lib/db/seed.ts`) and the SKMEI upload scripts
 * (`scripts/upload-skmei-*.ts`) so they can keep authoring product copy
 * as multi-line strings without hand-building the Tiptap JSON.
 *
 * Returns `null` for null/empty/whitespace-only input — same behaviour
 * as the migration backfill, so seed runs and live data stay consistent.
 */
export function plainTextToDoc(input: string | null | undefined): TiptapDoc | null {
  if (input == null) return null;
  const lines = input
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) return null;
  return {
    type: 'doc',
    content: lines.map((line) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: line }],
    })),
  };
}
