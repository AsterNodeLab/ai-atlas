import type { Metadata } from "next";
import Link from "next/link";
import { Callout, RelatedChips, Section } from "@/components/glossary/article-blocks";
import { MobileToc, ReadingProgress, TableOfContents } from "@/components/glossary/article-client";
import { InlineText } from "@/components/glossary/rich-text";
import {
  agentPrompt,
  commonMistakes,
  firstPromptSteps,
  intentExamples,
  intentPrompt,
  promptTemplate,
  providers,
  relatedSlugs,
  requestShape,
  routes,
  templateParts,
  tocItems,
  workflowPrompt,
  workflowVsAgent,
} from "@/components/llms/content";
import { CodePanel } from "@/components/prompts/learn/code-panel";
import { Tabs } from "@/components/prompts/learn/tabs";
import { Bullets, inlineCode, Lead, SubSection, Tag } from "@/components/prompts/learn/ui";
import { ExternalLink, ResourceHeader, domainOf } from "@/components/resources/resource-header";
import { ArrowRightIcon, ExternalIcon } from "@/components/ui/icons";
import { getTerms } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "LLMs y prompting efectivo: guía práctica",
  description:
    "Qué hace un LLM dentro de un workflow y dentro de un agente de IA, cómo conectarlo con las APIs de OpenAI, Claude y Gemini o con n8n, una plantilla de prompt y un ejemplo de clasificación de intenciones con salida JSON.",
  alternates: { canonical: "/llms" },
};

const label = (id: string) => tocItems.find((t) => t.id === id)?.label ?? id;

/** Horizontal chain of steps (wraps on small screens). */
function Flow({ steps, accent }: { steps: string[]; accent?: number[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[14px]">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 ${
              accent?.includes(i) ? "border-[color-mix(in_srgb,var(--accent)_50%,var(--border))] bg-accent-soft font-medium text-accent-text" : "border-border text-fg"
            }`}
          >
            {s}
          </span>
          {i < steps.length - 1 ? (
            <span aria-hidden="true" className="text-faint">
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function Card({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border p-5">
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">{eyebrow}</p>
      <p className="mt-1 text-[17px] font-semibold tracking-[-0.01em] text-fg">{title}</p>
      <div className="mt-3 space-y-4 text-[15px] leading-relaxed text-muted">{children}</div>
    </div>
  );
}

export default function LlmsPage() {
  const terms = getTerms(relatedSlugs);
  if (terms.length !== relatedSlugs.length) throw new Error("/llms: related glossary terms not found");

  return (
    <div className="theme-resources mx-auto max-w-[1200px] px-4 pt-10 sm:px-6 sm:pt-14">
      <ReadingProgress />

      <ResourceHeader
        active="llms"
        eyebrow="Recursos · IA aplicada"
        title="LLMs y prompting efectivo."
        description="Qué hace un modelo de lenguaje dentro de un workflow y dentro de un agente, cómo conectarlo y cómo escribir tu primer prompt útil."
        meta={
          <>
            <span>{tocItems.length} secciones</span>
            <span>~8 min de lectura</span>
            <span>Plantillas listas para copiar</span>
          </>
        }
      />

      <div className="mt-16 lg:grid lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-16 xl:gap-20">
        <article className="mx-auto w-full min-w-0 max-w-[760px] lg:mx-0">
          <div className="mb-12 lg:hidden">
            <MobileToc items={tocItems} />
          </div>

          {/* 01 · Qué hace un LLM */}
          <Section id="que-hace" eyebrow="01 · La idea" title={label("que-hace")}>
            <Lead>
              <InlineText text="Un [[llm|LLM]] recibe texto y devuelve texto. En IA aplicada casi nunca trabaja solo: es una pieza dentro de un sistema más grande. Lo que cambia es **quién decide qué pasa después**." />
            </Lead>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Card eyebrow="Dentro de un workflow" title="Un paso más del proceso">
                <p>
                  <InlineText text="El [[workflow]] sigue una ruta que tú definiste. El LLM hace una tarea concreta en un punto del camino: clasificar, extraer datos, resumir o redactar." />
                </p>
                <Flow steps={["Trigger", "LLM clasifica", "Switch", "Acción"]} accent={[1]} />
              </Card>
              <Card eyebrow="Dentro de un agente" title="El que elige la siguiente acción">
                <p>
                  <InlineText text="En un [[ai-agent|agente]], el LLM recibe un objetivo y herramientas, y decide en cada turno qué hacer: consultar, preguntar, actuar o terminar." />
                </p>
                <Flow steps={["Objetivo", "LLM decide", "Tool", "Observa", "↺"]} accent={[1]} />
              </Card>
            </div>
            <div className="mt-6">
              <Callout label="Regla práctica" tone="accent">
                Si el proceso se repite siempre igual, usa un workflow con el LLM como paso. Si cada caso necesita pasos distintos, necesitas un agente.
              </Callout>
            </div>
          </Section>

          {/* 02 · Cómo conectarlo */}
          <Section id="conectar" eyebrow="02 · Integración" title={label("conectar")}>
            <Lead>
              <InlineText text="Hay dos caminos: llamar al modelo desde tu código con su [[api|API]], o usar una plataforma visual como n8n que ya trae los nodos listos. En ambos casos necesitas una **clave de API** del proveedor." />
            </Lead>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {providers.map((p) => (
                <li key={p.name} className="flex min-w-0 flex-col rounded-2xl border border-border p-5">
                  <p className="text-[16.5px] font-semibold text-fg">{p.name}</p>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{p.what}</p>
                  <p className="mt-3 text-[14px] leading-relaxed text-fg">
                    <span className="text-faint">Ideal para: </span>
                    {p.bestFor}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-[13.5px] font-medium">
                    <ExternalLink href={p.docs} className="inline-flex items-center gap-1 text-accent-text hover:underline">
                      Documentación <ExternalIcon size={12} />
                    </ExternalLink>
                    <ExternalLink href={p.console} className="inline-flex items-center gap-1 text-muted hover:text-fg">
                      {p.consoleLabel} · {domainOf(p.console)} <ExternalIcon size={12} />
                    </ExternalLink>
                  </div>
                </li>
              ))}
            </ul>

            <SubSection
              id="forma-llamada"
              title="La forma de una llamada"
              intro="Los tres proveedores siguen la misma idea: eliges un modelo, das instrucciones de sistema y envías los mensajes. Los nombres de los campos cambian un poco entre APIs."
            >
              <CodePanel code={requestShape} lang="json" title="solicitud · estructura general" />
              <div className="mt-4">
                <Bullets
                  items={[
                    "**model:** el modelo exacto cambia con frecuencia; tómalo siempre de la documentación oficial.",
                    "**system:** el [[system-prompt|system prompt]], con las reglas que no cambian entre mensajes.",
                    "**messages:** los datos de cada caso: aquí va el mensaje del usuario.",
                    "**temperature:** baja (0–0.3) para clasificar o extraer; más alta para ideas y redacción creativa.",
                  ]}
                />
              </div>
            </SubSection>

            <SubSection id="en-n8n" title="En n8n, sin código" intro="Los nodos de IA hacen lo mismo con una interfaz visual.">
              <Bullets
                items={[
                  "Conecta tu clave del proveedor una sola vez en las credenciales de n8n.",
                  "Para una tarea puntual, usa un nodo de cadena (**Basic LLM Chain**) o uno especializado (**Text Classifier**, **Information Extractor**).",
                  "Para un agente, usa el nodo **AI Agent** y conéctale herramientas: Gmail, Google Sheets, HTTP Request, otros workflows…",
                  "Después del LLM, un nodo **Switch** o **IF** lee el JSON y decide la ruta.",
                ]}
              />
            </SubSection>
          </Section>

          {/* 03 · Plantilla */}
          <Section id="plantilla" eyebrow="03 · La herramienta" title={label("plantilla")}>
            <Lead>Seis bloques que cubren casi cualquier tarea. Copia la plantilla, reemplaza lo que está entre corchetes y pon tus datos reales donde dice {"{{DATOS}}"}.</Lead>
            <div className="mt-6">
              <CodePanel code={promptTemplate} lang="md" title="plantilla · prompt.md" copyWhat="la plantilla de prompt" maxHeight={false} />
            </div>
            <dl className={`mt-8 divide-y divide-border rounded-2xl border border-border ${inlineCode}`}>
              {templateParts.map((t, i) => (
                <div key={t.name} className="grid gap-1 px-5 py-4 sm:grid-cols-[170px_1fr] sm:gap-6">
                  <dt className="text-[15px] font-semibold text-fg">
                    <span className="mr-2 font-mono text-[12px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                    {t.name}
                  </dt>
                  <dd className="text-[15px] leading-relaxed text-muted">
                    <InlineText text={t.tip} />
                  </dd>
                </div>
              ))}
            </dl>
          </Section>

          {/* 04 · Workflow vs agente */}
          <Section id="workflow-vs-agente" eyebrow="04 · Dos tipos de prompt" title={label("workflow-vs-agente")}>
            <Lead>
              El mismo caso, dos prompts distintos. En el workflow el modelo hace <strong className="text-fg">una tarea</strong> y devuelve un resultado; en el agente,{" "}
              <strong className="text-fg">elige una acción</strong> entre varias y sabe cuándo parar.
            </Lead>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <Tag>Workflow</Tag>
                  <span className="text-[14px] text-muted">pasos definidos</span>
                </div>
                <CodePanel code={workflowPrompt} lang="md" title="prompt · paso del workflow" copyWhat="el prompt de workflow" maxHeight={false} />
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <Tag tone="accent">Agente</Tag>
                  <span className="text-[14px] text-muted">elige la acción</span>
                </div>
                <CodePanel code={agentPrompt} lang="md" title="prompt · agente" copyWhat="el prompt de agente" maxHeight={false} />
              </div>
            </div>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[560px] text-left text-[14.5px]">
                <thead>
                  <tr className="border-b border-border bg-subtle text-[13px] text-muted">
                    <th scope="col" className="px-4 py-3 font-medium">
                      &nbsp;
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Workflow
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-accent-text">
                      Agente
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {workflowVsAgent.map((r) => (
                    <tr key={r.aspect}>
                      <th scope="row" className="px-4 py-3 font-medium text-fg">
                        {r.aspect}
                      </th>
                      <td className="px-4 py-3 text-muted">{r.workflow}</td>
                      <td className="px-4 py-3 text-muted">{r.agent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 05 · Ejemplo práctico */}
          <Section id="ejemplo" eyebrow="05 · Ejemplo práctico" title={label("ejemplo")}>
            <Lead>
              <InlineText text="El caso más útil para empezar: un mensaje de cliente entra, el LLM detecta **qué quiere** y **qué datos trae**, y devuelve un JSON. El workflow lee ese JSON y decide qué hacer. Es una [[structured-output|salida estructurada]]: el modelo no responde al cliente, prepara la decisión." />
            </Lead>
            <div className="mt-6">
              <Flow steps={["Mensaje del cliente", "LLM: intención + datos", "JSON", "Switch", "Acción"]} accent={[1, 2]} />
            </div>

            <SubSection id="prompt-intencion" title="1. El prompt">
              <CodePanel code={intentPrompt} lang="md" title="prompt · clasificar y extraer" copyWhat="el prompt de clasificación" />
            </SubSection>

            <SubSection id="salidas" title="2. Lo que devuelve el modelo" intro="Tres mensajes reales y el JSON que produce el mismo prompt.">
              <Tabs
                label="Ejemplos de mensajes"
                idPrefix="intencion"
                items={intentExamples.map((ex) => ({
                  id: ex.id,
                  eyebrow: ex.eyebrow,
                  label: ex.label,
                  panel: (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-border bg-subtle px-5 py-4">
                        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-faint">Mensaje del cliente</p>
                        <p className="mt-1.5 text-[15.5px] leading-relaxed text-fg">{ex.message}</p>
                      </div>
                      <CodePanel code={ex.output} lang="json" title="salida del LLM · JSON" maxHeight={false} />
                      <p className="flex gap-2 text-[15px] leading-relaxed text-muted">
                        <ArrowRightIcon size={15} className="mt-1 shrink-0 text-accent-text" />
                        <span>{ex.route}</span>
                      </p>
                    </div>
                  ),
                }))}
              />
            </SubSection>

            <SubSection id="ruta" title="3. El workflow decide" intro="Un nodo Switch lee el campo intencion (y la confianza) y elige la ruta. El LLM clasifica; las reglas de negocio siguen en tus manos.">
              <div className="overflow-hidden rounded-2xl border border-border">
                {routes.map((r) => (
                  <div key={r.intent} className="grid gap-1 border-b border-border px-5 py-3 last:border-b-0 sm:grid-cols-[230px_1fr] sm:gap-6">
                    <code className="font-mono text-[13.5px] text-accent-text">{r.intent}</code>
                    <span className="text-[15px] text-muted">{r.action}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Callout label="Por qué funciona" tone="neutral">
                  Valores permitidos cerrados, «null» cuando falta un dato y un umbral de confianza: así el workflow nunca actúa sobre una suposición del modelo.
                </Callout>
              </div>
            </SubSection>
          </Section>

          {/* 06 · Primer prompt útil */}
          <Section id="primer-prompt" eyebrow="06 · Hazlo hoy" title={label("primer-prompt")}>
            <ol className={`space-y-4 ${inlineCode}`}>
              {firstPromptSteps.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-[12.5px] font-medium text-accent-text">{i + 1}</span>
                  <span className="pt-0.5 text-[15.5px] leading-relaxed text-fg">
                    <InlineText text={s} />
                  </span>
                </li>
              ))}
            </ol>

            <SubSection id="errores" title="Errores frecuentes">
              <Bullets items={commonMistakes} tone="bad" />
            </SubSection>

            <div className="mt-12 flex flex-wrap gap-3">
              <Link href="/prompts/factory" className="group inline-flex h-11 items-center gap-2 rounded-xl bg-fg px-5 text-[15px] font-medium text-bg transition-opacity hover:opacity-90">
                Construir un prompt con la Prompt Factory <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/agents" className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-5 text-[15px] font-medium text-fg hover:border-border-strong">
                Ver la anatomía de un agente
              </Link>
            </div>

            <h3 className="mt-12 text-[19px] font-semibold tracking-[-0.015em] text-fg sm:text-[20px]">Conceptos relacionados</h3>
            <p className="mb-5 mt-2 text-[16px] leading-relaxed text-muted">Cada uno tiene su ficha en el glosario, con ejemplos.</p>
            <RelatedChips terms={terms} />
          </Section>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-8">
            <TableOfContents items={tocItems} title="En esta guía" />
          </div>
        </aside>
      </div>
    </div>
  );
}
