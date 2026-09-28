import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as api from "../index.ts";
import type { PromptSpec, ValidationIssue } from "../index.ts";
import { spanishSpec } from "./fixtures.ts";

describe("public API contract", () => {
  it("exports every fixed function and populated arrays", () => {
    const functions = [
      "getModelProfile",
      "createEmptySpec",
      "defaultAgentConfig",
      "validateSpec",
      "compilePrompt",
      "compileAll",
      "evaluateQuality",
      "getQuestions",
      "parseFreeform",
      "applyPreset",
      "exportPrompt",
      "importSpec",
      "createLocalLibrary",
    ] as const;
    for (const name of functions) assert.equal(typeof api[name], "function", name);
    assert.deepEqual(
      api.modelProfiles.map((p) => [p.id, p.displayName, p.adapterId]),
      [
        ["claude", "Claude Opus 5.5", "claude-xml"],
        ["chatgpt", "GPT-6 Astra", "chatgpt-markdown"],
        ["gemini", "Gemini 3.8 Flash", "gemini-sections"],
      ],
    );
    assert.equal(api.getModelProfile("gemini")?.catalogId, "google/gemini-3.8-flash");
    assert.equal(api.presets.length, 10);
  });

  it("createEmptySpec never throws and is valid-shaped", () => {
    const spec = api.createEmptySpec();
    assert.equal(spec.version, 1);
    assert.deepEqual(spec.metadata, { targetModel: "claude", mode: "standard", language: "es" });
    assert.equal(spec.objective, "");
    assert.equal(spec.agent, undefined);
    assert.ok(api.createEmptySpec({ mode: "agent", targetModel: "gemini", language: "en" }).agent?.loop?.observe);
  });

  it("defaultAgentConfig has the documented defaults", () => {
    const agent = api.defaultAgentConfig();
    assert.equal(agent.errorRecovery?.maxEquivalentRetries, 2);
    assert.equal(agent.errorRecovery?.replanAfterFailures, 2);
    assert.equal(agent.errorRecovery?.escalateAfterStrategies, 3);
    assert.equal(agent.budget?.maxIterations, 20);
    assert.ok(Object.values(agent.loop ?? {}).every(Boolean));
  });

  it("validateSpec returns issues with dotted fields and human messages (no raw paths)", () => {
    const bad: PromptSpec = {
      ...spanishSpec(),
      objective: "",
      requirements: ["Usa tablas", "usa tablas"],
      constraints: ["No uses tablas"],
      examples: [{ input: "hola", output: "" }],
      decisionRules: [{ when: "falta un dato", then: "" }],
      metadata: { ...spanishSpec().metadata, mode: "agent" },
      agent: { budget: { maxIterations: -3 }, stopConditions: [] },
    };
    const issues: ValidationIssue[] = api.validateSpec(bad, "claude").issues;
    assert.ok(issues.length >= 6);
    for (const issue of issues) {
      assert.ok(!/\w\.\d|\[\d+\]|undefined/.test(issue.message), `raw path in: ${issue.message}`);
      if (issue.field) assert.match(issue.field, /^[a-zA-Z]+(\.[a-zA-Z0-9]+)*$/);
    }
    const fields = issues.map((i) => i.field);
    for (const expected of ["objective", "requirements.1", "examples.0.output", "decisionRules.0.then", "agent.budget.maxIterations"]) {
      assert.ok(fields.includes(expected), expected);
    }
  });

  it("is deterministic: same spec, same output", () => {
    const a = api.compileAll(spanishSpec());
    const b = api.compileAll(spanishSpec());
    assert.deepEqual(a, b);
  });

  it("explain() and compile() agree for every adapter", async () => {
    const { getAdapter } = await import("../adapters/registry.ts");
    for (const profile of api.modelProfiles) {
      const adapter = getAdapter(profile.adapterId);
      assert.ok(adapter);
      const compiled = adapter.compile(spanishSpec(), profile);
      assert.deepEqual(adapter.explain(spanishSpec(), profile), compiled.transformations);
    }
  });
});
