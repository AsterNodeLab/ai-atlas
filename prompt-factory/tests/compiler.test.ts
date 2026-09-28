import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compileAll, compilePrompt, createEmptySpec, defaultAgentConfig, validateSpec } from "../index.ts";
import type { PromptSpec, ValidationIssue } from "../index.ts";
import { normalizeSpec } from "../compiler/Normalizer.ts";
import { evaluateRules } from "../compiler/RuleEngine.ts";
import { formatPrompt } from "../compiler/Formatter.ts";
import { compiledPrompt, emptyMarkdownHeadings, emptyXmlTags, sectionBody, spanishSpec } from "./fixtures.ts";

const TARGETS = ["claude", "chatgpt", "gemini"];
const codes = (issues: ValidationIssue[]) => issues.map((i) => i.code);

describe("standard mode (Spanish)", () => {
  const results = compileAll(spanishSpec());

  it("compiles for the three targets with localized headings", () => {
    for (const target of TARGETS) assert.equal(results[target].ok, true);
    assert.match(compiledPrompt(results.chatgpt), /^# Requisitos$/m);
    assert.match(compiledPrompt(results.gemini), /^## Instrucción del sistema$/m);
    assert.match(compiledPrompt(results.gemini), /Basándote exclusivamente en la información anterior, analiza una empresa/);
    // XML tag names stay English identifiers.
    assert.match(compiledPrompt(results.claude), /<constraints>\n- No inventes datos financieros/);
  });

  it("explains, in Spanish, only what happened", () => {
    const claude = results.claude.compiled?.transformations.map((t) => t.reason) ?? [];
    assert.ok(claude.includes("Se eligió estructura XML porque el adaptador de Claude usa delimitadores semánticos."));
    assert.ok(!claude.some((r) => r.includes("Ejemplos")), "no examples → no examples explanation");
    assert.ok(!claude.some((r) => r.includes("modo agente")), "standard mode → no agent explanation");
  });

  it("names only the instruction groups that exist", () => {
    const spec: PromptSpec = { ...spanishSpec(), decisionRules: [{ when: "falta un dato", then: "indícalo" }] };
    const reasons = compilePrompt(spec, "claude").compiled?.transformations.map((t) => t.reason) ?? [];
    assert.ok(reasons.includes("Los requisitos y las reglas de decisión se agruparon dentro de <instructions>."));
  });

  it("does not invent decision rules when there are no priorities", () => {
    for (const target of TARGETS) assert.ok(!results[target].compiled?.sections.includes("decision-rules"));
  });
});

describe("empty optional fields", () => {
  const spec: PromptSpec = {
    ...createEmptySpec(),
    objective: "Resume el reporte trimestral para el equipo directivo.",
    role: "   ",
    requirements: ["", "   "],
    constraints: [""],
    context: [{ kind: "source", text: "  " }],
    inputs: [{ name: "", description: "", value: "" }],
    examples: [{ input: "", output: "" }],
    tools: [{ id: "custom-1", kind: "custom", name: "" }],
    decisionRules: [{ when: "", then: "" }],
    outputFormat: { kind: "custom" },
  };

  it("produce no empty sections, tags or headings", () => {
    const results = compileAll(spec);
    for (const target of TARGETS) {
      const prompt = compiledPrompt(results[target]);
      assert.deepEqual(emptyXmlTags(prompt), [], `${target}: empty tags`);
      assert.deepEqual(emptyMarkdownHeadings(prompt), [], `${target}: empty headings`);
      assert.ok(!/undefined|\[object Object\]|NaN/.test(prompt), `${target}: leaked value`);
      assert.ok(!/\n{3,}/.test(prompt), `${target}: extra blank lines`);
    }
    assert.deepEqual(results.claude.compiled?.sections, ["objective", "task"]);
    assert.deepEqual(results.chatgpt.compiled?.sections, ["objective"]);
    assert.deepEqual(results.gemini.compiled?.sections, ["system-instruction", "task"]);
  });
});

describe("blocking errors", () => {
  it("a missing objective blocks compilation with a readable message", () => {
    const result = compilePrompt(createEmptySpec(), "claude");
    assert.equal(result.ok, false);
    assert.equal(result.compiled, undefined);
    const issue = result.validation.issues.find((i) => i.code === "objective.missing");
    assert.ok(issue);
    assert.equal(issue.severity, "error");
    assert.equal(issue.field, "objective");
    assert.equal(issue.message, "Falta el objetivo: describe qué quieres que logre el modelo.");
  });

  it("an unknown target is an error, not an exception", () => {
    const result = compilePrompt(spanishSpec(), "llama");
    assert.equal(result.ok, false);
    assert.ok(codes(result.validation.issues).includes("target.unknown"));
  });

  it("a malformed spec never throws", () => {
    const broken = { ...spanishSpec(), requirements: "no es una lista" } as unknown as PromptSpec;
    const result = compilePrompt(broken, "claude");
    assert.equal(result.ok, false);
    const issue = result.validation.issues[0];
    assert.equal(issue.code, "schema.type");
    assert.equal(issue.message, "El campo «requisitos» debe ser una lista.");
  });
});

describe("agent validation", () => {
  const agentSpec = (patch: Partial<NonNullable<PromptSpec["agent"]>>): PromptSpec => ({
    ...createEmptySpec({ mode: "agent" }),
    objective: "Revisa la bandeja de soporte y clasifica los tickets pendientes.",
    agent: { ...defaultAgentConfig(), ...patch },
  });

  it("loop without stop conditions nor max iterations is an error", () => {
    const result = compilePrompt(agentSpec({ budget: {}, stopConditions: [] }), "claude");
    assert.equal(result.ok, false);
    const issue = result.validation.issues.find((i) => i.code === "agent.loop.noStop");
    assert.ok(issue);
    assert.equal(issue.field, "agent.stopConditions");
    assert.equal(
      issue.message,
      "Tu agente tiene activado un loop, pero no tiene ninguna condición de parada ni un máximo de iteraciones. Agrega al menos una de las dos.",
    );
  });

  it("no user stop conditions but a max iterations is only a warning", () => {
    const result = compilePrompt(agentSpec({ stopConditions: [] }), "chatgpt");
    assert.equal(result.ok, true);
    const issue = result.validation.issues.find((i) => i.code === "agent.stopConditions.missing");
    assert.equal(issue?.severity, "warning");
  });

  it("invalid numeric budgets are readable errors", () => {
    const result = validateSpec(agentSpec({ budget: { maxIterations: 0 }, errorRecovery: { enabled: true, maxEquivalentRetries: 1.5 } }), "claude");
    assert.equal(result.valid, false);
    const messages = result.issues.map((i) => i.message);
    assert.ok(messages.includes("El máximo de iteraciones debe ser un número entero mayor o igual a 1."));
    assert.ok(messages.includes("El número de reintentos equivalentes debe ser un número entero mayor o igual a 0."));
  });

  it("agent mode without AgentConfig uses defaults", () => {
    const spec = { ...createEmptySpec({ mode: "agent" }), objective: "Monitorea precios de la competencia cada semana." };
    delete spec.agent;
    const result = compilePrompt(spec, "gemini");
    assert.equal(result.ok, true);
    assert.ok(codes(result.validation.issues).includes("agent.defaults"));
    assert.match(sectionBody(result, "budget", "es") ?? "", /máximo 20/);
  });

  it("error recovery numbers come from AgentConfig and missing ones are omitted", () => {
    const result = compilePrompt(agentSpec({ errorRecovery: { enabled: true, maxEquivalentRetries: 4, escalateAfterStrategies: 5 } }), "claude");
    const recovery = sectionBody(result, "error-recovery") ?? "";
    assert.match(recovery, /como máximo 4 veces/);
    assert.match(recovery, /Si 5 estrategias materialmente distintas fallan/);
    assert.ok(!recovery.includes("REPLAN"), "replanAfterFailures is empty → no replan line");
  });

  it("disabled error recovery removes the section and RETRY", () => {
    const result = compilePrompt(agentSpec({ errorRecovery: { enabled: false } }), "chatgpt");
    assert.ok(!result.compiled?.sections.includes("error-recovery"));
    const loop = sectionBody(result, "loop-protocol", "es") ?? "";
    assert.match(loop, /CONTINUE/);
    assert.ok(!loop.includes("RETRY"));
  });

  it("an agent without tools is told not to simulate them", () => {
    const result = compilePrompt(agentSpec({}), "claude");
    assert.match(sectionBody(result, "tool-policy") ?? "", /No tienes herramientas externas/);
  });
});

describe("duplicates and conflicts", () => {
  it("detects duplicated requirements (case/whitespace-insensitive) and emits them once", () => {
    const spec = { ...spanishSpec(), requirements: ["Usa ejemplos concretos", "usa   EJEMPLOS concretos."] };
    const result = compilePrompt(spec, "chatgpt");
    const issue = result.validation.issues.find((i) => i.code === "requirements.duplicate");
    assert.ok(issue);
    assert.equal(issue.field, "requirements.1");
    assert.equal(issue.message, "El requisito «usa EJEMPLOS concretos.» está repetido; se incluirá una sola vez.");
    assert.equal(compiledPrompt(result).match(/ejemplos concretos/gi)?.length, 1);
  });

  it("warns when a constraint contradicts a requirement", () => {
    const spec = { ...spanishSpec(), requirements: ["Usa tablas para comparar"], constraints: ["No uses tablas"] };
    const result = compilePrompt(spec, "claude");
    assert.equal(result.ok, true, "conflicts are warnings, not blockers");
    const issue = result.validation.issues.find((i) => i.code === "instructions.conflict");
    assert.ok(issue);
    assert.equal(issue.severity, "warning");
    assert.equal(issue.message, "El requisito «Usa tablas para comparar» contradice la restricción «No uses tablas». Decide cuál debe prevalecer.");
  });

  it("detects contradictory length limits", () => {
    const spec = { ...spanishSpec(), requirements: ["Escribe al menos 800 palabras"], constraints: ["Máximo 300 palabras"] };
    assert.ok(codes(validateSpec(spec, "claude").issues).includes("instructions.conflict"));
  });

  it("does not flag unrelated negative constraints", () => {
    const issues = validateSpec(spanishSpec(), "claude").issues;
    assert.ok(!codes(issues).includes("instructions.conflict"));
  });
});

describe("examples", () => {
  const spec: PromptSpec = {
    ...spanishSpec(),
    outputFormat: { kind: "json", schema: '{ "sentimiento": "positivo | negativo | neutral" }' },
    examples: [
      { input: "Me encantó el servicio.", output: '{ "sentimiento": "positivo" }' },
      { input: "El pedido llegó tarde y roto.", output: '{ "sentimiento": "negativo" }' },
      { input: "El paquete llegó el martes.", output: '{ "sentimiento": "neutral" }' },
    ],
  };
  const results = compileAll(spec);

  it("Gemini uses an identical structure for every example", () => {
    const body = sectionBody(results.gemini, "examples", "es") ?? "";
    const blocks = body.split("\n\n---\n\n");
    assert.equal(blocks.length, 3);
    for (const block of blocks) assert.match(block, /^INPUT:\n[^\n]+\n\nOUTPUT:\n[^\n]+$/);
  });

  it("Claude uses <example><input><ideal_output>", () => {
    const prompt = compiledPrompt(results.claude);
    assert.equal(prompt.match(/<example>\n<input>\n[\s\S]*?\n<\/input>\n<ideal_output>\n[\s\S]*?\n<\/ideal_output>\n<\/example>/g)?.length, 3);
  });

  it("ChatGPT fences each example and explains why the section exists", () => {
    const body = sectionBody(results.chatgpt, "examples", "es") ?? "";
    assert.equal(body.match(/^## Ejemplo \d$/gm)?.length, 3);
    const reasons = results.chatgpt.compiled?.transformations.map((t) => t.reason) ?? [];
    assert.ok(reasons.includes("La sección Ejemplos aparece porque proporcionaste 3 ejemplos."));
  });

  it("incomplete examples are dropped with a warning", () => {
    const partial = { ...spec, examples: [...spec.examples!, { input: "Sin salida", output: "" }] };
    const result = compilePrompt(partial, "gemini");
    const issue = result.validation.issues.find((i) => i.code === "examples.incomplete");
    assert.equal(issue?.field, "examples.3.output");
    assert.ok(!compiledPrompt(result).includes("Sin salida"));
  });
});

describe("tools and output format", () => {
  it("tools appear in every target and never-simulate guidance is added in standard mode", () => {
    const spec: PromptSpec = { ...spanishSpec(), tools: [{ id: "web", kind: "web", name: "Web", purpose: "consultar precios actuales" }] };
    for (const [target, result] of Object.entries(compileAll(spec))) {
      const tools = sectionBody(result, "tools", "es") ?? "";
      assert.ok(tools.includes("consultar precios actuales"), target);
      assert.ok(tools.includes("nunca inventes sus resultados"), target);
    }
  });

  it("suggests tools when the objective mentions external actions", () => {
    const spec = { ...spanishSpec(), objective: "Busca en internet las noticias recientes de la empresa y resúmelas." };
    const issue = validateSpec(spec, "claude").issues.find((i) => i.code === "tools.suggested");
    assert.equal(issue?.severity, "warning");
  });

  it("exact structure moves the output format next to the task and emphasizes it", () => {
    const spec: PromptSpec = { ...spanishSpec(), outputFormat: { kind: "markdown", description: "1. Resumen\n2. Riesgos\n3. Escenarios", exactStructure: true } };
    const results = compileAll(spec);
    const claudeSections = results.claude.compiled?.sections ?? [];
    assert.deepEqual(claudeSections.slice(-2), ["output-format", "task"]);
    assert.equal(results.chatgpt.compiled?.sections.at(-1), "output-format");
    assert.equal(results.gemini.compiled?.sections.at(-1), "expected-output");
    for (const result of Object.values(results)) assert.match(compiledPrompt(result), /Respeta exactamente esta estructura/);
  });

  it("more than five requirements become a numbered list", () => {
    const spec = { ...spanishSpec(), requirements: ["Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis"] };
    assert.match(sectionBody(compilePrompt(spec, "chatgpt"), "requirements", "es") ?? "", /^1\. Uno\n2\. Dos/);
  });

  it("priorities produce explicit decision rules only when given", () => {
    const spec: PromptSpec = {
      ...spanishSpec(),
      priorities: ["exactitud", "completitud", "velocidad"],
      decisionRules: [{ when: "un dato no está disponible", then: "entonces indícalo como N/D" }],
    };
    const body = sectionBody(compilePrompt(spec, "chatgpt"), "decision-rules", "es") ?? "";
    assert.ok(body.includes("Si un dato no está disponible, indícalo como N/D."));
    assert.ok(body.includes("Prioriza en este orden: exactitud > completitud > velocidad."));
  });
});

describe("pipeline internals", () => {
  it("normalization is idempotent", () => {
    const spec = { ...spanishSpec(), requirements: ["  Analiza   la valuación ", "analiza la valuación", ""] };
    const once = normalizeSpec(spec);
    assert.deepEqual(normalizeSpec(once), once);
    assert.deepEqual(once.requirements, ["Analiza la valuación"]);
  });

  it("the rule engine returns effects as data", () => {
    const evaluation = evaluateRules({ ...spanishSpec(), examples: [{ input: "a", output: "b" }] });
    assert.ok(evaluation.flags.has("include-examples"));
    assert.ok(evaluation.fired.includes("examples-section"));
    assert.equal(evaluation.blocked, false);
    assert.equal(evaluateRules(createEmptySpec()).blocked, true);
  });

  it("the formatter normalizes line endings and blank lines but keeps fenced content", () => {
    assert.equal(formatPrompt("a  \r\n\r\n\r\n\r\nb\n"), "a\n\nb");
    assert.equal(formatPrompt("```\nx\n\n\n\ny\n```"), "```\nx\n\n\n\ny\n```");
  });

  it("English specs use English boilerplate", () => {
    const spec = { ...spanishSpec(), metadata: { ...spanishSpec().metadata, language: "en" as const } };
    const prompt = compiledPrompt(compilePrompt(spec, "chatgpt"));
    assert.match(prompt, /^# Requirements$/m);
    assert.ok(!prompt.includes("# Requisitos"));
  });
});
