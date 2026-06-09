import { useRef, useCallback } from "react";
import { Bold, List, Heading2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

/**
 * Simple markdown-style editor with toolbar for bold, bullets, headings.
 * Stores content as markdown text: **bold**, - bullet, ## heading
 */
const RichTextEditor = ({ value, onChange, placeholder, rows = 8 }: RichTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = useCallback((before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }, [value, onChange]);

  const insertBullet = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    // Find start of current line
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = value.indexOf("\n", start);
    const end = lineEnd === -1 ? value.length : lineEnd;
    const line = value.slice(lineStart, end);

    if (line.startsWith("- ")) {
      // Remove bullet
      const newValue = value.slice(0, lineStart) + line.slice(2) + value.slice(end);
      onChange(newValue);
    } else {
      const newValue = value.slice(0, lineStart) + "- " + value.slice(lineStart);
      onChange(newValue);
    }
    setTimeout(() => ta.focus(), 0);
  }, [value, onChange]);

  const insertHeading = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = value.indexOf("\n", start);
    const end = lineEnd === -1 ? value.length : lineEnd;
    const line = value.slice(lineStart, end);

    if (line.startsWith("## ")) {
      const newValue = value.slice(0, lineStart) + line.slice(3) + value.slice(end);
      onChange(newValue);
    } else {
      const newValue = value.slice(0, lineStart) + "## " + value.slice(lineStart);
      onChange(newValue);
    }
    setTimeout(() => ta.focus(), 0);
  }, [value, onChange]);

  return (
    <div className="space-y-1">
      <div className="flex gap-1 bg-muted/50 border border-border rounded-t-lg p-1">
        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => wrapSelection("**", "**")} title="Gras">
          <Bold className="w-3.5 h-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={insertBullet} title="Puce">
          <List className="w-3.5 h-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={insertHeading} title="Sous-titre">
          <Heading2 className="w-3.5 h-3.5" />
        </Button>
        <span className="text-[10px] text-muted-foreground ml-auto self-center pr-2">
          **gras** &nbsp; - puce &nbsp; ## titre
        </span>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-b-lg border border-t-0 border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
      />
    </div>
  );
};

export default RichTextEditor;
