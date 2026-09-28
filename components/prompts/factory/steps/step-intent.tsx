import { useState } from "react";
import { parseFreeform } from "@/prompt-factory";
import { SparkIcon } from "../icons";
import { attempt } from "../outcome";
import { applyDraft, draftFromSuggestions, type DraftItem } from "../spec-edits";
import { fieldDomId } from "../steps";
import { btn, EngineError, TextField } from "../ui";
import { SuggestionsPanel } from "./suggestions-panel";
import type { StepProps } from "./types";

/** Step 1 — free-form intent + deterministic keyword analysis (nothing is applied without confirmation). */
export function StepIntent({ spec, actions, announce }: StepProps & { announce: (message: string) => void }) {
  const [items, setItems] = useState<DraftItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const text = spec.intent?.trim() ?? "";

  const analyze = () => {
    if (!text) return;
    const parsed = attempt(() => parseFreeform(text));
    if (!parsed.ok) {
      setError(parsed.error);
      setItems(null);
      return;
    }
    setError(null);
    setItems(draftFromSuggestions(parsed.value));
  };

  const apply = (selected: DraftItem[]) => {
    const count = selected.filter((i) => i.selected).length;
    actions.edit((current) => applyDraft(current, selected));
    setItems(null);
    announce(count === 1 ? "1 sugerencia aplicada." : `${count} sugerencias aplicadas.`);
  };

  return (
    <div className="space-y-3">
      <TextField
        id={fieldDomId("intent")}
        label="Describe lo que quieres que haga la IA"
        multiline
        rows={6}
        value={spec.intent}
        onChange={(intent) => actions.patch({ intent })}
        placeholder="Ej.: Analiza reseñas de clientes, detecta las quejas más repetidas y devuélveme una tabla con tema, frecuencia y un ejemplo textual. No inventes datos."
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button type="button" onClick={analyze} disabled={!text} className={btn("primary", "sm")}>
          <SparkIcon size={14} />
          Analizar texto
        </button>
        <p className="text-[12.5px] text-faint">Detección básica por palabras clave, revisa y edita.</p>
      </div>
      {error ? <EngineError what="analizar el texto" error={error} /> : null}
      {items ? (
        <SuggestionsPanel items={items} onChange={setItems} onApply={apply} onDiscard={() => setItems(null)} replacesObjective={Boolean(spec.objective?.trim())} />
      ) : null}
    </div>
  );
}
