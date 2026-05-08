import { z } from 'zod';
import {
  ALLOWED_HEADING_LEVELS,
  ALLOWED_LINK_SCHEMES,
  ALLOWED_MARK_TYPES,
  MAX_DOC_BYTES,
  type TiptapDoc,
} from './schema';

/**
 * Zod schema for the allowed Tiptap doc shape. Anything outside this
 * grammar is rejected at the API boundary — script tags, image nodes,
 * h1, javascript: hrefs, oversized docs, and unknown attrs all fail here.
 *
 * Used by the product validators (`createProductSchema`,
 * `updateProductSchema`) so the admin endpoints never accept a malformed
 * doc into Postgres.
 */

const headingLevelSchema = z.union(
  ALLOWED_HEADING_LEVELS.map((level) => z.literal(level)) as [
    z.ZodLiteral<2>,
    z.ZodLiteral<3>,
  ],
);

const linkAttrsSchema = z
  .object({
    href: z.string().refine(
      (v) => {
        try {
          const u = new URL(v);
          return (ALLOWED_LINK_SCHEMES as readonly string[]).includes(u.protocol);
        } catch {
          return false;
        }
      },
      { message: 'Link href must use http, https, or mailto' },
    ),
    target: z.string().optional(),
    rel: z.string().optional(),
    class: z.null().optional(),
  })
  .strict();

const markSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bold') }).strict(),
  z.object({ type: z.literal('italic') }).strict(),
  z
    .object({
      type: z.literal('link'),
      attrs: linkAttrsSchema,
    })
    .strict(),
]);

const textNodeSchema = z
  .object({
    type: z.literal('text'),
    text: z.string().min(1),
    marks: z.array(markSchema).optional(),
  })
  .strict();

const hardBreakNodeSchema = z
  .object({
    type: z.literal('hardBreak'),
  })
  .strict();

const inlineNodeSchema = z.discriminatedUnion('type', [
  textNodeSchema,
  hardBreakNodeSchema,
]);

const paragraphNodeSchema = z
  .object({
    type: z.literal('paragraph'),
    content: z.array(inlineNodeSchema).optional(),
  })
  .strict();

const headingNodeSchema = z
  .object({
    type: z.literal('heading'),
    attrs: z.object({ level: headingLevelSchema }).strict(),
    content: z.array(inlineNodeSchema).optional(),
  })
  .strict();

const listItemNodeSchema = z
  .object({
    type: z.literal('listItem'),
    content: z.array(paragraphNodeSchema).optional(),
  })
  .strict();

const bulletListNodeSchema = z
  .object({
    type: z.literal('bulletList'),
    content: z.array(listItemNodeSchema).optional(),
  })
  .strict();

const orderedListNodeSchema = z
  .object({
    type: z.literal('orderedList'),
    attrs: z.object({ start: z.number().int().optional() }).strict().optional(),
    content: z.array(listItemNodeSchema).optional(),
  })
  .strict();

const blockNodeSchema = z.discriminatedUnion('type', [
  paragraphNodeSchema,
  headingNodeSchema,
  bulletListNodeSchema,
  orderedListNodeSchema,
]);

export const tiptapDocSchema: z.ZodType<TiptapDoc> = z
  .object({
    type: z.literal('doc'),
    content: z.array(blockNodeSchema).optional(),
  })
  .strict()
  .refine(
    (doc) => {
      try {
        return JSON.stringify(doc).length <= MAX_DOC_BYTES;
      } catch {
        return false;
      }
    },
    { message: `Description exceeds ${MAX_DOC_BYTES} bytes` },
  );

/**
 * True when the doc is structurally non-empty. An "empty" doc is the
 * editor's default after a user clears the field: `{ type: 'doc',
 * content: [{ type: 'paragraph' }] }`. Service layer should treat this
 * as `null` so the DB column doesn't keep stale shells around.
 */
export function isDocEmpty(doc: TiptapDoc | null | undefined): boolean {
  if (!doc?.content?.length) return true;
  return doc.content.every(
    (block) =>
      block.type === 'paragraph' &&
      (!block.content || block.content.every(
        (inline) => inline.type === 'text' && inline.text.trim() === '',
      )),
  );
}
