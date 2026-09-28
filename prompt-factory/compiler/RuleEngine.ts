import { conflictIssue, OBJECTIVE_MISSING } from "../domain/validators.ts";
import { findConflicts, isBlank, matchesAny, plural } from "../domain/text.ts";
import type { Conflict } from "../domain/text.ts";
import type { PromptSpec, TransformationExplanation, ValidationIssue } from "../domain/types.ts";
import type { SectionId } from "../i18n/strings.ts";
import { normalizeSpec } from "./Normalizer.ts";
import type { NormalizedSpec } from "./Normalizer.ts";

/**
 * Rule Engine: a declarative list of rules. Each rule decides WHEN it applies
 * and returns EFFECTS as data (flags, issues, explanations, blocks). Adapters
 * only read flags — they never re-derive these decisions with if/else soup.
 *
 * Extending: push a new Rule into `defaultRules` (or pass a custom list to
 * `evaluateRules`) and, if it introduces a new flag, make the adapters read it.
 */

export type RuleFlag =
  /** Emit the Examples section. */
  | "include-examples"
  /** Emit agent sections: mission, state, tool policy, loop, verification, recovery, budget, stop conditions. */
  | "agent-protocol"
  /** Emit the Definition of Done section. */
  | "definition-of-done"
  /** The output format must be followed exactly: move it next to the task and emphasize it. */
  | "prioritize-output-format"
  /** Emit the Tools section. */
  | "include-tools"
  /** Requirements are rendered as a numbered list. */
  | "numbered-requirements"
  /** Decision rules include the user's priority order. */
  | "priority-order"
  /** There is context/reference material the task must be grounded on. */
  | "grounded-task";

export type RuleEffect =
  | { type: "flag"; flag: RuleFlag }
  | { type: "issue"; issue: ValidationIssue }
  | { type: "block"; issue: ValidationIssue }
  | { type: "explain"; section?: SectionId; reason: string };

export interface RuleContext {
  /** Precomputed conflicts between requirements and constraints. */
  conflicts: Conflict[];
}

export interface Rule {
  id: string;
  description: string;
  when(spec: NormalizedSpec, ctx: RuleContext): boolean;
  apply(spec: NormalizedSpec, ctx: RuleContext): RuleEffect[];
}

export interface RuleEvaluation {
  flags: ReadonlySet<RuleFlag>;
  issues: ValidationIssue[];
  /** Generic (adapter-independent) explanations, tagged with the rule id. */
  explanations: TransformationExplanation[];
  blocked: boolean;
  /** Ids of the rules that fired, in order. */
  fired: string[];
}

const flag = (f: RuleFlag): RuleEffect => ({ type: "flag", flag: f });
const explain = (section: SectionId | undefined, reason: string): RuleEffect => ({ type: "explain", section, reason });

/** Mentions of actions that need something outside the model (search, send, run…). */
const EXTERNAL_ACTION_PATTERNS: readonly RegExp[] = [
  /\b(internet|en linea|online|sitio web|pagina web|navegador|navegar|google)\b/,
  /\b(busca|buscar|busque|consulta|consultar)\b.*\b(web|noticias|precios?|cotizacion)\b/,
  /\b(envia|enviar|envie|manda|mandar|mande)\b.*\b(correo|email|mensaje|mail)\b/,
  /\b(publica|publicar|publique|postea|postear)\b/,
  /\b(descarga|descargar|descargue|sube|subir|suba)\b.*\b(archivo|archivos|documento|documentos)\b/,
  /\b(base de datos|sql)\b/,
  /\b(ejecuta|ejecutar|ejecute|corre|correr|corra)\b.*\b(codigo|script|python)\b/,
  /\b(api|endpoint|webhook)\b/,
  /\b(tiempo real|precio actual|cotizacion actual|noticias recientes|ultimas noticias|datos actualizados|informacion actualizada)\b/,
  /\b(search the web|browse|web search|send (an )?emails?|publish|download|upload|run (the )?code|query the database|call the api|real[- ]time|latest news|current price|up-to-date)\b/,
];

export function mentionsExternalActions(spec: NormalizedSpec): boolean {
  const text = [spec.objective, spec.task ?? "", ...spec.requirements, ...spec.workflow].join("\n");
  return matchesAny(text, EXTERNAL_ACTION_PATTERNS);
}

export const defaultRules: Rule[] = [
  {
    id: "objective-required",
    description: "Sin objetivo no hay nada que compilar: bloquea la compilación.",
    when: (spec) => isBlank(spec.objective),
    apply: () => [{ type: "block", issue: OBJECTIVE_MISSING }],
  },
  {
    id: "examples-section",
    description: "Si hay ejemplos, se incluye la sección Ejemplos.",
    when: (spec) => spec.examples.length > 0,
    apply: (spec) => [
      flag("include-examples"),
      explain("examples", `La sección Ejemplos aparece porque proporcionaste ${plural(spec.examples.length, "ejemplo", "ejemplos")}.`),
    ],
  },
  {
    id: "agent-protocol",
    description: "En modo agente se activan AgentConfig, el protocolo del loop y la Definition of Done.",
    when: (spec) => spec.metadata.mode === "agent",
    apply: () => [
      flag("agent-protocol"),
      flag("definition-of-done"),
      explain("loop-protocol", "El protocolo del loop, el estado, el presupuesto y las condiciones de parada aparecen porque el modo agente está activo."),
      explain("definition-of-done", "La Definition of Done aparece porque el modo agente está activo."),
    ],
  },
  {
    id: "user-definition-of-done",
    description: "En modo estándar, la Definition of Done aparece solo si el usuario la definió.",
    when: (spec) => spec.metadata.mode !== "agent" && spec.definitionOfDone.length > 0,
    apply: () => [flag("definition-of-done"), explain("definition-of-done", "La Definition of Done aparece porque definiste criterios de terminado.")],
  },
  {
    id: "exact-output-structure",
    description: "Si se exige una estructura exacta, el formato de salida se prioriza (junto a la tarea) y se enfatiza.",
    when: (spec) => spec.outputFormat?.exactStructure === true,
    apply: () => [
      flag("prioritize-output-format"),
      explain("output-format", "El formato de salida se reforzó y se acercó a la tarea porque pediste respetar la estructura exacta."),
    ],
  },
  {
    id: "tools-section",
    description: "Si hay herramientas definidas, se incluye la sección Herramientas.",
    when: (spec) => spec.tools.length > 0,
    apply: (spec) => [
      flag("include-tools"),
      explain("tools", `La sección Herramientas aparece porque definiste ${plural(spec.tools.length, "herramienta", "herramientas")}.`),
    ],
  },
  {
    id: "external-actions-without-tools",
    description: "Si el objetivo menciona acciones externas pero no hay herramientas, se sugiere definirlas.",
    when: (spec) => spec.tools.length === 0 && mentionsExternalActions(spec),
    apply: () => [
      {
        type: "issue",
        issue: {
          code: "tools.suggested",
          severity: "warning",
          field: "tools",
          message:
            "Tu objetivo menciona acciones externas (buscar en internet, enviar correos, ejecutar código…), pero no definiste herramientas. Sin ellas, el modelo no podrá hacerlo y podría inventar resultados.",
        },
      },
    ],
  },
  {
    id: "numbered-requirements",
    description: "Con más de 5 requisitos, se presentan como lista numerada.",
    when: (spec) => spec.requirements.length > 5,
    apply: (spec) => [
      flag("numbered-requirements"),
      explain("requirements", `Los requisitos se presentan como lista numerada porque hay más de 5 (${spec.requirements.length}).`),
    ],
  },
  {
    id: "priority-order",
    description: "Si hay prioridades, las reglas de decisión incluyen el orden de prioridad.",
    when: (spec) => spec.priorities.length > 0,
    apply: () => [flag("priority-order"), explain("decision-rules", "Las reglas de decisión incluyen tu orden de prioridades para resolver conflictos.")],
  },
  {
    id: "requirement-constraint-conflicts",
    description: "Las restricciones que contradicen requisitos generan una advertencia.",
    when: (_spec, ctx) => ctx.conflicts.length > 0,
    apply: (_spec, ctx) => ctx.conflicts.map((c) => ({ type: "issue" as const, issue: conflictIssue(c) })),
  },
  {
    id: "grounded-task",
    description: "Si hay contexto o datos de entrada, la tarea puede pedir basarse en ellos.",
    when: (spec) => spec.context.length > 0 || spec.inputs.length > 0,
    apply: () => [flag("grounded-task")],
  },
];

export function evaluateRules(spec: PromptSpec, rules: readonly Rule[] = defaultRules): RuleEvaluation {
  const normalized = normalizeSpec(spec);
  const ctx: RuleContext = { conflicts: findConflicts(normalized.requirements, normalized.constraints) };
  const flags = new Set<RuleFlag>();
  const issues: ValidationIssue[] = [];
  const explanations: TransformationExplanation[] = [];
  const fired: string[] = [];
  let blocked = false;

  for (const rule of rules) {
    if (!rule.when(normalized, ctx)) continue;
    fired.push(rule.id);
    rule.apply(normalized, ctx).forEach((effect, index) => {
      switch (effect.type) {
        case "flag":
          flags.add(effect.flag);
          break;
        case "issue":
          issues.push(effect.issue);
          break;
        case "block":
          blocked = true;
          issues.push(effect.issue);
          break;
        case "explain":
          explanations.push({ id: `${rule.id}:${index}`, section: effect.section, reason: effect.reason, ruleId: rule.id });
          break;
      }
    });
  }
  return { flags, issues, explanations, blocked, fired };
}
