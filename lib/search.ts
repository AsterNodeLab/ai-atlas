import type { SearchDocument } from "@/types/glossary";

/**
 * Local search engine: normalization + weighted field matching + light fuzzy matching.
 * Pure and dependency-free so it can run on the client or the server.
 */

const STOPWORDS = new Set([
  "de", "del", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "en", "que",
  "es", "como", "para", "por", "con", "a", "al", "se", "su", "the", "of", "and", "what", "is",
]);

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type MatchKind = "name" | "alias" | "tag" | "category" | "related" | "definition";

interface IndexedField {
  text: string;
  words: string[];
  weight: number;
  fuzzy: boolean;
  kind: MatchKind;
}

export interface IndexedDocument {
  doc: SearchDocument;
  fields: IndexedField[];
}

export interface SearchResult {
  doc: SearchDocument;
  score: number;
  /** Which kind of field produced the best match — used to explain the result. */
  matchedBy: MatchKind;
}

function field(text: string, weight: number, kind: MatchKind, fuzzy = false): IndexedField {
  const n = normalize(text);
  return { text: n, words: n.split(" ").filter(Boolean), weight, fuzzy, kind };
}

export function buildIndex(docs: SearchDocument[]): IndexedDocument[] {
  return docs.map((doc) => ({
    doc,
    fields: [
      field(doc.name, 100, "name", true),
      ...(doc.acronym ? [field(doc.acronym, 100, "name")] : []),
      ...(doc.spanishName ? [field(doc.spanishName, 75, "alias", true)] : []),
      ...doc.aliases.map((a) => field(a, 80, "alias", true)),
      ...doc.tags.map((t) => field(t, 35, "tag", true)),
      field(doc.categoryName, 22, "category"),
      ...doc.related.map((r) => field(r, 18, "related")),
      field(doc.shortDefinition, 12, "definition"),
    ],
  }));
}

/** Levenshtein distance with early exit once it exceeds `max`. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

function fuzzyBudget(token: string): number {
  if (token.length >= 8) return 2;
  if (token.length >= 4) return 1;
  return 0;
}

/** Score of a single query token against a single field (0 = no match). */
function scoreToken(token: string, f: IndexedField): number {
  if (!f.text) return 0;
  if (f.text === token) return f.weight * 3;
  if (f.text.startsWith(token)) return f.weight * 2;
  if (f.words.some((w) => w.startsWith(token))) return f.weight * 1.5;
  if (token.length >= 3 && f.text.includes(token)) return f.weight * 0.8;
  if (f.fuzzy) {
    const budget = fuzzyBudget(token);
    if (budget > 0) {
      for (const w of f.words) {
        if (w.length < 3) continue;
        if (editDistance(token, w, budget) <= budget) return f.weight * 0.55;
        // Typo while still typing: compare against a same-length prefix.
        if (w.length > token.length && editDistance(token, w.slice(0, token.length), budget) <= budget - (budget > 1 ? 1 : 0)) {
          return f.weight * 0.4;
        }
      }
    }
  }
  return 0;
}

export function search(index: IndexedDocument[], rawQuery: string, limit = 12): SearchResult[] {
  const q = normalize(rawQuery);
  if (!q) return [];
  const allTokens = q.split(" ");
  const tokens = allTokens.filter((t) => !STOPWORDS.has(t));
  const effective = tokens.length ? tokens : allTokens;

  const results: SearchResult[] = [];
  const partial: SearchResult[] = [];
  for (const entry of index) {
    let total = 0;
    let best = 0;
    let bestKind: MatchKind = "definition";
    let matched = 0;

    for (const token of effective) {
      let tokenBest = 0;
      for (const f of entry.fields) {
        const s = scoreToken(token, f);
        if (s > tokenBest) tokenBest = s;
        if (s > best) {
          best = s;
          bestKind = f.kind;
        }
      }
      if (tokenBest > 0) matched++;
      total += tokenBest;
    }
    if (matched === 0) continue;
    if (matched < effective.length) {
      // Natural-language queries ("como funciona chatgpt"): keep as fallback.
      partial.push({ doc: entry.doc, score: (total * matched) / effective.length, matchedBy: bestKind });
      continue;
    }

    // Whole-phrase bonus for multi-word queries ("base de vectores").
    if (allTokens.length > 1) {
      for (const f of entry.fields) {
        if (f.text === q) total += f.weight * 4;
        else if (f.text.includes(q)) total += f.weight * 1.5;
      }
    }
    results.push({ doc: entry.doc, score: total, matchedBy: bestKind });
  }

  const pool = results.length ? results : partial.filter((r) => r.score >= 40);
  return pool
    .sort((a, b) => b.score - a.score || a.doc.name.length - b.doc.name.length)
    .slice(0, limit);
}

function trigrams(s: string): Set<string> {
  const padded = `  ${s} `;
  const out = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) out.add(padded.slice(i, i + 3));
  return out;
}

/** "¿Tal vez buscabas…?" — closest names by trigram similarity. */
export function suggest(index: IndexedDocument[], rawQuery: string, limit = 3): SearchDocument[] {
  const q = normalize(rawQuery);
  if (q.length < 2) return [];
  const qg = trigrams(q);
  return index
    .map((entry) => {
      let best = 0;
      for (const f of entry.fields) {
        if (f.kind !== "name" && f.kind !== "alias") continue;
        const g = trigrams(f.text);
        let common = 0;
        for (const t of qg) if (g.has(t)) common++;
        best = Math.max(best, (2 * common) / (qg.size + g.size));
      }
      return { doc: entry.doc, best };
    })
    .filter((s) => s.best > 0.22)
    .sort((a, b) => b.best - a.best)
    .slice(0, limit)
    .map((s) => s.doc);
}
