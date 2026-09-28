import type { ReactNode } from "react";
import { InlineText } from "@/components/glossary/rich-text";

/** Styles `code` produced by InlineText outside of `.prose-atlas`. */
export const inlineCode =
  "[&_code]:rounded-md [&_code]:border [&_code]:border-border [&_code]:bg-code [&_code]:px-1 [&_code]:py-px [&_code]:font-mono [&_code]:text-[0.86em]";

/** Deep-linkable sub-section (h3) inside a page section. */
export function SubSection({ id, title, children, intro }: { id: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-14 scroll-mt-24">
      <h3 id={`${id}-title`} className="text-[19px] font-semibold tracking-[-0.015em] text-fg sm:text-[20px]">
        {title}
      </h3>
      {intro ? <div className="mt-2 text-[16px] leading-relaxed text-muted">{intro}</div> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[17px] leading-[1.7] text-muted sm:text-[18px]">{children}</p>;
}

/** Bulleted list whose items support the glossary inline markup. */
export function Bullets({ items, tone = "accent" }: { items: string[]; tone?: "accent" | "good" | "bad" | "muted" }) {
  const dot = { accent: "bg-accent", good: "bg-lvl-1", bad: "bg-lvl-3", muted: "bg-border-strong" }[tone];
  return (
    <ul className={`space-y-2.5 ${inlineCode}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[15.5px] leading-relaxed text-fg">
          <span aria-hidden="true" className={`mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
          <span className="min-w-0">
            <InlineText text={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

const toneStyles = {
  good: "border-[color-mix(in_srgb,var(--lvl-1)_40%,var(--border))] bg-[color-mix(in_srgb,var(--lvl-1)_8%,var(--bg))] text-fg",
  bad: "border-[color-mix(in_srgb,var(--lvl-3)_40%,var(--border))] bg-[color-mix(in_srgb,var(--lvl-3)_8%,var(--bg))] text-fg",
  accent: "border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-accent-soft text-accent-text",
  neutral: "border-border bg-subtle text-muted",
} as const;

export type Tone = keyof typeof toneStyles;

/** Small status pill ("Bueno", "Malo", "8–16"…). Tone is also spelled out in text, never by color alone. */
export function Tag({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12.5px] font-medium ${toneStyles[tone]}`}>
      {tone === "good" || tone === "bad" ? (
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${tone === "good" ? "bg-lvl-1" : "bg-lvl-3"}`} />
      ) : null}
      {children}
    </span>
  );
}

/** Card with a colored top rule for good/bad comparisons. */
export function CompareCard({ tone, tag, title, children }: { tone: "good" | "bad"; tag: string; title: string; children: ReactNode }) {
  return (
    <div
      className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${
        tone === "good" ? "border-[color-mix(in_srgb,var(--lvl-1)_30%,var(--border))]" : "border-[color-mix(in_srgb,var(--lvl-3)_30%,var(--border))]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone={tone}>{tag}</Tag>
        <span className="text-[14.5px] font-medium text-fg">{title}</span>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}
