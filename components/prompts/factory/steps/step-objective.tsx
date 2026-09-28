import { fieldDomId } from "../steps";
import { TextField } from "../ui";
import type { StepProps } from "./types";

/** Step 3 — objective (required by the engine), optional role and concrete task. */
export function StepObjective({ spec, actions }: StepProps) {
  return (
    <div className="space-y-4">
      <TextField
        id={fieldDomId("objective")}
        label="¿Qué resultado debe producir el modelo?"
        multiline
        rows={3}
        value={spec.objective}
        onChange={(objective) => actions.patch({ objective })}
        placeholder="Ej.: Un resumen ejecutivo de 5 viñetas con las quejas más frecuentes de los clientes."
        hint="Describe el resultado, no el proceso."
      />
      <TextField
        id={fieldDomId("role")}
        label="Rol"
        optional
        value={spec.role}
        onChange={(role) => actions.patch({ role })}
        placeholder="Ej.: analista de experiencia de cliente"
      />
      <TextField
        id={fieldDomId("task")}
        label="Tarea concreta"
        optional
        multiline
        rows={2}
        value={spec.task}
        onChange={(task) => actions.patch({ task })}
        placeholder="Ej.: Lee las reseñas adjuntas, agrúpalas por tema y cuenta cuántas hay en cada grupo."
        hint="Úsala cuando la acción concreta sea distinta del objetivo."
      />
    </div>
  );
}
