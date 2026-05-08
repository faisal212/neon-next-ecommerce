/**
 * Allowed Tiptap doc shape for product descriptions.
 *
 * The renderer, validator, and admin editor all consult these constants —
 * keep them in sync. Anything not listed here cannot be authored, stored,
 * or rendered. Security model is allow-list-by-construction.
 */

export const ALLOWED_BLOCK_NODE_TYPES = [
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'hardBreak',
] as const;

export const ALLOWED_INLINE_NODE_TYPES = ['text', 'hardBreak'] as const;

export const ALLOWED_NODE_TYPES = [
  'doc',
  ...ALLOWED_BLOCK_NODE_TYPES,
  'text',
] as const;

export type AllowedNodeType = (typeof ALLOWED_NODE_TYPES)[number];

export const ALLOWED_MARK_TYPES = ['bold', 'italic', 'link'] as const;
export type AllowedMarkType = (typeof ALLOWED_MARK_TYPES)[number];

export const ALLOWED_HEADING_LEVELS = [2, 3] as const;
export type AllowedHeadingLevel = (typeof ALLOWED_HEADING_LEVELS)[number];

/**
 * URL schemes accepted on link marks. Anything else (javascript:, data:,
 * file:, vbscript: …) is rejected by the validator.
 */
export const ALLOWED_LINK_SCHEMES = ['http:', 'https:', 'mailto:'] as const;

/**
 * Hard cap on serialized doc size. Sized generously vs typical product copy
 * (a few KB) to leave room for headings + links, but small enough to reject
 * obvious abuse before it reaches Postgres.
 */
export const MAX_DOC_BYTES = 20_000;

// ── Doc shape ───────────────────────────────────────────────────────────

export interface TiptapMark {
  type: AllowedMarkType;
  attrs?: Record<string, unknown>;
}

export interface TiptapTextNode {
  type: 'text';
  text: string;
  marks?: TiptapMark[];
}

export interface TiptapHardBreakNode {
  type: 'hardBreak';
}

export type TiptapInlineNode = TiptapTextNode | TiptapHardBreakNode;

export interface TiptapParagraphNode {
  type: 'paragraph';
  content?: TiptapInlineNode[];
}

export interface TiptapHeadingNode {
  type: 'heading';
  attrs: { level: AllowedHeadingLevel };
  content?: TiptapInlineNode[];
}

export interface TiptapListItemNode {
  type: 'listItem';
  content?: TiptapParagraphNode[];
}

export interface TiptapBulletListNode {
  type: 'bulletList';
  content?: TiptapListItemNode[];
}

export interface TiptapOrderedListNode {
  type: 'orderedList';
  attrs?: { start?: number };
  content?: TiptapListItemNode[];
}

export type TiptapBlockNode =
  | TiptapParagraphNode
  | TiptapHeadingNode
  | TiptapBulletListNode
  | TiptapOrderedListNode;

export interface TiptapDoc {
  type: 'doc';
  content?: TiptapBlockNode[];
}

/** Empty doc seed for new editors. */
export const EMPTY_DOC: TiptapDoc = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};
