import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyPreset, compileAll, createEmptySpec, presets } from "../index.ts";
import type { PromptSpec } from "../index.ts";
import { spanishSpec } from "./fixtures.ts";

describe("presets", () => {
  it("ships the 10 presets as partial specs", () => {
    assert.deepEqual(
      presets.map((p) => p.id),
      ["research", "coding", "academic", "business", "data-analysis", "marketing", "content-creation", "education", "agent", "automation"],
    );
    for (const preset of presets) {
      assert.ok(preset.label && preset.description, preset.id);
      assert.ok(!("version" in preset.spec), `${preset.id}: presets are partial specs`);
    }
    assert.equal(presets.find((p) => p.id === "agent")?.spec.metadata?.mode, "agent");
  });

  it("merges without overwriting user-entered values", () => {
    const user: PromptSpec = { ...spanishSpec(), role: "Mi rol personalizado", requirements: ["Cita la fuente de cada dato relevante", "Mi requisito"] };
    const merged = applyPreset(user, "research");
    assert.equal(merged.role, "Mi rol personalizado");
    assert.equal(merged.objective, user.objective);
    assert.deepEqual(merged.outputFormat, user.outputFormat, "the user's output format is kept whole");
    // Union, user items first, no case-insensitive duplicates.
    assert.deepEqual(merged.requirements?.slice(0, 2), ["Cita la fuente de cada dato relevante", "Mi requisito"]);
    assert.equal(merged.requirements?.filter((r) => r.toLowerCase().includes("cita la fuente")).length, 1);
    assert.ok(merged.requirements?.includes("Resume los hallazgos principales"));
    assert.ok(merged.constraints?.includes("No inventes datos financieros"));
    assert.ok(merged.constraints?.includes("No inventes datos ni fuentes"));
    assert.equal(merged.metadata.presetId, "research");
  });

  it("fills empty fields from the preset", () => {
    const merged = applyPreset({ ...createEmptySpec(), objective: "Explica la fotosíntesis a estudiantes de secundaria." }, "education");
    assert.equal(merged.role, "Profesor experto que explica con claridad y comprueba la comprensión");
    assert.equal(merged.outputFormat?.kind, "markdown");
  });

  it("the agent preset switches to agent mode but keeps the user's agent settings", () => {
    const user: PromptSpec = { ...createEmptySpec(), objective: "Investiga proveedores de empaque sustentable." };
    user.agent = { budget: { maxIterations: 7 }, stopConditions: ["Detente cuando tengas 5 proveedores verificados"] };
    const merged = applyPreset(user, "agent");
    assert.equal(merged.metadata.mode, "agent");
    assert.deepEqual(merged.agent?.budget, { maxIterations: 7 });
    assert.deepEqual(merged.agent?.stopConditions, ["Detente cuando tengas 5 proveedores verificados", "Detente cuando todos los criterios de éxito estén verificados"]);
    assert.ok(merged.agent?.loop, "missing groups come from the preset");
    for (const result of Object.values(compileAll(merged))) assert.equal(result.ok, true);
  });

  it("does not mutate the input and ignores unknown presets", () => {
    const user = spanishSpec();
    const snapshot = JSON.parse(JSON.stringify(user));
    applyPreset(user, "coding");
    assert.deepEqual(user, snapshot);
    assert.deepEqual(applyPreset(user, "no-existe"), user);
  });
});
