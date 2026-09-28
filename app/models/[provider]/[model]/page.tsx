import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedChips } from "@/components/glossary/article-blocks";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ModelListItem } from "@/components/resources/model-row";
import { ExternalLink } from "@/components/resources/resource-header";
import { CheckIcon, CloseIcon, ExternalIcon } from "@/components/ui/icons";
import { getTerms } from "@/lib/glossary";
import {
  describeModel,
  formatDate,
  formatPrice,
  formatTokens,
  getAllModels,
  getModel,
  getProvider,
  listEs,
  modalityName,
  modelPath,
  modelTags,
  modelsSource,
  toRow,
} from "@/lib/models";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllModels().map((m) => {
    const [, provider, model] = modelPath(m).split("/").slice(1);
    return { provider, model };
  });
}

export async function generateMetadata({ params }: PageProps<"/models/[provider]/[model]">): Promise<Metadata> {
  const { provider, model } = await params;
  const m = getModel(provider, model);
  if (!m) return {};
  return {
    title: `${m.name}: contexto, precio y capacidades`,
    description: describeModel(m).slice(0, 2).join(" "),
    alternates: { canonical: modelPath(m) },
  };
}

export default async function ModelPage({ params }: PageProps<"/models/[provider]/[model]">) {
  const { provider: providerSlug, model: modelSlug } = await params;
  const m = getModel(providerSlug, modelSlug);
  if (!m) notFound();
  const provider = getProvider(providerSlug)!;
  const tags = modelTags(toRow(m));
  const siblings = provider.models.filter((x) => x.id !== m.id).slice(0, 5);
  const concepts = getTerms([
    "context-window",
    "token",
    m.capabilities.reasoning ? "reasoning-model" : null,
    m.capabilities.tools ? "tool-calling" : null,
    m.input.some((i) => i !== "text") ? "multimodal-model" : null,
    m.capabilities.structuredOutputs ? "structured-output" : null,
    m.openWeights ? "open-weights-model" : null,
    "api",
  ].filter((s): s is string => Boolean(s)));

  const specs: { label: string; value: string }[] = [
    { label: "Ventana de contexto", value: m.contextLength ? `${formatTokens(m.contextLength)} tokens` : "—" },
    { label: "Salida máxima", value: m.maxOutput ? `${formatTokens(m.maxOutput)} tokens` : "No reportada" },
    { label: "Precio de entrada · 1M tokens", value: formatPrice(m.pricing.input) },
    { label: "Precio de salida · 1M tokens", value: formatPrice(m.pricing.output) },
    { label: "Recibe", value: listEs(m.input.map(modalityName)) },
    { label: "Produce", value: listEs(m.output.map(modalityName)) },
    { label: "En OpenRouter desde", value: formatDate(m.created) },
    ...(m.knowledgeCutoff ? [{ label: "Fecha de corte del conocimiento", value: formatDate(m.knowledgeCutoff) }] : []),
  ];

  const caps: { label: string; on: boolean }[] = [
    { label: "Razonamiento extendido", on: m.capabilities.reasoning },
    { label: "Uso de herramientas", on: m.capabilities.tools },
    { label: "Salidas estructuradas", on: m.capabilities.structuredOutputs },
    { label: "Búsqueda web", on: m.capabilities.webSearch },
    { label: "Pesos abiertos", on: m.openWeights },
    { label: "Variante gratuita", on: m.free },
    { label: "Procesamiento por lotes", on: m.batch },
  ];

  return (
    <div className="theme-resources mx-auto max-w-[860px] px-4 pt-10 sm:px-6 sm:pt-14">
      <Breadcrumbs items={[{ label: "Modelos", href: "/models" }, { label: provider.name, href: `/models/${provider.slug}` }, { label: m.name }]} />

      <header className="mt-8 border-l-2 border-accent pl-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">Ficha de modelo · {provider.name}</p>
        <h1 className="mt-2 text-[36px] font-semibold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[48px]">{m.name}</h1>
        <p className="mt-3 break-all font-mono text-[13.5px] text-faint">{m.id}</p>
        {tags.length ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[12.5px] text-accent-text">{t}</span>
            ))}
          </div>
        ) : null}
      </header>

      {m.expirationDate ? (
        <p role="note" className="mt-8 rounded-xl border border-[color-mix(in_srgb,var(--lvl-3)_35%,var(--border))] bg-[color-mix(in_srgb,var(--lvl-3)_7%,var(--bg))] px-4 py-3 text-[14.5px] text-fg">
          OpenRouter indica que este modelo se retirará de su plataforma el {formatDate(m.expirationDate)}.
        </p>
      ) : null}

      <div className="prose-atlas mt-10">
        {describeModel(m).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <section aria-labelledby="ficha" className="mt-12">
        <h2 id="ficha" className="text-[22px] font-semibold tracking-[-0.02em] text-fg">Ficha técnica</h2>
        <dl className="mt-5 grid overflow-hidden rounded-2xl border border-border sm:grid-cols-2">
          {specs.map((s) => (
            <div key={s.label} className="border-b border-border px-5 py-4 sm:[&:nth-child(odd)]:border-r">
              <dt className="text-[12.5px] text-faint">{s.label}</dt>
              <dd className="mt-1 font-mono text-[15px] text-fg">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="capacidades" className="mt-12">
        <h2 id="capacidades" className="text-[22px] font-semibold tracking-[-0.02em] text-fg">Capacidades</h2>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {caps.map((c) => (
            <li key={c.label} className={`flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-[15px] ${c.on ? "text-fg" : "text-faint"}`}>
              {c.on ? <CheckIcon size={16} className="text-accent" /> : <CloseIcon size={15} />}
              {c.label}
              <span className="sr-only">{c.on ? ": sí" : ": no"}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="enlaces" className="mt-12">
        <h2 id="enlaces" className="text-[22px] font-semibold tracking-[-0.02em] text-fg">Enlaces</h2>
        <ul className="mt-5 space-y-2">
          <li>
            <ExternalLink href={`https://openrouter.ai/${m.id}`} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-[15px] text-fg transition-colors hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]">
              Ver en OpenRouter <ExternalIcon size={14} className="text-faint" />
            </ExternalLink>
          </li>
          {m.huggingFaceId ? (
            <li>
              <ExternalLink href={`https://huggingface.co/${m.huggingFaceId}`} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-[15px] text-fg transition-colors hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]">
                Pesos en Hugging Face <span className="font-mono text-[12.5px] text-faint">{m.huggingFaceId}</span>
              </ExternalLink>
            </li>
          ) : null}
          {provider.website ? (
            <li>
              <ExternalLink href={provider.website} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-[15px] text-fg transition-colors hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]">
                Sitio oficial de {provider.name} <ExternalIcon size={14} className="text-faint" />
              </ExternalLink>
            </li>
          ) : null}
        </ul>
      </section>

      <section aria-labelledby="conceptos" className="mt-12">
        <h2 id="conceptos" className="text-[22px] font-semibold tracking-[-0.02em] text-fg">Conceptos para entender esta ficha</h2>
        <div className="mt-5">
          <RelatedChips terms={concepts} />
        </div>
      </section>

      {siblings.length ? (
        <section aria-labelledby="otros" className="mt-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="otros" className="text-[22px] font-semibold tracking-[-0.02em] text-fg">Más modelos de {provider.name}</h2>
            <Link href={`/models/${provider.slug}`} className="text-[14px] font-medium text-accent-text hover:underline">
              Ver todos ({provider.models.length})
            </Link>
          </div>
          <ul className="mt-5 space-y-3">
            {siblings.map((s) => (
              <li key={s.id}>
                <ModelListItem model={toRow(s)} showProvider={false} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-14 border-t border-border pt-6 text-[13px] text-faint">
        Datos de OpenRouter al {formatDate(modelsSource.fetchedAt)}. Los precios pueden variar según el proveedor que atienda la solicitud.
      </p>
    </div>
  );
}
