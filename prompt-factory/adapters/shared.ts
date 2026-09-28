import { createCompileContext } from "../compiler/SectionBuilder.ts";
import type { CompileContext } from "../compiler/SectionBuilder.ts";
import type { NormalizedSpec } from "../compiler/Normalizer.ts";
import type { ModelAdapter, ModelProfile, TransformationExplanation, ValidationIssue } from "../domain/types.ts";
import type { SectionId } from "../i18n/strings.ts";
import { pruneSections } from "../render/blocks.ts";
import type { Section } from "../render/blocks.ts";

/**
 * Adapter scaffolding. An adapter is declared as data + small functions:
 * which sections go where (layout), how to render them, what to explain and
 * which target-specific checks to run. `defineAdapter` turns that into a
 * ModelAdapter so compile() and explain() always agree on what was emitted.
 */

export type Explanation = Omit<TransformationExplanation, "id">;

export interface AdapterDefinition {
  id: string;
  syntax: "xml" | "markdown";
  /** Ordered sections (undefined entries are skipped; empty ones are pruned). */
  layout(ctx: CompileContext): (Section | undefined)[];
  render(sections: Section[]): string;
  /** Canonical sections that a merged top-level section may contain (for explanation filtering). */
  contains?: Partial<Record<SectionId, SectionId[]>>;
  /** Adapter-specific explanations about what actually happened for this spec. */
  explain(ctx: CompileContext, emitted: EmittedSections, profile: ModelProfile): Explanation[];
  validate?(ctx: CompileContext): ValidationIssue[];
}

export interface EmittedSections {
  sections: Section[];
  /** Top-level ids plus the canonical ids they contain. */
  has(id: SectionId): boolean;
  get(id: SectionId): Section | undefined;
}

function emittedSections(def: AdapterDefinition, sections: Section[]): EmittedSections {
  const ids = new Set<SectionId>();
  for (const section of sections) {
    ids.add(section.id);
    for (const inner of def.contains?.[section.id] ?? []) ids.add(inner);
  }
  return { sections, has: (id) => ids.has(id), get: (id) => sections.find((s) => s.id === id) };
}

function explainAll(def: AdapterDefinition, ctx: CompileContext, emitted: EmittedSections, profile: ModelProfile): TransformationExplanation[] {
  const own = def.explain(ctx, emitted, profile).map((e, i) => ({ id: `${def.id}:${i}`, ...e }));
  const fromRules = ctx.rules.explanations.filter((e) => !e.section || emitted.has(e.section as SectionId));
  return [...own, ...fromRules];
}

export function defineAdapter(def: AdapterDefinition): ModelAdapter {
  const plan = (ctx: CompileContext) => emittedSections(def, pruneSections(def.layout(ctx)));
  return {
    id: def.id,
    compile(spec, profile) {
      const ctx = createCompileContext(spec);
      const emitted = plan(ctx);
      return {
        targetId: profile.id,
        prompt: def.render(emitted.sections),
        syntax: def.syntax,
        sections: emitted.sections.map((s) => s.id),
        transformations: explainAll(def, ctx, emitted, profile),
      };
    },
    validate(spec) {
      const issues = def.validate?.(createCompileContext(spec)) ?? [];
      return { valid: !issues.some((i) => i.severity === "error"), issues };
    },
    explain(spec, profile) {
      const ctx = createCompileContext(spec);
      return explainAll(def, ctx, plan(ctx), profile);
    },
  };
}

/** Every user-authored string of the spec with the field it came from. */
export function userTexts(spec: NormalizedSpec): { field: string; text: string }[] {
  const out: { field: string; text: string }[] = [];
  const add = (field: string, value: string | undefined) => {
    if (value) out.push({ field, text: value });
  };
  add("role", spec.role);
  add("objective", spec.objective);
  add("task", spec.task);
  spec.context.forEach((c, i) => add(`context.${i}`, c.text));
  spec.inputs.forEach((input, i) => {
    add(`inputs.${i}`, input.description);
    add(`inputs.${i}`, input.value);
  });
  const lists = ["requirements", "constraints", "priorities", "workflow", "qualityCriteria", "definitionOfDone"] as const;
  for (const key of lists) spec[key].forEach((v, i) => add(`${key}.${i}`, v));
  spec.decisionRules.forEach((r, i) => add(`decisionRules.${i}`, `${r.when} ${r.then}`));
  spec.examples.forEach((e, i) => {
    add(`examples.${i}.input`, e.input);
    add(`examples.${i}.output`, e.output);
  });
  spec.tools.forEach((t, i) => add(`tools.${i}`, `${t.name} ${t.purpose ?? ""}`));
  add("outputFormat.description", spec.outputFormat?.description);
  add("outputFormat.schema", spec.outputFormat?.schema);
  const agent = spec.agent;
  if (agent) {
    add("agent.mission", agent.mission);
    const agentLists = ["successCriteria", "humanApprovalRules", "escalationRules", "stopConditions", "finalVerification"] as const;
    for (const key of agentLists) agent[key].forEach((v, i) => add(`agent.${key}.${i}`, v));
  }
  return out;
}
