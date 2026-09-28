import { Callout } from "@/components/glossary/article-blocks";
import { InlineText } from "@/components/glossary/rich-text";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import { CodePanel } from "./code-panel";
import { budgetLines, doneNotBecause, doneRequires, memoryTypes, retryBad, retryGood, stopConditions, verificationLevels } from "./content";
import { CompareCard, SubSection } from "./ui";

function Retries() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <CompareCard tone="bad" tag="Loop malo" title="Repetir lo mismo">
          <CodePanel code={retryBad} title="agent.log" maxHeight={false} />
          <p className="text-[14.5px] leading-relaxed text-muted">Tres intentos idénticos, cero información nueva, y una conclusión falsa: la factura sí existe.</p>
        </CompareCard>
        <CompareCard tone="good" tag="Loop bueno" title="Cambiar de estrategia">
          <ol className="space-y-2.5">
            {retryGood.map((r, i) => (
              <li key={r.step} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--lvl-1)_14%,var(--bg))] font-mono text-[12px] font-medium text-fg"
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14.5px] font-semibold text-fg">{r.step}</span>
                  <span className="block text-[14px] leading-snug text-muted">{r.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </CompareCard>
      </div>
      <div className="mt-4">
        <Callout label="La regla" tone="accent">
          Tras <strong className="font-semibold">2 fallos equivalentes</strong>, REPLANIFICA. Tras <strong className="font-semibold">3 estrategias distintas</strong>{" "}
          sin éxito, ESCALA. Reintentar lo mismo solo tiene sentido ante fallos transitorios, como un tiempo de espera o un límite de uso.
        </Callout>
      </div>
    </>
  );
}

function Verification() {
  const max = verificationLevels.length - 1;
  return (
    <>
      <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
        {verificationLevels.map((v) => (
          <li key={v.level} className="flex items-center gap-4 px-4 py-3 sm:px-5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-subtle font-mono text-[13px] font-semibold text-fg">
              <span className="sr-only">Nivel </span>
              {v.level}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-fg">{v.name}</span>
              <span className="block text-[14px] leading-snug text-muted">{v.line}</span>
            </span>
            <span aria-hidden="true" className="hidden shrink-0 gap-1 sm:flex">
              {Array.from({ length: max }, (_, i) => (
                <span key={i} className={`h-1.5 w-4 rounded-full ${i < v.level ? "bg-accent" : "bg-border"}`} />
              ))}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-4">
        <Callout label="Profundidad proporcional a la consecuencia">
          Un borrador de correo puede quedarse en el nivel 1. Registrar un pago o cambiar algo en producción exige nivel 3 o 4. Dilo en el prompt: «nivel mínimo 2; nivel 4
          antes de cualquier acción irreversible».
        </Callout>
      </div>
    </>
  );
}

function BudgetAndMemory() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="min-w-0 rounded-2xl border border-border p-5">
        <h4 className="text-[16px] font-semibold text-fg">Presupuesto</h4>
        <p className="mt-1 text-[14px] leading-snug text-muted">Sin límites, un agente atascado gasta sin avanzar. Valores de ejemplo:</p>
        <dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-subtle">
          {budgetLines.map((b) => (
            <div key={b.key} className="px-3.5 py-2.5">
              <dt className="font-mono text-[12px] uppercase tracking-[0.04em] text-faint">{b.key}</dt>
              <dd className="text-[14.5px] text-fg">{b.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="min-w-0 rounded-2xl border border-border p-5">
        <h4 className="text-[16px] font-semibold text-fg">Memoria</h4>
        <p className="mt-1 text-[14px] leading-snug text-muted">Qué recuerda el agente, y dónde. Cuatro tipos:</p>
        <ul className="mt-4 space-y-3">
          {memoryTypes.map((m) => (
            <li key={m.en} className="border-l-2 border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] pl-3.5">
              <p className="text-[14.5px] font-semibold text-fg">
                {m.name} <span className="font-mono text-[12px] font-normal text-faint">{m.en}</span>
              </p>
              <p className="text-[14px] leading-snug text-muted">{m.line}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13.5px] text-muted">
          <InlineText text="Más en [[memory]], [[short-term-memory]] y [[long-term-memory]]." />
        </p>
      </div>
    </div>
  );
}

function StopConditions() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {stopConditions.map((s) => (
        <li key={s.key} className="flex min-w-0 flex-col rounded-2xl border border-border p-4">
          <p className="font-mono text-[13px] font-semibold tracking-[0.02em] text-accent-text">{s.key}</p>
          <p className="mt-1.5 text-[14.5px] leading-snug text-fg">{s.when}</p>
          <p className="mt-3 rounded-lg bg-subtle px-3 py-2 text-[13.5px] leading-snug text-muted">
            <span className="font-medium text-fg">Ej.: </span>
            {s.example}
          </p>
        </li>
      ))}
    </ul>
  );
}

function DefinitionOfDone() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="min-w-0 rounded-2xl border border-[color-mix(in_srgb,var(--lvl-3)_30%,var(--border))] p-5">
        <h4 className="text-[15.5px] font-semibold text-fg">No declares completado solo porque…</h4>
        <ul className="mt-3 space-y-2">
          {doneNotBecause.map((d) => (
            <li key={d} className="flex items-start gap-2.5 text-[14.5px] leading-snug text-fg">
              <CloseIcon size={15} className="mt-0.5 shrink-0 text-lvl-3" />
              {d}
            </li>
          ))}
        </ul>
      </div>
      <div className="min-w-0 rounded-2xl border border-[color-mix(in_srgb,var(--lvl-1)_30%,var(--border))] p-5">
        <h4 className="text-[15.5px] font-semibold text-fg">Para completar se necesita</h4>
        <ul className="mt-3 space-y-2">
          {doneRequires.map((d) => (
            <li key={d} className="flex items-start gap-2.5 text-[14.5px] leading-snug text-fg">
              <CheckIcon size={15} className="mt-0.5 shrink-0 text-lvl-1" />
              {d}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AgentReliability() {
  return (
    <>
      <SubSection
        id="agentes-errores"
        title="Reintentos y recuperación de errores"
        intro="Repetir lo mismo esperando otro resultado no es persistencia: es un loop roto. Cada intento debe cambiar algo."
      >
        <Retries />
      </SubSection>

      <SubSection id="agentes-verificacion" title="Verificación" intro="¿Cuánta evidencia basta para dar algo por hecho? Depende de lo que cuesta equivocarse.">
        <Verification />
      </SubSection>

      <SubSection id="agentes-presupuesto" title="Presupuesto y memoria">
        <BudgetAndMemory />
      </SubSection>

      <SubSection
        id="agentes-parada"
        title="Condiciones de parada"
        intro={
          <InlineText text="Nunca escribas solo «continúa hasta terminar»: el agente no sabe qué significa terminar. Define cada salida del loop, incluida cuándo necesita a una persona ([[human-in-the-loop]])." />
        }
      >
        <StopConditions />
      </SubSection>

      <SubSection id="agentes-done" title="Definition of Done" intro="El error más caro de un agente es declarar éxito sin tenerlo.">
        <DefinitionOfDone />
      </SubSection>

      <div className="mt-12 grid gap-3">
        <Callout label="Empieza con un solo agente" tone="accent">
          <InlineText text="Antes de un [[multi-agent-system|sistema multiagente]], exprime un solo agente con buenas herramientas y un buen prompt. Cada agente extra suma coordinación ([[orchestration|orquestación]]), costo y puntos de falla." />
        </Callout>
        <Callout label="Planifica ligero, replanifica siempre">
          <InlineText text="Un plan de 3 a 5 pasos que se revisa en cada vuelta supera a un plan fijo de 50 pasos que se vuelve obsoleto al primer imprevisto. La [[planning|planificación]] es continua, no un documento inicial." />
        </Callout>
      </div>
    </>
  );
}
