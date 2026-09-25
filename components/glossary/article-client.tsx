"use client";

import { useEffect, useState } from "react";
import { BookmarkIcon, CheckIcon, ChevronDownIcon, HashIcon, LinkIcon } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { pushRecent, toggleSaved, useSavedTerms } from "@/lib/storage";

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function useFlash(): [boolean, () => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const t = window.setTimeout(() => setOn(false), 1600);
    return () => window.clearTimeout(t);
  }, [on]);
  return [on, () => setOn(true)];
}

/** Hover "#" next to a section heading: copies a deep link to that section. */
export function AnchorButton({ id, title }: { id: string; title: string }) {
  const [copied, flash] = useFlash();
  return (
    <button
      type="button"
      onClick={async () => {
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        window.history.replaceState(null, "", `#${id}`);
        if (await copy(url)) flash();
      }}
      aria-label={`Copiar enlace a la sección ${title}`}
      className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-faint opacity-0 transition-opacity hover:bg-subtle hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
    >
      {copied ? <CheckIcon size={14} /> : <HashIcon size={14} />}
      <span className="sr-only" aria-live="polite">{copied ? "Enlace copiado" : ""}</span>
    </button>
  );
}

/** "Copiar enlace" + "Guardar" — the only article actions, on purpose. */
export function TermActions({ slug }: { slug: string }) {
  const saved = useSavedTerms().includes(slug);
  const [copied, flash] = useFlash();
  const btn =
    "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-[13.5px] text-muted transition-colors hover:border-border-strong hover:text-fg";
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={btn}
        onClick={async () => {
          if (await copy(`${window.location.origin}${window.location.pathname}`)) flash();
        }}
      >
        {copied ? <CheckIcon size={14} /> : <LinkIcon size={14} />}
        <span aria-live="polite">{copied ? "Copiado" : "Copiar enlace"}</span>
      </button>
      <button
        type="button"
        aria-pressed={saved}
        className={`${btn} ${saved ? "border-[color-mix(in_srgb,var(--accent)_40%,var(--border))] text-accent-text" : ""}`}
        onClick={() => track({ name: "term_saved", slug, saved: toggleSaved(slug) })}
      >
        <BookmarkIcon size={14} filled={saved} />
        {saved ? "Guardado" : "Guardar"}
      </button>
    </div>
  );
}

/** Records the visit for "Vistos recientemente" and analytics. Renders nothing. */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    pushRecent(slug);
    track({ name: "term_view", slug });
  }, [slug]);
  return null;
}

/** Barely-there reading progress bar under the navbar. */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-16 z-30 h-[2px]">
      <div className="h-full origin-left bg-accent/70" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

export interface TocItem {
  id: string;
  label: string;
}

function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -65% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/** Desktop: sticky index highlighting the visible section. */
export function TableOfContents({ items, title }: { items: TocItem[]; title: string }) {
  const [ids] = useState(() => items.map((i) => i.id));
  const active = useActiveSection(ids);
  return (
    <nav aria-label="En esta página" className="text-[13.5px]">
      <p className="mb-3 font-medium text-fg">{title}</p>
      <ul className="space-y-0.5 border-l border-border">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={`-ml-px block border-l py-1 pl-3.5 transition-colors ${
                active === item.id ? "border-accent text-fg" : "border-transparent text-faint hover:text-muted"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Mobile: collapsible index. */
export function MobileToc({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-toc"
        className="flex w-full items-center justify-between px-4 py-3 text-[14.5px] text-muted"
      >
        En esta página
        <ChevronDownIcon size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <ul id="mobile-toc" className="border-t border-border px-4 py-2 text-[14.5px]">
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} onClick={() => setOpen(false)} className="block py-1.5 text-muted hover:text-fg">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
