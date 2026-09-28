import type { NormalizedAgent, NormalizedSpec } from "../compiler/Normalizer.ts";
import { isLoopEnabled } from "../compiler/Normalizer.ts";
import type { MemoryKey, PromptStrings, StateKey } from "../i18n/strings.ts";
import { list, text } from "../render/blocks.ts";
import type { ListItem, Section } from "../render/blocks.ts";
import { makeSection } from "../render/section.ts";

/**
 * Agent loop protocol and the policies around it (state, tools, memory,
 * verification). Every step/field comes from AgentConfig toggles: disabled
 * steps and untracked fields are omitted, never rendered as "N/A".
 */

export const STATE_TOKENS: Record<StateKey, string> = {
  trackKnown: "KNOWN",
  trackUnknown: "UNKNOWN",
  trackCompleted: "COMPLETED",
  trackPending: "PENDING",
  trackBlockers: "BLOCKERS",
  trackArtifacts: "ARTIFACTS",
};

const STATE_ORDER: StateKey[] = ["trackKnown", "trackUnknown", "trackCompleted", "trackPending", "trackBlockers", "trackArtifacts"];
const MEMORY_ORDER: MemoryKey[] = ["workingMemory", "episodicMemory", "semanticMemory", "artifactMemory"];

export function trackedStateTokens(agent: NormalizedAgent): string[] {
  return STATE_ORDER.filter((key) => agent.state[key]).map((key) => STATE_TOKENS[key]);
}

export function buildStateSection(agent: NormalizedAgent, s: PromptStrings): Section | undefined {
  const items: ListItem[] = STATE_ORDER.filter((key) => agent.state[key]).map((key) => ({
    label: STATE_TOKENS[key],
    text: s.agent.stateFields[key],
  }));
  if (!items.length) return undefined;
  return makeSection("state", s, [text(s.agent.stateIntro), list(items)]);
}

/** Observe → Assess → Plan → Act → Observe Result → Verify → Update State → Decide. */
export function buildLoopProtocolSection(spec: NormalizedSpec, s: PromptStrings): Section | undefined {
  const agent = spec.agent;
  if (!agent || !isLoopEnabled(agent)) return undefined;
  const { loop } = agent;
  const t = s.agent.loopSteps;
  const steps: ListItem[] = [];

  if (loop.observe) steps.push({ label: t.observe.title, text: t.observe.text });
  if (loop.assess) steps.push({ label: t.assess.title, text: t.assess.text });
  if (loop.plan) steps.push({ label: t.plan.title, text: t.plan.text });
  if (loop.act) {
    steps.push({ label: t.act.title, text: spec.tools.length ? `${t.act.text} ${s.agent.actWithTools}` : t.act.text });
    // Acting always produces a result that must be classified: tool execution ≠ task success.
    steps.push({ label: t.observeResult.title, text: t.observeResult.text });
  }
  if (loop.verify) steps.push({ label: t.verify.title, text: t.verify.text });
  if (loop.updateState) {
    const tokens = trackedStateTokens(agent);
    steps.push({ label: t.updateState.title, text: tokens.length ? s.agent.updateStateTracked(tokens) : t.updateState.text });
  }

  const o = s.agent.decideOptions;
  const options = [o.continue, o.replan, ...(agent.errorRecovery.enabled ? [o.retry] : []), o.escalate, o.complete];
  steps.push({ label: t.decide.title, text: s.agent.decideIntro, children: options });

  return makeSection("loop-protocol", s, [
    text(s.agent.loopIntro),
    list(steps, true),
    text(s.agent.iterationNote(agent.budget.maxIterations)),
  ]);
}

/** When to use tools, never simulate results, verify effects. Agent mode only. */
export function buildToolPolicySection(spec: NormalizedSpec, s: PromptStrings): Section | undefined {
  if (!spec.agent) return undefined;
  if (!spec.tools.length) return makeSection("tool-policy", s, [text(s.agent.noToolsPolicy)]);
  return makeSection("tool-policy", s, [list(s.agent.toolPolicy)]);
}

export function buildMemoryPolicySection(agent: NormalizedAgent, s: PromptStrings): Section | undefined {
  const items: ListItem[] = MEMORY_ORDER.filter((key) => agent.memory[key]).map((key) => ({
    label: s.agent.memory[key].label,
    text: s.agent.memory[key].text,
  }));
  if (!items.length) return undefined;
  return makeSection("memory-policy", s, [text(s.agent.memoryIntro), list(items), text(s.agent.memoryClosing)]);
}

/** Verification levels 0–4 (proportional to consequence) + the user's final checks. */
export function buildVerificationSection(agent: NormalizedAgent, s: PromptStrings): Section | undefined {
  const blocks = [];
  if (agent.loop.verify) {
    blocks.push(text(s.agent.verificationIntro), list(s.agent.verificationLevels.map((l) => ({ label: l.label, text: l.text }))));
  }
  if (agent.finalVerification.length) {
    blocks.push(text(s.agent.finalVerificationIntro), list(agent.finalVerification));
  }
  if (!blocks.length) return undefined;
  return makeSection("verification", s, blocks);
}
