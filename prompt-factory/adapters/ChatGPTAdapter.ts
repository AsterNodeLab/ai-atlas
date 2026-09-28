import {
  agentSections,
  constraintsSection,
  contextSection,
  decisionRulesSection,
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
import { code, group, renderMarkdown, text } from "../render/blocks.ts";
import type { Section } from "../render/blocks.ts";
import { makeSection } from "../render/section.ts";
import { defineAdapter, userTexts } from "./shared.ts";
import type { Explanation } from "./shared.ts";

/**
 * ChatGPT: hierarchical Markdown. # Role, # Objective (+ "success means"),
 * # Mission, # Context, # Inputs, # Task, # Requirements, # Constraints,
 * # Decision Rules, # Workflow, # Examples, # Tools, agent sections,
 * # Output Format, # Quality Criteria, # Definition of Done.
 */

function examplesSection(ctx: CompileContext): Section | undefined {
  if (!ctx.has("include-examples")) return undefined;
  const { s } = ctx;
  return makeSection(
    "examples",
    s,
    ctx.spec.examples.map((ex, i) =>
      group("example", [text(`**${s.core.exampleInput}**`), code(ex.input), text(`**${s.core.exampleOutput}**`), code(ex.output)], s.core.exampleTitle(i + 1)),
    ),
  );
}

export const chatgptAdapter = defineAdapter({
  id: "chatgpt-markdown",
  syntax: "markdown",

  layout(ctx) {
    const a = agentSections(ctx);
    const prioritized = ctx.has("prioritize-output-format");
    const output = outputFormatSection(ctx);
    return [
      roleSection(ctx),
      objectiveSection(ctx, { successBullets: true }),
      a.mission,
      contextSection(ctx, { subgroup: "when-mixed" }),
      inputsSection(ctx),
      ctx.spec.task ? taskSection(ctx) : undefined,
      requirementsSection(ctx),
      constraintsSection(ctx),
      decisionRulesSection(ctx),
      workflowSection(ctx),
      examplesSection(ctx),
      toolsSection(ctx),
      a["tool-policy"],
      a.state,
      a["memory-policy"],
      a["loop-protocol"],
      a.verification,
      a["error-recovery"],
      a.budget,
      a["human-approval"],
      a["stop-conditions"],
      prioritized ? undefined : output,
      qualityCriteriaSection(ctx),
      definitionOfDoneSection(ctx),
      prioritized ? output : undefined,
    ];
  },

  render: (sections) => renderMarkdown(sections, 1),

  explain(ctx, emitted) {
    const out: Explanation[] = [
      { reason: "Se eligió Markdown jerárquico porque el adaptador de ChatGPT sigue mejor encabezados claros y reglas explícitas." },
    ];
    if (ctx.spec.agent?.successCriteria.length) {
      out.push({ section: "objective", reason: "El objetivo incluye «El éxito significa» con tus criterios de éxito." });
    } else if (emitted.has("definition-of-done")) {
      out.push({ section: "objective", reason: "El objetivo remite a la Definition of Done para definir qué significa éxito." });
    }
    if (!ctx.spec.task) {
      out.push({ section: "task", reason: "No se agregó una sección Tarea aparte porque no definiste una tarea distinta del objetivo." });
    }
    if (emitted.has("examples")) {
      out.push({ section: "examples", reason: "Cada ejemplo separa la entrada y la salida ideal en bloques de código para que no se mezclen con las instrucciones." });
    }
    if (ctx.has("prioritize-output-format") && emitted.has("output-format")) {
      out.push({ section: "output-format", reason: "El formato de salida se movió al final porque pediste respetar la estructura exacta: es lo último que lee el modelo." });
    }
    return out;
  },

  validate(ctx) {
    const issues: ValidationIssue[] = [];
    for (const { field, text: value } of userTexts(ctx.spec)) {
      // Examples are fenced, so their headings are harmless.
      if (field.startsWith("examples.") || field.startsWith("outputFormat.")) continue;
      if (/^#{1,6}\s/m.test(value)) {
        issues.push({
          code: "chatgpt.markdown.headings",
          severity: "info",
          field,
          message: "Uno de tus textos incluye encabezados Markdown (#) que podrían mezclarse con la jerarquía del prompt para ChatGPT.",
        });
        break;
      }
    }
    return issues;
  },
});
