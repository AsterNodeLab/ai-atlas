import { useState } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";
import { ListEditor } from "../list-editor";
import { fieldDomId } from "../steps";
import { DecisionRulesEditor } from "./decision-rules-editor";
import type { StepProps } from "./types";

/** Step 6 — constraints, plus priorities, decision rules and workflow under "Avanzado". */
export function StepConstraints({ spec, actions }: StepProps) {
  const advancedCount = (spec.priorities?.length ?? 0) + (spec.decisionRules?.length ?? 0) + (spec.workflow?.length ?? 0);
  // Opens by default when there is advanced content; afterwards the user decides.
  const [advancedOpen, setAdvancedOpen] = useState(advancedCount > 0);
  return (
    <div className="space-y-4">
      <ListEditor
        id={fieldDomId("constraints")}
        label="Restricciones"
        hint="Límites que el modelo no debe cruzar (separados de los requisitos)."
        noun="restricción"
        items={spec.constraints}
        onChange={(constraints) => actions.patch({ constraints })}
        placeholder="Ej.: No inventes datos que no estén en las reseñas"
      />

      <details open={advancedOpen} onToggle={(e) => setAdvancedOpen(e.currentTarget.open)} className="group rounded-xl border border-border">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-fg hover:bg-subtle [&::-webkit-details-marker]:hidden">
          <ChevronRightIcon size={14} className="text-faint transition-transform group-open:rotate-90" />
          Avanzado
          <span className="hidden truncate text-[12.5px] font-normal text-faint sm:inline">Prioridades, reglas de decisión y flujo de trabajo</span>
          {advancedCount ? <span className="ml-auto font-mono text-[11.5px] text-faint">{advancedCount}</span> : null}
        </summary>
        <div className="space-y-5 border-t border-border p-3">
          <ListEditor
            id={fieldDomId("priorities")}
            label="Prioridades"
            hint="En orden: qué gana cuando dos objetivos chocan."
            noun="prioridad"
            ordered
            items={spec.priorities}
            onChange={(priorities) => actions.patch({ priorities })}
            placeholder="Ej.: Exactitud antes que brevedad"
          />
          <DecisionRulesEditor id={fieldDomId("decisionRules")} rules={spec.decisionRules} onChange={(decisionRules) => actions.patch({ decisionRules })} />
          <ListEditor
            id={fieldDomId("workflow")}
            label="Flujo de trabajo"
            hint="Pasos ordenados que el modelo debe seguir."
            noun="paso"
            ordered
            items={spec.workflow}
            onChange={(workflow) => actions.patch({ workflow })}
            placeholder="Ej.: Agrupar las reseñas por tema"
          />
        </div>
      </details>
    </div>
  );
}
