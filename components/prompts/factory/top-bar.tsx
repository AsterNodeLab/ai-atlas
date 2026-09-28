import type { CompileResult, LibraryEntry, ModelProfile, PromptLanguage, PromptMode, PromptSpec } from "@/prompt-factory";
import { CopyButton } from "./copy-button";
import { ExportMenu } from "./export-menu";
import { ImportButton, type ImportReport } from "./import-button";
import { LANGUAGE_LABELS } from "./labels";
import { LibraryDialog } from "./library-dialog";
import type { Outcome } from "./outcome";
import { PresetMenu } from "./preset-menu";
import { ResetButton } from "./reset-button";
import { SaveToLibrary } from "./save-to-library";
import { TargetSegmented } from "./target-selector";
import { Segmented } from "./ui";
import type { FactoryActions, FactoryUi } from "./use-prompt-factory";

interface TopBarProps {
  spec: PromptSpec;
  ui: FactoryUi;
  actions: FactoryActions;
  targetId: string;
  profile?: ModelProfile;
  result: Outcome<CompileResult>;
  status: string;
  announce: (message: string) => void;
  onImport: (report: ImportReport) => void;
}

/** Target · mode · language, presets and file/library actions. */
export function TopBar({ spec, ui, actions, targetId, profile, result, status, announce, onImport }: TopBarProps) {
  const compileResult = result.ok ? result.value : undefined;
  const prompt = compileResult?.ok ? (compileResult.compiled?.prompt ?? "") : "";

  const openEntry = (entry: LibraryEntry) => {
    actions.load(entry.promptSpec, entry.id);
    announce(`Abierto: «${entry.title}».`);
  };

  return (
    <div className="space-y-2.5 rounded-2xl border border-border bg-surface p-2.5 sm:p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <TargetSegmented value={targetId} onChange={actions.setTarget} compare={ui.compare} onCompareChange={actions.setCompare} />
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <Segmented<PromptMode>
            label="Modo"
            value={spec.metadata.mode}
            onChange={actions.setMode}
            options={[
              { value: "standard", label: "Estándar", title: "Un prompt de una sola respuesta" },
              { value: "agent", label: "Agente (loop)", title: "Añade misión, herramientas, loop, presupuesto y parada" },
            ]}
          />
          <Segmented<PromptLanguage>
            label="Idioma del prompt"
            value={spec.metadata.language}
            onChange={(language) => actions.patchMeta({ language })}
            options={[
              { value: "es", label: LANGUAGE_LABELS.es, title: "Prompt en español" },
              { value: "en", label: LANGUAGE_LABELS.en, title: "Prompt en inglés" },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2.5">
        <PresetMenu spec={spec} onApply={(next) => actions.edit(() => next)} announce={announce} />
        <p role="status" aria-live="polite" className="order-last min-h-[1.2em] basis-full truncate text-[12.5px] text-accent-text sm:order-none sm:min-w-0 sm:flex-1 sm:basis-auto">
          {status}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 max-sm:ml-auto">
          <CopyButton text={prompt} disabled={!prompt} srLabel="Copiar prompt" hideLabelOnMobile />
          <ExportMenu spec={spec} result={compileResult} announce={announce} />
          <ImportButton onImport={onImport} />
          <SaveToLibrary spec={spec} libraryId={ui.libraryId} announce={announce} onSaved={({ id, title }) => {
            actions.patchMeta({ title });
            actions.setLibraryId(id);
          }} />
          <LibraryDialog currentId={ui.libraryId} onOpen={openEntry} onDeleted={(id) => id === ui.libraryId && actions.setLibraryId(undefined)} announce={announce} />
          <ResetButton
            onReset={() => {
              actions.reset();
              announce("Nueva especificación en blanco.");
            }}
          />
        </div>
      </div>

      {profile ? (
        <p className="text-[12.5px] leading-snug text-muted">
          <span className="font-medium text-fg">{profile.displayName}</span> · {profile.styleSummary}
        </p>
      ) : null}
    </div>
  );
}
