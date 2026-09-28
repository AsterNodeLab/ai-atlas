import type { ContextItem, ContextKind, PromptInput } from "@/prompt-factory";
import { TrashIcon, PlusIcon } from "../icons";
import { CONTEXT_KINDS, CONTEXT_KIND_LABELS } from "../labels";
import { fieldDomId } from "../steps";
import { btn, cx, iconBtnDanger, inputClass, inputCls, Legend, selectClass, textareaCls } from "../ui";
import type { StepProps } from "./types";

/** Focus a control that will exist after the next render (newly added row). */
const focusSoon = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus());

/** Step 4 — typed context items and named inputs (name / description / value). */
export function StepContext({ spec, actions }: StepProps) {
  const context = spec.context ?? [];
  const inputs = spec.inputs ?? [];

  const setContext = (next: ContextItem[]) => actions.patch({ context: next });
  const setInputs = (next: PromptInput[]) => actions.patch({ inputs: next });

  return (
    <div className="space-y-6">
      <fieldset id={fieldDomId("context")} className="min-w-0 space-y-2">
        <Legend hint="Lo que el modelo necesita saber y no puede adivinar.">Contexto</Legend>
        {context.length ? (
          <ol className="space-y-2">
            {context.map((item, i) => (
              <li key={i} className="space-y-2 rounded-xl border border-border bg-surface p-2.5">
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`pf-context-${i}-kind`}>
                    Tipo del contexto {i + 1}
                  </label>
                  <select
                    id={`pf-context-${i}-kind`}
                    value={item.kind}
                    onChange={(e) => setContext(context.map((c, j) => (j === i ? { ...c, kind: e.target.value as ContextKind } : c)))}
                    className={selectClass({ size: "sm", width: "w-auto" })}
                  >
                    {CONTEXT_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {CONTEXT_KIND_LABELS[k]}
                      </option>
                    ))}
                  </select>
                  <span className="ml-auto font-mono text-[11.5px] text-faint">#{i + 1}</span>
                  <button
                    type="button"
                    className={iconBtnDanger}
                    onClick={() => setContext(context.filter((_, j) => j !== i))}
                    aria-label={`Eliminar contexto ${i + 1}`}
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
                <label className="sr-only" htmlFor={`pf-context-${i}-text`}>
                  Texto del contexto {i + 1} ({CONTEXT_KIND_LABELS[item.kind]})
                </label>
                <textarea
                  id={`pf-context-${i}-text`}
                  rows={3}
                  value={item.text}
                  onChange={(e) => setContext(context.map((c, j) => (j === i ? { ...c, text: e.target.value } : c)))}
                  placeholder="Pega o describe la información…"
                  className={textareaCls}
                />
              </li>
            ))}
          </ol>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {CONTEXT_KINDS.map((kind) => (
            <button key={kind} type="button" className={btn("secondary", "xs")} onClick={() => {
                const index = context.length;
                setContext([...context, { kind, text: "" }]);
                focusSoon(`pf-context-${index}-text`);
              }}>
              <PlusIcon size={13} />
              {CONTEXT_KIND_LABELS[kind]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset id={fieldDomId("inputs")} className="min-w-0 space-y-2">
        <Legend hint="Datos concretos que recibirá el prompt: cómo se llaman, para qué sirven y, si ya lo tienes, su valor.">Entradas</Legend>
        {inputs.length ? (
          <ol className="space-y-2">
            {inputs.map((input, i) => {
              const update = (patch: Partial<PromptInput>) => setInputs(inputs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
              return (
                <li key={i} className="grid gap-2 rounded-xl border border-border bg-surface p-2.5 sm:grid-cols-2">
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <span className="font-mono text-[11.5px] text-faint">Entrada {i + 1}</span>
                    <button
                      type="button"
                      className={cx(iconBtnDanger, "ml-auto")}
                      onClick={() => setInputs(inputs.filter((_, j) => j !== i))}
                      aria-label={`Eliminar entrada ${i + 1}`}
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                  <input
                    id={`pf-input-${i}-name`}
                    aria-label={`Nombre de la entrada ${i + 1}`}
                    value={input.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="Nombre (p. ej. reseñas)"
                    className={inputClass({ mono: true })}
                  />
                  <input
                    aria-label={`Descripción de la entrada ${i + 1}`}
                    value={input.description ?? ""}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Descripción (opcional)"
                    className={inputCls}
                  />
                  <textarea
                    aria-label={`Valor de la entrada ${i + 1}`}
                    rows={2}
                    value={input.value ?? ""}
                    onChange={(e) => update({ value: e.target.value })}
                    placeholder="Valor (opcional)"
                    className={cx(textareaCls, "sm:col-span-2")}
                  />
                </li>
              );
            })}
          </ol>
        ) : null}
        <button type="button" className={btn("secondary", "sm")} onClick={() => {
            const index = inputs.length;
            setInputs([...inputs, { name: "" }]);
            focusSoon(`pf-input-${index}-name`);
          }}>
          <PlusIcon size={14} />
          Añadir entrada
        </button>
      </fieldset>
    </div>
  );
}
