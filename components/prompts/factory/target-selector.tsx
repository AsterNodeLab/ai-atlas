import { modelProfiles } from "@/prompt-factory";
import { CheckIcon } from "@/components/ui/icons";
import { ColumnsIcon } from "./icons";
import { cx, onRovingKeyDown, Segmented } from "./ui";

interface TargetProps {
  value: string;
  onChange: (id: string) => void;
  compare: boolean;
  onCompareChange: (compare: boolean) => void;
}

/** Compact variant for the top bar: segmented profiles + "Comparar todos" toggle. */
export function TargetSegmented({ value, onChange, compare, onCompareChange }: TargetProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <Segmented
        label="Modelo destino"
        value={value}
        onChange={onChange}
        options={modelProfiles.map((p) => ({ value: p.id, label: p.displayName, title: `${p.vendor} · ${p.styleSummary}` }))}
      />
      <CompareToggle compare={compare} onCompareChange={onCompareChange} />
    </div>
  );
}

export function CompareToggle({ compare, onCompareChange }: Pick<TargetProps, "compare" | "onCompareChange">) {
  return (
    <button
      type="button"
      aria-pressed={compare}
      onClick={() => onCompareChange(!compare)}
      title="Compila la misma especificación para todos los modelos"
      className={cx(
        "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-[13px] transition-colors",
        compare ? "border-accent bg-accent text-accent-contrast" : "border-border text-muted hover:border-border-strong hover:text-fg",
      )}
    >
      <ColumnsIcon size={14} />
      Comparar todos
    </button>
  );
}

/** Card variant for Step 2, with the vendor and the profile's style summary. */
export function TargetCards({ value, onChange, compare, onCompareChange }: TargetProps) {
  const hasValue = modelProfiles.some((p) => p.id === value);
  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Modelo destino" onKeyDown={(e) => onRovingKeyDown(e)} className="grid gap-2 sm:grid-cols-3">
        {modelProfiles.map((p, i) => {
          const checked = p.id === value;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked || (!hasValue && i === 0) ? 0 : -1}
              onClick={() => onChange(p.id)}
              className={cx(
                "flex h-full flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors",
                checked
                  ? "border-accent bg-accent-soft shadow-[0_0_0_1px_var(--accent)]"
                  : "border-border bg-surface hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]",
              )}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="text-[14.5px] font-semibold tracking-[-0.01em] text-fg">{p.displayName}</span>
                {checked ? <CheckIcon size={15} className="shrink-0 text-accent-text" /> : null}
              </span>
              <span className="font-mono text-[11.5px] text-faint">{p.vendor}</span>
              <span className="text-[12.5px] leading-snug text-muted">{p.styleSummary}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CompareToggle compare={compare} onCompareChange={onCompareChange} />
        <span className="text-[12.5px] text-faint">Muestra la misma especificación compilada para cada modelo, lado a lado.</span>
      </div>
    </div>
  );
}
