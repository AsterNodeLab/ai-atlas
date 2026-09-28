import type { ModelAdapter } from "../domain/types.ts";
import { chatgptAdapter } from "./ChatGPTAdapter.ts";
import { claudeAdapter } from "./ClaudeAdapter.ts";
import { geminiAdapter } from "./GeminiAdapter.ts";

/**
 * Adapter registry keyed by adapterId (ModelProfile.adapterId points here).
 * Adding a model = write an adapter with defineAdapter(), register it below
 * and add a profile in config/models.ts. The compiler core never changes.
 */
const adapters = new Map<string, ModelAdapter>();

export function registerAdapter(adapter: ModelAdapter): void {
  adapters.set(adapter.id, adapter);
}

export function getAdapter(adapterId: string): ModelAdapter | undefined {
  return adapters.get(adapterId);
}

export function listAdapters(): ModelAdapter[] {
  return [...adapters.values()];
}

registerAdapter(claudeAdapter);
registerAdapter(chatgptAdapter);
registerAdapter(geminiAdapter);
