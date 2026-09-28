import type { IssueSeverity, ValidationIssue } from "@/prompt-factory";
import { AlertIcon, ErrorIcon, InfoIcon } from "./icons";
import { SEVERITY_LABELS } from "./labels";
import { cx } from "./ui";

const ORDER: Record<IssueSeverity, number> = { error: 0, warning: 1, info: 2 };

export function SeverityIcon({ severity, size = 15 }: { severity: IssueSeverity; size?: number }) {
  if (severity === "error") return <ErrorIcon size={size} className="shrink-0 text-[var(--pf-danger)]" />;
  if (severity === "warning") return <AlertIcon size={size} className="shrink-0 text-[var(--lvl-3)]" />;
  return <InfoIcon size={size} className="shrink-0 text-faint" />;
}

/** Human-readable engine issues, errors first, each optionally linked to its field. */
export function IssueList({
  issues,
  onGoToField,
  canGoToField,
  className,
}: {
  issues: ValidationIssue[];
  onGoToField?: (field: string) => void;
  canGoToField?: (field: string) => boolean;
  className?: string;
}) {
  const sorted = [...issues].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
  return (
    <ul className={cx("space-y-1.5", className)}>
      {sorted.map((issue, i) => (
        <li key={`${issue.code}-${issue.field ?? ""}-${i}`} className="flex items-start gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 text-[13px] leading-snug text-fg">
          <span className="mt-px">
            <SeverityIcon severity={issue.severity} />
          </span>
          <span className="min-w-0 flex-1 break-words">
            <span className="sr-only">{SEVERITY_LABELS[issue.severity]}: </span>
            {issue.message}
          </span>
          {issue.field && onGoToField && (!canGoToField || canGoToField(issue.field)) ? (
            <button type="button" onClick={() => onGoToField(issue.field!)} className="shrink-0 whitespace-nowrap text-[12.5px] text-accent-text underline-offset-2 hover:underline">
              Ir al campo
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
