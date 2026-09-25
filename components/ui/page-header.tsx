export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <header className="max-w-[760px]">
      {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
      <h1 className="text-[36px] font-semibold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[46px] lg:text-[52px]">{title}</h1>
      {description ? <p className="mt-5 text-[18px] leading-relaxed text-muted sm:text-[19px]">{description}</p> : null}
      {children}
    </header>
  );
}
