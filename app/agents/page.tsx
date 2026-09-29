import type { Metadata } from "next";
import { ResourceHeader } from "@/components/resources/resource-header";
import { ExternalIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Anatomía de un agente de IA (experiencia 3D)",
  description:
    "Cómo piensa, percibe, recuerda, decide y actúa un agente de IA, explicado con un robot humanoide 3D: modelo, system prompt, contexto, memoria, objetivo, guardrails, tools, skills y el loop del agente.",
  alternates: { canonical: "/agents" },
};

// The experience is a standalone WebGL page in /public; static files are not prefixed by Next, so add the basePath here.
const experienceSrc = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/anatomia_agente_ia.html`;

const systems = [
  ["Cabeza", "Modelo (LLM)"],
  ["Núcleo del cerebro", "System prompt"],
  ["Ojos y sensores", "Contexto"],
  ["Módulo de memoria", "Memoria"],
  ["Corazón", "Objetivo"],
  ["Columna", "Guardrails"],
  ["Brazos", "Tools"],
  ["Manos", "Skills"],
  ["Sistema nervioso", "Loop del agente"],
] as const;

export default function AgentsPage() {
  return (
    <div className="theme-resources mx-auto max-w-[1200px] px-4 pt-10 sm:px-6 sm:pt-14">
      <ResourceHeader
        active="agents"
        eyebrow="Recursos · Agentes"
        title="Anatomía de un agente de IA."
        description="Una experiencia 3D para entender cómo está construido un agente: cada sistema es una parte del cuerpo de un robot humanoide. Es una metáfora funcional, no anatomía literal."
        meta={
          <>
            <span>14 escenas</span>
            <span>Scroll, flechas o barra espaciadora</span>
            <span>Pensada para presentar en pantalla completa</span>
          </>
        }
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <ul className="flex flex-wrap gap-2 text-[13.5px]">
          {systems.map(([part, name]) => (
            <li key={name} className="rounded-full border border-border px-3 py-1 text-muted">
              {part} <span className="text-faint">→</span> <span className="text-fg">{name}</span>
            </li>
          ))}
        </ul>
        <a
          href={experienceSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[14px] font-medium text-accent-contrast"
        >
          Abrir en pantalla completa <ExternalIcon size={13} />
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[#020407]">
        <iframe
          src={experienceSrc}
          title="Anatomía de un agente de IA: experiencia 3D interactiva"
          className="block h-[calc(100svh-160px)] min-h-[520px] w-full"
          allow="fullscreen"
          loading="lazy"
        />
      </div>
      <p className="mt-3 text-[13.5px] text-faint">
        Haz clic dentro de la experiencia para usar el teclado. Requiere un navegador con WebGL; si no está disponible, se muestra la narrativa sin el robot.
      </p>
    </div>
  );
}
