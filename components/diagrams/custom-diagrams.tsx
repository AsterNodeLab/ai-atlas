import type { CustomDiagramId } from "@/types/glossary";

/**
 * Hand-drawn SVG diagrams. All colors come from CSS tokens so they adapt to
 * light/dark mode. Text is real SVG text (selectable, readable by screen readers
 * through the figure's caption and aria-label).
 */

const fg = "var(--fg)";
const muted = "var(--fg-muted)";
const faint = "var(--fg-subtle)";
const line = "var(--border-strong)";
const accent = "var(--accent)";
const surface = "var(--surface)";

const textProps = { fontFamily: "var(--font-sans)", fill: fg } as const;

function EmbeddingMap() {
  const clusters = [
    { label: "Animales", cx: 170, cy: 125, rx: 105, ry: 70, points: [["perro", 135, 108], ["gato", 190, 96], ["león", 215, 148], ["caballo", 128, 158]] },
    { label: "Vehículos", cx: 485, cy: 115, rx: 105, ry: 70, points: [["avión", 470, 86], ["auto", 520, 126], ["tren", 448, 146], ["barco", 530, 80]] },
    { label: "Comida", cx: 330, cy: 262, rx: 95, ry: 55, points: [["manzana", 290, 252], ["pan", 350, 284], ["taco", 372, 246]] },
  ] as const;
  const highlighted = new Set(["perro", "gato"]);
  return (
    <svg viewBox="0 0 640 340" role="img" aria-label="Mapa de embeddings: perro y gato aparecen cerca; avión aparece lejos" className="h-auto w-full">
      {clusters.map((c) => (
        <g key={c.label}>
          <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="var(--bg-subtle)" stroke={line} strokeDasharray="3 4" />
          <text x={c.cx} y={c.cy - c.ry - 8} textAnchor="middle" fontSize="11" letterSpacing="1" {...textProps} fill={faint}>
            {c.label.toUpperCase()}
          </text>
        </g>
      ))}
      <line x1="135" y1="108" x2="470" y2="86" stroke={faint} strokeDasharray="4 5" />
      <text x="300" y="86" textAnchor="middle" fontSize="12" {...textProps} fill={muted}>lejos</text>
      <line x1="135" y1="108" x2="190" y2="96" stroke={accent} strokeWidth="2" />
      <text x="162" y="88" textAnchor="middle" fontSize="12" {...textProps} fill={accent}>cerca</text>
      {clusters.flatMap((c) =>
        c.points.map(([label, x, y]) => (
          <g key={label}>
            <circle cx={x} cy={y} r={highlighted.has(label) ? 5.5 : 4.5} fill={highlighted.has(label) ? accent : muted} />
            <text x={x + 9} y={y + 4} fontSize="13" {...textProps}>{label}</text>
          </g>
        )),
      )}
    </svg>
  );
}

function AttentionDiagram() {
  const tokens = ["El", "gato", "negro", "duerme", "mucho"];
  const weights = [0.07, 0.62, 0.08, 0.18, 0.05];
  const xs = [100, 210, 320, 430, 540];
  const qx = xs[3];
  return (
    <svg viewBox="0 0 640 240" role="img" aria-label="La palabra duerme presta la mayor atención a gato (0.62)" className="h-auto w-full">
      <text x="16" y="45" fontSize="11" letterSpacing="1" {...textProps} fill={faint}>KEYS</text>
      <text x="16" y="205" fontSize="11" letterSpacing="1" {...textProps} fill={faint}>QUERY</text>
      {xs.map((x, i) => (
        <line key={`l-${i}`} x1={qx} y1={182} x2={x} y2={58} stroke={accent} strokeOpacity={0.2 + weights[i] * 1.2} strokeWidth={1 + weights[i] * 9} strokeLinecap="round" />
      ))}
      {tokens.map((t, i) => (
        <g key={t}>
          <rect x={xs[i] - 38} y={24} width={76} height={34} rx={9} fill={surface} stroke={i === 1 ? accent : line} strokeWidth={i === 1 ? 1.5 : 1} />
          <text x={xs[i]} y={46} textAnchor="middle" fontSize="14" {...textProps}>{t}</text>
          <text x={xs[i]} y={80} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fill={i === 1 ? accent : muted}>{weights[i].toFixed(2)}</text>
        </g>
      ))}
      <rect x={qx - 44} y={182} width={88} height={36} rx={9} fill={accent} />
      <text x={qx} y={205} textAnchor="middle" fontSize="14" fontWeight="600" fontFamily="var(--font-sans)" fill="var(--accent-contrast)">duerme</text>
    </svg>
  );
}

function NeuralNetworkDiagram() {
  const layers = [
    { x: 90, n: 3, label: "Entrada" },
    { x: 250, n: 4, label: "Capa oculta" },
    { x: 410, n: 4, label: "Capa oculta" },
    { x: 560, n: 2, label: "Salida" },
  ];
  const ys = (n: number) => Array.from({ length: n }, (_, i) => 135 + (i - (n - 1) / 2) * 58);
  return (
    <svg viewBox="0 0 640 300" role="img" aria-label="Red neuronal con capa de entrada, dos capas ocultas y capa de salida" className="h-auto w-full">
      {layers.slice(0, -1).map((l, li) =>
        ys(l.n).flatMap((y1, a) =>
          ys(layers[li + 1].n).map((y2, b) => (
            <line key={`${li}-${a}-${b}`} x1={l.x} y1={y1} x2={layers[li + 1].x} y2={y2} stroke={line} strokeWidth="1" />
          )),
        ),
      )}
      {layers.map((l, li) => (
        <g key={li}>
          {ys(l.n).map((y, i) => (
            <circle
              key={i}
              cx={l.x}
              cy={y}
              r={14}
              fill={li === layers.length - 1 ? accent : surface}
              stroke={li === 0 ? fg : li === layers.length - 1 ? accent : muted}
              strokeWidth="1.5"
            />
          ))}
          <text x={l.x} y={286} textAnchor="middle" fontSize="12.5" {...textProps} fill={muted}>{l.label}</text>
        </g>
      ))}
    </svg>
  );
}

function GradientDescentDiagram() {
  const f = (x: number) => 250 - ((x - 380) ** 2) / 520;
  const curve = Array.from({ length: 56 }, (_, i) => {
    const x = 60 + i * 10;
    return `${i === 0 ? "M" : "L"}${x},${f(x).toFixed(1)}`;
  }).join(" ");
  const steps = [85, 175, 245, 298, 336, 360, 373];
  return (
    <svg viewBox="0 0 640 310" role="img" aria-label="Curva de pérdida con pasos que descienden hasta el mínimo" className="h-auto w-full">
      <line x1="44" y1="286" x2="612" y2="286" stroke={line} />
      <line x1="44" y1="24" x2="44" y2="286" stroke={line} />
      <text x="54" y="34" fontSize="12" {...textProps} fill={muted}>Pérdida</text>
      <text x="608" y="304" textAnchor="end" fontSize="12" {...textProps} fill={muted}>Parámetro θ</text>
      <path d={curve} fill="none" stroke={fg} strokeWidth="1.75" />
      {steps.slice(0, -1).map((x, i) => (
        <line key={`s-${i}`} x1={x} y1={f(x)} x2={steps[i + 1]} y2={f(steps[i + 1])} stroke={accent} strokeWidth="1.5" strokeDasharray="3 3" />
      ))}
      {steps.map((x, i) => (
        <circle key={x} cx={x} cy={f(x)} r={i === 0 ? 6 : 4.5} fill={i === steps.length - 1 ? accent : surface} stroke={accent} strokeWidth="2" />
      ))}
      <text x={steps[0] + 12} y={f(steps[0]) - 8} fontSize="12.5" {...textProps}>Inicio</text>
      <text x="380" y="272" textAnchor="middle" fontSize="12.5" {...textProps}>Mínimo</text>
    </svg>
  );
}

function MixtureOfExpertsDiagram() {
  const experts = [
    { y: 28, active: false },
    { y: 92, active: true, w: "0.7" },
    { y: 156, active: true, w: "0.3" },
    { y: 220, active: false },
  ];
  return (
    <svg viewBox="0 0 640 290" role="img" aria-label="El router envía el token a dos de cuatro expertos y combina sus salidas" className="h-auto w-full">
      <rect x="20" y="126" width="100" height="40" rx="10" fill={surface} stroke={fg} />
      <text x="70" y="151" textAnchor="middle" fontSize="14" {...textProps}>token</text>
      <line x1="120" y1="146" x2="180" y2="146" stroke={line} />
      <rect x="180" y="126" width="100" height="40" rx="10" fill={surface} stroke={accent} strokeWidth="1.5" />
      <text x="230" y="151" textAnchor="middle" fontSize="14" fontWeight="600" {...textProps}>Router</text>
      {experts.map((e, i) => (
        <g key={i}>
          <line x1="280" y1="146" x2="370" y2={e.y + 20} stroke={e.active ? accent : line} strokeWidth={e.active ? 2 : 1} strokeDasharray={e.active ? undefined : "4 4"} />
          {e.active ? <text x="322" y={(146 + e.y + 20) / 2 - 6} fontSize="11.5" fontFamily="var(--font-mono)" fill={accent}>{e.w}</text> : null}
          <rect x="370" y={e.y} width="120" height="40" rx="10" fill={e.active ? "var(--accent-soft)" : surface} stroke={e.active ? accent : line} />
          <text x="430" y={e.y + 25} textAnchor="middle" fontSize="13.5" {...textProps} fill={e.active ? fg : faint}>Experto {i + 1}</text>
          {e.active ? <line x1="490" y1={e.y + 20} x2="540" y2="146" stroke={accent} strokeWidth="2" /> : null}
        </g>
      ))}
      <circle cx="556" cy="146" r="16" fill={surface} stroke={accent} strokeWidth="1.5" />
      <text x="556" y="151" textAnchor="middle" fontSize="15" {...textProps}>Σ</text>
      <line x1="572" y1="146" x2="620" y2="146" stroke={fg} />
      <path d="M613 141l7 5-7 5" fill="none" stroke={fg} />
    </svg>
  );
}

function catmullRom(points: [number, number][], tension: number): string {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function FitCurvesDiagram() {
  const pts: [number, number][] = [[20, 112], [42, 82], [65, 72], [88, 44], [110, 60], [132, 50], [155, 80], [178, 104]];
  const smooth = Array.from({ length: 33 }, (_, i) => {
    const x = 12 + i * 5.3;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${(130 - 78 * Math.sin((Math.PI * (x - 5)) / 185)).toFixed(1)}`;
  }).join(" ");
  const panels = [
    { title: "Underfitting", note: "Demasiado simple", path: "M12,82 L188,78" },
    { title: "Buen ajuste", note: "Captura la tendencia", path: smooth },
    { title: "Overfitting", note: "Memoriza el ruido", path: catmullRom(pts, 2.4) },
  ];
  return (
    <svg viewBox="0 0 660 230" role="img" aria-label="Tres ajustes a los mismos datos: subajuste, buen ajuste y sobreajuste" className="h-auto w-full">
      {panels.map((p, i) => (
        <g key={p.title} transform={`translate(${i * 230},0)`}>
          <rect x="0.5" y="0.5" width="200" height="170" rx="12" fill="var(--bg-subtle)" stroke="var(--border)" />
          <path d={p.path} fill="none" stroke={i === 1 ? accent : muted} strokeWidth="2" strokeLinecap="round" />
          {pts.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill={fg} />
          ))}
          <text x="100" y="196" textAnchor="middle" fontSize="13.5" fontWeight="600" {...textProps}>{p.title}</text>
          <text x="100" y="215" textAnchor="middle" fontSize="12" {...textProps} fill={muted}>{p.note}</text>
        </g>
      ))}
    </svg>
  );
}

const registry: Record<CustomDiagramId, () => React.ReactElement> = {
  "embedding-map": EmbeddingMap,
  attention: AttentionDiagram,
  "neural-network": NeuralNetworkDiagram,
  "gradient-descent": GradientDescentDiagram,
  "mixture-of-experts": MixtureOfExpertsDiagram,
  "fit-curves": FitCurvesDiagram,
};

export function CustomDiagram({ id }: { id: CustomDiagramId }) {
  const Diagram = registry[id];
  return <Diagram />;
}
