import { Fragment, type ReactNode } from "react";
import { getTerm } from "@/lib/glossary";
import { TermLink } from "./term-link";

/**
 * Renders the glossary's inline markup (see types/glossary.ts):
 * [[slug]] / [[slug|texto]] → TermLink with tooltip, **bold**, *italic*, `code`,
 * blank lines → paragraphs. Server component: looks terms up at build time.
 */
const TOKEN = /(\[\[[a-z0-9-]+(?:\|[^\]]+)?\]\]|\*\*[^*]+\*\*|\*[^*\s][^*]*?\*|`[^`]+`)/g;

export function renderInline(text: string, from?: string): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    if (!part) return null;
    if (part.startsWith("[[")) {
      const [slug, custom] = part.slice(2, -2).split("|");
      const term = getTerm(slug);
      if (!term) return <Fragment key={i}>{custom ?? slug}</Fragment>;
      return (
        <TermLink
          key={i}
          slug={slug}
          label={custom ?? term.name}
          name={term.acronym && term.acronym !== term.name ? `${term.name} (${term.acronym})` : term.name}
          definition={term.shortDefinition}
          from={from}
        />
      );
    }
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function RichText({ text, from, className = "" }: { text: string; from?: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className={`prose-atlas ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i}>{renderInline(p, from)}</p>
      ))}
    </div>
  );
}

export function InlineText({ text, from }: { text: string; from?: string }) {
  return <>{renderInline(text, from)}</>;
}
