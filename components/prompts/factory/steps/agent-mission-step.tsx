import { ListEditor } from "../list-editor";
import { fieldDomId } from "../steps";
import { TextField } from "../ui";
import type { StepProps } from "./types";

/** Step 9 (agent) — mission and success criteria. */
export function AgentMissionStep({ spec, actions }: StepProps) {
  const agent = spec.agent ?? {};
  return (
    <div className="space-y-4">
      <TextField
        id={fieldDomId("agent.mission")}
        label="Misión"
        multiline
        rows={3}
        value={agent.mission}
        onChange={(mission) => actions.patchAgent({ mission })}
        placeholder="Ej.: Mantener actualizado el inventario de precios de la competencia y avisar de cambios relevantes."
        hint="Para qué existe el agente, más allá de una sola respuesta."
      />
      <ListEditor
        id={fieldDomId("agent.successCriteria")}
        label="Criterios de éxito"
        hint="Condiciones observables que indican que la misión se cumplió."
        noun="criterio"
        items={agent.successCriteria}
        onChange={(successCriteria) => actions.patchAgent({ successCriteria })}
        placeholder="Ej.: Todos los productos tienen precio de hoy"
      />
    </div>
  );
}
