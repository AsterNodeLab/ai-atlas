import type { SmartQuestion } from "@/prompt-factory";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Outcome } from "./outcome";
import { canQuickFill } from "./spec-edits";
import { STEPS, stepForField } from "./steps";
import { EngineError } from "./ui";

/** getQuestions cards. "Responder" opens the step and focuses the field; quick answers are written into it. */
export function QuestionsPanel({
  outcome,
  onAnswer,
  onQuickFill,
  canGoToField,
}: {
  outcome: Outcome<SmartQuestion[]>;
  onAnswer: (field: string) => void;
  onQuickFill: (field: string, answer: string) => void;
  canGoToField: (field: string) => boolean;
}) {
  if (!outcome.ok) return <EngineError what="generar las preguntas" error={outcome.error} />;
  const questions = outcome.value;
  if (!questions.length) {
    return <p className="text-[13.5px] text-muted">No hay preguntas pendientes para esta especificación.</p>;
  }

  return (
    <ul className="space-y-2">
      {questions.map((q) => {
        const step = STEPS.find((s) => s.id === stepForField(q.field));
        const reachable = canGoToField(q.field);
        const fillable = reachable && canQuickFill(q.field);
        return (
          <li key={q.id} className="rounded-xl border border-border bg-surface p-3">
            <p className="text-[13.5px] font-medium leading-snug text-fg">{q.question}</p>
            {step ? <p className="mt-0.5 font-mono text-[11.5px] text-faint">{step.title}</p> : null}
            {q.suggestions?.length ? (
              fillable ? (
                <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Respuestas rápidas">
                  {q.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onQuickFill(q.field, s)}
                      className="inline-flex min-h-7 max-w-full items-center rounded-full border border-border px-2.5 py-0.5 text-left text-[12.5px] text-muted transition-colors hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] hover:text-fg"
                    >
                      <span className="sr-only">Usar respuesta: </span>
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-1.5 text-[12.5px] text-muted">
                  Por ejemplo: {q.suggestions.join(" · ")}
                </p>
              )
            ) : null}
            {reachable ? (
              <button type="button" onClick={() => onAnswer(q.field)} className="mt-2 inline-flex items-center gap-1 rounded-md text-[12.5px] font-medium text-accent-text underline-offset-2 hover:underline">
                Responder
                <ArrowRightIcon size={13} />
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
