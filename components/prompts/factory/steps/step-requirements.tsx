import { ListEditor } from "../list-editor";
import { fieldDomId } from "../steps";
import type { StepProps } from "./types";

/** Step 5 — what the answer must include or satisfy. */
export function StepRequirements({ spec, actions }: StepProps) {
  return (
    <ListEditor
      id={fieldDomId("requirements")}
      label="Requisitos"
      hint="Lo que la respuesta debe incluir o cumplir. Uno por línea."
      noun="requisito"
      items={spec.requirements}
      onChange={(requirements) => actions.patch({ requirements })}
      placeholder="Ej.: Citar la reseña original en cada tema"
    />
  );
}
