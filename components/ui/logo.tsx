import { site } from "@/lib/site";

/** Typographic wordmark. Swap this component to rebrand. */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 text-[16px] font-semibold tracking-[-0.02em] text-fg">
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="2.5" fill="var(--accent)" />
      </svg>
      {site.name}
    </span>
  );
}
