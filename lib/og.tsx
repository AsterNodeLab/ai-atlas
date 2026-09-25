import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };

/** Shared minimal Open Graph card. */
export function ogImage({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", padding: "72px 80px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 600, color: "#111111" }}>
          <div style={{ width: 30, height: 30, borderRadius: 999, border: "3px solid #111111", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: "#5b52f5" }} />
          </div>
          {site.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: "#737373", letterSpacing: 2, textTransform: "uppercase" }}>{eyebrow}</div>
          <div style={{ fontSize: title.length > 28 ? 68 : 88, fontWeight: 700, color: "#111111", letterSpacing: -3, lineHeight: 1.05, marginTop: 18 }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 30, color: "#666666", marginTop: 26, lineHeight: 1.35, maxWidth: 1000 }}>{subtitle}</div> : null}
        </div>
      </div>
    ),
    ogSize,
  );
}
