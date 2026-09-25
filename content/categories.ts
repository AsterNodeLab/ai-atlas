import type { Category } from "@/types/glossary";

export const categories: Category[] = [
  { slug: "fundamentals", name: "Fundamentos", tagline: "El vocabulario básico de la IA.", description: "Los conceptos sobre los que se construye todo lo demás: qué es un modelo, cómo se entrena y cómo se usa." },
  { slug: "machine-learning", name: "Machine Learning", tagline: "Cómo aprenden las máquinas a partir de datos.", description: "Métodos que permiten a una computadora aprender patrones a partir de ejemplos en lugar de seguir reglas escritas a mano." },
  { slug: "deep-learning", name: "Deep Learning", tagline: "Redes neuronales con muchas capas.", description: "La familia de técnicas basada en redes neuronales profundas que impulsa casi toda la IA moderna." },
  { slug: "generative-ai", name: "Generative AI", tagline: "Modelos que crean texto, imágenes y más.", description: "Sistemas capaces de generar contenido nuevo —texto, código, imágenes, audio— a partir de lo que aprendieron." },
  { slug: "llm", name: "Large Language Models", tagline: "Los modelos detrás de los asistentes de IA.", description: "Modelos de lenguaje entrenados con enormes cantidades de texto: cómo funcionan, cómo se ajustan y cómo se sirven." },
  { slug: "transformers", name: "Transformers", tagline: "La arquitectura que cambió la IA.", description: "Las piezas internas del Transformer: attention, embeddings, capas y conexiones que hacen posible a los LLM." },
  { slug: "prompt-engineering", name: "Prompt Engineering", tagline: "Cómo hablarle a un modelo.", description: "Técnicas para escribir instrucciones que obtienen respuestas más útiles, precisas y consistentes." },
  { slug: "agents", name: "AI Agents", tagline: "IA que usa herramientas y actúa.", description: "Sistemas de IA capaces de razonar, utilizar herramientas y ejecutar acciones para alcanzar objetivos." },
  { slug: "rag", name: "RAG & Knowledge", tagline: "Conectar modelos con conocimiento externo.", description: "Cómo darle a un modelo acceso a documentos, bases de conocimiento y datos actualizados sin reentrenarlo." },
  { slug: "vector-search", name: "Vector Search", tagline: "Buscar por significado, no por palabras.", description: "Embeddings, similitud y bases de datos vectoriales: la infraestructura de la búsqueda semántica." },
  { slug: "computer-vision", name: "Computer Vision", tagline: "Máquinas que interpretan imágenes.", description: "Modelos que clasifican, detectan, segmentan y generan imágenes." },
  { slug: "nlp", name: "NLP", tagline: "Procesamiento del lenguaje natural.", description: "Técnicas para que las computadoras analicen, entiendan y produzcan lenguaje humano." },
  { slug: "reinforcement-learning", name: "Reinforcement Learning", tagline: "Aprender por prueba, error y recompensa.", description: "Agentes que aprenden a tomar decisiones interactuando con un entorno y recibiendo recompensas." },
  { slug: "ai-engineering", name: "AI Engineering", tagline: "Construir productos con modelos.", description: "Prácticas para llevar modelos a producción: APIs, optimización de inferencia, latencia y costos." },
  { slug: "mlops", name: "MLOps", tagline: "Operar modelos en el mundo real.", description: "Despliegue, monitoreo y mantenimiento de modelos de machine learning a lo largo del tiempo." },
  { slug: "hardware", name: "Hardware", tagline: "Los chips y centros de datos de la IA.", description: "GPUs, TPUs, memoria y clusters: el hardware que hace posible entrenar y ejecutar modelos." },
  { slug: "math", name: "Matemáticas", tagline: "Las ideas matemáticas, sin miedo.", description: "Vectores, matrices, probabilidad y derivadas explicadas de forma accesible y con su uso en IA." },
  { slug: "safety", name: "AI Safety & Alignment", tagline: "IA segura, confiable y alineada.", description: "Cómo lograr que los sistemas de IA hagan lo que queremos, de forma segura, y cómo entender lo que hacen por dentro." },
  { slug: "evaluation", name: "Evaluación", tagline: "Medir si un modelo funciona.", description: "Métricas, benchmarks y métodos para medir la calidad de un modelo de forma rigurosa." },
  { slug: "frontier", name: "Research / Frontier AI", tagline: "Lo que viene.", description: "Ideas de investigación activa: escalamiento, razonamiento, modelos del mundo e interpretabilidad." },
];
