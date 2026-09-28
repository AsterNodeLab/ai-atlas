import { createEmptySpec } from "../index.ts";
import type { CompileResult, PromptLanguage, PromptSpec } from "../index.ts";
import { getStrings, SECTION_TAGS } from "../i18n/strings.ts";
import type { SectionId } from "../i18n/strings.ts";

/** Acceptance test 1: standard investment analysis. */
export function investmentSpec(language: PromptLanguage = "en"): PromptSpec {
  const spec = createEmptySpec({ language });
  spec.objective = "Analyze a company before investing.";
  spec.context = [{ kind: "background", text: "The user wants fundamental and quantitative analysis." }];
  spec.requirements = ["Analyze financial statements", "Analyze valuation", "Identify risks", "Create bear, base and bull scenarios"];
  spec.constraints = ["Do not invent financial data", "Distinguish facts from assumptions"];
  spec.outputFormat = { kind: "report", description: "Structured investment report" };
  return spec;
}

/** Acceptance test 2: autonomous research agent. */
export function researchAgentSpec(language: PromptLanguage = "en"): PromptSpec {
  const spec = createEmptySpec({ mode: "agent", language });
  spec.objective = "Research a company autonomously.";
  spec.tools = [
    { id: "web", kind: "web", name: "Web search" },
    { id: "browser", kind: "browser", name: "Browser" },
    { id: "code", kind: "code", name: "Code execution", purpose: "compute financial ratios" },
  ];
  spec.agent = {
    ...spec.agent,
    loop: { observe: true, assess: false, plan: true, act: true, verify: true, updateState: true },
    errorRecovery: { enabled: true, maxEquivalentRetries: 2, replanAfterFailures: 2 },
    budget: { maxIterations: 15, maxRetries: 2 },
    stopConditions: ["Stop when all research requirements are verified."],
  };
  return spec;
}

/** Spanish standard spec used across tests. */
export function spanishSpec(): PromptSpec {
  const spec = createEmptySpec();
  spec.objective = "Analiza una empresa antes de invertir en ella.";
  spec.context = [{ kind: "background", text: "El usuario quiere un análisis fundamental y cuantitativo." }];
  spec.requirements = ["Analiza los estados financieros", "Analiza la valuación", "Identifica los riesgos", "Crea escenarios bajista, base y alcista"];
  spec.constraints = ["No inventes datos financieros", "Distingue los hechos de los supuestos"];
  spec.outputFormat = { kind: "report", description: "Informe de inversión estructurado" };
  return spec;
}

export function compiledPrompt(result: CompileResult): string {
  if (!result.ok || !result.compiled) {
    throw new Error(`Compilation failed: ${result.validation.issues.map((i) => i.message).join(" | ")}`);
  }
  return result.compiled.prompt;
}

const HEADING_LEVEL: Record<string, number> = { claude: 0, chatgpt: 1, gemini: 2 };

/** Extracts one section's body from a compiled prompt (XML tag or Markdown heading). */
export function sectionBody(result: CompileResult, id: SectionId, language: PromptLanguage = "en"): string | undefined {
  const prompt = compiledPrompt(result);
  if (result.compiled?.syntax === "xml") {
    const tag = SECTION_TAGS[id];
    const match = new RegExp(`^<${tag}>\\n([\\s\\S]*?)\\n</${tag}>$`, "m").exec(prompt);
    return match?.[1];
  }
  const level = HEADING_LEVEL[result.targetId] ?? 1;
  const hashes = "#".repeat(level);
  const title = getStrings(language).headings[id];
  const lines = prompt.split("\n");
  const start = lines.indexOf(`${hashes} ${title}`);
  if (start < 0) return undefined;
  const body: string[] = [];
  let fenced = false;
  for (const line of lines.slice(start + 1)) {
    if (/^(`{3,}|~{3,})/.test(line)) fenced = !fenced;
    if (!fenced && new RegExp(`^#{1,${level}} `).test(line)) break;
    body.push(line);
  }
  return body.join("\n").trim();
}

/** Asserts helpers shared by several suites. */
export function emptyXmlTags(prompt: string): string[] {
  return [...prompt.matchAll(/<([a-z_]+)(?:\s[^>]*)?>\s*<\/\1>/g)].map((m) => m[1]);
}

export function emptyMarkdownHeadings(prompt: string): string[] {
  const lines = prompt.split("\n");
  const empty: string[] = [];
  let fenced = false;
  lines.forEach((line, i) => {
    if (/^(`{3,}|~{3,})/.test(line)) fenced = !fenced;
    const heading = !fenced ? /^(#{1,6}) (.+)$/.exec(line) : null;
    if (!heading) return;
    const next = lines.slice(i + 1).find((l) => l.trim() !== "");
    const nextHeading = next ? /^(#{1,6}) /.exec(next) : null;
    if (!next || (nextHeading && nextHeading[1].length <= heading[1].length)) empty.push(heading[2]);
  });
  return empty;
}

/** In-memory KeyValueStorage for library tests. */
export function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}
