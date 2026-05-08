import type { TiptapDoc, TiptapInlineNode } from './schema';

/**
 * Walks the doc looking for the first `paragraph` node and returns its
 * concatenated text, sliced at the nearest sentence boundary at or below
 * `maxChars`. Used for:
 *
 *   - the storefront hero subtitle on the product page, and
 *   - the metadata fallback inside `generateMetadata` when `productSeo`
 *     has no row (or its `metaDescription` / `ogDescription` is empty).
 *
 * Skips headings — they make poor previews. Returns `''` when nothing
 * extractable is present so callers can use `||` for a static fallback.
 */
export function extractFirstParagraphText(
  doc: TiptapDoc | null | undefined,
  maxChars = 160,
): string {
  if (!doc?.content?.length) return '';

  for (const block of doc.content) {
    if (block.type !== 'paragraph') continue;
    const text = inlineText(block.content).trim();
    if (text) return truncateAtSentence(text, maxChars);
  }

  return '';
}

function inlineText(nodes: TiptapInlineNode[] | undefined): string {
  if (!nodes?.length) return '';
  let out = '';
  for (const node of nodes) {
    if (node.type === 'text') out += node.text;
    else if (node.type === 'hardBreak') out += ' ';
  }
  return out;
}

/**
 * Cuts the string at the latest `. ` / `! ` / `? ` boundary at or before
 * `maxChars`. If no sentence break exists in range, falls back to a
 * word-boundary cut with a trailing ellipsis. Never returns more than
 * `maxChars` characters.
 */
function truncateAtSentence(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  const window = text.slice(0, maxChars);
  const sentenceEnd = Math.max(
    window.lastIndexOf('. '),
    window.lastIndexOf('! '),
    window.lastIndexOf('? '),
  );
  if (sentenceEnd >= maxChars * 0.5) {
    return window.slice(0, sentenceEnd + 1);
  }

  const wordEnd = window.lastIndexOf(' ');
  if (wordEnd >= maxChars * 0.5) {
    return window.slice(0, wordEnd) + '…';
  }

  return window + '…';
}
