import Link from "next/link";
import type { Category } from "@/types/glossary";

export function CategoryGrid({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((c) => (
        <li key={c.slug} className="bg-bg">
          <Link href={`/categories/${c.slug}`} className="group flex h-full flex-col px-5 py-5 transition-colors hover:bg-subtle">
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-[16px] font-semibold tracking-[-0.01em] text-fg">{c.name}</span>
              <span className="font-mono text-[12px] text-faint">{counts[c.slug] ?? 0}</span>
            </span>
            <span className="mt-1 text-[14px] leading-snug text-muted">{c.tagline}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
