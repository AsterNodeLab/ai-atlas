import { useId } from "react";
import type { OutputDefinition, OutputKind } from "@/prompt-factory";
import { OUTPUT_KINDS, OUTPUT_KIND_LABELS } from "../labels";
import { ListEditor } from "../list-editor";
import { fieldDomId } from "../steps";
import { CheckboxField, cx, Legend, TextField } from "../ui";
import type { StepProps } from "./types";

const SCHEMA_LABELS: Partial<Record<OutputKind, { label: string; placeholder: string }>> = {
  json: { label: "Esquema JSON", placeholder: '{\n  "tema": "string",\n  "frecuencia": "number"\n}' },
  xml: { label: "Esqueleto XML", placeholder: "<resultado>\n  <tema></tema>\n</resultado>" },
  table: { label: "Columnas de la tabla", placeholder: "Tema | Frecuencia | Ejemplo" },
  code: { label: "Lenguaje o plantilla de código", placeholder: "TypeScript, una función pura exportada…" },
};

/** Step 7 — output format (radio grid), structure, quality criteria and definition of done. */
export function StepOutput({ spec, actions }: StepProps) {
  const name = useId();
  const output = spec.outputFormat;
  const setOutput = (patch: Partial<OutputDefinition>) => {
    if (!output && !patch.kind) return;
    actions.patch({ outputFormat: { ...(output ?? { kind: patch.kind as OutputKind }), ...patch } });
  };
  const schema = output ? (SCHEMA_LABELS[output.kind] ?? { label: "Estructura o plantilla", placeholder: "Secciones, campos o plantilla exacta…" }) : null;

  return (
    <div className="space-y-5">
      <fieldset id={fieldDomId("outputFormat")} className="min-w-0">
        <Legend hint="Cómo debe entregar el resultado el modelo.">Formato</Legend>
        <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {OUTPUT_KINDS.map((kind) => {
            const checked = output?.kind === kind;
            return (
              <label
                key={kind}
                className={cx(
                  "flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 transition-colors focus-within:border-accent",
                  checked ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong",
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={kind}
                  checked={checked}
                  onChange={() => setOutput({ kind })}
                  className="mt-[3px] size-3.5 shrink-0 accent-[var(--accent)]"
                />
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium leading-tight text-fg">{OUTPUT_KIND_LABELS[kind].label}</span>
                  <span className="block text-[11.5px] leading-snug text-faint">{OUTPUT_KIND_LABELS[kind].hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {output && schema ? (
        <div className="space-y-3 rounded-xl border border-border bg-subtle/60 p-3">
          <TextField
            label="Descripción de la estructura"
            optional
            multiline
            rows={2}
            value={output.description}
            onChange={(description) => setOutput({ description })}
            placeholder="Ej.: Informe con 5 secciones: resumen, hallazgos, riesgos, recomendaciones y próximos pasos."
          />
          <TextField label={schema.label} optional multiline rows={4} mono value={output.schema} onChange={(value) => setOutput({ schema: value })} placeholder={schema.placeholder} />
          <CheckboxField
            label="Estructura exacta"
            hint="El modelo debe respetar la estructura al pie de la letra, sin secciones extra."
            checked={Boolean(output.exactStructure)}
            onChange={(exactStructure) => setOutput({ exactStructure })}
          />
        </div>
      ) : (
        <p className="text-[12.5px] text-faint">Elige un formato para describir su estructura.</p>
      )}

      <ListEditor
        id={fieldDomId("qualityCriteria")}
        label="Criterios de calidad"
        hint="Cómo se reconoce una buena respuesta."
        noun="criterio"
        items={spec.qualityCriteria}
        onChange={(qualityCriteria) => actions.patch({ qualityCriteria })}
        placeholder="Ej.: Cada tema incluye al menos una cita textual"
      />
      <ListEditor
        id={fieldDomId("definitionOfDone")}
        label="Definition of Done"
        hint="Condiciones verificables para dar la tarea por terminada."
        noun="condición"
        items={spec.definitionOfDone}
        onChange={(definitionOfDone) => actions.patch({ definitionOfDone })}
        placeholder="Ej.: La tabla suma el total de reseñas analizadas"
      />
    </div>
  );
}
