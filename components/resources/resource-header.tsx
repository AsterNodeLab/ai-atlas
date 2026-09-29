import Link from "next/link";

const resourceTabs = [
  { key: "tools", href: "/tools", label: "Herramientas" },
  { key: "models", href: "/models", label: "Modelos" },
  { key: "prompts", href: "/prompts", label: "Prompts" },
  { key: "papers", href: "/papers", label: "Papers" },
  { key: "agents", href: "/agents", label: "Agentes" },
] as const;

/**
 * Distinct hero used by the "Recursos" sections (Herramientas, Modelos, Prompts, Papers, Agentes).
 * Shares typography with the rest of the site but uses the teal accent,
 * a dotted backdrop and a "Recursos" switcher so it reads as a separate area.
 */
export function ResourceHeader({
  active,
  eyebrow,
  title,
  description,
  meta,
}: {
  active: (typeof resourceTabs)[number]["key"];
  eyebrow: string;
  title: string;
  description: string;
  meta?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-accent-soft px-6 py-10 sm:px-12 sm:py-14">
      <div aria-hidden="true" className="resource-grid-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="relative">
        <nav aria-label="Secciones de recursos" className="inline-flex rounded-full border border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-bg/70 p-1 text-[13.5px] backdrop-blur">
          {resourceTabs.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              aria-current={active === t.key ? "page" : undefined}
              className={`rounded-full px-3.5 py-1 transition-colors ${active === t.key ? "bg-accent text-accent-contrast" : "text-muted hover:text-fg"}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <p className="mt-8 text-[12px] font-medium uppercase tracking-[0.08em] text-accent-text">{eyebrow}</p>
        <h1 className="mt-3 max-w-[820px] text-[36px] font-semibold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[48px] lg:text-[54px]">{title}</h1>
        <p className="mt-5 max-w-[680px] text-[18px] leading-relaxed text-muted sm:text-[19px]">{description}</p>
        {meta ? <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-muted">{meta}</div> : null}
      </div>
    </header>
  );
}

/** "Sitio oficial ↗" style external link, always opening in a new tab. */
export function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  );
}

export function domainOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}
