import { getAdapter } from "../adapters/registry.ts";
import { modelProfiles } from "../config/models.ts";
import { dedupeIssues, hasErrors, validateSharedSpec, validateStructure } from "../domain/validators.ts";
import type { CompileResult, ModelAdapter, ModelProfile, PromptSpec, ValidationIssue, ValidationResult } from "../domain/types.ts";
import { formatPrompt } from "./Formatter.ts";
import { normalizeSpec } from "./Normalizer.ts";
import { validateOutput } from "./OutputValidator.ts";
import { evaluateRules } from "./RuleEngine.ts";

/**
 * Pipeline: validate (shared + rules + target) → normalize → rules → adapter
 * → formatter → output validation → CompileResult.
 * Errors block compilation (ok:false, no `compiled`); warnings pass through.
 * Never throws: unexpected failures become readable issues.
 */

export interface CompilerOptions {
  profiles?: readonly ModelProfile[];
  resolveAdapter?: (adapterId: string) => ModelAdapter | undefined;
}

function toResult(issues: ValidationIssue[]): ValidationResult {
  const deduped = dedupeIssues(issues);
  return { valid: !hasErrors(deduped), issues: deduped };
}

function resolveTarget(targetId: string, options: CompilerOptions) {
  const profile = (options.profiles ?? modelProfiles).find((p) => p.id === targetId);
  const adapter = profile ? (options.resolveAdapter ?? getAdapter)(profile.adapterId) : undefined;
  return { profile, adapter };
}

export function validateForTarget(spec: PromptSpec, targetId?: string, options: CompilerOptions = {}): ValidationResult {
  try {
    const structural = validateStructure(spec);
    if (hasErrors(structural)) return toResult(structural);

    const issues: ValidationIssue[] = [...validateSharedSpec(spec, { targetId, profiles: options.profiles })];
    issues.push(...evaluateRules(spec).issues);

    const target = targetId ?? spec.metadata.targetModel;
    const { profile, adapter } = resolveTarget(target, options);
    if (profile && !adapter) {
      issues.push({
        code: "adapter.missing",
        severity: "error",
        field: "metadata.targetModel",
        message: `El modelo ${profile.displayName} no tiene un adaptador disponible («${profile.adapterId}»).`,
      });
    } else if (adapter) {
      issues.push(...adapter.validate(spec).issues);
    }
    return toResult(issues);
  } catch {
    return toResult([{ code: "validation.internal", severity: "error", message: "Ocurrió un error interno al validar la especificación." }]);
  }
}

export function compileForTarget(spec: PromptSpec, targetId: string, options: CompilerOptions = {}): CompileResult {
  const validation = validateForTarget(spec, targetId, options);
  if (!validation.valid) return { ok: false, targetId, validation };

  const { profile, adapter } = resolveTarget(targetId, options);
  if (!profile || !adapter) return { ok: false, targetId, validation: { valid: false, issues: validation.issues } };

  try {
    const normalized = normalizeSpec(spec);
    const compiled = adapter.compile(normalized, profile);
    const prompt = formatPrompt(compiled.prompt);
    const outputIssues = validateOutput(prompt, compiled.syntax, normalized);
    const issues = dedupeIssues([...validation.issues, ...outputIssues]);
    if (hasErrors(outputIssues)) return { ok: false, targetId, validation: { valid: false, issues } };
    return { ok: true, targetId, compiled: { ...compiled, prompt }, validation: { valid: true, issues } };
  } catch {
    const issue: ValidationIssue = {
      code: "compile.internal",
      severity: "error",
      message: `Ocurrió un error interno al compilar el prompt para ${profile.displayName}.`,
    };
    return { ok: false, targetId, validation: { valid: false, issues: [...validation.issues, issue] } };
  }
}

/** Compare mode: the same spec compiled for every configured profile. */
export function compileForAllTargets(spec: PromptSpec, options: CompilerOptions = {}): Record<string, CompileResult> {
  const out: Record<string, CompileResult> = {};
  for (const profile of options.profiles ?? modelProfiles) out[profile.id] = compileForTarget(spec, profile.id, options);
  return out;
}
