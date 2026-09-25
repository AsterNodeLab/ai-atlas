import Link from "next/link";
import { SearchPanel } from "@/components/search/search-panel";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[680px] px-4 pb-10 pt-20 text-center sm:px-6 sm:pt-28">
      <p className="font-mono text-[13px] text-faint">Error 404</p>
      <h1 className="mt-4 text-[40px] font-semibold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[52px]">Concepto no encontrado.</h1>
      <p className="mt-4 text-[19px] text-muted">La IA todavía no conoce esta página. Tal vez lo que buscas tiene otro nombre:</p>
      <div className="mt-10 text-left">
        <SearchPanel variant="hero" autoFocus placeholder="Busca un concepto…" />
      </div>
      <p className="mt-8 text-[15px] text-muted">
        O vuelve al <Link href="/" className="link-underline text-fg">inicio</Link> o al{" "}
        <Link href="/glossary" className="link-underline text-fg">glosario A–Z</Link>.
      </p>
    </div>
  );
}
