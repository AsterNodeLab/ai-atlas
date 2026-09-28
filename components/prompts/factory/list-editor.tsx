import { useId, useRef, useState, type KeyboardEvent } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { ChevronDownSmallIcon, ChevronUpIcon, PlusIcon } from "./icons";
import { btn, iconBtn, iconBtnDanger, inputCls } from "./ui";

interface ListEditorProps {
  /** DOM id of the "new item" input (panels focus it to answer a question). */
  id?: string;
  label: string;
  hint?: string;
  items: string[] | undefined;
  onChange: (items: string[]) => void;
  placeholder?: string;
  /** Singular noun for accessible names, e.g. "requisito". */
  noun: string;
  /** Numbered list (for ordered data such as workflow steps or priorities). */
  ordered?: boolean;
}

/** Row buttons must not steal focus on pointer down (keeps the blur-cleanup from shifting indexes). */
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

/**
 * Editable string list. Enter adds, Backspace on the empty input removes the
 * last item, ↑/↓ buttons reorder, each item is editable in place.
 */
export function ListEditor({ id, label, hint, items, onChange, placeholder, noun, ordered }: ListEditorProps) {
  const list = items ?? [];
  const [draft, setDraft] = useState("");
  const [live, setLive] = useState("");
  const autoId = useId();
  const inputId = id ?? `${autoId}-new`;
  const hintId = `${autoId}-hint`;
  const listRef = useRef<HTMLOListElement>(null);
  const newRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    onChange([...list, value]);
    setDraft("");
    setLive(`Añadido: ${value}`);
  };

  const remove = (index: number) => {
    const removed = list[index];
    onChange(list.filter((_, i) => i !== index));
    setLive(`Eliminado: ${removed}`);
  };

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    setLive(`${noun} movido a la posición ${target + 1}`);
    const action = delta === -1 ? "up" : "down";
    requestAnimationFrame(() => {
      const row = listRef.current?.querySelector<HTMLElement>(`[data-row="${target}"]`);
      const button = row?.querySelector<HTMLButtonElement>(`[data-action="${action}"]:not([disabled])`) ?? row?.querySelector<HTMLInputElement>("input");
      button?.focus();
    });
  };

  const onNewKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && draft === "" && list.length) {
      e.preventDefault();
      remove(list.length - 1);
    }
  };

  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="text-[13px] font-medium text-fg">{label}</legend>
      {hint ? (
        <p id={hintId} className="-mt-1 text-[12.5px] leading-snug text-faint">
          {hint}
        </p>
      ) : null}

      {list.length ? (
        <ol ref={listRef} className="space-y-1">
          {list.map((item, i) => (
            <li
              key={i}
              data-row={i}
              className="group flex items-center gap-1 rounded-lg border border-border bg-surface pl-2 pr-1 transition-colors focus-within:border-accent"
            >
              <span aria-hidden="true" className="w-5 shrink-0 text-right font-mono text-[11.5px] text-faint">
                {ordered ? `${i + 1}.` : "•"}
              </span>
              <input
                type="text"
                value={item}
                aria-label={`${noun} ${i + 1}`}
                onChange={(e) => onChange(list.map((v, j) => (j === i ? e.target.value : v)))}
                onBlur={(e) => {
                  // Drop emptied items, unless focus moved to this row's own buttons.
                  if (!e.target.value.trim() && !e.currentTarget.closest("li")?.contains(e.relatedTarget as Node | null)) remove(i);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    newRef.current?.focus();
                  }
                }}
                className="h-8 min-w-0 flex-1 bg-transparent px-1 text-[13.5px] text-fg outline-none focus-visible:outline-none"
              />
              <button type="button" data-action="up" onMouseDown={keepFocus} className={iconBtn} disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Subir ${noun} ${i + 1}`}>
                <ChevronUpIcon size={14} />
              </button>
              <button
                type="button"
                data-action="down"
                onMouseDown={keepFocus}
                className={iconBtn}
                disabled={i === list.length - 1}
                onClick={() => move(i, 1)}
                aria-label={`Bajar ${noun} ${i + 1}`}
              >
                <ChevronDownSmallIcon size={14} />
              </button>
              <button type="button" onMouseDown={keepFocus} className={iconBtnDanger} onClick={() => remove(i)} aria-label={`Eliminar ${noun} ${i + 1}`}>
                <CloseIcon size={14} />
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="flex gap-2">
        <input
          ref={newRef}
          id={inputId}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onNewKeyDown}
          placeholder={placeholder ?? `Escribe un ${noun} y pulsa Enter`}
          aria-label={`Añadir ${noun} a ${label}`}
          aria-describedby={hint ? hintId : undefined}
          className={inputCls}
        />
        <button type="button" onClick={add} disabled={!draft.trim()} className={btn("secondary", "md")} aria-label={`Añadir ${noun}`}>
          <PlusIcon size={14} />
          <span className="hidden sm:inline">Añadir</span>
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
    </fieldset>
  );
}
