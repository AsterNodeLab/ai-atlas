import {
  defaultAgentConfig,
  modelProfiles,
  type AgentConfig,
  type FreeformSuggestions,
  type HumanApprovalCategory,
  type OutputKind,
  type PromptMode,
  type PromptSpec,
  type ToolDefinition,
  type ToolKind,
} from "@/prompt-factory";
import { APPROVAL_CATEGORIES, APPROVAL_LABELS, OUTPUT_KINDS, OUTPUT_KIND_LABELS, TOOL_KINDS, TOOL_KIND_LABELS } from "./labels";

/**
 * Pure helpers that place user-confirmed input into the spec.
 * They never build prompt text, score or apply compilation rules: that is the engine's job.
 */

export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

/** Switching to agent mode seeds the engine's default AgentConfig (existing config is kept). */
export function withMode(spec: PromptSpec, mode: PromptMode): PromptSpec {
  const next: PromptSpec = { ...spec, metadata: { ...spec.metadata, mode } };
  if (mode === "agent" && !spec.agent) next.agent = defaultAgentConfig();
  return next;
}

export function withAgent(spec: PromptSpec, patch: Partial<AgentConfig>): PromptSpec {
  return { ...spec, agent: { ...(spec.agent ?? {}), ...patch } };
}

/** Appends values that are not already present (case/accent-insensitive). */
export function appendUnique(list: string[] | undefined, values: string[]): string[] {
  const out = [...(list ?? [])];
  const seen = new Set(out.map(normalizeText));
  for (const value of values) {
    const trimmed = value.trim();
    const key = normalizeText(trimmed);
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

function uniqueToolId(tools: ToolDefinition[], base: string): string {
  const ids = new Set(tools.map((t) => t.id));
  if (!ids.has(base)) return base;
  let n = 2;
  while (ids.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** Adds a built-in tool once, or a new custom tool every time. */
export function addTool(tools: ToolDefinition[] | undefined, kind: ToolKind, name?: string): ToolDefinition[] {
  const list = tools ?? [];
  if (kind !== "custom" && list.some((t) => t.kind === kind)) return list;
  return [...list, { id: uniqueToolId(list, kind), kind, name: name ?? (kind === "custom" ? "" : TOOL_KIND_LABELS[kind]) }];
}

export function removeToolKind(tools: ToolDefinition[] | undefined, kind: ToolKind): ToolDefinition[] {
  return (tools ?? []).filter((t) => t.kind !== kind);
}

export function updateTool(tools: ToolDefinition[] | undefined, id: string, patch: Partial<Omit<ToolDefinition, "id">>): ToolDefinition[] {
  return (tools ?? []).map((t) => (t.id === id ? { ...t, ...patch } : t));
}

// ───────────────────────── Step 1: freeform suggestions ─────────────────────────

export type UnclassifiedTarget = "context" | "requirement" | "constraint";

interface DraftBase {
  key: string;
  source: string;
  confidence?: "low" | "medium";
  selected: boolean;
}

export type DraftItem =
  | (DraftBase & { kind: "objective" | "requirement" | "constraint"; value: string })
  | (DraftBase & { kind: "output"; value: OutputKind })
  | (DraftBase & { kind: "mode"; value: PromptMode })
  | (DraftBase & { kind: "tool"; value: ToolKind })
  | (DraftBase & { kind: "unclassified"; value: string; target: UnclassifiedTarget });

/** Turns the parser output into an editable checklist. Unclassified sentences start unselected. */
export function draftFromSuggestions(s: FreeformSuggestions): DraftItem[] {
  const items: DraftItem[] = [];
  if (s.objective) items.push({ key: "objective", kind: "objective", value: s.objective.value, source: s.objective.source, confidence: s.objective.confidence, selected: true });
  s.requirements.forEach((r, i) => items.push({ key: `req-${i}`, kind: "requirement", value: r.value, source: r.source, confidence: r.confidence, selected: true }));
  s.constraints.forEach((c, i) => items.push({ key: `con-${i}`, kind: "constraint", value: c.value, source: c.source, confidence: c.confidence, selected: true }));
  if (s.outputFormat) items.push({ key: "output", kind: "output", value: s.outputFormat.value, source: s.outputFormat.source, confidence: s.outputFormat.confidence, selected: true });
  if (s.mode) items.push({ key: "mode", kind: "mode", value: s.mode.value, source: s.mode.source, confidence: s.mode.confidence, selected: true });
  s.tools.forEach((t, i) => items.push({ key: `tool-${i}`, kind: "tool", value: t.value, source: t.source, confidence: t.confidence, selected: true }));
  s.unclassified.forEach((u, i) => items.push({ key: `unc-${i}`, kind: "unclassified", value: u, source: u, selected: false, target: "context" }));
  return items;
}

/** Applies only the selected (and possibly edited) suggestions. */
export function applyDraft(spec: PromptSpec, items: DraftItem[]): PromptSpec {
  let next = spec;
  const requirements: string[] = [];
  const constraints: string[] = [];
  const context: string[] = [];
  for (const item of items) {
    if (!item.selected) continue;
    switch (item.kind) {
      case "objective":
        if (item.value.trim()) next = { ...next, objective: item.value.trim() };
        break;
      case "requirement":
        requirements.push(item.value);
        break;
      case "constraint":
        constraints.push(item.value);
        break;
      case "output":
        next = { ...next, outputFormat: { ...(next.outputFormat ?? {}), kind: item.value } };
        break;
      case "mode":
        next = withMode(next, item.value);
        break;
      case "tool":
        next = { ...next, tools: addTool(next.tools, item.value) };
        break;
      case "unclassified":
        if (item.target === "requirement") requirements.push(item.value);
        else if (item.target === "constraint") constraints.push(item.value);
        else context.push(item.value);
        break;
    }
  }
  if (requirements.length) next = { ...next, requirements: appendUnique(next.requirements, requirements) };
  if (constraints.length) next = { ...next, constraints: appendUnique(next.constraints, constraints) };
  const newContext = context.map((t) => t.trim()).filter(Boolean);
  if (newContext.length) next = { ...next, context: [...(next.context ?? []), ...newContext.map((text) => ({ kind: "background" as const, text }))] };
  return next;
}

// ───────────────────────── Smart questions: quick answers ─────────────────────────

const LIST_FIELDS = ["requirements", "constraints", "priorities", "workflow", "qualityCriteria", "definitionOfDone"] as const;
const AGENT_LIST_FIELDS = ["successCriteria", "stopConditions", "escalationRules", "humanApprovalRules", "finalVerification"] as const;
const TEXT_FIELDS = ["objective", "task", "intent"] as const;

type ListField = (typeof LIST_FIELDS)[number];
type AgentListField = (typeof AGENT_LIST_FIELDS)[number];
type TextField = (typeof TEXT_FIELDS)[number];

const isOneOf = <T extends string>(list: readonly T[], value: string): value is T => (list as readonly string[]).includes(value);

function matchOption<T extends string>(answer: string, options: readonly T[], label: (o: T) => string): T | undefined {
  const a = normalizeText(answer);
  return options.find((o) => normalizeText(o) === a || normalizeText(label(o)) === a);
}

function appendText(current: string | undefined, answer: string, separator: string): string {
  return current?.trim() ? `${current.trim()}${separator}${answer}` : answer;
}

/** Whether a SmartQuestion suggestion for this field can be written directly into the spec. */
export function canQuickFill(field: string): boolean {
  if (isOneOf(LIST_FIELDS, field) || isOneOf(TEXT_FIELDS, field)) return true;
  if (field === "role" || field === "context" || field === "outputFormat" || field === "tools") return true;
  if (field === "metadata.targetModel" || field === "agent.mission" || field === "agent.humanApproval") return true;
  return field.startsWith("agent.") && isOneOf(AGENT_LIST_FIELDS, field.slice("agent.".length));
}

/** Writes a quick answer into the field; returns null when it cannot be mapped (the UI then just focuses the field). */
export function applyQuickAnswer(spec: PromptSpec, field: string, rawAnswer: string): PromptSpec | null {
  const answer = rawAnswer.trim();
  if (!answer) return null;
  if (isOneOf<ListField>(LIST_FIELDS, field)) {
    const next = { ...spec };
    next[field] = appendUnique(spec[field], [answer]);
    return next;
  }
  if (isOneOf<TextField>(TEXT_FIELDS, field)) {
    const next = { ...spec };
    next[field] = appendText(spec[field], answer, "\n");
    return next;
  }
  switch (field) {
    case "role":
      return { ...spec, role: appendText(spec.role, answer, "; ") };
    case "context":
      return { ...spec, context: [...(spec.context ?? []), { kind: "background", text: answer }] };
    case "outputFormat": {
      const kind = matchOption(answer, OUTPUT_KINDS, (k) => OUTPUT_KIND_LABELS[k].label);
      return kind
        ? { ...spec, outputFormat: { ...(spec.outputFormat ?? {}), kind } }
        : { ...spec, outputFormat: { kind: spec.outputFormat?.kind ?? "custom", ...spec.outputFormat, description: appendText(spec.outputFormat?.description, answer, "\n") } };
    }
    case "tools": {
      const kind = matchOption(answer, TOOL_KINDS, (k) => TOOL_KIND_LABELS[k]);
      return { ...spec, tools: kind ? addTool(spec.tools, kind) : addTool(spec.tools, "custom", answer) };
    }
    case "metadata.targetModel": {
      const profile = modelProfiles.find((p) => normalizeText(p.id) === normalizeText(answer) || normalizeText(p.displayName) === normalizeText(answer));
      return profile ? { ...spec, metadata: { ...spec.metadata, targetModel: profile.id } } : null;
    }
    case "agent.mission":
      return withAgent(spec, { mission: appendText(spec.agent?.mission, answer, "\n") });
    case "agent.humanApproval": {
      const category = matchOption<HumanApprovalCategory>(answer, APPROVAL_CATEGORIES, (c) => APPROVAL_LABELS[c]);
      if (category) {
        const current = spec.agent?.humanApproval ?? [];
        return withAgent(spec, { humanApproval: current.includes(category) ? current : [...current, category] });
      }
      return withAgent(spec, { humanApprovalRules: appendUnique(spec.agent?.humanApprovalRules, [answer]) });
    }
  }
  if (field.startsWith("agent.")) {
    const key = field.slice("agent.".length);
    if (isOneOf<AgentListField>(AGENT_LIST_FIELDS, key)) {
      const patch: Partial<AgentConfig> = {};
      patch[key] = appendUnique(spec.agent?.[key], [answer]);
      return withAgent(spec, patch);
    }
  }
  return null;
}
