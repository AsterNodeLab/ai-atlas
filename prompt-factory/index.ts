/**
 * Prompt Factory — public API (the only module the UI may import).
 *
 * CONTRACT: these signatures are fixed so the UI and the engine can be built in
 * parallel. The engine team replaces the stub bodies with real implementations
 * (re-exporting from compiler/, adapters/, agent/, questions/, parsers/,
 * presets/, storage/, config/) WITHOUT changing names or signatures.
 */
import type {
  CompileResult,
  ExportFile,
  ExportFormat,
  FreeformSuggestions,
  ModelProfile,
  Preset,
  PromptLanguage,
  PromptLibraryRepository,
  PromptMode,
  PromptSpec,
  QualityReport,
  SmartQuestion,
  ValidationIssue,
  ValidationResult,
  AgentConfig,
} from "./domain/types.ts";

export type * from "./domain/types.ts";

const notImplemented = (name: string): never => {
  throw new Error(`prompt-factory: ${name} not implemented yet`);
};

/** Configurable target profiles (Claude, ChatGPT, Gemini… add more in config/). */
export const modelProfiles: ModelProfile[] = [];

export function getModelProfile(id: string): ModelProfile | undefined {
  return modelProfiles.find((p) => p.id === id);
}

/** A blank, valid-shaped spec (objective empty). */
export function createEmptySpec(options?: { mode?: PromptMode; targetModel?: string; language?: PromptLanguage }): PromptSpec {
  void options;
  return notImplemented("createEmptySpec");
}

/** Sensible AgentConfig defaults (loop on, retries 2, replan after 2, 20 iterations…). */
export function defaultAgentConfig(): AgentConfig {
  return notImplemented("defaultAgentConfig");
}

/** Shared + target-specific validation. Human-readable Spanish messages. */
export function validateSpec(spec: PromptSpec, targetId?: string): ValidationResult {
  void spec;
  void targetId;
  return notImplemented("validateSpec");
}

/** Normalize → rules → adapter → format → validate. Errors block; warnings don't. */
export function compilePrompt(spec: PromptSpec, targetId: string): CompileResult {
  void spec;
  void targetId;
  return notImplemented("compilePrompt");
}

/** Compare mode: same spec compiled for every profile. Keyed by profile id. */
export function compileAll(spec: PromptSpec): Record<string, CompileResult> {
  void spec;
  return notImplemented("compileAll");
}

/** Deterministic structural completeness score (not intellectual quality). */
export function evaluateQuality(spec: PromptSpec): QualityReport {
  void spec;
  return notImplemented("evaluateQuality");
}

/** Deterministic follow-up questions for missing/weak parts of the spec. */
export function getQuestions(spec: PromptSpec): SmartQuestion[] {
  void spec;
  return notImplemented("getQuestions");
}

/** Keyword/regex parser for Step 1 free text. Suggestions must be confirmed by the user. */
export function parseFreeform(text: string): FreeformSuggestions {
  void text;
  return notImplemented("parseFreeform");
}

/** Presets are Partial<PromptSpec>, merged without overwriting user data. */
export const presets: Preset[] = [];

export function applyPreset(spec: PromptSpec, presetId: string): PromptSpec {
  void spec;
  void presetId;
  return notImplemented("applyPreset");
}

/** txt/md contain the prompt; json preserves the PromptSpec (+ compiled versions). */
export function exportPrompt(spec: PromptSpec, result: CompileResult | undefined, format: ExportFormat): ExportFile {
  void spec;
  void result;
  void format;
  return notImplemented("exportPrompt");
}

/** Parses an exported .json back into a PromptSpec (validated, with readable issues). */
export function importSpec(json: string): { spec?: PromptSpec; issues: ValidationIssue[] } {
  void json;
  return notImplemented("importSpec");
}

/** Minimal storage port so the engine never touches window directly. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function createLocalLibrary(storage: KeyValueStorage): PromptLibraryRepository {
  void storage;
  return notImplemented("createLocalLibrary");
}
