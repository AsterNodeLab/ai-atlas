import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compilePrompt, createEmptySpec, createLocalLibrary, exportPrompt, importSpec } from "../index.ts";
import type { ExportFormat } from "../index.ts";
import { memoryStorage, researchAgentSpec, spanishSpec } from "./fixtures.ts";

describe("export", () => {
  const spec = { ...spanishSpec(), metadata: { ...spanishSpec().metadata, title: "Análisis de inversión" } };
  const result = compilePrompt(spec, "claude");

  it("txt contains exactly the compiled prompt", () => {
    const file = exportPrompt(spec, result, "txt");
    assert.equal(file.filename, "analisis-de-inversion-claude.txt");
    assert.equal(file.mime, "text/plain;charset=utf-8");
    assert.equal(file.content, `${result.compiled?.prompt}\n`);
  });

  it("md wraps the prompt in a fenced block with its syntax", () => {
    const file = exportPrompt(spec, result, "md");
    assert.ok(file.content.startsWith("# Análisis de inversión\n"));
    assert.ok(file.content.includes(`\`\`\`xml\n${result.compiled?.prompt}\n\`\`\``));
    const gpt = exportPrompt(spec, compilePrompt(spec, "chatgpt"), "md");
    assert.match(gpt.content, /```markdown\n# Objetivo/);
  });

  it("json keeps the spec and the compiled versions", () => {
    const file = exportPrompt(spec, result, "json");
    const data = JSON.parse(file.content);
    assert.equal(data.format, "prompt-factory/spec");
    assert.equal(data.version, 1);
    assert.deepEqual(data.spec, spec);
    assert.deepEqual(data.compiled, { claude: result.compiled?.prompt });
  });

  it("txt/md compile on demand when no result is given, and report errors readably", () => {
    assert.ok(exportPrompt(spec, undefined, "txt").content.startsWith("<objective>"));
    const empty = exportPrompt(createEmptySpec(), undefined, "txt");
    assert.match(empty.content, /^No se pudo compilar el prompt:\n- Falta el objetivo/);
  });

  it("rejects an invalid format with a readable message", () => {
    assert.throws(() => exportPrompt(spec, result, "pdf" as ExportFormat), /El formato de exportación «pdf» no es válido/);
  });
});

describe("import", () => {
  it("round-trips an exported spec (standard and agent)", () => {
    for (const spec of [spanishSpec(), researchAgentSpec()]) {
      const { spec: imported, issues } = importSpec(exportPrompt(spec, undefined, "json").content);
      assert.deepEqual(imported, spec);
      assert.ok(!issues.some((i) => i.severity === "error"), JSON.stringify(issues));
    }
  });

  it("restores an in-progress draft with an empty objective (spec + issue)", () => {
    const draft = createEmptySpec();
    draft.requirements = ["Primer requisito", ""];
    const { spec, issues } = importSpec(exportPrompt(draft, undefined, "json").content);
    assert.deepEqual(spec, draft, "empty rows being edited are preserved");
    assert.ok(issues.some((i) => i.code === "objective.missing"));
  });

  it("never throws on bad input", () => {
    const cases: [string, string][] = [
      ["", "import.empty"],
      ["{ no es json", "import.invalidJson"],
      ["[1,2,3]", "import.invalidFormat"],
      [JSON.stringify({ format: "otra-app", version: 1, spec: {} }), "import.unknownFormat"],
      [JSON.stringify({ format: "prompt-factory/spec", version: 99, spec: spanishSpec() }), "import.version.newer"],
      [JSON.stringify({ format: "prompt-factory/spec", version: 1 }), "import.spec.missing"],
    ];
    for (const [json, code] of cases) {
      const { spec, issues } = importSpec(json);
      assert.equal(spec, undefined, code);
      assert.equal(issues[0]?.code, code);
      assert.equal(issues[0]?.severity, "error");
    }
  });

  it("rejects structurally invalid specs with readable messages", () => {
    const broken = { format: "prompt-factory/spec", version: 1, spec: { ...spanishSpec(), constraints: [1, "ok"] } };
    const { spec, issues } = importSpec(JSON.stringify(broken));
    assert.equal(spec, undefined);
    assert.equal(issues[0].message, "El elemento 1 de «restricciones» debe ser texto.");
    assert.equal(issues[0].field, "constraints.0");
  });

  it("accepts a bare spec without the export envelope", () => {
    const { spec, issues } = importSpec(JSON.stringify(spanishSpec()));
    assert.deepEqual(spec, spanishSpec());
    assert.equal(issues[0].code, "import.rawSpec");
  });
});

describe("local library", () => {
  it("saves, lists (newest first), gets, updates and removes entries", () => {
    const storage = memoryStorage();
    const library = createLocalLibrary(storage);
    const first = library.save({ id: "", title: "Primero", promptSpec: spanishSpec(), compiledVersions: { claude: "A" } });
    const second = library.save({ id: "", title: "  ", promptSpec: researchAgentSpec(), compiledVersions: {} });

    assert.ok(first.id && second.id && first.id !== second.id);
    assert.equal(second.title, "Prompt sin título");
    assert.deepEqual(
      library.list().map((e) => e.id),
      [second.id, first.id],
    );
    assert.deepEqual(library.get(first.id)?.promptSpec, spanishSpec());

    const updated = library.save({ ...first, title: "Primero editado" });
    assert.equal(updated.createdAt, first.createdAt);
    assert.ok(updated.updatedAt > first.updatedAt);
    assert.equal(library.list()[0].id, first.id, "the updated entry moves to the top");
    assert.equal(library.list().length, 2);

    library.remove(second.id);
    assert.equal(library.get(second.id), undefined);
    assert.equal(JSON.parse(storage.data.get("prompt-factory:library") ?? "[]").length, 1);
  });

  it("survives corrupt JSON and ignores malformed entries", () => {
    assert.deepEqual(createLocalLibrary(memoryStorage({ "prompt-factory:library": "{corrupto" })).list(), []);
    const mixed = JSON.stringify([{ id: 1 }, { id: "ok", title: "Bien", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", promptSpec: spanishSpec(), compiledVersions: {} }]);
    const library = createLocalLibrary(memoryStorage({ "prompt-factory:library": mixed }));
    assert.deepEqual(
      library.list().map((e) => e.id),
      ["ok"],
    );
  });

  it("returns copies, so callers cannot mutate stored data", () => {
    const library = createLocalLibrary(memoryStorage());
    const saved = library.save({ id: "fijo", title: "Copia", promptSpec: spanishSpec(), compiledVersions: {} });
    saved.promptSpec.objective = "mutado";
    assert.equal(library.get("fijo")?.promptSpec.objective, spanishSpec().objective);
  });

  it("reports a full storage with a readable error", () => {
    const library = createLocalLibrary({
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    assert.throws(() => library.save({ id: "", title: "x", promptSpec: spanishSpec(), compiledVersions: {} }), /No se pudo guardar en la biblioteca local/);
  });
});
