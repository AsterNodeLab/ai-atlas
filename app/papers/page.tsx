import type { Metadata } from "next";
import Link from "next/link";
import { ResourceHeader } from "@/components/resources/resource-header";
import { ArrowRightIcon } from "@/components/ui/icons";
import { paperThemes, papers, papersVerifiedAt, type PaperTheme } from "@/content/papers";
import { formatDate } from "@/lib/model-format";

export const metadata: Metadata = {
  title: "Papers de IA explicados en español",
  description: "Los 20 papers que construyeron la IA moderna —del Transformer a DeepSeek-R1, RAG, ReAct y Stable Diffusion— explicados en español: problema, ideas clave, resultados y legado.",
  alternates: { canonical: "/papers" },
};

const themes = Object.keys(paperThemes) as PaperTheme[];

export default function PapersPage() {
  return (
    <div className="theme-resources mx-auto max-w-[1200px] px-4 pt-10 sm:px-6 sm:pt-14">
      <ResourceHeader
        active="papers"
        eyebrow="Recursos · Papers"
        title="Los 20 papers que construyeron la IA moderna."
        description="Del Transformer a los modelos de razonamiento: qué problema resolvió cada paper, sus ideas clave y qué cambió después, explicado en español y con enlace al original."
        meta={
          <>
            <span>{papers.length} papers</span>
            <span>2017–2025</span>
            <span>Datos verificados en arXiv el {formatDate(papersVerifiedAt)}</span>
          </>
        }
      />

      <nav aria-label="Temas" className="mt-8 flex flex-wrap gap-2">
        {themes.map((t) => (
          <a
            key={t}
            href={`#${t}`}
            className="rounded-full border border-border px-3.5 py-1.5 text-[14px] text-muted transition-colors hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] hover:text-fg"
          >
            {paperThemes[t].title}
          </a>
        ))}
      </nav>

      {themes.map((t) => (
        <section key={t} id={t} aria-labelledby={`${t}-title`} className="mt-14 scroll-mt-24">
          <h2 id={`${t}-title`} className="text-[24px] font-semibold tracking-[-0.02em] text-fg sm:text-[28px]">
            {paperThemes[t].title}
          </h2>
          <p className="mt-1.5 max-w-[680px] text-[15.5px] text-muted">{paperThemes[t].subtitle}</p>
          <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {papers
              .filter((p) => p.theme === t)
              .map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/papers/${p.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]"
                  >
                    <span className="flex items-baseline justify-between gap-3 font-mono text-[12px] text-faint">
                      <span>#{String(p.n).padStart(2, "0")}</span>
                      <span>
                        {p.org.split(" · ")[0]} · {p.year}
                      </span>
                    </span>
                    <span className="mt-2 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-fg">{p.title}</span>
                    <span className="mt-1 text-[14px] italic text-muted">{p.titleEs}</span>
                    <span className="mt-3 text-[14.5px] leading-relaxed text-muted">{p.why}</span>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13.5px] font-medium text-accent-text">
                      Leer explicación <ArrowRightIcon size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}

      <aside className="mt-16 rounded-2xl border border-border bg-subtle px-6 py-5 text-[14.5px] leading-relaxed text-muted">
        <p className="font-medium text-fg">Sobre estas explicaciones</p>
        <p className="mt-1.5">
          Cada ficha es una explicación original en español, no una traducción del paper: los textos completos pertenecen a sus autores y se enlazan en su
          versión oficial (arXiv o la editorial). Títulos, autores y fechas se verificaron contra arXiv. Para citar un resultado, consulta siempre el original.
        </p>
      </aside>
    </div>
  );
}
