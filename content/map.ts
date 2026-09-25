/**
 * Curated layout of the "Mapa de IA". Positions are in a 1000×740 SVG space.
 * Nodes reference glossary slugs; edges are undirected "leads to / builds on" links.
 * To grow the map, add nodes and edges here (or replace with an automatic layout later).
 */
export interface MapNode {
  slug: string;
  label: string;
  x: number;
  y: number;
  layer: string;
}

export const mapNodes: MapNode[] = [
  { slug: "artificial-intelligence", label: "Inteligencia Artificial", x: 500, y: 50, layer: "Fundamentos" },
  { slug: "machine-learning", label: "Machine Learning", x: 500, y: 140, layer: "Fundamentos" },
  { slug: "supervised-learning", label: "Aprendizaje supervisado", x: 170, y: 230, layer: "Fundamentos" },
  { slug: "deep-learning", label: "Deep Learning", x: 500, y: 230, layer: "Fundamentos" },
  { slug: "reinforcement-learning", label: "Reinforcement Learning", x: 850, y: 230, layer: "Fundamentos" },
  { slug: "neural-network", label: "Redes neuronales", x: 330, y: 320, layer: "Deep Learning" },
  { slug: "generative-ai", label: "IA generativa", x: 670, y: 320, layer: "Deep Learning" },
  { slug: "cnn", label: "CNN", x: 150, y: 410, layer: "Deep Learning" },
  { slug: "transformer", label: "Transformer", x: 330, y: 410, layer: "Deep Learning" },
  { slug: "diffusion-model", label: "Modelos de difusión", x: 860, y: 410, layer: "Deep Learning" },
  { slug: "computer-vision", label: "Visión por computadora", x: 150, y: 500, layer: "Aplicaciones" },
  { slug: "attention", label: "Attention", x: 290, y: 500, layer: "Transformers" },
  { slug: "embeddings", label: "Embeddings", x: 450, y: 500, layer: "Transformers" },
  { slug: "llm", label: "LLM", x: 670, y: 500, layer: "LLMs" },
  { slug: "reasoning-model", label: "Razonamiento", x: 860, y: 500, layer: "LLMs" },
  { slug: "vector-database", label: "Vector DB", x: 450, y: 590, layer: "Aplicaciones" },
  { slug: "rag", label: "RAG", x: 575, y: 590, layer: "Aplicaciones" },
  { slug: "fine-tuning", label: "Fine-tuning", x: 860, y: 590, layer: "LLMs" },
  { slug: "tool-calling", label: "Tool calling", x: 500, y: 680, layer: "Aplicaciones" },
  { slug: "ai-agent", label: "Agentes", x: 670, y: 680, layer: "Aplicaciones" },
  { slug: "rlhf", label: "RLHF", x: 860, y: 680, layer: "LLMs" },
];

export const mapEdges: [string, string][] = [
  ["artificial-intelligence", "machine-learning"],
  ["machine-learning", "supervised-learning"],
  ["machine-learning", "deep-learning"],
  ["machine-learning", "reinforcement-learning"],
  ["deep-learning", "neural-network"],
  ["deep-learning", "generative-ai"],
  ["neural-network", "cnn"],
  ["neural-network", "transformer"],
  ["cnn", "computer-vision"],
  ["generative-ai", "diffusion-model"],
  ["generative-ai", "llm"],
  ["transformer", "attention"],
  ["transformer", "embeddings"],
  ["transformer", "llm"],
  ["embeddings", "vector-database"],
  ["vector-database", "rag"],
  ["llm", "rag"],
  ["llm", "reasoning-model"],
  ["llm", "fine-tuning"],
  ["fine-tuning", "rlhf"],
  ["llm", "ai-agent"],
  ["ai-agent", "tool-calling"],
  ["rag", "ai-agent"],
  ["reinforcement-learning", "rlhf"],
];

/** Edges drawn as curves around the right edge to avoid crossing nodes. */
export const curvedEdges = new Set(["reinforcement-learning|rlhf"]);
