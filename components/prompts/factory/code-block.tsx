import { useMemo } from "react";
import { highlight, TOKEN_CLASS } from "./highlight";
import { cx } from "./ui";

/**
 * Read-only monospaced prompt view with line numbers and light highlighting.
 * Scrolls internally (never widens the page); line numbers are not selectable.
 */
export function CodeBlock({ code, wrap = true, label, className }: { code: string; wrap?: boolean; label: string; className?: string }) {
  const lines = useMemo(() => highlight(code), [code]);
  return (
    <pre
      tabIndex={0}
      aria-label={label}
      className={cx("overflow-auto overscroll-contain bg-code font-mono text-[12.5px] leading-[1.65] text-fg focus-visible:outline-offset-[-2px]", className)}
    >
      <code className={cx("block py-3", wrap ? "w-full" : "w-max min-w-full")}>
        {lines.map((tokens, i) => (
          <span key={i} className={cx("grid", wrap ? "grid-cols-[2.75rem_minmax(0,1fr)]" : "grid-cols-[2.75rem_auto]")}>
            <span aria-hidden="true" className="select-none pr-3 text-right text-faint/60">
              {i + 1}
            </span>
            <span className={cx("min-h-[1.65em] pr-4", wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre")}>
              {tokens.map((t, j) =>
                t.kind === "text" ? (
                  <span key={j}>{t.text}</span>
                ) : (
                  <span key={j} className={TOKEN_CLASS[t.kind]}>
                    {t.text}
                  </span>
                ),
              )}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}
