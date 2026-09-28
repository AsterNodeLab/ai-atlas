import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ModelListItem } from "@/components/resources/model-row";
import { ExternalLink, domainOf } from "@/components/resources/resource-header";
import { ExternalIcon } from "@/components/ui/icons";
import { formatTokens, getProvider, getProviders, toRow } from "@/lib/models";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProviders().map((p) => ({ provider: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/models/[provider]">): Promise<Metadata> {
  const p = getProvider((await params).provider);
  if (!p) return {};
  return {
    title: `Modelos de IA de ${p.name}`,
    description: `${p.description} ${p.models.length} modelos con contexto, precios y capacidades.`,
    alternates: { canonical: `/models/${p.slug}` },
  };
}

export default async function ProviderPage({ params }: PageProps<"/models/[provider]">) {
  const p = getProvider((await params).provider);
  if (!p) notFound();
  const maxContext = Math.max(...p.models.map((m) => m.contextLength ?? 0));
  const open = p.models.filter((m) => m.openWeights).length;

  return (
    <div className="theme-resources mx-auto max-w-[1000px] px-4 pt-10 sm:px-6 sm:pt-14">
      <Breadcrumbs items={[{ label: "Modelos", href: "/models" }, { label: p.name }]} />
      <header className="mt-8 border-l-2 border-accent pl-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">Proveedor de modelos</p>
        <h1 className="mt-2 text-[38px] font-semibold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[48px]">{p.name}</h1>
        <p className="mt-4 max-w-[680px] text-[18px] leading-relaxed text-muted">{p.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-muted">
          <span>{p.models.length} modelos</span>
          {maxContext ? <span>Hasta {formatTokens(maxContext)} tokens de contexto</span> : null}
          <span>{open ? `${open} con pesos abiertos` : "Modelos cerrados"}</span>
          {p.website ? (
            <ExternalLink href={p.website} className="inline-flex items-center gap-1 font-medium text-accent-text hover:underline">
              {domainOf(p.website)} <ExternalIcon size={13} />
            </ExternalLink>
          ) : null}
        </div>
      </header>

      <ul className="mt-12 space-y-3">
        {p.models.map((m) => (
          <li key={m.id}>
            <ModelListItem model={toRow(m)} showProvider={false} />
          </li>
        ))}
      </ul>
    </div>
  );
}
