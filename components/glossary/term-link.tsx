"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "@/lib/analytics";

interface Props {
  slug: string;
  label: string;
  name: string;
  definition: string;
  from?: string;
}

const WIDTH = 300;
const GAP = 8;

/**
 * Inline link to another glossary term with a smart tooltip (hover on pointer
 * devices, keyboard focus everywhere). The tooltip is portaled and clamped to the
 * viewport so it never causes horizontal scroll.
 */
export function TermLink({ slug, label, name, definition, from }: Props) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const showTimer = useRef<number | undefined>(undefined);
  const hideTimer = useRef<number | undefined>(undefined);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; width: number } | null>(null);
  const tooltipId = useId();

  function place() {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(WIDTH, vw - 24);
    const left = Math.min(Math.max(r.left + r.width / 2 - width / 2, 12), vw - width - 12);
    const below = r.bottom + GAP + 170 < vh;
    setPos(below ? { left, top: r.bottom + GAP, width } : { left, bottom: vh - r.top + GAP, width });
  }

  function show(delay: number) {
    window.clearTimeout(hideTimer.current);
    window.clearTimeout(showTimer.current);
    showTimer.current = window.setTimeout(place, delay);
  }

  function hide(delay = 120) {
    window.clearTimeout(showTimer.current);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setPos(null), delay);
  }

  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [pos]);

  useEffect(
    () => () => {
      window.clearTimeout(showTimer.current);
      window.clearTimeout(hideTimer.current);
    },
    [],
  );

  return (
    <>
      <Link
        ref={anchorRef}
        href={`/glossary/${slug}`}
        aria-describedby={pos ? tooltipId : undefined}
        onMouseEnter={() => window.matchMedia("(hover: hover)").matches && show(280)}
        onMouseLeave={() => hide()}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && show(0)}
        onBlur={() => hide(0)}
        onClick={() => {
          setPos(null);
          if (from) track({ name: "related_term_click", from, to: slug });
        }}
        className="font-medium text-fg underline decoration-[color-mix(in_srgb,var(--accent)_45%,transparent)] decoration-dotted decoration-[1.5px] underline-offset-[5px] transition-colors hover:text-accent-text hover:decoration-accent hover:decoration-solid"
      >
        {label}
      </Link>
      {pos
        ? createPortal(
            <div
              id={tooltipId}
              role="tooltip"
              onMouseEnter={() => window.clearTimeout(hideTimer.current)}
              onMouseLeave={() => hide()}
              style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width }}
              className="fixed z-[90] animate-pop-in rounded-xl border border-border bg-surface p-4 text-left shadow-float"
            >
              <p className="text-[15px] font-semibold tracking-tight text-fg">{name}</p>
              <p className="mt-1.5 line-clamp-4 text-[14px] leading-relaxed text-muted">{definition}</p>
              <Link href={`/glossary/${slug}`} tabIndex={-1} onClick={() => setPos(null)} className="mt-3 inline-block text-[13px] font-medium text-accent-text">
                Ver concepto →
              </Link>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
