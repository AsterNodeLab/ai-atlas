/** Central branding & site configuration. Change name/logo here. */
export const site = {
  name: "AI Atlas",
  tagline: "Glosario de Inteligencia Artificial",
  description:
    "Un glosario visual para aprender Inteligencia Artificial: desde qué es un token hasta cómo funciona un Transformer, explicado para humanos.",
  locale: "es-MX",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-atlas.example.com").replace(/\/$/, ""),
  contentDate: "2026-09-24",
} as const;

export interface NavItem {
  href: string;
  label: string;
  /** Part of the separate "Recursos" area. */
  resource?: boolean;
}

export const nav: NavItem[] = [
  { href: "/glossary", label: "Glosario" },
  { href: "/explore", label: "Explorar" },
  { href: "/learn", label: "Rutas" },
  { href: "/map", label: "Mapa de IA" },
  { href: "/tools", label: "Herramientas", resource: true },
  { href: "/models", label: "Modelos", resource: true },
  { href: "/prompts", label: "Prompts", resource: true },
  { href: "/papers", label: "Papers", resource: true },
  { href: "/agents", label: "Agentes", resource: true },
];

export function absoluteUrl(path: string): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
