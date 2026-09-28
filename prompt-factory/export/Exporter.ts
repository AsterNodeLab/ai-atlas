import { findModelProfile, DEFAULT_TARGET_ID } from "../config/models.ts";
import { compileForTarget } from "../compiler/PromptCompiler.ts";
import { cleanLine, stripAccents } from "../domain/text.ts";
import { SPEC_VERSION } from "../domain/types.ts";
import type { CompileResult, ExportFile, ExportFormat, PromptSpec, ValidationIssue } from "../domain/types.ts";
import { hasErrors, validateExportFormat, validateSharedSpec, validateStructure } from "../domain/validators.ts";
import { fence } from "../render/blocks.ts";

/**
 * Export: txt = the prompt; md = title + fenced prompt; json = the PromptSpec
 * (source of truth) plus the compiled versions at export time.
 * Import: never throws; returns the spec (when usable) and readable issues.
 */

export const EXPORT_FORMAT_ID = "prompt-factory/spec";

export interface ExportEnvelope {
  format: typeof EXPORT_FORMAT_ID;
  version: number;
  spec: PromptSpec;
  compiled: Record<string, string>;
}

const MIME: Record<ExportFormat, string> = {
  txt: "text/plain;charset=utf-8",
  md: "text/markdown;charset=utf-8",
  json: "application/json",
};

export function exportTitle(spec: PromptSpec): string {
  const title = cleanLine(spec?.metadata?.title ?? "");
  if (title) return title;
  const objective = cleanLine((spec?.objective ?? "").split("\n")[0] ?? "");
  if (!objective) return "Prompt";
  return objective.length > 60 ? `${objective.slice(0, 59)}…` : objective;
}

export function slugify(text: string): string {
  const slug = stripAccents(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "prompt";
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function resolveCompiled(spec: PromptSpec, result: CompileResult | undefined): CompileResult {
  return result ?? compileForTarget(spec, spec?.metadata?.targetModel || DEFAULT_TARGET_ID);
}

function notCompiledText(result: CompileResult): string {
  const errors = result.validation.issues.filter((i) => i.severity === "error").map((i) => `- ${i.message}`);
  return ["No se pudo compilar el prompt:", ...(errors.length ? errors : ["- Revisa la especificación."])].join("\n");
}

export function exportPromptFile(spec: PromptSpec, result: CompileResult | undefined, format: ExportFormat): ExportFile {
  const formatIssue = validateExportFormat(format);
  if (formatIssue) throw new Error(formatIssue.message);
  const title = exportTitle(spec);
  const slug = slugify(title);

  if (format === "json") {
    const compiled: Record<string, string> = {};
    if (result?.ok && result.compiled) compiled[result.targetId] = result.compiled.prompt;
    const envelope: ExportEnvelope = { format: EXPORT_FORMAT_ID, version: SPEC_VERSION, spec: clone(spec), compiled };
    return { filename: `${slug}.json`, mime: MIME.json, content: `${JSON.stringify(envelope, null, 2)}\n` };
  }

  const compiled = resolveCompiled(spec, result);
  const prompt = compiled.ok && compiled.compiled ? compiled.compiled.prompt : undefined;
  const suffix = compiled.targetId ? `-${slugify(compiled.targetId)}` : "";

  if (format === "txt") {
    return { filename: `${slug}${suffix}.txt`, mime: MIME.txt, content: `${prompt ?? notCompiledText(compiled)}\n` };
  }

  const profile = findModelProfile(compiled.targetId);
  const lines = [`# ${title}`, ""];
  if (profile) lines.push(`Compilado para ${profile.displayName} (${profile.vendor}).`, "");
  lines.push(prompt ? fence(prompt, compiled.compiled?.syntax ?? "") : notCompiledText(compiled));
  return { filename: `${slug}${suffix}.md`, mime: MIME.md, content: `${lines.join("\n")}\n` };
}

// ───────────────────────── Import ─────────────────────────

const isObject = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v);

const importError = (code: string, message: string): ValidationIssue => ({ code, severity: "error", message });

function checkVersion(version: unknown, what: string): ValidationIssue | undefined {
  if (version === undefined) return undefined;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    return importError("import.version.invalid", `La versión ${what} no es válida.`);
  }
  if (version > SPEC_VERSION) {
    return importError(
      "import.version.newer",
      `El archivo usa la versión ${version} ${what}, más nueva que la que admite esta aplicación (${SPEC_VERSION}).`,
    );
  }
  return undefined;
}

/** Fills only MISSING required fields; user content (even empty rows) is preserved. */
function repairSpec(raw: Record<string, unknown>): Record<string, unknown> {
  const metadata = isObject(raw.metadata) ? { ...raw.metadata } : {};
  if (metadata.targetModel === undefined) metadata.targetModel = DEFAULT_TARGET_ID;
  if (metadata.mode === undefined) metadata.mode = "standard";
  if (metadata.language === undefined) metadata.language = "es";
  return { ...raw, version: SPEC_VERSION, metadata, objective: raw.objective === undefined ? "" : raw.objective };
}

export function importSpecJson(json: string): { spec?: PromptSpec; issues: ValidationIssue[] } {
  try {
    if (typeof json !== "string" || !json.trim()) return { issues: [importError("import.empty", "El archivo está vacío.")] };
    let data: unknown;
    try {
      data = JSON.parse(json);
    } catch {
      return { issues: [importError("import.invalidJson", "El archivo no es un JSON válido.")] };
    }
    if (!isObject(data)) return { issues: [importError("import.invalidFormat", "El archivo no contiene una especificación de Prompt Factory.")] };

    const issues: ValidationIssue[] = [];
    let rawSpec: unknown;
    if ("format" in data) {
      if (data.format !== EXPORT_FORMAT_ID) {
        return { issues: [importError("import.unknownFormat", `El archivo no es una exportación de Prompt Factory (formato «${String(data.format)}»).`)] };
      }
      if (data.version === undefined) return { issues: [importError("import.version.missing", "Al archivo le falta la versión del formato.")] };
      const versionIssue = checkVersion(data.version, "del formato");
      if (versionIssue) return { issues: [versionIssue] };
      rawSpec = data.spec;
    } else if ("metadata" in data || "objective" in data) {
      rawSpec = data;
      issues.push({
        code: "import.rawSpec",
        severity: "info",
        message: "El archivo contiene una especificación sin el envoltorio de exportación; se importó directamente.",
      });
    } else {
      return { issues: [importError("import.invalidFormat", "El archivo no contiene una especificación de Prompt Factory.")] };
    }

    if (!isObject(rawSpec)) return { issues: [importError("import.spec.missing", "El archivo no incluye la especificación del prompt.")] };
    const specVersionIssue = checkVersion(rawSpec.version, "de la especificación");
    if (specVersionIssue) return { issues: [specVersionIssue] };

    const repaired = repairSpec(rawSpec);
    const structural = validateStructure(repaired);
    if (hasErrors(structural)) return { issues: [...issues, ...structural] };

    const spec = repaired as unknown as PromptSpec;
    return { spec, issues: [...issues, ...validateSharedSpec(spec)] };
  } catch {
    return { issues: [importError("import.internal", "No se pudo leer el archivo.")] };
  }
}
