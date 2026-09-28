/**
 * Tiny, dependency-free tokenizer for the prompt preview. Purely visual: it
 * never changes the text, it only splits each line into typed spans so XML
 * tags, Markdown headings, list markers, **bold**, `code` and {{placeholders}}
 * can be tinted. Concatenating every token's text returns the original line.
 */
export type TokenKind = "text" | "tag" | "heading" | "marker" | "strong" | "code" | "placeholder";

export interface Token {
  kind: TokenKind;
  text: string;
}

const HEADING = /^(\s*)(#{1,6}\s.*)$/;
const MARKER = /^(\s*)([-*+•]|\d{1,3}[.)])(?=\s)/;
const INLINE = /<\/?[A-Za-z_][\w:.-]*(?:\s[^<>\n]*)?\/?>|\*\*[^*\n]+\*\*|`[^`\n]+`|\{\{[^{}\n]+\}\}/g;

function classify(match: string): TokenKind {
  if (match.startsWith("<")) return "tag";
  if (match.startsWith("**")) return "strong";
  if (match.startsWith("`")) return "code";
  return "placeholder";
}

export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];

  const heading = HEADING.exec(line);
  if (heading) {
    if (heading[1]) tokens.push({ kind: "text", text: heading[1] });
    tokens.push({ kind: "heading", text: heading[2] });
    return tokens;
  }

  let rest = line;
  const marker = MARKER.exec(line);
  if (marker) {
    if (marker[1]) tokens.push({ kind: "text", text: marker[1] });
    tokens.push({ kind: "marker", text: marker[2] });
    rest = line.slice(marker[0].length);
  }

  let last = 0;
  for (const m of rest.matchAll(INLINE)) {
    const index = m.index ?? 0;
    if (index > last) tokens.push({ kind: "text", text: rest.slice(last, index) });
    tokens.push({ kind: classify(m[0]), text: m[0] });
    last = index + m[0].length;
  }
  if (last < rest.length) tokens.push({ kind: "text", text: rest.slice(last) });
  return tokens;
}

export function highlight(code: string): Token[][] {
  return code.split(/\r?\n/).map(tokenizeLine);
}

/** Tailwind classes per token kind (tokens only, so light/dark stay correct). */
export const TOKEN_CLASS: Record<TokenKind, string> = {
  text: "",
  tag: "text-accent-text",
  heading: "font-semibold text-accent-text",
  marker: "text-faint",
  strong: "font-semibold text-fg",
  code: "rounded-sm bg-subtle text-accent-text",
  placeholder: "rounded-sm bg-accent-soft text-accent-text",
};
