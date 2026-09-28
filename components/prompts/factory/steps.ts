import { getModelProfile, type PromptSpec } from "@/prompt-factory";
import { APPROVAL_LABELS, OUTPUT_KIND_LABELS } from "./labels";

/** Wizard navigation model: which steps exist, where each spec field is edited. */

export type StepId =
  | "intent"
  | "target"
  | "objective"
  | "context"
  | "requirements"
  | "constraints"
  | "output"
  | "examples"
  | "mission"
  | "tools"
  | "state"
  | "loop"
  | "budget"
  | "safety";

export interface StepDef {
  id: StepId;
  title: string;
  description: string;
  agentOnly?: boolean;
}

export const STEPS: StepDef[] = [
  { id: "intent", title: "¿Qué quieres lograr?", description: "Describe la tarea con tus palabras; puedes analizarla para obtener sugerencias." },
  { id: "target", title: "Modelo destino", description: "Para qué modelo se compila el prompt." },
  { id: "objective", title: "Objetivo", description: "El resultado que debe producir el modelo." },
  { id: "context", title: "Contexto", description: "Antecedentes, fuentes y datos de entrada." },
  { id: "requirements", title: "Requisitos", description: "Lo que la respuesta debe cumplir." },
  { id: "constraints", title: "Restricciones", description: "Límites, prioridades, reglas de decisión y flujo." },
  { id: "output", title: "Salida", description: "Formato, criterios de calidad y definición de terminado." },
  { id: "examples", title: "Ejemplos", description: "Pares de entrada y salida esperada (few-shot)." },
  { id: "mission", title: "Misión y criterios de éxito", description: "Para qué existe el agente y cómo sabe que terminó bien.", agentOnly: true },
  { id: "tools", title: "Herramientas", description: "Qué puede usar el agente para actuar.", agentOnly: true },
  { id: "state", title: "Estado", description: "Qué información mantiene el agente entre iteraciones.", agentOnly: true },
  { id: "loop", title: "Loop", description: "Las fases de cada iteración del agente.", agentOnly: true },
  { id: "budget", title: "Reintentos y presupuesto", description: "Recuperación de errores, límites y memoria.", agentOnly: true },
  { id: "safety", title: "Aprobación humana y parada", description: "Qué requiere permiso, cuándo parar y cómo escalar.", agentOnly: true },
];

/** Agent steps appear in agent mode; Herramientas also appears whenever the spec already has tools. */
export function getVisibleSteps(spec: PromptSpec): StepDef[] {
  const agent = spec.metadata.mode === "agent";
  const hasTools = (spec.tools?.length ?? 0) > 0;
  return STEPS.filter((s) => !s.agentOnly || agent || (s.id === "tools" && hasTools));
}

const FIELD_TO_STEP = new Map<string, StepId>([
  ["intent", "intent"],
  ["metadata", "target"],
  ["metadata.targetModel", "target"],
  ["metadata.language", "target"],
  ["objective", "objective"],
  ["role", "objective"],
  ["task", "objective"],
  ["context", "context"],
  ["inputs", "context"],
  ["requirements", "requirements"],
  ["constraints", "constraints"],
  ["priorities", "constraints"],
  ["workflow", "constraints"],
  ["decisionRules", "constraints"],
  ["outputFormat", "output"],
  ["qualityCriteria", "output"],
  ["definitionOfDone", "output"],
  ["examples", "examples"],
  ["tools", "tools"],
  ["agent", "mission"],
  ["agent.mission", "mission"],
  ["agent.successCriteria", "mission"],
  ["agent.state", "state"],
  ["agent.loop", "loop"],
  ["agent.errorRecovery", "budget"],
  ["agent.budget", "budget"],
  ["agent.memory", "budget"],
  ["agent.humanApproval", "safety"],
  ["agent.humanApprovalRules", "safety"],
  ["agent.escalationRules", "safety"],
  ["agent.stopConditions", "safety"],
  ["agent.finalVerification", "safety"],
]);

/** "examples.0.input" → ["examples.0.input", "examples.0", "examples"]. */
export function fieldCandidates(field: string): string[] {
  const parts = field.split(".");
  return parts.map((_, i) => parts.slice(0, parts.length - i).join("."));
}

export function stepForField(field: string | undefined): StepId | undefined {
  if (!field) return undefined;
  for (const candidate of fieldCandidates(field)) {
    const step = FIELD_TO_STEP.get(candidate);
    if (step) return step;
  }
  return undefined;
}

/** DOM id of the control that edits a spec field (used to focus it from panels). */
export function fieldDomId(field: string): string {
  return `pf-${field.replace(/[^A-Za-z0-9_-]+/g, "-")}`;
}

export const stepHeaderId = (step: StepId) => `pf-step-${step}`;
export const stepBodyId = (step: StepId) => `pf-step-${step}-body`;

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const truncate = (text: string, max = 48) => {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
};

/** Short, factual summary shown in a collapsed step header (null = nothing filled yet). */
export function stepSummary(step: StepId, spec: PromptSpec): string | null {
  const agent = spec.agent;
  switch (step) {
    case "intent":
      return spec.intent?.trim() ? truncate(spec.intent) : null;
    case "target":
      return getModelProfile(spec.metadata.targetModel)?.displayName ?? (spec.metadata.targetModel || null);
    case "objective":
      return spec.objective?.trim() ? truncate(spec.objective) : null;
    case "context": {
      const parts: string[] = [];
      if (spec.context?.length) parts.push(count(spec.context.length, "elemento", "elementos"));
      if (spec.inputs?.length) parts.push(count(spec.inputs.length, "entrada", "entradas"));
      return parts.length ? parts.join(" · ") : null;
    }
    case "requirements":
      return spec.requirements?.length ? count(spec.requirements.length, "requisito", "requisitos") : null;
    case "constraints": {
      const parts: string[] = [];
      if (spec.constraints?.length) parts.push(count(spec.constraints.length, "restricción", "restricciones"));
      if (spec.priorities?.length) parts.push(count(spec.priorities.length, "prioridad", "prioridades"));
      if (spec.decisionRules?.length) parts.push(count(spec.decisionRules.length, "regla", "reglas"));
      if (spec.workflow?.length) parts.push(count(spec.workflow.length, "paso", "pasos"));
      return parts.length ? parts.join(" · ") : null;
    }
    case "output":
      return spec.outputFormat ? OUTPUT_KIND_LABELS[spec.outputFormat.kind]?.label ?? spec.outputFormat.kind : null;
    case "examples":
      return spec.examples?.length ? count(spec.examples.length, "ejemplo", "ejemplos") : null;
    case "mission":
      return agent?.mission?.trim() ? truncate(agent.mission) : null;
    case "tools":
      return spec.tools?.length ? count(spec.tools.length, "herramienta", "herramientas") : null;
    case "state": {
      const on = agent?.state ? Object.values(agent.state).filter(Boolean).length : 0;
      return on ? `${on}/6 campos` : null;
    }
    case "loop": {
      const on = agent?.loop ? Object.values(agent.loop).filter(Boolean).length : 0;
      return on ? `${on}/6 fases` : null;
    }
    case "budget": {
      const parts: string[] = [];
      if (agent?.budget?.maxIterations !== undefined) parts.push(count(agent.budget.maxIterations, "iteración", "iteraciones"));
      if (agent?.errorRecovery?.enabled) parts.push("recuperación activa");
      return parts.length ? parts.join(" · ") : null;
    }
    case "safety": {
      const parts: string[] = [];
      if (agent?.humanApproval?.length) parts.push(agent.humanApproval.map((c) => APPROVAL_LABELS[c] ?? c).join(", ").toLowerCase());
      if (agent?.stopConditions?.length) parts.push(count(agent.stopConditions.length, "condición de parada", "condiciones de parada"));
      return parts.length ? truncate(parts.join(" · ")) : null;
    }
  }
}
