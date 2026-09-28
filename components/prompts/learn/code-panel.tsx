import type { ReactNode } from "react";
import type { CodeLang } from "./content";
import { CopyButton } from "./copy-button";

/**
 * Minimal, dependency-free highlighting for prompt templates: XML tags,
 * Markdown headings, INPUT/OUTPUT labels, JSON keys, {{VARIABLES}} and
 * [placeholders]. Colors come from design tokens, so dark mode just works.
 */
const patterns: Record<CodeLang, RegExp> = {
  xml: /(<!--[\s\S]*?-->|<\/?[a-z_]+(?:\s[^<>\n]*)?>|\{\{[A-Z_]+\}\}|\[[^\]\n]+\])/g,
  md: /(^#{1,3} .*$|^(?:INPUT|OUTPUT):|\{\{[A-Z_]+\}\}|\[[^\]\n]+\])/gm,
  json: /("[^"\n]*"(?=\s*:))/g,
  text: /(^(?:INPUT|OUTPUT):)/gm,
};

function tokenClass(token: string, lang: CodeLang): string {
  if (token.startsWith("<!--")) return "italic text-faint";
  if (token.startsWith("#")) return "font-semibold text-accent-text";
  if (token.startsWith("<") || (lang === "json" && token.startsWith('"'))) return "text-accent-text";
  if (token.startsWith("{{")) return "text-lvl-4";
  if (token.startsWith("[")) return "text-faint";
  return "font-semibold text-accent-text";
}

function highlight(code: string, lang: CodeLang): ReactNode[] {
  return code.split(patterns[lang]).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={tokenClass(part, lang)}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function CodePanel({
  code,
  lang = "text",
  title,
  copyWhat,
  maxHeight = true,
}: {
  code: string;
  lang?: CodeLang;
  title: string;
  /** Enables the copy button; completes its accessible name ("Copiar plantilla para…"). */
  copyWhat?: string;
  maxHeight?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-code">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border px-4 py-1.5">
        <span className="truncate font-mono text-[12px] text-faint">{title}</span>
        {copyWhat ? <CopyButton text={code} what={copyWhat} /> : null}
      </div>
      <pre
        tabIndex={0}
        aria-label={title}
        className={`overflow-auto px-4 py-4 font-mono text-[12.5px] leading-[1.75] text-fg sm:px-5 sm:text-[13px] ${maxHeight ? "max-h-[460px]" : ""}`}
      >
        <code>{highlight(code, lang)}</code>
      </pre>
    </div>
  );
}
