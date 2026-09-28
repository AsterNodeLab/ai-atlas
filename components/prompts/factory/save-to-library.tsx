import { useId, useState } from "react";
import { compileAll, type PromptSpec } from "@/prompt-factory";
import { getLibrary, newEntryId } from "./browser";
import { SaveIcon } from "./icons";
import { attempt } from "./outcome";
import { Popover } from "./popover";
import { btn, inputCls } from "./ui";

interface Props {
  spec: PromptSpec;
  libraryId?: string;
  onSaved: (entry: { id: string; title: string }) => void;
  announce: (message: string) => void;
}

function defaultTitle(spec: PromptSpec): string {
  const fromObjective = spec.objective?.replace(/\s+/g, " ").trim() ?? "";
  return spec.metadata.title?.trim() || (fromObjective.length > 60 ? `${fromObjective.slice(0, 59)}…` : fromObjective);
}

/** "Guardar en biblioteca": asks for a title, stores the spec plus every compiled version at save time. */
export function SaveToLibrary({ spec, libraryId, onSaved, announce }: Props) {
  const save = (rawTitle: string, asNew: boolean): boolean => {
    const library = getLibrary();
    if (!library) {
      announce("La biblioteca no está disponible en este navegador (almacenamiento bloqueado).");
      return false;
    }
    const title = rawTitle.trim() || "Sin título";
    const promptSpec: PromptSpec = { ...spec, metadata: { ...spec.metadata, title } };
    const all = attempt(() => compileAll(promptSpec));
    const compiledVersions: Record<string, string> = {};
    if (all.ok) {
      for (const [id, r] of Object.entries(all.value)) if (r.ok && r.compiled) compiledVersions[id] = r.compiled.prompt;
    }
    const existing = !asNew && libraryId ? attempt(() => library.get(libraryId)) : undefined;
    const createdAt = existing?.ok ? existing.value?.createdAt : undefined;
    const saved = attempt(() =>
      library.save({ id: !asNew && libraryId ? libraryId : newEntryId(), title, promptSpec, compiledVersions, ...(createdAt ? { createdAt } : {}) }),
    );
    if (!saved.ok) {
      announce(`No se pudo guardar: ${saved.error}`);
      return false;
    }
    onSaved({ id: saved.value.id, title });
    announce(`Guardado en la biblioteca: «${title}».`);
    return true;
  };

  return (
    <Popover
      trigger={
        <>
          <SaveIcon size={14} />
          <span className="hidden sm:inline">Guardar</span>
        </>
      }
      triggerLabel="Guardar en biblioteca"
      triggerClassName={btn("secondary", "sm")}
      panelLabel="Guardar en biblioteca"
      align="end"
    >
      {(close) => <SaveForm initialTitle={defaultTitle(spec)} canUpdate={Boolean(libraryId)} onCancel={close} onSave={(title, asNew) => save(title, asNew) && close()} />}
    </Popover>
  );
}

function SaveForm({
  initialTitle,
  canUpdate,
  onSave,
  onCancel,
}: {
  initialTitle: string;
  canUpdate: boolean;
  onSave: (title: string, asNew: boolean) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const id = useId();
  return (
    <form
      className="space-y-3 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(title, false);
      }}
    >
      <div className="space-y-1.5">
        <label htmlFor={id} className="text-[13px] font-medium text-fg">
          Título
        </label>
        <input id={id} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sin título" className={inputCls} />
        <p className="text-[12px] text-faint">Se guarda solo en este navegador.</p>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className={btn("ghost", "sm")}>
          Cancelar
        </button>
        {canUpdate ? (
          <button type="button" onClick={() => onSave(title, true)} className={btn("secondary", "sm")}>
            Guardar como nueva
          </button>
        ) : null}
        <button type="submit" className={btn("primary", "sm")}>
          {canUpdate ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
