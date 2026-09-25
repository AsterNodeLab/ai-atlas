"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DifficultyDot } from "@/components/glossary/badges";
import { TermCard } from "@/components/glossary/term-card";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { difficultyLabels, difficultyOrder, typeLabels } from "@/lib/i18n";
import { normalize } from "@/lib/search";
import type { Category, Difficulty, TermSummary, TermType } from "@/types/glossary";

const TYPES = Object.keys(typeLabels) as TermType[];

/** Filterable grid of every concept. Filter state lives in the URL (shareable). */
export function Explorer({ terms, categories }: { terms: TermSummary[]; categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const nivelParam = params.get("nivel");
  const tipoParam = params.get("tipo");
  const levels = useMemo(() => nivelParam?.split(",").filter((l): l is Difficulty => difficultyOrder.includes(l as Difficulty)) ?? [], [nivelParam]);
  const types = useMemo(() => tipoParam?.split(",").filter((t): t is TermType => TYPES.includes(t as TermType)) ?? [], [tipoParam]);
  const category = params.get("categoria") ?? "";
  const [q, setQ] = useState(() => params.get("q") ?? "");
  const frontierOnly = params.get("frontier") === "1";

  const categoryNames = useMemo(() => new Map(categories.map((c) => [c.slug, c.name])), [categories]);

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggle<T extends string>(key: string, list: T[], value: T) {
    const nextList = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    update({ [key]: nextList.join(",") || null });
  }

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return terms
      .filter((t) => (levels.length ? levels.includes(t.difficulty) : true))
      .filter((t) => (types.length ? types.includes(t.type) : true))
      .filter((t) => (category ? t.category === category : true))
      .filter((t) => (frontierOnly ? t.frontier : true))
      .filter((t) => (nq ? normalize(`${t.name} ${t.acronym ?? ""} ${t.spanishName ?? ""} ${t.shortDefinition}`).includes(nq) : true))
      .sort((a, b) => difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty) || a.name.localeCompare(b.name, "es"));
  }, [terms, levels, types, category, frontierOnly, q]);

  const active = levels.length + types.length + (category ? 1 : 0) + (q ? 1 : 0) + (frontierOnly ? 1 : 0);
  const chip = (on: boolean) =>
    `inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[13.5px] transition-colors ${
      on ? "border-fg bg-fg text-bg" : "border-border text-muted hover:border-border-strong hover:text-fg"
    }`;

  return (
    <div>
      <div className="space-y-5 rounded-2xl border border-border p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-border px-3 focus-within:border-accent">
            <SearchIcon size={15} className="text-faint" />
            <span className="sr-only">Filtrar por texto</span>
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                update({ q: e.target.value || null });
              }}
              placeholder="Filtrar conceptos…"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-faint"
            />
          </label>
          <label className="sr-only" htmlFor="categoria">Categoría</label>
          <select
            id="categoria"
            value={category}
            onChange={(e) => update({ categoria: e.target.value || null })}
            className="h-10 rounded-xl border border-border bg-bg px-3 text-[14.5px] text-fg outline-none focus:border-accent sm:w-60"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <fieldset className="min-w-0">
          <legend className="eyebrow mb-2">Nivel</legend>
          <div className="flex flex-wrap gap-2">
            {difficultyOrder.map((d) => (
              <button key={d} type="button" aria-pressed={levels.includes(d)} onClick={() => toggle("nivel", levels, d)} className={chip(levels.includes(d))}>
                <DifficultyDot difficulty={d} />
                {difficultyLabels[d].short}
              </button>
            ))}
            <button type="button" aria-pressed={frontierOnly} onClick={() => update({ frontier: frontierOnly ? null : "1" })} className={chip(frontierOnly)}>
              Solo Frontier
            </button>
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="eyebrow mb-2">Tipo</legend>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 sm:flex-wrap">
            {TYPES.map((t) => (
              <button key={t} type="button" aria-pressed={types.includes(t)} onClick={() => toggle("tipo", types, t)} className={chip(types.includes(t))}>
                {typeLabels[t]}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-[14px] text-muted" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "concepto" : "conceptos"}
        </p>
        {active ? (
          <button type="button" onClick={() => {
              setQ("");
              router.replace(pathname, { scroll: false });
            }} className="inline-flex items-center gap-1 text-[14px] text-muted hover:text-fg">
            <CloseIcon size={14} /> Limpiar filtros
          </button>
        ) : null}
      </div>

      {filtered.length ? (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <li key={t.slug}>
              <TermCard term={t} categoryName={categoryNames.get(t.category)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-border-strong px-6 py-16 text-center">
          <p className="text-[17px] font-medium text-fg">Ningún concepto coincide con estos filtros.</p>
          <p className="mt-2 text-[15px] text-muted">Quita alguno de los filtros para ver más resultados.</p>
        </div>
      )}
    </div>
  );
}

export function ExplorerSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="h-[196px] animate-pulse rounded-2xl border border-border bg-subtle" />
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="h-[168px] animate-pulse rounded-2xl border border-border bg-subtle/60" />
        ))}
      </div>
    </div>
  );
}
