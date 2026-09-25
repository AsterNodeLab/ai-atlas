"use client";

import { useRouter } from "next/navigation";
import { ShuffleIcon } from "@/components/ui/icons";

/** "Concepto aleatorio": a quiet exploration aid. */
export function RandomTermLink({ slugs, className = "", withIcon = false }: { slugs: string[]; className?: string; withIcon?: boolean }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        const slug = slugs[Math.floor(Math.random() * slugs.length)];
        if (slug) router.push(`/glossary/${slug}`);
      }}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      {withIcon ? <ShuffleIcon size={14} /> : null}
      Concepto aleatorio
    </button>
  );
}
