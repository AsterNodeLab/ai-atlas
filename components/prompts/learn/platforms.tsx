import Link from "next/link";
import { Callout } from "@/components/glossary/article-blocks";
import { RichText } from "@/components/glossary/rich-text";
import { ArrowRightIcon } from "@/components/ui/icons";
import { CodePanel } from "./code-panel";
import { platformComparison, platforms, type Platform } from "./content";
import { Tabs } from "./tabs";
import { Bullets } from "./ui";

function PlatformPanel({ p }: { p: Platform }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-[20px] font-semibold tracking-[-0.02em] text-fg">{p.tagline}</p>
          <Link href={`/models/${p.providerSlug}`} className="group inline-flex items-center gap-1 text-[13.5px] font-medium text-accent-text">
            Modelos de {p.vendor}
            <ArrowRightIcon size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <p className="mt-2 text-[16px] leading-relaxed text-muted">{p.summary}</p>
      </div>

      <CodePanel code={p.template} lang={p.lang} title={`${p.model} · ${p.fileLabel}`} copyWhat={`plantilla para ${p.model}`} />

      <div>
        <h3 className="mb-3 text-[15.5px] font-semibold text-fg">Por qué esta estructura</h3>
        <Bullets items={p.why} />
      </div>

      <Callout label="Error común" tone="warning">
        {p.mistake}
      </Callout>
    </div>
  );
}

function ComparisonTable() {
  return (
    <div role="region" aria-labelledby="comparacion-plataformas" tabIndex={0} className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[620px] border-collapse text-left text-[14.5px]">
        <caption className="sr-only">Comparación de estructuras recomendadas por plataforma</caption>
        <thead className="bg-subtle">
          <tr>
            <th scope="col" className="w-[24%] px-4 py-3 text-[13px] font-medium text-faint">
              Aspecto
            </th>
            {platforms.map((p) => (
              <th key={p.id} scope="col" className="px-4 py-3 font-semibold text-fg">
                {p.family}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {platformComparison.map((row) => (
            <tr key={row.aspect} className="border-t border-border align-top">
              <th scope="row" className="px-4 py-3 text-[13.5px] font-medium text-muted">
                {row.aspect}
              </th>
              {row.values.map((v, i) => (
                <td key={platforms[i].id} className="px-4 py-3 leading-snug text-fg">
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Platforms() {
  return (
    <>
      <RichText text="Los mismos componentes, tres formas de escribirlos. Estas plantillas son **recomendaciones de AI Atlas** basadas en la guía pública de cada proveedor sobre [[prompt-engineering|ingeniería de prompts]]. Úsalas como punto de partida, no como reglas." />

      <div className="mt-8">
        <Tabs
          idPrefix="plataforma"
          label="Plantilla por plataforma"
          items={platforms.map((p) => ({ id: p.id, eyebrow: p.family, label: p.short, panel: <PlatformPanel p={p} /> }))}
        />
      </div>

      <p className="mt-6 text-[13px] leading-relaxed text-faint">
        Los nombres de modelo son perfiles configurables: la estructura aplica a toda la familia, no a una versión concreta. «Gemini 4.8 Flash» no existe
        públicamente; el Flash más reciente es Gemini 3.8 Flash (verificado en el catálogo de OpenRouter el 27 de septiembre de 2026). Los encabezados de las
        plantillas pueden ir en español: lo importante es que sean consistentes.
      </p>

      <h3 id="comparacion-plataformas" className="mt-12 text-[19px] font-semibold tracking-[-0.015em] text-fg sm:text-[20px]">
        Comparación rápida
      </h3>
      <p className="mb-5 mt-2 text-[16px] leading-relaxed text-muted">Qué conviene enfatizar en cada familia. Son tendencias, no reglas absolutas.</p>
      <ComparisonTable />
    </>
  );
}
