import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Callout,
  ComparisonTable,
  DiagramFigure,
  ExampleBlock,
  MathBlock,
  MentalModel,
  NextList,
  OneLiner,
  PrerequisiteList,
  RelatedChips,
  Section,
  SourcesList,
  ThirtySeconds,
  UseCases,
} from "@/components/glossary/article-blocks";
import { MobileToc, ReadingProgress, TableOfContents, TermActions, ViewTracker, type TocItem } from "@/components/glossary/article-client";
import { CategoryBadge, DifficultyBadge, FrontierBadge } from "@/components/glossary/badges";
import { InlineText, RichText } from "@/components/glossary/rich-text";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import {
  categoryName,
  getAllTerms,
  getPathsContaining,
  getRelated,
  getTerm,
  getTerms,
  readingTime,
  stripMarkup,
} from "@/lib/glossary";
import { sectionLabels, typeLabels } from "@/lib/i18n";
import { absoluteUrl, site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTerms().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/glossary/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) return {};
  const display = term.acronym && term.acronym !== term.name ? `${term.name} (${term.acronym})` : term.name;
  const title = `${display} en Inteligencia Artificial`;
  const description = stripMarkup(term.shortDefinition);
  return {
    title,
    description,
    keywords: [term.name, term.acronym, term.spanishName, ...(term.aliases ?? [])].filter((k): k is string => Boolean(k)),
    alternates: { canonical: `/glossary/${term.slug}` },
    openGraph: { type: "article", title: `${title} | ${site.name}`, description, url: `/glossary/${term.slug}`, modifiedTime: term.updatedAt, publishedTime: term.createdAt },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description },
  };
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(site.locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));

export default async function TermPage({ params }: PageProps<"/glossary/[slug]">) {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) notFound();

  const all = getAllTerms();
  const position = all.findIndex((t) => t.slug === term.slug);
  const prev = all[position - 1];
  const next = all[position + 1];
  const prerequisites = getTerms(term.prerequisites);
  const nextTerms = getTerms(term.nextTerms);
  const related = getRelated(term);
  const paths = getPathsContaining(term.slug);
  const minutes = readingTime(term);
  const showAcronym = term.acronym && term.acronym !== term.name;

  const toc: TocItem[] = [
    { id: "en-una-frase", label: sectionLabels.oneLiner },
    { id: "explicame-facil", label: sectionLabels.simple },
    ...(term.inThirtySeconds ? [{ id: "en-30-segundos", label: sectionLabels.thirtySeconds }] : []),
    ...(term.diagram ? [{ id: "como-funciona", label: sectionLabels.howItWorks }] : []),
    ...(term.example ? [{ id: "ejemplo", label: sectionLabels.example }] : []),
    ...(term.realExample ? [{ id: "ejemplo-real", label: sectionLabels.realExample }] : []),
    ...(term.mentalModel ? [{ id: "modelo-mental", label: sectionLabels.mentalModel }] : []),
    { id: "profundizando", label: sectionLabels.technical },
    ...(term.comparison ? [{ id: "comparacion", label: sectionLabels.comparison }] : []),
    ...(term.commonMistakes?.length ? [{ id: "error-comun", label: sectionLabels.mistakes }] : []),
    { id: "por-que-importa", label: sectionLabels.why },
    { id: "donde-se-utiliza", label: sectionLabels.useCases },
    ...(prerequisites.length ? [{ id: "antes-de-aprender", label: sectionLabels.prerequisites }] : []),
    ...(nextTerms.length ? [{ id: "continua-aprendiendo", label: sectionLabels.next }] : []),
    ...(related.length ? [{ id: "relacionados", label: sectionLabels.related }] : []),
    ...(term.sources?.length ? [{ id: "fuentes", label: sectionLabels.sources }] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": absoluteUrl(`/glossary/${term.slug}`),
    name: term.name,
    alternateName: [term.acronym, term.spanishName, ...(term.aliases ?? [])].filter(Boolean),
    description: stripMarkup(term.shortDefinition),
    url: absoluteUrl(`/glossary/${term.slug}`),
    inLanguage: site.locale,
    dateModified: term.updatedAt,
    inDefinedTermSet: { "@type": "DefinedTermSet", name: `${site.name} — ${site.tagline}`, url: absoluteUrl("/glossary") },
  };

  return (
    <>
      <ReadingProgress />
      <ViewTracker slug={term.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-16 xl:gap-24">
          <article className="mx-auto w-full max-w-[720px] lg:mx-0">
            <Breadcrumbs
              items={[
                { label: "Glosario", href: "/glossary" },
                { label: categoryName(term.category), href: `/categories/${term.category}` },
                { label: showAcronym ? term.acronym! : term.name },
              ]}
            />

            <header className="mt-8">
              <h1 className="text-[38px] font-semibold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[48px] lg:text-[54px]">
                {term.name}
                {showAcronym && !term.name.includes(term.acronym!) ? <span className="text-faint"> ({term.acronym})</span> : null}
              </h1>
              {term.spanishName ? <p className="mt-3 text-[19px] text-muted">{term.spanishName}</p> : null}
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
                <CategoryBadge slug={term.category} name={categoryName(term.category)} />
                <DifficultyBadge difficulty={term.difficulty} />
                <span className="text-[13px] text-faint">{typeLabels[term.type]}</span>
                <span className="text-[13px] text-faint">~{minutes} min de lectura</span>
                {term.frontier ? <FrontierBadge /> : null}
              </div>
              <div className="mt-6">
                <TermActions slug={term.slug} />
              </div>
            </header>

            <div className="mt-10">
              <OneLiner term={term} />
              <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[14px] text-muted">
                <span>
                  ¿Demasiado técnico?{" "}
                  <a href="#explicame-facil" className="link-underline text-accent-text">Ver explicación sencilla</a>
                </span>
                <span>
                  ¿Quieres profundizar?{" "}
                  <a href="#profundizando" className="link-underline text-accent-text">Ver explicación técnica</a>
                </span>
              </p>
            </div>

            <div className="mt-8 lg:hidden">
              <MobileToc items={toc} />
            </div>

            <div className="mt-14">
              <Section id="explicame-facil" title={sectionLabels.simple}>
                <RichText text={term.simpleExplanation} from={term.slug} />
                {term.analogy ? (
                  <div className="mt-6">
                    <Callout label="Analogía" tone="accent">
                      <InlineText text={term.analogy} from={term.slug} />
                    </Callout>
                  </div>
                ) : null}
              </Section>

              {term.inThirtySeconds ? (
                <Section id="en-30-segundos" title={sectionLabels.thirtySeconds}>
                  <ThirtySeconds steps={term.inThirtySeconds} />
                </Section>
              ) : null}

              {term.diagram ? (
                <Section id="como-funciona" title={sectionLabels.howItWorks}>
                  <DiagramFigure diagram={term.diagram} />
                </Section>
              ) : null}

              {term.example ? (
                <Section id="ejemplo" title={sectionLabels.example}>
                  <ExampleBlock example={term.example} from={term.slug} />
                </Section>
              ) : null}

              {term.realExample ? (
                <Section id="ejemplo-real" title={sectionLabels.realExample}>
                  <ExampleBlock example={term.realExample} from={term.slug} />
                </Section>
              ) : null}

              {term.mentalModel ? (
                <Section id="modelo-mental" title={sectionLabels.mentalModel}>
                  <MentalModel items={term.mentalModel} />
                </Section>
              ) : null}

              <Section id="profundizando" title={sectionLabels.technical} eyebrow="Nivel técnico">
                <RichText text={term.technicalExplanation} from={term.slug} />
                {term.math ? (
                  <div className="mt-8">
                    <MathBlock math={term.math} from={term.slug} />
                  </div>
                ) : null}
              </Section>

              {term.comparison ? (
                <Section id="comparacion" title={sectionLabels.comparison}>
                  <ComparisonTable comparison={term.comparison} />
                </Section>
              ) : null}

              {term.commonMistakes?.length ? (
                <Section id="error-comun" title={sectionLabels.mistakes}>
                  <div className="space-y-3">
                    {term.commonMistakes.map((m, i) => (
                      <Callout key={i} label="Error común" tone="warning">
                        <InlineText text={m} from={term.slug} />
                      </Callout>
                    ))}
                  </div>
                </Section>
              ) : null}

              <Section id="por-que-importa" title={sectionLabels.why}>
                <RichText text={term.whyItMatters} from={term.slug} />
              </Section>

              <Section id="donde-se-utiliza" title={sectionLabels.useCases}>
                <UseCases items={term.useCases} />
              </Section>

              {prerequisites.length ? (
                <Section id="antes-de-aprender" title={sectionLabels.prerequisites}>
                  <p className="mb-4 text-[15.5px] text-muted">Si alguno te resulta nuevo, empieza por ahí.</p>
                  <PrerequisiteList terms={prerequisites} />
                </Section>
              ) : null}

              {nextTerms.length ? (
                <Section id="continua-aprendiendo" title={sectionLabels.next}>
                  <NextList terms={nextTerms} />
                </Section>
              ) : null}

              {related.length ? (
                <Section id="relacionados" title={sectionLabels.related}>
                  <RelatedChips terms={related} />
                  {paths.length ? (
                    <p className="mt-6 text-[14.5px] text-muted">
                      Aparece en {paths.length === 1 ? "la ruta" : "las rutas"}{" "}
                      {paths.map((p, i) => (
                        <span key={p.slug}>
                          {i > 0 ? (i === paths.length - 1 ? " y " : ", ") : null}
                          <Link href={`/learn/${p.slug}`} className="link-underline text-fg">
                            {p.title}
                          </Link>
                        </span>
                      ))}
                      .
                    </p>
                  ) : null}
                </Section>
              ) : null}

              {term.sources?.length ? (
                <Section id="fuentes" title={sectionLabels.sources}>
                  <SourcesList sources={term.sources} />
                </Section>
              ) : null}
            </div>

            <footer className="mt-16 border-t border-border pt-6">
              <p className="text-[13px] text-faint">Actualizado el {formatDate(term.updatedAt)}</p>
              <nav aria-label="Conceptos adyacentes" className="mt-8 grid gap-3 sm:grid-cols-2">
                {prev ? (
                  <Link href={`/glossary/${prev.slug}`} className="group rounded-xl border border-border px-4 py-3 transition-colors hover:border-border-strong">
                    <span className="flex items-center gap-1.5 text-[12.5px] text-faint"><ArrowLeftIcon size={13} /> Anterior</span>
                    <span className="mt-0.5 block truncate text-[15px] font-medium text-fg">{prev.name}</span>
                  </Link>
                ) : <span />}
                {next ? (
                  <Link href={`/glossary/${next.slug}`} className="group rounded-xl border border-border px-4 py-3 text-right transition-colors hover:border-border-strong">
                    <span className="flex items-center justify-end gap-1.5 text-[12.5px] text-faint">Siguiente <ArrowRightIcon size={13} /></span>
                    <span className="mt-0.5 block truncate text-[15px] font-medium text-fg">{next.name}</span>
                  </Link>
                ) : null}
              </nav>
            </footer>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-8">
              <TableOfContents items={toc} title={showAcronym ? term.acronym! : term.name} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
