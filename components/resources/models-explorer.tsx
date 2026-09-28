"use client";

import { useMemo, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import type { ModelRow } from "@/lib/model-format";
import { normalize } from "@/lib/search";
import { ModelListItem } from "./model-row";

type Filter = "reasoning" | "openWeights" | "multimodal" | "free" | "imageOut" | "longContext" | "tools";
type Sort = "featured" | "recent" | "context" | "cheap" | "name";

const FILTERS: { key: Filter; label: string; test: (m: ModelRow) => boolean }[] = [
  { key: "reasoning", label: "Razonamiento", test: (m) => m.reasoning },
  { key: "tools", label: "Herramientas", test: (m) => m.tools },
  { key: "openWeights", label: "Pesos abiertos", test: (m) => m.openWeights },
  { key: "multimodal", label: "Multimodal", test: (m) => m.input.some((i) => i !== "text") },
  { key: "imageOut", label: "Genera imágenes", test: (m) => m.output.includes("image") },
  { key: "longContext", label: "Contexto ≥ 1M", test: (m) => (m.contextLength ?? 0) >= 1_000_000 },
  { key: "free", label: "Versión gratuita", test: (m) => m.free },
];

const SORTS: { key: Sort; label: string }[] = [
  { key: "featured", label: "Destacados primero" },
  { key: "recent", label: "Más recientes" },
  { key: "context", label: "Mayor contexto" },
  { key: "cheap", label: "Más económicos" },
  { key: "name", label: "Nombre A–Z" },
];

const PAGE = 40;

/** Searchable, filterable list of every model in the OpenRouter snapshot. */
export function ModelsExplorer({ models, providers }: { models: ModelRow[]; providers: { slug: string; name: string; count: number }[] }) {
  const [q, setQ] = useState("");
  const [provider, setProvider] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sort, setSort] = useState<Sort>("featured");
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    const tests = FILTERS.filter((f) => filters.includes(f.key)).map((f) => f.test);
    const list = models.filter(
      (m) =>
        (!provider || m.provider === provider) &&
        tests.every((t) => t(m)) &&
        (!nq || normalize(`${m.name} ${m.id} ${m.providerName}`).includes(nq)),
    );
    const cost = (m: ModelRow) => (m.priceIn === null || m.priceOut === null ? Infinity : m.priceIn + m.priceOut);
    return list.sort((a, b) => {
      if (sort === "context") return (b.contextLength ?? 0) - (a.contextLength ?? 0);
      if (sort === "cheap") return cost(a) - cost(b);
      if (sort === "name") return a.name.localeCompare(b.name, "es");
      if (sort === "featured" && a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.created.localeCompare(a.created);
    });
  }, [models, q, provider, filters, sort]);

  const reset = () => {
    setQ("");
    setProvider("");
    setFilters([]);
    setLimit(PAGE);
  };
  const toggle = (f: Filter) => {
    setFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
    setLimit(PAGE);
  };
  const chip = (on: boolean) =>
    `inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-3 text-[13.5px] transition-colors ${
      on ? "border-accent bg-accent text-accent-contrast" : "border-border text-muted hover:border-border-strong hover:text-fg"
    }`;
  const active = Boolean(q || provider || filters.length);

  return (
    <div>
      <div className="space-y-4 rounded-2xl border border-border p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-border px-3 focus-within:border-accent">
            <SearchIcon size={15} className="text-faint" />
            <span className="sr-only">Buscar modelo</span>
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(PAGE);
              }}
              placeholder="Buscar modelo (p. ej. “claude”, “llama”, “gemini”)…"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none focus-visible:outline-none placeholder:text-faint"
            />
          </label>
          <label className="sr-only" htmlFor="model-provider">Proveedor</label>
          <select
            id="model-provider"
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setLimit(PAGE);
            }}
            className="h-10 rounded-xl border border-border bg-bg px-3 text-[14.5px] text-fg outline-none focus:border-accent md:w-56"
          >
            <option value="">Todos los proveedores</option>
            {providers.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} ({p.count})
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="model-sort">Ordenar</label>
          <select
            id="model-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-10 rounded-xl border border-border bg-bg px-3 text-[14.5px] text-fg outline-none focus:border-accent md:w-48"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 sm:flex-wrap" role="group" aria-label="Filtrar por capacidad">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" aria-pressed={filters.includes(f.key)} onClick={() => toggle(f.key)} className={chip(filters.includes(f.key))}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-[14px] text-muted">
        <p aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "modelo" : "modelos"}
        </p>
        {active ? (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1 hover:text-fg">
            <CloseIcon size={14} /> Limpiar filtros
          </button>
        ) : null}
      </div>

      {filtered.length ? (
        <ul className="mt-4 space-y-3">
          {filtered.slice(0, limit).map((m) => (
            <li key={m.id}>
              <ModelListItem model={m} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-border-strong px-6 py-16 text-center">
          <p className="text-[17px] font-medium text-fg">Ningún modelo coincide con estos filtros.</p>
          <p className="mt-2 text-[15px] text-muted">Quita algún filtro o prueba con otro nombre.</p>
        </div>
      )}

      {filtered.length > limit ? (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE)}
            className="inline-flex h-10 items-center rounded-xl border border-border px-5 text-[14.5px] text-fg transition-colors hover:border-border-strong hover:bg-subtle"
          >
            Mostrar {Math.min(PAGE, filtered.length - limit)} más · quedan {filtered.length - limit}
          </button>
        </div>
      ) : null}
    </div>
  );
}
