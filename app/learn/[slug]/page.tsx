import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DifficultyBadge } from "@/components/glossary/badges";
import { PathSteps } from "@/components/learning/learning-path";
import { StartPathLink } from "@/components/learning/start-path-link";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getLearningPath, getLearningPaths, getTerms, readingTime } from "@/lib/glossary";

export const dynamicParams = false;

export function generateStaticParams() {
  return getLearningPaths().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const path = getLearningPath((await params).slug);
  if (!path) return {};
  return {
    title: `${path.title} — Ruta de aprendizaje`,
    description: path.description,
    alternates: { canonical: `/learn/${path.slug}` },
  };
}

export default async function LearningPathPage({ params }: PageProps<"/learn/[slug]">) {
  const path = getLearningPath((await params).slug);
  if (!path) notFound();
  const terms = getTerms(path.steps.map((s) => s.slug));
  const minutes = terms.reduce((sum, t) => sum + readingTime(t), 0);
  const others = getLearningPaths().filter((p) => p.slug !== path.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-[760px] px-4 pt-10 sm:px-6 sm:pt-14">
      <Breadcrumbs items={[{ label: "Rutas", href: "/learn" }, { label: path.title }]} />
      <header className="mt-8">
        <p className="eyebrow">{path.question}</p>
        <h1 className="mt-3 text-[36px] font-semibold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[48px]">{path.title}</h1>
        <p className="mt-4 text-[18px] leading-relaxed text-muted">{path.description}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-faint">
          <span>{terms.length} conceptos</span>
          <span>~{minutes} min en total</span>
          <DifficultyBadge difficulty={path.difficulty} />
        </div>
        <StartPathLink
          path={path.slug}
          track
          href={`/glossary/${terms[0].slug}`}
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-fg px-5 text-[15px] font-medium text-bg transition-opacity hover:opacity-90"
        >
          Empezar con {terms[0].name} <ArrowRightIcon size={15} />
        </StartPathLink>
      </header>

      <div className="mt-14">
        <PathSteps path={path} terms={terms} />
      </div>

      <section aria-labelledby="otras-rutas" className="mt-16 border-t border-border pt-10">
        <h2 id="otras-rutas" className="text-[20px] font-semibold tracking-tight text-fg">Otras rutas</h2>
        <ul className="mt-4 divide-y divide-border">
          {others.map((p) => (
            <li key={p.slug}>
              <Link href={`/learn/${p.slug}`} className="flex items-center justify-between gap-4 py-3.5 text-[16px] text-fg transition-colors hover:text-accent-text">
                {p.question}
                <ArrowRightIcon size={15} className="shrink-0 text-faint" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
