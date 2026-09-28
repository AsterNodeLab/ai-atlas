import { modelProfiles } from "../config/models.ts";
import { CONTEXT_KINDS, isLoopEnabled, normalizeAgent, OUTPUT_KINDS, TOOL_KINDS } from "../compiler/Normalizer.ts";
import { HUMAN_APPROVAL_CATEGORIES } from "./defaults.ts";
import { s, validateAgainstSchema } from "./schema.ts";
import type { Schema } from "./schema.ts";
import { capitalize, findConflicts, findDuplicates, foldKey, isBlank, quote } from "./text.ts";
import type { Conflict, InstructionRef } from "./text.ts";
import type { ExportFormat, ModelProfile, PromptSpec, ValidationIssue } from "./types.ts";

/**
 * Shared (target-independent) validation. Every message is natural es-MX and
 * never exposes raw paths; `field` carries the dotted path for the UI.
 */

const stringList = (label: string) => s.array(label, s.string(label, false));

export const SPEC_SCHEMA: Schema = s.object(
  "especificación",
  {
    version: s.number("versión"),
    metadata: s.object(
      "metadatos",
      {
        title: s.string("título"),
        targetModel: s.string("modelo destino", false),
        mode: s.string("modo", false, ["standard", "agent"]),
        language: s.string("idioma", false, ["es", "en"]),
        presetId: s.string("preset"),
      },
      false,
    ),
    intent: s.string("intención"),
    role: s.string("rol"),
    // Optional here: a missing objective gets the friendlier "objective.missing" message.
    objective: s.string("objetivo"),
    task: s.string("tarea"),
    context: s.array("contexto", s.object("contexto", { kind: s.string("tipo", false, CONTEXT_KINDS), text: s.string("texto", false) }, false)),
    inputs: s.array(
      "datos de entrada",
      s.object("datos de entrada", { name: s.string("nombre", false), description: s.string("descripción"), value: s.string("valor") }, false),
    ),
    requirements: stringList("requisitos"),
    constraints: stringList("restricciones"),
    priorities: stringList("prioridades"),
    workflow: stringList("flujo de trabajo"),
    decisionRules: s.array("reglas de decisión", s.object("reglas de decisión", { when: s.string("condición", false), then: s.string("acción", false) }, false)),
    examples: s.array("ejemplos", s.object("ejemplos", { input: s.string("entrada", false), output: s.string("salida", false) }, false)),
    tools: s.array(
      "herramientas",
      s.object(
        "herramientas",
        { id: s.string("identificador", false), kind: s.string("tipo", false, TOOL_KINDS), name: s.string("nombre", false), purpose: s.string("propósito") },
        false,
      ),
    ),
    outputFormat: s.object("formato de salida", {
      kind: s.string("tipo de salida", false, OUTPUT_KINDS),
      description: s.string("descripción del formato"),
      schema: s.string("esquema"),
      exactStructure: s.boolean("estructura exacta"),
    }),
    qualityCriteria: stringList("criterios de calidad"),
    definitionOfDone: stringList("Definition of Done"),
    agent: s.object("configuración del agente", {
      mission: s.string("misión"),
      successCriteria: stringList("criterios de éxito"),
      state: s.object("estado del agente", {
        trackKnown: s.boolean("registrar lo conocido"),
        trackUnknown: s.boolean("registrar lo desconocido"),
        trackCompleted: s.boolean("registrar lo completado"),
        trackPending: s.boolean("registrar lo pendiente"),
        trackBlockers: s.boolean("registrar bloqueos"),
        trackArtifacts: s.boolean("registrar artefactos"),
      }),
      loop: s.object("loop del agente", {
        observe: s.boolean("observar"),
        assess: s.boolean("evaluar"),
        plan: s.boolean("planificar"),
        act: s.boolean("actuar"),
        verify: s.boolean("verificar"),
        updateState: s.boolean("actualizar estado"),
      }),
      errorRecovery: s.object("recuperación de errores", {
        enabled: s.boolean("recuperación de errores activa", false),
        maxEquivalentRetries: s.number("reintentos equivalentes"),
        replanAfterFailures: s.number("replanificar tras N fallos"),
        escalateAfterStrategies: s.number("escalar tras N estrategias"),
      }),
      budget: s.object("presupuesto", {
        maxIterations: s.number("máximo de iteraciones"),
        maxToolCalls: s.number("máximo de llamadas a herramientas"),
        maxRetries: s.number("máximo de reintentos"),
      }),
      memory: s.object("memoria", {
        workingMemory: s.boolean("memoria de trabajo"),
        episodicMemory: s.boolean("memoria episódica"),
        semanticMemory: s.boolean("memoria semántica"),
        artifactMemory: s.boolean("memoria de artefactos"),
      }),
      humanApproval: s.array("aprobación humana", s.string("aprobación humana", false, HUMAN_APPROVAL_CATEGORIES)),
      humanApprovalRules: stringList("reglas de aprobación humana"),
      escalationRules: stringList("reglas de escalamiento"),
      stopConditions: stringList("condiciones de parada"),
      finalVerification: stringList("verificación final"),
    }),
  },
  false,
);

/** Type/shape errors (things that would make compilation meaningless). */
export function validateStructure(value: unknown): ValidationIssue[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [{ code: "spec.invalid", severity: "error", message: "La especificación no tiene un formato válido." }];
  }
  return validateAgainstSchema(value, SPEC_SCHEMA);
}

export function hasErrors(issues: readonly ValidationIssue[]): boolean {
  return issues.some((i) => i.severity === "error");
}

/** Removes repeated issues (same code, field and message), keeping the first. */
export function dedupeIssues(issues: readonly ValidationIssue[]): ValidationIssue[] {
  const seen = new Set<string>();
  return issues.filter((i) => {
    const key = `${i.code}|${i.field ?? ""}|${i.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const EXPORT_FORMATS: readonly ExportFormat[] = ["txt", "md", "json"];

export function validateExportFormat(format: unknown): ValidationIssue | undefined {
  if (EXPORT_FORMATS.includes(format as ExportFormat)) return undefined;
  return {
    code: "export.format.invalid",
    severity: "error",
    field: "format",
    message: `El formato de exportación «${String(format)}» no es válido. Usa txt, md o json.`,
  };
}

// ───────────────────────── Messages reused by the Rule Engine ─────────────────────────

export const OBJECTIVE_MISSING: ValidationIssue = {
  code: "objective.missing",
  severity: "error",
  field: "objective",
  message: "Falta el objetivo: describe qué quieres que logre el modelo.",
};

const listNoun = (ref: InstructionRef) => (ref.list === "requirements" ? "el requisito" : "la restricción");

export function conflictIssue(conflict: Conflict): ValidationIssue {
  const { positive, negative } = conflict;
  const message =
    conflict.kind === "polarity"
      ? `${capitalize(listNoun(positive))} ${quote(positive.text)} contradice ${listNoun(negative)} ${quote(negative.text)}. Decide cuál debe prevalecer.`
      : `${capitalize(listNoun(negative))} ${quote(negative.text)} fija un máximo menor que el mínimo de ${listNoun(positive)} ${quote(positive.text)}.`;
  return { code: "instructions.conflict", severity: "warning", field: `${negative.list}.${negative.index}`, message };
}

// ───────────────────────── Shared semantic validation ─────────────────────────

export interface SharedValidationOptions {
  /** Target the spec is being compiled for (defaults to metadata.targetModel). */
  targetId?: string;
  profiles?: readonly ModelProfile[];
}

const DUPLICATE_LISTS: { key: keyof PromptSpec; noun: string; repeated: string }[] = [
  { key: "requirements", noun: "El requisito", repeated: "está repetido" },
  { key: "constraints", noun: "La restricción", repeated: "está repetida" },
  { key: "priorities", noun: "La prioridad", repeated: "está repetida" },
  { key: "workflow", noun: "El paso del flujo de trabajo", repeated: "está repetido" },
  { key: "qualityCriteria", noun: "El criterio de calidad", repeated: "está repetido" },
  { key: "definitionOfDone", noun: "El criterio de terminado", repeated: "está repetido" },
];

const AGENT_DUPLICATE_LISTS: { key: "successCriteria" | "stopConditions" | "finalVerification"; noun: string; repeated: string }[] = [
  { key: "successCriteria", noun: "El criterio de éxito", repeated: "está repetido" },
  { key: "stopConditions", noun: "La condición de parada", repeated: "está repetida" },
  { key: "finalVerification", noun: "El punto de verificación final", repeated: "está repetido" },
];

interface NumberRule {
  field: "maxIterations" | "maxToolCalls" | "maxRetries" | "maxEquivalentRetries" | "replanAfterFailures" | "escalateAfterStrategies";
  group: "budget" | "errorRecovery";
  label: string;
  min: number;
  saneMax: number;
  tooHigh: (n: number) => string;
}

const NUMBER_RULES: NumberRule[] = [
  {
    field: "maxIterations",
    group: "budget",
    label: "El máximo de iteraciones",
    min: 1,
    saneMax: 200,
    tooHigh: (n) => `Un máximo de ${n} iteraciones es muy alto: un agente sin avances podría consumir mucho presupuesto. Considera un límite menor.`,
  },
  {
    field: "maxToolCalls",
    group: "budget",
    label: "El máximo de llamadas a herramientas",
    min: 1,
    saneMax: 1000,
    tooHigh: (n) => `Un máximo de ${n} llamadas a herramientas es muy alto. Considera un límite menor.`,
  },
  {
    field: "maxRetries",
    group: "budget",
    label: "El máximo de reintentos",
    min: 0,
    saneMax: 50,
    tooHigh: (n) => `Un máximo de ${n} reintentos es muy alto. Considera un límite menor.`,
  },
  {
    field: "maxEquivalentRetries",
    group: "errorRecovery",
    label: "El número de reintentos equivalentes",
    min: 0,
    saneMax: 10,
    tooHigh: (n) => `Repetir ${n} veces la misma acción rara vez ayuda; considera replanificar antes.`,
  },
  {
    field: "replanAfterFailures",
    group: "errorRecovery",
    label: "El número de fallos antes de replanificar",
    min: 1,
    saneMax: 10,
    tooHigh: (n) => `Esperar ${n} fallos antes de replanificar es demasiado; considera un número menor.`,
  },
  {
    field: "escalateAfterStrategies",
    group: "errorRecovery",
    label: "El número de estrategias antes de escalar",
    min: 1,
    saneMax: 10,
    tooHigh: (n) => `Probar ${n} estrategias distintas antes de escalar es demasiado; considera un número menor.`,
  },
];

function validateAgent(spec: PromptSpec): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const raw = spec.agent;
  const isAgent = spec.metadata.mode === "agent";

  if (!isAgent) {
    const hasContent =
      raw &&
      (!isBlank(raw.mission) ||
        (raw.successCriteria?.length ?? 0) > 0 ||
        (raw.stopConditions?.length ?? 0) > 0 ||
        (raw.finalVerification?.length ?? 0) > 0);
    if (hasContent) {
      issues.push({
        code: "agent.ignored",
        severity: "info",
        field: "metadata.mode",
        message: "Hay una configuración de agente guardada, pero el modo es estándar: no se incluirá en el prompt.",
      });
    }
    return issues;
  }

  if (!raw) {
    issues.push({
      code: "agent.defaults",
      severity: "info",
      field: "agent",
      message: "Activaste el modo agente sin configurarlo; se usarán los valores predeterminados (loop completo, 20 iteraciones y 2 reintentos).",
    });
  }

  for (const rule of NUMBER_RULES) {
    const group = raw?.[rule.group] as Record<string, unknown> | undefined;
    const value = group?.[rule.field];
    if (value === undefined || value === null) continue;
    const field = `agent.${rule.group}.${rule.field}`;
    if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value) || value < rule.min) {
      issues.push({
        code: `agent.${rule.group}.invalid`,
        severity: "error",
        field,
        message: `${rule.label} debe ser un número entero mayor o igual a ${rule.min}.`,
      });
    } else if (value > rule.saneMax) {
      issues.push({ code: `agent.${rule.group}.high`, severity: "warning", field, message: rule.tooHigh(value) });
    }
  }

  const agent = normalizeAgent(raw);
  const { budget, errorRecovery } = agent;

  if (
    errorRecovery.enabled &&
    budget.maxRetries !== undefined &&
    errorRecovery.maxEquivalentRetries !== undefined &&
    errorRecovery.maxEquivalentRetries > budget.maxRetries
  ) {
    issues.push({
      code: "agent.retries.inconsistent",
      severity: "warning",
      field: "agent.budget.maxRetries",
      message: `Permites ${errorRecovery.maxEquivalentRetries} reintentos equivalentes, pero el presupuesto total de reintentos es ${budget.maxRetries}.`,
    });
  }

  if (!isLoopEnabled(agent)) {
    issues.push({
      code: "agent.loop.empty",
      severity: "warning",
      field: "agent.loop",
      message: "El loop del agente no tiene ninguna fase activa, así que el protocolo del loop no se incluirá.",
    });
  } else if (agent.stopConditions.length === 0 && budget.maxIterations === undefined) {
    issues.push({
      code: "agent.loop.noStop",
      severity: "error",
      field: "agent.stopConditions",
      message: "Tu agente tiene activado un loop, pero no tiene ninguna condición de parada ni un máximo de iteraciones. Agrega al menos una de las dos.",
    });
  } else if (agent.stopConditions.length === 0) {
    issues.push({
      code: "agent.stopConditions.missing",
      severity: "warning",
      field: "agent.stopConditions",
      message: `Tu agente no tiene condiciones de parada propias: solo se detendrá al cumplir la Definition of Done o al llegar a ${budget.maxIterations} iteraciones.`,
    });
  }

  if (!errorRecovery.enabled) {
    issues.push({
      code: "agent.errorRecovery.disabled",
      severity: "info",
      field: "agent.errorRecovery",
      message: "La recuperación de errores está desactivada: el agente no tendrá instrucciones sobre qué hacer cuando algo falle.",
    });
  }

  for (const list of AGENT_DUPLICATE_LISTS) {
    for (const hit of findDuplicates(raw?.[list.key])) {
      issues.push({
        code: `agent.${list.key}.duplicate`,
        severity: "warning",
        field: `agent.${list.key}.${hit.index}`,
        message: `${list.noun} ${quote(hit.value)} ${list.repeated}; se incluirá una sola vez.`,
      });
    }
  }
  return issues;
}

function validateTarget(spec: PromptSpec, options: SharedValidationOptions): ValidationIssue[] {
  const profiles = options.profiles ?? modelProfiles;
  const known = (id: string) => profiles.some((p) => p.id === id);
  const names = profiles.map((p) => p.displayName).join(", ");
  const target = options.targetId ?? spec.metadata.targetModel;
  const issues: ValidationIssue[] = [];

  if (isBlank(target)) {
    issues.push({ code: "target.missing", severity: "error", field: "metadata.targetModel", message: `Elige un modelo destino: ${names}.` });
  } else if (!known(target)) {
    issues.push({
      code: "target.unknown",
      severity: "error",
      field: "metadata.targetModel",
      message: `El modelo destino «${target}» no está configurado. Elige uno de estos: ${names}.`,
    });
  }
  if (options.targetId && !isBlank(spec.metadata.targetModel) && !known(spec.metadata.targetModel) && options.targetId !== spec.metadata.targetModel) {
    issues.push({
      code: "metadata.targetModel.unknown",
      severity: "warning",
      field: "metadata.targetModel",
      message: `El modelo guardado en la especificación («${spec.metadata.targetModel}») no está configurado; se compilará para el modelo elegido.`,
    });
  }
  return issues;
}

function validateContent(spec: PromptSpec): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  (spec.examples ?? []).forEach((example, i) => {
    const noInput = isBlank(example?.input);
    const noOutput = isBlank(example?.output);
    if (noInput && noOutput) {
      issues.push({ code: "examples.empty", severity: "warning", field: `examples.${i}`, message: `El ejemplo ${i + 1} está vacío y se omitirá.` });
    } else if (noInput || noOutput) {
      issues.push({
        code: "examples.incomplete",
        severity: "warning",
        field: `examples.${i}.${noInput ? "input" : "output"}`,
        message: `Al ejemplo ${i + 1} le falta ${noInput ? "la entrada" : "la salida esperada"}; se omitirá hasta que lo completes.`,
      });
    }
  });

  for (const list of DUPLICATE_LISTS) {
    for (const hit of findDuplicates(spec[list.key] as unknown[] | undefined)) {
      issues.push({
        code: `${list.key}.duplicate`,
        severity: "warning",
        field: `${list.key}.${hit.index}`,
        message: `${list.noun} ${quote(hit.value)} ${list.repeated}; se incluirá una sola vez.`,
      });
    }
  }

  const constraintKeys = new Map<string, number>();
  (spec.constraints ?? []).forEach((c, i) => {
    const key = foldKey(c ?? "");
    if (key && !constraintKeys.has(key)) constraintKeys.set(key, i);
  });
  const crossSeen = new Set<string>();
  (spec.requirements ?? []).forEach((r) => {
    const key = foldKey(r ?? "");
    const index = constraintKeys.get(key);
    if (!key || index === undefined || crossSeen.has(key)) return;
    crossSeen.add(key);
    issues.push({
      code: "instructions.duplicate",
      severity: "warning",
      field: `constraints.${index}`,
      message: `${quote(r)} aparece como requisito y como restricción; basta con incluirlo una vez.`,
    });
  });

  for (const conflict of findConflicts(spec.requirements ?? [], spec.constraints ?? [])) issues.push(conflictIssue(conflict));

  (spec.decisionRules ?? []).forEach((rule, i) => {
    const noWhen = isBlank(rule?.when);
    const noThen = isBlank(rule?.then);
    if (noWhen && noThen) return;
    if (noWhen || noThen) {
      issues.push({
        code: "decisionRules.incomplete",
        severity: "warning",
        field: `decisionRules.${i}.${noWhen ? "when" : "then"}`,
        message: `La regla de decisión ${i + 1} está incompleta (falta ${noWhen ? "la condición" : "la acción"}); se omitirá.`,
      });
    }
  });

  (spec.tools ?? []).forEach((tool, i) => {
    if (tool?.kind === "custom" && isBlank(tool.name)) {
      issues.push({ code: "tools.unnamed", severity: "warning", field: `tools.${i}.name`, message: `La herramienta personalizada ${i + 1} no tiene nombre.` });
    }
  });

  (spec.inputs ?? []).forEach((input, i) => {
    if (isBlank(input?.name) && (!isBlank(input?.description) || !isBlank(input?.value))) {
      issues.push({ code: "inputs.unnamed", severity: "warning", field: `inputs.${i}.name`, message: `El dato de entrada ${i + 1} no tiene nombre.` });
    }
  });

  const output = spec.outputFormat;
  if (output) {
    const schema = output.schema?.trim() ?? "";
    if (output.kind === "json" && /^[[{]/.test(schema)) {
      try {
        JSON.parse(schema);
      } catch {
        issues.push({
          code: "outputFormat.schema.invalidJson",
          severity: "warning",
          field: "outputFormat.schema",
          message: "El esquema del formato de salida no es JSON válido; corrígelo para que el modelo no copie una estructura rota.",
        });
      }
    }
    if (output.exactStructure && isBlank(output.description) && !schema) {
      issues.push({
        code: "outputFormat.exactStructure.empty",
        severity: "warning",
        field: "outputFormat.description",
        message: "Pediste respetar una estructura exacta, pero no la describiste. Agrega una descripción o un esquema.",
      });
    } else if (output.kind === "custom" && isBlank(output.description) && !schema) {
      issues.push({
        code: "outputFormat.custom.empty",
        severity: "warning",
        field: "outputFormat.description",
        message: "Elegiste un formato de salida personalizado, pero no lo describiste.",
      });
    }
  }
  return issues;
}

/**
 * Shared validation of a (raw, user-entered) spec. Structural errors are
 * returned alone, because semantic checks on a malformed spec are meaningless.
 */
export function validateSharedSpec(spec: PromptSpec, options: SharedValidationOptions = {}): ValidationIssue[] {
  const structural = validateStructure(spec);
  if (hasErrors(structural)) return structural;
  const issues: ValidationIssue[] = [];
  if (isBlank(spec.objective)) issues.push(OBJECTIVE_MISSING);
  issues.push(...validateTarget(spec, options), ...validateAgent(spec), ...validateContent(spec));
  return dedupeIssues(issues);
}
