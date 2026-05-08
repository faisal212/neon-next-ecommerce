import type {
  TiptapBlockNode,
  TiptapDoc,
  TiptapInlineNode,
  TiptapMark,
  TiptapTextNode,
} from './schema';
import { ALLOWED_LINK_SCHEMES } from './schema';

/**
 * Server-only renderer that walks a validated Tiptap doc and returns JSX.
 *
 * No `dangerouslySetInnerHTML`. No external sanitizer. Security comes from
 * the switch statements: any node or mark `type` not handled here returns
 * `null`, so unknown shapes cannot leak into the rendered output. Even if
 * a malformed doc bypassed validation, the renderer is a hard allow-list.
 *
 * Links are forced to `target="_blank"` and `rel="noopener noreferrer
 * nofollow ugc"` regardless of what was authored. The href is re-checked
 * against `ALLOWED_LINK_SCHEMES` defensively; a mismatching href renders
 * as plain text.
 */
export function renderProductDescription(
  doc: TiptapDoc | null | undefined,
): React.ReactNode {
  if (!doc?.content?.length) return null;
  return doc.content.map((node, i) => renderBlock(node, i));
}

function renderBlock(node: TiptapBlockNode, key: number): React.ReactNode {
  switch (node.type) {
    case 'paragraph':
      return <p key={key}>{renderInline(node.content)}</p>;
    case 'heading': {
      const Tag = (`h${node.attrs.level}` as 'h2' | 'h3');
      return <Tag key={key}>{renderInline(node.content)}</Tag>;
    }
    case 'bulletList':
      return (
        <ul key={key}>
          {node.content?.map((li, j) => (
            <li key={j}>{li.content?.map((p, k) => (
              <p key={k}>{renderInline(p.content)}</p>
            ))}</li>
          ))}
        </ul>
      );
    case 'orderedList':
      return (
        <ol key={key} start={node.attrs?.start}>
          {node.content?.map((li, j) => (
            <li key={j}>{li.content?.map((p, k) => (
              <p key={k}>{renderInline(p.content)}</p>
            ))}</li>
          ))}
        </ol>
      );
    default:
      return null;
  }
}

function renderInline(nodes: TiptapInlineNode[] | undefined): React.ReactNode {
  if (!nodes?.length) return null;
  return nodes.map((node, i) => {
    if (node.type === 'hardBreak') return <br key={i} />;
    if (node.type === 'text') return <TextRun key={i} node={node} />;
    return null;
  });
}

function TextRun({ node }: { node: TiptapTextNode }) {
  let element: React.ReactNode = node.text;
  if (!node.marks?.length) return <>{element}</>;

  // Wrap inside-out so the outermost mark is rendered last (link wraps
  // bold wraps italic, etc.). Order doesn't matter semantically; this
  // just keeps the DOM stable.
  for (const mark of node.marks) {
    element = applyMark(mark, element);
  }
  return <>{element}</>;
}

function applyMark(mark: TiptapMark, children: React.ReactNode): React.ReactNode {
  switch (mark.type) {
    case 'bold':
      return <strong>{children}</strong>;
    case 'italic':
      return <em>{children}</em>;
    case 'link': {
      const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : null;
      if (!href || !isAllowedHref(href)) return children;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow ugc"
        >
          {children}
        </a>
      );
    }
    default:
      return children;
  }
}

function isAllowedHref(href: string): boolean {
  try {
    const u = new URL(href);
    return (ALLOWED_LINK_SCHEMES as readonly string[]).includes(u.protocol);
  } catch {
    return false;
  }
}
