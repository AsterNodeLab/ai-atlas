import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ResourceHeader } from "@/components/resources/resource-header";
import { ModelFieldGuide } from "@/components/resources/model-field-guide";
import { ModelsExplorer } from "@/components/resources/models-explorer";
import { ArrowRightIcon } from "@/components/ui/icons";
import { formatDate, getAllModels, getProviders, modelsSource, toRow } from "@/lib/models";

export const metadata: Metadata = {
  title: "Glosario de modelos de IA",
  description: "Catálogo de más de 300 modelos de IA —GPT, Claude, Gemini, Llama, DeepSeek, Qwen y más— con contexto, precios, modalidades y capacidades, a partir de datos de OpenRouter.",
  alternates: { canonical: "/models" },
};

export default function ModelsPage() {
  const models = getAllModels();
  const providers = getProviders();
  const featured = providers.filter((p) => p.featured);
  const openWeights = models.filter((m) => m.openWeights).length;

  return (
    <div className="theme-resources mx-auto max-w-[1200px] px-4 pt-10 sm:px-6 sm:pt-14">
      <ResourceHeader
        active="models"
        eyebrow="Recursos · Modelos de IA"
        title="Glosario de modelos de IA."
        description="Qué modelos existen, quién los hace y en qué se diferencian: contexto, precio, modalidades y capacidades de cada uno, explicados en español."
        meta={
          <>
            <span>{models.length} modelos</span>
            <span>{providers.length} proveedores</span>
            <span>{openWeights} con pesos abiertos</span>
            <span>
              Datos de{" "}
              <ExternalLink href={modelsSource.url} className="underline decoration-border-strong underline-offset-2 hover:text-fg">
                OpenRouter
              </ExternalLink>{" "}
              · {formatDate(modelsSource.fetchedAt)}
            </span>
          </>
        }
      />

      <div className="mt-12">
        <ModelFieldGuide />
      </div>

      <section aria-labelledby="proveedores" className="mt-16">
        <h2 id="proveedores" className="text-[24px] font-semibold tracking-[-0.02em] text-fg sm:text-[28px]">Principales proveedores</h2>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/models/${p.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[17px] font-semibold tracking-[-0.01em] text-fg">{p.name}</span>
                  <span className="font-mono text-[12px] text-faint">{p.models.length} modelos</span>
                </span>
                <span className="mt-2 line-clamp-3 text-[14.5px] leading-relaxed text-muted">{p.description}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13.5px] font-medium text-accent-text">
                  Ver modelos <ArrowRightIcon size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[14.5px] text-muted">
          Más proveedores:{" "}
          {providers
            .filter((p) => !p.featured)
            .map((p, i) => (
              <span key={p.slug}>
                {i > 0 ? " · " : null}
                <Link href={`/models/${p.slug}`} className="hover:text-fg">
                  {p.name}
                </Link>
              </span>
            ))}
        </p>
      </section>

      <section aria-labelledby="catalogo" className="mt-16">
        <h2 id="catalogo" className="mb-6 text-[24px] font-semibold tracking-[-0.02em] text-fg sm:text-[28px]">Todos los modelos</h2>
        <ModelsExplorer
          models={models.map(toRow)}
          providers={providers.map((p) => ({ slug: p.slug, name: p.name, count: p.models.length }))}
        />
      </section>

      <aside className="mt-16 rounded-2xl border border-border bg-subtle px-6 py-5 text-[14.5px] leading-relaxed text-muted">
        <p className="font-medium text-fg">Sobre estos datos</p>
        <p className="mt-1.5">
          El catálogo se genera a partir de la API pública de modelos de OpenRouter (actualizada el {formatDate(modelsSource.fetchedAt)}). Precios,
          contexto y capacidades corresponden a lo que OpenRouter reporta y pueden variar según el proveedor que atienda la solicitud. Las descripciones
          en español se redactan a partir de esos datos. Las variantes gratuitas y por lotes se agrupan con su modelo base.
        </p>
      </aside>
    </div>
  );
}
