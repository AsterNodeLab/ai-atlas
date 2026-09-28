#!/usr/bin/env node
/**
 * Refreshes the model glossary snapshot from OpenRouter's public models API.
 *
 *   npm run models:sync
 *
 * Only structured facts are stored (ids, dates, context, pricing, modalities,
 * capabilities). Provider-written descriptions are intentionally NOT copied:
 * the site writes its own Spanish summaries from these facts (lib/models.ts).
 */
import { writeFile } from "node:fs/promises";

const SOURCE = "https://openrouter.ai/api/v1/models";
const OUT = new URL("../content/models/openrouter.json", import.meta.url);

const res = await fetch(SOURCE, { headers: { accept: "application/json" } });
if (!res.ok) throw new Error(`OpenRouter API responded ${res.status}`);
const { data } = await res.json();
if (!Array.isArray(data) || data.length === 0) throw new Error("OpenRouter API returned no models");

/** USD per token (string) → USD per 1M tokens, or null when variable/unknown. */
const perMillion = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 1e6 * 10000) / 10000;
};

// Group ":free" / ":batch" variants under their base model.
const groups = new Map();
for (const m of data) {
  if (m.id.startsWith("~") || m.id.startsWith("openrouter/")) continue; // aliases and routers, not models
  if (m.architecture?.tokenizer === "Router") continue; // third-party routers
  const [base, variant] = m.id.split(":");
  const g = groups.get(base) ?? { base: null, variants: [] };
  if (variant) g.variants.push({ variant, model: m });
  else g.base = m;
  groups.set(base, g);
}

const models = [];
for (const [id, { base, variants }] of groups) {
  const m = base ?? variants[0].model;
  const params = new Set(m.supported_parameters ?? []);
  const [providerLabel, ...rest] = String(m.name).split(": ");
  const name = (rest.length ? rest.join(": ") : providerLabel).replace(/\s*\((free|batch)\)$/i, "");
  models.push({
    id,
    provider: id.split("/")[0],
    providerLabel: rest.length ? providerLabel : null,
    name,
    created: new Date(m.created * 1000).toISOString().slice(0, 10),
    contextLength: m.context_length ?? null,
    maxOutput: m.top_provider?.max_completion_tokens ?? null,
    input: [...(m.architecture?.input_modalities ?? ["text"])].sort(),
    output: [...(m.architecture?.output_modalities ?? ["text"])].sort(),
    pricing: {
      input: base ? perMillion(m.pricing?.prompt) : 0,
      output: base ? perMillion(m.pricing?.completion) : 0,
    },
    free: variants.some((v) => v.variant === "free") || (perMillion(m.pricing?.prompt) === 0 && perMillion(m.pricing?.completion) === 0),
    batch: variants.some((v) => v.variant === "batch"),
    openWeights: Boolean(m.hugging_face_id),
    huggingFaceId: m.hugging_face_id || null,
    capabilities: {
      tools: params.has("tools"),
      reasoning: params.has("reasoning") || params.has("include_reasoning"),
      structuredOutputs: params.has("structured_outputs") || params.has("response_format"),
      webSearch: params.has("web_search_options"),
    },
    knowledgeCutoff: m.knowledge_cutoff || null,
    expirationDate: m.expiration_date || null,
  });
}

models.sort((a, b) => b.created.localeCompare(a.created) || a.id.localeCompare(b.id));

const snapshot = {
  source: SOURCE,
  fetchedAt: new Date().toISOString().slice(0, 10),
  count: models.length,
  models,
};

await writeFile(OUT, `${JSON.stringify(snapshot, null, 1)}\n`);
console.log(`Saved ${models.length} models (from ${data.length} API entries) → content/models/openrouter.json`);
