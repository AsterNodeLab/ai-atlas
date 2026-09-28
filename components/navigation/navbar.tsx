import Link from "next/link";
import { SearchTrigger } from "@/components/search/search-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-5 px-4 sm:px-6">
        <Link href="/" className="shrink-0 rounded-md" aria-label="AI Atlas — inicio">
          <Logo />
        </Link>
        <nav aria-label="Principal" className="hidden lg:block">
          <NavLinks />
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden xl:block">
            <SearchTrigger />
          </div>
          <div className="xl:hidden">
            <SearchTrigger compact />
          </div>
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
