import { useRef, useState } from "react";
import { getModelProfile, type LibraryEntry } from "@/prompt-factory";
import { CloseIcon } from "@/components/ui/icons";
import { getLibrary } from "./browser";
import { LibraryIcon, TrashIcon } from "./icons";
import { MODE_LABELS } from "./labels";
import { attempt } from "./outcome";
import { Badge, btn, cx, iconBtn, iconBtnDanger } from "./ui";

const dateFmt = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFmt.format(date);
}

interface Props {
  currentId?: string;
  onOpen: (entry: LibraryEntry) => void;
  onDeleted: (id: string) => void;
  announce: (message: string) => void;
}

/** Biblioteca: native modal <dialog> (focus trap + Esc for free) listing saved specs from localStorage. */
export function LibraryDialog({ currentId, onOpen, onDeleted, announce }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const refresh = () => {
    const library = getLibrary();
    if (!library) {
      setError("La biblioteca no está disponible en este navegador (almacenamiento bloqueado).");
      setEntries([]);
      return;
    }
    const listed = attempt(() => library.list());
    setError(listed.ok ? null : `No se pudo leer la biblioteca: ${listed.error}`);
    setEntries(listed.ok ? listed.value : []);
  };

  const show = () => {
    refresh();
    setConfirmId(null);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const remove = (entry: LibraryEntry) => {
    const library = getLibrary();
    if (!library) return;
    const removed = attempt(() => library.remove(entry.id));
    if (!removed.ok) {
      announce(`No se pudo eliminar: ${removed.error}`);
      return;
    }
    setConfirmId(null);
    onDeleted(entry.id);
    refresh();
    announce(`Eliminado de la biblioteca: «${entry.title}».`);
  };

  return (
    <>
      <button type="button" onClick={show} className={btn("secondary", "sm")} aria-haspopup="dialog" aria-label="Abrir biblioteca">
        <LibraryIcon size={14} />
        <span className="hidden sm:inline">Biblioteca</span>
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="pf-library-title"
        onClose={() => setConfirmId(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="m-auto w-[min(640px,calc(100vw-2rem))] max-h-[min(80dvh,720px)] overflow-hidden rounded-2xl border border-border bg-surface p-0 text-fg shadow-float backdrop:bg-[var(--overlay)]"
      >
        <div className="flex max-h-[min(80dvh,720px)] flex-col">
          <header className="flex items-start gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0 flex-1">
              <h2 id="pf-library-title" className="text-[16px] font-semibold tracking-[-0.01em]">
                Biblioteca
              </h2>
              <p className="text-[12.5px] text-muted">Especificaciones guardadas en este navegador. Abrir una reemplaza el editor actual.</p>
            </div>
            <button type="button" onClick={close} className={iconBtn} aria-label="Cerrar biblioteca">
              <CloseIcon size={16} />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {error ? (
              <p role="alert" className="px-1 py-4 text-center text-[13.5px] text-muted">
                {error}
              </p>
            ) : entries.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border-strong px-4 py-10 text-center text-[13.5px] text-muted">
                Tu biblioteca está vacía. Usa «Guardar» para conservar una especificación.
              </p>
            ) : (
              <ul className="space-y-2">
                {entries.map((entry) => {
                  const profile = getModelProfile(entry.promptSpec.metadata.targetModel);
                  const confirming = confirmId === entry.id;
                  return (
                    <li
                      key={entry.id}
                      className={cx("rounded-xl border bg-surface p-3", entry.id === currentId ? "border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]" : "border-border")}
                    >
                      <div className="flex flex-wrap items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium text-fg">{entry.title || "Sin título"}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] text-faint">
                            <span>Actualizado {formatDate(entry.updatedAt)}</span>
                            <Badge>{profile?.displayName ?? entry.promptSpec.metadata.targetModel}</Badge>
                            <Badge>{MODE_LABELS[entry.promptSpec.metadata.mode] ?? entry.promptSpec.metadata.mode}</Badge>
                            {entry.id === currentId ? <Badge tone="accent">abierta</Badge> : null}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {confirming ? (
                            <>
                              <button type="button" onClick={() => setConfirmId(null)} className={btn("ghost", "xs")}>
                                Cancelar
                              </button>
                              <button type="button" onClick={() => remove(entry)} className={btn("danger", "xs")}>
                                Eliminar definitivamente
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  onOpen(entry);
                                  close();
                                }}
                                className={btn("primary", "xs")}
                              >
                                Abrir
                              </button>
                              <button type="button" onClick={() => setConfirmId(entry.id)} className={iconBtnDanger} aria-label={`Eliminar «${entry.title}»`}>
                                <TrashIcon size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <footer className="border-t border-border px-4 py-2 text-[12px] text-faint">
            {entries.length} {entries.length === 1 ? "entrada" : "entradas"} · se guardan en el almacenamiento local de este navegador
          </footer>
        </div>
      </dialog>
    </>
  );
}
