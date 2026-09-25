"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { ThemeSegmented } from "@/components/ui/theme-toggle";
import { NavLinks } from "./nav-links";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg transition-colors hover:bg-subtle"
      >
        {open ? <CloseIcon size={19} /> : <MenuIcon size={19} />}
      </button>
      {open ? (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 z-40 animate-fade-in overflow-y-auto bg-bg px-4 pb-10 pt-2">
          <nav aria-label="Principal (móvil)">
            <NavLinks vertical onNavigate={() => setOpen(false)} />
          </nav>
          <ul className="mt-6 space-y-3 text-[16px] text-muted">
            <li><Link href="/categories" onClick={() => setOpen(false)}>Categorías</Link></li>
            <li><Link href="/saved" onClick={() => setOpen(false)}>Guardados</Link></li>
            <li><Link href="/about" onClick={() => setOpen(false)}>Acerca de</Link></li>
          </ul>
          <div className="mt-8">
            <ThemeSegmented />
          </div>
        </div>
      ) : null}
    </div>
  );
}
