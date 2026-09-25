"use client";

import Link from "next/link";
import { TermCard } from "@/components/glossary/term-card";
import { useSearchIndex } from "@/components/search/use-search-index";
import { clearRecent, useRecentTerms, useSavedTerms } from "@/lib/storage";
import type { SearchDocument } from "@/types/glossary";

/** Saved concepts + recently viewed, stored locally in this browser. */
export function SavedLibrary() {
  const saved = useSavedTerms();
  const recent = useRecentTerms();
  const { index } = useSearchIndex();
  const bySlug = new Map(index?.map((e) => [e.doc.slug, e.doc]) ?? []);
  const resolve = (slugs: string[]) => slugs.flatMap((s) => (bySlug.has(s) ? [bySlug.get(s) as SearchDocument] : []));

  if (!index) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[168px] animate-pulse rounded-2xl border border-border bg-subtle/60" />
        ))}
      </div>
    );
  }

  const savedDocs = resolve(saved);
  const recentDocs = resolve(recent);

  return (
    <div className="space-y-16">
      <section aria-labelledby="guardados">
        <h2 id="guardados" className="text-[22px] font-semibold tracking-tight text-fg">Guardados</h2>
        {savedDocs.length ? (
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedDocs.map((d) => (
              <li key={d.slug}>
                <TermCard term={d} categoryName={d.categoryName} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border-strong px-6 py-12 text-center">
            <p className="text-[16px] font-medium text-fg">Todavía no guardas ningún concepto.</p>
            <p className="mt-2 text-[15px] text-muted">
              Usa el botón «Guardar» en cualquier concepto para tenerlo a mano aquí. Empieza, por ejemplo, con{" "}
              <Link href="/glossary/transformer" className="link-underline text-fg">Transformer</Link>.
            </p>
          </div>
        )}
      </section>

      {recentDocs.length ? (
        <section aria-labelledby="recientes">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="recientes" className="text-[22px] font-semibold tracking-tight text-fg">Vistos recientemente</h2>
            <button type="button" onClick={clearRecent} className="text-[14px] text-muted hover:text-fg">
              Borrar historial
            </button>
          </div>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentDocs.map((d) => (
              <li key={d.slug}>
                <TermCard term={d} categoryName={d.categoryName} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
