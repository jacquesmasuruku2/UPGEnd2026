import type { RefObject } from "react";
import { Button } from "@/components/ui/button";

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
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
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
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="4" x2="10" y2="4"></line>
          <line x1="14" y1="20" x2="5" y2="20"></line>
          <line x1="15" y1="4" x2="15" y2="20"></line>
        </svg>
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
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
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
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
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
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="10" y1="6" x2="21" y2="6"></line>
          <line x1="10" y1="12" x2="21" y2="12"></line>
          <line x1="10" y1="18" x2="21" y2="18"></line>
          <path d="M4 6h1v4"></path>
          <path d="M4 10h2"></path>
          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-2"></path>
        </svg>
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
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="17" y1="10" x2="3" y2="10"></line>
          <line x1="21" y1="6" x2="3" y2="6"></line>
          <line x1="21" y1="14" x2="3" y2="14"></line>
        </svg>
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
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="21" y1="10" x2="3" y2="10"></line>
          <line x1="21" y1="6" x2="3" y2="6"></line>
          <line x1="21" y1="14" x2="3" y2="14"></line>
          <line x1="21" y1="18" x2="3" y2="18"></line>
        </svg>
      </Button>
    </div>
  );
};

export default RichTextToolbar;
