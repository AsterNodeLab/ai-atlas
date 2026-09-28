import {
  createLocalLibrary,
  exportPrompt,
  importSpec,
  type ExportFile,
  type PromptLibraryRepository,
  type PromptSpec,
} from "@/prompt-factory";

/**
 * Browser-only side effects (storage, clipboard, downloads). Every call is
 * wrapped in try/catch: private mode, blocked storage or a full quota must
 * degrade the feature, never break the tool. Call these from effects and
 * event handlers only — never during render.
 */

export const DRAFT_KEY = "prompt-factory:draft";

let library: PromptLibraryRepository | undefined;

/** Lazily creates the localStorage-backed library (null when storage is unavailable). */
export function getLibrary(): PromptLibraryRepository | null {
  if (library) return library;
  try {
    library = createLocalLibrary(window.localStorage);
    return library;
  } catch {
    return null;
  }
}

/** The draft is stored in the engine's own export format so importSpec can validate it on restore. */
export function readDraft(): PromptSpec | undefined {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return undefined;
    return importSpec(raw).spec;
  } catch {
    return undefined;
  }
}

export function writeDraft(spec: PromptSpec): void {
  try {
    window.localStorage.setItem(DRAFT_KEY, exportPrompt(spec, undefined, "json").content);
  } catch {
    // Storage unavailable or full: the draft simply is not persisted.
  }
}

export function newEntryId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    // fall through
  }
  return `pf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function downloadFile(file: ExportFile): boolean {
  try {
    const url = URL.createObjectURL(new Blob([file.content], { type: file.mime }));
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}
