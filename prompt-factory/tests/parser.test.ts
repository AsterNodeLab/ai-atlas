import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseFreeform } from "../index.ts";
import type { FreeformSuggestions } from "../index.ts";

const INVESTMENT =
  "Quiero que investigue una acción, analice estados financieros, compare múltiplos, busque riesgos y al final me diga los escenarios bajista, base y alcista. " +
  "No inventes datos financieros. Usa internet para buscar información actualizada. Entrégamelo en una tabla.";

function allConfidences(s: FreeformSuggestions): string[] {
  return [s.objective, s.outputFormat, s.mode, ...s.requirements, ...s.constraints, ...s.tools]
    .filter((x): x is NonNullable<typeof x> => x !== undefined)
    .map((x) => x.confidence);
}

describe("freeform parser — Spanish investment example", () => {
  const result = parseFreeform(INVESTMENT);

  it("finds the objective after the intent cue", () => {
    assert.equal(result.objective?.value, "Investigue una acción");
    assert.equal(result.objective?.confidence, "medium");
  });

  it("turns the verb-phrase list into requirements, keeping comma lists together", () => {
    assert.deepEqual(
      result.requirements.map((r) => r.value),
      ["Analice estados financieros", "Compare múltiplos", "Busque riesgos", "Diga los escenarios bajista, base y alcista"],
    );
  });

  it("detects constraints, output format and tools", () => {
    assert.deepEqual(
      result.constraints.map((c) => c.value),
      ["No inventes datos financieros"],
    );
    assert.equal(result.outputFormat?.value, "table");
    assert.deepEqual(
      result.tools.map((t) => [t.value, t.confidence]),
      [["web", "medium"]],
    );
    assert.equal(result.mode, undefined);
    assert.deepEqual(result.unclassified, []);
  });

  it("keeps the source fragment of each suggestion", () => {
    assert.equal(result.outputFormat?.source, "Entrégamelo en una tabla");
    assert.ok(result.requirements[0].source.startsWith("Quiero que investigue"));
  });
});

describe("freeform parser — other inputs", () => {
  it("detects agent mode and tools from an agent request", () => {
    const result = parseFreeform("Quiero un agente que revise mi bandeja de correo hasta encontrar facturas pendientes y las guarde en un archivo CSV.");
    assert.equal(result.mode?.value, "agent");
    assert.equal(result.mode?.confidence, "medium");
    const tools = result.tools.map((t) => t.value).sort();
    assert.deepEqual(tools, ["email", "files"]);
    assert.equal(result.objective?.value, "Revise mi bandeja de correo hasta encontrar facturas pendientes");
    assert.deepEqual(
      result.requirements.map((r) => r.value),
      ["Guarde en un archivo CSV"],
    );
  });

  it("parses English cues and bullet lists", () => {
    const result = parseFreeform("I want you to research a company, compare competitors and then summarize the risks.\n- Don't use jargon\n- Output as JSON");
    assert.equal(result.objective?.value, "Research a company");
    assert.deepEqual(
      result.requirements.map((r) => r.value),
      ["Compare competitors", "Summarize the risks"],
    );
    assert.deepEqual(
      result.constraints.map((c) => c.value),
      ["Don't use jargon"],
    );
    assert.equal(result.outputFormat?.value, "json");
  });

  it("does not suggest a tool from a negated sentence", () => {
    const result = parseFreeform("Necesito un resumen del contrato. No uses internet.");
    assert.deepEqual(result.tools, []);
    assert.equal(result.constraints[0].value, "No uses internet");
  });

  it("keeps unmatched sentences as unclassified and never claims high confidence", () => {
    const result = parseFreeform("Necesito un plan de estudio para cálculo. El examen es en marzo. Solo tengo dos horas al día.");
    assert.equal(result.objective?.value, "Un plan de estudio para cálculo");
    assert.deepEqual(result.unclassified, ["El examen es en marzo"]);
    assert.deepEqual(
      result.constraints.map((c) => c.value),
      ["Solo tengo dos horas al día"],
    );
    for (const confidence of allConfidences(result)) assert.ok(confidence === "low" || confidence === "medium");
  });

  it("falls back to a low-confidence objective without an intent cue", () => {
    const result = parseFreeform("Resumen del informe anual para el consejo");
    assert.equal(result.objective?.confidence, "low");
    assert.deepEqual(result.unclassified, []);
  });

  it("handles empty input", () => {
    assert.deepEqual(parseFreeform("   "), { requirements: [], constraints: [], tools: [], unclassified: [] });
  });
});
