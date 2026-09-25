"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/lib/site";

export function NavLinks({ vertical = false, onNavigate }: { vertical?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className={vertical ? "flex flex-col" : "flex items-center gap-1"}>
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={
                vertical
                  ? `block border-b border-border py-4 text-[22px] font-medium tracking-tight ${active ? "text-fg" : "text-muted"}`
                  : `rounded-md px-3 py-1.5 text-[14.5px] transition-colors ${active ? "text-fg" : "text-muted hover:text-fg"}`
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
