import Link from "next/link";
import { RelatedChips } from "@/components/glossary/article-blocks";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getTerms } from "@/lib/glossary";
import { relatedSlugs } from "./content";
import { FACTORY_HREF } from "./factory-hero";

export function Closing() {
  const terms = getTerms(relatedSlugs);
  if (terms.length !== relatedSlugs.length) {
    const missing = relatedSlugs.filter((s) => !terms.some((t) => t.slug === s));
    throw new Error(`/prompts: related glossary terms not found: ${missing.join(", ")}`);
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-accent-soft px-6 py-8 sm:px-10 sm:py-10">
        <div aria-hidden="true" className="resource-grid-bg pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="relative">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">Prompt Factory</p>
          <p className="mt-2 text-[24px] font-semibold leading-[1.15] tracking-[-0.025em] text-fg sm:text-[28px]">Ya sabes por qué. Ahora constrúyelo.</p>
          <p className="mt-3 max-w-[560px] text-[16.5px] leading-relaxed text-muted">
            Describe tu intención. La Prompt Factory la convierte en una especificación estructurada y la escribe para Claude, ChatGPT o Gemini, cada uno con su
            estructura.
          </p>
          <Link
            href={FACTORY_HREF}
            className="group mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-fg px-5 text-[15px] font-medium text-bg transition-opacity hover:opacity-90"
          >
            Construir un prompt <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <h3 className="mt-12 text-[19px] font-semibold tracking-[-0.015em] text-fg sm:text-[20px]">Conceptos relacionados</h3>
      <p className="mb-5 mt-2 text-[16px] leading-relaxed text-muted">Cada uno tiene su ficha en el glosario, con ejemplos y diagramas.</p>
      <RelatedChips terms={terms} />
    </>
  );
}
