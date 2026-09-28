import type { PromptLanguage } from "@/prompt-factory";
import { LANGUAGE_LABELS } from "../labels";
import { fieldDomId } from "../steps";
import { TargetCards } from "../target-selector";
import { Segmented } from "../ui";
import type { StepProps } from "./types";

/** Step 2 — target profile (same state as the top-bar selector) and prompt language. */
export function StepTarget({ spec, actions, targetId, compare }: StepProps & { targetId: string; compare: boolean }) {
  return (
    <div className="space-y-4">
      <div id={fieldDomId("metadata.targetModel")}>
        <TargetCards value={targetId} onChange={actions.setTarget} compare={compare} onCompareChange={actions.setCompare} />
      </div>
      <div id={fieldDomId("metadata.language")} className="flex flex-wrap items-center gap-3">
        <span className="text-[13px] font-medium text-fg">Idioma del prompt</span>
        <Segmented<PromptLanguage>
          label="Idioma del prompt"
          value={spec.metadata.language}
          onChange={(language) => actions.patchMeta({ language })}
          options={[
            { value: "es", label: `${LANGUAGE_LABELS.es} · Español` },
            { value: "en", label: `${LANGUAGE_LABELS.en} · English` },
          ]}
        />
        <span className="text-[12.5px] text-faint">Idioma de los encabezados y del texto de protocolo del prompt compilado.</span>
      </div>
    </div>
  );
}
