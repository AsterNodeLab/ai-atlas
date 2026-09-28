import { Callout } from "@/components/glossary/article-blocks";
import { InlineText, RichText } from "@/components/glossary/rich-text";
import { requirementsVsConstraints } from "./content";

function Column({ kind }: { kind: "requirements" | "constraints" }) {
  const data = requirementsVsConstraints[kind];
  const isReq = kind === "requirements";
  return (
    <div className="min-w-0 rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-mono text-[15px] font-semibold ${
            isReq ? "bg-accent-soft text-accent-text" : "bg-[color-mix(in_srgb,var(--lvl-3)_14%,var(--bg))] text-fg"
          }`}
        >
          {isReq ? "+" : "−"}
        </span>
        <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-fg">{data.title}</h3>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        <InlineText text={data.definition} />
      </p>
      <ul className="mt-4 space-y-2">
        {data.examples.map((ex) => (
          <li key={ex} className="rounded-xl border border-border bg-subtle px-3.5 py-2.5 font-mono text-[13px] leading-snug text-fg">
            {ex}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RequirementsConstraints() {
  return (
    <>
      <RichText text="Las dos le dicen algo al modelo sobre la respuesta, pero funcionan distinto. Separarlas evita que una restricción se pierda entre peticiones, y te deja revisar cada una por su lado." />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Column kind="requirements" />
        <Column kind="constraints" />
      </div>

      <div className="mt-6 grid gap-3">
        <Callout label="Prueba rápida" tone="accent">
          Si lo verificas buscando que <strong className="font-semibold">sí esté</strong>, es un requisito. Si lo verificas buscando que{" "}
          <strong className="font-semibold">no haya pasado</strong>, es una restricción.
        </Callout>
        <Callout label="Y para los casos grises: reglas de decisión">
          Lo que no es ni requisito ni restricción suele ser una decisión pendiente. Resuélvela por adelantado: «Si el documento no trae fecha, escribe
          “sin fecha” y continúa». Y cuando puedas, explica el porqué de cada límite: el modelo generaliza mejor cuando entiende la razón.
        </Callout>
      </div>
    </>
  );
}
