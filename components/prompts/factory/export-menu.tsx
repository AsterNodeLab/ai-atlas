import { exportPrompt, type CompileResult, type ExportFormat, type PromptSpec } from "@/prompt-factory";
import { downloadFile } from "./browser";
import { DownloadIcon } from "./icons";
import { attempt } from "./outcome";
import { MenuButton, type MenuItem } from "./popover";
import { btn } from "./ui";

/** Descargar .txt / .md / .json — the engine builds the file (exportPrompt), the browser downloads it. */
export function ExportMenu({ spec, result, announce }: { spec: PromptSpec; result: CompileResult | undefined; announce: (message: string) => void }) {
  const compiles = Boolean(result?.ok);

  const download = (format: ExportFormat) => {
    const file = attempt(() => exportPrompt(spec, result, format));
    if (!file.ok) {
      announce(`No se pudo exportar: ${file.error}`);
      return;
    }
    announce(downloadFile(file.value) ? `Descargado: ${file.value.filename}` : "El navegador bloqueó la descarga.");
  };

  const items: MenuItem[] = [
    {
      id: "txt",
      label: "Texto (.txt)",
      description: compiles ? "El prompt compilado, en texto plano." : "Corrige los errores para exportar el prompt.",
      disabled: !compiles,
      onSelect: () => download("txt"),
    },
    {
      id: "md",
      label: "Markdown (.md)",
      description: compiles ? "El prompt compilado, listo para documentación." : "Corrige los errores para exportar el prompt.",
      disabled: !compiles,
      onSelect: () => download("md"),
    },
    {
      id: "json",
      label: "Especificación (.json)",
      description: "El PromptSpec completo (y las versiones compiladas). Se puede volver a importar.",
      onSelect: () => download("json"),
    },
  ];

  return (
    <MenuButton
      trigger={
        <>
          <DownloadIcon size={14} />
          <span className="hidden sm:inline">Descargar</span>
        </>
      }
      triggerLabel="Descargar"
      triggerClassName={btn("secondary", "sm")}
      menuLabel="Formato de descarga"
      items={items}
      align="end"
    />
  );
}
