import { InlineText, RichText } from "@/components/glossary/rich-text";
import { outputFormats } from "./content";

export function OutputFormats() {
  return (
    <>
      <RichText text="El formato no es decoración: define quién puede usar la respuesta. Pídelo siempre de forma explícita y, si lo va a leer un programa, con un esquema." />

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {outputFormats.map((f) => (
          <li key={f.name} className="flex min-w-0 flex-col rounded-2xl border border-border p-4">
            <p className="text-[15.5px] font-semibold text-fg">{f.name}</p>
            <p className="mt-1 text-[14.5px] leading-snug text-muted">
              <span className="sr-only">Úsalo cuando: </span>
              <InlineText text={f.when} />
            </p>
            <p aria-hidden="true" className="mt-auto truncate pt-3 font-mono text-[12px] text-faint">
              {f.sample}
            </p>
          </li>
        ))}
        <li className="flex min-w-0 flex-col justify-center rounded-2xl border border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-accent-soft p-4">
          <p className="text-[15.5px] font-semibold text-accent-text">¿Quién lee la salida?</p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[14px] leading-snug">
            <dt className="text-muted">Una persona</dt>
            <dd className="text-fg">texto, Markdown o informe</dd>
            <dt className="text-muted">Un programa</dt>
            <dd className="text-fg">JSON con esquema</dd>
            <dt className="text-muted">Otro paso del flujo</dt>
            <dd className="text-fg">XML o JSON</dd>
          </dl>
        </li>
      </ul>
    </>
  );
}
