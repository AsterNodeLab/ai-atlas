import type { Metadata } from "next";
import { LearningPathCard } from "@/components/learning/learning-path";
import { PageHeader } from "@/components/ui/page-header";
import { getLearningPaths, getTerms } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Rutas de aprendizaje de IA",
  description: "Recorridos guiados para entender cómo funciona ChatGPT, qué es RAG, cómo funcionan los agentes de IA y más, concepto por concepto.",
  alternates: { canonical: "/learn" },
};

export default function LearnPage() {
  const paths = getLearningPaths();
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6 sm:pt-20">
      <PageHeader
        eyebrow="Rutas de aprendizaje"
        title="Aprende en el orden correcto"
        description="Cada ruta es una secuencia de conceptos donde cada paso prepara el siguiente. Empieza por una pregunta que te interese."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paths.map((p) => (
          <LearningPathCard key={p.slug} path={p} terms={getTerms(p.steps.map((s) => s.slug))} />
        ))}
      </div>
    </div>
  );
}
