import { defaultAgentConfig } from "../domain/defaults.ts";
import { foldKey, isBlank } from "../domain/text.ts";
import type { AgentConfig, Preset, PromptSpec } from "../domain/types.ts";

/**
 * Presets are partial specs (never hard-coded prompts). `applyPresetToSpec`
 * merges them WITHOUT overwriting what the user already entered:
 * - text fields keep the user's value when it is not blank;
 * - string lists are a de-duplicated union (user items first);
 * - object lists (context, examples, tools…) are a union by key;
 * - outputFormat and each AgentConfig group are kept whole if the user has them.
 */

function agentPreset(overrides: Partial<AgentConfig>): AgentConfig {
  return { ...defaultAgentConfig(), ...overrides };
}

export const presetList: Preset[] = [
  {
    id: "research",
    label: "Investigación",
    description: "Investigación con fuentes, contraste de evidencia y conclusiones trazables.",
    spec: {
      role: "Investigador riguroso que contrasta fuentes y distingue hechos de interpretaciones",
      requirements: ["Resume los hallazgos principales", "Cita la fuente de cada dato relevante", "Señala las áreas de incertidumbre o evidencia contradictoria"],
      constraints: ["No inventes datos ni fuentes", "Distingue claramente hechos, estimaciones y opiniones"],
      workflow: ["Define las preguntas clave de la investigación", "Reúne y evalúa las fuentes", "Contrasta la información entre fuentes", "Sintetiza los hallazgos y las conclusiones"],
      qualityCriteria: ["Cada afirmación importante está respaldada por una fuente", "Las conclusiones se derivan de la evidencia presentada"],
      outputFormat: { kind: "report", description: "Informe con resumen ejecutivo, hallazgos, evidencia y conclusiones" },
    },
  },
  {
    id: "coding",
    label: "Programación",
    description: "Código claro, probado y mantenible, con explicación breve.",
    spec: {
      role: "Ingeniero de software sénior que escribe código claro, probado y mantenible",
      requirements: ["Explica brevemente el enfoque antes del código", "Incluye manejo de errores y casos límite", "Incluye pruebas o ejemplos de uso"],
      constraints: ["No agregues dependencias innecesarias", "No omitas partes del código con comentarios como «resto del código aquí»"],
      workflow: ["Aclara los requisitos y supuestos", "Diseña la solución", "Implementa el código", "Revisa casos límite y errores", "Agrega pruebas o ejemplos"],
      qualityCriteria: ["El código se ejecuta sin errores", "Los nombres de variables y funciones son descriptivos"],
      outputFormat: { kind: "code", description: "Explicación breve seguida del código completo en bloques con el lenguaje indicado" },
    },
  },
  {
    id: "academic",
    label: "Académico",
    description: "Redacción académica formal con referencias verificables.",
    spec: {
      role: "Investigador académico con experiencia en redacción científica y revisión por pares",
      requirements: ["Usa un tono formal y preciso", "Cita las fuentes en un formato académico consistente (por ejemplo, APA)", "Distingue la evidencia empírica de la interpretación"],
      constraints: ["No inventes referencias bibliográficas", "No presentes especulaciones como hechos establecidos"],
      qualityCriteria: ["La argumentación es lógica y está respaldada por evidencia", "Las referencias son verificables"],
      outputFormat: { kind: "report", description: "Documento con introducción, desarrollo, discusión, conclusiones y referencias" },
    },
  },
  {
    id: "business",
    label: "Negocios",
    description: "Análisis orientado a decisiones con recomendaciones accionables.",
    spec: {
      role: "Consultor de negocios sénior orientado a decisiones",
      requirements: ["Empieza con un resumen ejecutivo", "Cuantifica el impacto cuando sea posible", "Termina con recomendaciones accionables y próximos pasos"],
      constraints: ["Evita la jerga innecesaria", "Declara explícitamente los supuestos"],
      priorities: ["Exactitud", "Claridad", "Brevedad"],
      qualityCriteria: ["Cada recomendación tiene una justificación clara", "Los riesgos y trade-offs están identificados"],
      outputFormat: { kind: "report", description: "Resumen ejecutivo, análisis, opciones, recomendación y próximos pasos" },
    },
  },
  {
    id: "data-analysis",
    label: "Análisis de datos",
    description: "Métricas reproducibles, cálculos verificados e interpretación clara.",
    spec: {
      role: "Analista de datos que combina rigor estadístico con comunicación clara",
      requirements: ["Describe los datos y su calidad antes de analizarlos", "Muestra el método usado para cada métrica", "Explica los hallazgos en lenguaje claro"],
      constraints: ["No inventes datos ni completes valores faltantes sin indicarlo", "No confundas correlación con causalidad"],
      workflow: ["Revisa la estructura y la calidad de los datos", "Limpia y prepara los datos", "Calcula las métricas", "Interpreta los resultados y sus limitaciones"],
      qualityCriteria: ["Verifica cada cálculo antes de presentarlo", "Los resultados son reproducibles con el método descrito"],
      outputFormat: { kind: "table", description: "Tabla con las métricas clave seguida de la interpretación" },
    },
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Mensajes para un público definido, con acciones y métricas.",
    spec: {
      role: "Estratega de marketing digital enfocado en resultados medibles",
      requirements: ["Define el público objetivo y su principal necesidad", "Propón mensajes clave y llamadas a la acción", "Sugiere métricas para medir el resultado"],
      constraints: ["No hagas afirmaciones que no se puedan comprobar", "Mantén el tono de la marca"],
      qualityCriteria: ["El mensaje es claro para el público objetivo", "Cada acción propuesta tiene una métrica asociada"],
      outputFormat: { kind: "markdown", description: "Secciones: público, mensajes, canales, acciones y métricas" },
    },
  },
  {
    id: "content-creation",
    label: "Creación de contenido",
    description: "Textos originales adaptados al público y al canal.",
    spec: {
      role: "Creador de contenido y editor con dominio del estilo y la estructura",
      requirements: ["Adapta el tono al público y al canal", "Usa una estructura clara con título, desarrollo y cierre", "Incluye una llamada a la acción cuando aplique"],
      constraints: ["No copies textos de terceros", "Evita el relleno y las frases genéricas"],
      qualityCriteria: ["El texto es original y fácil de leer", "El título comunica el valor del contenido"],
      outputFormat: { kind: "markdown" },
    },
  },
  {
    id: "education",
    label: "Educación",
    description: "Explicaciones graduales con ejemplos y preguntas de comprobación.",
    spec: {
      role: "Profesor experto que explica con claridad y comprueba la comprensión",
      requirements: ["Explica de lo simple a lo complejo", "Incluye un ejemplo concreto por cada concepto", "Termina con preguntas para comprobar la comprensión"],
      constraints: ["Evita la jerga sin explicarla", "No des por hecho conocimientos previos que no se mencionaron"],
      qualityCriteria: ["Un principiante puede seguir la explicación", "Los ejemplos ilustran el concepto correctamente"],
      outputFormat: { kind: "markdown", description: "Explicación por secciones, ejemplos y preguntas de repaso" },
    },
  },
  {
    id: "agent",
    label: "Agente",
    description: "Agente autónomo con loop, verificación, recuperación de errores y parada explícita.",
    spec: {
      metadata: { mode: "agent" },
      role: "Agente autónomo metódico que verifica cada resultado antes de avanzar",
      requirements: ["Mantén un registro del estado en cada iteración", "Verifica el resultado de cada acción antes de continuar"],
      constraints: ["No simules resultados de herramientas", "No realices acciones irreversibles sin aprobación"],
      qualityCriteria: ["Cada conclusión está respaldada por evidencia obtenida durante la tarea"],
      outputFormat: { kind: "report", description: "Resumen del resultado, evidencia, acciones realizadas y pendientes" },
      agent: agentPreset({
        stopConditions: ["Detente cuando todos los criterios de éxito estén verificados"],
        finalVerification: ["Revisa que cada requisito tenga evidencia que lo respalde"],
      }),
    },
  },
  {
    id: "automation",
    label: "Automatización",
    description: "Procesos paso a paso con validación, registro y aprobación humana.",
    spec: {
      metadata: { mode: "agent" },
      role: "Agente de automatización confiable que ejecuta procesos paso a paso",
      requirements: ["Confirma las entradas antes de ejecutar cada paso", "Registra cada acción ejecutada y su resultado"],
      constraints: ["No ejecutes acciones irreversibles sin aprobación humana", "No continúes si un paso crítico falla"],
      workflow: ["Valida las entradas", "Ejecuta los pasos en orden", "Verifica el resultado de cada paso", "Reporta el resultado final"],
      outputFormat: { kind: "markdown", description: "Registro de pasos ejecutados, resultado de cada uno y estado final" },
      agent: agentPreset({
        budget: { maxIterations: 30, maxToolCalls: 100 },
        stopConditions: [
          "Detente cuando todos los pasos del proceso estén completados y verificados",
          "Detente si un paso crítico sigue fallando después de replanificar",
        ],
      }),
    },
  },
];

// ───────────────────────── Merge ─────────────────────────

function unionStrings(user: string[] | undefined, preset: string[] | undefined): string[] | undefined {
  if (!preset?.length) return user;
  const out = [...(user ?? [])];
  const seen = new Set(out.map(foldKey));
  for (const item of preset) {
    const key = foldKey(item);
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

function unionBy<T>(user: T[] | undefined, preset: T[] | undefined, key: (item: T) => string): T[] | undefined {
  if (!preset?.length) return user;
  const out = [...(user ?? [])];
  const seen = new Set(out.map(key));
  for (const item of preset) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(jsonClone(item));
    }
  }
  return out;
}

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const text = (user: string | undefined, preset: string | undefined) => (isBlank(user) ? preset ?? user : user);

function mergeAgent(user: AgentConfig | undefined, preset: AgentConfig | undefined): AgentConfig | undefined {
  if (!preset) return user;
  if (!user) return jsonClone(preset);
  return {
    ...jsonClone(preset),
    ...Object.fromEntries(Object.entries(user).filter(([, v]) => v !== undefined)),
    mission: text(user.mission, preset.mission),
    successCriteria: unionStrings(user.successCriteria, preset.successCriteria),
    humanApproval: user.humanApproval ?? preset.humanApproval,
    humanApprovalRules: unionStrings(user.humanApprovalRules, preset.humanApprovalRules),
    escalationRules: unionStrings(user.escalationRules, preset.escalationRules),
    stopConditions: unionStrings(user.stopConditions, preset.stopConditions),
    finalVerification: unionStrings(user.finalVerification, preset.finalVerification),
  };
}

export function findPreset(presetId: string): Preset | undefined {
  return presetList.find((p) => p.id === presetId);
}

export function applyPresetToSpec(spec: PromptSpec, presetId: string): PromptSpec {
  const preset = findPreset(presetId);
  if (!preset) return spec;
  const p = preset.spec;
  const mode = p.metadata?.mode === "agent" ? "agent" : spec.metadata.mode;

  const merged: PromptSpec = {
    ...spec,
    metadata: { ...spec.metadata, mode, presetId: preset.id },
    role: text(spec.role, p.role),
    objective: text(spec.objective, p.objective) ?? "",
    task: text(spec.task, p.task),
    context: unionBy(spec.context, p.context, (c) => `${c.kind}|${foldKey(c.text)}`),
    inputs: unionBy(spec.inputs, p.inputs, (i) => foldKey(i.name)),
    requirements: unionStrings(spec.requirements, p.requirements),
    constraints: unionStrings(spec.constraints, p.constraints),
    priorities: unionStrings(spec.priorities, p.priorities),
    workflow: unionStrings(spec.workflow, p.workflow),
    decisionRules: unionBy(spec.decisionRules, p.decisionRules, (r) => `${foldKey(r.when)}|${foldKey(r.then)}`),
    examples: unionBy(spec.examples, p.examples, (e) => `${foldKey(e.input)}|${foldKey(e.output)}`),
    tools: unionBy(spec.tools, p.tools, (t) => (t.kind === "custom" ? `custom|${foldKey(t.name)}` : t.kind)),
    outputFormat: spec.outputFormat ?? (p.outputFormat ? { ...p.outputFormat } : undefined),
    qualityCriteria: unionStrings(spec.qualityCriteria, p.qualityCriteria),
    definitionOfDone: unionStrings(spec.definitionOfDone, p.definitionOfDone),
    agent: mode === "agent" ? mergeAgent(spec.agent ?? (p.agent ? undefined : defaultAgentConfig()), p.agent) : spec.agent,
  };
  // Keep the object free of keys that were absent on both sides.
  const record = merged as unknown as Record<string, unknown>;
  for (const key of Object.keys(record)) if (record[key] === undefined) delete record[key];
  return merged;
}
