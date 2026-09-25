import type { Metadata } from "next";
import Link from "next/link";
import { DifficultyDot } from "@/components/glossary/badges";
import { PageHeader } from "@/components/ui/page-header";
import { getAllTerms } from "@/lib/glossary";
import { normalize } from "@/lib/search";

export const metadata: Metadata = {
  title: "Glosario A–Z de Inteligencia Artificial",
  description: "Todos los conceptos de Inteligencia Artificial en orden alfabético: desde algoritmo y token hasta Transformer, RAG y mechanistic interpretability.",
  alternates: { canonical: "/glossary" },
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function GlossaryIndexPage() {
  const terms = getAllTerms();
  const groups = new Map<string, typeof terms>();
  for (const t of terms) {
    const first = normalize(t.name).charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : "#";
    groups.set(letter, [...(groups.get(letter) ?? []), t]);
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6 sm:pt-20">
      <PageHeader
        eyebrow="Glosario"
        title="Todos los conceptos, de la A a la Z"
        description={`${terms.length} conceptos de Inteligencia Artificial explicados en capas: una frase, una explicación sencilla y una técnica.`}
      />

      <nav aria-label="Índice alfabético" className="sticky top-16 z-20 -mx-4 mt-10 border-y border-border bg-bg/85 px-4 py-2 backdrop-blur-md sm:mx-0 sm:rounded-xl sm:border sm:px-2">
        <ul className="no-scrollbar flex gap-0.5 overflow-x-auto sm:flex-wrap sm:justify-between">
          {LETTERS.map((l) => {
            const has = groups.has(l);
            return (
              <li key={l}>
                {has ? (
                  <a href={`#letra-${l}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md font-mono text-[13.5px] text-fg transition-colors hover:bg-subtle">
                    {l}
                  </a>
                ) : (
                  <span aria-disabled="true" className="inline-flex h-8 w-8 items-center justify-center font-mono text-[13.5px] text-border-strong">
                    {l}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6">
        {LETTERS.filter((l) => groups.has(l)).map((letter) => (
          <section key={letter} id={`letra-${letter}`} aria-labelledby={`h-${letter}`} className="scroll-mt-36 border-b border-border py-10 md:grid md:grid-cols-[120px_1fr] md:gap-8">
            <h2 id={`h-${letter}`} className="mb-4 font-mono text-[32px] font-medium leading-none text-faint md:mb-0">
              {letter}
            </h2>
            <ul className="grid gap-x-10 gap-y-1 md:grid-cols-2">
              {groups.get(letter)!.map((t) => (
                <li key={t.slug}>
                  <Link href={`/glossary/${t.slug}`} className="group -mx-3 block rounded-lg px-3 py-2.5 transition-colors hover:bg-subtle">
                    <span className="flex items-center gap-2">
                      <span className="text-[16px] font-medium text-fg">{t.name}</span>
                      {t.acronym && t.acronym !== t.name ? <span className="text-[13px] text-faint">{t.acronym}</span> : null}
                      <DifficultyDot difficulty={t.difficulty} className="ml-auto" />
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-[14px] text-muted">{t.shortDefinition}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
