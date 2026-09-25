import type { Metadata } from "next";
import { Suspense } from "react";
import { Explorer, ExplorerSkeleton } from "@/components/explore/explorer";
import { PageHeader } from "@/components/ui/page-header";
import { getAllSummaries, getCategories } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Explorar conceptos de IA",
  description: "Filtra más de 200 conceptos de Inteligencia Artificial por nivel, categoría y tipo.",
  alternates: { canonical: "/explore" },
};

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6 sm:pt-20">
      <PageHeader
        eyebrow="Explorador"
        title="Encuentra tu siguiente concepto"
        description="Filtra por nivel, categoría o tipo. Los filtros quedan en la URL, así puedes compartir la vista."
      />
      <div className="mt-12">
        <Suspense fallback={<ExplorerSkeleton />}>
          <Explorer terms={getAllSummaries()} categories={getCategories()} />
        </Suspense>
      </div>
    </div>
  );
}
