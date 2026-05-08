"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link as LinkIcon, Link2Off } from "lucide-react";
import type { TiptapDoc } from "@/lib/rich-text/schema";
import { ALLOWED_LINK_SCHEMES } from "@/lib/rich-text/schema";

interface RichTextEditorProps {
  initialContent: TiptapDoc | null;
  onChange: (doc: TiptapDoc) => void;
  placeholder?: string;
}

/**
 * Minimal-prose rich text editor scoped to the admin product form.
 *
 * The toolbar exposes only the marks/nodes that the storefront renderer
 * (`lib/rich-text/render.tsx`) knows how to draw: bold, italic, h2, h3,
 * bulleted/numbered lists, links. Strike, underline, code, blockquote,
 * code blocks, and horizontal rules are explicitly disabled in
 * StarterKit so they cannot be authored.
 *
 * `onChange` is called on every transaction with the current JSON doc.
 * The parent form holds the result and POSTs it as `descriptionEn`.
 */
export function RichTextEditor({
  initialContent,
  onChange,
  placeholder = "Product description...",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Block-level nodes outside our allow-list
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        // Inline marks outside our allow-list
        code: false,
        strike: false,
        underline: false,
        // Constrain heading levels to h2/h3 — h1 is reserved for the
        // product name on the storefront page.
        heading: { levels: [2, 3] },
        // Force safe link attributes on every authored link. The
        // storefront renderer also re-applies these defensively.
        link: {
          openOnClick: false,
          autolink: false,
          HTMLAttributes: {
            rel: "noopener noreferrer nofollow ugc",
            target: "_blank",
          },
          protocols: ["http", "https", "mailto"],
          isAllowedUri: (url, ctx) => {
            try {
              const parsed = new URL(url, ctx.defaultProtocol);
              return (
                ctx.protocols.includes(parsed.protocol.replace(":", "")) &&
                (ALLOWED_LINK_SCHEMES as readonly string[]).includes(parsed.protocol)
              );
            } catch {
              return false;
            }
          },
        },
      }),
    ],
    content: initialContent ?? undefined,
    editorProps: {
      attributes: {
        class:
          "tiptap-editor min-h-[160px] max-h-[480px] overflow-y-auto px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-primary/20 [&>*+*]:mt-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TiptapDoc);
    },
  });

  if (!editor) {
    return (
      <div className="rounded-md border border-border bg-background min-h-[200px] animate-pulse" />
    );
  }

  return (
    <div className="rounded-md border border-border bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-colors">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-card/40 px-2 py-1">
        <ToolbarButton
          label="Bold"
          icon={Bold}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          icon={Italic}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        />
        <ToolbarDivider />
        <ToolbarButton
          label="Heading 2"
          icon={Heading2}
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="Heading 3"
          icon={Heading3}
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarDivider />
        <ToolbarButton
          label="Bulleted list"
          icon={List}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Numbered list"
          icon={ListOrdered}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarDivider />
        <ToolbarButton
          label={editor.isActive("link") ? "Edit link" : "Add link"}
          icon={LinkIcon}
          active={editor.isActive("link")}
          onClick={() => {
            const previous = (editor.getAttributes("link").href as string | undefined) ?? "";
            const url = window.prompt("Link URL (https or mailto)", previous);
            if (url === null) return;
            const trimmed = url.trim();
            if (trimmed === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            try {
              const parsed = new URL(trimmed);
              if (!(ALLOWED_LINK_SCHEMES as readonly string[]).includes(parsed.protocol)) {
                window.alert("Only http, https, and mailto links are allowed.");
                return;
              }
            } catch {
              window.alert("That doesn't look like a valid URL.");
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
          }}
        />
        <ToolbarButton
          label="Remove link"
          icon={Link2Off}
          active={false}
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarDivider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-border" />;
}

interface ToolbarButtonProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({ label, icon: Icon, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? "bg-primary/15 text-primary" : "hover:bg-muted/60"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
