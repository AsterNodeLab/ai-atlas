import { APPROVAL_CATEGORIES, APPROVAL_LABELS } from "../labels";
import { ListEditor } from "../list-editor";
import { fieldDomId } from "../steps";
import { CheckboxField, Legend } from "../ui";
import type { StepProps } from "./types";

/** Step 14 (agent) — human approval, stop conditions, escalation and final verification. */
export function AgentSafetyStep({ spec, actions }: StepProps) {
  const agent = spec.agent ?? {};
  const approvals = agent.humanApproval ?? [];
  return (
    <div className="space-y-5">
      <fieldset id={fieldDomId("agent.humanApproval")} className="min-w-0">
        <Legend hint="Acciones que el agente nunca hace sin tu confirmación explícita.">Requiere aprobación humana</Legend>
        <div className="mt-2 grid gap-x-4 gap-y-0.5 sm:grid-cols-2">
          {APPROVAL_CATEGORIES.map((c) => (
            <CheckboxField
              key={c}
              label={APPROVAL_LABELS[c]}
              checked={approvals.includes(c)}
              onChange={(checked) => actions.patchAgent({ humanApproval: checked ? [...approvals, c] : approvals.filter((a) => a !== c) })}
            />
          ))}
        </div>
      </fieldset>
      <ListEditor
        id={fieldDomId("agent.humanApprovalRules")}
        label="Reglas de aprobación personalizadas"
        noun="regla"
        items={agent.humanApprovalRules}
        onChange={(humanApprovalRules) => actions.patchAgent({ humanApprovalRules })}
        placeholder="Ej.: Pedir confirmación antes de contactar a un cliente"
      />
      <ListEditor
        id={fieldDomId("agent.stopConditions")}
        label="Condiciones de parada"
        hint="Cuándo el agente debe detenerse, haya terminado o no."
        noun="condición"
        items={agent.stopConditions}
        onChange={(stopConditions) => actions.patchAgent({ stopConditions })}
        placeholder="Ej.: Se alcanzó el presupuesto de iteraciones"
      />
      <ListEditor
        id={fieldDomId("agent.escalationRules")}
        label="Reglas de escalamiento"
        hint="Cuándo y cómo pedir ayuda a una persona."
        noun="regla"
        items={agent.escalationRules}
        onChange={(escalationRules) => actions.patchAgent({ escalationRules })}
        placeholder="Ej.: Si dos fuentes se contradicen, detente y pregunta"
      />
      <ListEditor
        id={fieldDomId("agent.finalVerification")}
        label="Verificación final"
        hint="Lo que el agente comprueba antes de entregar."
        noun="verificación"
        items={agent.finalVerification}
        onChange={(finalVerification) => actions.patchAgent({ finalVerification })}
        placeholder="Ej.: Cada afirmación tiene su fuente enlazada"
      />
    </div>
  );
}
