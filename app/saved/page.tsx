import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { SavedLibrary } from "./saved-library";

export const metadata: Metadata = {
  title: "Tus conceptos guardados",
  description: "Conceptos guardados y vistos recientemente en este navegador.",
  robots: { index: false },
};

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-6 sm:pt-20">
      <PageHeader eyebrow="Tu biblioteca" title="Guardados" description="Se guardan solo en este navegador. No necesitas cuenta." />
      <div className="mt-12">
        <SavedLibrary />
      </div>
    </div>
  );
}
