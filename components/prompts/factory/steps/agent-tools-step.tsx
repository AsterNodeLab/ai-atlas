import type { ToolDefinition } from "@/prompt-factory";
import { PlusIcon, TrashIcon } from "../icons";
import { BUILTIN_TOOL_KINDS, TOOL_KIND_LABELS } from "../labels";
import { addTool, removeToolKind, updateTool } from "../spec-edits";
import { fieldDomId } from "../steps";
import { btn, checkboxCls, cx, iconBtnDanger, inputClass, Legend } from "../ui";
import type { StepProps } from "./types";

/** Step 10 (agent) — available tools; built-ins are toggles, custom tools have name + purpose. */
export function AgentToolsStep({ spec, actions }: StepProps) {
  const tools = spec.tools ?? [];
  const custom = tools.filter((t) => t.kind === "custom");
  const setTools = (next: ToolDefinition[]) => actions.patch({ tools: next });

  const addCustom = () => {
    const next = addTool(tools, "custom");
    setTools(next);
    const created = next[next.length - 1];
    requestAnimationFrame(() => document.getElementById(`pf-tool-${created.id}-name`)?.focus());
  };

  return (
    <div className="space-y-5">
      <fieldset id={fieldDomId("tools")} className="min-w-0">
        <Legend hint="Marca lo que el agente puede usar. El propósito es opcional.">Herramientas disponibles</Legend>
        <ul className="mt-2 space-y-1.5">
          {BUILTIN_TOOL_KINDS.map((kind) => {
            const tool = tools.find((t) => t.kind === kind);
            const checkboxId = `pf-tool-kind-${kind}`;
            return (
              <li
                key={kind}
                className={cx(
                  "grid gap-2 rounded-lg border px-2.5 py-1.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center",
                  tool ? "border-border-strong bg-surface" : "border-border",
                )}
              >
                <label htmlFor={checkboxId} className="flex cursor-pointer items-start gap-2.5 py-1 text-[13.5px] text-fg">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={Boolean(tool)}
                    onChange={(e) => setTools(e.target.checked ? addTool(tools, kind) : removeToolKind(tools, kind))}
                    className={checkboxCls}
                  />
                  {TOOL_KIND_LABELS[kind]}
                </label>
                {tool ? (
                  <input
                    aria-label={`Propósito de ${TOOL_KIND_LABELS[kind]}`}
                    value={tool.purpose ?? ""}
                    onChange={(e) => setTools(updateTool(tools, tool.id, { purpose: e.target.value }))}
                    placeholder="Propósito (opcional)"
                    className={inputClass({ size: "sm" })}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className="min-w-0 space-y-2">
        <Legend hint="Herramientas propias: nómbralas y explica para qué sirven.">Herramientas personalizadas</Legend>
        <label className="flex cursor-pointer items-start gap-2.5 py-1 text-[13.5px] text-fg">
          <input
            type="checkbox"
            checked={custom.length > 0}
            onChange={(e) => (e.target.checked ? addCustom() : setTools(removeToolKind(tools, "custom")))}
            className={checkboxCls}
          />
          {TOOL_KIND_LABELS.custom}
        </label>
        {custom.length ? (
          <ol className="space-y-1.5">
            {custom.map((tool, i) => (
              <li key={tool.id} className="grid gap-1.5 rounded-lg border border-border-strong bg-surface p-1.5 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_auto]">
                <input
                  id={`pf-tool-${tool.id}-name`}
                  aria-label={`Nombre de la herramienta personalizada ${i + 1}`}
                  value={tool.name}
                  onChange={(e) => setTools(updateTool(tools, tool.id, { name: e.target.value }))}
                  placeholder="Nombre (p. ej. crm_lookup)"
                  className={inputClass({ size: "sm", mono: true })}
                />
                <input
                  aria-label={`Propósito de la herramienta personalizada ${i + 1}`}
                  value={tool.purpose ?? ""}
                  onChange={(e) => setTools(updateTool(tools, tool.id, { purpose: e.target.value }))}
                  placeholder="Propósito"
                  className={inputClass({ size: "sm" })}
                />
                <button
                  type="button"
                  className={cx(iconBtnDanger, "self-center justify-self-end")}
                  onClick={() => setTools(tools.filter((t) => t.id !== tool.id))}
                  aria-label={`Eliminar herramienta personalizada ${i + 1}`}
                >
                  <TrashIcon size={14} />
                </button>
              </li>
            ))}
          </ol>
        ) : null}
        {custom.length ? (
          <button type="button" className={btn("secondary", "sm")} onClick={addCustom}>
            <PlusIcon size={14} />
            Añadir otra
          </button>
        ) : null}
      </fieldset>
    </div>
  );
}
