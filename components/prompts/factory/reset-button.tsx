import { FileIcon } from "./icons";
import { Popover } from "./popover";
import { btn } from "./ui";

/** "Nuevo": confirmation popover before discarding the current draft. */
export function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <Popover
      trigger={
        <>
          <FileIcon size={14} />
          <span className="hidden sm:inline">Nuevo</span>
        </>
      }
      triggerLabel="Nueva especificación"
      triggerClassName={btn("ghost", "sm")}
      panelLabel="Confirmar nueva especificación"
      align="end"
    >
      {(close) => (
        <div className="space-y-3 p-3">
          <p className="text-[13.5px] font-medium text-fg">¿Empezar una especificación nueva?</p>
          <p className="text-[12.5px] leading-snug text-muted">
            Se descarta el borrador actual. Se conservan el modelo destino, el idioma y lo guardado en la biblioteca.
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} className={btn("ghost", "sm")}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onReset();
                close();
              }}
              className={btn("danger", "sm")}
            >
              Empezar de cero
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
}
