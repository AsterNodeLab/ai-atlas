import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { PromptFactory } from "@/components/prompts/factory/prompt-factory";

export const metadata: Metadata = {
  title: "Prompt Factory: compilador de prompts",
  description:
    "Describe una intención, conviértela en una especificación (PromptSpec) y compílala en prompts para Claude, ChatGPT y Gemini, con modo agente, validación y explicación de cada decisión. Sin IA: reglas deterministas.",
  alternates: { canonical: "/prompts/factory" },
};

export default function PromptFactoryPage() {
  return (
    <div className="theme-resources mx-auto max-w-[1200px] px-4 pt-8 sm:px-6 sm:pt-10">
      <header>
        <Breadcrumbs items={[{ label: "Prompts", href: "/prompts" }, { label: "Prompt Factory" }]} />
        <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
          <h1 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-fg sm:text-[36px]">Prompt Factory</h1>
          <span className="mb-1 rounded-full border border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-accent-soft px-2.5 py-0.5 font-mono text-[11.5px] text-accent-text">
            compilador de prompts
          </span>
        </div>
        <p className="mt-2 max-w-[760px] text-[15px] leading-relaxed text-muted sm:text-[16px]">
          Una intención → una especificación (PromptSpec) → prompts compilados para cada modelo. Sin IA: reglas deterministas.
        </p>
      </header>
      <PromptFactory />
    </div>
  );
}
