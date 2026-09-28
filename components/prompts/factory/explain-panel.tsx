import type { CompileResult } from "@/prompt-factory";
import type { Outcome } from "./outcome";
import { Badge, EngineError } from "./ui";

/** Prompt Explainer: the engine's own list of transformations for the compiled prompt. */
export function ExplainPanel({ outcome, profileName }: { outcome: Outcome<CompileResult>; profileName: string }) {
  if (!outcome.ok) return <EngineError what="explicar la compilación" error={outcome.error} />;
  const compiled = outcome.value.ok ? outcome.value.compiled : undefined;
  if (!compiled) {
    return <p className="text-[13.5px] text-muted">Cuando la especificación compile, aquí verás por qué el prompt tiene cada sección.</p>;
  }
  if (!compiled.transformations.length) {
    return <p className="text-[13.5px] text-muted">El compilador no registró transformaciones para este prompt.</p>;
  }
  return (
    <div className="space-y-2.5">
      <p className="text-[13px] text-muted">
        Decisiones del compilador para <span className="font-medium text-fg">{profileName}</span>, en orden:
      </p>
      <ol className="space-y-1.5">
        {compiled.transformations.map((t, i) => (
          <li key={`${t.id}-${i}`} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-1 rounded-lg border border-border bg-surface px-2.5 py-2">
            <span className="font-mono text-[11.5px] leading-[1.6] text-faint">{i + 1}.</span>
            <span className="min-w-0">
              <span className="block text-[13px] leading-snug text-fg">{t.reason}</span>
              {t.section || t.ruleId ? (
                <span className="mt-1 flex flex-wrap gap-1">
                  {t.section ? <Badge tone="accent">{t.section}</Badge> : null}
                  {t.ruleId ? <Badge>regla {t.ruleId}</Badge> : null}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
