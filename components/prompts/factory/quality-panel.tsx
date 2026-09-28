import type { QualityCheck, QualityReport } from "@/prompt-factory";
import { AlertIcon, ErrorIcon, OkIcon } from "./icons";
import type { Outcome } from "./outcome";
import { EngineError } from "./ui";

const STATUS: Record<QualityCheck["status"], { label: string; icon: React.ReactNode }> = {
  ok: { label: "Cumple", icon: <OkIcon size={15} className="shrink-0 text-[var(--lvl-1)]" /> },
  warn: { label: "Mejorable", icon: <AlertIcon size={15} className="shrink-0 text-[var(--lvl-3)]" /> },
  error: { label: "Falta", icon: <ErrorIcon size={15} className="shrink-0 text-[var(--pf-danger)]" /> },
};

/** Structural completeness from evaluateQuality — explicitly not a measure of intellectual quality. */
export function QualityPanel({ outcome }: { outcome: Outcome<QualityReport> }) {
  if (!outcome.ok) return <EngineError what="evaluar la especificación" error={outcome.error} />;
  const { score, checks } = outcome.value;
  const width = Math.min(100, Math.max(0, score));
  return (
    <div className="space-y-3">
      <div>
        <p className="flex items-baseline justify-between gap-3 text-[13.5px] text-fg">
          <span className="font-medium">Completitud estructural:</span>
          <span className="font-mono tabular-nums">
            <span className="text-[18px] font-semibold">{score}</span>
            <span className="text-faint">/100</span>
          </span>
        </p>
        <div
          role="meter"
          aria-label="Completitud estructural"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-subtle ring-1 ring-inset ring-border"
        >
          <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${width}%` }} />
        </div>
      </div>
      <p className="rounded-lg bg-subtle px-2.5 py-2 text-[12.5px] leading-snug text-muted">
        Indicador estructural, no una medición de la calidad intelectual del prompt.
      </p>
      {checks.length ? (
        <ul className="space-y-1">
          {checks.map((check) => (
            <li key={check.id} className="flex items-start gap-2 py-0.5 text-[13px] leading-snug text-fg">
              <span className="mt-px">{STATUS[check.status].icon}</span>
              <span className="min-w-0 flex-1">
                <span className="sr-only">{STATUS[check.status].label}: </span>
                {check.label}
              </span>
              <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-faint">{check.points > 0 ? `+${check.points}` : check.points}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
