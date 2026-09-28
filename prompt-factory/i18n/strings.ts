import type { ContextKind, HumanApprovalCategory, OutputKind, PromptLanguage, ToolKind } from "../domain/types.ts";

/**
 * Localized boilerplate of the COMPILED PROMPT (headings, protocol text).
 * One dictionary per language; XML tag names and protocol tokens
 * (SUCCESS, REPLAN, KNOWN…) stay English identifiers in every language.
 *
 * User-facing UI strings (validation, explanations, questions) are always
 * es-MX and live next to the code that produces them.
 */

export type SectionId =
  | "role"
  | "objective"
  | "system-instruction"
  | "mission"
  | "success-criteria"
  | "context"
  | "inputs"
  | "reference-material"
  | "instructions"
  | "task"
  | "requirements"
  | "constraints"
  | "rules"
  | "decision-rules"
  | "workflow"
  | "examples"
  | "tools"
  | "tool-policy"
  | "state"
  | "memory-policy"
  | "loop-protocol"
  | "verification"
  | "error-recovery"
  | "budget"
  | "human-approval"
  | "stop-conditions"
  | "output-format"
  | "expected-output"
  | "quality-criteria"
  | "definition-of-done";

/** XML tag of each section (English identifiers, snake_case). */
export const SECTION_TAGS: Record<SectionId, string> = {
  role: "role",
  objective: "objective",
  "system-instruction": "system_instruction",
  mission: "mission",
  "success-criteria": "success_criteria",
  context: "context",
  inputs: "inputs",
  "reference-material": "reference_material",
  instructions: "instructions",
  task: "task",
  requirements: "requirements",
  constraints: "constraints",
  rules: "rules",
  "decision-rules": "decision_rules",
  workflow: "workflow",
  examples: "examples",
  tools: "tools",
  "tool-policy": "tool_policy",
  state: "state",
  "memory-policy": "memory_policy",
  "loop-protocol": "loop_protocol",
  verification: "verification",
  "error-recovery": "error_recovery",
  budget: "budget",
  "human-approval": "human_approval",
  "stop-conditions": "stop_conditions",
  "output-format": "output_format",
  "expected-output": "expected_output",
  "quality-criteria": "quality_criteria",
  "definition-of-done": "definition_of_done",
};

/** XML sub-tags used inside sections. */
export const CONTEXT_TAGS: Record<ContextKind, string> = {
  background: "background",
  source: "source",
  "user-profile": "user_profile",
  project: "project",
  assumption: "assumption",
};

export const INNER_TAGS = ["example", "input", "ideal_output", "schema", "priorities", "escalation"] as const;

export type LoopStepKey = "observe" | "assess" | "plan" | "act" | "observeResult" | "verify" | "updateState" | "decide";
export type StateKey = "trackKnown" | "trackUnknown" | "trackCompleted" | "trackPending" | "trackBlockers" | "trackArtifacts";
export type MemoryKey = "workingMemory" | "episodicMemory" | "semanticMemory" | "artifactMemory";

export interface PromptStrings {
  headings: Record<SectionId, string>;
  contextKinds: Record<ContextKind, string>;
  /** Short description of each tool kind (used when a tool has no purpose). */
  toolKinds: Record<ToolKind, string>;
  /** Sentence describing each output kind ("" = nothing to say). */
  outputKinds: Record<OutputKind, string>;
  /** Long phrase: "enviar mensajes o correos en nombre del usuario". */
  approvals: Record<HumanApprovalCategory, string>;
  /** Short phrase: "enviar mensajes". */
  approvalsShort: Record<HumanApprovalCategory, string>;
  core: {
    rolePrefix: string;
    objectiveLabel: string;
    successMeans: string;
    successPointer: string;
    missionAutonomy: string;
    inputContent: string;
    exampleTitle: (n: number) => string;
    exampleInput: string;
    exampleOutput: string;
    /** Structural markers of the Gemini examples (identical in every example). */
    exampleInputMarker: string;
    exampleOutputMarker: string;
    /** Word that opens a decision-rule condition ("Si", "If"). */
    conditionPrefix: string;
    decisionRule: (when: string, then: string) => string;
    priorityOrder: (items: string[]) => string;
    priorityConflict: string;
    toolsStandardNote: string;
    outputStructure: string;
    exactStructure: string;
    groundedTaskLead: string;
    taskFollowLoop: string;
    taskStopRule: string;
    standardDodIntro: string;
  };
  agent: {
    stateIntro: string;
    stateFields: Record<StateKey, string>;
    loopIntro: string;
    loopSteps: Record<LoopStepKey, { title: string; text: string }>;
    actWithTools: string;
    updateStateTracked: (tokens: string[]) => string;
    decideIntro: string;
    decideOptions: { continue: string; replan: string; retry: string; escalate: string; complete: string };
    iterationNote: (max?: number) => string;
    toolPolicy: string[];
    noToolsPolicy: string;
    memoryIntro: string;
    memory: Record<MemoryKey, { label: string; text: string }>;
    memoryClosing: string;
    verificationIntro: string;
    verificationLevels: { label: string; text: string }[];
    finalVerificationIntro: string;
    recoveryClassify: string;
    recoveryCategoriesIntro: string;
    recoveryCategories: string[];
    recoveryRulesIntro: string;
    recoveryRetry: (n: number) => string;
    recoveryRetryUnbounded: string;
    recoveryNeverRepeat: string;
    recoveryReplan: (n: number) => string;
    recoveryEscalate: (n: number) => string;
    budgetIterations: string;
    budgetToolCalls: string;
    budgetRetries: string;
    budgetMax: (n: number) => string;
    budgetClosing: string;
    approvalIntro: string;
    approvalHow: string;
    escalationIntro: string;
    stopComplete: (hasCriteria: boolean) => string;
    stopMaxIterations: (n: number) => string;
    stopMaxToolCalls: (n: number) => string;
    stopMissingAuthorization: string;
    stopImpossible: string;
    stopApproval: (categories: string[]) => string;
    stopUserIntro: string;
    stopClosing: string;
    dodIntro: string;
    dodRequirements: string;
    dodCriteria: string;
    dodOutput: string;
    dodNoPending: string;
    dodFinalVerification: string;
    dodFallback: string;
    dodAntiIntro: string;
    dodAnti: string[];
  };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const es: PromptStrings = {
  headings: {
    role: "Rol",
    objective: "Objetivo",
    "system-instruction": "Instrucción del sistema",
    mission: "Misión",
    "success-criteria": "Criterios de éxito",
    context: "Contexto",
    inputs: "Datos de entrada",
    "reference-material": "Material de referencia",
    instructions: "Instrucciones",
    task: "Tarea",
    requirements: "Requisitos",
    constraints: "Restricciones",
    rules: "Reglas",
    "decision-rules": "Reglas de decisión",
    workflow: "Flujo de trabajo",
    examples: "Ejemplos",
    tools: "Herramientas",
    "tool-policy": "Política de herramientas",
    state: "Estado",
    "memory-policy": "Política de memoria",
    "loop-protocol": "Protocolo del loop",
    verification: "Verificación",
    "error-recovery": "Recuperación de errores",
    budget: "Presupuesto",
    "human-approval": "Aprobación humana",
    "stop-conditions": "Condiciones de parada",
    "output-format": "Formato de salida",
    "expected-output": "Resultado esperado",
    "quality-criteria": "Criterios de calidad",
    "definition-of-done": "Definition of Done",
  },
  contextKinds: {
    background: "Antecedentes",
    source: "Información fuente",
    "user-profile": "Perfil del usuario",
    project: "Proyecto",
    assumption: "Supuestos",
  },
  toolKinds: {
    web: "búsqueda de información en internet",
    browser: "navegación e interacción con páginas web",
    files: "lectura y escritura de archivos",
    email: "lectura y envío de correo electrónico",
    database: "consultas a bases de datos",
    code: "ejecución de código",
    api: "llamadas a APIs",
    custom: "herramienta personalizada",
  },
  outputKinds: {
    "free-text": "Responde en texto libre, claro y bien organizado.",
    markdown: "Responde en Markdown.",
    json: "Responde únicamente con JSON válido, sin texto adicional.",
    xml: "Responde únicamente con XML bien formado.",
    table: "Presenta el resultado en una tabla.",
    report: "Entrega un informe estructurado.",
    code: "Entrega el código completo.",
    custom: "",
  },
  approvals: {
    "send-messages": "enviar mensajes o correos en nombre del usuario",
    "spend-money": "gastar dinero o realizar compras",
    "delete-data": "borrar datos o archivos",
    "publish-content": "publicar contenido",
    "modify-external-systems": "modificar sistemas externos (configuraciones, bases de datos o cuentas)",
  },
  approvalsShort: {
    "send-messages": "enviar mensajes",
    "spend-money": "gastar dinero",
    "delete-data": "borrar datos",
    "publish-content": "publicar contenido",
    "modify-external-systems": "modificar sistemas externos",
  },
  core: {
    rolePrefix: "Actúa como",
    objectiveLabel: "Objetivo",
    successMeans: "El éxito significa:",
    successPointer: "El éxito significa cumplir todos los puntos de la sección Definition of Done.",
    missionAutonomy:
      "Trabaja de forma autónoma para cumplir el objetivo, dentro de los límites de este prompt: lleva el estado, sigue el protocolo del loop y detente según las condiciones de parada.",
    inputContent: "Contenido:",
    exampleTitle: (n) => `Ejemplo ${n}`,
    exampleInput: "Entrada:",
    exampleOutput: "Salida ideal:",
    exampleInputMarker: "INPUT:",
    exampleOutputMarker: "OUTPUT:",
    conditionPrefix: "Si",
    decisionRule: (when, then) => `${when}, ${then}.`,
    priorityOrder: (items) => `Prioriza en este orden: ${items.join(" > ")}.`,
    priorityConflict: "Si dos instrucciones entran en conflicto, aplica este orden de prioridad.",
    toolsStandardNote: "Usa estas herramientas solo cuando sean necesarias y nunca inventes sus resultados.",
    outputStructure: "Estructura:",
    exactStructure: "Respeta exactamente esta estructura: no agregues, quites ni reordenes elementos.",
    groundedTaskLead: "Basándote exclusivamente en la información anterior,",
    taskFollowLoop: "Sigue el protocolo del loop y detente solo cuando se cumpla la Definition of Done o una condición de parada.",
    taskStopRule: "Detente solo cuando se cumpla la Definition of Done o una condición de parada.",
    standardDodIntro: "Considera la tarea terminada solo cuando:",
  },
  agent: {
    stateIntro: "Mantén un registro explícito del estado y actualízalo después de cada acción:",
    stateFields: {
      trackKnown: "hechos confirmados y su fuente.",
      trackUnknown: "información que falta o que aún no se verifica.",
      trackCompleted: "subtareas terminadas y verificadas.",
      trackPending: "subtareas por hacer, en orden de prioridad.",
      trackBlockers: "obstáculos que impiden avanzar y lo que se necesita para resolverlos.",
      trackArtifacts: "archivos, resultados o entregables producidos y dónde encontrarlos.",
    },
    loopIntro: "Repite este ciclo en cada iteración:",
    loopSteps: {
      observe: {
        title: "Observar",
        text: "Revisa el estado actual, las acciones previas, los resultados de herramientas, los errores y los requisitos sin resolver.",
      },
      assess: {
        title: "Evaluar",
        text: "Determina si la tarea ya está completa, si falta información, si se necesita verificación y si hay bloqueos.",
      },
      plan: {
        title: "Planificar",
        text: "Elige la siguiente acción de mayor valor considerando el progreso esperado, la probabilidad de éxito, el costo, el riesgo y la reversibilidad.",
      },
      act: { title: "Actuar", text: "Ejecuta la acción planificada." },
      observeResult: {
        title: "Observar el resultado",
        text: "Clasifica el resultado como SUCCESS, PARTIAL_SUCCESS, FAILURE o INCONCLUSIVE. Que una herramienta se haya ejecutado no significa que la tarea haya avanzado.",
      },
      verify: {
        title: "Verificar",
        text: "Comprueba el resultado con evidencia, con un nivel de verificación proporcional a su consecuencia.",
      },
      updateState: { title: "Actualizar el estado", text: "Registra el avance logrado en esta iteración." },
      decide: { title: "Decidir", text: "" },
    },
    actWithTools: "Usa la herramienta adecuada cuando la acción lo requiera.",
    updateStateTracked: (tokens) => `Actualiza ${joinList(tokens, "y")}.`,
    decideIntro: "Elige una opción:",
    decideOptions: {
      continue: "CONTINUE (seguir con el plan)",
      replan: "REPLAN (cambiar de estrategia)",
      retry: "RETRY (reintentar, solo si el fallo parece transitorio)",
      escalate: "ESCALATE (pedir ayuda o autorización)",
      complete: "COMPLETE (solo si se cumple la Definition of Done)",
    },
    iterationNote: (max) =>
      max === undefined
        ? "Cada ciclo completo cuenta como una iteración."
        : `Cada ciclo completo cuenta como una iteración (máximo ${max}).`,
    toolPolicy: [
      "Usa una herramienta cuando la información sea externa, pueda haber cambiado, requiera una acción fuera del modelo o cuando sea posible verificar un resultado.",
      "Nunca simules ni inventes resultados de herramientas. Si una herramienta falla o no está disponible, dilo explícitamente.",
      "Después de una acción con efectos, verifica que el efecto realmente ocurrió.",
      "Que una herramienta responda no significa que la tarea avanzó: evalúa el contenido del resultado.",
    ],
    noToolsPolicy:
      "No tienes herramientas externas: no simules acciones externas ni inventes resultados. Si la tarea las requiere, repórtalo como bloqueo.",
    memoryIntro: "Usa estos tipos de memoria:",
    memory: {
      workingMemory: {
        label: "Memoria de trabajo",
        text: "el estado actual, el plan y los resultados recientes necesarios para el siguiente paso.",
      },
      episodicMemory: {
        label: "Memoria episódica",
        text: "qué acciones intentaste, con qué resultado y por qué, para no repetir intentos fallidos.",
      },
      semanticMemory: { label: "Memoria semántica", text: "hechos verificados y conclusiones reutilizables, con su fuente." },
      artifactMemory: { label: "Memoria de artefactos", text: "un índice de los archivos y entregables producidos y su ubicación." },
    },
    memoryClosing: "No registres como hecho nada que no hayas verificado.",
    verificationIntro: "Ajusta el nivel de verificación a la consecuencia de cada paso:",
    verificationLevels: [
      { label: "Nivel 0", text: "sin verificación, solo para pasos triviales y reversibles que no afectan el resultado final." },
      { label: "Nivel 1", text: "autorrevisión — relee el resultado y comprueba que sea coherente con los requisitos." },
      { label: "Nivel 2", text: "evidencia — contrasta el resultado con la salida de una herramienta o con una fuente." },
      { label: "Nivel 3", text: "verificación independiente — confirma con una segunda fuente o con un método distinto." },
      {
        label: "Nivel 4",
        text: "confirmación humana — las acciones irreversibles o de alto impacto requieren aprobación explícita antes de ejecutarse.",
      },
    ],
    finalVerificationIntro: "Antes de declarar la tarea completa, verifica:",
    recoveryClassify:
      "Cuando algo falle, clasifica el fallo, identifica su causa probable y decide si un reintento sin cambios puede tener éxito.",
    recoveryCategoriesIntro: "Categorías de fallo:",
    recoveryCategories: [
      "error transitorio (red, tiempo de espera, límite de uso)",
      "entrada o parámetros inválidos",
      "permisos o autenticación insuficientes",
      "recurso inexistente o no encontrado",
      "resultado incompleto, vacío o ambiguo",
      "error de lógica o supuesto incorrecto",
      "herramienta no disponible",
    ],
    recoveryRulesIntro: "Reglas de reintento:",
    recoveryRetry: (n) =>
      n <= 0
        ? "No reintentes una acción equivalente que ya falló."
        : `Reintenta una acción equivalente como máximo ${plural(n, "vez", "veces")}, y solo si el fallo parece transitorio.`,
    recoveryRetryUnbounded: "Reintenta una acción equivalente solo si el fallo parece transitorio.",
    recoveryNeverRepeat:
      "Nunca repitas una acción equivalente que ya falló sin cambiar algo relevante (la entrada, la herramienta o el enfoque).",
    recoveryReplan: (n) => `Después de ${plural(n, "fallo equivalente", "fallos equivalentes")}, cambia de estrategia (REPLAN).`,
    recoveryEscalate: (n) =>
      n === 1
        ? "Si 1 estrategia materialmente distinta falla, usa ESCALATE o reporta el bloqueo con la evidencia reunida."
        : `Si ${n} estrategias materialmente distintas fallan, usa ESCALATE o reporta el bloqueo con la evidencia reunida.`,
    budgetIterations: "Iteraciones",
    budgetToolCalls: "Llamadas a herramientas",
    budgetRetries: "Reintentos en total",
    budgetMax: (n) => `máximo ${n}.`,
    budgetClosing: "Si estás por agotar el presupuesto, prioriza entregar un reporte del estado en lugar de iniciar tareas nuevas.",
    approvalIntro: "Solicita aprobación humana explícita antes de:",
    approvalHow: "Al solicitar aprobación, describe la acción, su impacto y si es reversible, y espera la respuesta antes de continuar.",
    escalationIntro: "Escala al usuario cuando:",
    stopComplete: (hasCriteria) =>
      hasCriteria
        ? "cuando todos los criterios de éxito obligatorios estén verificados."
        : "cuando se cumpla la Definition of Done y esté verificada.",
    stopMaxIterations: (n) => `al llegar a ${plural(n, "iteración", "iteraciones")}; entrega un reporte del avance, lo pendiente y los bloqueos.`,
    stopMaxToolCalls: (n) => `al llegar a ${plural(n, "llamada", "llamadas")} a herramientas; entrega un reporte del avance.`,
    stopMissingAuthorization: "si una acción necesaria requiere una autorización que no tienes.",
    stopImpossible: "si el objetivo es imposible con las herramientas disponibles; explica por qué y qué se necesitaría.",
    stopApproval: (categories) =>
      categories.length
        ? `antes de cualquier acción irreversible y antes de ${joinList(categories, "o")}.`
        : "antes de cualquier acción irreversible.",
    stopUserIntro: "Condiciones adicionales:",
    stopClosing: "Detente solo en una de estas condiciones; nunca continúes de forma indefinida.",
    dodIntro: "La tarea está terminada solo cuando:",
    dodRequirements: "todos los requisitos están cumplidos y verificados.",
    dodCriteria: "todos los criterios de éxito están verificados con evidencia.",
    dodOutput: "el entregable sigue el formato de salida definido.",
    dodNoPending: "no quedan pendientes ni bloqueos sin reportar.",
    dodFinalVerification: "se completó la verificación final.",
    dodFallback: "el objetivo está cumplido y verificado.",
    dodAntiIntro: "No declares la tarea completada solo porque:",
    dodAnti: [
      "se intentó una acción;",
      "una herramienta respondió;",
      "la mayoría de las subtareas están completas;",
      "la respuesta parece plausible.",
    ],
  },
};

const en: PromptStrings = {
  headings: {
    role: "Role",
    objective: "Objective",
    "system-instruction": "System Instruction",
    mission: "Mission",
    "success-criteria": "Success Criteria",
    context: "Context",
    inputs: "Inputs",
    "reference-material": "Reference Material",
    instructions: "Instructions",
    task: "Task",
    requirements: "Requirements",
    constraints: "Constraints",
    rules: "Rules",
    "decision-rules": "Decision Rules",
    workflow: "Workflow",
    examples: "Examples",
    tools: "Tools",
    "tool-policy": "Tool Policy",
    state: "State",
    "memory-policy": "Memory Policy",
    "loop-protocol": "Loop Protocol",
    verification: "Verification",
    "error-recovery": "Error Recovery",
    budget: "Budget",
    "human-approval": "Human Approval",
    "stop-conditions": "Stop Conditions",
    "output-format": "Output Format",
    "expected-output": "Expected Output",
    "quality-criteria": "Quality Criteria",
    "definition-of-done": "Definition of Done",
  },
  contextKinds: {
    background: "Background",
    source: "Source material",
    "user-profile": "User profile",
    project: "Project",
    assumption: "Assumptions",
  },
  toolKinds: {
    web: "searching the internet",
    browser: "browsing and interacting with web pages",
    files: "reading and writing files",
    email: "reading and sending email",
    database: "querying databases",
    code: "running code",
    api: "calling APIs",
    custom: "custom tool",
  },
  outputKinds: {
    "free-text": "Answer in clear, well-organized free text.",
    markdown: "Answer in Markdown.",
    json: "Answer only with valid JSON, with no extra text.",
    xml: "Answer only with well-formed XML.",
    table: "Present the result as a table.",
    report: "Deliver a structured report.",
    code: "Deliver the complete code.",
    custom: "",
  },
  approvals: {
    "send-messages": "sending messages or emails on the user's behalf",
    "spend-money": "spending money or making purchases",
    "delete-data": "deleting data or files",
    "publish-content": "publishing content",
    "modify-external-systems": "modifying external systems (settings, databases or accounts)",
  },
  approvalsShort: {
    "send-messages": "sending messages",
    "spend-money": "spending money",
    "delete-data": "deleting data",
    "publish-content": "publishing content",
    "modify-external-systems": "modifying external systems",
  },
  core: {
    rolePrefix: "Act as",
    objectiveLabel: "Objective",
    successMeans: "Success means:",
    successPointer: "Success means meeting every item in the Definition of Done section.",
    missionAutonomy:
      "Work autonomously to achieve the objective within the limits of this prompt: keep track of state, follow the loop protocol and stop according to the stop conditions.",
    inputContent: "Content:",
    exampleTitle: (n) => `Example ${n}`,
    exampleInput: "Input:",
    exampleOutput: "Ideal output:",
    exampleInputMarker: "INPUT:",
    exampleOutputMarker: "OUTPUT:",
    conditionPrefix: "If",
    decisionRule: (when, then) => `${when}, ${then}.`,
    priorityOrder: (items) => `Prioritize in this order: ${items.join(" > ")}.`,
    priorityConflict: "If two instructions conflict, apply this priority order.",
    toolsStandardNote: "Use these tools only when needed and never fabricate their results.",
    outputStructure: "Structure:",
    exactStructure: "Follow this structure exactly: do not add, remove or reorder elements.",
    groundedTaskLead: "Based exclusively on the information above,",
    taskFollowLoop: "Follow the loop protocol and stop only when the Definition of Done or a stop condition is met.",
    taskStopRule: "Stop only when the Definition of Done or a stop condition is met.",
    standardDodIntro: "Consider the task done only when:",
  },
  agent: {
    stateIntro: "Keep an explicit state record and update it after every action:",
    stateFields: {
      trackKnown: "confirmed facts and their source.",
      trackUnknown: "missing or not yet verified information.",
      trackCompleted: "finished and verified subtasks.",
      trackPending: "subtasks still to do, in priority order.",
      trackBlockers: "obstacles preventing progress and what is needed to resolve them.",
      trackArtifacts: "files, results or deliverables produced and where to find them.",
    },
    loopIntro: "Repeat this cycle on every iteration:",
    loopSteps: {
      observe: {
        title: "Observe",
        text: "Review the current state, previous actions, tool results, errors and unresolved requirements.",
      },
      assess: {
        title: "Assess",
        text: "Determine whether the task is already complete, whether information is missing, whether verification is needed and whether there are blockers.",
      },
      plan: {
        title: "Plan",
        text: "Choose the highest-value next action, weighing expected progress, probability of success, cost, risk and reversibility.",
      },
      act: { title: "Act", text: "Execute the planned action." },
      observeResult: {
        title: "Observe the result",
        text: "Classify the result as SUCCESS, PARTIAL_SUCCESS, FAILURE or INCONCLUSIVE. A tool having run does not mean the task progressed.",
      },
      verify: {
        title: "Verify",
        text: "Check the result against evidence, with a level of verification proportional to its consequence.",
      },
      updateState: { title: "Update state", text: "Record the progress made in this iteration." },
      decide: { title: "Decide", text: "" },
    },
    actWithTools: "Use the appropriate tool when the action requires it.",
    updateStateTracked: (tokens) => `Update ${joinList(tokens, "and")}.`,
    decideIntro: "Choose one option:",
    decideOptions: {
      continue: "CONTINUE (keep following the plan)",
      replan: "REPLAN (change strategy)",
      retry: "RETRY (retry, only if the failure looks transient)",
      escalate: "ESCALATE (ask for help or authorization)",
      complete: "COMPLETE (only if the Definition of Done is met)",
    },
    iterationNote: (max) =>
      max === undefined ? "Each full cycle counts as one iteration." : `Each full cycle counts as one iteration (maximum ${max}).`,
    toolPolicy: [
      "Use a tool when the information is external, may have changed, requires an action outside the model, or when a result can be verified.",
      "Never simulate or fabricate tool results. If a tool fails or is unavailable, say so explicitly.",
      "After an action with side effects, verify that the effect actually happened.",
      "A tool responding does not mean the task progressed: evaluate the content of the result.",
    ],
    noToolsPolicy:
      "You have no external tools: do not simulate external actions or fabricate results. If the task requires them, report it as a blocker.",
    memoryIntro: "Use these kinds of memory:",
    memory: {
      workingMemory: { label: "Working memory", text: "the current state, the plan and the recent results needed for the next step." },
      episodicMemory: {
        label: "Episodic memory",
        text: "which actions you tried, with what result and why, so failed attempts are not repeated.",
      },
      semanticMemory: { label: "Semantic memory", text: "verified facts and reusable conclusions, with their source." },
      artifactMemory: { label: "Artifact memory", text: "an index of the files and deliverables produced and their location." },
    },
    memoryClosing: "Do not record anything as fact unless you verified it.",
    verificationIntro: "Match the level of verification to the consequence of each step:",
    verificationLevels: [
      { label: "Level 0", text: "no verification, only for trivial, reversible steps that do not affect the final result." },
      { label: "Level 1", text: "self-review — reread the result and check it is consistent with the requirements." },
      { label: "Level 2", text: "evidence — check the result against a tool output or a source." },
      { label: "Level 3", text: "independent verification — confirm with a second source or a different method." },
      { label: "Level 4", text: "human confirmation — irreversible or high-impact actions require explicit approval before they run." },
    ],
    finalVerificationIntro: "Before declaring the task complete, verify:",
    recoveryClassify:
      "When something fails, classify the failure, identify its likely cause and decide whether an unchanged retry can succeed.",
    recoveryCategoriesIntro: "Failure categories:",
    recoveryCategories: [
      "transient error (network, timeout, rate limit)",
      "invalid input or parameters",
      "insufficient permissions or authentication",
      "missing or not found resource",
      "incomplete, empty or ambiguous result",
      "logic error or wrong assumption",
      "tool unavailable",
    ],
    recoveryRulesIntro: "Retry rules:",
    recoveryRetry: (n) =>
      n <= 0
        ? "Do not retry an equivalent action that already failed."
        : `Retry an equivalent action at most ${plural(n, "time", "times")}, and only if the failure looks transient.`,
    recoveryRetryUnbounded: "Retry an equivalent action only if the failure looks transient.",
    recoveryNeverRepeat: "Never repeat an equivalent action that already failed without changing something relevant (input, tool or approach).",
    recoveryReplan: (n) => `After ${plural(n, "equivalent failure", "equivalent failures")}, change strategy (REPLAN).`,
    recoveryEscalate: (n) =>
      n === 1
        ? "If 1 materially different strategy fails, ESCALATE or report the blocker with the evidence gathered."
        : `If ${n} materially different strategies fail, ESCALATE or report the blocker with the evidence gathered.`,
    budgetIterations: "Iterations",
    budgetToolCalls: "Tool calls",
    budgetRetries: "Total retries",
    budgetMax: (n) => `maximum ${n}.`,
    budgetClosing: "If you are about to exhaust the budget, prioritize delivering a status report over starting new work.",
    approvalIntro: "Request explicit human approval before:",
    approvalHow: "When requesting approval, describe the action, its impact and whether it is reversible, and wait for the answer before continuing.",
    escalationIntro: "Escalate to the user when:",
    stopComplete: (hasCriteria) =>
      hasCriteria ? "when every mandatory success criterion is verified." : "when the Definition of Done is met and verified.",
    stopMaxIterations: (n) => `when you reach ${plural(n, "iteration", "iterations")}; deliver a report of progress, pending work and blockers.`,
    stopMaxToolCalls: (n) => `when you reach ${plural(n, "tool call", "tool calls")}; deliver a progress report.`,
    stopMissingAuthorization: "if a necessary action requires an authorization you do not have.",
    stopImpossible: "if the objective is impossible with the available tools; explain why and what would be needed.",
    stopApproval: (categories) =>
      categories.length
        ? `before any irreversible action and before ${joinList(categories, "or")}.`
        : "before any irreversible action.",
    stopUserIntro: "Additional conditions:",
    stopClosing: "Stop only on one of these conditions; never continue indefinitely.",
    dodIntro: "The task is done only when:",
    dodRequirements: "every requirement is met and verified.",
    dodCriteria: "every success criterion is verified with evidence.",
    dodOutput: "the deliverable follows the defined output format.",
    dodNoPending: "no pending items or blockers are left unreported.",
    dodFinalVerification: "the final verification is complete.",
    dodFallback: "the objective is achieved and verified.",
    dodAntiIntro: "Do not declare the task complete just because:",
    dodAnti: [
      "an action was attempted;",
      "a tool responded;",
      "most subtasks are complete;",
      "the answer looks plausible.",
    ],
  },
};

function joinList(items: string[], conjunction: string): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${items[items.length - 1]}`;
}

const DICTIONARIES: Record<PromptLanguage, PromptStrings> = { es, en };

export function getStrings(language: PromptLanguage | undefined): PromptStrings {
  return DICTIONARIES[language === "en" ? "en" : "es"];
}

export function allHeadings(): string[] {
  return [...new Set([...Object.values(es.headings), ...Object.values(en.headings)])];
}
