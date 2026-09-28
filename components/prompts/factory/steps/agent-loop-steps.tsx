import { LOOP_FIELDS, LOOP_OFF, STATE_FIELDS, STATE_OFF } from "../labels";
import { fieldDomId } from "../steps";
import { CheckboxField, Legend } from "../ui";
import { LoopDiagram } from "./loop-diagram";
import type { StepProps } from "./types";

/** Step 11 (agent) — which state the agent keeps between iterations. */
export function AgentStateStep({ spec, actions }: StepProps) {
  const state = { ...STATE_OFF, ...spec.agent?.state };
  return (
    <fieldset id={fieldDomId("agent.state")} className="min-w-0">
      <Legend hint="Lo que el agente registra y actualiza en cada iteración.">Estado del agente</Legend>
      <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
        {STATE_FIELDS.map((f) => (
          <CheckboxField key={f.key} label={f.label} hint={f.hint} checked={state[f.key]} onChange={(checked) => actions.patchAgent({ state: { ...state, [f.key]: checked } })} />
        ))}
      </div>
    </fieldset>
  );
}

/** Step 12 (agent) — loop phases, with a compact ring of the enabled ones. */
export function AgentLoopStep({ spec, actions }: StepProps) {
  const loop = { ...LOOP_OFF, ...spec.agent?.loop };
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <fieldset id={fieldDomId("agent.loop")} className="min-w-0">
        <Legend hint="Fases de cada iteración, en este orden.">Fases del loop</Legend>
        <div className="mt-2 space-y-0.5">
          {LOOP_FIELDS.map((f, i) => (
            <CheckboxField
              key={f.key}
              label={
                <>
                  <span className="mr-1.5 font-mono text-[11.5px] text-faint">{i + 1}.</span>
                  {f.label}
                </>
              }
              checked={loop[f.key]}
              onChange={(checked) => actions.patchAgent({ loop: { ...loop, [f.key]: checked } })}
            />
          ))}
        </div>
      </fieldset>
      <div className="flex justify-center rounded-xl border border-border bg-subtle/60 p-2">
        <LoopDiagram loop={loop} />
      </div>
    </div>
  );
}
