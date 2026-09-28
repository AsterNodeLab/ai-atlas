import type { Metadata } from "next";
import { ResourceHeader } from "@/components/resources/resource-header";
import { ToolsDirectory } from "@/components/resources/tools-directory";
import { tools, toolLevels, toolsVerifiedAt, type ToolLevel } from "@/content/tools";
import { getTerm } from "@/lib/glossary";
import { formatDate } from "@/lib/model-format";

export const metadata: Metadata = {
  title: "Herramientas de IA: enlaces oficiales",
  description: "Directorio curado de herramientas de Inteligencia Artificial con sus enlaces oficiales verificados, de asistentes para principiantes a APIs, frameworks y MLOps.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  const conceptNames = Object.fromEntries(
    [...new Set(tools.flatMap((t) => t.concepts ?? []))].map((slug) => {
      const term = getTerm(slug);
      if (!term) throw new Error(`Tool concept without glossary term: ${slug}`);
      return [slug, term.acronym && term.acronym !== term.name ? term.acronym : term.name];
    }),
  );

  return (
    <div className="theme-resources mx-auto max-w-[1200px] px-4 pt-10 sm:px-6 sm:pt-14">
      <ResourceHeader
        active="tools"
        eyebrow="Recursos · Herramientas de IA"
        title="Las herramientas, con sus enlaces oficiales."
        description="Una selección de herramientas de IA confiables, ordenadas de las más sencillas a las más avanzadas. Solo sitios oficiales: sin afiliados ni intermediarios."
        meta={
          <>
            <span>{tools.length} herramientas</span>
            <span>Enlaces verificados el {formatDate(toolsVerifiedAt)}</span>
            <span>Se abren en una pestaña nueva ↗</span>
          </>
        }
      />

      <nav aria-label="Niveles" className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([1, 2, 3, 4] as ToolLevel[]).map((l) => (
          <a key={l} href={`#nivel-${l}`} className="rounded-2xl border border-border px-4 py-3 transition-colors hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]">
            <span className="font-mono text-[12px] text-faint">Nivel {l}</span>
            <span className="mt-0.5 block text-[15.5px] font-medium text-fg">{toolLevels[l].title}</span>
          </a>
        ))}
      </nav>

      <div className="mt-10">
        <ToolsDirectory tools={tools} conceptNames={conceptNames} />
      </div>

      <aside className="mt-16 rounded-2xl border border-border bg-subtle px-6 py-5 text-[14.5px] leading-relaxed text-muted">
        <p className="font-medium text-fg">Cómo elegimos estas herramientas</p>
        <p className="mt-1.5">
          Incluimos herramientas ampliamente usadas, activamente mantenidas y de creadores identificables. Cada enlace apunta al sitio oficial y se
          verificó manualmente. Las herramientas cambian rápido: si un enlace deja de funcionar, es probable que el producto haya cambiado de nombre o de dirección.
        </p>
      </aside>
    </div>
  );
}
