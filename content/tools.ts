/**
 * Curated directory of AI tools. Every URL is the tool's official site and was
 * checked (HTTP response + page title) on `toolsVerifiedAt`.
 * Criteria: widely used, actively maintained, from an identifiable maker.
 */

export type ToolLevel = 1 | 2 | 3 | 4;

export type ToolCategory =
  | "assistants"
  | "research"
  | "image"
  | "video"
  | "audio"
  | "productivity"
  | "coding"
  | "automation"
  | "platforms"
  | "local"
  | "frameworks"
  | "vector"
  | "mlops"
  | "learning";

export interface Tool {
  slug: string;
  name: string;
  maker: string;
  url: string;
  level: ToolLevel;
  category: ToolCategory;
  description: string;
  openSource?: boolean;
  /** Glossary concepts that explain how the tool works. */
  concepts?: string[];
}

export const toolsVerifiedAt = "2026-09-27";

export const toolLevels: Record<ToolLevel, { title: string; subtitle: string }> = {
  1: { title: "Para empezar", subtitle: "Asistentes y herramientas que cualquiera puede usar hoy, sin configuración." },
  2: { title: "Crear y producir", subtitle: "Imagen, video, audio, investigación y productividad con IA." },
  3: { title: "Construir", subtitle: "Programar con IA, automatizar procesos y prototipar." },
  4: { title: "Desarrolladores e investigación", subtitle: "APIs, modelos locales, frameworks, bases vectoriales y MLOps." },
};

export const toolCategories: Record<ToolCategory, string> = {
  assistants: "Asistentes",
  research: "Búsqueda e investigación",
  image: "Imagen y diseño",
  video: "Video",
  audio: "Voz y música",
  productivity: "Productividad",
  coding: "Programación con IA",
  automation: "Automatización",
  platforms: "APIs y plataformas",
  local: "Modelos locales",
  frameworks: "Frameworks y librerías",
  vector: "Bases de datos vectoriales",
  mlops: "MLOps y evaluación",
  learning: "Aprender IA",
};

export const tools: Tool[] = [
  // ── Nivel 1 · Para empezar ──────────────────────────────────────────
  { slug: "chatgpt", name: "ChatGPT", maker: "OpenAI", url: "https://chatgpt.com", level: 1, category: "assistants", description: "Asistente conversacional generalista: responde preguntas, redacta, analiza archivos e imágenes y conversa por voz.", concepts: ["llm", "multimodal-model"] },
  { slug: "claude", name: "Claude", maker: "Anthropic", url: "https://claude.ai", level: 1, category: "assistants", description: "Asistente de Anthropic, muy usado para escritura, análisis de documentos largos y programación.", concepts: ["llm", "context-window"] },
  { slug: "gemini", name: "Gemini", maker: "Google", url: "https://gemini.google.com", level: 1, category: "assistants", description: "Asistente de Google, multimodal e integrado con servicios como Gmail, Docs y Drive.", concepts: ["multimodal-model"] },
  { slug: "microsoft-copilot", name: "Microsoft Copilot", maker: "Microsoft", url: "https://copilot.microsoft.com", level: 1, category: "assistants", description: "Asistente de Microsoft para la web, Windows y Microsoft 365.", concepts: ["llm"] },
  { slug: "meta-ai", name: "Meta AI", maker: "Meta", url: "https://www.meta.ai", level: 1, category: "assistants", description: "Asistente de Meta, también disponible dentro de WhatsApp, Instagram y Messenger.", concepts: ["llm"] },
  { slug: "deepseek-chat", name: "DeepSeek", maker: "DeepSeek", url: "https://chat.deepseek.com", level: 1, category: "assistants", description: "Asistente del laboratorio DeepSeek, cuyos modelos también se publican con pesos abiertos.", concepts: ["open-weights-model", "reasoning-model"] },
  { slug: "grok", name: "Grok", maker: "xAI", url: "https://grok.com", level: 1, category: "assistants", description: "Asistente de xAI, disponible en la web y dentro de X.", concepts: ["llm"] },
  { slug: "mistral-vibe", name: "Vibe", maker: "Mistral AI", url: "https://chat.mistral.ai", level: 1, category: "assistants", description: "Asistente del laboratorio francés Mistral AI.", concepts: ["llm"] },
  { slug: "perplexity", name: "Perplexity", maker: "Perplexity", url: "https://www.perplexity.ai", level: 1, category: "research", description: "Buscador conversacional: responde con información de la web y cita sus fuentes.", concepts: ["rag", "grounding"] },
  { slug: "notebooklm", name: "NotebookLM", maker: "Google", url: "https://notebooklm.google.com", level: 1, category: "research", description: "Sube tus documentos y pregúntales: respuestas basadas en tus fuentes, resúmenes y guías de estudio.", concepts: ["rag", "grounding"] },
  { slug: "google-ml-crash-course", name: "Machine Learning Crash Course", maker: "Google", url: "https://developers.google.com/machine-learning/crash-course", level: 1, category: "learning", description: "Curso gratuito e introductorio de machine learning con ejercicios interactivos.", concepts: ["machine-learning"] },
  { slug: "3blue1brown", name: "Neural Networks (3Blue1Brown)", maker: "3Blue1Brown", url: "https://www.3blue1brown.com/topics/neural-networks", level: 1, category: "learning", description: "Serie visual que explica redes neuronales, backpropagation y Transformers con animaciones.", concepts: ["neural-network", "backpropagation", "transformer"] },

  // ── Nivel 2 · Crear y producir ──────────────────────────────────────
  { slug: "midjourney", name: "Midjourney", maker: "Midjourney", url: "https://www.midjourney.com", level: 2, category: "image", description: "Generación de imágenes con un estilo estético muy característico, a partir de texto.", concepts: ["image-generation", "diffusion-model"] },
  { slug: "adobe-firefly", name: "Adobe Firefly", maker: "Adobe", url: "https://firefly.adobe.com", level: 2, category: "image", description: "Generación y edición de imágenes de Adobe, integrada con Photoshop y el resto de Creative Cloud.", concepts: ["image-generation"] },
  { slug: "ideogram", name: "Ideogram", maker: "Ideogram", url: "https://ideogram.ai", level: 2, category: "image", description: "Generación de imágenes que destaca por reproducir texto legible dentro de la imagen.", concepts: ["image-generation"] },
  { slug: "krea", name: "Krea", maker: "Krea", url: "https://www.krea.ai", level: 2, category: "image", description: "Plataforma creativa que reúne varios modelos de imagen y video, con generación en tiempo real.", concepts: ["image-generation"] },
  { slug: "canva", name: "Canva", maker: "Canva", url: "https://www.canva.com", level: 2, category: "image", description: "Herramienta de diseño con funciones de IA integradas para generar y editar contenido visual.", concepts: ["generative-ai"] },
  { slug: "runway", name: "Runway", maker: "Runway", url: "https://runway.com", level: 2, category: "video", description: "Modelos generativos de video para creadores y estudios: generar, editar y animar.", concepts: ["diffusion-model", "world-models"] },
  { slug: "sora", name: "Sora", maker: "OpenAI", url: "https://sora.chatgpt.com", level: 2, category: "video", description: "Generación de video a partir de texto e imágenes, de OpenAI.", concepts: ["diffusion-model"] },
  { slug: "google-flow", name: "Flow", maker: "Google", url: "https://flow.google.com", level: 2, category: "video", description: "Estudio creativo de Google para generar video e imágenes con sus modelos generativos.", concepts: ["diffusion-model"] },
  { slug: "elevenlabs", name: "ElevenLabs", maker: "ElevenLabs", url: "https://elevenlabs.io", level: 2, category: "audio", description: "Voz sintética, doblaje, clonación de voz y agentes de voz.", concepts: ["generative-ai"] },
  { slug: "suno", name: "Suno", maker: "Suno", url: "https://suno.com", level: 2, category: "audio", description: "Genera canciones completas —música y voz— a partir de una descripción.", concepts: ["generative-ai"] },
  { slug: "deepl", name: "DeepL", maker: "DeepL", url: "https://www.deepl.com", level: 2, category: "productivity", description: "Traducción automática neuronal de alta calidad y asistente de escritura.", concepts: ["machine-translation"] },
  { slug: "gamma", name: "Gamma", maker: "Gamma", url: "https://gamma.app", level: 2, category: "productivity", description: "Crea presentaciones, documentos y sitios web a partir de una idea o un texto.", concepts: ["generative-ai"] },
  { slug: "notion-ai", name: "Notion AI", maker: "Notion", url: "https://www.notion.com/product/ai", level: 2, category: "productivity", description: "IA integrada en Notion para buscar, resumir y redactar sobre tu espacio de trabajo.", concepts: ["rag"] },
  { slug: "elicit", name: "Elicit", maker: "Elicit", url: "https://elicit.com", level: 2, category: "research", description: "Asistente de investigación: busca, resume y extrae datos de artículos científicos.", concepts: ["semantic-search"] },
  { slug: "consensus", name: "Consensus", maker: "Consensus", url: "https://consensus.app", level: 2, category: "research", description: "Buscador de literatura científica que resume lo que dicen los estudios sobre una pregunta.", concepts: ["semantic-search", "grounding"] },
  { slug: "deeplearning-ai", name: "DeepLearning.AI", maker: "DeepLearning.AI", url: "https://www.deeplearning.ai", level: 2, category: "learning", description: "Cursos y cursos cortos sobre machine learning, LLMs, agentes y RAG.", concepts: ["deep-learning"] },
  { slug: "kaggle-learn", name: "Kaggle Learn", maker: "Kaggle (Google)", url: "https://www.kaggle.com/learn", level: 2, category: "learning", description: "Micro-cursos prácticos de Python, datos y machine learning, directamente en el navegador.", concepts: ["machine-learning"] },

  // ── Nivel 3 · Construir ─────────────────────────────────────────────
  { slug: "github-copilot", name: "GitHub Copilot", maker: "GitHub", url: "https://github.com/features/copilot", level: 3, category: "coding", description: "Asistente de programación integrado en editores y en GitHub: autocompletado, chat y agentes.", concepts: ["ai-agent", "llm"] },
  { slug: "cursor", name: "Cursor", maker: "Anysphere", url: "https://cursor.com", level: 3, category: "coding", description: "Editor de código construido alrededor de la IA, con agentes que editan varios archivos.", concepts: ["ai-agent", "tool-calling"] },
  { slug: "claude-code", name: "Claude Code", maker: "Anthropic", url: "https://claude.com/product/claude-code", level: 3, category: "coding", description: "Agente de programación que trabaja en tu terminal, IDE y repositorio.", concepts: ["ai-agent", "tool-calling"] },
  { slug: "openai-codex", name: "Codex", maker: "OpenAI", url: "https://openai.com/codex", level: 3, category: "coding", description: "Agente de programación de OpenAI para escribir, revisar y ejecutar código.", concepts: ["ai-agent"] },
  { slug: "replit", name: "Replit", maker: "Replit", url: "https://replit.com", level: 3, category: "coding", description: "Entorno en la nube para crear y publicar aplicaciones describiéndolas con un agente.", concepts: ["ai-agent"] },
  { slug: "v0", name: "v0", maker: "Vercel", url: "https://v0.app", level: 3, category: "coding", description: "Genera aplicaciones web e interfaces a partir de una descripción.", concepts: ["generative-ai"] },
  { slug: "lovable", name: "Lovable", maker: "Lovable", url: "https://lovable.dev", level: 3, category: "coding", description: "Crea aplicaciones y sitios completos conversando, sin necesidad de programar.", concepts: ["ai-agent"] },
  { slug: "bolt", name: "Bolt", maker: "StackBlitz", url: "https://bolt.new", level: 3, category: "coding", description: "Constructor de sitios, apps y prototipos con IA que corre en el navegador.", concepts: ["ai-agent"] },
  { slug: "n8n", name: "n8n", maker: "n8n", url: "https://n8n.io", level: 3, category: "automation", description: "Automatización de flujos con nodos visuales, agentes de IA y opción de autoalojamiento.", concepts: ["agentic-workflow", "workflow"] },
  { slug: "zapier", name: "Zapier", maker: "Zapier", url: "https://zapier.com", level: 3, category: "automation", description: "Conecta miles de aplicaciones y añade pasos de IA a tus automatizaciones.", concepts: ["workflow"] },
  { slug: "make", name: "Make", maker: "Make", url: "https://www.make.com", level: 3, category: "automation", description: "Automatización visual de procesos con módulos de IA y agentes.", concepts: ["workflow", "agentic-workflow"] },
  { slug: "google-colab", name: "Google Colab", maker: "Google", url: "https://colab.research.google.com", level: 3, category: "frameworks", description: "Notebooks de Python en el navegador con acceso a GPU: ideal para experimentar.", concepts: ["gpu"] },
  { slug: "kaggle", name: "Kaggle", maker: "Kaggle (Google)", url: "https://www.kaggle.com", level: 3, category: "frameworks", description: "Datasets, notebooks, modelos y competencias de ciencia de datos.", concepts: ["dataset", "benchmark"] },
  { slug: "hugging-face", name: "Hugging Face", maker: "Hugging Face", url: "https://huggingface.co", level: 3, category: "platforms", description: "El gran repositorio de la IA abierta: modelos, datasets y demos (Spaces).", concepts: ["open-weights-model", "dataset"] },
  { slug: "hugging-face-learn", name: "Hugging Face Learn", maker: "Hugging Face", url: "https://huggingface.co/learn", level: 3, category: "learning", description: "Cursos gratuitos sobre LLMs, agentes, visión, audio y más.", concepts: ["llm", "ai-agent"] },
  { slug: "fast-ai", name: "Practical Deep Learning", maker: "fast.ai", url: "https://course.fast.ai", level: 3, category: "learning", description: "Curso gratuito y práctico de deep learning para personas con experiencia en programación.", concepts: ["deep-learning"] },

  // ── Nivel 4 · Desarrolladores e investigación ───────────────────────
  { slug: "openai-platform", name: "OpenAI Platform", maker: "OpenAI", url: "https://platform.openai.com", level: 4, category: "platforms", description: "API y documentación para usar los modelos de OpenAI en tus aplicaciones.", concepts: ["api", "function-calling"] },
  { slug: "claude-platform", name: "Claude Platform", maker: "Anthropic", url: "https://platform.claude.com", level: 4, category: "platforms", description: "API, consola y documentación para construir con los modelos Claude.", concepts: ["api", "tool-calling"] },
  { slug: "google-ai-studio", name: "Google AI Studio", maker: "Google", url: "https://aistudio.google.com", level: 4, category: "platforms", description: "Prueba los modelos Gemini y obtén una API key para desarrollar.", concepts: ["api", "prompt-engineering"] },
  { slug: "mistral-studio", name: "Mistral AI Studio", maker: "Mistral AI", url: "https://console.mistral.ai", level: 4, category: "platforms", description: "Consola y API para usar y ajustar los modelos de Mistral AI.", concepts: ["api", "fine-tuning"] },
  { slug: "openrouter", name: "OpenRouter", maker: "OpenRouter", url: "https://openrouter.ai", level: 4, category: "platforms", description: "Una sola API para acceder a cientos de modelos de distintos proveedores y comparar precios.", concepts: ["api", "router"] },
  { slug: "groq", name: "Groq", maker: "Groq", url: "https://groq.com", level: 4, category: "platforms", description: "Nube de inferencia especializada en velocidad, con hardware propio.", concepts: ["inference", "latency"] },
  { slug: "together-ai", name: "Together AI", maker: "Together AI", url: "https://www.together.ai", level: 4, category: "platforms", description: "Nube para ejecutar, ajustar y entrenar modelos abiertos.", concepts: ["open-weights-model", "fine-tuning"] },
  { slug: "amazon-bedrock", name: "Amazon Bedrock", maker: "AWS", url: "https://aws.amazon.com/bedrock/", level: 4, category: "platforms", description: "Servicio de AWS para usar modelos de varios proveedores y construir agentes en la nube de Amazon.", concepts: ["api", "foundation-model"] },
  { slug: "microsoft-foundry", name: "Microsoft Foundry", maker: "Microsoft", url: "https://ai.azure.com", level: 4, category: "platforms", description: "Plataforma de Microsoft Azure para desplegar modelos y construir aplicaciones y agentes.", concepts: ["model-deployment"] },
  { slug: "ollama", name: "Ollama", maker: "Ollama", url: "https://ollama.com", level: 4, category: "local", description: "Descarga y ejecuta modelos abiertos en tu computadora con un solo comando.", openSource: true, concepts: ["open-weights-model", "quantization"] },
  { slug: "lm-studio", name: "LM Studio", maker: "Element Labs", url: "https://lmstudio.ai", level: 4, category: "local", description: "Aplicación de escritorio para usar modelos abiertos, incluso de forma local.", concepts: ["open-weights-model", "quantization"] },
  { slug: "llama-cpp", name: "llama.cpp", maker: "ggml-org", url: "https://github.com/ggml-org/llama.cpp", level: 4, category: "local", description: "Motor de inferencia en C/C++ para ejecutar LLMs cuantizados en casi cualquier hardware.", openSource: true, concepts: ["quantization", "inference"] },
  { slug: "vllm", name: "vLLM", maker: "vLLM project", url: "https://docs.vllm.ai", level: 4, category: "local", description: "Servidor de inferencia de alto rendimiento para LLMs, con PagedAttention.", openSource: true, concepts: ["inference-server", "kv-cache", "batching"] },
  { slug: "comfyui", name: "ComfyUI", maker: "Comfy Org", url: "https://www.comfy.org", level: 4, category: "local", description: "Editor de flujos por nodos para generación de imagen y video con control total.", openSource: true, concepts: ["diffusion-model", "latent-diffusion"] },
  { slug: "whisper", name: "Whisper", maker: "OpenAI", url: "https://github.com/openai/whisper", level: 4, category: "local", description: "Modelo abierto de reconocimiento de voz y transcripción multilingüe.", openSource: true, concepts: ["encoder-decoder", "open-weights-model"] },
  { slug: "pytorch", name: "PyTorch", maker: "PyTorch Foundation", url: "https://pytorch.org", level: 4, category: "frameworks", description: "El framework de deep learning más usado en investigación y producción.", openSource: true, concepts: ["tensor", "backpropagation"] },
  { slug: "tensorflow", name: "TensorFlow", maker: "Google", url: "https://www.tensorflow.org", level: 4, category: "frameworks", description: "Framework de machine learning de extremo a extremo, con Keras como API de alto nivel.", openSource: true, concepts: ["tensor"] },
  { slug: "jax", name: "JAX", maker: "Google", url: "https://docs.jax.dev", level: 4, category: "frameworks", description: "Cómputo numérico con diferenciación automática y compilación para GPU y TPU.", openSource: true, concepts: ["gradient", "tpu"] },
  { slug: "transformers-library", name: "Transformers", maker: "Hugging Face", url: "https://huggingface.co/docs/transformers", level: 4, category: "frameworks", description: "Librería para cargar, ajustar y usar miles de modelos preentrenados.", openSource: true, concepts: ["transformer", "fine-tuning"] },
  { slug: "scikit-learn", name: "scikit-learn", maker: "scikit-learn", url: "https://scikit-learn.org", level: 4, category: "frameworks", description: "La librería clásica de machine learning en Python: clasificación, regresión, clustering y más.", openSource: true, concepts: ["supervised-learning", "unsupervised-learning"] },
  { slug: "langchain", name: "LangChain", maker: "LangChain", url: "https://www.langchain.com", level: 4, category: "frameworks", description: "Framework para construir aplicaciones y agentes con LLMs.", openSource: true, concepts: ["ai-agent", "rag"] },
  { slug: "llamaindex", name: "LlamaIndex", maker: "LlamaIndex", url: "https://www.llamaindex.ai", level: 4, category: "frameworks", description: "Framework para conectar LLMs con tus datos: ingesta, indexación y agentes de documentos.", openSource: true, concepts: ["rag", "chunking"] },
  { slug: "ai-sdk", name: "AI SDK", maker: "Vercel", url: "https://ai-sdk.dev", level: 4, category: "frameworks", description: "Kit de TypeScript para integrar LLMs, streaming y herramientas en apps web.", openSource: true, concepts: ["api", "tool-calling"] },
  { slug: "mcp", name: "Model Context Protocol", maker: "Proyecto abierto", url: "https://modelcontextprotocol.io", level: 4, category: "frameworks", description: "Protocolo abierto para conectar aplicaciones de IA con herramientas y datos.", openSource: true, concepts: ["model-context-protocol", "tool-calling"] },
  { slug: "gradio", name: "Gradio", maker: "Hugging Face", url: "https://gradio.app", level: 4, category: "frameworks", description: "Crea interfaces web para modelos de ML en pocas líneas de Python.", openSource: true, concepts: ["model-deployment"] },
  { slug: "streamlit", name: "Streamlit", maker: "Snowflake", url: "https://streamlit.io", level: 4, category: "frameworks", description: "Convierte scripts de Python en aplicaciones de datos interactivas.", openSource: true, concepts: ["model-deployment"] },
  { slug: "pgvector", name: "pgvector", maker: "pgvector", url: "https://github.com/pgvector/pgvector", level: 4, category: "vector", description: "Extensión de PostgreSQL para guardar embeddings y hacer búsqueda vectorial.", openSource: true, concepts: ["vector-database", "vector-search"] },
  { slug: "pinecone", name: "Pinecone", maker: "Pinecone", url: "https://www.pinecone.io", level: 4, category: "vector", description: "Base de datos vectorial administrada, sin servidores que gestionar.", concepts: ["vector-database"] },
  { slug: "qdrant", name: "Qdrant", maker: "Qdrant", url: "https://qdrant.tech", level: 4, category: "vector", description: "Motor de búsqueda vectorial de alto rendimiento, escrito en Rust.", openSource: true, concepts: ["vector-database", "approximate-nearest-neighbor"] },
  { slug: "weaviate", name: "Weaviate", maker: "Weaviate", url: "https://weaviate.io", level: 4, category: "vector", description: "Base de datos vectorial con búsqueda híbrida integrada.", openSource: true, concepts: ["vector-database", "hybrid-search"] },
  { slug: "chroma", name: "Chroma", maker: "Chroma", url: "https://www.trychroma.com", level: 4, category: "vector", description: "Infraestructura de búsqueda de código abierto para IA, sencilla para empezar con RAG.", openSource: true, concepts: ["vector-database", "rag"] },
  { slug: "weights-and-biases", name: "Weights & Biases", maker: "Weights & Biases", url: "https://wandb.ai", level: 4, category: "mlops", description: "Seguimiento de experimentos, modelos y evaluaciones de entrenamiento.", concepts: ["mlops", "training"] },
  { slug: "mlflow", name: "MLflow", maker: "Linux Foundation", url: "https://mlflow.org", level: 4, category: "mlops", description: "Plataforma abierta para el ciclo de vida del ML: experimentos, registro y despliegue.", openSource: true, concepts: ["mlops", "model-deployment"] },
  { slug: "langsmith", name: "LangSmith", maker: "LangChain", url: "https://www.langchain.com/langsmith", level: 4, category: "mlops", description: "Observabilidad y evaluación para agentes y aplicaciones con LLMs.", concepts: ["evaluation", "llm-as-a-judge"] },
];
