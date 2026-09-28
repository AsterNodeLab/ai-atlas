/**
 * Deterministic text helpers shared by the validators, the rule engine, the
 * quality engine, the question engine and the freeform parser.
 * No AI, no randomness: the same input always yields the same output.
 */

export function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim() === "";
}

export function stripAccents(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Single-line cleanup: every whitespace run (including newlines) becomes one space. */
export function cleanLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Multi-line cleanup that preserves structure (code, schemas, pasted documents):
 * normalizes line endings, drops trailing spaces and collapses 3+ blank lines.
 */
export function cleanBlock(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+|\n+$/g, "");
}

/**
 * Comparison key: accent-, case- and whitespace-insensitive, without
 * surrounding punctuation or quotes. "  Usa TABLAS. " → "usa tablas".
 */
export function foldKey(text: string): string {
  return stripAccents(text)
    .toLowerCase()
    .replace(/[“”«»"'`´]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[\s.;:,!?¡¿-]+|[\s.;:,!?¡¿-]+$/g, "");
}

/** Removes duplicates by foldKey, keeping the first occurrence (and its original spelling). */
export function dedupeStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = foldKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export interface DuplicateHit {
  value: string;
  /** Index of the first occurrence. */
  firstIndex: number;
  /** Index of the repeated occurrence. */
  index: number;
}

export function findDuplicates(items: readonly unknown[] | undefined): DuplicateHit[] {
  const firstSeen = new Map<string, number>();
  const hits: DuplicateHit[] = [];
  (items ?? []).forEach((item, index) => {
    if (typeof item !== "string") return;
    const key = foldKey(item);
    if (!key) return;
    const first = firstSeen.get(key);
    if (first === undefined) firstSeen.set(key, index);
    else hits.push({ value: item.trim(), firstIndex: first, index });
  });
  return hits;
}

export function capitalize(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/** Lowercases the first letter unless the word looks like an acronym ("API", "SQL"). */
export function lowerFirst(text: string): string {
  if (text.length < 2) return text.toLowerCase();
  const [first, second] = [text.charAt(0), text.charAt(1)];
  if (second === second.toUpperCase() && second !== second.toLowerCase()) return text;
  return first.toLowerCase() + text.slice(1);
}

export function stripTrailingPunctuation(text: string): string {
  return text.replace(/[\s.;:,]+$/, "");
}

/** Ensures a sentence ends with terminal punctuation. */
export function asSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return /[.!?:…)»"]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function countWords(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/** Short, quoted excerpt for user-facing messages. */
export function quote(text: string, max = 60): string {
  const clean = cleanLine(text);
  const short = clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
  return `«${short}»`;
}

// ───────────────────────── Tokens, stems and polarity ─────────────────────────

/** Spanish + English function words ignored when comparing instructions. */
const STOPWORDS = new Set([
  "de", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "u", "e", "en", "con", "para", "por",
  "que", "a", "al", "del", "lo", "se", "su", "sus", "tu", "tus", "mi", "mis", "es", "son", "como", "mas", "muy",
  "ya", "este", "esta", "estos", "estas", "ese", "esa", "eso", "esto", "siempre", "favor", "cada", "todo", "toda",
  "todos", "todas", "me", "te", "le", "les", "nos",
  "the", "an", "to", "of", "and", "or", "in", "on", "with", "for", "by", "is", "are", "be", "it", "its", "your",
  "you", "as", "at", "from", "that", "this", "these", "those", "always", "please", "any", "all", "each", "do", "does",
]);

/** Negation markers: they flip polarity and are ignored as content. */
const NEGATIONS = new Set([
  "no", "nunca", "jamas", "sin", "ni", "evita", "evitar", "evites", "eviten", "evitando", "prohibido", "prohibida",
  "dont", "doesnt", "not", "never", "avoid", "without", "prohibited",
]);

const SUFFIXES = [
  "amiento", "imiento", "aciones", "iciones", "acion", "icion", "mente", "ando", "iendo", "ados", "idos", "adas",
  "idas", "ado", "ido", "ada", "ida", "aron", "ieron", "emos", "amos", "imos", "ing", "ed", "es", "as", "os", "an",
  "en", "ar", "er", "ir", "a", "e", "o", "s",
];

/**
 * Crude, deterministic stemmer good enough to match "usa/uses/usar" or
 * "tabla/tablas/tables". Spanish spelling alternations before e/i are unified
 * (analiza/analices → analiz, busca/busque → busz, paga/pague → pag).
 */
export function stem(word: string): string {
  if (word.length < 3) return word;
  let out = word;
  for (const suffix of SUFFIXES) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 2) {
      out = word.slice(0, -suffix.length);
      break;
    }
  }
  return out.replace(/qu$/, "c").replace(/gu$/, "g").replace(/c$/, "z");
}

export function tokenize(text: string): string[] {
  return stripAccents(text)
    .toLowerCase()
    .replace(/['’]/g, "")
    .split(/[^a-z0-9ñ]+/)
    .filter(Boolean);
}

export function isNegative(text: string): boolean {
  return tokenize(text).some((t) => NEGATIONS.has(t));
}

/** Content stems (no stopwords, no negations). */
export function contentStems(text: string): string[] {
  const out: string[] = [];
  for (const token of tokenize(text)) {
    if (STOPWORDS.has(token) || NEGATIONS.has(token)) continue;
    const s = stem(token);
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

// ───────────────────────── Conflicting instructions ─────────────────────────

export type InstructionList = "requirements" | "constraints";

export interface InstructionRef {
  list: InstructionList;
  index: number;
  text: string;
}

export interface Conflict {
  kind: "polarity" | "range";
  positive: InstructionRef;
  negative: InstructionRef;
}

const UNIT_ALIASES: Record<string, string> = {
  palabra: "words", palabras: "words", word: "words", words: "words",
  caracter: "chars", caracteres: "chars", character: "chars", characters: "chars",
  parrafo: "paragraphs", parrafos: "paragraphs", paragraph: "paragraphs", paragraphs: "paragraphs",
  linea: "lines", lineas: "lines", line: "lines", lines: "lines",
  oracion: "sentences", oraciones: "sentences", frase: "sentences", frases: "sentences", sentence: "sentences", sentences: "sentences",
  pagina: "pages", paginas: "pages", page: "pages", pages: "pages",
  punto: "items", puntos: "items", elemento: "items", elementos: "items", item: "items", items: "items", bullets: "items", vinetas: "items",
};
const UNIT_PATTERN = Object.keys(UNIT_ALIASES).join("|");
const MAX_RE = new RegExp(`(?<!\\bno )(?:maximo|max|como maximo|no mas de|menos de|hasta|at most|maximum|up to|no more than|fewer than|less than|under)\\s+(\\d+)\\s+(${UNIT_PATTERN})\\b`);
const MIN_RE = new RegExp(`(?<!\\bno )(?:minimo|min|como minimo|al menos|por lo menos|mas de|no menos de|at least|minimum|more than|no fewer than)\\s+(\\d+)\\s+(${UNIT_PATTERN})\\b`);

function readLimit(text: string, re: RegExp): { value: number; unit: string } | undefined {
  const match = re.exec(stripAccents(text).toLowerCase());
  if (!match) return undefined;
  return { value: Number(match[1]), unit: UNIT_ALIASES[match[2]] ?? match[2] };
}

/**
 * Finds contradictory instructions across requirements and constraints:
 * - polarity: "Usa tablas" vs "No uses tablas" (the negated content is fully
 *   contained in the positive instruction, allowing one extra word such as the verb);
 * - range: "máximo 200 palabras" vs "mínimo 500 palabras".
 */
export function findConflicts(requirements: readonly string[] = [], constraints: readonly string[] = []): Conflict[] {
  const refs: InstructionRef[] = [
    ...requirements.map((text, index) => ({ list: "requirements" as const, index, text })),
    ...constraints.map((text, index) => ({ list: "constraints" as const, index, text })),
  ].filter((r) => typeof r.text === "string" && r.text.trim() !== "");

  const conflicts: Conflict[] = [];
  const seen = new Set<string>();
  const push = (conflict: Conflict) => {
    const key = [conflict.kind, conflict.positive.list, conflict.positive.index, conflict.negative.list, conflict.negative.index].join(":");
    if (seen.has(key)) return;
    seen.add(key);
    conflicts.push(conflict);
  };

  const negatives = refs.filter((r) => isNegative(r.text));
  const positives = refs.filter((r) => !isNegative(r.text));
  for (const neg of negatives) {
    const negStems = contentStems(neg.text);
    if (negStems.length === 0) continue;
    for (const pos of positives) {
      const posStems = contentStems(pos.text);
      const contained = negStems.every((s) => posStems.includes(s));
      const extra = posStems.filter((s) => !negStems.includes(s)).length;
      if (contained && extra <= 1) push({ kind: "polarity", positive: pos, negative: neg });
    }
  }

  for (const a of refs) {
    const max = readLimit(a.text, MAX_RE);
    if (!max) continue;
    for (const b of refs) {
      if (a === b) continue;
      const min = readLimit(b.text, MIN_RE);
      if (min && min.unit === max.unit && min.value > max.value) push({ kind: "range", positive: b, negative: a });
    }
  }
  return conflicts;
}

// ───────────────────────── Keyword detectors ─────────────────────────

export function matchesAny(text: string, patterns: readonly RegExp[]): boolean {
  const folded = stripAccents(text).toLowerCase();
  return patterns.some((p) => p.test(folded));
}

/** Words that carry no concrete intent on their own. */
const VAGUE_WORDS = new Set([
  "ayuda", "ayudame", "ayudar", "algo", "cosa", "cosas", "mejorar", "mejora", "mejor", "hazlo", "haz", "hacer",
  "bien", "bueno", "buena", "prompt", "texto", "general", "generico", "cualquier", "quiero", "necesito", "tema",
  "etc", "help", "something", "stuff", "thing", "things", "better", "good", "improve", "make", "do", "it", "want",
  "need", "whatever", "nice", "info", "informacion",
]);

/** "Extremely ambiguous": fewer than 4 words, or only vague words. */
export function isVagueObjective(objective: string): boolean {
  if (isBlank(objective)) return false;
  if (countWords(objective) < 4) return true;
  const tokens = tokenize(objective).filter((t) => !STOPWORDS.has(t) && !NEGATIONS.has(t));
  return tokens.length === 0 || tokens.every((t) => VAGUE_WORDS.has(t));
}
