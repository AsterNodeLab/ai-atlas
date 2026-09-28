import { useRef, type ChangeEvent } from "react";
import { importSpec, type PromptSpec, type ValidationIssue } from "@/prompt-factory";
import { CloseIcon } from "@/components/ui/icons";
import { UploadIcon } from "./icons";
import { IssueList } from "./issue-list";
import { attempt } from "./outcome";
import { btn, iconBtn } from "./ui";

export interface ImportReport {
  filename: string;
  spec?: PromptSpec;
  issues: ValidationIssue[];
}

const MAX_BYTES = 2_000_000;

const fileError = (message: string): ValidationIssue => ({ code: "import.file", severity: "error", message });

/** Importar .json → importSpec (the engine validates and returns readable issues). */
export function ImportButton({ onImport }: { onImport: (report: ImportReport) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) {
      onImport({ filename: file.name, issues: [fileError("El archivo es demasiado grande para ser una especificación (máx. 2 MB).")] });
      return;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      onImport({ filename: file.name, issues: [fileError("No se pudo leer el archivo.")] });
      return;
    }
    const parsed = attempt(() => importSpec(text));
    onImport(
      parsed.ok
        ? { filename: file.name, spec: parsed.value.spec, issues: parsed.value.issues }
        : { filename: file.name, issues: [fileError(`El importador falló: ${parsed.error}`)] },
    );
  };

  return (
    <>
      <input ref={inputRef} type="file" accept=".json,application/json" onChange={onFile} className="sr-only" tabIndex={-1} aria-hidden="true" />
      <button type="button" onClick={() => inputRef.current?.click()} className={btn("secondary", "sm")} aria-label="Importar especificación .json">
        <UploadIcon size={14} />
        <span className="hidden sm:inline">Importar</span>
      </button>
    </>
  );
}

/** Result of the last import: success with warnings, or the reasons it failed. */
export function ImportReportBanner({ report, onDismiss }: { report: ImportReport; onDismiss: () => void }) {
  const failed = !report.spec;
  return (
    <div
      role={failed ? "alert" : "status"}
      className={
        failed
          ? "rounded-xl border border-[color-mix(in_srgb,var(--pf-danger)_35%,var(--border))] bg-[color-mix(in_srgb,var(--pf-danger)_5%,transparent)] p-3"
          : "rounded-xl border border-border bg-subtle p-3"
      }
    >
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 text-[13.5px] text-fg">
          <span className="font-medium">{failed ? "No se pudo importar" : "Importado con observaciones"}</span>{" "}
          <span className="break-all font-mono text-[12px] text-muted">{report.filename}</span>
        </p>
        <button type="button" onClick={onDismiss} className={iconBtn} aria-label="Cerrar aviso de importación">
          <CloseIcon size={14} />
        </button>
      </div>
      {report.issues.length ? <IssueList issues={report.issues} className="mt-2" /> : null}
    </div>
  );
}
