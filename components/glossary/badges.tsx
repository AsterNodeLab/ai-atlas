import Link from "next/link";
import { difficultyLabels } from "@/lib/i18n";
import type { Difficulty } from "@/types/glossary";

const dotColor: Record<Difficulty, string> = {
  beginner: "bg-lvl-1",
  intermediate: "bg-lvl-2",
  advanced: "bg-lvl-3",
  research: "bg-lvl-4",
};

export function DifficultyDot({ difficulty, className = "" }: { difficulty: Difficulty; className?: string }) {
  return <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dotColor[difficulty]} ${className}`} />;
}

/** Small, quiet level indicator: colored dot + label. */
export function DifficultyBadge({ difficulty, short = false }: { difficulty: Difficulty; short?: boolean }) {
  const d = difficultyLabels[difficulty];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-muted">
      <DifficultyDot difficulty={difficulty} />
      {short ? d.short : `Nivel ${d.level} · ${d.label}`}
    </span>
  );
}

export function CategoryBadge({ slug, name, asLink = true }: { slug: string; name: string; asLink?: boolean }) {
  const cls =
    "inline-flex items-center whitespace-nowrap rounded-full border border-border px-2.5 py-0.5 text-[12.5px] text-muted transition-colors";
  return asLink ? (
    <Link href={`/categories/${slug}`} className={`${cls} hover:border-border-strong hover:text-fg`}>
      {name}
    </Link>
  ) : (
    <span className={cls}>{name}</span>
  );
}

export function FrontierBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[12px] font-medium text-accent-text">
      Frontier
    </span>
  );
}
