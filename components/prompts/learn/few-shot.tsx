import { RichText } from "@/components/glossary/rich-text";
import { CodePanel } from "./code-panel";
import { fewShotBad, fewShotBadWhy, fewShotGood, fewShotGoodWhy, fewShotTips } from "./content";
import { Bullets, CompareCard } from "./ui";

export function FewShot() {
  return (
    <>
      <RichText text="Los ejemplos enseñan más rápido que las instrucciones: el modelo copia el patrón que ve (a esto se le llama [[few-shot-learning|few-shot]], una forma de [[in-context-learning|aprendizaje en contexto]]). Por eso un ejemplo inconsistente puede ser peor que ningún ejemplo." />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <CompareCard tone="bad" tag="Malo" title="Formatos inconsistentes">
          <CodePanel code={fewShotBad} title="prompt.txt" maxHeight={false} />
          <Bullets items={fewShotBadWhy} tone="bad" />
        </CompareCard>
        <CompareCard tone="good" tag="Bueno" title="Estructura idéntica">
          <CodePanel code={fewShotGood} title="prompt.txt" maxHeight={false} />
          <Bullets items={fewShotGoodWhy} tone="good" />
        </CompareCard>
      </div>

      <h3 className="mt-10 text-[17px] font-semibold tracking-[-0.01em] text-fg">Cómo elegir buenos ejemplos</h3>
      <div className="mt-4">
        <Bullets items={fewShotTips} />
      </div>
    </>
  );
}
