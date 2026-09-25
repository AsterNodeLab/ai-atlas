import { rawTerms } from "@/content/glossary";
import { categories } from "@/content/categories";
import { learningPaths } from "@/content/learning-paths";
import { site } from "@/lib/site";
import { difficultyOrder } from "@/lib/i18n";
import type {
  Category,
  CategorySlug,
  Difficulty,
  GlossaryTerm,
  LearningPath,
  SearchDocument,
  TermSummary,
} from "@/types/glossary";

const terms: GlossaryTerm[] = rawTerms
  .map((t) => ({ ...t, createdAt: t.createdAt ?? site.contentDate, updatedAt: t.updatedAt ?? site.contentDate }))
  .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));

const bySlug = new Map(terms.map((t) => [t.slug, t]));
const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

validate();

/** Fails the build on broken references so the site never ships dead links. */
function validate() {
  const errors: string[] = [];
  const linkRe = /\[\[([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g;
  for (const t of terms) {
    if (!categoryBySlug.has(t.category)) errors.push(`${t.slug}: unknown category ${t.category}`);
    for (const s of [...(t.prerequisites ?? []), ...(t.relatedTerms ?? []), ...(t.nextTerms ?? [])]) {
      if (!bySlug.has(s)) errors.push(`${t.slug}: missing related term "${s}"`);
    }
    for (const m of JSON.stringify(t).matchAll(linkRe)) {
      if (!bySlug.has(m[1])) errors.push(`${t.slug}: missing inline link "${m[1]}"`);
    }
  }
  for (const p of learningPaths) {
    for (const s of p.steps) if (!bySlug.has(s.slug)) errors.push(`path ${p.slug}: missing "${s.slug}"`);
  }
  if (errors.length) throw new Error(`Glossary content errors:\n${errors.join("\n")}`);
}

export function getAllTerms(): GlossaryTerm[] {
  return terms;
}

export function getTerm(slug: string): GlossaryTerm | undefined {
  return bySlug.get(slug);
}

export function getTerms(slugs: string[] | undefined): GlossaryTerm[] {
  return (slugs ?? []).map((s) => bySlug.get(s)).filter((t): t is GlossaryTerm => Boolean(t));
}

export function toSummary(t: GlossaryTerm): TermSummary {
  return {
    slug: t.slug,
    name: t.name,
    spanishName: t.spanishName,
    acronym: t.acronym,
    shortDefinition: t.shortDefinition,
    category: t.category,
    difficulty: t.difficulty,
    type: t.type,
    frontier: t.frontier,
  };
}

export function getAllSummaries(): TermSummary[] {
  return terms.map(toSummary);
}

export function getCategories(): Category[] {
  return categories;
}

export function getCategory(slug: string): Category | undefined {
  return categoryBySlug.get(slug as CategorySlug);
}

export function categoryName(slug: CategorySlug): string {
  return categoryBySlug.get(slug)?.name ?? slug;
}

export function getTermsInCategory(slug: CategorySlug): GlossaryTerm[] {
  return terms.filter((t) => t.category === slug || t.secondaryCategories?.includes(slug));
}

export function getTermsByDifficulty(d: Difficulty): GlossaryTerm[] {
  return terms.filter((t) => t.difficulty === d);
}

export function sortByDifficulty<T extends { difficulty: Difficulty }>(list: T[]): T[] {
  return [...list].sort((a, b) => difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty));
}

/** Terms that point to this one (reverse edges of the knowledge graph). */
export function getBacklinks(slug: string, limit = 8): GlossaryTerm[] {
  return terms
    .filter((t) => t.slug !== slug && (t.relatedTerms?.includes(slug) || t.prerequisites?.includes(slug)))
    .slice(0, limit);
}

/** Related terms plus strongest backlinks, deduplicated. */
export function getRelated(term: GlossaryTerm, limit = 10): GlossaryTerm[] {
  const seen = new Set<string>([term.slug, ...(term.prerequisites ?? []), ...(term.nextTerms ?? [])]);
  const out: GlossaryTerm[] = [];
  for (const t of [...getTerms(term.relatedTerms), ...getBacklinks(term.slug, 20)]) {
    if (seen.has(t.slug)) continue;
    seen.add(t.slug);
    out.push(t);
    if (out.length >= limit) break;
  }
  return out;
}

export function getFrontierTerms(): GlossaryTerm[] {
  return terms.filter((t) => t.frontier);
}

export function getLearningPaths(): LearningPath[] {
  return learningPaths;
}

export function getLearningPath(slug: string): LearningPath | undefined {
  return learningPaths.find((p) => p.slug === slug);
}

export function getPathsContaining(slug: string): LearningPath[] {
  return learningPaths.filter((p) => p.steps.some((s) => s.slug === slug));
}

/** ~170 words per minute (technical Spanish) across every text field of the entry. */
export function readingTime(t: GlossaryTerm): number {
  const parts = [
    t.shortDefinition,
    t.simpleExplanation,
    t.analogy,
    t.technicalExplanation,
    t.whyItMatters,
    ...(t.inThirtySeconds ?? []),
    ...(t.useCases ?? []),
    ...(t.commonMistakes ?? []),
    t.example?.description,
    t.example?.code,
    t.realExample?.description,
    ...(t.realExample?.flow ?? []),
    ...(t.realExample?.dialogue?.map((d) => d.text) ?? []),
    t.math?.explanation,
    ...(t.math?.symbols.map((s) => s.meaning) ?? []),
    ...(t.comparison?.rows.flatMap((r) => [r.aspect, r.a, r.b]) ?? []),
    ...(t.mentalModel?.map((m) => m.meaning) ?? []),
  ];
  const words = parts.filter(Boolean).join(" ").split(/\s+/).length;
  return Math.max(1, Math.round(words / 170));
}

/** Plain text (no inline markup), for meta descriptions and tooltips. */
export function stripMarkup(text: string): string {
  return text
    .replace(/\[\[([a-z0-9-]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([a-z0-9-]+)\]\]/g, (_, s: string) => bySlug.get(s)?.name ?? s)
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

export function getSearchDocuments(): SearchDocument[] {
  return terms.map((t) => ({
    ...toSummary(t),
    aliases: t.aliases ?? [],
    tags: t.tags ?? [],
    categoryName: categoryName(t.category),
    related: getTerms(t.relatedTerms).map((r) => r.acronym ?? r.name),
  }));
}

/** Curated entry points for the home page. */
export const featuredSlugs = ["transformer", "embeddings", "rag", "ai-agent", "fine-tuning", "token"] as const;

export const featuredTaglines: Record<(typeof featuredSlugs)[number], string> = {
  transformer: "La arquitectura detrás de los LLM modernos.",
  embeddings: "Cómo las máquinas representan significado.",
  rag: "Cómo conectar un LLM con conocimiento externo.",
  "ai-agent": "Modelos capaces de usar herramientas y ejecutar tareas.",
  "fine-tuning": "Cómo especializar un modelo.",
  token: "Las unidades básicas que procesan los LLM.",
};
