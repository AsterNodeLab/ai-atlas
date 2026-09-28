import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compileAll, compilePrompt, modelProfiles } from "../index.ts";
import { compiledPrompt, investmentSpec, researchAgentSpec, sectionBody } from "./fixtures.ts";

describe("Acceptance 1 — standard spec compiled for Claude, ChatGPT and Gemini", () => {
  const spec = investmentSpec();
  const results = compileAll(spec);

  it("compiles for every configured profile", () => {
    assert.deepEqual(Object.keys(results).sort(), modelProfiles.map((p) => p.id).sort());
    for (const result of Object.values(results)) assert.equal(result.ok, true, JSON.stringify(result.validation.issues));
  });

  it("produces three different prompts", () => {
    const prompts = Object.values(results).map(compiledPrompt);
    assert.equal(new Set(prompts).size, 3);
  });

  it("keeps every requirement and constraint in every prompt (semantic equivalence)", () => {
    const texts = [...spec.requirements!, ...spec.constraints!, spec.objective, spec.context![0].text, spec.outputFormat!.description!];
    for (const [target, result] of Object.entries(results)) {
      const prompt = compiledPrompt(result);
      for (const text of texts) assert.ok(prompt.includes(text), `${target} is missing «${text}»`);
    }
  });

  it("uses each target's native structure", () => {
    assert.equal(results.claude.compiled?.syntax, "xml");
    assert.equal(results.chatgpt.compiled?.syntax, "markdown");
    assert.equal(results.gemini.compiled?.syntax, "markdown");

    const claude = compiledPrompt(results.claude);
    assert.match(claude, /^<objective>/);
    assert.ok(claude.trimEnd().endsWith("</task>"), "Claude: <task> must be last");
    assert.ok(claude.indexOf("<context>") < claude.indexOf("<task>"), "Claude: context before task");
    assert.match(claude, /<instructions>\n<requirements>/);

    const chatgpt = compiledPrompt(results.chatgpt);
    assert.match(chatgpt, /^# Objective$/m);
    assert.match(chatgpt, /^# Requirements$/m);
    assert.match(chatgpt, /^# Constraints$/m);
    assert.match(chatgpt, /^# Output Format$/m);

    const gemini = compiledPrompt(results.gemini);
    assert.match(gemini, /^## System Instruction$/m);
    assert.match(gemini, /^## Rules$/m);
    const task = gemini.indexOf("## Task");
    const expected = gemini.indexOf("## Expected Output");
    assert.ok(task > gemini.indexOf("## Rules") && expected > task, "Gemini: Task then Expected Output at the end");
    assert.match(gemini, /Based exclusively on the information above, analyze a company before investing\./);
  });

  it("reports the emitted sections in order", () => {
    const sections = results.claude.compiled?.sections ?? [];
    assert.equal(sections[sections.length - 1], "task");
    assert.ok(sections.indexOf("context") < sections.indexOf("instructions"));
    assert.equal(results.gemini.compiled?.sections.at(-1), "expected-output");
  });
});

describe("Acceptance 2 — agent spec compiled for Claude, ChatGPT and Gemini", () => {
  const spec = researchAgentSpec();
  const required = [
    "mission",
    "state",
    "tools",
    "tool-policy",
    "loop-protocol",
    "verification",
    "error-recovery",
    "budget",
    "stop-conditions",
    "definition-of-done",
  ] as const;

  for (const target of ["claude", "chatgpt", "gemini"]) {
    describe(target, () => {
      const result = compilePrompt(spec, target);

      it("compiles without errors", () => {
        assert.equal(result.ok, true, JSON.stringify(result.validation.issues));
      });

      it("contains every agent section", () => {
        for (const id of required) {
          assert.ok(result.compiled?.sections.includes(id), `${target}: missing section ${id}`);
          assert.ok(sectionBody(result, id)?.trim(), `${target}: empty section ${id}`);
        }
      });

      it("lists the three tools", () => {
        const tools = sectionBody(result, "tools") ?? "";
        for (const name of ["Web search", "Browser", "Code execution"]) assert.ok(tools.includes(name), name);
        assert.ok(tools.includes("compute financial ratios"));
      });

      it("builds the loop only from enabled phases (assess is off)", () => {
        const loop = sectionBody(result, "loop-protocol") ?? "";
        for (const phase of ["Observe", "Plan", "Act", "Observe the result", "Verify", "Update state", "Decide"]) {
          assert.ok(loop.includes(phase), `${target}: loop missing ${phase}`);
        }
        assert.ok(!loop.includes("Assess"), `${target}: assess is disabled`);
        assert.match(loop, /SUCCESS, PARTIAL_SUCCESS, FAILURE or INCONCLUSIVE/);
        assert.match(loop, /CONTINUE[\s\S]*REPLAN[\s\S]*RETRY[\s\S]*ESCALATE[\s\S]*COMPLETE/);
      });

      it("takes retry and budget numbers from AgentConfig", () => {
        assert.match(sectionBody(result, "error-recovery") ?? "", /at most 2 times/);
        assert.match(sectionBody(result, "error-recovery") ?? "", /After 2 equivalent failures, change strategy \(REPLAN\)/);
        assert.match(sectionBody(result, "error-recovery") ?? "", /If 3 materially different strategies fail/);
        assert.match(sectionBody(result, "budget") ?? "", /15/);
      });

      it("includes structured and user stop conditions", () => {
        const stop = sectionBody(result, "stop-conditions") ?? "";
        assert.ok(stop.includes("Stop when all research requirements are verified."));
        assert.match(stop, /COMPLETE/);
        assert.match(stop, /when you reach 15 iterations/);
        assert.match(stop, /REQUEST HUMAN APPROVAL/);
        assert.ok(!/continue until (it is )?(done|finished)/i.test(stop));
      });

      it("includes the Definition of Done with the anti-premature-completion list", () => {
        const dod = sectionBody(result, "definition-of-done") ?? "";
        for (const item of ["an action was attempted", "a tool responded", "most subtasks are complete", "the answer looks plausible"]) {
          assert.ok(dod.includes(item), item);
        }
      });

      it("explains that the agent protocol comes from agent mode", () => {
        const reasons = result.compiled?.transformations.map((t) => t.reason) ?? [];
        assert.ok(reasons.includes("La Definition of Done aparece porque el modo agente está activo."));
      });
    });
  }
});
