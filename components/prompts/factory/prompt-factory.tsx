"use client";

import { useState } from "react";
import { getModelProfile } from "@/prompt-factory";
import { ComparePanel } from "./compare-panel";
import { ExplainPanel } from "./explain-panel";
import { ImportReportBanner, type ImportReport } from "./import-button";
import { PreviewPanel } from "./preview-panel";
import { QualityPanel } from "./quality-panel";
import { QuestionsPanel } from "./questions-panel";
import { SidePanels, type SideTabDef } from "./side-panels";
import { applyQuickAnswer } from "./spec-edits";
import { getVisibleSteps, stepForField } from "./steps";
import { TopBar } from "./top-bar";
import { cx } from "./ui";
import { useAnnouncer, useFactoryDerived, usePromptFactory, type MobileView } from "./use-prompt-factory";
import { ValidationPanel } from "./validation-panel";
import { VIEW_TABS_ID, Wizard } from "./wizard";

/**
 * Prompt Factory tool. Data flow:
 *   controls → actions (useReducer) → PromptSpec → engine (compilePrompt / compileAll /
 *   validateSpec / evaluateQuality / getQuestions) → read-only panels.
 * No prompt text, scoring or rules are produced here.
 */
export function PromptFactory() {
  const { state, actions } = usePromptFactory();
  const { spec, ui } = state;
  const derived = useFactoryDerived(spec, ui.compare);
  const { message, announce } = useAnnouncer();
  const [importReport, setImportReport] = useState<ImportReport | null>(null);

  const profile = getModelProfile(derived.targetId);
  const visibleSteps = getVisibleSteps(spec);
  const canGoToField = (field: string) => {
    const step = stepForField(field);
    return Boolean(step && visibleSteps.some((s) => s.id === step));
  };
  const goToField = (field: string) => {
    const step = stepForField(field);
    if (step && canGoToField(field)) actions.focusStep(step, field);
  };
  const quickFill = (field: string, answer: string) => {
    const next = applyQuickAnswer(spec, field, answer);
    if (next) {
      actions.edit(() => next);
      announce(`Respuesta añadida: ${answer}`);
    } else {
      goToField(field);
    }
  };

  const onImport = (report: ImportReport) => {
    if (report.spec) {
      actions.load(report.spec);
      announce(`Especificación importada: ${report.filename}`);
    }
    setImportReport(report.spec && report.issues.length === 0 ? null : report);
  };

  const validationIssues = derived.validation.ok ? derived.validation.value.issues : [];
  const errorCount = validationIssues.filter((i) => i.severity === "error").length;
  const questionCount = derived.questions.ok ? derived.questions.value.length : 0;
  const profileName = profile?.displayName ?? derived.targetId;

  const tabs: SideTabDef[] = [
    { id: "quality", label: "Calidad", title: "Completitud estructural", content: <QualityPanel outcome={derived.quality} /> },
    {
      id: "validation",
      label: "Validación",
      title: "Validación de la especificación",
      count: validationIssues.length || undefined,
      tone: errorCount ? "danger" : "warn",
      content: <ValidationPanel outcome={derived.validation} onGoToField={goToField} canGoToField={canGoToField} />,
    },
    {
      id: "questions",
      label: "Preguntas",
      title: "Preguntas para completar la especificación",
      count: questionCount || undefined,
      content: <QuestionsPanel outcome={derived.questions} onAnswer={goToField} onQuickFill={quickFill} canGoToField={canGoToField} />,
    },
    { id: "explain", label: "¿Por qué esta estructura?", title: "¿Por qué esta estructura?", content: <ExplainPanel outcome={derived.result} profileName={profileName} /> },
  ];

  const views: { id: MobileView; label: string }[] = [
    { id: "editor", label: "Editor" },
    { id: "prompt", label: "Prompt" },
  ];

  return (
    <div className="mt-6 space-y-4 [--pf-danger:#dc2626] dark:[--pf-danger:#f87171]">
      <TopBar
        spec={spec}
        ui={ui}
        actions={actions}
        targetId={derived.targetId}
        profile={profile}
        result={derived.result}
        status={message}
        announce={announce}
        onImport={onImport}
      />

      {importReport ? <ImportReportBanner report={importReport} onDismiss={() => setImportReport(null)} /> : null}

      <div
        id={VIEW_TABS_ID}
        role="group"
        aria-label="Vista"
        className="sticky top-[72px] z-20 grid grid-cols-2 rounded-xl border border-border bg-subtle/90 p-1 backdrop-blur lg:hidden"
      >
        {views.map((v) => {
          const selected = ui.mobileView === v.id;
          return (
            <button
              key={v.id}
              type="button"
              aria-pressed={selected}
              aria-controls={`pf-panel-${v.id}`}
              onClick={() => actions.setMobileView(v.id)}
              className={cx(
                "h-8 rounded-lg text-[13.5px] transition-colors",
                selected ? "bg-surface font-medium text-fg shadow-[var(--shadow-sm)] ring-1 ring-border" : "text-muted hover:text-fg",
              )}
            >
              {v.label}
              {v.id === "prompt" && errorCount ? <span className="ml-1.5 font-mono text-[11px] text-[var(--pf-danger)]">{errorCount}</span> : null}
            </button>
          );
        })}
      </div>

      {ui.compare && derived.all ? (
        <div className={cx(ui.mobileView !== "prompt" && "max-lg:hidden")}>
          <ComparePanel outcome={derived.all} onClose={() => actions.setCompare(false)} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-6">
        <section
          id="pf-panel-editor"
          aria-labelledby="pf-builder-title"
          className={cx("min-w-0", ui.mobileView !== "editor" && "max-lg:hidden")}
        >
          <h2 id="pf-builder-title" className="sr-only">
            Constructor de la especificación
          </h2>
          <Wizard spec={spec} ui={ui} actions={actions} targetId={derived.targetId} announce={announce} />
        </section>

        <div
          id="pf-panel-prompt"
          className={cx(
            "flex min-w-0 flex-col gap-4 lg:sticky lg:top-[84px] lg:h-[calc(100dvh-104px)]",
            ui.mobileView !== "prompt" && "max-lg:hidden",
          )}
        >
          <PreviewPanel
            profile={profile}
            targetId={derived.targetId}
            outcome={derived.result}
            onGoToField={goToField}
            canGoToField={canGoToField}
            onShowValidation={() => actions.setSideTab("validation")}
            className="lg:min-h-0 lg:flex-[1.35]"
          />
          <SidePanels tabs={tabs} active={ui.sideTab} onChange={actions.setSideTab} className="lg:min-h-0 lg:flex-1" />
        </div>
      </div>
    </div>
  );
}
