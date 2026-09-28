import { SECTION_TAGS } from "../i18n/strings.ts";
import type { PromptStrings, SectionId } from "../i18n/strings.ts";
import type { Block, Section } from "./blocks.ts";

/** A section with its canonical XML tag and localized heading. */
export function makeSection(id: SectionId, s: PromptStrings, blocks: Block[], title?: string): Section {
  return { id, tag: SECTION_TAGS[id], title: title ?? s.headings[id], blocks };
}
