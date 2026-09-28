import type { ModelProfile } from "../domain/types.ts";

/**
 * Target model profiles. Names are configurable data, not code: renaming a
 * model or pointing it to another catalog id never touches the compiler.
 *
 * Adding a model = one adapter in adapters/ (registered in adapters/registry.ts)
 * + one entry here whose `adapterId` points to it. Several profiles may share
 * the same adapter (e.g. two Claude versions using "claude-xml").
 */
export const modelProfiles: ModelProfile[] = [
  {
    id: "claude",
    displayName: "Claude Opus 5.5",
    vendor: "Anthropic",
    catalogId: "anthropic/claude-opus-5.5",
    adapterId: "claude-xml",
    styleSummary: "Estructura XML con delimitadores semánticos; el contexto va antes y la tarea al final.",
  },
  {
    id: "chatgpt",
    displayName: "GPT-6 Astra",
    vendor: "OpenAI",
    catalogId: "openai/gpt-6-astra",
    adapterId: "chatgpt-markdown",
    styleSummary: "Markdown jerárquico con reglas de decisión explícitas y Definition of Done.",
  },
  {
    id: "gemini",
    displayName: "Gemini 3.8 Flash",
    vendor: "Google",
    catalogId: "google/gemini-3.8-flash",
    adapterId: "gemini-sections",
    styleSummary: "Instrucción de sistema, contexto y ejemplos consistentes; la tarea al final.",
  },
];

export const DEFAULT_TARGET_ID = "claude";

export function findModelProfile(id: string): ModelProfile | undefined {
  return modelProfiles.find((p) => p.id === id);
}
