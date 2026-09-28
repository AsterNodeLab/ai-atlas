"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/ui/icons";

type Status = "idle" | "copied" | "error";

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers/contexts without the async Clipboard API.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function CopyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a1 1 0 0 1 1-1h10" />
    </svg>
  );
}

/** "Copiar" button with visible + announced feedback. `what` completes the accessible name. */
export function CopyButton({ text, what }: { text: string; what: string }) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const t = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(t);
  }, [status]);

  return (
    <>
      <button
        type="button"
        onClick={async () => setStatus((await writeClipboard(text)) ? "copied" : "error")}
        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-medium transition-colors ${
          status === "copied"
            ? "border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] bg-accent-soft text-accent-text"
            : "border-border bg-surface text-muted hover:border-border-strong hover:text-fg"
        }`}
      >
        {status === "copied" ? <CheckIcon size={14} /> : <CopyIcon />}
        {status === "copied" ? "Copiado" : status === "error" ? "No se pudo copiar" : "Copiar"}
        <span className="sr-only"> {what}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied" ? `${what} copiada al portapapeles` : status === "error" ? "No se pudo copiar. Selecciona el texto manualmente." : ""}
      </span>
    </>
  );
}
