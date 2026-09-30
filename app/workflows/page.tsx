import type { Metadata } from "next";
import { Callout, RelatedChips, Section } from "@/components/glossary/article-blocks";
import { InlineText } from "@/components/glossary/rich-text";
import { Lead } from "@/components/prompts/learn/ui";
import { ExternalLink, ResourceHeader } from "@/components/resources/resource-header";
import { ExternalIcon } from "@/components/ui/icons";
import { formula, relatedSlugs, stages, toolQuestions, toolsVerifiedAt, workflowTools } from "@/components/workflows/content";
import { getTerms } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Anatomía de un workflow (experiencia 3D)",
  description:
    "Qué es un workflow, explicado con un sistema 3D de estaciones conectadas: disparador, pasos con datos, decisiones, controles y resultado, con un mismo ejemplo de principio a fin. Y cómo cambia su representación en n8n, Make, Zapier, Codex, Claude Code y Hermes Agent.",
  alternates: { canonical: "/workflows" },
};

// Same pattern as /agents: a standalone WebGL page in /public, embedded with the basePath prefix.
const experienceSrc = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/anatomia_workflow.html`;

export default function WorkflowsPage() {
  const terms = getTerms(relatedSlugs);
  if (terms.length !== relatedSlugs.length) throw new Error("/workflows: related glossary terms not found");

  return (
    <div className="theme-resources mx-auto max-w-[1200px] px-4 pt-10 sm:px-6 sm:pt-14">
      <ResourceHeader
        active="workflows"
        eyebrow="Recursos · Workflows"
        title="Anatomía de un workflow."
        description="Una experiencia 3D para entender qué es un workflow: un proceso con un inicio, pasos que se pasan datos, decisiones, controles y un resultado. El mismo ejemplo de principio a fin."
        meta={
          <>
            <span>{stages.length} etapas</span>
            <span>Scroll, flechas o barra espaciadora</span>
            <span>Respeta la preferencia de movimiento reducido</span>
          </>
        }
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <ol className="flex flex-wrap items-center gap-2 text-[13.5px]" aria-label="Estructura de un workflow">
          {formula.map((f, i) => (
            <li key={f} className="flex items-center gap-2">
              <span className="rounded-full border border-border px-3 py-1 text-fg">
                <span className="mr-1.5 font-mono text-[12px] text-faint">{i + 1}</span>
                {f}
              </span>
              {i < formula.length - 1 ? (
                <span aria-hidden="true" className="text-faint">
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        <a
          href={experienceSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[14px] font-medium text-accent-contrast"
        >
          Abrir en pantalla completa <ExternalIcon size={13} />
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[#020407]">
        <iframe
          src={experienceSrc}
          title="Anatomía de un workflow: experiencia 3D interactiva"
          className="block h-[calc(100svh-160px)] min-h-[520px] w-full"
          allow="fullscreen"
          loading="lazy"
        />
      </div>
      <p className="mt-3 text-[13.5px] text-faint">
        Haz clic dentro de la experiencia para usar el teclado. Requiere un navegador con WebGL; si no está disponible, se muestra la narrativa completa con un diagrama estático.
      </p>

      <article className="mx-auto mt-20 w-full min-w-0 max-w-[760px]">
        {/* 01 · El recorrido como texto */}
        <Section id="recorrido" eyebrow="01 · El recorrido en texto" title="Un ejemplo, seis etapas">
          <Lead>
            <InlineText text="Un [[workflow]] es un proceso definido mediante pasos conectados, con un inicio, acciones, decisiones y un resultado. Esa estructura permite repetirlo cada vez que se presenta un caso nuevo. El ejemplo es hipotético: una solicitud que llega y se resuelve." />
          </Lead>
          <ol className="mt-8 space-y-4">
            {stages.map((s, i) => (
              <li key={s.name} className="rounded-2xl border border-border p-5 sm:p-6">
                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">
                  <span className="font-mono">{String(i + 1).padStart(2, "0")}</span> · {s.name}
                </p>
                <p className="mt-2 text-[16.5px] leading-relaxed text-fg">{s.idea}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  <span className="font-medium text-fg">En el ejemplo: </span>
                  {s.example}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        {/* 02 · Herramientas */}
        <Section id="herramientas" eyebrow="02 · Relación con las herramientas" title="La estructura se mantiene, la herramienta cambia">
          <Lead>
            La estructura del workflow puede mantenerse aunque cambie la herramienta. Lo que cambia es cómo se representa el proceso, quién ejecuta sus pasos y cuánta libertad tiene para decidir cómo avanzar.
          </Lead>
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            {toolQuestions.map((q) => (
              <div key={q.title} className="rounded-2xl border border-border p-5">
                <dt className="text-[15px] font-semibold text-fg">{q.title}</dt>
                <dd className="mt-2 text-[14.5px] leading-relaxed text-muted">{q.text}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {workflowTools.map((t) => (
              <li key={t.name} className="flex min-w-0 flex-col rounded-2xl border border-border p-5">
                <p className="text-[16.5px] font-semibold text-fg">
                  {t.name} <span className="text-[13.5px] font-normal text-faint">· {t.maker}</span>
                </p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-fg">
                  <span className="text-faint">Cómo se representa: </span>
                  <InlineText text={t.represents} />
                </p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-fg">
                  <span className="text-faint">Quién ejecuta y cuánta libertad: </span>
                  <InlineText text={t.runs} />
                </p>
                <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-[13.5px] font-medium">
                  {t.sources.map((s) => (
                    <ExternalLink key={s.url} href={s.url} className="inline-flex items-center gap-1 text-accent-text hover:underline">
                      {s.label} <ExternalIcon size={12} />
                    </ExternalLink>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-4">
            <Callout label="Un archivo de instrucciones no ejecuta nada por sí solo" tone="accent">
              AGENTS.md, CLAUDE.md o una skill son contexto que un agente lee. Lo que pone el proceso en marcha es un disparador (una persona que lanza la tarea, una programación o un evento) y alguien o algo que ejecute los pasos.
            </Callout>
            <Callout label="No hay una opción mejor para todo">
              Las plataformas de automatización también incluyen pasos con IA, y los agentes pueden seguir procedimientos fijos. Una ruta definida paso a paso puede ser más fácil de revisar; más libertad puede adaptarse mejor a casos que no previste. El costo y la previsibilidad dependen del proceso, del volumen y de cómo se configure cada herramienta.
            </Callout>
          </div>
          <p className="mt-4 text-[13.5px] text-faint">
            Descripciones redactadas a partir de la documentación oficial enlazada en cada tarjeta, consultada el {toolsVerifiedAt}. Las funciones de cada producto cambian con frecuencia: revisa la documentación antes de decidir.
          </p>
        </Section>

        {/* 03 · Conceptos relacionados */}
        <Section id="relacionados" eyebrow="03 · En el glosario" title="Sigue aprendiendo">
          <RelatedChips terms={terms} />
        </Section>
      </article>
    </div>
  );
}
