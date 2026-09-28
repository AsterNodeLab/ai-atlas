import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";

export const FACTORY_HREF = "/prompts/factory";

const targets = [
  { name: "Claude", format: "XML semántico" },
  { name: "ChatGPT", format: "Jerarquía Markdown" },
  { name: "Gemini", format: "Secciones + ejemplos" },
];

const specFields = ["rol", "objetivo", "contexto", "reglas", "formato", "done"];

function Node({ step, title, detail, accent = false, className = "", children }: { step: string; title: string; detail: string; accent?: boolean; className?: string; children?: ReactNode }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 shadow-[var(--shadow-sm)] ${
        accent ? "border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] bg-accent-soft" : "border-border bg-surface"
      } ${className}`}
    >
      <p className={`font-mono text-[11px] uppercase tracking-[0.06em] ${accent ? "text-accent-text" : "text-faint"}`}>{step}</p>
      <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em] text-fg">{title}</p>
      <p className="mt-0.5 text-[13px] leading-snug text-muted">{detail}</p>
      {children}
    </div>
  );
}

function Arrow() {
  return (
    <div aria-hidden="true" className="flex justify-center py-1.5 md:w-8 md:shrink-0 md:py-0">
      <svg width="12" height="22" viewBox="0 0 12 22" className="text-border-strong md:-rotate-90">
        <path d="M6 1v18M2 15l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Intent → PromptSpec (IR) → { Claude · ChatGPT · Gemini }. Vertical on phones, horizontal from md. */
export function PipelineDiagram() {
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-border bg-subtle p-4 sm:p-6">
      <div aria-hidden="true" className="resource-grid-bg pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative flex flex-col md:flex-row md:items-center">
        <Node step="1 · Intención" title="Lo que quieres" detail="«Comparar dos contratos y recomendar uno.»" className="md:w-[28%] md:shrink-0" />
        <Arrow />
        <Node step="2 · IR" title="PromptSpec" detail="Especificación estructurada, independiente del modelo." accent className="md:min-w-0 md:flex-1">
          <ul aria-label="Campos de la especificación" className="mt-2.5 flex flex-wrap gap-1">
            {specFields.map((f) => (
              <li key={f} className="rounded-md border border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-bg/70 px-1.5 py-px font-mono text-[11px] text-fg">
                {f}
              </li>
            ))}
          </ul>
        </Node>
        <Arrow />
        <ul aria-label="3 · Prompt adaptado a cada modelo" className="grid grid-cols-3 gap-2 md:flex md:w-[30%] md:shrink-0 md:flex-col md:gap-2.5 md:pl-3">
          {targets.map((t) => (
            <li
              key={t.name}
              className="relative min-w-0 md:before:absolute md:before:-left-3 md:before:top-1/2 md:before:h-px md:before:w-3 md:before:bg-border-strong md:after:absolute md:after:-bottom-[5px] md:after:-left-3 md:after:-top-[5px] md:after:w-px md:after:bg-border-strong md:first:after:top-1/2 md:last:after:bottom-1/2"
            >
              <div className="h-full rounded-xl border border-border bg-surface px-2 py-2.5 shadow-[var(--shadow-sm)] sm:px-3">
                <p className="text-[14px] font-semibold tracking-[-0.01em] text-fg">{t.name}</p>
                <p className="mt-0.5 font-mono text-[11px] leading-snug text-muted">{t.format}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="relative mt-5 text-[13px] leading-relaxed text-muted">
        Tu intención se convierte en una especificación intermedia (IR) que no depende del modelo. Después, cada adaptador la escribe en la estructura que mejor
        funciona para su familia.
      </figcaption>
    </figure>
  );
}

export function FactoryHero() {
  return (
    <section aria-labelledby="prompt-factory-title" className="rounded-3xl border border-border px-5 py-8 sm:px-10 sm:py-10">
      <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">Prompt Factory</p>
          <h2 id="prompt-factory-title" className="mt-2 text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-fg sm:text-[32px]">
            Convierte ideas en prompts de producción.
          </h2>
          <ol className="mt-5 space-y-1.5 text-[16px] text-muted">
            {["Una intención.", "Una especificación estructurada.", "Prompts optimizados para cada modelo."].map((line, i) => (
              <li key={line} className="flex items-baseline gap-3">
                <span aria-hidden="true" className="font-mono text-[12px] text-accent-text">{i + 1}</span>
                {line}
              </li>
            ))}
          </ol>
          <Link
            href={FACTORY_HREF}
            className="group mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-fg px-5 text-[15px] font-medium text-bg transition-opacity hover:opacity-90"
          >
            Construir un prompt <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="mt-8 lg:mt-0">
          <PipelineDiagram />
        </div>
      </div>
    </section>
  );
}
