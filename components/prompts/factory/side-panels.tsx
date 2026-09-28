import type { ReactNode } from "react";
import { cx, onRovingKeyDown } from "./ui";
import type { SideTab } from "./use-prompt-factory";

export interface SideTabDef {
  id: SideTab;
  label: string;
  title: string;
  count?: number;
  tone?: "danger" | "warn";
  content: ReactNode;
}

/** Tabbed analysis panels under the preview (WAI-ARIA tabs, arrow keys to switch). */
export function SidePanels({ tabs, active, onChange, className }: { tabs: SideTabDef[]; active: SideTab; onChange: (tab: SideTab) => void; className?: string }) {
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <section aria-label="Análisis de la especificación" className={cx("flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div role="tablist" aria-label="Paneles de análisis" onKeyDown={(e) => onRovingKeyDown(e, "tab")} className="no-scrollbar flex shrink-0 gap-1 overflow-x-auto border-b border-border px-1.5 pt-1.5">
        {tabs.map((tab) => {
          const selected = tab.id === current.id;
          return (
            <button
              key={tab.id}
              id={`pf-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`pf-tabpanel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              title={tab.title}
              onClick={() => onChange(tab.id)}
              className={cx(
                "-mb-px inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 text-[13px] transition-colors",
                selected ? "border-accent font-medium text-fg" : "border-transparent text-muted hover:text-fg",
              )}
            >
              {tab.label}
              {tab.count ? (
                <span
                  className={cx(
                    "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10.5px] leading-none",
                    tab.tone === "danger"
                      ? "bg-[var(--pf-danger)] text-bg"
                      : tab.tone === "warn"
                        ? "bg-[color-mix(in_srgb,var(--lvl-3)_20%,transparent)] text-fg"
                        : "bg-subtle text-muted",
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div
        id={`pf-tabpanel-${current.id}`}
        role="tabpanel"
        aria-labelledby={`pf-tab-${current.id}`}
        tabIndex={0}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 focus-visible:outline-offset-[-2px] sm:p-4"
      >
        <h3 className="sr-only">{current.title}</h3>
        {current.content}
      </div>
    </section>
  );
}
