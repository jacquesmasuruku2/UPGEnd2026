import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Link2, List, ListOrdered, AlignLeft, AlignJustify } from "lucide-react";

function stripLeadingAlignLine(value: string): string {
  const lines = value.split("\n");
  const first = lines[0]?.trim();
  if (
    first === ":::gauche" ||
    first === ":::left" ||
    first === ":::justify" ||
    first === ":::justifie"
  ) {
    return lines.slice(1).join("\n");
  }
  return value;
}

function prependGauche(value: string): string {
  const lines = value.split("\n");
  const first = lines[0]?.trim();
  if (first === ":::gauche" || first === ":::left") return value;
  const body = stripLeadingAlignLine(value);
  return ":::gauche\n" + body;
}

type Props = {
  textareaRef: RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (next: string) => void;
};

export const RichTextToolbar = ({ textareaRef, value, onChange }: Props) => {
  const run = (fn: () => void) => {
    const el = textareaRef.current;
    if (!el) return;
    fn();
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-border mb-2">
      <span className="text-xs text-muted-foreground mr-1 shrink-0">Mise en forme :</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2"
        title="Gras (** **)"
        onClick={() =>
          run(() => {
            const el = textareaRef.current!;
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const sel = value.slice(start, end);
            const inner = sel || "gras";
            const insert = `**${inner}**`;
            const next = value.slice(0, start) + insert + value.slice(end);
            onChange(next);
            requestAnimationFrame(() => {
              el.focus();
              const c = start + insert.length;
              el.setSelectionRange(c, c);
            });
          })
        }
      >
        <Bold className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2"
        title="Italique (_texte_)"
        onClick={() =>
          run(() => {
            const el = textareaRef.current!;
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const sel = value.slice(start, end);
            const inner = sel || "italique";
            const insert = `_${inner}_`;
            const next = value.slice(0, start) + insert + value.slice(end);
            onChange(next);
            requestAnimationFrame(() => {
              el.focus();
              const c = start + insert.length;
              el.setSelectionRange(c, c);
            });
          })
        }
      >
        <Italic className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2"
        title="Lien [texte](url)"
        onClick={() =>
          run(() => {
            const el = textareaRef.current!;
            const start = el.selectionStart;
            const snippet = "[texte du lien](https://)";
            const next = value.slice(0, start) + snippet + value.slice(el.selectionEnd);
            onChange(next);
            requestAnimationFrame(() => {
              el.focus();
              el.setSelectionRange(start + 1, start + 1 + "texte du lien".length);
            });
          })
        }
      >
        <Link2 className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2"
        title="Puce (- )"
        onClick={() =>
          run(() => {
            const el = textareaRef.current!;
            const start = el.selectionStart;
            const before = value.slice(0, start);
            const lineStart = before.lastIndexOf("\n") + 1;
            const atLineStart = start === lineStart;
            const insert = atLineStart ? "- " : "\n- ";
            const next = value.slice(0, start) + insert + value.slice(el.selectionEnd);
            onChange(next);
            const pos = start + insert.length;
            requestAnimationFrame(() => {
              el.focus();
              el.setSelectionRange(pos, pos);
            });
          })
        }
      >
        <List className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2"
        title="Liste numérotée (1. )"
        onClick={() =>
          run(() => {
            const el = textareaRef.current!;
            const start = el.selectionStart;
            const before = value.slice(0, start);
            const lineStart = before.lastIndexOf("\n") + 1;
            const atLineStart = start === lineStart;
            const insert = atLineStart ? "1. " : "\n1. ";
            const next = value.slice(0, start) + insert + value.slice(el.selectionEnd);
            onChange(next);
            const pos = start + insert.length;
            requestAnimationFrame(() => {
              el.focus();
              el.setSelectionRange(pos, pos);
            });
          })
        }
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2 text-xs font-semibold"
        title="Titre (## )"
        onClick={() =>
          run(() => {
            const el = textareaRef.current!;
            const start = el.selectionStart;
            const before = value.slice(0, start);
            const lineStart = before.lastIndexOf("\n") + 1;
            const atLineStart = start === lineStart;
            const insert = atLineStart ? "## " : "\n## ";
            const next = value.slice(0, start) + insert + value.slice(el.selectionEnd);
            onChange(next);
            const pos = start + insert.length;
            requestAnimationFrame(() => {
              el.focus();
              el.setSelectionRange(pos, pos);
            });
          })
        }
      >
        H
      </Button>
      <span className="w-px h-5 bg-border mx-0.5 shrink-0" aria-hidden />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2"
        title="Aligner à gauche (ligne :::gauche)"
        onClick={() =>
          run(() => {
            onChange(prependGauche(value));
            requestAnimationFrame(() => textareaRef.current?.focus());
          })
        }
      >
        <AlignLeft className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 px-2"
        title="Justifier le texte (par défaut sur le site)"
        onClick={() =>
          run(() => {
            onChange(stripLeadingAlignLine(value));
            requestAnimationFrame(() => textareaRef.current?.focus());
          })
        }
      >
        <AlignJustify className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

export default RichTextToolbar;
