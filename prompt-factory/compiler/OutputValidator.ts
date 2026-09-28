import { userTexts } from "../adapters/shared.ts";
import type { ValidationIssue } from "../domain/types.ts";
import { allHeadings, SECTION_TAGS } from "../i18n/strings.ts";
import type { NormalizedSpec } from "./Normalizer.ts";

/**
 * Safety net on the compiled text. These are compiler bugs, never user errors:
 * leaked internal values ("undefined", "[object Object]", "NaN"), empty
 * headings/tags, or unbalanced section tags. Checks ignore anything that also
 * appears in the user's own text, so user content never triggers them.
 */

const ARTIFACTS: { token: string; re: RegExp }[] = [
  { token: "undefined", re: /\bundefined\b/ },
  { token: "[object Object]", re: /\[object Object\]/ },
  { token: "NaN", re: /\bNaN\b/ },
];

function internal(message: string): ValidationIssue {
  return { code: "output.invalid", severity: "error", message: `Error interno al generar el prompt: ${message}` };
}

function markdownLines(prompt: string): { line: string; fenced: boolean }[] {
  let fence: string | undefined;
  return prompt.split("\n").map((line) => {
    const marker = /^(`{3,}|~{3,})/.exec(line)?.[1];
    const wasFenced = fence !== undefined;
    if (marker) {
      if (!fence) fence = marker;
      else if (line === fence) fence = undefined;
      return { line, fenced: true };
    }
    return { line, fenced: wasFenced };
  });
}

function emptyMarkdownHeadings(prompt: string): string[] {
  const known = new Set(allHeadings());
  const lines = markdownLines(prompt);
  const empty: string[] = [];
  lines.forEach(({ line, fenced }, index) => {
    const match = /^(#{1,6}) (.+)$/.exec(line);
    if (fenced || !match || !known.has(match[2])) return;
    const level = match[1].length;
    const next = lines.slice(index + 1).find((l) => l.line.trim() !== "");
    const nextHeading = next && !next.fenced ? /^(#{1,6}) /.exec(next.line) : null;
    if (!next || (nextHeading && nextHeading[1].length <= level)) empty.push(match[2]);
  });
  return empty;
}

export function validateOutput(prompt: string, syntax: "xml" | "markdown", spec: NormalizedSpec): ValidationIssue[] {
  if (!prompt.trim()) return [internal("el resultado quedó vacío.")];
  const issues: ValidationIssue[] = [];
  const userText = userTexts(spec)
    .map((t) => t.text)
    .join("\n");

  for (const { token, re } of ARTIFACTS) {
    if (re.test(prompt) && !re.test(userText)) issues.push(internal(`apareció el valor «${token}» en el texto.`));
  }

  if (syntax === "markdown") {
    for (const heading of emptyMarkdownHeadings(prompt)) issues.push(internal(`la sección «${heading}» quedó vacía.`));
  } else {
    for (const tag of Object.values(SECTION_TAGS)) {
      const open = new RegExp(`^<${tag}(\\s[^>]*)?>$`, "gm");
      const close = new RegExp(`^</${tag}>$`, "gm");
      const opens = prompt.match(open)?.length ?? 0;
      const closes = prompt.match(close)?.length ?? 0;
      const inUserText = userText.includes(`<${tag}`) || userText.includes(`</${tag}>`);
      if (inUserText) continue;
      if (opens !== closes) issues.push(internal(`la etiqueta <${tag}> no está balanceada.`));
      if (new RegExp(`<${tag}(\\s[^>]*)?>\\s*</${tag}>`).test(prompt)) issues.push(internal(`la etiqueta <${tag}> quedó vacía.`));
    }
  }
  return issues;
}
