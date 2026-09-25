"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { DifficultyBadge } from "@/components/glossary/badges";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { TermSummary } from "@/types/glossary";

const DAY = 86_400_000;
const noopSubscribe = () => () => {};

/** Deterministic pick by local calendar day — no backend needed. */
function dayIndex(date: Date, length: number) {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local / DAY) % length;
}

export function TermOfTheDay({ candidates, buildIndex }: { candidates: TermSummary[]; buildIndex: number }) {
  const index = useSyncExternalStore(noopSubscribe, () => dayIndex(new Date(), candidates.length), () => buildIndex);
  const term = candidates[index];
  if (!term) return null;
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-subtle px-6 py-10 sm:px-12 sm:py-14">
      <p className="eyebrow">Hoy aprende</p>
      <h2 className="mt-4 text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-fg sm:text-[44px]">
        {term.name}
        {term.acronym && term.acronym !== term.name ? <span className="text-faint"> ({term.acronym})</span> : null}
      </h2>
      <p className="mt-4 max-w-[620px] text-[18px] leading-relaxed text-muted">{term.shortDefinition}</p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href={`/glossary/${term.slug}`}
          className="group inline-flex h-11 items-center gap-2 rounded-xl bg-fg px-5 text-[15px] font-medium text-bg transition-opacity hover:opacity-90"
        >
          Explorar concepto <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
        <DifficultyBadge difficulty={term.difficulty} />
      </div>
    </div>
  );
}
