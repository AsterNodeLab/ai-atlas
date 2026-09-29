/**
 * Content for /llms — "LLMs y prompting efectivo".
 * Evergreen on purpose: no model names or versions, only concepts and official entry points.
 */

export const tocItems = [
  { id: "que-hace", label: "Qué hace un LLM" },
  { id: "conectar", label: "Cómo conectarlo" },
  { id: "plantilla", label: "Plantilla de prompt" },
  { id: "workflow-vs-agente", label: "Workflow vs. agente" },
  { id: "ejemplo", label: "Ejemplo: intención + datos" },
  { id: "primer-prompt", label: "Tu primer prompt útil" },
];

export interface Provider {
  name: string;
  what: string;
  bestFor: string;
  docs: string;
  console: string;
  consoleLabel: string;
}

/** Official entry points, checked by HTTP response when this page was written. */
export const providers: Provider[] = [
  {
    name: "OpenAI API",
    what: "Los modelos GPT desde tu propio código o desde una plataforma de automatización.",
    bestFor: "Proyectos generales, ecosistema amplio de ejemplos y librerías.",
    docs: "https://developers.openai.com/api/docs",
    console: "https://platform.openai.com",
    consoleLabel: "Crear API key",
  },
  {
    name: "Anthropic API (Claude)",
    what: "Los modelos Claude, muy usados para textos largos, instrucciones detalladas y agentes.",
    bestFor: "Documentos extensos, seguir reglas con precisión y uso de herramientas.",
    docs: "https://platform.claude.com/docs/en/home",
    console: "https://platform.claude.com",
    consoleLabel: "Consola de Claude",
  },
  {
    name: "Gemini API (Google AI Studio)",
    what: "Los modelos Gemini de Google; AI Studio permite probar prompts y obtener la clave en minutos.",
    bestFor: "Prototipos rápidos, entradas multimodales (texto, imagen, audio) e integración con Google.",
    docs: "https://ai.google.dev/gemini-api/docs",
    console: "https://aistudio.google.com",
    consoleLabel: "Abrir AI Studio",
  },
  {
    name: "Nodos de IA de n8n",
    what: "Conectan cualquiera de los modelos anteriores a un workflow visual, sin escribir código.",
    bestFor: "Automatizar procesos: nodos como AI Agent, Basic LLM Chain, Text Classifier o Information Extractor.",
    docs: "https://docs.n8n.io/build/integrate-ai",
    console: "https://n8n.io",
    consoleLabel: "Sitio de n8n",
  },
];

/** Generic request shape shared by the main APIs (field names vary slightly per provider). */
export const requestShape = `{
  "model": "[nombre del modelo que elijas en la documentación]",
  "system": "Eres un clasificador de mensajes de soporte. Respondes solo en JSON.",
  "messages": [
    { "role": "user", "content": "Mi pedido 48213 llegó sin cargador." }
  ],
  "temperature": 0
}`;

export const promptTemplate = `# OBJETIVO
[Qué debe lograr el modelo, en una sola frase]

# CONTEXTO
[Quién eres, para quién es el resultado y qué necesita saber el modelo]

# DATOS DE ENTRADA
<entrada>
{{DATOS}}
</entrada>

# INSTRUCCIONES
1. [Primer paso]
2. [Segundo paso]
3. [Tercer paso]

# RESTRICCIONES
- [Lo que no debe hacer]
- Si falta información, [qué hacer: preguntar, marcarlo, usar null]

# FORMATO DE SALIDA
[Estructura exacta: JSON con estos campos, lista, tabla, texto de N líneas…]`;

export const templateParts = [
  { name: "Objetivo", tip: "Una frase con un verbo claro: *clasificar*, *extraer*, *redactar*, *resumir*. Si no cabe en una frase, son dos prompts." },
  { name: "Contexto", tip: "Lo que un colega nuevo necesitaría saber: el negocio, el público, el tono, para qué se usará el resultado." },
  { name: "Datos de entrada", tip: "El material real, separado de las instrucciones con etiquetas o delimitadores para que el modelo no los confunda." },
  { name: "Instrucciones", tip: "Pasos numerados en el orden en que quieres que el modelo trabaje." },
  { name: "Restricciones", tip: "Lo que no debe hacer y qué hacer ante casos raros: información faltante, mensajes fuera de tema, datos dudosos." },
  { name: "Formato de salida", tip: "La forma exacta de la respuesta. Si otro sistema la va a leer, pide JSON con campos fijos." },
];

export const workflowPrompt = `# OBJETIVO
Clasificar el mensaje de un cliente en una sola categoría.

# DATOS DE ENTRADA
<mensaje>{{MENSAJE}}</mensaje>

# INSTRUCCIONES
1. Lee el mensaje completo.
2. Elige UNA categoría: pedido, reclamo, cotizacion, soporte, otro.

# FORMATO DE SALIDA
Solo JSON: {"categoria": "..."}`;

export const agentPrompt = `# OBJETIVO
Resolver la solicitud del cliente de principio a fin.

# HERRAMIENTAS DISPONIBLES
- consultar_pedido(numero): estado y detalles de un pedido.
- crear_ticket(tipo, resumen): abre un caso para el equipo.
- escalar_a_humano(motivo): pasa la conversación a una persona.

# CÓMO DECIDIR
En cada turno elige UNA acción:
- Si falta un dato imprescindible, pregúntalo al cliente.
- Si necesitas información del sistema, usa una herramienta.
- Si el caso implica dinero o una queja grave, escala a un humano.

# RESTRICCIONES
- Nunca inventes el estado de un pedido: consúltalo.

# CONDICIÓN DE PARADA
Termina cuando la solicitud quede resuelta o escalada.`;

export const workflowVsAgent = [
  { aspect: "Quién decide el siguiente paso", workflow: "Tú, al diseñar el workflow.", agent: "El modelo, en cada turno." },
  { aspect: "Qué hace el LLM", workflow: "Una tarea acotada: clasificar, extraer, redactar.", agent: "Razonar, elegir herramientas y observar resultados." },
  { aspect: "Qué devuelve", workflow: "Un resultado con formato fijo (por ejemplo, JSON).", agent: "Una acción a ejecutar o la respuesta final." },
  { aspect: "El prompt necesita", workflow: "Tarea, datos y formato de salida.", agent: "Además: herramientas, criterios de decisión y cuándo parar." },
  { aspect: "Úsalo cuando", workflow: "El proceso se repite siempre igual.", agent: "Cada caso requiere pasos distintos." },
];

export const intentPrompt = `# OBJETIVO
Detectar la intención de un mensaje de cliente y extraer los datos útiles
para que el workflow decida qué hacer.

# CONTEXTO
Eres el primer filtro de atención de una tienda en línea.
Tu salida la lee un sistema automático, no una persona.

# DATOS DE ENTRADA
<mensaje>
{{MENSAJE}}
</mensaje>

# INSTRUCCIONES
1. Elige UNA intención:
   consulta_pedido | reclamo | cotizacion | soporte_tecnico | otro
2. Extrae solo los datos que aparezcan en el mensaje.
3. Estima tu confianza entre 0 y 1.
4. Lista lo que falta para poder atender el caso.

# RESTRICCIONES
- No inventes datos: si algo no aparece, usa null.
- No respondas al cliente: solo clasifica y extrae.

# FORMATO DE SALIDA
Solo JSON válido, sin texto adicional:
{
  "intencion": "...",
  "confianza": 0.0,
  "datos": {
    "numero_pedido": null,
    "producto": null,
    "cantidad": null,
    "problema": null,
    "email": null
  },
  "falta_informacion": []
}`;

export interface IntentExample {
  id: string;
  eyebrow: string;
  label: string;
  message: string;
  output: string;
  route: string;
}

export const intentExamples: IntentExample[] = [
  {
    id: "reclamo",
    eyebrow: "Ejemplo 1",
    label: "Reclamo",
    message: "Hola, el lunes compré unos audífonos (pedido 48213) y llegaron sin cargador. ¿Me mandan uno o me devuelven el dinero? Mi correo es ana.ruiz@example.com",
    output: `{
  "intencion": "reclamo",
  "confianza": 0.93,
  "datos": {
    "numero_pedido": "48213",
    "producto": "audífonos",
    "cantidad": null,
    "problema": "llegó sin cargador",
    "email": "ana.ruiz@example.com"
  },
  "falta_informacion": []
}`,
    route: "El workflow crea un ticket de reclamo con el número de pedido y envía una confirmación al correo.",
  },
  {
    id: "cotizacion",
    eyebrow: "Ejemplo 2",
    label: "Cotización",
    message: "Buenas tardes, necesito precio de 50 sillas de oficina ergonómicas para Grupo Norte. Las necesitamos antes de fin de mes.",
    output: `{
  "intencion": "cotizacion",
  "confianza": 0.95,
  "datos": {
    "numero_pedido": null,
    "producto": "sillas de oficina ergonómicas",
    "cantidad": 50,
    "problema": null,
    "email": null
  },
  "falta_informacion": ["email o teléfono de contacto"]
}`,
    route: "El workflow registra la oportunidad en el CRM y pide al cliente un dato de contacto antes de enviar la cotización.",
  },
  {
    id: "ambiguo",
    eyebrow: "Ejemplo 3",
    label: "Mensaje ambiguo",
    message: "¿Sigue en pie lo de ayer?",
    output: `{
  "intencion": "otro",
  "confianza": 0.35,
  "datos": {
    "numero_pedido": null,
    "producto": null,
    "cantidad": null,
    "problema": null,
    "email": null
  },
  "falta_informacion": ["a qué se refiere con 'lo de ayer'"]
}`,
    route: "La confianza es baja: el workflow no adivina. Pide una aclaración o pasa el caso a una persona.",
  },
];

export const routes = [
  { intent: "consulta_pedido", action: "Consultar el estado del pedido y responder." },
  { intent: "reclamo", action: "Crear un ticket y confirmar al cliente." },
  { intent: "cotizacion", action: "Registrar en el CRM y preparar la cotización." },
  { intent: "soporte_tecnico", action: "Enviar a la base de conocimiento o a soporte." },
  { intent: "otro · o confianza < 0.7", action: "Pedir aclaración o pasar a una persona." },
];

export const firstPromptSteps = [
  "**Escribe el objetivo en una frase.** Si necesitas un «y además», divide la tarea en dos prompts.",
  "**Pega un caso real** en la sección de datos de entrada, entre etiquetas como `<mensaje>`.",
  "**Define la salida exacta.** Si la va a leer un workflow, pide JSON con campos fijos y los valores permitidos.",
  "**Di qué hacer ante lo raro:** información faltante, mensajes fuera de tema o dudas. Por ejemplo: «si no aparece, usa null».",
  "**Prueba con cinco mensajes distintos,** incluido uno ambiguo y uno que no tenga nada que ver.",
  "**Corrige lo que falló y vuelve a probar.** Cada error se convierte en una instrucción o una restricción nueva.",
];

export const commonMistakes = [
  "Pedir «sé preciso» o «hazlo bien» sin decir qué significa en este caso.",
  "Mezclar las instrucciones con los datos, sin separarlos.",
  "No fijar el formato de salida y luego no poder procesar la respuesta.",
  "Dejar que el modelo invente un dato en lugar de pedirle `null` cuando falta.",
  "Usar una temperatura alta para tareas que deben dar siempre el mismo resultado, como clasificar.",
];

export const relatedSlugs = ["llm", "prompt", "system-prompt", "structured-output", "workflow", "ai-agent", "tool-calling", "temperature", "hallucination", "api"];
