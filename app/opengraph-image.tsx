import { ogImage, ogSize } from "@/lib/og";

export const dynamic = "force-static";

export const alt = "AI Atlas — Inteligencia Artificial, explicada para humanos";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ eyebrow: "Glosario de Inteligencia Artificial", title: "Inteligencia Artificial, explicada para humanos.", subtitle: "Desde qué es un token hasta cómo funciona un Transformer." });
}
