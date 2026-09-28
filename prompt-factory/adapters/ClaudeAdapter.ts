import {
  agentSections,
  asGroup,
  constraintsSection,
  contextSection,
  decisionRulesSection,
  definedBlocks,
  definitionOfDoneSection,
  inputsSection,
  objectiveSection,
  outputFormatSection,
  qualityCriteriaSection,
  requirementsSection,
  roleSection,
  taskSection,
  toolsSection,
  workflowSection,
} from "../compiler/SectionBuilder.ts";
import type { CompileContext } from "../compiler/SectionBuilder.ts";
import type { ValidationIssue } from "../domain/types.ts";
import { CONTEXT_TAGS, INNER_TAGS, SECTION_TAGS } from "../i18n/strings.ts";
import { group, renderXml, text } from "../render/blocks.ts";
import type { Section } from "../render/blocks.ts";
import { makeSection } from "../render/section.ts";
import { defineAdapter, userTexts } from "./shared.ts";
import type { Explanation } from "./shared.ts";

/**
 * Claude: XML semantic delimiters, long material first and <task> LAST.
 * Order: role, objective, context (sub-tagged by kind), inputs, instructions
 * (requirements + workflow + decision rules), constraints, examples,
 * output_format, quality_criteria, agent sections, definition_of_done, task.
 */

function examplesSection(ctx: CompileContext): Section | undefined {
  if (!ctx.has("include-examples")) return undefined;
  return makeSection(
    "examples",
    ctx.s,
    ctx.spec.examples.map((ex) => group("example", [group("input", [text(ex.input)]), group("ideal_output", [text(ex.output)])])),
  );
}

function instructionsSection(ctx: CompileContext): Section {
  return makeSection(
    "instructions",
    ctx.s,
    definedBlocks([asGroup(requirementsSection(ctx)), asGroup(workflowSection(ctx)), asGroup(decisionRulesSection(ctx))]),
  );
}

const KNOWN_TAGS = [...new Set([...Object.values(SECTION_TAGS), ...Object.values(CONTEXT_TAGS), ...INNER_TAGS])];
const TAG_RE = new RegExp(`</?(${KNOWN_TAGS.join("|")})(\\s[^>]*)?>`, "gi");

export const claudeAdapter = defineAdapter({
  id: "claude-xml",
  syntax: "xml",
  contains: { instructions: ["requirements", "workflow", "decision-rules"] },

  layout(ctx) {
    const a = agentSections(ctx);
    const prioritized = ctx.has("prioritize-output-format");
    const output = outputFormatSection(ctx);
    return [
      roleSection(ctx),
      objectiveSection(ctx),
      contextSection(ctx, { subgroup: "always" }),
      inputsSection(ctx),
      instructionsSection(ctx),
      constraintsSection(ctx),
      examplesSection(ctx),
      prioritized ? undefined : output,
      qualityCriteriaSection(ctx),
      a.mission,
      a["success-criteria"],
      a.state,
      toolsSection(ctx),
      a["tool-policy"],
      a["loop-protocol"],
      a.verification,
      a["error-recovery"],
      a["memory-policy"],
      a.budget,
      a["human-approval"],
      a["stop-conditions"],
      definitionOfDoneSection(ctx),
      prioritized ? output : undefined,
      taskSection(ctx),
    ];
  },

  render: renderXml,

  explain(ctx, emitted) {
    const out: Explanation[] = [{ reason: "Se eligió estructura XML porque el adaptador de Claude usa delimitadores semánticos." }];
    const kinds = [...new Set(ctx.spec.context.map((c) => c.kind))];
    if (emitted.has("context")) {
      out.push({
        section: "context",
        reason: `El contexto se separó en etiquetas por tipo (${kinds.map((k) => `<${CONTEXT_TAGS[k]}>`).join(", ")}) para distinguirlo de las instrucciones.`,
      });
    }
    const instructions = emitted.get("instructions");
    if (instructions && instructions.blocks.length > 1) {
      const names: Record<string, string> = { requirements: "los requisitos", workflow: "el flujo de trabajo", decision_rules: "las reglas de decisión" };
      const parts = instructions.blocks.map((b) => (b.kind === "group" ? names[b.tag] : undefined)).filter((p): p is string => Boolean(p));
      const joined = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}` : parts.join("");
      out.push({
        section: "instructions",
        reason: `${joined.charAt(0).toUpperCase()}${joined.slice(1)} se agruparon dentro de <instructions>.`,
      });
    }
    if (emitted.has("examples")) {
      out.push({ section: "examples", reason: "Cada ejemplo usa <input> e <ideal_output> para que Claude distinga la entrada de la respuesta esperada." });
    }
    if (ctx.has("prioritize-output-format") && emitted.has("output-format")) {
      out.push({ section: "output-format", reason: "El formato de salida se colocó justo antes de <task> porque pediste respetar la estructura exacta." });
    }
    const longMaterial = emitted.has("context") || emitted.has("inputs");
    out.push({
      section: "task",
      reason: ctx.spec.task
        ? `La etiqueta <task> va al final${longMaterial ? ", después del contexto," : ""} porque Claude responde mejor cuando el material extenso va primero y la petición concreta al final.`
        : "La etiqueta <task> repite el objetivo al final como petición concreta, porque no definiste una tarea distinta.",
    });
    return out;
  },

  validate(ctx) {
    const issues: ValidationIssue[] = [];
    const seen = new Set<string>();
    for (const { field, text: value } of userTexts(ctx.spec)) {
      for (const match of value.matchAll(TAG_RE)) {
        const tag = match[0];
        const key = tag.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        issues.push({
          code: "claude.xml.collision",
          severity: "warning",
          field,
          message: `Uno de tus textos contiene la etiqueta «${tag}», que podría confundir la estructura XML del prompt para Claude.`,
        });
      }
    }
    return issues;
  },
});
