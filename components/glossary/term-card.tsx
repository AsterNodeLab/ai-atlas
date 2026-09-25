import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { TermSummary } from "@/types/glossary";
import { DifficultyBadge, FrontierBadge } from "./badges";

interface Props {
  term: TermSummary;
  categoryName?: string;
  /** Overrides the definition line (e.g. curated taglines on the home page). */
  description?: string;
  headingLevel?: "h2" | "h3";
}

export function TermCard({ term, categoryName, description, headingLevel = "h3" }: Props) {
  const Heading = headingLevel;
  const showAcronym = term.acronym && term.acronym !== term.name;
  return (
    <Link
      href={`/glossary/${term.slug}`}
      className="group relative flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <Heading className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-fg">
          {showAcronym ? term.acronym : term.name}
        </Heading>
        <ArrowRightIcon size={16} className="mt-1 shrink-0 -translate-x-1 text-faint opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
      {showAcronym || term.spanishName ? (
        <p className="mt-0.5 truncate text-[13px] text-faint">{showAcronym ? term.name : term.spanishName}</p>
      ) : null}
      <p className="mt-2.5 line-clamp-3 text-[14.5px] leading-relaxed text-muted">{description ?? term.shortDefinition}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-[12.5px] text-faint">
        {categoryName ? <span>{categoryName}</span> : null}
        <DifficultyBadge difficulty={term.difficulty} short />
        {term.frontier ? <FrontierBadge /> : null}
      </div>
    </Link>
  );
}
