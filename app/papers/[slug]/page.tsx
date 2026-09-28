import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ExternalLink, domainOf } from "@/components/resources/resource-header";
import { ArrowLeftIcon, ArrowRightIcon, ExternalIcon } from "@/components/ui/icons";
import { getPaper, paperThemes, papers } from "@/content/papers";
import { getTerm } from "@/lib/glossary";

export const dynamicParams = false;

export function generateStaticParams() {
  return papers.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/papers/[slug]">): Promise<Metadata> {
  const p = getPaper((await params).slug);
  if (!p) return {};
  return {
    title: `${p.title} (${p.year}), explicado en español`,
    description: p.tldr,
    alternates: { canonical: `/papers/${p.slug}` },
  };
}

const num = (n: number) => String(n).padStart(2, "0");
const cardHover = "hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]";

export default async function PaperPage({ params }: PageProps<"/papers/[slug]">) {
  const p = getPaper((await params).slug);
  if (!p) notFound();
  const concepts = p.concepts.map((slug) => {
    const term = getTerm(slug);
    if (!term) throw new Error(`Paper concept without glossary term: ${slug}`);
    return term;
  });
  const prev = papers.find((x) => x.n === p.n - 1);
  const next = papers.find((x) => x.n === p.n + 1);

  return (
    <div className="theme-resources mx-auto max-w-[860px] px-4 pt-10 sm:px-6 sm:pt-14">
      <Breadcrumbs items={[{ label: "Papers", href: "/papers" }, { label: p.title }]} />

      <header className="mt-8 border-l-2 border-accent pl-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">
          Paper #{num(p.n)} · {paperThemes[p.theme].title}
        </p>
        <h1 className="mt-2 text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-fg sm:text-[42px]">{p.title}</h1>
        <p className="mt-3 text-[18px] italic leading-relaxed text-muted">{p.titleEs}</p>
        <dl className="mt-5 space-y-1 text-[14.5px] text-muted">
          <div>
            <dt className="inline text-faint">Autores: </dt>
            <dd className="inline">{p.authors}</dd>
          </div>
          <div>
            <dt className="inline text-faint">Institución: </dt>
            <dd className="inline">{p.org}</dd>
          </div>
          <div>
            <dt className="inline text-faint">Año: </dt>
            <dd className="inline">
              {p.year}
              {p.arxiv ? ` · arXiv:${p.arxiv}` : ""}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-3 text-[14px]">
          <ExternalLink href={p.url} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 font-medium text-accent-contrast">
            Original en {domainOf(p.url)} <ExternalIcon size={13} />
          </ExternalLink>
          <ExternalLink href={p.pdf} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 font-medium text-fg hover:border-border-strong">
            PDF <ExternalIcon size={13} />
          </ExternalLink>
        </div>
      </header>

      <section aria-label="Resumen" className="mt-10 rounded-2xl border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-accent-soft px-6 py-5">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">En pocas palabras</p>
        <p className="mt-2 text-[17px] leading-relaxed text-fg">{p.tldr}</p>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
          <span className="font-medium text-fg">Por qué importa hoy: </span>
          {p.why}
        </p>
      </section>

      <Section title="El problema">
        <p>{p.problem}</p>
      </Section>

      <Section title="Ideas clave">
        <ol className="space-y-5">
          {p.ideas.map((idea, i) => (
            <li key={idea.title} className="flex gap-4">
              <span aria-hidden="true" className="mt-0.5 font-mono text-[13px] text-accent-text">
                {num(i + 1)}
              </span>
              <div>
                <p className="font-medium text-fg">{idea.title}</p>
                <p className="mt-1">{idea.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Resultados">
        <ul className="list-disc space-y-2 pl-5 marker:text-accent-text">
          {p.results.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Section>

      <Section title="Legado">
        <p>{p.legacy}</p>
      </Section>

      <Section title="Conceptos para leerlo">
        <ul className="flex flex-wrap gap-2">
          {concepts.map((t) => (
            <li key={t.slug}>
              <Link href={`/glossary/${t.slug}`} className={`inline-block rounded-full border border-border px-3 py-1 text-[14px] text-fg transition-colors ${cardHover}`}>
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <nav aria-label="Otros papers" className="mt-14 grid grid-cols-1 gap-3 border-t border-border pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={`/papers/${prev.slug}`} className={`rounded-2xl border border-border p-4 transition-colors ${cardHover}`}>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-faint">
              <ArrowLeftIcon size={12} /> Anterior · #{num(prev.n)}
            </span>
            <span className="mt-1 block text-[15px] font-medium text-fg">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/papers/${next.slug}`} className={`rounded-2xl border border-border p-4 text-right transition-colors ${cardHover}`}>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-faint">
              Siguiente · #{num(next.n)} <ArrowRightIcon size={12} />
            </span>
            <span className="mt-1 block text-[15px] font-medium text-fg">{next.title}</span>
          </Link>
        ) : null}
      </nav>

      <p className="mt-10 text-[13.5px] leading-relaxed text-faint">
        Explicación original en español elaborada por AI Atlas; no es una traducción del paper. El texto completo pertenece a sus autores.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-fg sm:text-[26px]">{title}</h2>
      <div className="mt-4 text-[16.5px] leading-relaxed text-muted">{children}</div>
    </section>
  );
}
