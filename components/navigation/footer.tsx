import Link from "next/link";
import { RandomTermLink } from "@/components/glossary/random-term";
import { ThemeSegmented } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { getAllTerms } from "@/lib/glossary";

const columns = [
  {
    title: "Aprender",
    links: [
      { href: "/glossary", label: "Glosario A–Z" },
      { href: "/learn", label: "Rutas de aprendizaje" },
      { href: "/map", label: "Mapa de IA" },
    ],
  },
  {
    title: "Explorar",
    links: [
      { href: "/explore", label: "Explorador" },
      { href: "/categories", label: "Categorías" },
      { href: "/saved", label: "Guardados" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { href: "/tools", label: "Herramientas de IA" },
      { href: "/models", label: "Glosario de modelos" },
      { href: "/prompts", label: "Prompts y agentes" },
      { href: "/prompts/factory", label: "Prompt Factory" },
      { href: "/llms", label: "LLMs y prompting" },
      { href: "/papers", label: "Papers explicados" },
      { href: "/agents", label: "Anatomía de un agente" },
      { href: "/workflows", label: "Anatomía de un workflow" },
      { href: "/about", label: "Acerca de" },
    ],
  },
];

export function Footer() {
  const slugs = getAllTerms().map((t) => t.slug);
  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-[15px] text-muted">Aprende Inteligencia Artificial desde cero, concepto por concepto.</p>
          <div className="mt-6">
            <ThemeSegmented />
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="eyebrow">{col.title}</h2>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted transition-colors hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
              {col.title === "Explorar" ? (
                <li>
                  <RandomTermLink slugs={slugs} className="text-muted transition-colors hover:text-fg" />
                </li>
              ) : null}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 border-t border-border px-4 py-6 text-[13px] text-faint sm:flex-row sm:justify-between sm:px-6">
        <p>Construido para aprender.</p>
        <p>{slugs.length} conceptos · Contenido en español (México)</p>
      </div>
    </footer>
  );
}
