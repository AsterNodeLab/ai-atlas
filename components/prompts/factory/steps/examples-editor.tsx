import type { Example } from "@/prompt-factory";
import { PlusIcon, TrashIcon } from "../icons";
import { fieldDomId } from "../steps";
import { btn, cx, iconBtnDanger, textareaClass } from "../ui";
import type { StepProps } from "./types";

/** Step 8 — few-shot examples (input / expected output pairs). */
export function ExamplesEditor({ spec, actions }: StepProps) {
  const examples = spec.examples ?? [];
  const setExamples = (next: Example[]) => actions.patch({ examples: next });
  const update = (i: number, patch: Partial<Example>) => setExamples(examples.map((ex, j) => (j === i ? { ...ex, ...patch } : ex)));

  const add = () => {
    const index = examples.length;
    setExamples([...examples, { input: "", output: "" }]);
    requestAnimationFrame(() => document.getElementById(`pf-example-${index}-input`)?.focus());
  };

  return (
    <div id={fieldDomId("examples")} className="space-y-3">
      <p className="text-[12.5px] leading-snug text-faint">
        Pares de entrada y salida esperada. Muestran el formato y el tono mejor que cualquier descripción.
      </p>
      {examples.length ? (
        <ol className="space-y-3">
          {examples.map((ex, i) => (
            <li key={i} className="rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
                <span className="text-[13px] font-medium text-fg">Ejemplo {i + 1}</span>
                <button
                  type="button"
                  className={cx(iconBtnDanger, "ml-auto")}
                  onClick={() => setExamples(examples.filter((_, j) => j !== i))}
                  aria-label={`Eliminar ejemplo ${i + 1}`}
                >
                  <TrashIcon size={14} />
                </button>
              </div>
              <div className="grid gap-2 p-3 md:grid-cols-2">
                <div className="min-w-0 space-y-1">
                  <label htmlFor={`pf-example-${i}-input`} className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-faint">
                    Ejemplo {i + 1} · Input
                  </label>
                  <textarea
                    id={`pf-example-${i}-input`}
                    rows={4}
                    value={ex.input}
                    onChange={(e) => update(i, { input: e.target.value })}
                    className={textareaClass({ mono: true })}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <label htmlFor={`pf-example-${i}-output`} className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-faint">
                    Ejemplo {i + 1} · Expected output
                  </label>
                  <textarea
                    id={`pf-example-${i}-output`}
                    rows={4}
                    value={ex.output}
                    onChange={(e) => update(i, { output: e.target.value })}
                    className={textareaClass({ mono: true })}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
      <button type="button" onClick={add} className={btn("secondary", "sm")}>
        <PlusIcon size={14} />
        Añadir ejemplo
      </button>
    </div>
  );
}
