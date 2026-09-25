import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { getAllTerms, getCategories, getLearningPaths } from "@/lib/glossary";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Acerca de",
  description: `Qué es ${site.name}, cómo está escrito el contenido y cómo usarlo para aprender Inteligencia Artificial.`,
  alternates: { canonical: "/about" },
};

const layers = [
  ["En una frase", "Entender la idea en menos de 10 segundos."],
  ["Explícamelo fácil", "Analogías y ejemplos cotidianos, sin jerga."],
  ["Cómo funciona", "Diagramas y ejemplos reales."],
  ["Profundizando", "Arquitectura, fórmulas y terminología técnica, siempre explicadas."],
  ["Antes y después", "Qué necesitas saber antes y qué aprender a continuación."],
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 pt-14 sm:px-6 sm:pt-20">
      <PageHeader
        eyebrow="Acerca de"
        title={`${site.name}: simple por fuera, sofisticado por dentro`}
        description="Un glosario en español para que cualquier persona pueda pasar de “no sé qué es un modelo de IA” a entender Transformers, RAG o agentes."
      />
      <div className="prose-atlas mt-12 space-y-6">
        <p>
          Hoy el glosario reúne <strong>{getAllTerms().length} conceptos</strong> en {getCategories().length} categorías y{" "}
          {getLearningPaths().length} rutas de aprendizaje. Cada concepto está conectado con otros: lo que necesitas saber antes, lo que
          conviene aprender después y los temas relacionados. Así puedes aprender explorando.
        </p>
        <h2 className="pt-6 text-[24px] font-semibold tracking-[-0.02em]">Cómo está escrito cada concepto</h2>
        <ol className="not-prose mt-4 space-y-3">
          {layers.map(([title, text], i) => (
            <li key={title} className="flex gap-4 rounded-xl border border-border px-4 py-3">
              <span className="font-mono text-[13px] text-faint">{i + 1}</span>
              <span className="text-[16px]"><strong className="font-semibold">{title}.</strong> <span className="text-muted">{text}</span></span>
            </li>
          ))}
        </ol>
        <h2 className="pt-6 text-[24px] font-semibold tracking-[-0.02em]">Exactitud</h2>
        <p>
          El contenido prioriza la exactitud técnica sobre la simplificación. Cuando un concepto es objeto de debate en la investigación
          (por ejemplo, las capacidades emergentes), lo señalamos. Las referencias a papers enlazan a las fuentes originales.
        </p>
        <h2 className="pt-6 text-[24px] font-semibold tracking-[-0.02em]">Atajos</h2>
        <p>
          Pulsa <code>⌘ K</code> o <code>Ctrl K</code> (o <code>/</code>) en cualquier página para buscar. Pasa el cursor sobre un concepto
          subrayado dentro de un artículo para ver su definición sin salir de la página.
        </p>
        <p>
          ¿Por dónde empezar? Prueba la ruta <Link href="/learn/como-funciona-chatgpt" className="link-underline">Cómo funciona ChatGPT</Link>.
        </p>
      </div>
    </div>
  );
}
