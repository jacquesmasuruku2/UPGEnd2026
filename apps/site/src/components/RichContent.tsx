import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Contenu enrichi léger :
 * - **gras** · _italique_ (underscores)
 * - [texte](https://url)
 * - puces "- " · numérotation "1. " · "## Titre"
 * - Ligne initiale optionnelle :::gauche ou :::left pour aligner à gauche (sinon justifié)
 */

const LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g;

function renderItalicOnly(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(_[^_]+_)/g);
  return parts.map((part, j) => {
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
      return (
        <em key={`${keyPrefix}-em-${j}`} className="italic text-foreground/95">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={`${keyPrefix}-s-${j}`}>{part}</span>;
  });
}

/** Applique d'abord le gras, puis l'italique dans les segments non gras */
function renderStyledSegments(text: string, keyPrefix: string): ReactNode[] {
  const boldChunks = text.split(/(\*\*[^*]+\*\*)/g);
  return boldChunks.flatMap((chunk, i) => {
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      return [
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-foreground">
          {chunk.slice(2, -2)}
        </strong>,
      ];
    }
    return renderItalicOnly(chunk, `${keyPrefix}-i-${i}`);
  });
}

function renderInline(text: string, keyPrefix: string): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(LINK_RE.source, "g");
  let k = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(...renderStyledSegments(text.slice(lastIndex, match.index), `${keyPrefix}-pre-${k++}`));
    }
    nodes.push(
      <a
        key={`${keyPrefix}-a-${k++}`}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:opacity-80 break-words"
      >
        {renderStyledSegments(match[1], `${keyPrefix}-lbl-${k}`)}
      </a>
    );
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(...renderStyledSegments(text.slice(lastIndex), `${keyPrefix}-tail-${k}`));
  }
  if (nodes.length === 0) return null;
  if (nodes.length === 1) return nodes[0];
  return <>{nodes}</>;
}

type RichContentProps = {
  content: string;
  className?: string;
  /** Par défaut : texte justifié ; une ligne :::gauche en tête du contenu force l'alignement à gauche */
  defaultJustify?: boolean;
};

function stripAlignDirective(raw: string): { body: string; align: "justify" | "left" } {
  const lines = raw.split("\n");
  const first = lines[0]?.trim();
  if (first === ":::gauche" || first === ":::left") {
    return { body: lines.slice(1).join("\n"), align: "left" };
  }
  if (first === ":::justify" || first === ":::justifie") {
    return { body: lines.slice(1).join("\n"), align: "justify" };
  }
  return { body: raw, align: "justify" };
}

const RichContent = ({ content, className = "", defaultJustify = true }: RichContentProps) => {
  if (!content) return null;

  const { body, align } = stripAlignDirective(content);
  const alignClass =
    defaultJustify === false ? "text-left" : align === "left" ? "text-left" : "text-justify";

  const lines = body.split("\n");
  const elements: ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let orderedBuffer: string[] = [];
  let key = 0;

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    elements.push(
      <ul
        key={key++}
        className="list-disc pl-5 sm:pl-6 space-y-2 mb-4 text-foreground/90 marker:text-primary"
      >
        {bulletBuffer.map((b, i) => (
          <li key={i} className="leading-relaxed">
            {renderInline(b, `ul-${key}-${i}`)}
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  const flushOrdered = () => {
    if (orderedBuffer.length === 0) return;
    elements.push(
      <ol
        key={key++}
        className="list-decimal pl-5 sm:pl-6 space-y-2 mb-4 text-foreground/90 marker:text-primary marker:font-medium"
      >
        {orderedBuffer.map((b, i) => (
          <li key={i} className="leading-relaxed">
            {renderInline(b, `ol-${key}-${i}`)}
          </li>
        ))}
      </ol>
    );
    orderedBuffer = [];
  };

  const flushLists = () => {
    flushBullets();
    flushOrdered();
  };

  for (const line of lines) {
    const trimmed = line.trim();

    const bulletMatch = trimmed.match(/^-\s+(.*)$/);
    const numMatch = trimmed.match(/^\d+\.\s+(.*)$/);

    if (bulletMatch) {
      flushOrdered();
      bulletBuffer.push(bulletMatch[1]);
      continue;
    }

    if (numMatch) {
      flushBullets();
      orderedBuffer.push(numMatch[1]);
      continue;
    }

    flushLists();

    if (trimmed === "") {
      continue;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h3 key={key++} className="text-lg font-bold text-foreground mt-8 mb-2 first:mt-0">
          {renderInline(trimmed.slice(3), `h-${key}`)}
        </h3>
      );
    } else {
      elements.push(
        <p key={key++} className="text-foreground/90 leading-relaxed mb-3">
          {renderInline(trimmed, `p-${key}`)}
        </p>
      );
    }
  }

  flushLists();

  return (
    <div className={cn(alignClass, "hyphens-auto", className)} lang="fr">
      {elements}
    </div>
  );
};

export default RichContent;
