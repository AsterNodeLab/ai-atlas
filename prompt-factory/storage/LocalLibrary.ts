import type { LibraryEntry, PromptLibraryRepository } from "../domain/types.ts";

/**
 * PromptLibraryRepository over a minimal key/value storage (localStorage in
 * the browser, a Map in tests). All entries live as JSON under one key. The
 * engine never touches `window`: the caller injects the storage.
 */

/** Minimal storage port so the engine never touches window directly. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const LIBRARY_KEY = "prompt-factory:library";

let counter = 0;

/** crypto.randomUUID when available (browser, Node ≥ 19), else time + counter. */
export function generateId(): string {
  const cryptoApi = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  try {
    if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();
  } catch {
    // Insecure contexts may throw; fall through to the deterministic generator.
  }
  counter += 1;
  return `pf-${Date.now().toString(36)}-${counter.toString(36)}`;
}

function isEntry(value: unknown): value is LibraryEntry {
  if (!value || typeof value !== "object") return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    e.id !== "" &&
    typeof e.title === "string" &&
    typeof e.createdAt === "string" &&
    typeof e.updatedAt === "string" &&
    !!e.promptSpec &&
    typeof e.promptSpec === "object" &&
    !!e.compiledVersions &&
    typeof e.compiledVersions === "object"
  );
}

const byUpdatedDesc = (a: LibraryEntry, b: LibraryEntry) =>
  a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function createLocalLibraryRepository(storage: KeyValueStorage, key: string = LIBRARY_KEY): PromptLibraryRepository {
  let lastTimestamp = 0;

  /** Monotonic ISO timestamps, so "save order" and "updatedAt order" always agree. */
  const now = () => {
    lastTimestamp = Math.max(Date.now(), lastTimestamp + 1);
    return new Date(lastTimestamp).toISOString();
  };

  const read = (): LibraryEntry[] => {
    let raw: string | null = null;
    try {
      raw = storage.getItem(key);
    } catch {
      return [];
    }
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
    } catch {
      // Corrupt JSON: behave as an empty library instead of crashing the UI.
      return [];
    }
  };

  const write = (entries: LibraryEntry[]) => {
    try {
      storage.setItem(key, JSON.stringify(entries));
    } catch {
      throw new Error("No se pudo guardar en la biblioteca local: el almacenamiento está lleno o no está disponible.");
    }
  };

  return {
    list() {
      return read().sort(byUpdatedDesc).map(clone);
    },
    get(id) {
      const found = read().find((e) => e.id === id);
      return found ? clone(found) : undefined;
    },
    save(entry) {
      const entries = read();
      const id = entry.id?.trim() ? entry.id : generateId();
      const existing = entries.find((e) => e.id === id);
      const timestamp = now();
      const saved: LibraryEntry = {
        id,
        title: entry.title?.trim() || "Prompt sin título",
        createdAt: existing?.createdAt ?? entry.createdAt ?? timestamp,
        updatedAt: timestamp,
        promptSpec: clone(entry.promptSpec),
        compiledVersions: { ...(entry.compiledVersions ?? {}) },
      };
      write([saved, ...entries.filter((e) => e.id !== id)]);
      return clone(saved);
    },
    remove(id) {
      const entries = read();
      const next = entries.filter((e) => e.id !== id);
      if (next.length !== entries.length) write(next);
    },
  };
}
