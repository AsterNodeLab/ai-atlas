import {
  agentSections,
  asGroup,
  constraintsSection,
  contextBlocks,
  decisionRulesSection,
  definedBlocks,
  definitionOfDoneSection,
  inputBlocks,
  outputFormatSection,
  qualityCriteriaSection,
  requirementsSection,
  roleSentence,
  taskSection,
  toolsSection,
  workflowSection,
} from "../compiler/SectionBuilder.ts";
import type { CompileContext } from "../compiler/SectionBuilder.ts";
import type { ContextKind, ValidationIssue } from "../domain/types.ts";
import { renderMarkdown, separator, text } from "../render/blocks.ts";
import type { Block, Section } from "../render/blocks.ts";
import { makeSection } from "../render/section.ts";
import { defineAdapter } from "./shared.ts";
import type { Explanation } from "./shared.ts";

/**
 * Gemini: ## System Instruction (role + objective), ## Context,
 * ## Reference Material (source context + inputs), ## Examples with an
 * IDENTICAL structure per example, ## Rules (requirements + constraints),
 * agent sections, then ## Task (grounded on the material above) and
 * ## Expected Output at the very end.
 */

const NON_SOURCE_KINDS: readonly ContextKind[] = ["background", "user-profile", "project", "assumption"];

function systemInstruction(ctx: CompileContext): Section {
  const { spec, s } = ctx;
  return makeSection("system-instruction", s, [
    text(spec.role ? roleSentence(spec.role, s) : ""),
    text(spec.objective ? `${s.core.objectiveLabel}: ${spec.objective}` : ""),
  ]);
}

function referenceMaterial(ctx: CompileContext): Section {
  const sources = ctx.spec.context.filter((c) => c.kind === "source").map((c) => text(c.text));
  return makeSection("reference-material", ctx.s, [...sources, ...inputBlocks(ctx)]);
}

/** "INPUT:\n…\n\nOUTPUT:\n…" for every example, separated by ---. */
function examplesSection(ctx: CompileContext): Section | undefined {
  if (!ctx.has("include-examples")) return undefined;
  const { s } = ctx;
  const blocks: Block[] = [];
  ctx.spec.examples.forEach((ex, i) => {
    if (i > 0) blocks.push(separator());
    blocks.push(text(`${s.core.exampleInputMarker}\n${ex.input}`), text(`${s.core.exampleOutputMarker}\n${ex.output}`));
  });
  return makeSection("examples", s, blocks);
}

function rulesSection(ctx: CompileContext): Section {
  return makeSection(
    "rules",
    ctx.s,
    definedBlocks([asGroup(requirementsSection(ctx)), asGroup(constraintsSection(ctx)), asGroup(decisionRulesSection(ctx))]),
  );
}

function outputShape(output: string): string {
  const t = output.trim();
  if (/^[[{]/.test(t)) return "json";
  if (t.startsWith("<")) return "xml";
  if (/^\|/m.test(t)) return "table";
  if (/^(\s*[-*•]|\s*\d+[.)])\s/.test(t)) return "list";
  return "text";
}

export const geminiAdapter = defineAdapter({
  id: "gemini-sections",
  syntax: "markdown",
  contains: {
    "system-instruction": ["role", "objective"],
    rules: ["requirements", "constraints", "decision-rules"],
    "reference-material": ["inputs"],
    "expected-output": ["output-format"],
  },

  layout(ctx) {
    const a = agentSections(ctx);
    const context = contextBlocks(ctx, { kinds: NON_SOURCE_KINDS, subgroup: "when-mixed" });
    return [
      systemInstruction(ctx),
      a.mission,
      a["success-criteria"],
      makeSection("context", ctx.s, context),
      referenceMaterial(ctx),
      examplesSection(ctx),
      rulesSection(ctx),
      workflowSection(ctx),
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
      qualityCriteriaSection(ctx),
      definitionOfDoneSection(ctx),
      taskSection(ctx, { grounded: true }),
      outputFormatSection(ctx, "expected-output"),
    ];
  },

  render: (sections) => renderMarkdown(sections, 2),

  explain(ctx, emitted) {
    const out: Explanation[] = [
      {
        reason: "Se usaron secciones con una instrucción de sistema al inicio porque el adaptador de Gemini separa el rol y el objetivo del resto del contenido.",
      },
    ];
    if (emitted.has("reference-material")) {
      out.push({ section: "reference-material", reason: "Las fuentes y los datos de entrada se agruparon en Material de referencia, antes de las reglas y la tarea." });
    }
    if (emitted.has("examples")) {
      out.push({
        section: "examples",
        reason: `Los ejemplos usan exactamente la misma estructura (${ctx.s.core.exampleInputMarker} / ${ctx.s.core.exampleOutputMarker}, separados por ---) porque Gemini imita patrones consistentes.`,
      });
    }
    const rules = emitted.get("rules");
    if (rules && rules.blocks.length > 1) {
      out.push({ section: "rules", reason: "Los requisitos y las restricciones se agruparon en una sola sección de Reglas." });
    }
    if (ctx.has("grounded-task")) {
      out.push({ section: "task", reason: "La tarea pide basarse exclusivamente en la información anterior porque proporcionaste contexto o material de referencia." });
    }
    out.push({
      section: "task",
      reason: emitted.has("expected-output")
        ? "La tarea aparece al final, seguida solo del resultado esperado."
        : "La tarea aparece al final, después de todo el material.",
    });
    if (ctx.has("prioritize-output-format") && emitted.has("expected-output")) {
      out.push({ section: "expected-output", reason: "El resultado esperado cierra el prompt y se reforzó porque pediste respetar la estructura exacta." });
    }
    return out;
  },

  validate(ctx) {
    const issues: ValidationIssue[] = [];
    const examples = ctx.spec.examples;
    if (examples.length > 1 && new Set(examples.map((e) => outputShape(e.output))).size > 1) {
      issues.push({
        code: "gemini.examples.inconsistent",
        severity: "warning",
        field: "examples",
        message: "Tus ejemplos tienen salidas con formatos distintos; Gemini imita mejor ejemplos que comparten la misma estructura.",
      });
    }
    const withSeparator = examples.findIndex((e) => /^---\s*$/m.test(`${e.input}\n${e.output}`));
    if (withSeparator >= 0) {
      issues.push({
        code: "gemini.examples.separator",
        severity: "info",
        field: `examples.${withSeparator}`,
        message: `El ejemplo ${withSeparator + 1} contiene una línea «---», que es el separador entre ejemplos en el prompt para Gemini.`,
      });
    }
    return issues;
  },
});
