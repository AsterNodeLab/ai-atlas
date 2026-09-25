/**
 * Content model for the glossary.
 *
 * Rich-text fields (marked `RichText`) support a tiny inline syntax, rendered by
 * `components/glossary/rich-text.tsx`:
 *   [[slug]]          → link to another term (with hover tooltip)
 *   [[slug|texto]]    → same, with custom visible text
 *   **negritas**      → strong
 *   `código`          → inline code
 *   Blank line        → new paragraph
 */
export type RichText = string;

export type Difficulty = "beginner" | "intermediate" | "advanced" | "research";

export type TermType =
  | "concept"
  | "technique"
  | "architecture"
  | "model"
  | "infrastructure"
  | "mathematics"
  | "safety";

export type CategorySlug =
  | "fundamentals"
  | "machine-learning"
  | "deep-learning"
  | "generative-ai"
  | "llm"
  | "transformers"
  | "prompt-engineering"
  | "agents"
  | "rag"
  | "vector-search"
  | "computer-vision"
  | "nlp"
  | "reinforcement-learning"
  | "ai-engineering"
  | "mlops"
  | "hardware"
  | "math"
  | "safety"
  | "evaluation"
  | "frontier";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  /** One-line hook shown on cards. */
  tagline: string;
}

export interface FlowStep {
  label: string;
  detail?: string;
  /** Small token-like chips rendered under the label, e.g. ["El", "gato", "duerme"]. */
  chips?: string[];
}

export type CustomDiagramId =
  | "embedding-map"
  | "attention"
  | "neural-network"
  | "gradient-descent"
  | "mixture-of-experts"
  | "fit-curves";

export type Diagram =
  | { kind: "flow"; title?: string; caption?: string; steps: FlowStep[] }
  | { kind: "custom"; id: CustomDiagramId; title?: string; caption?: string };

export interface Example {
  title?: string;
  description?: RichText;
  /** Monospace block (vectors, pseudocode, prompts…). */
  code?: string;
  /** Vertical pipeline of short steps. */
  flow?: string[];
  /** Short conversation turns. */
  dialogue?: { role: "user" | "assistant" | "system"; text: string }[];
}

export interface MathBlock {
  formula: string;
  caption?: string;
  symbols: { symbol: string; meaning: string }[];
  explanation?: RichText;
}

export interface Comparison {
  title: string;
  columns: [string, string];
  rows: { aspect: string; a: string; b: string }[];
}

export interface Source {
  title: string;
  url: string;
  authors?: string;
  year?: number;
  kind?: "paper" | "docs" | "book" | "article";
}

export interface GlossaryTerm {
  slug: string;
  /** Industry name, usually in English when that is how it is known. */
  name: string;
  /** Natural Spanish rendering shown under the title (only when useful). */
  spanishName?: string;
  acronym?: string;
  /** Synonyms, translations, alternative spellings — used by search. */
  aliases?: string[];
  category: CategorySlug;
  secondaryCategories?: CategorySlug[];
  difficulty: Difficulty;
  type: TermType;

  /** "En una frase": understandable in under 10 seconds. */
  shortDefinition: string;
  /** "Explícamelo fácil". */
  simpleExplanation: RichText;
  analogy?: RichText;
  inThirtySeconds?: string[];
  diagram?: Diagram;
  example?: Example;
  realExample?: Example;
  mentalModel?: { label: string; meaning: string }[];
  /** "Profundizando". */
  technicalExplanation: RichText;
  math?: MathBlock;
  comparison?: Comparison;
  commonMistakes?: RichText[];
  whyItMatters: RichText;
  useCases: string[];

  prerequisites?: string[];
  relatedTerms?: string[];
  nextTerms?: string[];
  tags?: string[];

  frontier?: boolean;
  sources?: Source[];
  createdAt: string;
  updatedAt: string;
}

/** Authoring shape: dates are optional and filled with defaults. */
export type TermInput = Omit<GlossaryTerm, "createdAt" | "updatedAt"> &
  Partial<Pick<GlossaryTerm, "createdAt" | "updatedAt">>;

/** Lightweight projection shipped to the client for search, cards and lists. */
export interface TermSummary {
  slug: string;
  name: string;
  spanishName?: string;
  acronym?: string;
  shortDefinition: string;
  category: CategorySlug;
  difficulty: Difficulty;
  type: TermType;
  frontier?: boolean;
}

export interface SearchDocument extends TermSummary {
  aliases: string[];
  tags: string[];
  categoryName: string;
  related: string[];
}

export interface LearningPath {
  slug: string;
  title: string;
  question: string;
  description: string;
  difficulty: Difficulty;
  steps: { slug: string; note?: string }[];
}
