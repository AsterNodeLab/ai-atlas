import { useId, useState, type KeyboardEvent } from "react";
import type { DecisionRule } from "@/prompt-factory";
import { CloseIcon } from "@/components/ui/icons";
import { PlusIcon } from "../icons";
import { btn, cx, iconBtnDanger, inputClass, inputCls, Legend } from "../ui";

/** "Si … → Entonces …" pairs. Enter in the second field adds the rule. */
export function DecisionRulesEditor({ id, rules, onChange }: { id?: string; rules: DecisionRule[] | undefined; onChange: (rules: DecisionRule[]) => void }) {
  const list = rules ?? [];
  const [when, setWhen] = useState("");
  const [then, setThen] = useState("");
  const autoId = useId();
  const whenId = id ?? `${autoId}-when`;

  const add = () => {
    if (!when.trim() || !then.trim()) return;
    onChange([...list, { when: when.trim(), then: then.trim() }]);
    setWhen("");
    setThen("");
    document.getElementById(whenId)?.focus();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      add();
    }
  };
  const update = (i: number, patch: Partial<DecisionRule>) => onChange(list.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <fieldset className="min-w-0 space-y-2">
      <Legend hint="Qué hacer ante situaciones concretas.">Reglas de decisión</Legend>
      {list.length ? (
        <ol className="space-y-1.5">
          {list.map((rule, i) => (
            <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-1.5 rounded-lg border border-border bg-surface p-1.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="w-7 shrink-0 text-right font-mono text-[11px] text-faint">Si</span>
                <input aria-label={`Condición de la regla ${i + 1}`} value={rule.when} onChange={(e) => update(i, { when: e.target.value })} className={inputClass({ size: "sm" })} />
              </div>
              <button
                type="button"
                className={cx(iconBtnDanger, "self-center sm:order-last")}
                onClick={() => onChange(list.filter((_, j) => j !== i))}
                aria-label={`Eliminar regla ${i + 1}`}
              >
                <CloseIcon size={14} />
              </button>
              <div className="col-span-1 flex min-w-0 items-center gap-1.5">
                <span className="w-7 shrink-0 text-right font-mono text-[11px] text-faint">→</span>
                <input aria-label={`Acción de la regla ${i + 1}`} value={rule.then} onChange={(e) => update(i, { then: e.target.value })} className={inputClass({ size: "sm" })} />
              </div>
            </li>
          ))}
        </ol>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <input id={whenId} aria-label="Nueva regla: condición (si…)" value={when} onChange={(e) => setWhen(e.target.value)} onKeyDown={onKeyDown} placeholder="Si… (p. ej. falta un dato)" className={inputCls} />
        <input aria-label="Nueva regla: acción (entonces…)" value={then} onChange={(e) => setThen(e.target.value)} onKeyDown={onKeyDown} placeholder="Entonces… (p. ej. pregunta antes de seguir)" className={inputCls} />
        <button type="button" className={btn("secondary", "md")} disabled={!when.trim() || !then.trim()} onClick={add}>
          <PlusIcon size={14} />
          Añadir regla
        </button>
      </div>
    </fieldset>
  );
}
