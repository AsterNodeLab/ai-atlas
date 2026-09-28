import { LOOP_FIELDS, type AgentLoop } from "../labels";

/** Compact ring showing which loop phases are enabled (purely presentational). */
const W = 340;
const H = 220;
const CX = W / 2;
const CY = H / 2;
const RX = 118;
const RY = 80;
const PILL_W = 116;
const PILL_H = 24;
const STEP = 360 / LOOP_FIELDS.length;
const rad = (deg: number) => (deg * Math.PI) / 180;
/** Rounded so server and browser math always serialize identically (no hydration drift). */
const round = (n: number) => Math.round(n * 100) / 100;
const point = (deg: number) => ({ x: round(CX + RX * Math.cos(rad(deg))), y: round(CY + RY * Math.sin(rad(deg))) });

const NODES = LOOP_FIELDS.map((f, i) => ({ ...f, angle: -90 + i * STEP, ...point(-90 + i * STEP) }));
const SEGMENTS = NODES.map((node, i) => {
  const to = NODES[(i + 1) % NODES.length];
  const mid = node.angle + STEP / 2;
  const m = point(mid);
  const tangent = round((Math.atan2(RY * Math.cos(rad(mid)), -RX * Math.sin(rad(mid))) * 180) / Math.PI);
  return { from: node, to, d: `M ${node.x} ${node.y} A ${RX} ${RY} 0 0 1 ${to.x} ${to.y}`, arrow: { x: m.x, y: m.y, rotate: tangent } };
});

export function LoopDiagram({ loop }: { loop: AgentLoop }) {
  const enabled = NODES.filter((n) => loop[n.key]);
  const label = enabled.length
    ? `Loop del agente con ${enabled.length} de ${NODES.length} fases activas: ${enabled.map((n) => n.label).join(", ")}.`
    : "Loop del agente sin fases activas.";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full max-w-[340px]">
      {SEGMENTS.map((s) => {
        const on = loop[s.from.key] && loop[s.to.key];
        return (
          <g key={s.from.key}>
            <path d={s.d} fill="none" stroke={on ? "var(--accent)" : "var(--border-strong)"} strokeWidth={on ? 1.75 : 1.25} strokeDasharray={on ? undefined : "3 4"} />
            <path
              d="M -3.5 -3.5 L 2.5 0 L -3.5 3.5"
              fill="none"
              stroke={on ? "var(--accent)" : "var(--border-strong)"}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              transform={`translate(${s.arrow.x} ${s.arrow.y}) rotate(${s.arrow.rotate})`}
            />
          </g>
        );
      })}
      {NODES.map((n) => {
        const on = loop[n.key];
        return (
          <g key={n.key} transform={`translate(${n.x - PILL_W / 2} ${n.y - PILL_H / 2})`}>
            <rect
              width={PILL_W}
              height={PILL_H}
              rx={PILL_H / 2}
              fill={on ? "var(--accent-soft)" : "var(--surface)"}
              stroke={on ? "var(--accent)" : "var(--border-strong)"}
              strokeDasharray={on ? undefined : "3 3"}
            />
            <text
              x={PILL_W / 2}
              y={PILL_H / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={on ? 600 : 400}
              fill={on ? "var(--accent-text)" : "var(--fg-subtle)"}
            >
              {n.label}
            </text>
          </g>
        );
      })}
      <text x={CX} y={CY - 8} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--fg)">
        Loop
      </text>
      <text x={CX} y={CY + 10} textAnchor="middle" fontSize={11} fill="var(--fg-subtle)" className="font-mono">
        {enabled.length}/{NODES.length} fases
      </text>
    </svg>
  );
}
