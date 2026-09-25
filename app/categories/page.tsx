import type { Metadata } from "next";
import { CategoryGrid } from "@/components/glossary/category-grid";
import { PageHeader } from "@/components/ui/page-header";
import { getCategories, getTermsInCategory } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Categorías de Inteligencia Artificial",
  description: "Explora la IA por áreas: fundamentos, machine learning, deep learning, LLMs, Transformers, agentes, RAG, visión, seguridad y más.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  const categories = getCategories();
  const counts = Object.fromEntries(categories.map((c) => [c.slug, getTermsInCategory(c.slug).length]));
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6 sm:pt-20">
      <PageHeader eyebrow="Categorías" title="La IA, por áreas" description="Cada categoría agrupa los conceptos de un tema, ordenados de lo básico a lo avanzado." />
      <div className="mt-12">
        <CategoryGrid categories={categories} counts={counts} />
      </div>
    </div>
  );
}
