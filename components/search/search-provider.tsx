"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { SearchPanel } from "./search-panel";
import { loadSearchIndex } from "./use-search-index";

interface SearchContextValue {
  openSearch: () => void;
}

const SearchContext = createContext<SearchContextValue>({ openSearch: () => {} });

export function useSearch() {
  return useContext(SearchContext);
}

/** Global ⌘K / Ctrl K command palette. */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openSearch = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      const target = e.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Warm the search index when the browser is idle so search feels instant.
  useEffect(() => {
    const warm = () => void loadSearchIndex().catch(() => {});
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(warm, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(warm, 2500);
    return () => clearTimeout(t);
  }, []);

  const value = useMemo(() => ({ openSearch }), [openSearch]);

  return (
    <SearchContext.Provider value={value}>
      {children}
      {open ? <CommandPalette onClose={close} /> : null}
    </SearchContext.Provider>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  // Keep keyboard focus inside the dialog.
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>("input, a[href], button");
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-[100]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 animate-fade-in bg-[var(--overlay)] backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar conceptos"
        className="relative mx-auto mt-[8vh] flex max-h-[80vh] w-[calc(100%-24px)] max-w-[640px] animate-pop-in flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-float sm:mt-[12vh] sm:max-h-[70vh]"
      >
        <SearchPanel
          variant="palette"
          autoFocus
          placeholder="Busca “Transformer”, “RAG”, “Agentes”…"
          onNavigate={onClose}
          onEscape={onClose}
        />
      </div>
    </div>
  );
}

const isMacSnapshot = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const noopSubscribe = () => () => {};

/** Navbar button that opens the palette. */
export function SearchTrigger({ compact = false }: { compact?: boolean }) {
  const { openSearch } = useSearch();
  const isMac = useSyncExternalStore(noopSubscribe, isMacSnapshot, () => true);
  if (compact) {
    return (
      <button
        type="button"
        onClick={openSearch}
        aria-label="Buscar"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-fg"
      >
        <SearchIcon size={18} />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={openSearch}
      aria-keyshortcuts="Meta+K Control+K"
      className="group inline-flex h-9 w-56 items-center gap-2 rounded-lg border border-border bg-subtle/60 px-3 text-[14px] text-faint transition-colors hover:border-border-strong hover:text-muted"
    >
      <SearchIcon size={15} />
      <span className="flex-1 text-left">Buscar…</span>
      <kbd className="rounded border border-border bg-surface px-1.5 font-mono text-[11px] text-faint">{isMac ? "⌘K" : "Ctrl K"}</kbd>
    </button>
  );
}
