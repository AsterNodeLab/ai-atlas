import type { NormalizedAgent } from "../compiler/Normalizer.ts";
import { DEFAULT_ESCALATE_AFTER_STRATEGIES } from "../domain/defaults.ts";
import type { PromptStrings } from "../i18n/strings.ts";
import { list, text } from "../render/blocks.ts";
import type { Section } from "../render/blocks.ts";
import { makeSection } from "../render/section.ts";

/**
 * Error recovery policy. Every number comes from AgentConfig.errorRecovery:
 * - maxEquivalentRetries → how many unchanged retries are allowed;
 * - replanAfterFailures  → N equivalent failures trigger REPLAN;
 * - escalateAfterStrategies (default 3) → M failed strategies trigger ESCALATE.
 * A number the user left empty is omitted rather than invented.
 */
export function buildErrorRecoverySection(agent: NormalizedAgent, s: PromptStrings): Section | undefined {
  const recovery = agent.errorRecovery;
  if (!recovery.enabled) return undefined;
  const a = s.agent;

  const rules: string[] = [
    recovery.maxEquivalentRetries === undefined ? a.recoveryRetryUnbounded : a.recoveryRetry(recovery.maxEquivalentRetries),
    a.recoveryNeverRepeat,
  ];
  if (recovery.replanAfterFailures !== undefined) rules.push(a.recoveryReplan(recovery.replanAfterFailures));
  rules.push(a.recoveryEscalate(recovery.escalateAfterStrategies ?? DEFAULT_ESCALATE_AFTER_STRATEGIES));

  return makeSection("error-recovery", s, [
    text(a.recoveryClassify),
    text(a.recoveryCategoriesIntro),
    list(a.recoveryCategories),
    text(a.recoveryRulesIntro),
    list(rules),
  ]);
}
