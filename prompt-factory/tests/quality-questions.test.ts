import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createEmptySpec, evaluateQuality, getQuestions } from "../index.ts";
import type { PromptSpec } from "../index.ts";
import { spanishSpec } from "./fixtures.ts";

const byId = (spec: PromptSpec) => Object.fromEntries(evaluateQuality(spec).checks.map((c) => [c.id, c]));

function completeSpec(): PromptSpec {
  return {
    ...spanishSpec(),
    role: "Analista financiero sénior",
    definitionOfDone: ["Cada escenario incluye supuestos explícitos"],
    workflow: ["Revisa los estados financieros", "Calcula los múltiplos", "Construye los escenarios"],
  };
}

describe("quality engine", () => {
  it("scores a complete spec with 100", () => {
    const report = evaluateQuality(completeSpec());
    assert.equal(report.score, 100);
    assert.ok(report.checks.every((c) => c.status === "ok"));
  });

  it("scores the standard investment spec deterministically", () => {
    const report = evaluateQuality(spanishSpec());
    assert.equal(report.score, 80);
    const checks = byId(spanishSpec());
    assert.equal(checks.objective.label, "Objetivo definido");
    assert.equal(checks["definition-of-done"].label, "Falta la Definition of Done");
    assert.equal(checks["definition-of-done"].status, "warn");
    assert.equal(checks.role.label, "Sin rol");
  });

  it("an empty spec scores 0 and flags the missing objective as an error", () => {
    const report = evaluateQuality(createEmptySpec());
    assert.equal(report.score, 0);
    assert.equal(byId(createEmptySpec()).objective.status, "error");
    assert.equal(byId(createEmptySpec()).objective.label, "Falta el objetivo");
  });

  it("asks for examples when the output is structured", () => {
    const spec = { ...spanishSpec(), outputFormat: { kind: "json" as const } };
    const check = byId(spec).examples;
    assert.equal(check.label, "No hay ejemplos");
    assert.equal(check.points, 0);
  });

  it("penalizes conflicts (−20), duplicates (−5) and ambiguity (−15)", () => {
    const base = evaluateQuality(completeSpec()).score;
    const conflict = { ...completeSpec(), constraints: [...completeSpec().constraints!, "No analices la valuación"] };
    assert.equal(evaluateQuality(conflict).score, base - 20);
    assert.equal(byId(conflict).conflicts.points, -20);

    const duplicated = { ...completeSpec(), requirements: [...completeSpec().requirements!, "analiza LA valuación"] };
    assert.equal(evaluateQuality(duplicated).score, base - 5);

    const vague = { ...completeSpec(), objective: "Ayúdame con algo" };
    assert.equal(byId(vague)["vague-objective"].label, "Objetivo demasiado ambiguo");
    assert.equal(evaluateQuality(vague).score, base - 15);
  });

  it("clamps the score to 0–100", () => {
    const spec: PromptSpec = { ...createEmptySpec(), objective: "Haz algo", requirements: ["Usa tablas", "usa tablas"], constraints: ["No uses tablas"] };
    const report = evaluateQuality(spec);
    assert.ok(report.score >= 0 && report.score <= 100);
  });

  it("counts agent success criteria as a Definition of Done", () => {
    const spec: PromptSpec = { ...createEmptySpec({ mode: "agent" }), objective: "Encuentra proveedores con entrega en menos de 48 horas." };
    spec.agent = { ...spec.agent, successCriteria: ["Al menos 3 proveedores verificados"] };
    assert.equal(byId(spec)["definition-of-done"].status, "ok");
    assert.equal(byId(spec)["agent-stop-conditions"].status, "warn");
  });
});

describe("question engine", () => {
  it("asks for the objective first when it is missing", () => {
    const questions = getQuestions(createEmptySpec());
    assert.equal(questions[0].id, "objective");
    assert.equal(questions[0].field, "objective");
  });

  it("asks how to receive the result with the UI's output labels", () => {
    const spec = { ...createEmptySpec(), objective: "Redacta un correo para anunciar el nuevo horario de oficina." };
    const question = getQuestions(spec).find((q) => q.id === "output-format");
    assert.equal(question?.question, "¿Cómo quieres recibir el resultado?");
    assert.equal(question?.field, "outputFormat");
    for (const label of question?.suggestions ?? []) {
      assert.ok(["Texto libre", "Markdown", "JSON", "XML", "Tabla", "Informe", "Código", "Personalizado"].includes(label), label);
    }
  });

  it("asks an agent without tools about external tools", () => {
    const spec = { ...createEmptySpec({ mode: "agent" }), objective: "Mantén actualizado el inventario de la tienda." };
    const question = getQuestions(spec).find((q) => q.id === "agent-tools");
    assert.equal(question?.question, "¿El agente necesita interactuar con herramientas externas?");
    assert.equal(question?.field, "tools");
    for (const label of question?.suggestions ?? []) {
      assert.ok(["Web", "Navegador", "Archivos", "Email", "Base de datos", "Ejecución de código", "APIs"].includes(label), label);
    }
    assert.ok(getQuestions(spec).some((q) => q.field === "agent.stopConditions"));
  });

  it("offers to verify calculations for quantitative tasks, until verification is requested", () => {
    const spec = spanishSpec();
    const question = getQuestions(spec).find((q) => q.id === "verify-calculations");
    assert.equal(question?.question, "¿Quieres que el modelo verifique sus cálculos?");
    const verified = { ...spec, qualityCriteria: ["Verifica cada cálculo antes de presentarlo"] };
    assert.ok(!getQuestions(verified).some((q) => q.id === "verify-calculations"));
  });

  it("suggests roles from the domain of the objective", () => {
    const role = getQuestions(spanishSpec()).find((q) => q.id === "role");
    assert.ok(role?.suggestions?.includes("Analista financiero sénior"));
  });

  it("returns at most 5 questions, ordered by importance, with dotted fields", () => {
    const spec = { ...createEmptySpec({ mode: "agent" }), objective: "Calcula métricas de ventas y publica un reporte." };
    const questions = getQuestions(spec);
    assert.ok(questions.length <= 5);
    assert.deepEqual(
      questions.map((q) => q.id),
      ["output-format", "agent-tools", "agent-stop-conditions", "verify-calculations", "constraints"],
    );
    for (const q of questions) assert.match(q.field, /^[a-zA-Z]+(\.[a-zA-Z0-9]+)*$/);
  });

  it("asks nothing that is already answered", () => {
    const complete = completeSpec();
    const full = { ...complete, qualityCriteria: ["Verifica cada cálculo"] };
    assert.deepEqual(getQuestions(full), []);
  });
});
