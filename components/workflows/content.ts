/**
 * Content for /workflows — "Anatomía de un workflow".
 * The 3D experience lives in public/anatomia_workflow.html; this file holds the same
 * narrative as plain text plus the tools section. Every tool claim was checked against
 * the official documentation linked in `sources` on `toolsVerifiedAt`.
 */

export const toolsVerifiedAt = "2026-09-29";

export const formula = ["Disparador", "Pasos con datos", "Decisiones y controles", "Resultado"] as const;

export interface Stage {
  name: string;
  /** What happens in the running example (one hypothetical request, start to finish). */
  example: string;
  /** What the stage teaches. */
  idea: string;
}

export const stages: Stage[] = [
  {
    name: "Vista general",
    example: "Siete estaciones conectadas: llega una solicitud, se registran sus datos, se comprueba si está completa, se decide el camino y queda registrado el resultado.",
    idea: "Un workflow es un proceso definido mediante pasos conectados, con un inicio, acciones, decisiones y un resultado. Como la estructura está definida, se puede repetir con cada caso nuevo.",
  },
  {
    name: "Disparador",
    example: "Llega una solicitud. La señal entra por el inicio y activa la primera estación.",
    idea: "El disparador es lo que pone en marcha el proceso: un formulario enviado, un correo, una hora programada o una persona que lo inicia a mano. Sin disparador, el proceso espera.",
  },
  {
    name: "Pasos con datos",
    example: "«Registrar datos» recibe la solicitud tal como llegó y entrega una ficha con asunto, detalle y adjunto. «Comprobar información» recibe la ficha y entrega la misma ficha con un estado: completa o incompleta.",
    idea: "Cada paso recibe algo y entrega algo. La salida de un paso es la entrada del siguiente.",
  },
  {
    name: "Decisiones",
    example: "La condición es «¿la información está completa?». Esta solicitud sí lo está, así que sigue por el camino SÍ y se envía al responsable.",
    idea: "Una decisión elige el camino según una condición definida de antemano. Dos casos que cumplen la misma condición siguen el mismo camino.",
  },
  {
    name: "Controles",
    example: "Llega otra solicitud y le falta el adjunto. La decisión la manda por el camino NO: no se envía al responsable, queda en pausa y se pide completarla. Cuando llega lo que falta, vuelve a entrar por el inicio.",
    idea: "Un control valida antes de seguir. Si algo falta, el proceso se detiene o pide revisión en lugar de continuar como si todo fuera correcto. Un control también puede ser la revisión de una persona.",
  },
  {
    name: "Resultado",
    example: "Las dos solicitudes terminan registradas: una enviada al responsable y otra en espera de información.",
    idea: "Cada caso termina con una salida clara y queda registrado. El proceso queda listo para la siguiente solicitud.",
  },
];

/** The three questions that change from one tool to another; the structure above does not. */
export const toolQuestions = [
  { title: "Cómo se representa", text: "Un lienzo con nodos, una lista de pasos o una tarea escrita en lenguaje natural." },
  { title: "Quién ejecuta los pasos", text: "Una persona, una plataforma de automatización o un agente de IA; a menudo, una combinación." },
  { title: "Cuánta libertad tiene", text: "Desde seguir una ruta fija definida paso a paso hasta decidir cómo avanzar dentro de límites y aprobaciones." },
] as const;

export interface ToolSource {
  label: string;
  url: string;
}

export interface WorkflowTool {
  name: string;
  maker: string;
  represents: string;
  runs: string;
  sources: ToolSource[];
}

export const workflowTools: WorkflowTool[] = [
  {
    name: "n8n",
    maker: "n8n",
    represents: "Un workflow es un conjunto de nodos conectados. Un nodo disparador (trigger) lo inicia y el nodo If lo divide según una condición.",
    runs: "n8n ejecuta los nodos siguiendo las conexiones que definiste. También ofrece nodos de agente de IA: en ese paso, un modelo puede tomar decisiones dentro del workflow.",
    sources: [
      { label: "Glosario de n8n", url: "https://docs.n8n.io/key-concept-glossary/" },
      { label: "Nodo If", url: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/" },
    ],
  },
  {
    name: "Make",
    maker: "Make",
    represents: "Un escenario de módulos encadenados. El disparador solo puede ir una vez, como primer módulo; un router divide el flujo en rutas y los filtros dejan pasar solo los datos que cumplen una condición.",
    runs: "Make procesa los datos por los módulos y las rutas que configuraste; cada ruta los trata de forma distinta según su condición.",
    sources: [
      { label: "Tipos de módulos", url: "https://help.make.com/types-of-modules" },
      { label: "Router", url: "https://help.make.com/router" },
      { label: "Filtros", url: "https://help.make.com/filtering" },
    ],
  },
  {
    name: "Zapier",
    maker: "Zapier",
    represents: "Un Zap: un disparador y una o más acciones. Los filtros hacen que solo continúe si se cumplen ciertas condiciones; Paths ejecuta acciones distintas según la condición.",
    runs: "Cuando ocurre el disparador, Zapier realiza las acciones del Zap.",
    sources: [{ label: "Conceptos clave de los Zaps", url: "https://help.zapier.com/hc/en-us/articles/8496181725453-Learn-key-concepts-in-Zap-workflows" }],
  },
  {
    name: "Codex",
    maker: "OpenAI",
    represents: "Una tarea descrita en lenguaje natural. AGENTS.md aporta instrucciones que Codex lee antes de empezar a trabajar.",
    runs: "Es un agente de programación: decide qué pasos dar para cumplir la tarea, con aprobaciones y sandbox como límites. Para ejecutarlo sin intervención existen su modo no interactivo, su SDK y una GitHub Action.",
    sources: [
      { label: "Documentación de Codex", url: "https://developers.openai.com/codex" },
      { label: "AGENTS.md", url: "https://learn.chatgpt.com/docs/agent-configuration/agents-md" },
    ],
  },
  {
    name: "Claude Code",
    maker: "Anthropic",
    represents: "Una tarea en lenguaje natural. CLAUDE.md da instrucciones persistentes, pero Claude las trata como contexto, no como configuración obligatoria; las skills empaquetan procedimientos repetibles.",
    runs: "Es una herramienta de programación agéntica: lee el código, edita archivos y ejecuta comandos. Lo que debe ocurrir siempre en un punto fijo se define con hooks, que se ejecutan de forma determinista. Se puede automatizar con `claude -p`, GitHub Actions o tareas programadas.",
    sources: [
      { label: "Descripción general", url: "https://code.claude.com/docs/en/overview" },
      { label: "CLAUDE.md y memoria", url: "https://code.claude.com/docs/en/memory" },
      { label: "Hooks", url: "https://code.claude.com/docs/en/hooks-guide" },
    ],
  },
  {
    name: "Hermes Agent",
    maker: "Nous Research",
    represents: "Instrucciones y skills: procedimientos que el agente crea a partir de la experiencia y reutiliza en tareas parecidas.",
    runs: "Es un agente open source que se autoaloja. Tiene memoria persistente, tareas programadas con cron y aprobación de comandos como medida de seguridad.",
    sources: [{ label: "Documentación de Hermes Agent", url: "https://hermes-agent.nousresearch.com/docs/" }],
  },
];

export const relatedSlugs = ["workflow", "agentic-workflow", "ai-agent", "orchestration"];
