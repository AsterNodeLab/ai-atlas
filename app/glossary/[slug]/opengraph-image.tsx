import { categoryName, getAllTerms, getTerm } from "@/lib/glossary";
import { ogImage, ogSize } from "@/lib/og";

export const dynamic = "force-static";

export const alt = "Concepto del glosario de IA";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllTerms().map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const term = getTerm((await params).slug);
  if (!term) return ogImage({ eyebrow: "Glosario", title: "Concepto no encontrado" });
  const subtitle = term.shortDefinition.length > 150 ? `${term.shortDefinition.slice(0, 147)}…` : term.shortDefinition;
  return ogImage({ eyebrow: categoryName(term.category), title: term.name, subtitle });
}
