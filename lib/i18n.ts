import type { Difficulty, TermType } from "@/types/glossary";

/**
 * UI labels for the current locale (es-MX).
 * Kept in one place so a future `en` dictionary can be swapped in.
 */
export const difficultyLabels: Record<Difficulty, { label: string; level: number; short: string; description: string }> = {
  beginner: {
    level: 1,
    label: "Fundamentos",
    short: "Principiante",
    description: "Los conceptos que todo el mundo debería conocer. Sin requisitos previos.",
  },
  intermediate: {
    level: 2,
    label: "Intermedio",
    short: "Intermedio",
    description: "Cómo funcionan por dentro los sistemas modernos: redes, Transformers, RAG.",
  },
  advanced: {
    level: 3,
    label: "Avanzado",
    short: "Avanzado",
    description: "Técnicas de entrenamiento, optimización y arquitectura que usan los equipos de IA.",
  },
  research: {
    level: 4,
    label: "Research / Frontier",
    short: "Frontier",
    description: "Ideas de investigación activa que están definiendo la próxima generación de IA.",
  },
};

export const difficultyOrder: Difficulty[] = ["beginner", "intermediate", "advanced", "research"];

export const typeLabels: Record<TermType, string> = {
  concept: "Concepto",
  technique: "Técnica",
  architecture: "Arquitectura",
  model: "Modelo",
  infrastructure: "Infraestructura",
  mathematics: "Matemáticas",
  safety: "Seguridad",
};

export const sectionLabels = {
  oneLiner: "En una frase",
  simple: "Explícamelo fácil",
  thirtySeconds: "En 30 segundos",
  howItWorks: "Cómo funciona",
  example: "Ejemplo",
  realExample: "Ejemplo real",
  mentalModel: "Modelo mental",
  technical: "Profundizando",
  comparison: "Comparación",
  mistakes: "Error común",
  why: "¿Por qué importa?",
  useCases: "¿Dónde se utiliza?",
  prerequisites: "Antes de aprender esto",
  next: "Continúa aprendiendo",
  related: "Conceptos relacionados",
  sources: "Fuentes y lecturas",
} as const;
