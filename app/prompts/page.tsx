import type { Metadata } from "next";
import { Section } from "@/components/glossary/article-blocks";
import { MobileToc, ReadingProgress, TableOfContents } from "@/components/glossary/article-client";
import { Agents } from "@/components/prompts/learn/agents";
import { Anatomy } from "@/components/prompts/learn/anatomy";
import { Closing } from "@/components/prompts/learn/closing";
import { tocItems } from "@/components/prompts/learn/content";
import { FactoryHero } from "@/components/prompts/learn/factory-hero";
import { FewShot } from "@/components/prompts/learn/few-shot";
import { OutputFormats } from "@/components/prompts/learn/output-formats";
import { Platforms } from "@/components/prompts/learn/platforms";
import { RequirementsConstraints } from "@/components/prompts/learn/requirements-constraints";
import { ResourceHeader } from "@/components/resources/resource-header";

export const metadata: Metadata = {
  title: "Prompts: cómo estructurarlos para Claude, ChatGPT y Gemini",
  description:
    "Guía visual para escribir prompts profesionales: los 12 componentes de un buen prompt, cómo adaptarlo a Claude, ChatGPT y Gemini, y cómo estructurar prompts de agentes con loops, estado y condiciones de parada.",
  alternates: { canonical: "/prompts" },
};

const label = (id: string) => tocItems.find((t) => t.id === id)?.label ?? id;

export default function PromptsPage() {
  return (
    <div className="theme-resources mx-auto max-w-[1200px] px-4 pt-10 sm:px-6 sm:pt-14">
      <ReadingProgress />

      <ResourceHeader
        active="prompts"
        eyebrow="Recursos · Prompts"
        title="Prompts profesionales, explicados."
        description="Por qué un buen prompt tiene la estructura que tiene: sus componentes, cómo adaptarlo a Claude, ChatGPT y Gemini, y cómo escribir prompts para agentes que trabajan en ciclos."
        meta={
          <>
            <span>{tocItems.length} secciones</span>
            <span>~10 min de lectura</span>
            <span>Plantillas listas para copiar</span>
          </>
        }
      />

      <div className="mt-8">
        <FactoryHero />
      </div>

      <div className="mt-16 lg:grid lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-16 xl:gap-20">
        <article className="mx-auto w-full min-w-0 max-w-[760px] lg:mx-0">
          <div className="mb-12 lg:hidden">
            <MobileToc items={tocItems} />
          </div>

          <div>
            <Section id="anatomia" eyebrow="01 · Fundamentos" title={label("anatomia")}>
              <Anatomy />
            </Section>

            <Section id="plataformas" eyebrow="02 · Por modelo" title={label("plataformas")}>
              <Platforms />
            </Section>

            <Section id="few-shot" eyebrow="03 · Ejemplos" title={label("few-shot")}>
              <FewShot />
            </Section>

            <Section id="requisitos-restricciones" eyebrow="04 · Instrucciones" title={label("requisitos-restricciones")}>
              <RequirementsConstraints />
            </Section>

            <Section id="formatos" eyebrow="05 · Salida" title={label("formatos")}>
              <OutputFormats />
            </Section>

            <Section id="agentes" eyebrow="06 · Agentes" title={label("agentes")}>
              <Agents />
            </Section>

            <Section id="construye" eyebrow="07 · Siguiente paso" title={label("construye")}>
              <Closing />
            </Section>
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-8">
            <TableOfContents items={tocItems} title="En esta guía" />
          </div>
        </aside>
      </div>
    </div>
  );
}
