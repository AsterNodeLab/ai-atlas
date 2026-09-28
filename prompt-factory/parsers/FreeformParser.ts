import { capitalize, stripAccents } from "../domain/text.ts";
import type { FreeformSuggestions, OutputKind, PromptMode, Suggestion, ToolKind } from "../domain/types.ts";

/**
 * Deterministic parser for the free-text intent (Spanish + English cue
 * patterns). It only SUGGESTS: every result is shown to the user for
 * confirmation, confidence is never above "medium", and sentences that match
 * nothing are returned in `unclassified` so no text is silently lost.
 */

type Confidence = Suggestion<unknown>["confidence"];

// ───────────────────────── Folding with index alignment ─────────────────────────

/** Lowercase + accent-free, keeping a 1:1 character mapping with the (NFC) input. */
function fold(text: string): string {
  let out = "";
  for (const ch of text) {
    const folded = stripAccents(ch).toLowerCase();
    out += folded.length === ch.length ? folded : ch;
  }
  return out;
}

// ───────────────────────── Sentence splitting ─────────────────────────

const ABBREVIATIONS = /(?:\b(?:p|ej|etc|e\.g|i\.e|vs|sr|sra|dr|dra|núm|num|aprox|pág|pag)\.)$/i;

export function splitSentences(input: string): string[] {
  const sentences: string[] = [];
  const lines = input.normalize("NFC").replace(/\r\n?/g, "\n").split("\n");
  for (const rawLine of lines) {
    const line = rawLine.replace(/^\s*(?:[-*•·]|\d+[.)])\s+/, "").trim();
    if (!line) continue;
    const pieces = line.split(/(?<=[.!?;])\s+|;/);
    let buffer = "";
    for (const piece of pieces) {
      buffer = buffer ? `${buffer} ${piece}` : piece;
      if (ABBREVIATIONS.test(buffer.trim())) continue;
      sentences.push(buffer);
      buffer = "";
    }
    if (buffer) sentences.push(buffer);
  }
  return sentences.map(tidy).filter(Boolean);
}

function tidy(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[\s,;:.-]+/, "")
    .replace(/[\s.;,:]+$/, "");
}

// ───────────────────────── Cue patterns ─────────────────────────

const OBJECTIVE_CUES = [
  "quiero un prompt que", "quiero un prompt para", "necesito un prompt que", "necesito un prompt para",
  "quiero un agente que", "necesito un agente que", "quiero un asistente que", "necesito un asistente que",
  "quiero que", "necesito que", "me gustaria que", "el objetivo es", "mi objetivo es", "objetivo:",
  "necesito", "quiero",
  "i want a prompt that", "i need a prompt that", "i want an agent that", "i need an agent that",
  "i want you to", "i need you to", "the goal is to", "the goal is", "my goal is to", "my goal is",
  "i want to", "i need to", "i want", "i need",
];

const NEGATIVE_CONSTRAINT = /^(?:(?:por favor|importante|ademas|tambien|pero|y|please|also|but)[,:]?\s+)*(no|nunca|jamas|sin(?! embargo)|evita\w*|don'?t|do not|never|avoid|without)\b/;
const POSITIVE_CONSTRAINT = /^(?:(?:por favor|importante|ademas|tambien|pero|y|please|also|but)[,:]?\s+)*(solo|solamente|unicamente|maximo|como maximo|minimo|al menos|no mas de|limitate|only|at most|at least|maximum|minimum|no more than|limit)\b/;
const INNER_NEGATION = /\b(que no|sin inventar|nunca|jamas|never|do not|don'?t)\b/;

const OUTPUT_CUES: { kind: OutputKind; re: RegExp; confidence: Confidence }[] = [
  { kind: "json", re: /\bjson\b/, confidence: "medium" },
  { kind: "xml", re: /\bxml\b/, confidence: "medium" },
  { kind: "table", re: /\b(tabla|tablas|table|tables|tabular)\b/, confidence: "medium" },
  { kind: "markdown", re: /\bmarkdown\b/, confidence: "medium" },
  { kind: "report", re: /\b(informe|informes|reporte|reportes|report|memo)\b/, confidence: "medium" },
  { kind: "code", re: /\b(codigo|code|script|snippet)\b/, confidence: "low" },
  { kind: "markdown", re: /\b(lista|listado|vinetas|bullets?|list)\b/, confidence: "low" },
];

const TOOL_CUES: { kind: ToolKind; re: RegExp; confidence: Confidence }[] = [
  { kind: "web", re: /\b(internet|web|en linea|online|google)\b/, confidence: "medium" },
  { kind: "web", re: /\b(busca|buscar|busque|busques|busquen|search)\b/, confidence: "low" },
  { kind: "browser", re: /\b(navegador|browser|naveg\w*|browse|pagina web|paginas web|sitio web|sitios web)\b/, confidence: "medium" },
  { kind: "files", re: /\b(archivo|archivos|file|files|pdf|pdfs|csv|excel|carpeta|folder)\b/, confidence: "medium" },
  { kind: "email", re: /\b(correo|correos|email|emails|e-mail|mail|gmail|outlook|bandeja de entrada|inbox)\b/, confidence: "medium" },
  { kind: "database", re: /\b(base de datos|bases de datos|database|databases|sql|postgres|mysql)\b/, confidence: "medium" },
  { kind: "code", re: /\b(ejecut\w*|corr[ae]\w*|run|execute)\b.{0,24}\b(codigo|code|script|python)\b/, confidence: "medium" },
  { kind: "code", re: /\b(python|jupyter|notebook)\b/, confidence: "low" },
  { kind: "api", re: /\b(api|apis|endpoint|endpoints|webhook|webhooks)\b/, confidence: "medium" },
];

const AGENT_CUES: { re: RegExp; confidence: Confidence }[] = [
  { re: /\b(agente|agentes|agent|agents|autonom\w*|autonomous\w*)\b/, confidence: "medium" },
  { re: /\b(hasta (que|encontrar|lograr|terminar|completar|obtener)|loop|bucle|itera\w*|repite hasta|until|keep going)\b/, confidence: "low" },
  { re: /\brevis\w*\b.*\bhasta\b/, confidence: "low" },
];

// ───────────────────────── Verb detection ─────────────────────────

const VERB_PREFIXES = [
  "investig", "analic", "analiz", "analys", "compar", "busc", "busq", "identif", "calcul", "evalu", "revis", "resum",
  "redact", "escrib", "explic", "propon", "propong", "recomiend", "recomend", "entreg", "elabor", "inclu", "verific",
  "verifiqu", "proyect", "estim", "clasific", "clasifiqu", "traduc", "extrai", "extraig", "extraer", "extrae", "compil",
  "prepar", "disen", "desarroll", "program", "optimi", "document", "valid", "detect", "organi", "orden", "filtr",
  "sugier", "suger", "muestr", "mostr", "present", "describ", "sintet", "consult", "obten", "descarg", "justific",
  "argument", "simul", "grafi", "visuali", "determin", "defin", "establec", "planific", "proporcion", "ofrec", "utili",
  "aplic", "integr", "corrig", "correg", "arregl", "agreg", "anad", "gener", "crea", "cree", "calific", "prioric",
  "prioriz", "sumari", "resalt", "senal", "destac", "enumer", "explor", "monitor", "rastre", "revise", "summari",
  "creat", "writ", "explain", "propos", "recommend", "deliver", "build", "includ", "estimat", "classif", "translat",
  "extract", "design", "develop", "provid", "suggest", "assess", "outlin", "investigat", "gather", "collect", "track",
  "rank", "check", "draft", "review", "analyz", "identify", "evaluat", "compare", "research", "find", "look",
  "guard", "almacen", "registr", "archiv", "agend", "respond", "contest", "notifi", "avis", "actualic", "actualiz",
  "elimin", "borr", "copi", "complet", "termin", "encuentr", "encontr", "localic", "localiz", "recopil", "reun",
  "cuantifi", "compart", "escal", "solicit", "pid", "pregunt", "confirm", "save", "store", "update", "delete",
  "remove", "notify", "reply", "answer", "record", "schedule",
];
const VERB_WORDS = new Set([
  "di", "dime", "dimelo", "diga", "digas", "digan", "decir", "dame", "damelo", "haz", "haga", "hagas", "hacer", "usa",
  "use", "usen", "uses", "usar", "mida", "mide", "medir", "liste", "listes", "listar", "envia", "envie", "enviar",
  "manda", "mande", "tell", "give", "show", "make", "plan", "add", "score", "fix", "list", "search", "send", "run",
]);

const LEADING_CONNECTORS = /^(?:(?:y|e|luego|despues|finalmente|al final|tambien|ademas|and|then|finally|also|que|por favor|please)[,]?\s+)+/;
/** Object/indirect pronouns that may precede a verb ("me diga", "las guarde"). */
const LEADING_CLITICS = /^(?:(?:me|te|le|nos|les|se|lo|la|los|las)\s+)+/;

function isVerbWord(word: string): boolean {
  return Boolean(word) && (VERB_WORDS.has(word) || VERB_PREFIXES.some((p) => word.startsWith(p)));
}

const firstToken = (foldedText: string) => foldedText.split(/[^a-z0-9ñ']+/)[0] ?? "";

export function startsWithVerb(text: string): boolean {
  const folded = fold(text.trim()).replace(LEADING_CONNECTORS, "");
  return isVerbWord(firstToken(folded)) || isVerbWord(firstToken(folded.replace(LEADING_CLITICS, "")));
}

/** Removes leading connectors (and pronouns, when a verb follows) keeping the original spelling. */
function stripLead(text: string): string {
  const folded = fold(text);
  const connectors = LEADING_CONNECTORS.exec(folded)?.[0].length ?? 0;
  const rest = folded.slice(connectors);
  const clitics = LEADING_CLITICS.exec(rest)?.[0].length ?? 0;
  const verbAfterClitics = clitics > 0 && !isVerbWord(firstToken(rest)) && isVerbWord(firstToken(rest.slice(clitics)));
  return text.slice(connectors + (verbAfterClitics ? clitics : 0));
}

const CHUNK_SEPARATORS =
  /(,\s*|\s+y\s+al\s+final\s+|\s+y\s+luego\s+|\s+y\s+despu[eé]s\s+|\s+y\s+finalmente\s+|\s+y\s+tambi[eé]n\s+|\s+y\s+|\s+e\s+|\s+and\s+then\s+|\s+and\s+finally\s+|\s+and\s+|\s+then\s+)/i;

/**
 * Splits a list of verb phrases: "investigue X, analice Y y al final me diga Z"
 * → ["investigue X", "analice Y", "diga Z"]. Pieces that do not start with a
 * verb are glued back ("escenarios bajista, base y alcista" stays together).
 */
export function splitVerbPhrases(text: string): string[] {
  const parts = text.split(CHUNK_SEPARATORS);
  const chunks: string[] = [parts[0] ?? ""];
  for (let i = 1; i < parts.length; i += 2) {
    const separator = parts[i] ?? "";
    const piece = parts[i + 1] ?? "";
    if (piece.trim() && startsWithVerb(piece)) chunks.push(piece);
    else chunks[chunks.length - 1] += separator + piece;
  }
  return chunks.map((c) => capitalize(tidy(stripLead(tidy(c))))).filter(Boolean);
}

// ───────────────────────── Parser ─────────────────────────

const RANK: Record<Confidence, number> = { low: 0, medium: 1 };

function findObjectiveCue(folded: string): { end: number } | undefined {
  for (const cue of OBJECTIVE_CUES) {
    const re = new RegExp(`(^|[\\s,¡¿(])${cue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[\\s:,]|$)`);
    const match = re.exec(folded);
    if (match) return { end: match.index + match[0].length };
  }
  return undefined;
}

export function parseFreeformText(input: string): FreeformSuggestions {
  const result: FreeformSuggestions = { requirements: [], constraints: [], tools: [], unclassified: [] };
  if (typeof input !== "string" || !input.trim()) return result;

  const setOutput = (kind: OutputKind, source: string, confidence: Confidence) => {
    if (!result.outputFormat || RANK[confidence] > RANK[result.outputFormat.confidence]) result.outputFormat = { value: kind, source, confidence };
  };
  const setMode = (mode: PromptMode, source: string, confidence: Confidence) => {
    if (!result.mode || RANK[confidence] > RANK[result.mode.confidence]) result.mode = { value: mode, source, confidence };
  };
  const addTool = (kind: ToolKind, source: string, confidence: Confidence) => {
    const existing = result.tools.find((t) => t.value === kind);
    if (!existing) result.tools.push({ value: kind, source, confidence });
    else if (RANK[confidence] > RANK[existing.confidence]) Object.assign(existing, { source, confidence });
  };
  const seenRequirements = new Set<string>();
  const addRequirement = (value: string, source: string, confidence: Confidence) => {
    const key = fold(value);
    if (!value || seenRequirements.has(key)) return;
    seenRequirements.add(key);
    result.requirements.push({ value, source, confidence });
  };

  /** Output / tool / agent cues. Returns whether anything matched. */
  const scanCues = (sentence: string, folded: string, options: { tools: boolean }): boolean => {
    let matched = false;
    const codeTool = TOOL_CUES.some((c) => c.kind === "code" && c.confidence === "medium" && c.re.test(folded));
    for (const cue of OUTPUT_CUES) {
      if (cue.kind === "code" && codeTool) continue;
      if (cue.re.test(folded)) {
        setOutput(cue.kind, sentence, cue.confidence);
        matched = true;
        break;
      }
    }
    if (options.tools) {
      for (const cue of TOOL_CUES) {
        if (cue.re.test(folded)) {
          addTool(cue.kind, sentence, cue.confidence);
          matched = true;
        }
      }
    }
    for (const cue of AGENT_CUES) {
      if (cue.re.test(folded)) {
        setMode("agent", sentence, cue.confidence);
        matched = true;
      }
    }
    return matched;
  };

  const order = splitSentences(input);
  /** Sentences consumed only by output/tool/agent cues. */
  const cueOnly: string[] = [];

  for (const sentence of order) {
    const folded = fold(sentence);

    // 1. Objective (first sentence with an intent cue); its verb list becomes requirements.
    if (!result.objective) {
      const cue = findObjectiveCue(folded);
      const rest = cue ? tidy(sentence.slice(cue.end)) : "";
      if (cue && rest) {
        const [objective, ...requirements] = splitVerbPhrases(rest);
        result.objective = { value: objective, source: sentence, confidence: "medium" };
        requirements.forEach((r) => addRequirement(r, sentence, "medium"));
        scanCues(sentence, folded, { tools: true });
        continue;
      }
    }

    // 2. Constraints ("no…", "nunca…", "solo…", "máximo…").
    const negative = NEGATIVE_CONSTRAINT.test(folded);
    if (negative || POSITIVE_CONSTRAINT.test(folded)) {
      result.constraints.push({ value: capitalize(sentence), source: sentence, confidence: "medium" });
      if (!negative) scanCues(sentence, folded, { tools: false });
      continue;
    }

    // 3. Output format, tools, agent mode (the sentence may still be the objective, see below).
    if (scanCues(sentence, folded, { tools: true })) {
      cueOnly.push(sentence);
      continue;
    }

    // 4. Verb phrases: requirements after the objective (or the objective itself).
    if (startsWithVerb(sentence)) {
      const phrases = splitVerbPhrases(sentence);
      if (!result.objective) {
        const [objective, ...requirements] = phrases;
        result.objective = { value: objective, source: sentence, confidence: "low" };
        requirements.forEach((r) => addRequirement(r, sentence, "low"));
      } else {
        phrases.forEach((r) => addRequirement(r, sentence, "low"));
      }
      continue;
    }

    // 5. A negation in the middle of a sentence is a weak constraint signal.
    if (INNER_NEGATION.test(folded)) {
      result.constraints.push({ value: capitalize(sentence), source: sentence, confidence: "low" });
      continue;
    }

    result.unclassified.push(sentence);
  }

  // No intent cue anywhere: the first non-constraint sentence is a low-confidence objective.
  if (!result.objective) {
    const first = order.find((s) => cueOnly.includes(s) || result.unclassified.includes(s));
    if (first) {
      result.unclassified = result.unclassified.filter((s) => s !== first);
      result.objective = { value: capitalize(first), source: first, confidence: "low" };
    }
  }
  return result;
}
