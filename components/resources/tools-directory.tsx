"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CloseIcon, ExternalIcon, SearchIcon } from "@/components/ui/icons";
import { normalize } from "@/lib/search";
import { toolCategories, toolLevels, type Tool, type ToolCategory, type ToolLevel } from "@/content/tools";

const levelDot: Record<ToolLevel, string> = { 1: "bg-lvl-1", 2: "bg-lvl-2", 3: "bg-lvl-3", 4: "bg-lvl-4" };

function domainOf(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

/** Filterable directory of official AI tool links, grouped by level. */
export function ToolsDirectory({ tools, conceptNames }: { tools: Tool[]; conceptNames: Record<string, string> }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<ToolCategory | null>(null);
  const [openSourceOnly, setOpenSourceOnly] = useState(false);

  const usedCategories = useMemo(() => (Object.keys(toolCategories) as ToolCategory[]).filter((c) => tools.some((t) => t.category === c)), [tools]);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return tools.filter(
      (t) =>
        (!category || t.category === category) &&
        (!openSourceOnly || t.openSource) &&
        (!nq || normalize(`${t.name} ${t.maker} ${t.description} ${toolCategories[t.category]}`).includes(nq)),
    );
  }, [tools, q, category, openSourceOnly]);

  const chip = (on: boolean) =>
    `inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-3 text-[13.5px] transition-colors ${
      on ? "border-accent bg-accent text-accent-contrast" : "border-border text-muted hover:border-border-strong hover:text-fg"
    }`;
  const active = Boolean(q || category || openSourceOnly);

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 focus-within:border-accent md:w-72">
            <SearchIcon size={15} className="text-faint" />
            <span className="sr-only">Buscar herramienta</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar herramienta…"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none focus-visible:outline-none placeholder:text-faint"
            />
          </label>
          <div className="no-scrollbar -mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1" role="group" aria-label="Filtrar por categoría">
            <button type="button" aria-pressed={!category} onClick={() => setCategory(null)} className={chip(!category)}>
              Todas
            </button>
            {usedCategories.map((c) => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(category === c ? null : c)} className={chip(category === c)}>
                {toolCategories[c]}
              </button>
            ))}
            <button type="button" aria-pressed={openSourceOnly} onClick={() => setOpenSourceOnly((v) => !v)} className={chip(openSourceOnly)}>
              Código abierto
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[14px] text-muted">
        <p aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "herramienta" : "herramientas"}
        </p>
        {active ? (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCategory(null);
              setOpenSourceOnly(false);
            }}
            className="inline-flex items-center gap-1 hover:text-fg"
          >
            <CloseIcon size={14} /> Limpiar filtros
          </button>
        ) : null}
      </div>

      {([1, 2, 3, 4] as ToolLevel[]).map((level) => {
        const group = filtered.filter((t) => t.level === level);
        if (!group.length) return null;
        return (
          <section key={level} id={`nivel-${level}`} aria-labelledby={`tools-level-${level}`} className="scroll-mt-40 pt-14">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border pb-4">
              <span className="inline-flex items-center gap-2 font-mono text-[12.5px] text-faint">
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${levelDot[level]}`} />
                Nivel {level}
              </span>
              <h2 id={`tools-level-${level}`} className="text-[24px] font-semibold tracking-[-0.02em] text-fg">
                {toolLevels[level].title}
              </h2>
              <p className="w-full text-[15.5px] text-muted sm:w-auto sm:flex-1">{toolLevels[level].subtitle}</p>
            </div>
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((t) => (
                <li key={t.slug}>
                  <ToolCard tool={t} conceptNames={conceptNames} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {!filtered.length ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border-strong px-6 py-16 text-center">
          <p className="text-[17px] font-medium text-fg">Ninguna herramienta coincide con estos filtros.</p>
          <p className="mt-2 text-[15px] text-muted">Prueba con otra categoría o borra la búsqueda.</p>
        </div>
      ) : null}
    </div>
  );
}

function ToolCard({ tool, conceptNames }: { tool: Tool; conceptNames: Record<string, string> }) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-fg">
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 after:rounded-2xl after:content-['']">
              {tool.name}
              <span className="sr-only"> — sitio oficial (se abre en una pestaña nueva)</span>
            </a>
          </h3>
          <p className="mt-0.5 text-[13px] text-faint">{tool.maker}</p>
        </div>
        <ExternalIcon size={15} className="mt-1 shrink-0 text-faint transition-colors group-hover:text-accent-text" />
      </div>
      <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{tool.description}</p>
      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-accent-soft px-1.5 py-0.5 font-mono text-[11.5px] text-accent-text">{domainOf(tool.url)}</span>
          <span className="text-[12px] text-faint">{toolCategories[tool.category]}</span>
          {tool.openSource ? <span className="rounded-full border border-border px-2 py-0.5 text-[11.5px] text-muted">Código abierto</span> : null}
        </div>
        {tool.concepts?.length ? (
          <p className="relative z-10 mt-3 text-[12.5px] text-faint">
            Entiende:{" "}
            {tool.concepts.map((c, i) => (
              <span key={c}>
                {i > 0 ? ", " : null}
                <Link href={`/glossary/${c}`} className="text-muted underline decoration-border-strong underline-offset-2 hover:text-fg">
                  {conceptNames[c] ?? c}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </article>
  );
}
