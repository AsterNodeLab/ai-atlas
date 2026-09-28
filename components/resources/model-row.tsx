import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { formatPricePair, formatTokens, modelTags, type ModelRow } from "@/lib/model-format";

/** One model in a list: name, provider, context, price, tags. Works on server and client. */
export function ModelListItem({ model, showProvider = true }: { model: ModelRow; showProvider?: boolean }) {
  const { provider, slug } = model;
  const tags = modelTags(model);
  return (
    <Link
      href={`/models/${provider}/${slug}`}
      className="group grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface px-5 py-4 transition-[border-color,box-shadow] duration-200 hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] hover:shadow-soft md:grid-cols-[minmax(0,1.6fr)_110px_150px_20px] md:items-center md:gap-6"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[16px] font-semibold tracking-[-0.01em] text-fg">{model.name}</span>
          {showProvider ? <span className="text-[13px] text-faint">{model.providerName}</span> : null}
        </div>
        <p className="mt-0.5 truncate font-mono text-[12px] text-faint">{model.id}</p>
        {tags.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-accent-soft px-2 py-0.5 text-[11.5px] text-accent-text">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <dl className="contents text-[13.5px]">
        <div className="flex items-baseline justify-between gap-2 md:block">
          <dt className="text-faint md:text-[11.5px] md:uppercase md:tracking-wider">Contexto</dt>
          <dd className="font-mono text-fg">{formatTokens(model.contextLength)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-2 md:block">
          <dt className="text-faint md:text-[11.5px] md:uppercase md:tracking-wider">Entrada / salida · 1M</dt>
          <dd className="font-mono text-fg">
            {formatPricePair(model.priceIn, model.priceOut)}
          </dd>
        </div>
      </dl>
      <ArrowRightIcon size={16} className="hidden text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent-text md:block" />
    </Link>
  );
}
