import { InlineText } from "@/components/glossary/rich-text";

/**
 * "Cómo leer una ficha": the glossary part of the model catalog. Each field is
 * explained with links (and tooltips) to the main glossary.
 */
const fields: { term: string; text: string }[] = [
  { term: "Ventana de contexto", text: "Cuántos [[token|tokens]] puede considerar el modelo a la vez: tu mensaje, el historial, los documentos y su respuesta. Ver [[context-window]]." },
  { term: "Precio por 1M de tokens", text: "Lo que cobra la [[api|API]] por cada millón de tokens de entrada (lo que envías) y de salida (lo que genera). La salida suele costar más." },
  { term: "Modalidades", text: "Qué tipos de datos recibe (texto, imágenes, audio, video, archivos) y qué produce. Un modelo que acepta varios es un [[multimodal-model|modelo multimodal]]." },
  { term: "Razonamiento", text: "Puede «pensar» antes de responder, dedicando más cómputo a problemas difíciles. Ver [[reasoning-model]] y [[test-time-compute]]." },
  { term: "Herramientas", text: "Puede solicitar llamadas a funciones externas, la base de los agentes. Ver [[tool-calling]] y [[ai-agent]]." },
  { term: "Salidas estructuradas", text: "Puede responder en un formato garantizado, como JSON con un esquema. Ver [[structured-output]]." },
  { term: "Pesos abiertos", text: "Sus pesos se publican y se pueden descargar, ajustar y ejecutar localmente. Ver [[open-weights-model]] y [[quantization]]." },
  { term: "Versión gratuita", text: "OpenRouter ofrece una variante sin costo, normalmente con límites de uso más estrictos." },
];

export function ModelFieldGuide() {
  return (
    <section aria-labelledby="guia-fichas" className="rounded-3xl border border-border px-6 py-8 sm:px-10">
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">Glosario de modelos</p>
      <h2 id="guia-fichas" className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-fg sm:text-[28px]">
        Cómo leer la ficha de un modelo
      </h2>
      <dl className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.term} className="border-l-2 border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] pl-4">
            <dt className="text-[15.5px] font-semibold text-fg">{f.term}</dt>
            <dd className="mt-1 text-[15px] leading-relaxed text-muted">
              <InlineText text={f.text} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
