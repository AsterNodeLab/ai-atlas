import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";

export function SectionHeading({ id, eyebrow, title, description, href, linkLabel }: { id: string; eyebrow?: string; title: string; description?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-[640px]">
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h2 id={id} className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-fg sm:text-[34px]">{title}</h2>
        {description ? <p className="mt-3 text-[17px] leading-relaxed text-muted">{description}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 text-[15px] font-medium text-fg">
          {linkLabel} <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
