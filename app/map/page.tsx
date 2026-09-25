import type { Metadata } from "next";
import Link from "next/link";
import { DifficultyBadge, DifficultyDot } from "@/components/glossary/badges";
import { KnowledgeGraph } from "@/components/map/knowledge-graph";
import { PageHeader } from "@/components/ui/page-header";
import { difficultyLabels, difficultyOrder } from "@/lib/i18n";
import { getMapData } from "@/lib/map";

export const metadata: Metadata = {
  title: "Mapa de Inteligencia Artificial",
  description: "Un mapa visual de cómo se conectan los conceptos de la IA: de machine learning a Transformers, LLMs, RAG y agentes.",
  alternates: { canonical: "/map" },
};

export default function MapPage() {
  const { nodes, edges, curved, layers } = getMapData();
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6 sm:pt-20">
      <PageHeader
        eyebrow="Mapa de IA"
        title="Cómo se conectan las ideas"
        description="La IA moderna es una cadena de ideas que se apoyan unas en otras. Sigue las líneas de arriba hacia abajo: cada concepto se construye sobre el anterior."
      />
      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted" aria-label="Leyenda de niveles">
        {difficultyOrder.map((d) => (
          <span key={d} className="inline-flex items-center gap-1.5">
            <DifficultyDot difficulty={d} /> {difficultyLabels[d].label}
          </span>
        ))}
      </div>
      <div className="mt-8">
        <KnowledgeGraph nodes={nodes} edges={edges} curved={curved} />
      </div>
      <p className="mt-3 text-[13px] text-faint md:hidden">Desliza horizontalmente para recorrer el mapa, o usa la lista de abajo.</p>

      <section aria-labelledby="map-list" className="mt-20">
        <h2 id="map-list" className="text-[24px] font-semibold tracking-[-0.02em] text-fg">El mapa como lista</h2>
        <p className="mt-2 max-w-2xl text-[16px] text-muted">Los mismos conceptos, agrupados por capa, en orden de lectura.</p>
        <div className="mt-8 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {layers.map((l) => (
            <div key={l.layer}>
              <h3 className="eyebrow">{l.layer}</h3>
              <ul className="mt-3 divide-y divide-border border-y border-border">
                {l.terms.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/glossary/${t.slug}`} className="flex items-center justify-between gap-3 py-3 text-[15.5px] text-fg transition-colors hover:text-accent-text">
                      {t.name}
                      <DifficultyBadge difficulty={t.difficulty} short />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
