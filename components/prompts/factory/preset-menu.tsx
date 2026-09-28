import { applyPreset, presets, type PromptSpec } from "@/prompt-factory";
import { ChevronDownIcon } from "@/components/ui/icons";
import { LayersIcon } from "./icons";
import { attempt } from "./outcome";
import { MenuButton } from "./popover";
import { btn } from "./ui";

/** Presets are partial specs merged by the engine (applyPreset) without overwriting user data. */
export function PresetMenu({ spec, onApply, announce }: { spec: PromptSpec; onApply: (spec: PromptSpec) => void; announce: (message: string) => void }) {
  const active = presets.find((p) => p.id === spec.metadata.presetId);
  return (
    <MenuButton
      trigger={
        <>
          <LayersIcon size={14} />
          <span className="max-w-[10rem] truncate">{active ? active.label : "Presets"}</span>
          <ChevronDownIcon size={13} className="text-faint" />
        </>
      }
      triggerLabel={active ? `Preset: ${active.label}. Cambiar preset` : "Aplicar un preset"}
      triggerClassName={btn("secondary", "sm")}
      menuLabel="Presets"
      disabled={!presets.length}
      width="sm:w-80"
      items={presets.map((preset) => ({
        id: preset.id,
        label: preset.label,
        description: preset.description,
        onSelect: () => {
          const next = attempt(() => applyPreset(spec, preset.id));
          if (!next.ok) {
            announce(`No se pudo aplicar el preset: ${next.error}`);
            return;
          }
          onApply(next.value);
          announce(`Preset aplicado: ${preset.label}.`);
        },
      }))}
      footer="Se combinan con lo que ya escribiste; no lo reemplazan."
    />
  );
}
