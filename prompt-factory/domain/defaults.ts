import { DEFAULT_TARGET_ID, modelProfiles } from "../config/models.ts";
import { SPEC_VERSION } from "./types.ts";
import type { AgentConfig, HumanApprovalCategory, PromptLanguage, PromptMode, PromptSpec } from "./types.ts";

export const HUMAN_APPROVAL_CATEGORIES: readonly HumanApprovalCategory[] = [
  "send-messages",
  "spend-money",
  "delete-data",
  "publish-content",
  "modify-external-systems",
];

/** Default number of distinct failed strategies before escalating. */
export const DEFAULT_ESCALATE_AFTER_STRATEGIES = 3;

/**
 * Sensible agent defaults: full loop, full state tracking, error recovery with
 * 2 equivalent retries, replan after 2 failures, escalate after 3 strategies,
 * 20 iterations / 50 tool calls, and human approval for every risky category.
 */
export function defaultAgentConfig(): AgentConfig {
  return {
    successCriteria: [],
    state: {
      trackKnown: true,
      trackUnknown: true,
      trackCompleted: true,
      trackPending: true,
      trackBlockers: true,
      trackArtifacts: true,
    },
    loop: {
      observe: true,
      assess: true,
      plan: true,
      act: true,
      verify: true,
      updateState: true,
    },
    errorRecovery: {
      enabled: true,
      maxEquivalentRetries: 2,
      replanAfterFailures: 2,
      escalateAfterStrategies: DEFAULT_ESCALATE_AFTER_STRATEGIES,
    },
    budget: {
      maxIterations: 20,
      maxToolCalls: 50,
    },
    memory: {
      workingMemory: true,
      episodicMemory: true,
      semanticMemory: false,
      artifactMemory: true,
    },
    humanApproval: [...HUMAN_APPROVAL_CATEGORIES],
    humanApprovalRules: [],
    escalationRules: [],
    stopConditions: [],
    finalVerification: [],
  };
}

/** A blank, valid-shaped spec: every list present and empty, objective empty. */
export function createEmptySpec(options?: { mode?: PromptMode; targetModel?: string; language?: PromptLanguage }): PromptSpec {
  const mode: PromptMode = options?.mode === "agent" ? "agent" : "standard";
  const spec: PromptSpec = {
    version: SPEC_VERSION,
    metadata: {
      targetModel: options?.targetModel || modelProfiles[0]?.id || DEFAULT_TARGET_ID,
      mode,
      language: options?.language === "en" ? "en" : "es",
    },
    objective: "",
    context: [],
    inputs: [],
    requirements: [],
    constraints: [],
    priorities: [],
    workflow: [],
    decisionRules: [],
    examples: [],
    tools: [],
    qualityCriteria: [],
    definitionOfDone: [],
  };
  if (mode === "agent") spec.agent = defaultAgentConfig();
  return spec;
}
