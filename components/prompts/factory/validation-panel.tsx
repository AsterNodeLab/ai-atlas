import type { ValidationResult } from "@/prompt-factory";
import { OkIcon } from "./icons";
import { IssueList } from "./issue-list";
import type { Outcome } from "./outcome";
import { EngineError } from "./ui";

/** validateSpec issues for the selected target. Errors block compilation; warnings and notes do not. */
export function ValidationPanel({
  outcome,
  onGoToField,
  canGoToField,
}: {
  outcome: Outcome<ValidationResult>;
  onGoToField: (field: string) => void;
  canGoToField: (field: string) => boolean;
}) {
  if (!outcome.ok) return <EngineError what="validar la especificación" error={outcome.error} />;
  const { issues } = outcome.value;
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;

  if (!issues.length) {
    return (
      <p className="flex items-center gap-2 text-[13.5px] text-fg">
        <OkIcon size={16} className="text-[var(--lvl-1)]" />
        Sin problemas: la especificación se puede compilar.
      </p>
    );
  }

  const summary = [
    errors ? `${errors} ${errors === 1 ? "error bloquea" : "errores bloquean"} la compilación` : "Nada bloquea la compilación",
    warnings ? `${warnings} ${warnings === 1 ? "aviso" : "avisos"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-2.5">
      <p className="text-[13px] text-muted">{summary}.</p>
      <IssueList issues={issues} onGoToField={onGoToField} canGoToField={canGoToField} />
    </div>
  );
}
