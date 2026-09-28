import { useEffect, type KeyboardEvent, type ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon } from "@/components/ui/icons";
import type { PromptSpec } from "@/prompt-factory";
import { AgentBudgetStep } from "./steps/agent-budget-step";
import { AgentLoopStep, AgentStateStep } from "./steps/agent-loop-steps";
import { AgentMissionStep } from "./steps/agent-mission-step";
import { AgentSafetyStep } from "./steps/agent-safety-step";
import { AgentToolsStep } from "./steps/agent-tools-step";
import { ExamplesEditor } from "./steps/examples-editor";
import { StepConstraints } from "./steps/step-constraints";
import { StepContext } from "./steps/step-context";
import { StepIntent } from "./steps/step-intent";
import { StepObjective } from "./steps/step-objective";
import { StepOutput } from "./steps/step-output";
import { StepRequirements } from "./steps/step-requirements";
import { StepTarget } from "./steps/step-target";
import { fieldCandidates, fieldDomId, getVisibleSteps, stepBodyId, stepHeaderId, stepSummary, type StepDef, type StepId } from "./steps";
import { btn, cx } from "./ui";
import type { FactoryActions, FactoryUi } from "./use-prompt-factory";

interface WizardProps {
  spec: PromptSpec;
  ui: FactoryUi;
  actions: FactoryActions;
  targetId: string;
  announce: (message: string) => void;
}

/** Id of the mobile "Editor | Prompt" switch (owned by PromptFactory). */
export const VIEW_TABS_ID = "pf-view-tabs";

const FOCUSABLE = 'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

function focusableIn(el: HTMLElement): HTMLElement | null {
  return el.matches(FOCUSABLE) ? el : el.querySelector<HTMLElement>(FOCUSABLE);
}

/** Vertical stepper: one collapsible card per step. Ctrl/⌘+Enter → next, Ctrl/⌘+Shift+Enter → previous. */
export function Wizard({ spec, ui, actions, targetId, announce }: WizardProps) {
  const steps = getVisibleSteps(spec);

  // Honour focus requests (Next/Back, questions and validation panels): open step → focus field.
  const focus = ui.focus;
  useEffect(() => {
    if (!focus) return;
    const frame = requestAnimationFrame(() => {
      let target: HTMLElement | null = null;
      if (focus.field) {
        for (const candidate of fieldCandidates(focus.field)) {
          const el = document.getElementById(fieldDomId(candidate));
          if (el) {
            const details = el.closest("details");
            if (details && !details.open) details.open = true;
            target = focusableIn(el);
            break;
          }
        }
      }
      if (!target) {
        const body = document.getElementById(stepBodyId(focus.step));
        target = body ? body.querySelector<HTMLElement>(FOCUSABLE) : null;
      }
      target ??= document.getElementById(stepHeaderId(focus.step));
      target?.focus();
      target?.scrollIntoView({ block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [focus]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      actions.move(e.shiftKey ? -1 : 1);
    }
  };

  const render = (id: StepId): ReactNode => {
    const props = { spec, actions };
    switch (id) {
      case "intent":
        return <StepIntent {...props} announce={announce} />;
      case "target":
        return <StepTarget {...props} targetId={targetId} compare={ui.compare} />;
      case "objective":
        return <StepObjective {...props} />;
      case "context":
        return <StepContext {...props} />;
      case "requirements":
        return <StepRequirements {...props} />;
      case "constraints":
        return <StepConstraints {...props} />;
      case "output":
        return <StepOutput {...props} />;
      case "examples":
        return <ExamplesEditor {...props} />;
      case "mission":
        return <AgentMissionStep {...props} />;
      case "tools":
        return <AgentToolsStep {...props} />;
      case "state":
        return <AgentStateStep {...props} />;
      case "loop":
        return <AgentLoopStep {...props} />;
      case "budget":
        return <AgentBudgetStep {...props} />;
      case "safety":
        return <AgentSafetyStep {...props} />;
    }
  };

  return (
    <div onKeyDown={onKeyDown}>
      <ol aria-label="Pasos del constructor" className="space-y-2.5">
        {steps.map((def, index) => (
          <StepFrame
            key={def.id}
            def={def}
            index={index}
            total={steps.length}
            open={ui.activeStep === def.id}
            summary={stepSummary(def.id, spec)}
            agentStart={def.agentOnly && !steps[index - 1]?.agentOnly}
            onToggle={() => actions.toggleStep(def.id)}
            onBack={() => actions.move(-1)}
            onNext={() => actions.move(1)}
            onShowPrompt={() => {
              actions.setMobileView("prompt");
              requestAnimationFrame(() => document.getElementById(VIEW_TABS_ID)?.scrollIntoView({ block: "start" }));
            }}
          >
            {render(def.id)}
          </StepFrame>
        ))}
      </ol>
      <p className="mt-3 hidden text-[12px] text-faint sm:block">
        <kbd className="rounded border border-border px-1 font-mono text-[11px]">Ctrl/⌘</kbd> + <kbd className="rounded border border-border px-1 font-mono text-[11px]">Enter</kbd> siguiente paso ·{" "}
        <kbd className="rounded border border-border px-1 font-mono text-[11px]">Shift</kbd> para volver
      </p>
    </div>
  );
}

interface StepFrameProps {
  def: StepDef;
  index: number;
  total: number;
  open: boolean;
  summary: string | null;
  agentStart?: boolean;
  onToggle: () => void;
  onBack: () => void;
  onNext: () => void;
  onShowPrompt: () => void;
  children: ReactNode;
}

function StepFrame({ def, index, total, open, summary, agentStart, onToggle, onBack, onNext, onShowPrompt, children }: StepFrameProps) {
  const isLast = index === total - 1;
  const done = Boolean(summary);
  return (
    <li className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-3">
      {agentStart ? (
        <p className="eyebrow col-span-2 mb-1 mt-3 flex items-center gap-2 text-accent-text">
          <span aria-hidden="true" className="h-px flex-1 bg-[color-mix(in_srgb,var(--accent)_30%,var(--border))]" />
          Modo agente
          <span aria-hidden="true" className="h-px flex-1 bg-[color-mix(in_srgb,var(--accent)_30%,var(--border))]" />
        </p>
      ) : null}
      <div aria-hidden="true" className="relative flex justify-center">
        <span
          className={cx(
            "relative z-10 mt-2.5 inline-flex size-7 items-center justify-center rounded-full border font-mono text-[12px] transition-colors",
            open ? "border-accent bg-accent text-accent-contrast" : done ? "border-accent bg-surface text-accent-text" : "border-border bg-surface text-faint",
          )}
        >
          {index + 1}
        </span>
        {!isLast ? <span className="absolute bottom-[-12px] top-10 w-px bg-border" /> : null}
      </div>
      <div className={cx("min-w-0 rounded-2xl border bg-surface transition-colors", open ? "border-border-strong shadow-soft" : "border-border")}>
        <h3 className="m-0">
          <button
            id={stepHeaderId(def.id)}
            type="button"
            aria-expanded={open}
            aria-controls={open ? stepBodyId(def.id) : undefined}
            onClick={onToggle}
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left sm:px-4"
          >
            <span className="min-w-0 flex-1">
              <span className="sr-only">
                Paso {index + 1} de {total}:{" "}
              </span>
              <span className="block text-[14.5px] font-semibold tracking-[-0.01em] text-fg">{def.title}</span>
              {open ? (
                <span className="block text-[12.5px] leading-snug text-muted">{def.description}</span>
              ) : summary ? (
                <span className="block truncate text-[12.5px] text-faint">{summary}</span>
              ) : null}
            </span>
            <ChevronDownIcon size={16} className={cx("shrink-0 text-faint transition-transform", open && "rotate-180")} />
          </button>
        </h3>
        {open ? (
          <div id={stepBodyId(def.id)} role="region" aria-labelledby={stepHeaderId(def.id)} className="animate-fade-in border-t border-border px-3.5 pb-3.5 pt-4 sm:px-4">
            {children}
            <div className="mt-5 flex items-center gap-2 border-t border-border pt-3">
              <button type="button" onClick={onBack} disabled={index === 0} className={btn("ghost", "sm")}>
                <ArrowLeftIcon size={14} />
                Atrás
              </button>
              <span className="ml-auto font-mono text-[11.5px] text-faint">
                {index + 1}/{total}
              </span>
              {isLast ? (
                <button type="button" onClick={onShowPrompt} className={cx(btn("primary", "sm"), "lg:hidden")}>
                  Ver prompt
                  <ArrowRightIcon size={14} />
                </button>
              ) : (
                <button type="button" onClick={onNext} className={btn("primary", "sm")} title="Ctrl/⌘ + Enter">
                  Siguiente
                  <ArrowRightIcon size={14} />
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}
