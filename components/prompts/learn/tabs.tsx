"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface TabItem {
  id: string;
  /** Small line above the label (e.g. the product family). */
  eyebrow: string;
  label: string;
  /** Server-rendered panel content. */
  panel: ReactNode;
}

/**
 * WAI-ARIA tabs with automatic activation: ←/→ move between tabs, Home/End jump
 * to the ends, roving tabindex. All panels stay in the HTML (hidden) so the
 * static export keeps the full content indexable.
 */
export function Tabs({ items, label, idPrefix }: { items: TabItem[]; label: string; idPrefix: string }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function select(index: number) {
    const next = (index + items.length) % items.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: items.length - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    select(moves[e.key]);
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-subtle p-1">
        {items.map((t, i) => {
          const selected = i === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${idPrefix}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`min-w-0 rounded-xl px-2.5 py-2.5 text-left transition-[background-color,box-shadow] sm:px-4 sm:py-3 ${
                selected
                  ? "bg-surface shadow-[var(--shadow-sm)] ring-1 ring-inset ring-[color-mix(in_srgb,var(--accent)_45%,var(--border))]"
                  : "hover:bg-surface-hover"
              }`}
            >
              <span className={`block text-[11px] font-medium uppercase tracking-[0.07em] sm:text-[11.5px] ${selected ? "text-accent-text" : "text-faint"}`}>
                {t.eyebrow}
              </span>
              <span className={`mt-0.5 block text-[14px] font-semibold leading-snug tracking-[-0.01em] sm:text-[15.5px] ${selected ? "text-fg" : "text-muted"}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {items.map((t, i) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${idPrefix}-panel-${t.id}`}
          aria-labelledby={`${idPrefix}-tab-${t.id}`}
          hidden={i !== active}
          tabIndex={0}
          className="mt-6 rounded-2xl"
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}
