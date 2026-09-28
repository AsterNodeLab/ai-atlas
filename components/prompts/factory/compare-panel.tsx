import { getModelProfile, modelProfiles, type CompileResult, type ModelProfile } from "@/prompt-factory";
import { CloseIcon } from "@/components/ui/icons";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";
import { IssueList } from "./issue-list";
import type { Outcome } from "./outcome";
import { Badge, btn, EngineError } from "./ui";

const numberFmt = new Intl.NumberFormat("es-MX");

/**
 * compileAll → one column per profile. "Qué cambia" only restates what the
 * engine reports (profile.styleSummary + its first transformations); the UI never invents differences.
 */
export function ComparePanel({ outcome, onClose }: { outcome: Outcome<Record<string, CompileResult>>; onClose: () => void }) {
  const results = outcome.ok ? outcome.value : {};
  const ids = [...modelProfiles.map((p) => p.id).filter((id) => id in results), ...Object.keys(results).filter((id) => !modelProfiles.some((p) => p.id === id))];

  return (
    <section aria-labelledby="pf-compare-title" className="rounded-2xl border border-border bg-subtle/50 p-3 sm:p-4">
      <header className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <h2 id="pf-compare-title" className="text-[15px] font-semibold tracking-[-0.01em] text-fg">
            Comparar todos
          </h2>
          <p className="text-[12.5px] text-muted">La misma especificación, compilada para cada modelo.</p>
        </div>
        <button type="button" onClick={onClose} className={btn("ghost", "sm")}>
          <CloseIcon size={14} />
          Cerrar comparación
        </button>
      </header>

      {!outcome.ok ? (
        <div className="mt-3">
          <EngineError what="compilar para todos los modelos" error={outcome.error} />
        </div>
      ) : ids.length === 0 ? (
        <p className="mt-3 text-[13.5px] text-muted">No hay perfiles de modelo configurados.</p>
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {ids.map((id) => (
            <CompareColumn key={id} result={results[id]} profile={getModelProfile(id)} id={id} />
          ))}
        </ul>
      )}
    </section>
  );
}

function CompareColumn({ id, result, profile }: { id: string; result: CompileResult; profile?: ModelProfile }) {
  const compiled = result.ok ? result.compiled : undefined;
  const name = profile?.displayName ?? id;
  const errors = result.validation.issues.filter((i) => i.severity === "error");
  return (
    <li className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-start gap-2 border-b border-border px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-fg">{name}</p>
          <p className="font-mono text-[11.5px] text-faint">
            {profile?.vendor ?? id}
            {compiled ? ` · ${compiled.syntax === "xml" ? "XML" : "Markdown"} · ${numberFmt.format(compiled.prompt.length)} car.` : ""}
          </p>
        </div>
        <CopyButton text={compiled?.prompt ?? ""} disabled={!compiled} srLabel={`Copiar prompt para ${name}`} size="xs" />
      </div>

      <div className="border-b border-border px-3 py-2">
        <p className="eyebrow">Qué cambia</p>
        {profile?.styleSummary ? <p className="mt-0.5 text-[12.5px] leading-snug text-fg">{profile.styleSummary}</p> : null}
        {compiled?.transformations.length ? (
          <ul className="mt-1 space-y-0.5">
            {compiled.transformations.slice(0, 3).map((t, i) => (
              <li key={`${t.id}-${i}`} className="flex gap-1.5 text-[12px] leading-snug text-muted">
                <span aria-hidden="true" className="text-faint">
                  –
                </span>
                <span className="min-w-0">{t.reason}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {compiled ? (
        <CodeBlock code={compiled.prompt} label={`Prompt compilado para ${name}`} className="max-h-[420px] min-h-[200px] flex-1" />
      ) : (
        <div className="space-y-2 p-3">
          <p className="flex items-center gap-2 text-[13px] font-medium text-fg">
            <Badge tone="danger">sin compilar</Badge>
          </p>
          {errors.length ? <IssueList issues={errors} /> : <p className="text-[12.5px] text-muted">El compilador no devolvió un prompt para este modelo.</p>}
        </div>
      )}
    </li>
  );
}
