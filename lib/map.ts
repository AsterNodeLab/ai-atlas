import { curvedEdges, mapEdges, mapNodes } from "@/content/map";
import type { GraphNode } from "@/components/map/knowledge-graph";
import { getTerm } from "@/lib/glossary";

/** Resolves the curated map against the glossary (fails the build on unknown slugs). */
export function getMapData() {
  const nodes: GraphNode[] = mapNodes.map((n) => {
    const term = getTerm(n.slug);
    if (!term) throw new Error(`Map node without glossary term: ${n.slug}`);
    return { slug: n.slug, label: n.label, x: n.x, y: n.y, difficulty: term.difficulty, definition: term.shortDefinition };
  });
  const layers = [...new Set(mapNodes.map((n) => n.layer))].map((layer) => ({
    layer,
    terms: mapNodes.filter((n) => n.layer === layer).map((n) => getTerm(n.slug)!),
  }));
  return { nodes, edges: mapEdges, curved: [...curvedEdges], layers };
}
