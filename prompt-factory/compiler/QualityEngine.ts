import { findConflicts, findDuplicates, foldKey, isVagueObjective, matchesAny, plural } from "../domain/text.ts";
import { validateStructure, hasErrors } from "../domain/validators.ts";
import type { PromptSpec, QualityCheck, QualityReport } from "../domain/types.ts";
import { normalizeSpec } from "./Normalizer.ts";
import type { NormalizedSpec } from "./Normalizer.ts";

/**
 * Deterministic STRUCTURAL completeness score (0–100). It measures whether the
 * spec has the parts a good prompt needs — not the intellectual quality of
 * the text.
 *
 *   objective 20 · context 10 · requirements 15 · constraints 10 · output 15
 *   definition of done 10 · examples (when relevant) 10 · role 5 · process 5
 *   penalties: conflicting instructions −20 · duplicated requirements −5 ·
 *   extremely ambiguous objective −15. Clamped to 0–100.
 */

export const QUALITY_POINTS = {
  objective: 20,
  context: 10,
  requirements: 15,
  constraints: 10,
  output: 15,
  definitionOfDone: 10,
  examples: 10,
  role: 5,
  process: 5,
  conflicts: -20,
  duplicates: -5,
  vague: -15,
} as const;

const CLASSIFICATION_PATTERNS: readonly RegExp[] = [/\b(clasific\w*|categori\w*|etiquet\w*|classif\w*|label\w*|sentiment\w*|extrae\w*|extraer|extract\w*)\b/];

/** Examples matter for structured outputs, exact structures and classification/extraction tasks. */
export function examplesAreRelevant(spec: NormalizedSpec): boolean {
  const output = spec.outputFormat;
  if (output && (["json", "xml", "table", "code"].includes(output.kind) || output.exactStructure)) return true;
  return matchesAny([spec.objective, spec.task ?? "", ...spec.requirements].join("\n"), CLASSIFICATION_PATTERNS);
}

function check(id: string, ok: boolean, okLabel: string, missingLabel: string, points: number, missingStatus: "warn" | "error" = "warn"): QualityCheck {
  return ok ? { id, label: okLabel, status: "ok", points } : { id, label: missingLabel, status: missingStatus, points: 0 };
}

export function evaluateSpecQuality(spec: PromptSpec): QualityReport {
  if (hasErrors(validateStructure(spec))) {
    return { score: 0, checks: [{ id: "structure", label: "La especificación tiene un formato inválido", status: "error", points: 0 }] };
  }
  const n = normalizeSpec(spec);
  const P = QUALITY_POINTS;
  const agent = n.agent;
  const checks: QualityCheck[] = [];

  checks.push(check("objective", Boolean(n.objective), "Objetivo definido", "Falta el objetivo", P.objective, "error"));
  checks.push(check("context", n.context.length > 0 || n.inputs.length > 0, "Contexto incluido", "Sin contexto", P.context));
  checks.push(
    check(
      "requirements",
      n.requirements.length > 0,
      `Requisitos definidos (${plural(n.requirements.length, "requisito", "requisitos")})`,
      "No hay requisitos",
      P.requirements,
    ),
  );
  checks.push(check("constraints", n.constraints.length > 0, "Restricciones definidas", "No hay restricciones", P.constraints));
  checks.push(check("output", Boolean(n.outputFormat), "Formato de salida definido", "Falta el formato de salida", P.output));

  const hasDod = n.definitionOfDone.length > 0 || Boolean(agent && (agent.successCriteria.length > 0 || agent.finalVerification.length > 0));
  checks.push(check("definition-of-done", hasDod, "Definition of Done definida", "Falta la Definition of Done", P.definitionOfDone));

  if (n.examples.length > 0) {
    checks.push({ id: "examples", label: `Ejemplos incluidos (${n.examples.length})`, status: "ok", points: P.examples });
  } else if (!n.objective || examplesAreRelevant(n)) {
    checks.push({ id: "examples", label: "No hay ejemplos", status: "warn", points: 0 });
  } else {
    checks.push({ id: "examples", label: "Ejemplos no necesarios para este tipo de tarea", status: "ok", points: P.examples });
  }

  checks.push(check("role", Boolean(n.role), "Rol definido", "Sin rol", P.role));
  const hasProcess = n.workflow.length > 0 || n.qualityCriteria.length > 0 || n.decisionRules.length > 0 || n.priorities.length > 0;
  checks.push(check("process", hasProcess, "Criterios de calidad o flujo de trabajo definidos", "Sin criterios de calidad ni flujo de trabajo", P.process));

  if (agent) {
    checks.push({
      id: "agent-stop-conditions",
      label: agent.stopConditions.length ? "Condiciones de parada del agente definidas" : "El agente no tiene condiciones de parada propias",
      status: agent.stopConditions.length ? "ok" : "warn",
      points: 0,
    });
  }

  // Penalties are computed on the raw lists (the normalizer already removed duplicates).
  if (findConflicts(n.requirements, n.constraints).length > 0) {
    checks.push({ id: "conflicts", label: "Instrucciones contradictorias", status: "error", points: P.conflicts });
  }
  const requirementKeys = new Set(n.requirements.map(foldKey));
  const hasDuplicates =
    findDuplicates(spec.requirements).length > 0 ||
    findDuplicates(spec.constraints).length > 0 ||
    n.constraints.some((c) => requirementKeys.has(foldKey(c)));
  if (hasDuplicates) checks.push({ id: "duplicates", label: "Requisitos duplicados", status: "warn", points: P.duplicates });
  if (n.objective && isVagueObjective(n.objective)) {
    checks.push({ id: "vague-objective", label: "Objetivo demasiado ambiguo", status: "warn", points: P.vague });
  }

  const total = checks.reduce((sum, c) => sum + c.points, 0);
  return { score: Math.max(0, Math.min(100, total)), checks };
}
