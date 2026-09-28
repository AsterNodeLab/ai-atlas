import { Callout } from "@/components/glossary/article-blocks";
import { InlineText, RichText } from "@/components/glossary/rich-text";
import { anatomyGroups, promptDensity } from "./content";

const levelWord = { 1: "baja", 2: "media", 3: "alta" } as const;

function Meter({ label, level, invert = false }: { label: string; level: 1 | 2 | 3; invert?: boolean }) {
  // For "ambigüedad", more is worse: it fills in amber instead of the accent.
  const fill = invert ? "bg-lvl-3" : "bg-accent";
  return (
    <div className="flex items-center justify-between gap-3 text-[12.5px] text-muted">
      <span>
        {label}: <span className="text-fg">{levelWord[level]}</span>
      </span>
      <span aria-hidden="true" className="flex gap-1">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-1.5 w-5 rounded-full ${n <= level ? fill : "bg-border"}`} />
        ))}
      </span>
    </div>
  );
}

/** Global 1-based number of the first component of each group. */
const groupStarts = anatomyGroups.map((_, gi) => 1 + anatomyGroups.slice(0, gi).reduce((sum, g) => sum + g.items.length, 0));

export function Anatomy() {
  return (
    <>
      <RichText text="Un [[prompt]] profesional no es un párrafo largo: es un conjunto de piezas, cada una con un trabajo. Estas son las 12 que usamos. No todas son obligatorias; úsalas cuando eliminen una duda que el modelo tendría." />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {anatomyGroups.map((g, gi) => (
          <div key={g.title} className="rounded-2xl border border-border p-5">
            <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">{g.title}</h3>
            <p className="mt-1 text-[13.5px] leading-snug text-muted">{g.question}</p>
            <ol start={groupStarts[gi]} className="mt-4 space-y-3.5">
              {g.items.map((c, i) => (
                <li key={c.name} className="flex gap-3">
                  <span aria-hidden="true" className="mt-[3px] w-5 shrink-0 font-mono text-[12px] text-faint">
                    {String(groupStarts[gi] + i).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15.5px] font-semibold leading-snug text-fg">{c.name}</span>
                    <span className="mt-0.5 block text-[14.5px] leading-snug text-muted">{c.line}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <h3 className="mt-12 text-[19px] font-semibold tracking-[-0.015em] text-fg sm:text-[20px]">Más largo no es mejor</h3>
      <p className="mt-2 text-[16px] leading-relaxed text-muted">Lo que cuenta es cuánta ambigüedad elimina cada línea, no cuántas líneas hay.</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {promptDensity.map((d) => (
          <li
            key={d.label}
            className={`flex flex-col rounded-2xl border p-4 ${
              d.best ? "border-[color-mix(in_srgb,var(--accent)_40%,var(--border))] bg-accent-soft" : "border-border"
            }`}
          >
            <p className={`text-[15px] font-semibold ${d.best ? "text-accent-text" : "text-fg"}`}>{d.label}</p>
            <p className="mt-1.5 text-[14px] italic leading-snug text-fg">{d.sample}</p>
            <p className="mt-2 text-[13.5px] leading-snug text-muted">{d.note}</p>
            <div className="mt-auto space-y-1.5 pt-4">
              <Meter label="Información útil" level={d.info} />
              <Meter label="Ambigüedad" level={d.ambiguity} invert />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-3">
        <Callout label="La idea clave" tone="accent">
          Maximiza la <strong className="font-semibold">información útil por unidad de ambigüedad</strong>. Si una sección no cambia la respuesta, sobra; si falta una
          que el modelo tendría que adivinar, agrégala.
        </Callout>
        <Callout label="No hay una estructura universal óptima">
          <InlineText text="Los componentes son los mismos para todos los modelos, pero la forma de escribirlos cambia según la familia. Por eso cada plataforma tiene su adaptación, que verás a continuación." />
        </Callout>
      </div>
    </>
  );
}
