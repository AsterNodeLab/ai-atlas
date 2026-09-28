import type { PromptSpec } from "@/prompt-factory";
import type { FactoryActions } from "../use-prompt-factory";

export interface StepProps {
  spec: PromptSpec;
  actions: FactoryActions;
}
