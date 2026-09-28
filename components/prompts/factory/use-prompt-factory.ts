"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  compileAll,
  compilePrompt,
  createEmptySpec,
  evaluateQuality,
  getQuestions,
  modelProfiles,
  validateSpec,
  type AgentConfig,
  type CompileResult,
  type PromptMode,
  type PromptSpec,
  type QualityReport,
  type SmartQuestion,
  type ValidationResult,
} from "@/prompt-factory";
import { readDraft, writeDraft } from "./browser";
import { attempt, type Outcome } from "./outcome";
import { withAgent, withMode } from "./spec-edits";
import { getVisibleSteps, type StepId } from "./steps";

/**
 * State of the Prompt Factory. The PromptSpec is the single source of truth:
 * every control edits it through these actions, and everything shown on the
 * right (prompt, quality, questions, explanation) is derived from it by the engine.
 */

export type SideTab = "quality" | "validation" | "questions" | "explain";
export type MobileView = "editor" | "prompt";
export type SpecPatch = Partial<Omit<PromptSpec, "version" | "metadata">>;

export interface FocusRequest {
  step: StepId;
  field?: string;
  nonce: number;
}

export interface FactoryUi {
  activeStep: StepId | null;
  compare: boolean;
  mobileView: MobileView;
  sideTab: SideTab;
  /** Library entry the editor was opened from / last saved to. */
  libraryId?: string;
  /** False until the saved draft has been restored on the client. */
  hydrated: boolean;
  focus: FocusRequest | null;
  focusNonce: number;
}

export interface FactoryState {
  spec: PromptSpec;
  ui: FactoryUi;
}

type Action =
  | { type: "patch"; patch: SpecPatch }
  | { type: "meta"; patch: Partial<PromptSpec["metadata"]> }
  | { type: "agent"; patch: Partial<AgentConfig> }
  | { type: "edit"; fn: (spec: PromptSpec) => PromptSpec }
  | { type: "mode"; mode: PromptMode }
  | { type: "load"; spec: PromptSpec; libraryId?: string }
  | { type: "reset" }
  | { type: "hydrate"; spec?: PromptSpec }
  | { type: "toggleStep"; step: StepId }
  | { type: "focus"; step: StepId; field?: string }
  | { type: "move"; delta: 1 | -1 }
  | { type: "ui"; patch: Partial<Pick<FactoryUi, "compare" | "mobileView" | "sideTab" | "libraryId">> };

function initialState(): FactoryState {
  return {
    spec: createEmptySpec({ mode: "standard", targetModel: modelProfiles[0]?.id }),
    ui: {
      activeStep: "intent",
      compare: false,
      mobileView: "editor",
      sideTab: "quality",
      hydrated: false,
      focus: null,
      focusNonce: 0,
    },
  };
}

function requestFocus(state: FactoryState, step: StepId, field?: string): FactoryState {
  const nonce = state.ui.focusNonce + 1;
  return { ...state, ui: { ...state.ui, activeStep: step, mobileView: "editor", focus: { step, field, nonce }, focusNonce: nonce } };
}

function reducer(state: FactoryState, action: Action): FactoryState {
  switch (action.type) {
    case "patch":
      return { ...state, spec: { ...state.spec, ...action.patch } };
    case "meta":
      return { ...state, spec: { ...state.spec, metadata: { ...state.spec.metadata, ...action.patch } } };
    case "agent":
      return { ...state, spec: withAgent(state.spec, action.patch) };
    case "edit":
      return { ...state, spec: action.fn(state.spec) };
    case "mode":
      return { ...state, spec: withMode(state.spec, action.mode) };
    case "load":
      return { ...state, spec: action.spec, ui: { ...state.ui, libraryId: action.libraryId } };
    case "reset": {
      const { targetModel, language } = state.spec.metadata;
      return {
        spec: createEmptySpec({ mode: "standard", targetModel, language }),
        ui: { ...state.ui, activeStep: "intent", compare: false, libraryId: undefined, focus: null },
      };
    }
    case "hydrate":
      return { ...state, spec: action.spec ?? state.spec, ui: { ...state.ui, hydrated: true } };
    case "toggleStep":
      return { ...state, ui: { ...state.ui, activeStep: state.ui.activeStep === action.step ? null : action.step, focus: null } };
    case "focus":
      return requestFocus(state, action.step, action.field);
    case "move": {
      const steps = getVisibleSteps(state.spec);
      const index = steps.findIndex((s) => s.id === state.ui.activeStep);
      const target = index === -1 ? steps[0] : steps[Math.min(steps.length - 1, Math.max(0, index + action.delta))];
      if (!target || target.id === state.ui.activeStep) return state;
      return requestFocus(state, target.id);
    }
    case "ui":
      return { ...state, ui: { ...state.ui, ...action.patch } };
  }
}

export interface FactoryActions {
  patch: (patch: SpecPatch) => void;
  patchMeta: (patch: Partial<PromptSpec["metadata"]>) => void;
  patchAgent: (patch: Partial<AgentConfig>) => void;
  /** Functional update for edits that depend on the latest spec. */
  edit: (fn: (spec: PromptSpec) => PromptSpec) => void;
  setMode: (mode: PromptMode) => void;
  setTarget: (id: string) => void;
  load: (spec: PromptSpec, libraryId?: string) => void;
  reset: () => void;
  toggleStep: (step: StepId) => void;
  focusStep: (step: StepId, field?: string) => void;
  move: (delta: 1 | -1) => void;
  setCompare: (compare: boolean) => void;
  setMobileView: (view: MobileView) => void;
  setSideTab: (tab: SideTab) => void;
  setLibraryId: (id: string | undefined) => void;
}

const DRAFT_SAVE_DELAY = 350;

export function usePromptFactory(): { state: FactoryState; actions: FactoryActions } {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const actions = useMemo<FactoryActions>(
    () => ({
      patch: (patch) => dispatch({ type: "patch", patch }),
      patchMeta: (patch) => dispatch({ type: "meta", patch }),
      patchAgent: (patch) => dispatch({ type: "agent", patch }),
      edit: (fn) => dispatch({ type: "edit", fn }),
      setMode: (mode) => dispatch({ type: "mode", mode }),
      setTarget: (id) => dispatch({ type: "meta", patch: { targetModel: id } }),
      load: (spec, libraryId) => dispatch({ type: "load", spec, libraryId }),
      reset: () => dispatch({ type: "reset" }),
      toggleStep: (step) => dispatch({ type: "toggleStep", step }),
      focusStep: (step, field) => dispatch({ type: "focus", step, field }),
      move: (delta) => dispatch({ type: "move", delta }),
      setCompare: (compare) => dispatch({ type: "ui", patch: { compare } }),
      setMobileView: (mobileView) => dispatch({ type: "ui", patch: { mobileView } }),
      setSideTab: (sideTab) => dispatch({ type: "ui", patch: { sideTab } }),
      setLibraryId: (libraryId) => dispatch({ type: "ui", patch: { libraryId } }),
    }),
    [],
  );

  // Restore the draft after mount: the server render (and first client render) use the empty spec.
  useEffect(() => {
    dispatch({ type: "hydrate", spec: readDraft() });
  }, []);

  // Persist the draft (debounced) once the restore has happened, so it is never overwritten by the empty spec.
  const { spec } = state;
  const { hydrated } = state.ui;
  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => writeDraft(spec), DRAFT_SAVE_DELAY);
    return () => window.clearTimeout(timer);
  }, [spec, hydrated]);

  return { state, actions };
}

export interface FactoryDerived {
  targetId: string;
  result: Outcome<CompileResult>;
  all: Outcome<Record<string, CompileResult>> | null;
  validation: Outcome<ValidationResult>;
  quality: Outcome<QualityReport>;
  questions: Outcome<SmartQuestion[]>;
}

/** Everything on the right-hand side, recomputed from the spec on every change. */
export function useFactoryDerived(spec: PromptSpec, compare: boolean): FactoryDerived {
  const targetId = spec.metadata.targetModel || modelProfiles[0]?.id || "";
  const result = useMemo(() => attempt(() => compilePrompt(spec, targetId)), [spec, targetId]);
  const all = useMemo(() => (compare ? attempt(() => compileAll(spec)) : null), [spec, compare]);
  const validation = useMemo(() => attempt(() => validateSpec(spec, targetId)), [spec, targetId]);
  const quality = useMemo(() => attempt(() => evaluateQuality(spec)), [spec]);
  const questions = useMemo(() => attempt(() => getQuestions(spec)), [spec]);
  return { targetId, result, all, validation, quality, questions };
}

/** Transient, polite status line (copy/save/import feedback). */
export function useAnnouncer() {
  const [message, setMessage] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const announce = useCallback((text: string) => {
    window.clearTimeout(timer.current);
    setMessage(text);
    timer.current = window.setTimeout(() => setMessage(""), 3500);
  }, []);
  return { message, announce };
}
