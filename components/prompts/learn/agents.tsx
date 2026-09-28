import { RichText } from "@/components/glossary/rich-text";
import { ChevronRightIcon } from "@/components/ui/icons";
import { AgentLoop } from "./agent-loop";
import { AgentReliability } from "./agent-reliability";
import { CodePanel } from "./code-panel";
import {
  agentBlockGroups,
  agentTemplate,
  loopDecisions,
  loopExampleDecision,
  loopScenario,
  loopSteps,
  stateExample,
  stateFields,
  toolPolicy,
} from "./content";
import { Bullets, SubSection, Tag } from "./ui";

const blockStarts = agentBlockGroups.map((_, gi) => 1 + agentBlockGroups.slice(0, gi).reduce((sum, g) => sum + g.items.length, 0));

function AgentStructure() {
  return (
    <>
      <div className="space-y-3">
        {agentBlockGroups.map((g, gi) => (
          <div
            key={g.title}
            className={`rounded-2xl border p-4 sm:p-5 ${g.core ? "border-[color-mix(in_srgb,var(--accent)_40%,var(--border))] bg-accent-soft" : "border-border"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-[15.5px] font-semibold text-fg">
                {g.title} <span className="ml-1 font-mono text-[12.5px] font-normal text-faint">{g.range}</span>
              </h4>
              {g.core ? <Tag tone="accent">Lo que lo convierte en agente</Tag> : null}
            </div>
            <p className="mt-1 text-[14px] leading-snug text-muted">{g.note}</p>
            <ol start={blockStarts[gi]} className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {g.items.map((item, i) => (
                <li key={item.name} className="flex min-w-0 gap-3">
                  <span aria-hidden="true" className="mt-[2px] w-5 shrink-0 font-mono text-[11.5px] text-faint">
                    {String(blockStarts[gi] + i).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[12.5px] font-semibold tracking-[0.02em] text-fg">{item.name}</span>
                    <span className="mt-0.5 block text-[14px] leading-snug text-muted">{item.line}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <details className="group mt-4 rounded-2xl border border-border open:bg-subtle/50">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl px-5 py-4 text-[15px] font-medium text-fg [&::-webkit-details-marker]:hidden">
          <ChevronRightIcon size={15} className="transition-transform group-open:rotate-90" />
          Ver la plantilla completa de agent prompt
        </summary>
        <div className="border-t border-border p-3 sm:p-4">
          <CodePanel code={agentTemplate} lang="md" title="agent-prompt.md" copyWhat="plantilla de agent prompt" />
        </div>
      </details>
    </>
  );
}

function AgentState() {
  return (
    <>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stateFields.map((f) => (
          <div key={f.key} className="min-w-0 rounded-xl border border-border px-3.5 py-2.5">
            <dt className="font-mono text-[12.5px] font-semibold text-fg">{f.key}</dt>
            <dd className="mt-0.5 text-[13.5px] leading-snug text-muted">{f.line}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4">
        <CodePanel code={stateExample} lang="json" title="state.json · después de la vuelta 3" maxHeight={false} />
      </div>
    </>
  );
}

export function Agents() {
  return (
    <>
      <figure className="rounded-3xl border border-border px-6 py-7 sm:px-8 sm:py-8">
        <blockquote className="text-[21px] font-semibold leading-[1.3] tracking-[-0.02em] text-fg sm:text-[25px]">
          <p>
            Un prompt normal describe <span className="text-muted">qué hacer</span>.
          </p>
          <p className="mt-1.5">
            Un prompt agentic describe <span className="text-accent-text">cómo decidir qué hacer después</span>.
          </p>
        </blockquote>
      </figure>

      <div className="mt-8">
        <RichText text="Un [[ai-agent|agente]] no responde una sola vez: trabaja en un ciclo. Observa, actúa con [[tool-calling|herramientas]], revisa el resultado y decide el siguiente paso, al estilo del [[react-pattern|patrón ReAct]]. Su prompt deja de ser una petición y se vuelve un **reglamento para decidir**: qué observar, cuándo verificar, cómo recuperarse de un error y cuándo parar." />
      </div>

      <div className="mt-8">
        <AgentLoop steps={loopSteps} decisions={loopDecisions} scenario={loopScenario} exampleDecision={loopExampleDecision} />
      </div>

      <SubSection
        id="agentes-estructura"
        title="Estructura de un agent prompt"
        intro="17 bloques. Los primeros 7 son los de cualquier buen prompt; los bloques 8 a 16 son los que cambian todo."
      >
        <AgentStructure />
      </SubSection>

      <SubSection
        id="agentes-estado"
        title="Estado"
        intro="El estado es la memoria de trabajo explícita del agente. Sin él, repite pasos, olvida pendientes o declara victoria antes de tiempo. Pide que lo actualice al final de cada vuelta."
      >
        <AgentState />
      </SubSection>

      <SubSection id="agentes-herramientas" title="Herramientas y política de uso" intro="Dar herramientas no basta: el prompt dice cómo usarlas y cómo leer lo que devuelven.">
        <Bullets items={toolPolicy} />
      </SubSection>

      <AgentReliability />
    </>
  );
}
