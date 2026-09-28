"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { LoopDecision, LoopStep } from "./content";

function LoopIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 12a8 8 0 0 1 13.66-5.66L20 8.5" />
      <path d="M20 4v4.5h-4.5" />
      <path d="M20 12a8 8 0 0 1-13.66 5.66L4 15.5" />
      <path d="M4 20v-4.5h4.5" />
    </svg>
  );
}

/**
 * Interactive agent loop: OBSERVE → … → DECIDE → (back to OBSERVE) until DONE.
 * Steps are a WAI-ARIA tablist (←/→, Home/End, roving tabindex); "Siguiente paso"
 * advances without moving focus and announces the change. No autoplay, and the
 * only motion (a short fade) is disabled under prefers-reduced-motion.
 */
export function AgentLoop({
  steps,
  decisions,
  scenario,
  exampleDecision,
}: {
  steps: LoopStep[];
  decisions: LoopDecision[];
  scenario: string;
  exampleDecision: string;
}) {
  const [active, setActive] = useState(0);
  const [announce, setAnnounce] = useState("");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const step = steps[active];
  const last = steps.length - 1;
  const isDecide = active === last;

  function focusStep(index: number) {
    const next = (index + steps.length) % steps.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last };
    if (!(e.key in moves)) return;
    e.preventDefault();
    focusStep(moves[e.key]);
  }

  function nextStep() {
    const next = isDecide ? 0 : active + 1;
    setActive(next);
    setAnnounce(`${isDecide ? "Nueva vuelta. " : ""}Paso ${next + 1} de ${steps.length}: ${steps[next].label}, ${steps[next].es}.`);
  }

  return (
    <div className="rounded-3xl border border-border bg-subtle p-3 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">El loop de un agente</h3>
        <p className="text-[13px] text-muted">
          <span className="font-medium text-fg">Ejemplo:</span> {scenario}
        </p>
      </div>

      <div role="tablist" aria-label="Pasos del loop del agente" className="mt-4 grid grid-cols-4 gap-1.5 md:grid-cols-8">
        {steps.map((s, i) => {
          const selected = i === active;
          const done = i < active;
          return (
            <button
              key={s.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`loop-tab-${s.key}`}
              aria-selected={selected}
              aria-controls="loop-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`flex min-w-0 flex-col items-start rounded-xl border px-1.5 py-2 text-left transition-colors md:px-2 lg:px-2.5 ${
                selected
                  ? "border-accent bg-accent-soft ring-1 ring-inset ring-accent"
                  : done
                    ? "border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-surface hover:border-accent"
                    : "border-border bg-surface hover:border-border-strong"
              }`}
            >
              <span className={`font-mono text-[11px] ${selected || done ? "text-accent-text" : "text-faint"}`}>{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-0.5 font-mono text-[11px] font-semibold uppercase leading-tight tracking-[0.02em] text-fg sm:text-[11.5px]">{s.label}</span>
              <span className={`mt-0.5 max-w-full break-words text-[11px] leading-tight sm:text-[11.5px] ${selected ? "text-fg" : "text-muted"}`}>{s.es}</span>
            </button>
          );
        })}
      </div>

      {/* Progress through the current lap + loop-back / exit legend */}
      <div aria-hidden="true" className="mt-3 flex gap-1">
        {steps.map((s, i) => (
          <span key={s.key} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= active ? "bg-accent" : "bg-border"}`} />
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-[12.5px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <LoopIcon /> Después de DECIDE, vuelve a OBSERVE
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border-strong px-2.5 py-0.5 font-mono text-[11.5px] text-fg">
          COMPLETAR → DONE
        </span>
      </div>

      <div
        role="tabpanel"
        id="loop-panel"
        aria-labelledby={`loop-tab-${step.key}`}
        tabIndex={0}
        className="mt-5 rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <div key={step.key} className="motion-safe:animate-fade-in">
          <p className="font-mono text-[12px] text-accent-text">
            Paso {active + 1} de {steps.length}
          </p>
          <h4 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-fg">
            <span className="font-mono text-[17px] tracking-[0.01em]">{step.label}</span>
            <span className="font-normal text-muted"> · {step.es}</span>
          </h4>
          <p className="mt-2 text-[16px] leading-relaxed text-fg">{step.does}</p>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 rounded-xl border border-border bg-subtle px-4 py-3">
              <dt className="eyebrow">En el ejemplo</dt>
              <dd className="mt-1 break-words font-mono text-[13px] leading-relaxed text-fg">{step.example}</dd>
            </div>
            <div className="min-w-0 rounded-xl border border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-accent-soft px-4 py-3">
              <dt className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">Qué escribir en el prompt</dt>
              <dd className="mt-1 text-[14.5px] leading-relaxed text-fg">«{step.promptLine}»</dd>
            </div>
          </dl>

          {isDecide ? (
            <div className="mt-5">
              <p className="text-[14px] font-medium text-fg">Opciones de DECIDE</p>
              <ul className="mt-2.5 grid gap-2">
                {decisions.map((d) => {
                  const chosen = d.key === exampleDecision;
                  return (
                    <li
                      key={d.key}
                      className={`flex flex-col gap-1 rounded-xl border px-3.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-3 ${
                        chosen ? "border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] bg-accent-soft" : "border-border"
                      }`}
                    >
                      <span className="shrink-0 font-mono text-[12.5px] font-semibold text-fg sm:w-[118px]">{d.key}</span>
                      <span className="text-[14px] leading-snug text-muted">
                        {d.when}
                        {chosen ? <span className="ml-1.5 whitespace-nowrap font-medium text-accent-text">← en el ejemplo</span> : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-faint">
          Usa <kbd className="rounded border border-border bg-surface px-1 font-mono text-[11px]">←</kbd>{" "}
          <kbd className="rounded border border-border bg-surface px-1 font-mono text-[11px]">→</kbd> sobre los pasos.
        </p>
        <button
          type="button"
          onClick={nextStep}
          className="group inline-flex h-10 items-center gap-2 rounded-xl bg-fg px-4 text-[14.5px] font-medium text-bg transition-opacity hover:opacity-90"
        >
          Siguiente paso
          {isDecide ? (
            <>
              <span className="font-normal opacity-70">· nueva vuelta</span>
              <LoopIcon size={15} />
            </>
          ) : (
            <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
    </div>
  );
}
