import { useCallback, useRef, useState } from "react";
import { CheckIcon } from "@/components/ui/icons";
import { copyText } from "./browser";
import { CopyIcon } from "./icons";
import { btn, cx } from "./ui";

type CopyState = "idle" | "copied" | "error";

export function useCopy() {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);
  const copy = useCallback(async (text: string) => {
    const ok = await copyText(text);
    setState(ok ? "copied" : "error");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2000);
    return ok;
  }, []);
  return { state, copy };
}

/** Copy button with a polite live region ("Copiado al portapapeles"). */
export function CopyButton({
  text,
  label = "Copiar",
  srLabel,
  disabled,
  variant = "secondary",
  size = "sm",
  hideLabelOnMobile,
}: {
  text: string;
  label?: string;
  srLabel?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "xs" | "sm" | "md";
  hideLabelOnMobile?: boolean;
}) {
  const { state, copy } = useCopy();
  const visible = state === "copied" ? "Copiado" : state === "error" ? "Error al copiar" : label;
  return (
    <>
      <button
        type="button"
        disabled={disabled || !text}
        onClick={() => void copy(text)}
        aria-label={srLabel ?? label}
        className={btn(variant, size)}
      >
        {state === "copied" ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
        <span className={cx(hideLabelOnMobile && "hidden sm:inline")}>{visible}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? "Copiado al portapapeles" : state === "error" ? "No se pudo copiar al portapapeles" : ""}
      </span>
    </>
  );
}
