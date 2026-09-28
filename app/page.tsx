import Link from "next/link";
import { DifficultyDot } from "@/components/glossary/badges";
import { CategoryGrid } from "@/components/glossary/category-grid";
import { RandomTermLink } from "@/components/glossary/random-term";
import { TermCard } from "@/components/glossary/term-card";
import { SectionHeading } from "@/components/home/section-heading";
import { TermOfTheDay } from "@/components/home/term-of-the-day";
import { KnowledgeGraph } from "@/components/map/knowledge-graph";
import { SearchPanel } from "@/components/search/search-panel";
import { ArrowRightIcon } from "@/components/ui/icons";
import {
  categoryName,
  featuredSlugs,
  featuredTaglines,
  getAllTerms,
  getCategories,
  getFrontierTerms,
  getLearningPaths,
  getTerm,
  getTermsByDifficulty,
  getTermsInCategory,
  toSummary,
} from "@/lib/glossary";
import { difficultyLabels, difficultyOrder } from "@/lib/i18n";
import { getMapData } from "@/lib/map";
import { getAllModels, getProviders } from "@/lib/models";
import { papers } from "@/content/papers";
import { tools } from "@/content/tools";
import { absoluteUrl, site } from "@/lib/site";

const DAY = 86_400_000;

export default function HomePage() {
  const all = getAllTerms();
  const featured = featuredSlugs.map((s) => getTerm(s)!);
  const categories = getCategories();
  const counts = Object.fromEntries(categories.map((c) => [c.slug, getTermsInCategory(c.slug).length]));
  const paths = getLearningPaths();
  const frontier = getFrontierTerms().slice(0, 6);
  const { nodes, edges, curved } = getMapData();
  // Term of the day: concepts with rich content (diagram, 30-second summary or sources).
  const candidates = all.filter((t) => t.diagram || t.inThirtySeconds || t.sources?.length).map(toSummary);
  const buildIndex = Math.floor(Date.parse(site.contentDate) / DAY) % candidates.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: site.locale,
    description: site.description,
    hasPart: { "@type": "DefinedTermSet", name: site.tagline, url: absoluteUrl("/glossary") },
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section aria-labelledby="hero-title" className="mx-auto max-w-[820px] pb-20 pt-16 text-center sm:pb-28 sm:pt-28">
        <h1 id="hero-title" className="text-[40px] font-semibold leading-[1.04] tracking-[-0.045em] text-fg sm:text-[56px] lg:text-[70px]">
          Inteligencia Artificial,
          <br />
          <span className="text-faint">explicada para humanos.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[600px] text-[18px] leading-relaxed text-muted sm:text-[20px]">
          Desde qué es un token hasta cómo funciona un Transformer. Un glosario visual para aprender IA desde cero, a tu ritmo.
        </p>
        <div className="mx-auto mt-10 max-w-[620px]">
          <SearchPanel variant="hero" placeholder="Busca “Transformer”, “RAG”, “Agentes”, “Embeddings”…" />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14.5px]">
          <Link href="/learn/como-funciona-chatgpt" className="group inline-flex items-center gap-1.5 font-medium text-fg">
            Empieza desde cero <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/explore" className="text-muted transition-colors hover:text-fg">
            Explora {all.length} conceptos
          </Link>
          <RandomTermLink slugs={all.map((t) => t.slug)} withIcon className="text-muted transition-colors hover:text-fg" />
        </div>
      </section>

      {/* Popular concepts */}
      <section aria-labelledby="populares" className="py-12">
        <SectionHeading id="populares" eyebrow="Conceptos populares" title="Las ideas que más se buscan" href="/glossary" linkLabel="Ver glosario completo" />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((t) => (
            <li key={t.slug}>
              <TermCard term={toSummary(t)} categoryName={categoryName(t.category)} description={featuredTaglines[t.slug as keyof typeof featuredTaglines]} />
            </li>
          ))}
        </ul>
      </section>

      {/* Questions */}
      <section aria-labelledby="preguntas" className="py-16">
        <SectionHeading id="preguntas" eyebrow="Rutas de aprendizaje" title="¿Qué quieres entender?" description="Cada pregunta abre una ruta de conceptos en el orden correcto." href="/learn" linkLabel="Todas las rutas" />
        <ul className="divide-y divide-border border-y border-border">
          {paths.slice(0, 6).map((p) => (
            <li key={p.slug}>
              <Link href={`/learn/${p.slug}`} className="group flex items-center gap-4 py-5 transition-colors sm:py-6">
                <span className="flex-1 text-[20px] font-medium tracking-[-0.015em] text-fg transition-colors group-hover:text-accent-text sm:text-[24px]">{p.question}</span>
                <span className="hidden text-[13.5px] text-faint sm:inline">{p.steps.length} conceptos</span>
                <ArrowRightIcon size={18} className="shrink-0 text-faint transition-transform group-hover:translate-x-1 group-hover:text-fg" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Levels */}
      <section aria-labelledby="niveles" className="py-16">
        <SectionHeading id="niveles" eyebrow="Explora por nivel" title="De los fundamentos a la frontera" description="Cada concepto está clasificado por dificultad para que avances sin sentirte perdido." />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {difficultyOrder.map((d) => {
            const terms = getTermsByDifficulty(d);
            return (
              <li key={d}>
                <Link href={`/explore?nivel=${d}`} className="group flex h-full flex-col rounded-2xl border border-border p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong">
                  <span className="flex items-center gap-2 font-mono text-[12.5px] text-faint">
                    <DifficultyDot difficulty={d} className="!h-2 !w-2" /> Nivel {difficultyLabels[d].level}
                  </span>
                  <span className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-fg">{difficultyLabels[d].label}</span>
                  <span className="mt-2 text-[14.5px] leading-relaxed text-muted">{difficultyLabels[d].description}</span>
                  <span className="mt-auto pt-5 text-[13px] text-faint">
                    {terms.slice(0, 3).map((t) => t.acronym ?? t.name).join(" · ")} · y {terms.length - 3} más
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Categories */}
      <section aria-labelledby="categorias" className="py-16">
        <SectionHeading id="categorias" eyebrow="Categorías" title="Explora por tema" href="/categories" linkLabel="Todas las categorías" />
        <CategoryGrid categories={categories} counts={counts} />
      </section>

      {/* Map preview */}
      <section aria-labelledby="mapa" className="py-16">
        <SectionHeading id="mapa" eyebrow="Mapa de IA" title="Cómo se conecta todo" description="De la IA en general hasta los agentes: cada concepto se construye sobre otros." href="/map" linkLabel="Abrir el mapa" />
        <KnowledgeGraph nodes={nodes} edges={edges} curved={curved} compact />
      </section>

      {/* Resources (distinct area) */}
      <section aria-labelledby="recursos" className="theme-resources py-16">
        <SectionHeading id="recursos" eyebrow="Recursos" title="Más allá del glosario" description="Directorios independientes para pasar de la teoría a la práctica." />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/tools", title: "Herramientas de IA", text: `${tools.length} herramientas con sus enlaces oficiales verificados, de asistentes para empezar a APIs y frameworks.`, cta: "Ver herramientas" },
            { href: "/prompts", title: "Prompts y agentes", text: "Cómo estructurar prompts para Claude, ChatGPT y Gemini, cómo diseñar loops de agentes y un compilador de prompts sin IA.", cta: "Aprender y construir" },
            { href: "/papers", title: "Papers explicados", text: `Los ${papers.length} papers que construyeron la IA moderna, del Transformer a DeepSeek-R1, explicados en español.`, cta: "Leer papers" },
            { href: "/models", title: "Glosario de modelos", text: `${getAllModels().length} modelos de ${getProviders().length} proveedores con contexto, precios y capacidades, a partir de datos de OpenRouter.`, cta: "Ver modelos" },
          ].map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-accent-soft p-7 transition-transform duration-200 hover:-translate-y-0.5">
                <span aria-hidden="true" className="resource-grid-bg pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                <span className="relative text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">Recursos</span>
                <span className="relative mt-3 text-[24px] font-semibold tracking-[-0.02em] text-fg">{r.title}</span>
                <span className="relative mt-2 text-[15.5px] leading-relaxed text-muted">{r.text}</span>
                <span className="relative mt-auto inline-flex items-center gap-1.5 pt-6 text-[14.5px] font-medium text-accent-text">
                  {r.cta} <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Term of the day */}
      <section aria-label="Concepto destacado" className="py-16">
        <TermOfTheDay candidates={candidates} buildIndex={buildIndex} />
      </section>

      {/* Frontier */}
      <section aria-labelledby="frontier" className="py-16">
        <SectionHeading id="frontier" eyebrow="Frontier AI" title="Lo que está definiendo el futuro" description="Conceptos recientes y de investigación activa." href="/explore?frontier=1" linkLabel="Ver todos" />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {frontier.map((t) => (
            <li key={t.slug}>
              <TermCard term={toSummary(t)} categoryName={categoryName(t.category)} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
