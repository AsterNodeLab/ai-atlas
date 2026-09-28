import { useState } from "react";
import type { CompileResult, ModelProfile } from "@/prompt-factory";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";
import { WrapIcon } from "./icons";
import { IssueList } from "./issue-list";
import type { Outcome } from "./outcome";
import { Badge, cx, EngineError } from "./ui";

interface PreviewPanelProps {
  profile?: ModelProfile;
  targetId: string;
  outcome: Outcome<CompileResult>;
  onGoToField: (field: string) => void;
  canGoToField: (field: string) => boolean;
  onShowValidation: () => void;
  className?: string;
}

const numberFmt = new Intl.NumberFormat("es-MX");

/** Live compiled prompt for the selected target (recompiled on every spec change upstream). */
export function PreviewPanel({ profile, targetId, outcome, onGoToField, canGoToField, onShowValidation, className }: PreviewPanelProps) {
  const [wrap, setWrap] = useState(true);
  const result = outcome.ok ? outcome.value : null;
  const compiled = result?.ok ? result.compiled : undefined;
  const prompt = compiled?.prompt ?? "";
  const lineCount = prompt ? prompt.split(/\r?\n/).length : 0;
  const issues = result?.validation.issues ?? [];
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  return (
    <section aria-labelledby="pf-preview-title" className={cx("flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-3 py-2">
        <div className="min-w-0 flex-1">
          <h2 id="pf-preview-title" className="eyebrow">
            Prompt en vivo
          </h2>
          <p className="truncate text-[13.5px] font-medium text-fg">
            {profile?.displayName ?? targetId}
            {compiled ? <Badge className="ml-2 align-middle">{compiled.syntax === "xml" ? "XML" : "Markdown"}</Badge> : null}
          </p>
        </div>
        <button
          type="button"
          aria-pressed={wrap}
          onClick={() => setWrap((w) => !w)}
          className={cx(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-subtle hover:text-fg",
            wrap ? "bg-subtle text-fg" : "text-faint",
          )}
          aria-label="Ajuste de línea"
          title="Ajuste de línea"
        >
          <WrapIcon size={15} />
        </button>
        <CopyButton text={prompt} disabled={!compiled} srLabel="Copiar prompt" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        {!outcome.ok ? (
          <div className="p-3">
            <EngineError what="compilar el prompt" error={outcome.error} />
          </div>
        ) : compiled ? (
          <CodeBlock code={prompt} wrap={wrap} label={`Prompt compilado para ${profile?.displayName ?? targetId}`} className="min-h-[240px] flex-1 max-lg:max-h-[65dvh]" />
        ) : (
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4" role="status">
            <div>
              <p className="text-[14px] font-medium text-fg">Aún no se puede compilar</p>
              <p className="mt-0.5 text-[13px] text-muted">
                {errors.length
                  ? "Corrige estos errores y el prompt aparecerá aquí. Los avisos no bloquean la compilación."
                  : "La especificación todavía no produce un prompt."}
              </p>
            </div>
            {errors.length ? <IssueList issues={errors} onGoToField={onGoToField} canGoToField={canGoToField} /> : null}
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-3 py-1.5 font-mono text-[11.5px] text-faint">
        <span>{numberFmt.format(prompt.length)} caracteres</span>
        <span>{numberFmt.format(lineCount)} líneas</span>
        {compiled ? <span>{compiled.sections.length} secciones</span> : null}
        {warnings.length ? (
          <button type="button" onClick={onShowValidation} className="ml-auto inline-flex items-center gap-1 text-[var(--lvl-3)] hover:underline">
            {warnings.length} {warnings.length === 1 ? "aviso" : "avisos"}
          </button>
        ) : null}
      </footer>
    </section>
  );
}
