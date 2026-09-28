import type { AgentConfig } from "@/prompt-factory";
import { MEMORY_FIELDS } from "../labels";
import { fieldDomId } from "../steps";
import { CheckboxField, Legend, NumberField } from "../ui";
import type { StepProps } from "./types";

type Recovery = NonNullable<AgentConfig["errorRecovery"]>;
type Budget = NonNullable<AgentConfig["budget"]>;

/** Step 13 (agent) — error recovery, budget limits and memory types. */
export function AgentBudgetStep({ spec, actions }: StepProps) {
  const agent = spec.agent ?? {};
  const recovery: Recovery = { enabled: false, ...agent.errorRecovery };
  const budget: Budget = { ...agent.budget };
  const memory = agent.memory ?? {};
  const setRecovery = (patch: Partial<Recovery>) => actions.patchAgent({ errorRecovery: { ...recovery, ...patch } });
  const setBudget = (patch: Partial<Budget>) => actions.patchAgent({ budget: { ...budget, ...patch } });

  return (
    <div className="space-y-5">
      <fieldset id={fieldDomId("agent.errorRecovery")} className="min-w-0 space-y-2">
        <Legend hint="Qué hace el agente cuando algo falla.">Recuperación de errores</Legend>
        <CheckboxField label="Activar recuperación de errores" checked={recovery.enabled} onChange={(enabled) => setRecovery({ enabled })} />
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField
            label="Reintentos equivalentes"
            hint="Veces que repite la misma acción."
            value={recovery.maxEquivalentRetries}
            onChange={(maxEquivalentRetries) => setRecovery({ maxEquivalentRetries })}
            disabled={!recovery.enabled}
          />
          <NumberField
            label="Replanificar tras N fallos"
            hint="Fallos antes de cambiar de plan."
            min={1}
            value={recovery.replanAfterFailures}
            onChange={(replanAfterFailures) => setRecovery({ replanAfterFailures })}
            disabled={!recovery.enabled}
          />
          <NumberField
            label="Escalar tras N estrategias"
            hint="Estrategias fallidas antes de pedir ayuda."
            min={1}
            value={recovery.escalateAfterStrategies}
            onChange={(escalateAfterStrategies) => setRecovery({ escalateAfterStrategies })}
            disabled={!recovery.enabled}
          />
        </div>
      </fieldset>

      <fieldset id={fieldDomId("agent.budget")} className="min-w-0 space-y-2">
        <Legend hint="Límites duros. Vacío = sin límite explícito.">Presupuesto</Legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label="Iteraciones máximas" min={1} value={budget.maxIterations} onChange={(maxIterations) => setBudget({ maxIterations })} />
          <NumberField label="Llamadas a herramientas máximas" min={1} max={9999} value={budget.maxToolCalls} onChange={(maxToolCalls) => setBudget({ maxToolCalls })} />
          <NumberField label="Reintentos totales máximos" value={budget.maxRetries} onChange={(maxRetries) => setBudget({ maxRetries })} />
        </div>
      </fieldset>

      <fieldset id={fieldDomId("agent.memory")} className="min-w-0">
        <Legend hint="Tipos de memoria que el agente debe mantener.">Memoria</Legend>
        <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
          {MEMORY_FIELDS.map((f) => (
            <CheckboxField
              key={f.key}
              label={f.label}
              hint={f.hint}
              checked={Boolean(memory[f.key])}
              onChange={(checked) => actions.patchAgent({ memory: { ...memory, [f.key]: checked } })}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}
