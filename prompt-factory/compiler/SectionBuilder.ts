import { buildLoopProtocolSection, buildMemoryPolicySection, buildStateSection, buildToolPolicySection, buildVerificationSection } from "../agent/AgentLoopBuilder.ts";
import { buildErrorRecoverySection } from "../agent/RetryPolicyBuilder.ts";
import { buildBudgetSection, buildDefinitionOfDoneSection, buildHumanApprovalSection, buildStopConditionsSection } from "../agent/StopConditionBuilder.ts";
import { asSentence, capitalize, lowerFirst, stripTrailingPunctuation } from "../domain/text.ts";
import type { ContextKind, PromptSpec } from "../domain/types.ts";
import { CONTEXT_TAGS, getStrings } from "../i18n/strings.ts";
import type { PromptStrings, SectionId } from "../i18n/strings.ts";
import { code, group, list, text } from "../render/blocks.ts";
import type { Block, ListItem, Section } from "../render/blocks.ts";
import { makeSection } from "../render/section.ts";
import { CONTEXT_KINDS, isLoopEnabled, normalizeSpec } from "./Normalizer.ts";
import type { NormalizedSpec } from "./Normalizer.ts";
import { evaluateRules } from "./RuleEngine.ts";
import type { RuleEvaluation, RuleFlag } from "./RuleEngine.ts";

/**
 * Canonical, syntax-neutral sections built once from the normalized spec and
 * the rule effects. Adapters pick, order, group and render them; they never
 * re-implement section content. Every builder returns undefined when empty.
 */

export interface CompileContext {
  spec: NormalizedSpec;
  rules: RuleEvaluation;
  s: PromptStrings;
  has(flag: RuleFlag): boolean;
}

export function createCompileContext(spec: PromptSpec): CompileContext {
  const normalized = normalizeSpec(spec);
  const rules = evaluateRules(normalized);
  return { spec: normalized, rules, s: getStrings(normalized.metadata.language), has: (flag) => rules.flags.has(flag) };
}

const ROLE_SENTENCE_RE = /^(eres|act[uú]a|tu rol|asume|you are|act as|your role|assume)\b/i;

/** "Analista financiero" → "Actúa como analista financiero." (kept as-is if already a sentence). */
export function roleSentence(role: string, s: PromptStrings): string {
  if (ROLE_SENTENCE_RE.test(role)) return role;
  const [first, ...rest] = role.split("\n");
  const head = asSentence(`${s.core.rolePrefix} ${lowerFirst(first)}`);
  return [head, ...rest].join("\n");
}

export function roleSection(ctx: CompileContext): Section | undefined {
  if (!ctx.spec.role) return undefined;
  return makeSection("role", ctx.s, [text(roleSentence(ctx.spec.role, ctx.s))]);
}

export function objectiveSection(ctx: CompileContext, options: { successBullets?: boolean } = {}): Section | undefined {
  const { spec, s } = ctx;
  if (!spec.objective) return undefined;
  const blocks: Block[] = [text(spec.objective)];
  if (options.successBullets) {
    const criteria = spec.agent?.successCriteria ?? [];
    if (criteria.length) blocks.push(text(s.core.successMeans), list(criteria));
    else if (ctx.has("definition-of-done")) blocks.push(text(s.core.successPointer));
  }
  return makeSection("objective", s, blocks);
}

export function missionSection(ctx: CompileContext): Section | undefined {
  if (!ctx.has("agent-protocol") || !ctx.spec.agent) return undefined;
  return makeSection("mission", ctx.s, [text(ctx.spec.agent.mission), text(ctx.s.core.missionAutonomy)]);
}

export function successCriteriaSection(ctx: CompileContext): Section | undefined {
  const criteria = ctx.spec.agent?.successCriteria ?? [];
  if (!ctx.has("agent-protocol") || !criteria.length) return undefined;
  return makeSection("success-criteria", ctx.s, [list(criteria)]);
}

export interface ContextOptions {
  /** Only these kinds (default: all). */
  kinds?: readonly ContextKind[];
  /** "always": one sub-group per kind; "when-mixed": plain text when there is only background. */
  subgroup: "always" | "when-mixed";
  id?: SectionId;
}

export function contextBlocks(ctx: CompileContext, options: ContextOptions): Block[] {
  const kinds = options.kinds ?? CONTEXT_KINDS;
  const items = ctx.spec.context.filter((c) => kinds.includes(c.kind));
  const present = CONTEXT_KINDS.filter((k) => items.some((c) => c.kind === k));
  if (!present.length) return [];
  if (options.subgroup === "when-mixed" && present.length === 1 && present[0] === "background") {
    return items.map((c) => text(c.text));
  }
  return present.map((kind) =>
    group(
      CONTEXT_TAGS[kind],
      items.filter((c) => c.kind === kind).map((c) => text(c.text)),
      ctx.s.contextKinds[kind],
    ),
  );
}

export function contextSection(ctx: CompileContext, options: ContextOptions): Section | undefined {
  const blocks = contextBlocks(ctx, options);
  return blocks.length ? makeSection(options.id ?? "context", ctx.s, blocks) : undefined;
}

export function inputBlocks(ctx: CompileContext): Block[] {
  return ctx.spec.inputs.map((input) =>
    group(
      "input",
      [text(input.description), input.value ? text(`${ctx.s.core.inputContent}\n${input.value}`) : text("")],
      input.name,
      { name: input.name },
    ),
  );
}

export function inputsSection(ctx: CompileContext): Section | undefined {
  const blocks = inputBlocks(ctx);
  return blocks.length ? makeSection("inputs", ctx.s, blocks) : undefined;
}

/** The concrete request: the task, or the objective restated. */
export function taskSection(ctx: CompileContext, options: { grounded?: boolean } = {}): Section | undefined {
  const { spec, s } = ctx;
  const base = spec.task ?? spec.objective;
  if (!base) return undefined;
  const request = options.grounded && ctx.has("grounded-task") ? `${s.core.groundedTaskLead} ${lowerFirst(base)}` : base;
  const blocks: Block[] = [text(request)];
  if (ctx.has("agent-protocol") && spec.agent) {
    blocks.push(text(isLoopEnabled(spec.agent) ? s.core.taskFollowLoop : s.core.taskStopRule));
  }
  return makeSection("task", s, blocks);
}

export function requirementsSection(ctx: CompileContext): Section | undefined {
  if (!ctx.spec.requirements.length) return undefined;
  return makeSection("requirements", ctx.s, [list(ctx.spec.requirements, ctx.has("numbered-requirements"))]);
}

export function constraintsSection(ctx: CompileContext): Section | undefined {
  if (!ctx.spec.constraints.length) return undefined;
  return makeSection("constraints", ctx.s, [list(ctx.spec.constraints)]);
}

const CONDITION_RE = /^(si|cuando|en caso|if|when|whenever|in case)\b/i;
const THEN_RE = /^(entonces|then)\b[\s,:]*/i;

export function decisionRuleText(when: string, then: string, s: PromptStrings): string {
  const cleanWhen = stripTrailingPunctuation(when);
  const condition = CONDITION_RE.test(cleanWhen) ? capitalize(cleanWhen) : `${s.core.conditionPrefix} ${lowerFirst(cleanWhen)}`;
  const action = lowerFirst(stripTrailingPunctuation(then.replace(THEN_RE, "")));
  return s.core.decisionRule(condition, action);
}

export function decisionRulesSection(ctx: CompileContext): Section | undefined {
  const { spec, s } = ctx;
  const blocks: Block[] = [list(spec.decisionRules.map((r) => decisionRuleText(r.when, r.then, s)))];
  if (ctx.has("priority-order")) blocks.push(text(s.core.priorityOrder(spec.priorities)), text(s.core.priorityConflict));
  const section = makeSection("decision-rules", s, blocks);
  return spec.decisionRules.length || ctx.has("priority-order") ? section : undefined;
}

export function workflowSection(ctx: CompileContext): Section | undefined {
  if (!ctx.spec.workflow.length) return undefined;
  return makeSection("workflow", ctx.s, [list(ctx.spec.workflow, true)]);
}

export function toolsSection(ctx: CompileContext): Section | undefined {
  const { spec, s } = ctx;
  if (!ctx.has("include-tools")) return undefined;
  const items: ListItem[] = spec.tools.map((tool) => {
    const label = tool.name || capitalize(s.toolKinds[tool.kind]);
    const description = tool.purpose ?? (tool.name ? s.toolKinds[tool.kind] : "");
    return { label, text: description };
  });
  const blocks: Block[] = [list(items)];
  if (!ctx.has("agent-protocol")) blocks.push(text(s.core.toolsStandardNote));
  return makeSection("tools", s, blocks);
}

const SCHEMA_LANG: Partial<Record<string, string>> = { json: "json", xml: "xml" };

/** Kinds whose sentence adds a hard rule ("only valid JSON") even when the user describes the format. */
const STRICT_OUTPUT_KINDS = new Set(["json", "xml", "table", "code", "markdown"]);

export function outputFormatBlocks(ctx: CompileContext): Block[] {
  const { spec, s } = ctx;
  const output = spec.outputFormat;
  if (!output) return [];
  const kindSentence = output.description && !STRICT_OUTPUT_KINDS.has(output.kind) ? "" : s.outputKinds[output.kind];
  const blocks: Block[] = [text(kindSentence), text(output.description)];
  if (output.schema) blocks.push(text(s.core.outputStructure), code(output.schema, SCHEMA_LANG[output.kind], "schema"));
  const hasContent = Boolean(s.outputKinds[output.kind] || output.description || output.schema);
  if (ctx.has("prioritize-output-format") && hasContent) blocks.push(text(s.core.exactStructure));
  return blocks;
}

export function outputFormatSection(ctx: CompileContext, id: SectionId = "output-format"): Section | undefined {
  const blocks = outputFormatBlocks(ctx);
  return blocks.length ? makeSection(id, ctx.s, blocks) : undefined;
}

export function qualityCriteriaSection(ctx: CompileContext): Section | undefined {
  if (!ctx.spec.qualityCriteria.length) return undefined;
  return makeSection("quality-criteria", ctx.s, [list(ctx.spec.qualityCriteria)]);
}

export function definitionOfDoneSection(ctx: CompileContext): Section | undefined {
  return ctx.has("definition-of-done") ? buildDefinitionOfDoneSection(ctx.spec, ctx.s) : undefined;
}

/** Agent sections, keyed by id (all undefined outside agent mode). */
export function agentSections(ctx: CompileContext): Partial<Record<SectionId, Section>> {
  const agent = ctx.spec.agent;
  if (!ctx.has("agent-protocol") || !agent) return {};
  return {
    mission: missionSection(ctx),
    "success-criteria": successCriteriaSection(ctx),
    state: buildStateSection(agent, ctx.s),
    "tool-policy": buildToolPolicySection(ctx.spec, ctx.s),
    "memory-policy": buildMemoryPolicySection(agent, ctx.s),
    "loop-protocol": buildLoopProtocolSection(ctx.spec, ctx.s),
    verification: buildVerificationSection(agent, ctx.s),
    "error-recovery": buildErrorRecoverySection(agent, ctx.s),
    budget: buildBudgetSection(agent, ctx.s),
    "human-approval": buildHumanApprovalSection(agent, ctx.s),
    "stop-conditions": buildStopConditionsSection(ctx.spec, ctx.s),
  };
}

/** Wraps a section's blocks as a nested group (used to merge sections, e.g. Claude's <instructions>). */
export function asGroup(section: Section | undefined): Block | undefined {
  return section ? group(section.tag, section.blocks, section.title) : undefined;
}

export function definedBlocks(blocks: (Block | undefined)[]): Block[] {
  return blocks.filter((b): b is Block => b !== undefined);
}
