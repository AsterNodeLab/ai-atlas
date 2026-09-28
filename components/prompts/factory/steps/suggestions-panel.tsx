import { useId } from "react";
import type { OutputKind, PromptMode, ToolKind } from "@/prompt-factory";
import { MODE_LABELS, OUTPUT_KINDS, OUTPUT_KIND_LABELS, TOOL_KINDS, TOOL_KIND_LABELS } from "../labels";
import type { DraftItem, UnclassifiedTarget } from "../spec-edits";
import { Badge, btn, checkboxClass, cx, inputCls, selectClass, selectCls } from "../ui";

const GROUPS: { kind: DraftItem["kind"]; title: string }[] = [
  { kind: "objective", title: "Objetivo" },
  { kind: "requirement", title: "Requisitos" },
  { kind: "constraint", title: "Restricciones" },
  { kind: "output", title: "Formato de salida" },
  { kind: "mode", title: "Modo" },
  { kind: "tool", title: "Herramientas" },
  { kind: "unclassified", title: "Sin clasificar" },
];

const UNCLASSIFIED_TARGETS: { value: UnclassifiedTarget; label: string }[] = [
  { value: "context", label: "como contexto" },
  { value: "requirement", label: "como requisito" },
  { value: "constraint", label: "como restricción" },
];

const CONFIDENCE_LABELS = { low: "confianza baja", medium: "confianza media" } as const;

interface Props {
  items: DraftItem[];
  onChange: (items: DraftItem[]) => void;
  onApply: (items: DraftItem[]) => void;
  onDiscard: () => void;
  replacesObjective: boolean;
}

/** Review screen for parseFreeform output: every inferred item can be (de)selected and edited before applying. */
export function SuggestionsPanel({ items, onChange, onApply, onDiscard, replacesObjective }: Props) {
  const titleId = useId();
  const selectedCount = items.filter((i) => i.selected).length;
  const update = (key: string, patch: Partial<DraftItem>) =>
    onChange(items.map((item) => (item.key === key ? ({ ...item, ...patch } as DraftItem) : item)));
  const setAll = (selected: boolean) => onChange(items.map((item) => ({ ...item, selected })));

  return (
    <section aria-labelledby={titleId} className="animate-fade-in rounded-xl border border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-[color-mix(in_srgb,var(--accent-soft)_55%,transparent)] p-3 sm:p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 id={titleId} className="text-[14px] font-semibold text-fg">
          Sugerencias detectadas <span className="font-mono text-[12px] font-normal text-faint">{items.length}</span>
        </h4>
        {items.length ? (
          <div className="flex gap-1">
            <button type="button" className={btn("ghost", "xs")} onClick={() => setAll(true)}>
              Todas
            </button>
            <button type="button" className={btn("ghost", "xs")} onClick={() => setAll(false)}>
              Ninguna
            </button>
          </div>
        ) : null}
      </div>
      <p className="mt-1 text-[12.5px] leading-snug text-muted">
        Detección básica por palabras clave, revisa y edita. No se aplica nada hasta que confirmes.
      </p>

      {items.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-border-strong px-3 py-4 text-center text-[13px] text-muted">
          Las reglas básicas no detectaron nada en este texto. Completa los pasos manualmente.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          {GROUPS.map((group) => {
            const groupItems = items.filter((i) => i.kind === group.kind);
            if (!groupItems.length) return null;
            return (
              <fieldset key={group.kind} className="min-w-0">
                <legend className="eyebrow mb-1.5">{group.title}</legend>
                {group.kind === "objective" && replacesObjective ? (
                  <p className="mb-1.5 text-[12px] text-faint">Si lo aplicas, reemplaza el objetivo actual.</p>
                ) : null}
                {group.kind === "unclassified" ? (
                  <p className="mb-1.5 text-[12px] text-faint">Frases que no encajaron en ninguna regla. Márcalas para conservarlas.</p>
                ) : null}
                <ul className="space-y-1.5">
                  {groupItems.map((item) => (
                    <SuggestionRow key={item.key} item={item} onUpdate={(patch) => update(item.key, patch)} />
                  ))}
                </ul>
              </fieldset>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" className={btn("primary", "sm")} disabled={!selectedCount} onClick={() => onApply(items)}>
          Aplicar seleccionadas ({selectedCount})
        </button>
        <button type="button" className={btn("ghost", "sm")} onClick={onDiscard}>
          Descartar
        </button>
      </div>
    </section>
  );
}

function SuggestionRow({ item, onUpdate }: { item: DraftItem; onUpdate: (patch: Partial<DraftItem>) => void }) {
  const id = useId();
  const controlId = `${id}-value`;
  const label = GROUPS.find((g) => g.kind === item.kind)?.title ?? item.kind;

  let control: React.ReactNode;
  switch (item.kind) {
    case "output":
      control = (
        <select id={controlId} aria-label={label} value={item.value} onChange={(e) => onUpdate({ value: e.target.value as OutputKind })} className={selectCls}>
          {OUTPUT_KINDS.map((k) => (
            <option key={k} value={k}>
              {OUTPUT_KIND_LABELS[k].label}
            </option>
          ))}
        </select>
      );
      break;
    case "mode":
      control = (
        <select id={controlId} aria-label={label} value={item.value} onChange={(e) => onUpdate({ value: e.target.value as PromptMode })} className={selectCls}>
          {(Object.keys(MODE_LABELS) as PromptMode[]).map((m) => (
            <option key={m} value={m}>
              {MODE_LABELS[m]}
            </option>
          ))}
        </select>
      );
      break;
    case "tool":
      control = (
        <select id={controlId} aria-label={label} value={item.value} onChange={(e) => onUpdate({ value: e.target.value as ToolKind })} className={selectCls}>
          {TOOL_KINDS.map((k) => (
            <option key={k} value={k}>
              {TOOL_KIND_LABELS[k]}
            </option>
          ))}
        </select>
      );
      break;
    case "unclassified":
      control = (
        <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row">
          <input id={controlId} aria-label="Frase sin clasificar" value={item.value} onChange={(e) => onUpdate({ value: e.target.value })} className={inputCls} />
          <select
            aria-label="Añadir como"
            value={item.target}
            onChange={(e) => onUpdate({ target: e.target.value as UnclassifiedTarget })}
            className={selectClass({ width: "w-full sm:w-44" })}
          >
            {UNCLASSIFIED_TARGETS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      );
      break;
    default:
      control = <input id={controlId} aria-label={label} value={item.value} onChange={(e) => onUpdate({ value: e.target.value })} className={inputCls} />;
  }

  return (
    <li className={cx("grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 gap-y-1 rounded-lg border bg-surface p-2", item.selected ? "border-border-strong" : "border-border opacity-75")}>
      <input
        type="checkbox"
        checked={item.selected}
        onChange={(e) => onUpdate({ selected: e.target.checked })}
        aria-label={`Incluir sugerencia: ${label}`}
        aria-describedby={`${id}-source`}
        className={checkboxClass("mt-2.5")}
      />
      <div className="min-w-0 space-y-1">
        {control}
        {item.kind !== "unclassified" ? (
          <p id={`${id}-source`} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-faint">
            <span className="min-w-0 break-words">
              Detectado en: <q className="text-muted">{item.source}</q>
            </span>
            {item.confidence ? <Badge>{CONFIDENCE_LABELS[item.confidence]}</Badge> : null}
          </p>
        ) : (
          <span id={`${id}-source`} className="sr-only">
            Frase original: {item.source}
          </span>
        )}
      </div>
    </li>
  );
}
