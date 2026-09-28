/** Formatting helpers for the model glossary. Pure: safe to import in client components. */

/** Compact projection sent to the client-side model explorer. */
export interface ModelRow {
  id: string;
  /** URL segment (see modelSlugOf). */
  slug: string;
  name: string;
  provider: string;
  providerName: string;
  created: string;
  contextLength: number | null;
  input: string[];
  output: string[];
  priceIn: number | null;
  priceOut: number | null;
  free: boolean;
  openWeights: boolean;
  reasoning: boolean;
  tools: boolean;
  /** Model of a featured provider (used for the default ordering). */
  featured: boolean;
}

// ───────── Formatting (es-MX) ─────────

const modalityNames: Record<string, string> = {
  text: "texto",
  image: "imágenes",
  file: "archivos",
  audio: "audio",
  video: "video",
};

export function modalityName(m: string): string {
  return modalityNames[m] ?? m;
}

export function listEs(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

export function formatTokens(n: number | null): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(n % 1_000_000 ? 2 : 0)} M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} K`;
  return String(n);
}

/** "$0.28 / $0.42", "Gratis" or "Variable". */
export function formatPricePair(input: number | null, output: number | null): string {
  if (input === 0 && output === 0) return "Gratis";
  if (input === null && output === null) return "Variable";
  return `${formatPrice(input)} / ${formatPrice(output)}`;
}

export function formatPrice(n: number | null): string {
  if (n === null) return "Variable";
  if (n === 0) return "Gratis";
  if (n < 0.01) return `$${n.toFixed(4).replace(/0+$/, "")}`;
  return `$${n.toFixed(2)}`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

export function formatMonth(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

/** Short tags for cards. */
export function modelTags(m: Pick<ModelRow, "reasoning" | "tools" | "openWeights" | "free" | "input" | "output" | "contextLength">): string[] {
  const tags: string[] = [];
  if (m.reasoning) tags.push("Razonamiento");
  if (m.input.some((i) => i !== "text")) tags.push("Multimodal");
  if (m.output.includes("image")) tags.push("Genera imágenes");
  if (m.output.includes("audio")) tags.push("Genera audio");
  if (m.openWeights) tags.push("Pesos abiertos");
  if (m.free) tags.push("Versión gratuita");
  if ((m.contextLength ?? 0) >= 1_000_000) tags.push("Contexto ≥ 1M");
  return tags;
}
