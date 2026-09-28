import snapshot from "@/content/models/openrouter.json";
import { otherProvidersDescription, providers, type ProviderInfo } from "@/content/models/providers";
import { formatMonth, formatTokens, listEs, modalityName, type ModelRow } from "@/lib/model-format";

export * from "@/lib/model-format";

/** One model from the OpenRouter snapshot (see scripts/sync-models.mjs). */
export interface AIModel {
  id: string;
  provider: string;
  providerLabel: string | null;
  name: string;
  created: string;
  contextLength: number | null;
  maxOutput: number | null;
  input: string[];
  output: string[];
  pricing: { input: number | null; output: number | null };
  free: boolean;
  batch: boolean;
  openWeights: boolean;
  huggingFaceId: string | null;
  capabilities: { tools: boolean; reasoning: boolean; structuredOutputs: boolean; webSearch: boolean };
  knowledgeCutoff: string | null;
  expirationDate: string | null;
}

export interface ResolvedProvider extends ProviderInfo {
  models: AIModel[];
}

const models = snapshot.models as AIModel[];

{
  // Fail the build if two models would share a URL.
  const seen = new Set<string>();
  for (const m of models) {
    const key = `${m.provider}/${m.id.split("/")[1].replaceAll(".", "-")}`;
    if (seen.has(key)) throw new Error(`Duplicate model URL: ${key}`);
    seen.add(key);
  }
}
export const modelsSource = { url: "https://openrouter.ai/models", api: snapshot.source, fetchedAt: snapshot.fetchedAt };

const providerBySlug = new Map<string, ProviderInfo>();
for (const p of providers) {
  providerBySlug.set(p.slug, p);
  for (const a of p.aliases ?? []) providerBySlug.set(a, p);
}

/** Canonical provider slug (merges aliases such as meta → meta-llama). */
export function providerSlugOf(m: AIModel): string {
  return providerBySlug.get(m.provider)?.slug ?? m.provider;
}

function fallbackProvider(slug: string, label: string | null): ProviderInfo {
  return { slug, name: label || slug, description: otherProvidersDescription };
}

let resolved: ResolvedProvider[] | null = null;

/** Providers with their models: featured first, then by number of models. */
export function getProviders(): ResolvedProvider[] {
  if (resolved) return resolved;
  const map = new Map<string, ResolvedProvider>();
  for (const m of models) {
    const slug = providerSlugOf(m);
    const info = providerBySlug.get(m.provider) ?? fallbackProvider(slug, m.providerLabel);
    const entry = map.get(slug) ?? { ...info, models: [] };
    entry.models.push(m);
    map.set(slug, entry);
  }
  const order = new Map(providers.map((p, i) => [p.slug, i]));
  resolved = [...map.values()].sort((a, b) => {
    const fa = a.featured ? 0 : 1;
    const fb = b.featured ? 0 : 1;
    if (fa !== fb) return fa - fb;
    const oa = order.get(a.slug) ?? 999;
    const ob = order.get(b.slug) ?? 999;
    if (oa !== ob) return oa - ob;
    return b.models.length - a.models.length || a.name.localeCompare(b.name);
  });
  return resolved;
}

export function getProvider(slug: string): ResolvedProvider | undefined {
  return getProviders().find((p) => p.slug === slug);
}

export function getAllModels(): AIModel[] {
  return models;
}

/**
 * URL segment for a model: the part after "/" with dots replaced, because
 * dotted segments ("claude-opus-5.5") look like files to static hosts.
 */
export function modelSlugOf(m: AIModel): string {
  return m.id.split("/")[1].replaceAll(".", "-");
}

/** Route: /models/[provider]/[model] where provider is the canonical slug. */
export function modelPath(m: AIModel): string {
  return `/models/${providerSlugOf(m)}/${modelSlugOf(m)}`;
}

export function getModel(providerSlug: string, modelSlug: string): AIModel | undefined {
  return models.find((m) => providerSlugOf(m) === providerSlug && modelSlugOf(m) === modelSlug);
}

export function toRow(m: AIModel): ModelRow {
  const provider = providerSlugOf(m);
  return {
    id: m.id,
    slug: modelSlugOf(m),
    name: m.name,
    provider,
    providerName: getProvider(provider)?.name ?? provider,
    created: m.created,
    contextLength: m.contextLength,
    input: m.input,
    output: m.output,
    priceIn: m.pricing.input,
    priceOut: m.pricing.output,
    free: m.free,
    openWeights: m.openWeights,
    reasoning: m.capabilities.reasoning,
    tools: m.capabilities.tools,
    featured: Boolean(getProvider(provider)?.featured),
  };
}

/**
 * Original Spanish summary built only from structured facts —
 * never from provider-written marketing text.
 */
export function describeModel(m: AIModel): string[] {
  const provider = getProvider(providerSlugOf(m))?.name ?? m.providerLabel ?? m.provider;
  const inputs = m.input.map(modalityName);
  const outputs = m.output.map(modalityName);
  const caps = [
    m.capabilities.reasoning && "razonamiento extendido",
    m.capabilities.tools && "uso de herramientas",
    m.capabilities.structuredOutputs && "salidas estructuradas",
    m.capabilities.webSearch && "búsqueda web",
  ].filter((c): c is string => Boolean(c));

  const first = `${m.name} es un modelo de ${provider} disponible en OpenRouter desde ${formatMonth(m.created)}. Recibe ${listEs(inputs)} y produce ${listEs(outputs)}.`;
  const second = [
    m.contextLength ? `Su ventana de contexto es de ${formatTokens(m.contextLength)} tokens` : null,
    caps.length ? `admite ${listEs(caps)}` : null,
  ]
    .filter(Boolean)
    .join(" y ");
  const third = m.openWeights
    ? "Sus pesos son abiertos: el modelo se puede descargar, ajustar y ejecutar fuera de la API del proveedor."
    : "Es un modelo cerrado: se usa a través de la API de su proveedor o de intermediarios como OpenRouter.";
  return [first, second ? `${second}.` : "", third].filter(Boolean);
}

