import type { FlowStep } from "@/types/glossary";

/** Vertical pipeline diagram used for "Cómo funciona" and "Ejemplo real" blocks. */
export function FlowDiagram({ steps }: { steps: FlowStep[] }) {
  return (
    <ol className="mx-auto flex max-w-[440px] flex-col items-center">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={`${step.label}-${i}`} className="flex w-full flex-col items-center">
            <div
              className={`w-full rounded-xl border bg-surface px-4 py-3 text-center shadow-[var(--shadow-sm)] ${
                last ? "border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]" : "border-border"
              }`}
            >
              <div className="text-[15px] font-medium tracking-[-0.005em] text-fg">{step.label}</div>
              {step.detail ? <div className="mt-0.5 text-[13.5px] leading-snug text-muted">{step.detail}</div> : null}
              {step.chips?.length ? (
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {step.chips.map((chip, j) => (
                    <span key={`${chip}-${j}`} className="whitespace-pre rounded-md border border-border bg-subtle px-1.5 py-0.5 font-mono text-[12px] text-fg">
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            {!last ? <FlowArrow /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function FlowArrow() {
  return (
    <svg width="12" height="26" viewBox="0 0 12 26" aria-hidden="true" className="text-border-strong">
      <path d="M6 1v22M2 19l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Compact variant for plain string flows (examples). */
export function SimpleFlow({ items }: { items: string[] }) {
  return <FlowDiagram steps={items.map((label) => ({ label }))} />;
}
