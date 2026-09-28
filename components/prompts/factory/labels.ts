import type {
  AgentConfig,
  ContextKind,
  HumanApprovalCategory,
  OutputKind,
  PromptLanguage,
  PromptMode,
  ToolKind,
} from "@/prompt-factory";

/** Spanish UI labels for the engine's enums. Display only: no rules live here. */

export const MODE_LABELS: Record<PromptMode, string> = {
  standard: "Estándar",
  agent: "Agente",
};

export const LANGUAGE_LABELS: Record<PromptLanguage, string> = {
  es: "ES",
  en: "EN",
};

export const CONTEXT_KIND_LABELS: Record<ContextKind, string> = {
  background: "Antecedentes",
  source: "Información fuente",
  "user-profile": "Perfil del usuario",
  project: "Proyecto",
  assumption: "Supuestos",
};
export const CONTEXT_KINDS = Object.keys(CONTEXT_KIND_LABELS) as ContextKind[];

export const OUTPUT_KIND_LABELS: Record<OutputKind, { label: string; hint: string }> = {
  "free-text": { label: "Texto libre", hint: "Prosa sin estructura fija" },
  markdown: { label: "Markdown", hint: "Encabezados, listas y énfasis" },
  json: { label: "JSON", hint: "Objeto legible por máquinas" },
  xml: { label: "XML", hint: "Etiquetas anidadas" },
  table: { label: "Tabla", hint: "Filas y columnas" },
  report: { label: "Informe", hint: "Documento con secciones" },
  code: { label: "Código", hint: "Código fuente" },
  custom: { label: "Personalizado", hint: "Tu propia estructura" },
};
export const OUTPUT_KINDS = Object.keys(OUTPUT_KIND_LABELS) as OutputKind[];

export const TOOL_KIND_LABELS: Record<ToolKind, string> = {
  web: "Web",
  browser: "Navegador",
  files: "Archivos",
  email: "Email",
  database: "Base de datos",
  code: "Ejecución de código",
  api: "APIs",
  custom: "Herramienta personalizada",
};
export const TOOL_KINDS = Object.keys(TOOL_KIND_LABELS) as ToolKind[];
export const BUILTIN_TOOL_KINDS = TOOL_KINDS.filter((k) => k !== "custom");

export const APPROVAL_LABELS: Record<HumanApprovalCategory, string> = {
  "send-messages": "Enviar mensajes",
  "spend-money": "Gastar dinero",
  "delete-data": "Borrar datos",
  "publish-content": "Publicar contenido",
  "modify-external-systems": "Modificar sistemas externos",
};
export const APPROVAL_CATEGORIES = Object.keys(APPROVAL_LABELS) as HumanApprovalCategory[];

export type AgentState = NonNullable<AgentConfig["state"]>;
export type AgentLoop = NonNullable<AgentConfig["loop"]>;
export type AgentMemory = NonNullable<AgentConfig["memory"]>;

export const STATE_FIELDS: { key: keyof AgentState; label: string; hint: string }[] = [
  { key: "trackKnown", label: "Conocido", hint: "Lo que ya se sabe" },
  { key: "trackUnknown", label: "Desconocido", hint: "Lo que falta averiguar" },
  { key: "trackCompleted", label: "Completado", hint: "Pasos terminados" },
  { key: "trackPending", label: "Pendiente", hint: "Lo que queda por hacer" },
  { key: "trackBlockers", label: "Bloqueos", hint: "Lo que impide avanzar" },
  { key: "trackArtifacts", label: "Artefactos", hint: "Archivos y resultados producidos" },
];

export const LOOP_FIELDS: { key: keyof AgentLoop; label: string }[] = [
  { key: "observe", label: "Observar" },
  { key: "assess", label: "Evaluar" },
  { key: "plan", label: "Planificar" },
  { key: "act", label: "Actuar" },
  { key: "verify", label: "Verificar" },
  { key: "updateState", label: "Actualizar estado" },
];

export const MEMORY_FIELDS: { key: keyof AgentMemory; label: string; hint: string }[] = [
  { key: "workingMemory", label: "De trabajo", hint: "Contexto de la tarea en curso" },
  { key: "episodicMemory", label: "Episódica", hint: "Lo ocurrido en intentos anteriores" },
  { key: "semanticMemory", label: "Semántica", hint: "Hechos y conocimiento reutilizable" },
  { key: "artifactMemory", label: "De artefactos", hint: "Archivos y resultados generados" },
];

/** All-off shapes, used only when the spec has no value yet for a required-boolean group. */
export const STATE_OFF: AgentState = {
  trackKnown: false,
  trackUnknown: false,
  trackCompleted: false,
  trackPending: false,
  trackBlockers: false,
  trackArtifacts: false,
};

export const LOOP_OFF: AgentLoop = {
  observe: false,
  assess: false,
  plan: false,
  act: false,
  verify: false,
  updateState: false,
};

export const SEVERITY_LABELS = {
  error: "Error",
  warning: "Aviso",
  info: "Nota",
} as const;
