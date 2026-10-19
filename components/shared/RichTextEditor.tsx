"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils/cn";

interface Props {
  value: string;
  onChange: (text: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
}

const toHtml = (text: string) =>
  text
    .split("\n")
    .map((l) => `<p>${l.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`)
    .join("");

/** TipTap, restricted to plain paragraphs. Loaded lazily via LazyRichTextEditor. */
export default function RichTextEditor({
  value,
  onChange,
  label,
  placeholder,
  disabled,
  minHeight = 96,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bold: false,
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        horizontalRule: false,
      }),
    ],
    content: toHtml(value),
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": label,
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
        class: "outline-none",
        style: `min-height:${minHeight}px`,
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getText({ blockSeparator: "\n" })),
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div
      className={cn(
        "rounded-control border-line focus-within:border-maroon-600 border bg-white px-3 py-2 text-sm",
        disabled && "opacity-60",
      )}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
