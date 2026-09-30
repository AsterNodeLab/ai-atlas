"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/lib/site";

/** Main navigation. "Recursos" (tools, models) are visually separated from the glossary. */
export function NavLinks({ vertical = false, onNavigate }: { vertical?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className={vertical ? "flex flex-col" : "flex items-center"}>
      {nav.map((item, i) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const firstResource = Boolean(item.resource) && !nav[i - 1]?.resource;
        return (
          <li key={item.href} className={!vertical && firstResource ? "ml-2 border-l border-border pl-2.5" : undefined}>
            {vertical && firstResource ? <p className="eyebrow pb-1 pt-8">Recursos</p> : null}
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={
                vertical
                  ? `block border-b border-border py-4 text-[22px] font-medium tracking-tight ${active ? "text-fg" : "text-muted"}`
                  : `whitespace-nowrap rounded-md px-1 py-1.5 text-[14.5px] transition-colors ${active ? "text-fg" : "text-muted hover:text-fg"}`
              }
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
