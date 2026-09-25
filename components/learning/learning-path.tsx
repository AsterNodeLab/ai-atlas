import Link from "next/link";
import { DifficultyBadge, DifficultyDot } from "@/components/glossary/badges";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { GlossaryTerm, LearningPath } from "@/types/glossary";
import { StartPathLink } from "./start-path-link";

export function LearningPathCard({ path, terms }: { path: LearningPath; terms: GlossaryTerm[] }) {
  return (
    <Link
      href={`/learn/${path.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-soft"
    >
      <div className="flex items-center justify-between text-[12.5px] text-faint">
        <span>{path.steps.length} conceptos</span>
        <DifficultyBadge difficulty={path.difficulty} short />
      </div>
      <h3 className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-fg">{path.title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{path.description}</p>
      <p className="mt-5 line-clamp-2 font-mono text-[12px] leading-relaxed text-faint">
        {terms.map((t) => t.acronym ?? t.name).join(" → ")}
      </p>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[14px] font-medium text-accent-text">
        Ver ruta <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/** Numbered vertical timeline of a learning path. */
export function PathSteps({ path, terms }: { path: LearningPath; terms: GlossaryTerm[] }) {
  return (
    <ol className="relative">
      {terms.map((t, i) => {
        const note = path.steps[i]?.note;
        const last = i === terms.length - 1;
        return (
          <li key={t.slug} className="relative flex gap-5 pb-3">
            <div className="flex flex-col items-center">
              <span className="z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-bg font-mono text-[13px] text-fg">
                {i + 1}
              </span>
              {!last ? <span aria-hidden="true" className="w-px flex-1 bg-border" /> : null}
            </div>
            <StartPathLink
              path={path.slug}
              track={i === 0}
              href={`/glossary/${t.slug}`}
              className="group mb-3 flex-1 rounded-2xl border border-border px-5 py-4 transition-colors hover:border-border-strong hover:bg-surface-hover"
            >
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[17px] font-semibold tracking-tight text-fg">{t.name}</span>
                {note ? <span className="text-[13px] text-faint">{note}</span> : null}
                <DifficultyDot difficulty={t.difficulty} className="ml-auto" />
              </span>
              <span className="mt-1 block text-[15px] leading-relaxed text-muted">{t.shortDefinition}</span>
            </StartPathLink>
          </li>
        );
      })}
    </ol>
  );
}
