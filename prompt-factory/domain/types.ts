/**
 * Prompt Factory — canonical domain model (the "IR" of the prompt compiler).
 *
 * The unit of the product is the PromptSpec, never the final string: a prompt
 * is only a compilation of a spec for a given target model profile.
 *
 * This module is framework-free (no React, no Next.js, no DOM) so the same
 * compiler can run in the web app, an API, a CLI or an editor extension.
 * IMPORTANT: inside prompt-factory/ use relative imports WITH the `.ts`
 * extension and `import type` for type-only imports (tests run on Node's
 * built-in type stripping via `node --test`).
 */

export const SPEC_VERSION = 1 as const;

export type PromptMode = "standard" | "agent";

/** Language of the compiled prompt's boilerplate (headings, protocol text). */
export type PromptLanguage = "es" | "en";

export type ContextKind = "background" | "source" | "user-profile" | "project" | "assumption";

export interface ContextItem {
  kind: ContextKind;
  text: string;
}

export interface PromptInput {
  name: string;
  description?: string;
  value?: string;
}

export interface DecisionRule {
  when: string;
  then: string;
}

export interface Example {
  input: string;
  output: string;
}

export type ToolKind = "web" | "browser" | "files" | "email" | "database" | "code" | "api" | "custom";

export interface ToolDefinition {
  id: string;
  kind: ToolKind;
  name: string;
  purpose?: string;
}

export type OutputKind = "free-text" | "markdown" | "json" | "xml" | "table" | "report" | "code" | "custom";

export interface OutputDefinition {
  kind: OutputKind;
  /** Free description of the expected structure ("informe con 5 secciones…"). */
  description?: string;
  /** JSON schema / XML skeleton / table columns, verbatim. */
  schema?: string;
  /** The user requires this exact structure (Rule Engine prioritizes it). */
  exactStructure?: boolean;
}

export type HumanApprovalCategory =
  | "send-messages"
  | "spend-money"
  | "delete-data"
  | "publish-content"
  | "modify-external-systems";

export interface AgentConfig {
  mission?: string;
  successCriteria?: string[];
  state?: {
    trackKnown: boolean;
    trackUnknown: boolean;
    trackCompleted: boolean;
    trackPending: boolean;
    trackBlockers: boolean;
    trackArtifacts: boolean;
  };
  loop?: {
    observe: boolean;
    assess: boolean;
    plan: boolean;
    act: boolean;
    verify: boolean;
    updateState: boolean;
  };
  errorRecovery?: {
    enabled: boolean;
    maxEquivalentRetries?: number;
    replanAfterFailures?: number;
    /** Distinct failed strategies before escalating. */
    escalateAfterStrategies?: number;
  };
  budget?: {
    maxIterations?: number;
    maxToolCalls?: number;
    maxRetries?: number;
  };
  memory?: {
    workingMemory?: boolean;
    episodicMemory?: boolean;
    semanticMemory?: boolean;
    artifactMemory?: boolean;
  };
  humanApproval?: HumanApprovalCategory[];
  humanApprovalRules?: string[];
  escalationRules?: string[];
  stopConditions?: string[];
  finalVerification?: string[];
}

export interface PromptSpec {
  version: typeof SPEC_VERSION;
  metadata: {
    title?: string;
    /** ModelProfile id, e.g. "claude" | "chatgpt" | "gemini". */
    targetModel: string;
    mode: PromptMode;
    language: PromptLanguage;
    presetId?: string;
  };
  /** Original free-form intent typed by the user (Step 1). */
  intent?: string;
  role?: string;
  objective: string;
  /** The concrete action, when different from the objective. */
  task?: string;
  context?: ContextItem[];
  inputs?: PromptInput[];
  requirements?: string[];
  constraints?: string[];
  priorities?: string[];
  workflow?: string[];
  decisionRules?: DecisionRule[];
  examples?: Example[];
  tools?: ToolDefinition[];
  outputFormat?: OutputDefinition;
  qualityCriteria?: string[];
  definitionOfDone?: string[];
  agent?: AgentConfig;
}

// ───────────────────────── Compilation ─────────────────────────

export type IssueSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  /** Stable machine code, e.g. "objective.missing". */
  code: string;
  severity: IssueSeverity;
  /** Dotted path of the offending field, e.g. "agent.stopConditions". */
  field?: string;
  /** Human-readable Spanish message. Never raw schema paths. */
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

/** Why the compiled prompt looks the way it does (Prompt Explainer). */
export interface TransformationExplanation {
  id: string;
  /** Section affected, e.g. "examples", "loop-protocol". */
  section?: string;
  /** Spanish sentence, e.g. "La sección Ejemplos aparece porque proporcionaste 3 ejemplos." */
  reason: string;
  /** Rule Engine rule that caused it, if any. */
  ruleId?: string;
}

export interface CompiledPrompt {
  targetId: string;
  prompt: string;
  syntax: "xml" | "markdown";
  /** Ordered ids of the sections emitted. */
  sections: string[];
  transformations: TransformationExplanation[];
}

export interface CompileResult {
  ok: boolean;
  targetId: string;
  /** Present when ok (errors block compilation; warnings do not). */
  compiled?: CompiledPrompt;
  validation: ValidationResult;
}

// ───────────────────────── Model profiles & adapters ─────────────────────────

export interface ModelProfile {
  /** Stable id used in PromptSpec.metadata.targetModel. */
  id: string;
  /** Configurable display name, e.g. "Claude Opus 5.5". */
  displayName: string;
  vendor: string;
  /** Reference id in the model catalog (OpenRouter), for linking. */
  catalogId?: string;
  /** Adapter implementation to use. Several profiles may share one adapter. */
  adapterId: string;
  /** One-line Spanish summary of the compilation style. */
  styleSummary: string;
}

export interface ModelAdapter {
  id: string;
  compile(spec: PromptSpec, profile: ModelProfile): CompiledPrompt;
  /** Target-specific checks (in addition to the shared validators). */
  validate(spec: PromptSpec): ValidationResult;
  explain(spec: PromptSpec, profile: ModelProfile): TransformationExplanation[];
}

// ───────────────────────── Quality, questions, parsing ─────────────────────────

export interface QualityCheck {
  id: string;
  label: string;
  status: "ok" | "warn" | "error";
  /** Points contributed (can be negative). */
  points: number;
}

export interface QualityReport {
  /** 0–100, structural completeness — NOT intellectual quality. */
  score: number;
  checks: QualityCheck[];
}

export interface SmartQuestion {
  id: string;
  /** Spanish question shown to the user. */
  question: string;
  /** Field of the spec the answer fills, e.g. "outputFormat". */
  field: string;
  /** Optional quick answers. */
  suggestions?: string[];
}

export interface Suggestion<T> {
  value: T;
  /** Fragment of the user's text that triggered the suggestion. */
  source: string;
  confidence: "low" | "medium";
}

/** Result of the deterministic freeform parser — always shown for confirmation. */
export interface FreeformSuggestions {
  objective?: Suggestion<string>;
  requirements: Suggestion<string>[];
  constraints: Suggestion<string>[];
  outputFormat?: Suggestion<OutputKind>;
  mode?: Suggestion<PromptMode>;
  tools: Suggestion<ToolKind>[];
  /** Sentences that matched no pattern (kept so nothing is silently lost). */
  unclassified: string[];
}

export interface Preset {
  id: string;
  label: string;
  description: string;
  /** A preset is a partial spec, never a hard-coded prompt. */
  spec: Partial<Omit<PromptSpec, "version" | "metadata">> & { metadata?: Partial<PromptSpec["metadata"]> };
}

// ───────────────────────── Library & export ─────────────────────────

export interface LibraryEntry {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  promptSpec: PromptSpec;
  /** targetId → compiled prompt string at save time. */
  compiledVersions: Record<string, string>;
}

/** Persistence port: localStorage today, PostgreSQL/Supabase tomorrow. */
export interface PromptLibraryRepository {
  list(): LibraryEntry[];
  get(id: string): LibraryEntry | undefined;
  save(entry: Omit<LibraryEntry, "createdAt" | "updatedAt"> & Partial<Pick<LibraryEntry, "createdAt">>): LibraryEntry;
  remove(id: string): void;
}

export type ExportFormat = "txt" | "md" | "json";

export interface ExportFile {
  filename: string;
  mime: string;
  content: string;
}
