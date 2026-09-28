import type { NormalizedAgent, NormalizedSpec } from "../compiler/Normalizer.ts";
import type { PromptStrings } from "../i18n/strings.ts";
import { list, text } from "../render/blocks.ts";
import type { Block, ListItem, Section } from "../render/blocks.ts";
import { makeSection } from "../render/section.ts";

/**
 * Structured termination: stop conditions, budget, human approval and the
 * Definition of Done. The agent is never told to "continue until finished":
 * every exit is explicit (COMPLETE / STOP / ESCALATE / REQUEST HUMAN APPROVAL).
 */

export function buildStopConditionsSection(spec: NormalizedSpec, s: PromptStrings): Section | undefined {
  const agent = spec.agent;
  if (!agent) return undefined;
  const a = s.agent;
  const items: ListItem[] = [{ label: "COMPLETE", text: a.stopComplete(agent.successCriteria.length > 0) }];
  if (agent.budget.maxIterations !== undefined) items.push({ label: "STOP", text: a.stopMaxIterations(agent.budget.maxIterations) });
  if (agent.budget.maxToolCalls !== undefined && spec.tools.length) {
    items.push({ label: "STOP", text: a.stopMaxToolCalls(agent.budget.maxToolCalls) });
  }
  items.push({ label: "ESCALATE", text: a.stopMissingAuthorization });
  items.push({ label: "STOP", text: a.stopImpossible });
  items.push({ label: "REQUEST HUMAN APPROVAL", text: a.stopApproval(agent.humanApproval.map((c) => s.approvalsShort[c])) });

  const blocks: Block[] = [list(items)];
  if (agent.stopConditions.length) blocks.push(text(a.stopUserIntro), list(agent.stopConditions));
  blocks.push(text(a.stopClosing));
  return makeSection("stop-conditions", s, blocks);
}

export function buildBudgetSection(agent: NormalizedAgent, s: PromptStrings): Section | undefined {
  const a = s.agent;
  const items: ListItem[] = [];
  if (agent.budget.maxIterations !== undefined) items.push({ label: a.budgetIterations, text: a.budgetMax(agent.budget.maxIterations) });
  if (agent.budget.maxToolCalls !== undefined) items.push({ label: a.budgetToolCalls, text: a.budgetMax(agent.budget.maxToolCalls) });
  if (agent.budget.maxRetries !== undefined) items.push({ label: a.budgetRetries, text: a.budgetMax(agent.budget.maxRetries) });
  if (!items.length) return undefined;
  return makeSection("budget", s, [list(items), text(a.budgetClosing)]);
}

export function buildHumanApprovalSection(agent: NormalizedAgent, s: PromptStrings): Section | undefined {
  const a = s.agent;
  const approvals = [...agent.humanApproval.map((c) => s.approvals[c]), ...agent.humanApprovalRules];
  const blocks: Block[] = [];
  if (approvals.length) blocks.push(text(a.approvalIntro), list(approvals));
  if (agent.escalationRules.length) blocks.push(text(a.escalationIntro), list(agent.escalationRules));
  if (!blocks.length) return undefined;
  if (approvals.length) blocks.push(text(a.approvalHow));
  return makeSection("human-approval", s, blocks);
}

/**
 * Definition of Done. Agent mode: completion requirements derived from the
 * spec + the user's items + the anti-premature-completion list. Standard mode:
 * only the user's own items (nothing invented).
 */
export function buildDefinitionOfDoneSection(spec: NormalizedSpec, s: PromptStrings): Section | undefined {
  const agent = spec.agent;
  if (!agent) {
    if (!spec.definitionOfDone.length) return undefined;
    return makeSection("definition-of-done", s, [text(s.core.standardDodIntro), list(spec.definitionOfDone)]);
  }
  const a = s.agent;
  const items: string[] = [];
  if (spec.requirements.length) items.push(a.dodRequirements);
  if (agent.successCriteria.length) items.push(a.dodCriteria);
  if (spec.outputFormat) items.push(a.dodOutput);
  items.push(...spec.definitionOfDone);
  if (!items.length) items.push(a.dodFallback);
  if (agent.state.trackPending || agent.state.trackBlockers) items.push(a.dodNoPending);
  if (agent.finalVerification.length) items.push(a.dodFinalVerification);

  return makeSection("definition-of-done", s, [text(a.dodIntro), list(items), text(a.dodAntiIntro), list(a.dodAnti)]);
}
