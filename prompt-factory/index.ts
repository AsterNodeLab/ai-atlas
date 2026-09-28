/**
 * Prompt Factory — public API (the only module the UI may import).
 *
 * CONTRACT: these signatures are fixed so the UI and the engine can be built in
 * parallel. Implementations live in compiler/, adapters/, agent/, questions/,
 * parsers/, presets/, storage/, export/ and config/; this file only delegates.
 * Everything here is pure, deterministic and browser-safe (no AI, no Node APIs).
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
import { modelProfiles as configuredProfiles } from "./config/models.ts";
import { createEmptySpec as buildEmptySpec, defaultAgentConfig as buildDefaultAgentConfig } from "./domain/defaults.ts";
import { compileForAllTargets, compileForTarget, validateForTarget } from "./compiler/PromptCompiler.ts";
import { evaluateSpecQuality } from "./compiler/QualityEngine.ts";
import { getSmartQuestions } from "./questions/QuestionEngine.ts";
import { parseFreeformText } from "./parsers/FreeformParser.ts";
import { applyPresetToSpec, presetList } from "./presets/index.ts";
import { exportPromptFile, importSpecJson } from "./export/Exporter.ts";
import { createLocalLibraryRepository } from "./storage/LocalLibrary.ts";
import type { KeyValueStorage } from "./storage/LocalLibrary.ts";

export type * from "./domain/types.ts";
export type { KeyValueStorage } from "./storage/LocalLibrary.ts";

/** Configurable target profiles (Claude, ChatGPT, Gemini… add more in config/). */
export const modelProfiles: ModelProfile[] = configuredProfiles;

export function getModelProfile(id: string): ModelProfile | undefined {
  return modelProfiles.find((p) => p.id === id);
}

/** A blank, valid-shaped spec (objective empty). */
export function createEmptySpec(options?: { mode?: PromptMode; targetModel?: string; language?: PromptLanguage }): PromptSpec {
  return buildEmptySpec(options);
}

/** Sensible AgentConfig defaults (loop on, retries 2, replan after 2, 20 iterations…). */
export function defaultAgentConfig(): AgentConfig {
  return buildDefaultAgentConfig();
}

/** Shared + target-specific validation. Human-readable Spanish messages. */
export function validateSpec(spec: PromptSpec, targetId?: string): ValidationResult {
  return validateForTarget(spec, targetId);
}

/** Normalize → rules → adapter → format → validate. Errors block; warnings don't. */
export function compilePrompt(spec: PromptSpec, targetId: string): CompileResult {
  return compileForTarget(spec, targetId);
}

/** Compare mode: same spec compiled for every profile. Keyed by profile id. */
export function compileAll(spec: PromptSpec): Record<string, CompileResult> {
  return compileForAllTargets(spec);
}

/** Deterministic structural completeness score (not intellectual quality). */
export function evaluateQuality(spec: PromptSpec): QualityReport {
  return evaluateSpecQuality(spec);
}

/** Deterministic follow-up questions for missing/weak parts of the spec. */
export function getQuestions(spec: PromptSpec): SmartQuestion[] {
  return getSmartQuestions(spec);
}

/** Keyword/regex parser for Step 1 free text. Suggestions must be confirmed by the user. */
export function parseFreeform(text: string): FreeformSuggestions {
  return parseFreeformText(text);
}

/** Presets are Partial<PromptSpec>, merged without overwriting user data. */
export const presets: Preset[] = presetList;

export function applyPreset(spec: PromptSpec, presetId: string): PromptSpec {
  return applyPresetToSpec(spec, presetId);
}

/** txt/md contain the prompt; json preserves the PromptSpec (+ compiled versions). */
export function exportPrompt(spec: PromptSpec, result: CompileResult | undefined, format: ExportFormat): ExportFile {
  return exportPromptFile(spec, result, format);
}

/** Parses an exported .json back into a PromptSpec (validated, with readable issues). */
export function importSpec(json: string): { spec?: PromptSpec; issues: ValidationIssue[] } {
  return importSpecJson(json);
}

export function createLocalLibrary(storage: KeyValueStorage): PromptLibraryRepository {
  return createLocalLibraryRepository(storage);
}
