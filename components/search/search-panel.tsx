"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { DifficultyDot } from "@/components/glossary/badges";
import { ClockIcon, EnterIcon, SearchIcon } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { difficultyLabels } from "@/lib/i18n";
import { search, suggest } from "@/lib/search";
import { useRecentTerms } from "@/lib/storage";
import type { SearchDocument } from "@/types/glossary";
import { useSearchIndex } from "./use-search-index";

const POPULAR = ["transformer", "rag", "embeddings", "ai-agent", "llm", "token"];

interface Item {
  doc: SearchDocument;
  section: "results" | "recent" | "popular";
}

interface Props {
  variant: "palette" | "hero";
  placeholder?: string;
  autoFocus?: boolean;
  initialQuery?: string;
  onNavigate?: () => void;
  onEscape?: () => void;
}

/**
 * Accessible combobox used by both the ⌘K palette and the hero search.
 * ↑ ↓ to move, Enter to open, Esc to close.
 */
export function SearchPanel({ variant, placeholder, autoFocus, initialQuery = "", onNavigate, onEscape }: Props) {
  const router = useRouter();
  const { index, error } = useSearchIndex();
  const recent = useRecentTerms();
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const isPalette = variant === "palette";
  const trimmed = query.trim();

  const items: Item[] = useMemo(() => {
    if (!index) return [];
    if (trimmed) return search(index, trimmed, isPalette ? 12 : 7).map((r) => ({ doc: r.doc, section: "results" }));
    if (!isPalette) return [];
    const bySlug = new Map(index.map((e) => [e.doc.slug, e.doc]));
    const recentDocs = recent.slice(0, 4).flatMap((s) => (bySlug.has(s) ? [bySlug.get(s)!] : []));
    const popularDocs = POPULAR.filter((s) => !recent.slice(0, 4).includes(s)).flatMap((s) => (bySlug.has(s) ? [bySlug.get(s)!] : []));
    return [
      ...recentDocs.map((doc) => ({ doc, section: "recent" as const })),
      ...popularDocs.map((doc) => ({ doc, section: "popular" as const })),
    ];
  }, [index, trimmed, isPalette, recent]);

  const suggestions = useMemo(
    () => (index && trimmed && items.length === 0 ? suggest(index, trimmed) : []),
    [index, trimmed, items.length],
  );

  const activeIndex = Math.min(active, Math.max(items.length - 1, 0));

  // Report searches once the user pauses typing.
  useEffect(() => {
    if (!trimmed || !index) return;
    const t = window.setTimeout(() => track({ name: "search", query: trimmed, results: items.length }), 700);
    return () => window.clearTimeout(t);
  }, [trimmed, items.length, index]);

  // Keep the active option visible.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function go(doc: SearchDocument) {
    track({ name: "search_select", query: trimmed, slug: doc.slug });
    onNavigate?.();
    if (!isPalette) {
      setQuery("");
      inputRef.current?.blur();
    }
    router.push(`/glossary/${doc.slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (items.length) setActive((activeIndex + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (items.length) setActive((activeIndex - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      const item = items[activeIndex];
      if (item) {
        e.preventDefault();
        go(item.doc);
      }
    } else if (e.key === "Escape") {
      if (!isPalette && query) {
        e.preventDefault();
        setQuery("");
      } else {
        onEscape?.();
        if (!isPalette) inputRef.current?.blur();
      }
    }
  }

  const showList = isPalette || (focused && trimmed.length > 0);
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const input = (
    <div
      className={
        isPalette
          ? "flex items-center gap-3 border-b border-border px-4"
          : "flex items-center gap-3 rounded-2xl border border-border-strong bg-surface px-4 shadow-soft transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--accent-soft)] sm:px-5"
      }
    >
      <SearchIcon size={isPalette ? 18 : 20} className="shrink-0 text-faint" />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-label="Buscar en el glosario"
        aria-expanded={showList && items.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={items.length ? optionId(activeIndex) : undefined}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        value={query}
        placeholder={placeholder ?? "Busca un concepto…"}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`min-w-0 flex-1 bg-transparent text-fg outline-none focus-visible:outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden ${
          isPalette ? "h-14 text-[16px]" : "h-14 text-[16px] sm:h-16 sm:text-[17px]"
        }`}
      />
      {isPalette ? (
        <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] text-faint sm:inline">esc</kbd>
      ) : null}
    </div>
  );

  const body = (
    <div className={isPalette ? "min-h-0 flex-1 overflow-y-auto overscroll-contain p-2" : "max-h-[min(60vh,440px)] overflow-y-auto overscroll-contain p-2"}>
      {!index && !error ? <ResultsSkeleton /> : null}
      {error ? <p className="px-3 py-6 text-center text-[15px] text-muted">No pudimos cargar el índice de búsqueda. Revisa tu conexión e inténtalo de nuevo.</p> : null}
      {index && trimmed && items.length === 0 ? <EmptyState query={trimmed} suggestions={suggestions} onPick={go} /> : null}
      <ul ref={listRef} id={listId} role="listbox" aria-label="Resultados" className={items.length ? "" : "hidden"}>
        {items.map((item, i) => {
          const showHeader = !trimmed && (i === 0 || items[i - 1].section !== item.section);
          return (
            <li key={`${item.section}-${item.doc.slug}`} role="presentation">
              {showHeader ? (
                <div className="eyebrow px-3 pb-1.5 pt-3" aria-hidden="true">
                  {item.section === "recent" ? "Vistos recientemente" : "Populares"}
                </div>
              ) : null}
              <div
                id={optionId(i)}
                role="option"
                aria-selected={i === activeIndex}
                data-index={i}
                onMouseDown={(e) => e.preventDefault()}
                onMouseMove={() => i !== activeIndex && setActive(i)}
                onClick={() => go(item.doc)}
                className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                  i === activeIndex ? "bg-subtle" : ""
                }`}
              >
                {item.section === "recent" ? <ClockIcon size={15} className="shrink-0 text-faint" /> : null}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-[15px] font-medium text-fg">{item.doc.acronym && item.doc.acronym !== item.doc.name ? item.doc.acronym : item.doc.name}</span>
                    {item.doc.acronym && item.doc.acronym !== item.doc.name ? (
                      <span className="hidden truncate text-[13px] text-faint sm:inline">{item.doc.name}</span>
                    ) : item.doc.spanishName ? (
                      <span className="hidden truncate text-[13px] text-faint sm:inline">{item.doc.spanishName}</span>
                    ) : null}
                  </div>
                  <p className="truncate text-[13.5px] text-muted">{item.doc.shortDefinition}</p>
                </div>
                <div className="hidden shrink-0 items-center gap-2 text-[12px] text-faint md:flex">
                  <span className="max-w-[140px] truncate">{item.doc.categoryName}</span>
                  <DifficultyDot difficulty={item.doc.difficulty} />
                  <span className="sr-only">{difficultyLabels[item.doc.difficulty].short}</span>
                </div>
                <EnterIcon size={15} className={`shrink-0 text-faint ${i === activeIndex ? "opacity-100" : "opacity-0"}`} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  if (isPalette) {
    return (
      <div className="flex max-h-full min-h-0 flex-col">
        {input}
        {body}
        <div className="hidden items-center gap-4 border-t border-border px-4 py-2.5 text-[12px] text-faint sm:flex">
          <span><Kbd>↑</Kbd> <Kbd>↓</Kbd> navegar</span>
          <span><Kbd>↵</Kbd> abrir</span>
          <span><Kbd>esc</Kbd> cerrar</span>
          <Link href="/explore" onClick={onNavigate} className="ml-auto hover:text-fg">
            Explorar todo →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {input}
      {showList ? (
        <div className="absolute inset-x-0 top-full z-30 mt-2 animate-pop-in overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-float">
          {body}
        </div>
      ) : null}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded border border-border px-1 font-mono text-[11px]">{children}</kbd>;
}

function EmptyState({ query, suggestions, onPick }: { query: string; suggestions: SearchDocument[]; onPick: (d: SearchDocument) => void }) {
  return (
    <div className="px-3 py-6 text-center" role="status">
      <p className="text-[15px] text-fg">
        No encontramos <span className="font-medium">“{query}”</span>.
      </p>
      {suggestions.length ? (
        <div className="mt-3 text-[14px] text-muted">
          Tal vez buscabas:
          <ul className="mt-2 flex flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <li key={s.slug}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onPick(s)}
                  className="rounded-full border border-border px-3 py-1 text-[13.5px] text-fg transition-colors hover:border-border-strong hover:bg-subtle"
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-2 text-[14px] text-muted">Prueba con otro término, un acrónimo o una palabra en inglés.</p>
      )}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-1 p-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl px-3 py-2.5">
          <div className="h-3.5 w-32 animate-pulse rounded bg-subtle" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-subtle" />
        </div>
      ))}
    </div>
  );
}
