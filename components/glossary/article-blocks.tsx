import Link from "next/link";
import { CustomDiagram } from "@/components/diagrams/custom-diagrams";
import { FlowDiagram, SimpleFlow } from "@/components/diagrams/flow-diagram";
import { ArrowRightIcon, CheckIcon, ExternalIcon } from "@/components/ui/icons";
import type { Comparison, Diagram, Example, GlossaryTerm, MathBlock as MathBlockData, Source } from "@/types/glossary";
import { AnchorButton } from "./article-client";
import { DifficultyDot } from "./badges";
import { InlineText, RichText } from "./rich-text";

/** A titled article section with a deep-linkable heading. */
export function Section({ id, title, children, eyebrow }: { id: string; title: string; children: React.ReactNode; eyebrow?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 pt-14 first:pt-0">
      {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
      <h2 id={`${id}-title`} className="group flex items-center text-[24px] font-semibold tracking-[-0.02em] text-fg sm:text-[26px]">
        {title}
        <AnchorButton id={id} title={title} />
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function OneLiner({ term }: { term: GlossaryTerm }) {
  return (
    <div id="en-una-frase" className="scroll-mt-24 rounded-2xl border border-border bg-subtle px-6 py-5 sm:px-7 sm:py-6">
      <p className="eyebrow mb-2">En una frase</p>
      <p className="text-[19px] leading-[1.6] text-fg sm:text-[20px]">
        <span className="font-semibold">{term.acronym && term.acronym !== term.name ? term.acronym : term.name}:</span>{" "}
        {lowerFirst(term.shortDefinition)}
      </p>
    </div>
  );
}

function lowerFirst(s: string) {
  // "Una técnica…" → "una técnica…", but keep acronyms/proper nouns ("IA", "LLM", "Un LLM").
  return /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

export function Callout({ label, children, tone = "neutral" }: { label: string; children: React.ReactNode; tone?: "neutral" | "accent" | "warning" }) {
  const styles = {
    neutral: "border-border bg-subtle",
    accent: "border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-accent-soft",
    warning: "border-[color-mix(in_srgb,var(--lvl-3)_35%,var(--border))] bg-[color-mix(in_srgb,var(--lvl-3)_7%,var(--bg))]",
  }[tone];
  return (
    <aside className={`rounded-2xl border px-5 py-4 sm:px-6 ${styles}`}>
      <p className="mb-1.5 text-[13px] font-semibold text-fg">{label}</p>
      <div className="text-[16.5px] leading-[1.7] text-fg">{children}</div>
    </aside>
  );
}

export function ThirtySeconds({ steps }: { steps: string[] }) {
  return (
    <ol className="grid gap-2.5">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-4 rounded-xl border border-border px-4 py-3">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-[12px] font-medium text-accent-text">
            {i + 1}
          </span>
          <span className="text-[16.5px] leading-relaxed text-fg">{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function DiagramFigure({ diagram }: { diagram: Diagram }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-subtle px-4 py-7 sm:px-8">
      {diagram.title ? <p className="eyebrow mb-6 text-center">{diagram.title}</p> : null}
      {diagram.kind === "flow" ? <FlowDiagram steps={diagram.steps} /> : <CustomDiagram id={diagram.id} />}
      {diagram.caption ? <figcaption className="mx-auto mt-6 max-w-md text-center text-[13.5px] leading-relaxed text-muted">{diagram.caption}</figcaption> : null}
    </figure>
  );
}

export function ExampleBlock({ example, from }: { example: Example; from: string }) {
  return (
    <div className="space-y-5">
      {example.title ? <h3 className="text-[17px] font-semibold tracking-tight text-fg">{example.title}</h3> : null}
      {example.description ? <RichText text={example.description} from={from} className="!text-[17px]" /> : null}
      {example.dialogue ? <Dialogue turns={example.dialogue} /> : null}
      {example.flow ? (
        <div className="rounded-2xl border border-border bg-subtle px-4 py-7">
          <SimpleFlow items={example.flow} />
        </div>
      ) : null}
      {example.code ? <CodeBlock code={example.code} /> : null}
    </div>
  );
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-2xl border border-border bg-code px-5 py-4 font-mono text-[13.5px] leading-[1.7] text-fg">
      <code>{code}</code>
    </pre>
  );
}

const roleLabel = { user: "Usuario", assistant: "Modelo", system: "Sistema" } as const;

function Dialogue({ turns }: { turns: NonNullable<Example["dialogue"]> }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-subtle p-4 sm:p-5">
      {turns.map((t, i) => (
        <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
              t.role === "user"
                ? "bg-fg text-bg"
                : t.role === "system"
                  ? "border border-dashed border-border-strong bg-transparent font-mono text-[13px] text-muted"
                  : "border border-border bg-surface text-fg"
            }`}
          >
            <span className={`mb-0.5 block text-[11px] font-medium uppercase tracking-wider ${t.role === "user" ? "text-bg/60" : "text-faint"}`}>
              {roleLabel[t.role]}
            </span>
            {t.text}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MentalModel({ items }: { items: { label: string; meaning: string }[] }) {
  return (
    <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
      {items.map((m) => (
        <div key={m.label} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[180px_1fr] sm:gap-6">
          <dt className="font-mono text-[14px] font-medium text-fg">{m.label}</dt>
          <dd className="text-[15.5px] text-muted">{m.meaning}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Formula + symbol legend inside a disclosure, so math never intimidates by default. */
export function MathBlock({ math, from }: { math: MathBlockData; from: string }) {
  return (
    <details className="group rounded-2xl border border-border open:bg-subtle/50">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-[15px] font-medium text-fg [&::-webkit-details-marker]:hidden">
        <ArrowRightIcon size={14} className="transition-transform group-open:rotate-90" />
        Ver explicación matemática
      </summary>
      <div className="border-t border-border px-5 pb-5 pt-5">
        <div className="overflow-x-auto rounded-xl bg-surface px-5 py-5 text-center font-mono text-[16px] text-fg shadow-[var(--shadow-sm)] sm:text-[18px]">
          {math.formula}
        </div>
        {math.caption ? <p className="mt-3 text-center text-[13.5px] text-muted">{math.caption}</p> : null}
        <p className="mb-2 mt-6 text-[13px] font-semibold text-fg">Qué significa cada símbolo</p>
        <dl className="grid gap-x-6 gap-y-2 text-[15px] sm:grid-cols-[auto_1fr]">
          {math.symbols.map((s) => (
            <div key={s.symbol} className="contents">
              <dt className="font-mono text-fg">{s.symbol}</dt>
              <dd className="mb-2 text-muted sm:mb-0">{s.meaning}</dd>
            </div>
          ))}
        </dl>
        {math.explanation ? (
          <div className="mt-5 text-[15.5px] leading-relaxed text-muted">
            <InlineText text={math.explanation} from={from} />
          </div>
        ) : null}
      </div>
    </details>
  );
}

export function ComparisonTable({ comparison }: { comparison: Comparison }) {
  return (
    <div>
      <h3 className="mb-4 text-[17px] font-semibold tracking-tight text-fg">{comparison.title}</h3>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[520px] border-collapse text-left text-[15px]">
          <thead className="bg-subtle">
            <tr>
              <th scope="col" className="w-[28%] px-4 py-3 font-medium text-faint"><span className="sr-only">Aspecto</span></th>
              <th scope="col" className="px-4 py-3 font-semibold text-fg">{comparison.columns[0]}</th>
              <th scope="col" className="px-4 py-3 font-semibold text-fg">{comparison.columns[1]}</th>
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((r) => (
              <tr key={r.aspect} className="border-t border-border align-top">
                <th scope="row" className="px-4 py-3 text-[14px] font-medium text-muted">{r.aspect}</th>
                <td className="px-4 py-3 text-fg">{r.a}</td>
                <td className="px-4 py-3 text-fg">{r.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UseCases({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((u) => (
        <li key={u} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-[15.5px] text-fg">
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          {u}
        </li>
      ))}
    </ul>
  );
}

export function PrerequisiteList({ terms }: { terms: GlossaryTerm[] }) {
  return (
    <ul className="space-y-2">
      {terms.map((t) => (
        <li key={t.slug}>
          <Link href={`/glossary/${t.slug}`} className="group flex items-start gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:border-border-strong hover:bg-surface-hover">
            <CheckIcon size={16} className="mt-1 shrink-0 text-lvl-1" />
            <span className="min-w-0">
              <span className="block text-[15.5px] font-medium text-fg">{t.name}</span>
              <span className="block truncate text-[14px] text-muted">{t.shortDefinition}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function NextList({ terms }: { terms: GlossaryTerm[] }) {
  return (
    <ul className="space-y-2">
      {terms.map((t) => (
        <li key={t.slug}>
          <Link href={`/glossary/${t.slug}`} className="group flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:border-border-strong hover:bg-surface-hover">
            <ArrowRightIcon size={16} className="shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
            <span className="min-w-0 flex-1">
              <span className="block text-[15.5px] font-medium text-fg">{t.name}</span>
              <span className="block truncate text-[14px] text-muted">{t.shortDefinition}</span>
            </span>
            <DifficultyDot difficulty={t.difficulty} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Knowledge-graph style chips for related concepts. */
export function RelatedChips({ terms }: { terms: GlossaryTerm[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {terms.map((t) => (
        <li key={t.slug}>
          <Link
            href={`/glossary/${t.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-[14.5px] text-fg transition-colors hover:border-border-strong hover:bg-subtle"
          >
            <DifficultyDot difficulty={t.difficulty} />
            {t.acronym && t.acronym !== t.name ? t.acronym : t.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SourcesList({ sources }: { sources: Source[] }) {
  const kind = { paper: "Paper", docs: "Documentación", book: "Libro", article: "Artículo" } as const;
  return (
    <ul className="space-y-3">
      {sources.map((s) => (
        <li key={s.url}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="group block rounded-xl border border-border px-4 py-3 transition-colors hover:border-border-strong">
            <span className="flex items-start justify-between gap-3">
              <span className="text-[15.5px] font-medium text-fg group-hover:underline">{s.title}</span>
              <ExternalIcon size={14} className="mt-1 shrink-0 text-faint" />
            </span>
            <span className="mt-0.5 block text-[13.5px] text-muted">
              {[s.authors, s.year, s.kind ? kind[s.kind] : null].filter(Boolean).join(" · ")}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
