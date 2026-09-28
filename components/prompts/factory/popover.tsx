import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./ui";

/**
 * Anchored panel (desktop) / bottom sheet (mobile, so it can never cause
 * horizontal page scroll). Closes on Escape and outside pointer-down, and
 * returns focus to its trigger.
 */
const panelCls =
  "z-50 animate-pop-in rounded-xl border border-border bg-surface text-left shadow-float max-sm:fixed max-sm:inset-x-4 max-sm:bottom-4 sm:absolute sm:top-full sm:mt-2";

function useDismiss(open: boolean, setOpen: (v: boolean) => void, rootRef: React.RefObject<HTMLElement | null>, triggerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen, rootRef, triggerRef]);
}

interface PopoverProps {
  /** Visible trigger content. */
  trigger: ReactNode;
  /** Accessible name of the trigger (needed when the label is hidden on mobile). */
  triggerLabel: string;
  triggerClassName: string;
  panelLabel: string;
  align?: "start" | "end";
  width?: string;
  disabled?: boolean;
  children: (close: () => void) => ReactNode;
}

export function Popover({ trigger, triggerLabel, triggerClassName, panelLabel, align = "start", width = "sm:w-80", disabled, children }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const triggerId = useId();
  useDismiss(open, setOpen, rootRef, triggerRef);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("input, textarea, select, button:not([disabled])")?.focus();
  }, [open]);

  // Looked up by id (not ref) because `close` is handed to render-time children.
  const close = () => {
    setOpen(false);
    document.getElementById(triggerId)?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open ? (
        <div ref={panelRef} id={panelId} role="dialog" aria-label={panelLabel} className={cx(panelCls, width, align === "end" ? "sm:right-0" : "sm:left-0")}>
          {children(close)}
        </div>
      ) : null}
    </div>
  );
}

export interface MenuItem {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  onSelect: () => void;
}

interface MenuButtonProps {
  trigger: ReactNode;
  triggerLabel: string;
  triggerClassName: string;
  menuLabel: string;
  items: MenuItem[];
  align?: "start" | "end";
  width?: string;
  disabled?: boolean;
  footer?: ReactNode;
}

/** Menu button (WAI-ARIA menu pattern): ↑ ↓ Home End to move, Enter to pick, Esc to close. */
export function MenuButton({ trigger, triggerLabel, triggerClassName, menuLabel, items, align = "start", width = "sm:w-72", disabled, footer }: MenuButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  useDismiss(open, setOpen, rootRef, triggerRef);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus();
  }, [open]);

  function onMenuKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const entries = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'));
    if (!entries.length) return;
    const i = entries.indexOf(document.activeElement as HTMLElement);
    const n = entries.length;
    const next = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : e.key === "ArrowDown" ? (i + 1) % n : (i - 1 + n) % n;
    entries[next].focus();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open ? (
        <div className={cx(panelCls, width, "p-1", align === "end" ? "sm:right-0" : "sm:left-0")}>
          <div ref={menuRef} id={menuId} role="menu" aria-label={menuLabel} onKeyDown={onMenuKeyDown} className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                  item.onSelect();
                }}
                className="flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left outline-none transition-colors hover:bg-subtle focus-visible:bg-subtle focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-[13.5px] font-medium text-fg">{item.label}</span>
                {item.description ? <span className="text-[12.5px] leading-snug text-muted">{item.description}</span> : null}
              </button>
            ))}
          </div>
          {footer ? <div className="border-t border-border px-3 py-2 text-[12px] text-faint">{footer}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
