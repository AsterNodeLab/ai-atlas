import { defaultAgentConfig, HUMAN_APPROVAL_CATEGORIES } from "../domain/defaults.ts";
import { cleanBlock, cleanLine, dedupeStrings, foldKey } from "../domain/text.ts";
import { SPEC_VERSION } from "../domain/types.ts";
import type {
  AgentConfig,
  ContextItem,
  ContextKind,
  DecisionRule,
  Example,
  HumanApprovalCategory,
  OutputDefinition,
  OutputKind,
  PromptInput,
  PromptSpec,
  ToolDefinition,
  ToolKind,
} from "../domain/types.ts";

/**
 * Normalizer: trim, drop empty strings/items, dedupe (case/accent/whitespace
 * insensitive), collapse whitespace, default language/mode, and fill agent
 * defaults when mode=agent. Pure and idempotent: normalize(normalize(x)) ≡ normalize(x).
 */

export const CONTEXT_KINDS: readonly ContextKind[] = ["background", "source", "user-profile", "project", "assumption"];
export const TOOL_KINDS: readonly ToolKind[] = ["web", "browser", "files", "email", "database", "code", "api", "custom"];
export const OUTPUT_KINDS: readonly OutputKind[] = ["free-text", "markdown", "json", "xml", "table", "report", "code", "custom"];

type AgentState = NonNullable<AgentConfig["state"]>;
type AgentLoop = NonNullable<AgentConfig["loop"]>;
type AgentMemory = NonNullable<AgentConfig["memory"]>;

export interface NormalizedAgent extends AgentConfig {
  successCriteria: string[];
  state: AgentState;
  loop: AgentLoop;
  errorRecovery: NonNullable<AgentConfig["errorRecovery"]>;
  budget: NonNullable<AgentConfig["budget"]>;
  memory: AgentMemory;
  humanApproval: HumanApprovalCategory[];
  humanApprovalRules: string[];
  escalationRules: string[];
  stopConditions: string[];
  finalVerification: string[];
}

/** A PromptSpec after normalization: every list is present, agent only in agent mode. */
export interface NormalizedSpec extends PromptSpec {
  context: ContextItem[];
  inputs: PromptInput[];
  requirements: string[];
  constraints: string[];
  priorities: string[];
  workflow: string[];
  decisionRules: DecisionRule[];
  examples: Example[];
  tools: ToolDefinition[];
  qualityCriteria: string[];
  definitionOfDone: string[];
  agent?: NormalizedAgent;
}

const str = (value: unknown): string => (typeof value === "string" ? value : "");
const arr = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const obj = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

/** Optional multi-line text: undefined when empty. */
function optBlock(value: unknown): string | undefined {
  const text = cleanBlock(str(value));
  return text ? text : undefined;
}

function optLine(value: unknown): string | undefined {
  const text = cleanLine(str(value));
  return text ? text : undefined;
}

/** Cleans a list of single-line strings: trim, collapse whitespace, drop empty, dedupe. */
export function cleanList(value: unknown): string[] {
  return dedupeStrings(arr(value).map((v) => cleanLine(str(v))).filter(Boolean));
}

function validInt(value: unknown, min: number): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value) && value >= min ? value : undefined;
}

/** Removes keys whose value is undefined (keeps JSON output and deep equality clean). */
function compact<T extends object>(value: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value)) if (v !== undefined) out[key] = v;
  return out as T;
}

function normalizeContext(value: unknown): ContextItem[] {
  const seen = new Set<string>();
  const out: ContextItem[] = [];
  for (const raw of arr(value)) {
    const item = obj(raw);
    const text = cleanBlock(str(item.text));
    if (!text) continue;
    const kind = CONTEXT_KINDS.includes(item.kind as ContextKind) ? (item.kind as ContextKind) : "background";
    const key = `${kind}|${foldKey(text)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ kind, text });
  }
  return out;
}

function normalizeInputs(value: unknown): PromptInput[] {
  const out: PromptInput[] = [];
  arr(value).forEach((raw) => {
    const item = obj(raw);
    const name = cleanLine(str(item.name));
    const description = optBlock(item.description);
    const val = optBlock(item.value);
    if (!name && !description && !val) return;
    out.push(compact({ name: name || `input_${out.length + 1}`, description, value: val }));
  });
  return out;
}

function normalizeDecisionRules(value: unknown): DecisionRule[] {
  const seen = new Set<string>();
  const out: DecisionRule[] = [];
  for (const raw of arr(value)) {
    const item = obj(raw);
    const when = cleanLine(str(item.when));
    const then = cleanLine(str(item.then));
    if (!when || !then) continue;
    const key = `${foldKey(when)}|${foldKey(then)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ when, then });
  }
  return out;
}

function normalizeExamples(value: unknown): Example[] {
  const seen = new Set<string>();
  const out: Example[] = [];
  for (const raw of arr(value)) {
    const item = obj(raw);
    const input = cleanBlock(str(item.input));
    const output = cleanBlock(str(item.output));
    if (!input || !output) continue;
    const key = `${foldKey(input)}|${foldKey(output)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ input, output });
  }
  return out;
}

function normalizeTools(value: unknown): ToolDefinition[] {
  const ids = new Set<string>();
  const out: ToolDefinition[] = [];
  arr(value).forEach((raw, index) => {
    const item = obj(raw);
    const kind = TOOL_KINDS.includes(item.kind as ToolKind) ? (item.kind as ToolKind) : "custom";
    const name = cleanLine(str(item.name));
    const purpose = optBlock(item.purpose);
    if (kind === "custom" && !name && !purpose) return;
    let id = cleanLine(str(item.id)) || `${kind}-${index + 1}`;
    if (ids.has(id)) {
      // Same id twice: keep the first definition unless this one is a distinct custom tool.
      if (kind !== "custom") return;
      id = `${id}-${index + 1}`;
    }
    ids.add(id);
    out.push(compact({ id, kind, name, purpose }));
  });
  return out;
}

function normalizeOutput(value: unknown): OutputDefinition | undefined {
  if (value === undefined || value === null) return undefined;
  const item = obj(value);
  const kind = OUTPUT_KINDS.includes(item.kind as OutputKind) ? (item.kind as OutputKind) : "custom";
  return compact({
    kind,
    description: optBlock(item.description),
    schema: optBlock(item.schema),
    exactStructure: item.exactStructure === true ? true : undefined,
  });
}

function booleans<T extends object>(defaults: T, raw: unknown): T {
  const source = obj(raw);
  const out: Record<string, boolean> = {};
  for (const key of Object.keys(defaults)) {
    const v = source[key];
    out[key] = typeof v === "boolean" ? v : Boolean((defaults as Record<string, unknown>)[key]);
  }
  return out as T;
}

export function normalizeAgent(raw: unknown): NormalizedAgent {
  // defaultAgentConfig() fills every field NormalizedAgent requires.
  const d = defaultAgentConfig() as NormalizedAgent;
  const a = obj(raw);

  const recovery = a.errorRecovery === undefined ? d.errorRecovery : obj(a.errorRecovery);
  const budget = a.budget === undefined ? d.budget : obj(a.budget);
  const approvals =
    a.humanApproval === undefined
      ? d.humanApproval
      : arr(a.humanApproval).filter((c): c is HumanApprovalCategory => HUMAN_APPROVAL_CATEGORIES.includes(c as HumanApprovalCategory));

  return compact({
    mission: optBlock(a.mission),
    successCriteria: cleanList(a.successCriteria),
    state: a.state === undefined ? d.state : booleans(d.state, a.state),
    loop: a.loop === undefined ? d.loop : booleans(d.loop, a.loop),
    errorRecovery: compact({
      enabled: recovery.enabled === true,
      maxEquivalentRetries: validInt(recovery.maxEquivalentRetries, 0),
      replanAfterFailures: validInt(recovery.replanAfterFailures, 1),
      escalateAfterStrategies: validInt(recovery.escalateAfterStrategies, 1),
    }),
    budget: compact({
      maxIterations: validInt(budget.maxIterations, 1),
      maxToolCalls: validInt(budget.maxToolCalls, 1),
      maxRetries: validInt(budget.maxRetries, 0),
    }),
    memory: a.memory === undefined ? d.memory : booleans(d.memory, a.memory),
    humanApproval: [...new Set(approvals)],
    humanApprovalRules: cleanList(a.humanApprovalRules),
    escalationRules: cleanList(a.escalationRules),
    stopConditions: cleanList(a.stopConditions),
    finalVerification: cleanList(a.finalVerification),
  });
}

export function normalizeSpec(spec: PromptSpec): NormalizedSpec {
  const s = obj(spec);
  const meta = obj(s.metadata);
  const mode = meta.mode === "agent" ? "agent" : "standard";
  const language = meta.language === "en" ? "en" : "es";

  return compact({
    version: SPEC_VERSION,
    metadata: compact({
      title: optLine(meta.title),
      targetModel: cleanLine(str(meta.targetModel)),
      mode,
      language,
      presetId: optLine(meta.presetId),
    }),
    intent: optBlock(s.intent),
    role: optBlock(s.role),
    objective: cleanBlock(str(s.objective)),
    task: optBlock(s.task),
    context: normalizeContext(s.context),
    inputs: normalizeInputs(s.inputs),
    requirements: cleanList(s.requirements),
    constraints: cleanList(s.constraints),
    priorities: cleanList(s.priorities),
    workflow: cleanList(s.workflow),
    decisionRules: normalizeDecisionRules(s.decisionRules),
    examples: normalizeExamples(s.examples),
    tools: normalizeTools(s.tools),
    outputFormat: normalizeOutput(s.outputFormat),
    qualityCriteria: cleanList(s.qualityCriteria),
    definitionOfDone: cleanList(s.definitionOfDone),
    agent: mode === "agent" ? normalizeAgent(s.agent) : undefined,
  }) as NormalizedSpec;
}

/** Whether any loop phase is enabled. */
export function isLoopEnabled(agent: NormalizedAgent): boolean {
  return Object.values(agent.loop).some(Boolean);
}
