import type { TermInput } from "@/types/glossary";
import { fundamentalsTerms } from "./fundamentals";
import { neuralNetworkTerms } from "./neural-networks";
import { generativeTerms } from "./generative";
import { promptingTerms } from "./prompting";
import { transformerTerms } from "./transformers";
import { ragTerms } from "./rag";
import { agentTerms } from "./agents";
import { fineTuningTerms } from "./fine-tuning";
import { optimizationTerms } from "./optimization";
import { infrastructureTerms } from "./infrastructure";
import { visionTerms, nlpTerms, rlTerms } from "./vision-nlp-rl";
import { safetyTerms } from "./safety";
import { evaluationTerms } from "./evaluation";
import { mathTerms } from "./math";
import { frontierTerms } from "./frontier";

/** Every glossary entry. To add a term, append it to the file of its theme. */
export const rawTerms: TermInput[] = [
  ...fundamentalsTerms,
  ...neuralNetworkTerms,
  ...generativeTerms,
  ...promptingTerms,
  ...transformerTerms,
  ...ragTerms,
  ...agentTerms,
  ...fineTuningTerms,
  ...optimizationTerms,
  ...infrastructureTerms,
  ...visionTerms,
  ...nlpTerms,
  ...rlTerms,
  ...safetyTerms,
  ...evaluationTerms,
  ...mathTerms,
  ...frontierTerms,
];
