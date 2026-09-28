import { examplesAreRelevant } from "../compiler/QualityEngine.ts";
import { normalizeSpec } from "../compiler/Normalizer.ts";
import type { NormalizedSpec } from "../compiler/Normalizer.ts";
import { matchesAny } from "../domain/text.ts";
import { hasErrors, validateStructure } from "../domain/validators.ts";
import type { PromptSpec, SmartQuestion } from "../domain/types.ts";

/**
 * Declarative follow-up questions. Each rule states WHEN it applies and the
 * question it asks; the engine returns the most important ones first.
 * Suggestions use the same Spanish labels as the UI so they can be applied
 * with one click (output kinds, tool kinds, approval categories).
 */

export interface QuestionRule {
  id: string;
  /** Lower = more important. */
  priority: number;
  when(spec: NormalizedSpec): boolean;
  ask(spec: NormalizedSpec): Omit<SmartQuestion, "id">;
}

export const MAX_QUESTIONS = 5;

const QUANTITATIVE: readonly RegExp[] = [
  /\b(calcul\w*|metrica\w*|porcentaje\w*|financier\w*|datos|estadistic\w*|numero\w*|numeric\w*|cifra\w*|presupuesto\w*|rentabilidad|valuacion|valoracion|proyeccion\w*|tasa\w*|promedio\w*|ratio\w*|multiplo\w*|calculat\w*|metric\w*|percent\w*|financial\w*|statistic\w*|numbers?|forecast\w*|revenue|margin\w*)\b/,
];
const VERIFICATION: readonly RegExp[] = [/\b(verific\w*|comprueb\w*|comprob\w*|revis\w*|valid\w*|check\w*|verify\w*|double-check)\b/];

/** Tool kinds whose actions have side effects outside the conversation. */
const SIDE_EFFECT_TOOLS = new Set(["browser", "files", "email", "database", "code", "api", "custom"]);

const ROLE_HINTS: { patterns: RegExp[]; roles: string[] }[] = [
  {
    patterns: [/\b(financ\w*|invers\w*|invertir|accion(es)?|valuacion|bolsa|portafolio|contab\w*|invest\w*|stocks?)\b/],
    roles: ["Analista financiero sénior", "Asesor de inversiones con enfoque fundamental"],
  },
  {
    patterns: [/\b(codigo|programa\w*|software|bug\w*|refactor\w*|typescript|python|javascript|code|coding)\b/],
    roles: ["Ingeniero de software sénior", "Revisor de código"],
  },
  {
    patterns: [/\b(marketing|campana\w*|anuncio\w*|seo|marca|redes sociales|copy\w*)\b/],
    roles: ["Estratega de marketing digital", "Copywriter"],
  },
  {
    patterns: [/\b(ensen\w*|clase\w*|alumno\w*|estudiante\w*|curso\w*|aprend\w*|teach\w*)\b/],
    roles: ["Profesor experto", "Diseñador instruccional"],
  },
  {
    patterns: [/\b(tesis|paper\w*|articulo\w* cientific\w*|academ\w*|cientific\w*|literatura)\b/],
    roles: ["Investigador académico", "Revisor científico"],
  },
  {
    patterns: [/\b(dataset\w*|estadistic\w*|metrica\w*|sql|dashboard\w*|datos)\b/],
    roles: ["Científico de datos", "Analista de datos"],
  },
  { patterns: [/\b(legal\w*|contrato\w*|juridic\w*|clausula\w*)\b/], roles: ["Abogado corporativo"] },
];

function roleSuggestions(spec: NormalizedSpec): string[] {
  const text = [spec.objective, spec.task ?? "", spec.intent ?? ""].join("\n");
  const roles = ROLE_HINTS.filter((h) => matchesAny(text, h.patterns)).flatMap((h) => h.roles);
  return roles.length ? roles.slice(0, 3) : ["Experto en la materia", "Analista", "Consultor"];
}

const isAgent = (spec: NormalizedSpec) => spec.metadata.mode === "agent" && spec.agent !== undefined;

export const questionRules: QuestionRule[] = [
  {
    id: "objective",
    priority: 10,
    when: (spec) => !spec.objective,
    ask: () => ({ question: "¿Qué quieres lograr exactamente? Descríbelo en una o dos frases.", field: "objective" }),
  },
  {
    id: "output-format",
    priority: 20,
    when: (spec) => Boolean(spec.objective) && !spec.outputFormat,
    ask: () => ({
      question: "¿Cómo quieres recibir el resultado?",
      field: "outputFormat",
      suggestions: ["Informe", "Tabla", "JSON", "Markdown", "Texto libre"],
    }),
  },
  {
    id: "agent-tools",
    priority: 25,
    when: (spec) => isAgent(spec) && spec.tools.length === 0,
    ask: () => ({
      question: "¿El agente necesita interactuar con herramientas externas?",
      field: "tools",
      suggestions: ["Web", "Navegador", "Archivos", "Ejecución de código", "APIs"],
    }),
  },
  {
    id: "agent-stop-conditions",
    priority: 30,
    when: (spec) => isAgent(spec) && (spec.agent?.stopConditions.length ?? 0) === 0,
    ask: () => ({
      question: "¿Cuándo debe detenerse el agente?",
      field: "agent.stopConditions",
      suggestions: [
        "Cuando todos los requisitos estén verificados",
        "Cuando no haya avances en dos iteraciones seguidas",
        "Cuando necesite una autorización que no tiene",
      ],
    }),
  },
  {
    id: "verify-calculations",
    priority: 35,
    when: (spec) => {
      const text = [spec.objective, spec.task ?? "", ...spec.requirements, ...spec.context.map((c) => c.text)].join("\n");
      const checks = [...spec.qualityCriteria, ...spec.requirements, ...spec.constraints].join("\n");
      return Boolean(spec.objective) && matchesAny(text, QUANTITATIVE) && !matchesAny(checks, VERIFICATION);
    },
    ask: () => ({
      question: "¿Quieres que el modelo verifique sus cálculos?",
      field: "qualityCriteria",
      suggestions: ["Verifica cada cálculo antes de presentarlo", "Muestra las fórmulas y los datos usados en cada cálculo"],
    }),
  },
  {
    id: "constraints",
    priority: 40,
    when: (spec) => Boolean(spec.objective) && spec.constraints.length === 0,
    ask: () => ({
      question: "¿Hay algo que el modelo deba evitar o respetar?",
      field: "constraints",
      suggestions: ["No inventes datos", "Cita tus fuentes", "Usa un lenguaje claro y sin jerga", "Máximo 500 palabras"],
    }),
  },
  {
    id: "examples",
    priority: 45,
    when: (spec) => Boolean(spec.objective) && spec.examples.length === 0 && examplesAreRelevant(spec),
    ask: () => ({ question: "¿Puedes dar un ejemplo de entrada y del resultado que esperas?", field: "examples" }),
  },
  {
    id: "role",
    priority: 50,
    when: (spec) => Boolean(spec.objective) && !spec.role,
    ask: (spec) => ({ question: "¿Qué rol o experiencia debe asumir el modelo?", field: "role", suggestions: roleSuggestions(spec) }),
  },
  {
    id: "agent-human-approval",
    priority: 55,
    when: (spec) => isAgent(spec) && (spec.agent?.humanApproval.length ?? 0) === 0 && spec.tools.some((t) => SIDE_EFFECT_TOOLS.has(t.kind)),
    ask: () => ({
      question: "¿Qué acciones del agente deben requerir tu aprobación?",
      field: "agent.humanApproval",
      suggestions: ["Enviar mensajes", "Gastar dinero", "Borrar datos", "Publicar contenido", "Modificar sistemas externos"],
    }),
  },
  {
    id: "agent-success-criteria",
    priority: 58,
    when: (spec) => isAgent(spec) && (spec.agent?.successCriteria.length ?? 0) === 0,
    ask: () => ({ question: "¿Cómo sabrá el agente que terminó bien? Define uno o más criterios de éxito verificables.", field: "agent.successCriteria" }),
  },
  {
    id: "context",
    priority: 60,
    when: (spec) => Boolean(spec.objective) && spec.context.length === 0 && spec.inputs.length === 0,
    ask: () => ({ question: "¿Qué contexto debe conocer el modelo (para quién es, con qué datos, en qué situación)?", field: "context" }),
  },
];

export function getSmartQuestions(spec: PromptSpec, rules: readonly QuestionRule[] = questionRules, max = MAX_QUESTIONS): SmartQuestion[] {
  if (hasErrors(validateStructure(spec))) return [];
  const normalized = normalizeSpec(spec);
  return [...rules]
    .sort((a, b) => a.priority - b.priority)
    .filter((rule) => rule.when(normalized))
    .slice(0, max)
    .map((rule) => ({ id: rule.id, ...rule.ask(normalized) }));
}
