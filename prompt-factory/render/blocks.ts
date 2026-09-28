import type { SectionId } from "../i18n/strings.ts";

/**
 * Syntax-neutral document model. Section builders produce Sections made of
 * Blocks; adapters choose the order/grouping and a renderer (Markdown or XML)
 * turns them into text. Empty blocks/sections are pruned BEFORE rendering, so
 * a compiled prompt can never contain an empty heading or tag.
 */

export interface ListItem {
  /** Optional bold/leading label: "**KNOWN:** text" / "KNOWN: text". */
  label?: string;
  text: string;
  children?: string[];
}

export type Block =
  | { kind: "text"; text: string }
  | { kind: "list"; ordered: boolean; items: ListItem[] }
  | { kind: "code"; lang?: string; text: string; tag?: string }
  | { kind: "group"; tag: string; title?: string; attrs?: Record<string, string>; blocks: Block[] }
  | { kind: "separator" };

export interface Section {
  id: SectionId;
  /** XML tag. */
  tag: string;
  /** Localized heading. */
  title: string;
  blocks: Block[];
}

// ───────────────────────── Constructors ─────────────────────────

export const text = (value: string | undefined): Block => ({ kind: "text", text: value ?? "" });
export const list = (items: (string | ListItem)[], ordered = false): Block => ({
  kind: "list",
  ordered,
  items: items.map((i) => (typeof i === "string" ? { text: i } : i)),
});
export const code = (value: string, lang?: string, tag?: string): Block => ({ kind: "code", text: value, lang, tag });
export const group = (tag: string, blocks: Block[], title?: string, attrs?: Record<string, string>): Block => ({
  kind: "group",
  tag,
  title,
  attrs,
  blocks,
});
export const separator = (): Block => ({ kind: "separator" });

// ───────────────────────── Pruning ─────────────────────────

function pruneBlock(block: Block): Block | undefined {
  switch (block.kind) {
    case "text":
      return block.text.trim() ? block : undefined;
    case "code":
      return block.text.trim() ? block : undefined;
    case "list": {
      const items = block.items
        .map((i) => ({ ...i, children: i.children?.filter((c) => c.trim()) }))
        .filter((i) => i.text.trim() || i.label?.trim());
      return items.length ? { ...block, items } : undefined;
    }
    case "group": {
      const blocks = pruneBlocks(block.blocks);
      return blocks.length ? { ...block, blocks } : undefined;
    }
    case "separator":
      return block;
  }
}

export function pruneBlocks(blocks: Block[]): Block[] {
  const out = blocks.map(pruneBlock).filter((b): b is Block => b !== undefined);
  // Separators only make sense between content.
  return out.filter((b, i) => b.kind !== "separator" || (i > 0 && i < out.length - 1 && out[i - 1].kind !== "separator"));
}

export function pruneSections(sections: (Section | undefined)[]): Section[] {
  const out: Section[] = [];
  for (const section of sections) {
    if (!section) continue;
    const blocks = pruneBlocks(section.blocks);
    if (blocks.length) out.push({ ...section, blocks });
  }
  return out;
}

// ───────────────────────── Markdown ─────────────────────────

/** A code fence longer than any backtick run inside the content. */
export function fence(content: string, lang = ""): string {
  const longest = Math.max(0, ...(content.match(/`+/g) ?? []).map((m) => m.length));
  const ticks = "`".repeat(Math.max(3, longest + 1));
  return `${ticks}${lang}\n${content}\n${ticks}`;
}

function indentContinuation(value: string, indent: string): string {
  return value.replace(/\n/g, `\n${indent}`);
}

function markdownList(block: Extract<Block, { kind: "list" }>): string {
  return block.items
    .map((item, index) => {
      const marker = block.ordered ? `${index + 1}.` : "-";
      const indent = " ".repeat(marker.length + 1);
      const label = item.label ? `**${item.label}:**${item.text ? " " : ""}` : "";
      const head = `${marker} ${label}${indentContinuation(item.text, indent)}`;
      const children = (item.children ?? []).map((c) => `${indent}- ${indentContinuation(c, `${indent}  `)}`);
      return [head, ...children].join("\n");
    })
    .join("\n");
}

export function renderBlocksMarkdown(blocks: Block[], level: number): string {
  return blocks
    .map((block) => {
      switch (block.kind) {
        case "text":
          return block.text;
        case "list":
          return markdownList(block);
        case "code":
          return fence(block.text, block.lang ?? "");
        case "group": {
          const body = renderBlocksMarkdown(block.blocks, level + 1);
          return block.title ? `${"#".repeat(Math.min(level, 6))} ${block.title}\n\n${body}` : body;
        }
        case "separator":
          return "---";
      }
    })
    .join("\n\n");
}

/** Renders sections with `#`×level headings. */
export function renderMarkdown(sections: Section[], level = 1): string {
  return sections
    .map((s) => `${"#".repeat(level)} ${s.title}\n\n${renderBlocksMarkdown(s.blocks, level + 1)}`)
    .join("\n\n");
}

// ───────────────────────── XML ─────────────────────────

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function xmlList(block: Extract<Block, { kind: "list" }>): string {
  return block.items
    .map((item, index) => {
      const marker = block.ordered ? `${index + 1}.` : "-";
      const indent = " ".repeat(marker.length + 1);
      const label = item.label ? `${item.label}:${item.text ? " " : ""}` : "";
      const head = `${marker} ${label}${indentContinuation(item.text, indent)}`;
      const children = (item.children ?? []).map((c) => `${indent}- ${indentContinuation(c, `${indent}  `)}`);
      return [head, ...children].join("\n");
    })
    .join("\n");
}

export function renderBlocksXml(blocks: Block[]): string {
  let out = "";
  blocks.forEach((block, index) => {
    let chunk: string;
    switch (block.kind) {
      case "text":
        chunk = block.text;
        break;
      case "list":
        chunk = xmlList(block);
        break;
      case "code":
        chunk = block.tag ? `<${block.tag}>\n${block.text}\n</${block.tag}>` : block.text;
        break;
      case "group": {
        const attrs = Object.entries(block.attrs ?? {})
          .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
          .join("");
        chunk = `<${block.tag}${attrs}>\n${renderBlocksXml(block.blocks)}\n</${block.tag}>`;
        break;
      }
      case "separator":
        return;
    }
    if (out) {
      const previous = blocks[index - 1];
      // Consecutive tags stack tightly; prose gets a blank line.
      out += previous?.kind === "group" && block.kind === "group" ? "\n" : "\n\n";
    }
    out += chunk;
  });
  return out;
}

export function renderXml(sections: Section[]): string {
  return sections.map((s) => `<${s.tag}>\n${renderBlocksXml(s.blocks)}\n</${s.tag}>`).join("\n\n");
}
