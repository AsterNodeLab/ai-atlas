import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DifficultyDot } from "@/components/glossary/badges";
import { TermCard } from "@/components/glossary/term-card";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { categoryName, getCategories, getCategory, getTermsInCategory, toSummary } from "@/lib/glossary";
import { difficultyLabels, difficultyOrder } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const category = getCategory((await params).slug);
  if (!category) return {};
  return {
    title: `${category.name}: conceptos de IA`,
    description: category.description,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const category = getCategory((await params).slug);
  if (!category) notFound();
  const terms = getTermsInCategory(category.slug);
  const others = getCategories().filter((c) => c.slug !== category.slug);

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6 sm:pt-14">
      <Breadcrumbs items={[{ label: "Categorías", href: "/categories" }, { label: category.name }]} />
      <header className="mt-8 max-w-[760px]">
        <h1 className="text-[38px] font-semibold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[52px]">{category.name}</h1>
        <p className="mt-4 text-[19px] leading-relaxed text-muted">{category.description}</p>
        <p className="mt-4 text-[14px] text-faint">{terms.length} conceptos</p>
      </header>

      {difficultyOrder.map((d) => {
        const group = terms.filter((t) => t.difficulty === d);
        if (!group.length) return null;
        return (
          <section key={d} aria-labelledby={`nivel-${d}`} className="mt-14">
            <div className="mb-5 flex items-baseline gap-3">
              <h2 id={`nivel-${d}`} className="flex items-center gap-2 text-[20px] font-semibold tracking-tight text-fg">
                <DifficultyDot difficulty={d} className="!h-2 !w-2" />
                {difficultyLabels[d].label}
              </h2>
              <span className="text-[13.5px] text-faint">Nivel {difficultyLabels[d].level}</span>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((t) => (
                <li key={t.slug}>
                  <TermCard term={toSummary(t)} categoryName={t.category !== category.slug ? categoryName(t.category) : undefined} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <nav aria-label="Otras categorías" className="mt-20 border-t border-border pt-8">
        <p className="eyebrow">Otras categorías</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {others.map((c) => (
            <li key={c.slug}>
              <Link href={`/categories/${c.slug}`} className="inline-block rounded-full border border-border px-3.5 py-1.5 text-[14px] text-muted transition-colors hover:border-border-strong hover:text-fg">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
