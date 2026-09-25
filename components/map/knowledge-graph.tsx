"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DifficultyBadge } from "@/components/glossary/badges";
import type { Difficulty } from "@/types/glossary";

export interface GraphNode {
  slug: string;
  label: string;
  x: number;
  y: number;
  difficulty: Difficulty;
  definition: string;
}

interface Props {
  nodes: GraphNode[];
  edges: [string, string][];
  curved: string[];
  compact?: boolean;
}

const levelVar: Record<Difficulty, string> = {
  beginner: "var(--lvl-1)",
  intermediate: "var(--lvl-2)",
  advanced: "var(--lvl-3)",
  research: "var(--lvl-4)",
};

const nodeWidth = (label: string) => Math.max(56, label.length * 7.4 + 30);

/**
 * Interactive knowledge map. Hover or focus a node to highlight its
 * connections; click to open the concept.
 */
export function KnowledgeGraph({ nodes, edges, curved, compact = false }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const byslug = useMemo(() => new Map(nodes.map((n) => [n.slug, n])), [nodes]);
  const neighbors = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const [a, b] of edges) {
      m.set(a, (m.get(a) ?? new Set()).add(b));
      m.set(b, (m.get(b) ?? new Set()).add(a));
    }
    return m;
  }, [edges]);
  const curvedSet = useMemo(() => new Set(curved), [curved]);
  const activeNode = active ? byslug.get(active) : undefined;
  const isLit = (slug: string) => !active || slug === active || neighbors.get(active)?.has(slug);

  return (
    <div>
      <div className="overflow-x-auto overscroll-x-contain rounded-2xl border border-border bg-subtle">
        <svg viewBox="0 0 1000 740" role="img" aria-label="Mapa de conceptos de Inteligencia Artificial y sus conexiones" className={`h-auto w-full ${compact ? "min-w-[640px]" : "min-w-[760px]"}`}>
          <g fill="none">
            {edges.map(([a, b]) => {
              const na = byslug.get(a);
              const nb = byslug.get(b);
              if (!na || !nb) return null;
              const lit = active && (a === active || b === active);
              const d = curvedSet.has(`${a}|${b}`)
                ? `M${na.x},${na.y} Q1080,${(na.y + nb.y) / 2} ${nb.x},${nb.y}`
                : `M${na.x},${na.y} L${nb.x},${nb.y}`;
              return (
                <path
                  key={`${a}-${b}`}
                  d={d}
                  stroke={lit ? "var(--accent)" : "var(--border-strong)"}
                  strokeWidth={lit ? 2 : 1.25}
                  opacity={active && !lit ? 0.35 : 1}
                  className="transition-[stroke,opacity] duration-200"
                />
              );
            })}
          </g>
          {nodes.map((n) => {
            const w = nodeWidth(n.label);
            const lit = isLit(n.slug);
            const isActive = n.slug === active;
            return (
              <Link
                key={n.slug}
                href={`/glossary/${n.slug}`}
                aria-label={`${n.label}: ${n.definition}`}
                onMouseEnter={() => setActive(n.slug)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(n.slug)}
                onBlur={() => setActive(null)}
                className="outline-none"
              >
                <g opacity={lit ? 1 : 0.35} className="transition-opacity duration-200">
                  <rect
                    x={n.x - w / 2}
                    y={n.y - 18}
                    width={w}
                    height={36}
                    rx={18}
                    fill="var(--surface)"
                    stroke={isActive ? "var(--accent)" : "var(--border-strong)"}
                    strokeWidth={isActive ? 2 : 1}
                  />
                  <circle cx={n.x - w / 2 + 16} cy={n.y} r={3.5} fill={levelVar[n.difficulty]} />
                  <text x={n.x + 6} y={n.y + 4.5} textAnchor="middle" fontSize="13.5" fontWeight={isActive ? 600 : 500} fill="var(--fg)" fontFamily="var(--font-sans)">
                    {n.label}
                  </text>
                </g>
              </Link>
            );
          })}
        </svg>
      </div>
      {!compact ? (
        <div className="mt-4 min-h-[88px] rounded-2xl border border-border px-5 py-4" aria-live="polite">
          {activeNode ? (
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[16px] font-semibold text-fg">{activeNode.label}</span>
                <DifficultyBadge difficulty={activeNode.difficulty} short />
              </div>
              <p className="mt-1 text-[15px] text-muted">{activeNode.definition}</p>
            </div>
          ) : (
            <p className="text-[15px] text-muted">Pasa el cursor (o navega con Tab) sobre un concepto para ver sus conexiones. Haz clic para abrirlo.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
