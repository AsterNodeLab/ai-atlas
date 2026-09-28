import { useId, type KeyboardEvent, type ReactNode } from "react";

/** Small, token-only form primitives shared by every Prompt Factory step. */

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/*
 * Class builders instead of "base + override" strings: two utilities for the same
 * property (h-9 + h-8) have no reliable precedence, so each variant is composed once.
 */
const control =
  "min-w-0 rounded-lg border border-border bg-bg text-fg outline-none transition-[border-color,box-shadow] placeholder:text-faint hover:border-border-strong focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_22%,transparent)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

type ControlSize = "sm" | "md";

export function inputClass({ size = "md", mono = false, width = "w-full" }: { size?: ControlSize; mono?: boolean; width?: string } = {}): string {
  const text = mono ? "font-mono text-[13px]" : size === "sm" ? "text-[13.5px]" : "text-[14px]";
  return cx(control, width, "px-3", size === "sm" ? "h-8" : "h-9", text);
}

export function textareaClass({ mono = false }: { mono?: boolean } = {}): string {
  return cx(control, "w-full resize-y px-3 py-2 leading-relaxed", mono ? "font-mono text-[12.5px]" : "text-[14px]");
}

export function selectClass({ size = "md", width = "w-full" }: { size?: ControlSize; width?: string } = {}): string {
  return cx(control, width, "pl-3 pr-8", size === "sm" ? "h-8 text-[13px]" : "h-9 text-[14px]");
}

export function checkboxClass(offset = "mt-[3px]"): string {
  return cx("size-4 shrink-0 cursor-pointer accent-[var(--accent)] disabled:cursor-not-allowed", offset);
}

export const inputCls = inputClass();
export const textareaCls = textareaClass();
export const selectCls = selectClass();
export const checkboxCls = checkboxClass();

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "xs" | "sm" | "md";

export function btn(variant: Variant = "secondary", size: Size = "md"): string {
  const sizes: Record<Size, string> = {
    xs: "h-7 gap-1 rounded-md px-2 text-[12.5px]",
    sm: "h-8 gap-1.5 rounded-lg px-2.5 text-[13px]",
    md: "h-9 gap-1.5 rounded-lg px-3 text-[13.5px]",
  };
  const variants: Record<Variant, string> = {
    primary: "bg-accent font-medium text-accent-contrast hover:bg-[color-mix(in_srgb,var(--accent)_86%,var(--fg))]",
    secondary: "border border-border bg-surface text-fg hover:border-border-strong hover:bg-subtle",
    ghost: "text-muted hover:bg-subtle hover:text-fg",
    danger:
      "border border-[color-mix(in_srgb,var(--pf-danger)_40%,var(--border))] text-[var(--pf-danger)] hover:bg-[color-mix(in_srgb,var(--pf-danger)_8%,transparent)]",
  };
  return cx(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    sizes[size],
    variants[variant],
  );
}

const iconBase =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-subtle disabled:pointer-events-none disabled:opacity-35";
/** Square icon-only buttons; always pair with an aria-label. */
export const iconBtn = `${iconBase} text-faint hover:text-fg`;
export const iconBtnDanger = `${iconBase} text-faint hover:text-[var(--pf-danger)]`;

export function Label({ htmlFor, children, optional }: { htmlFor: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="flex items-baseline gap-2 text-[13px] font-medium text-fg">
      {children}
      {optional ? <span className="text-[12px] font-normal text-faint">opcional</span> : null}
    </label>
  );
}

export function Hint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="text-[12.5px] leading-snug text-faint">
      {children}
    </p>
  );
}

interface TextFieldProps {
  id?: string;
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  optional?: boolean;
  multiline?: boolean;
  rows?: number;
  mono?: boolean;
}

export function TextField({ id, label, value, onChange, placeholder, hint, optional, multiline, rows = 3, mono }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId} optional={optional}>
        {label}
      </Label>
      {multiline ? (
        <textarea
          id={inputId}
          rows={rows}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={hintId}
          spellCheck
          className={textareaClass({ mono })}
        />
      ) : (
        <input
          id={inputId}
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={hintId}
          className={inputClass({ mono })}
        />
      )}
      {hint ? <Hint id={hintId}>{hint}</Hint> : null}
    </div>
  );
}

interface NumberFieldProps {
  id?: string;
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  hint?: string;
  disabled?: boolean;
}

export function NumberField({ id, label, value, onChange, min = 0, max = 999, hint, disabled }: NumberFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={value ?? ""}
        disabled={disabled}
        placeholder="—"
        aria-describedby={hintId}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(undefined);
          const n = Number(raw);
          if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, Math.trunc(n))));
        }}
        className={cx(inputClass({ mono: true }), "tabular-nums")}
      />
      {hint ? <Hint id={hintId}>{hint}</Hint> : null}
    </div>
  );
}

interface CheckboxFieldProps {
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function CheckboxField({ id, label, hint, checked, onChange, disabled, className }: CheckboxFieldProps) {
  return (
    <label className={cx("flex cursor-pointer items-start gap-2.5 rounded-lg py-1 text-[13.5px] text-fg", disabled && "cursor-not-allowed opacity-60", className)}>
      <input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className={checkboxCls} />
      <span className="min-w-0">
        <span className="block leading-snug">{label}</span>
        {hint ? <span className="block text-[12.5px] leading-snug text-faint">{hint}</span> : null}
      </span>
    </label>
  );
}

/** Legend styled like the site's section eyebrows, for fieldset groups. */
export function Legend({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <>
      <legend className="text-[13px] font-medium text-fg">{children}</legend>
      {hint ? <p className="mt-0.5 text-[12.5px] leading-snug text-faint">{hint}</p> : null}
    </>
  );
}

/**
 * Arrow-key navigation for role="radio" / role="tab" groups with roving tabindex.
 * Moving also selects (via click), as the WAI-ARIA radio/tab patterns recommend.
 */
export function onRovingKeyDown(e: KeyboardEvent<HTMLElement>, role: "radio" | "tab" = "radio") {
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
  if (!keys.includes(e.key)) return;
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(`[role="${role}"]:not([disabled])`));
  const index = items.indexOf(document.activeElement as HTMLElement);
  if (index === -1 || !items.length) return;
  e.preventDefault();
  const n = items.length;
  const next =
    e.key === "Home" ? 0 : e.key === "End" ? n - 1 : e.key === "ArrowRight" || e.key === "ArrowDown" ? (index + 1) % n : (index - 1 + n) % n;
  items[next].focus();
  items[next].click();
}

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  title?: string;
}

/** Compact radio group (segmented control) with arrow-key support. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: SegmentOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
}) {
  const hasValue = options.some((o) => o.value === value);
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={(e) => onRovingKeyDown(e)}
      className={cx("no-scrollbar inline-flex max-w-full overflow-x-auto rounded-lg border border-border bg-subtle p-0.5", className)}
    >
      {options.map((o, i) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked || (!hasValue && i === 0) ? 0 : -1}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cx(
              "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-[13px] transition-colors",
              checked ? "bg-surface font-medium text-fg shadow-[var(--shadow-sm)] ring-1 ring-border" : "text-muted hover:text-fg",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "accent" | "danger" | "warn" | "ok"; className?: string }) {
  const tones = {
    neutral: "border-border text-muted",
    accent: "border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-accent-soft text-accent-text",
    danger: "border-[color-mix(in_srgb,var(--pf-danger)_35%,var(--border))] text-[var(--pf-danger)]",
    warn: "border-[color-mix(in_srgb,var(--lvl-3)_40%,var(--border))] text-[var(--lvl-3)]",
    ok: "border-[color-mix(in_srgb,var(--lvl-1)_40%,var(--border))] text-[var(--lvl-1)]",
  } as const;
  return (
    <span className={cx("inline-flex h-5 shrink-0 items-center whitespace-nowrap rounded-full border px-2 font-mono text-[11px] leading-none", tones[tone], className)}>
      {children}
    </span>
  );
}

/** Inline notice when the engine throws (instead of crashing the whole tool). */
export function EngineError({ error, what }: { error: string; what: string }) {
  return (
    <div role="alert" className="rounded-xl border border-[color-mix(in_srgb,var(--pf-danger)_35%,var(--border))] bg-[color-mix(in_srgb,var(--pf-danger)_6%,transparent)] px-3 py-2.5 text-[13px] text-fg">
      <p className="font-medium">No se pudo {what}.</p>
      <p className="mt-0.5 break-words font-mono text-[12px] text-muted">{error}</p>
    </div>
  );
}
