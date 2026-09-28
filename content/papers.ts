/**
 * Curated reading list of 20 foundational AI papers.
 * Each entry is an original explanation in Spanish (not a translation of the paper):
 * the full text stays with its authors and is linked from `url` / `pdf`.
 * Metadata (title, authors, dates, arXiv ids) was checked against the arXiv API on `papersVerifiedAt`.
 */

export type PaperTheme = "foundations" | "scaling" | "efficiency" | "alignment" | "reasoning" | "systems" | "multimodal";

export interface PaperIdea {
  title: string;
  text: string;
}

export interface Paper {
  slug: string;
  /** Position in the reading list (1–20). */
  n: number;
  title: string;
  /** Spanish rendering of the title. */
  titleEs: string;
  authors: string;
  org: string;
  year: number;
  theme: PaperTheme;
  /** Official page (arXiv abstract or publisher). */
  url: string;
  pdf: string;
  arxiv?: string;
  /** One sentence: why it matters today. */
  why: string;
  /** Short plain-language summary. */
  tldr: string;
  /** The problem the paper set out to solve. */
  problem: string;
  ideas: PaperIdea[];
  results: string[];
  /** What changed afterwards. */
  legacy: string;
  /** Glossary slugs that help to read the paper. */
  concepts: string[];
}

export const papersVerifiedAt = "2026-09-28";

export const paperThemes: Record<PaperTheme, { title: string; subtitle: string }> = {
  foundations: { title: "Los cimientos", subtitle: "La arquitectura Transformer y el salto de «preentrenar y adaptar» a «pedirlo en el prompt»." },
  scaling: { title: "Leyes de escala", subtitle: "Cómo se relacionan tamaño, datos y cómputo, y cómo repartir el presupuesto." },
  efficiency: { title: "Eficiencia e ingeniería", subtitle: "Más capacidad sin multiplicar el costo: expertos, memoria de la GPU y ajuste ligero." },
  alignment: { title: "Alineación", subtitle: "De un modelo que completa texto a un asistente útil, honesto e inofensivo." },
  reasoning: { title: "Razonamiento", subtitle: "Pasos intermedios, verificación y cómputo en el momento de responder." },
  systems: { title: "RAG y agentes", subtitle: "Conectar el modelo con conocimiento externo y con herramientas." },
  multimodal: { title: "Imagen y multimodalidad", subtitle: "Unir texto e imagen, y generar imágenes a partir de texto." },
};

const arxiv = (id: string) => ({ arxiv: id, url: `https://arxiv.org/abs/${id}`, pdf: `https://arxiv.org/pdf/${id}` });

export const papers: Paper[] = [
  // ── Los cimientos ───────────────────────────────────────────────────
  {
    slug: "attention-is-all-you-need",
    n: 1,
    title: "Attention Is All You Need",
    titleEs: "La atención es todo lo que necesitas",
    authors: "Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser y Polosukhin",
    org: "Google Brain · Google Research",
    year: 2017,
    theme: "foundations",
    ...arxiv("1706.03762"),
    why: "El nacimiento del Transformer: self-attention, multi-head attention y positional encoding. Casi todo lo demás parte de aquí.",
    tldr: "Propone el Transformer, una red que procesa secuencias usando únicamente mecanismos de atención, sin recurrencia ni convoluciones. Es más precisa en traducción automática y, sobre todo, mucho más paralelizable, lo que permitió entrenar modelos cada vez más grandes.",
    problem:
      "En 2017 las mejores redes para traducir eran recurrentes (RNN, LSTM): leían la frase palabra por palabra, en orden. Eso impedía paralelizar el entrenamiento en GPUs y hacía difícil relacionar palabras lejanas entre sí. La atención ya existía, pero como complemento de esas redes recurrentes.",
    ideas: [
      { title: "Solo atención", text: "Cada posición de la secuencia «mira» directamente a todas las demás y decide cuánto peso darle a cada una. Así cualquier par de palabras queda a un paso de distancia, sin importar qué tan separadas estén." },
      { title: "Consulta, clave y valor", text: "Cada token se proyecta en tres vectores: una consulta (qué busco), una clave (qué ofrezco) y un valor (qué información aporto). El producto punto entre consultas y claves, escalado y pasado por softmax, da los pesos con los que se mezclan los valores." },
      { title: "Varias cabezas", text: "En lugar de una sola atención, el modelo ejecuta varias en paralelo (multi-head). Cada cabeza puede especializarse en un tipo de relación: sintaxis, correferencias, proximidad, etc." },
      { title: "Codificación posicional", text: "Como la atención no tiene noción de orden, se suma a cada embedding una señal de posición basada en senos y cosenos de distintas frecuencias. Así el modelo sabe dónde está cada token." },
      { title: "Bloques apilables", text: "La arquitectura combina atención, una red feedforward por posición, conexiones residuales y normalización de capa, en un bloque que se repite. El codificador y el decodificador se construyen apilando esos bloques." },
    ],
    results: [
      "Nuevo estado del arte en traducción inglés→alemán (28.4 BLEU) e inglés→francés (41.8 BLEU con un solo modelo).",
      "El modelo grande se entrenó en 3.5 días con 8 GPUs: una fracción del costo de los sistemas anteriores.",
      "La misma arquitectura funcionó bien en análisis sintáctico, una tarea distinta a la traducción.",
    ],
    legacy:
      "El Transformer se volvió la base de BERT, GPT, T5, los Vision Transformers, los modelos de audio y prácticamente todos los LLMs actuales. Su ventaja clave, el paralelismo, es lo que hizo posible escalar a miles de millones de parámetros.",
    concepts: ["transformer", "attention", "self-attention", "multi-head-attention", "query-key-value", "positional-encoding", "encoder-decoder", "machine-translation"],
  },
  {
    slug: "gpt-1",
    n: 2,
    title: "Improving Language Understanding by Generative Pre-Training",
    titleEs: "Mejorar la comprensión del lenguaje mediante preentrenamiento generativo",
    authors: "Radford, Narasimhan, Salimans y Sutskever",
    org: "OpenAI",
    year: 2018,
    theme: "foundations",
    url: "https://openai.com/index/language-unsupervised/",
    pdf: "https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf",
    why: "GPT-1. Establece el paradigma «preentrenar y luego ajustar» con Transformers autorregresivos.",
    tldr: "Entrena un Transformer decodificador a predecir la siguiente palabra en miles de libros sin etiquetar y luego lo ajusta con pocos datos etiquetados para cada tarea. Un solo modelo preentrenado supera a sistemas diseñados a mano para cada problema.",
    problem:
      "Los datos etiquetados son escasos y caros, pero el texto sin etiquetar es abundante. La pregunta era cómo aprovechar ese texto para que un modelo aprenda conocimiento general del lenguaje que después sirva en tareas concretas como clasificación, preguntas y respuestas o inferencia.",
    ideas: [
      { title: "Preentrenamiento generativo", text: "Primero el modelo aprende a predecir el siguiente token en un corpus grande (BooksCorpus). Esa tarea obliga a capturar gramática, hechos y relaciones de largo alcance sin que nadie etiquete nada." },
      { title: "Ajuste fino supervisado", text: "Después se añade una capa de salida pequeña y se ajusta todo el modelo con los datos etiquetados de cada tarea, conservando la predicción del siguiente token como objetivo auxiliar." },
      { title: "Entradas transformadas, arquitectura fija", text: "En vez de diseñar una red por tarea, se convierten las entradas estructuradas (pares de frases, preguntas con opciones) en una sola secuencia con separadores. Así la misma arquitectura sirve para todo." },
    ],
    results: [
      "Mejoró el estado del arte en 9 de 12 benchmarks de comprensión del lenguaje.",
      "Se observó que el modelo preentrenado ya resolvía algunas tareas sin ajuste (zero-shot), una pista de lo que vendría con GPT-2 y GPT-3.",
    ],
    legacy:
      "Fijó la receta que siguieron GPT-2, GPT-3 y los LLMs actuales: un Transformer decodificador entrenado con predicción del siguiente token sobre texto masivo, que después se adapta. BERT, publicado meses después, llevó la misma idea a un codificador bidireccional.",
    concepts: ["pretraining", "next-token-prediction", "fine-tuning", "decoder", "self-supervised-learning", "foundation-model"],
  },
  {
    slug: "gpt-3",
    n: 3,
    title: "Language Models are Few-Shot Learners",
    titleEs: "Los modelos de lenguaje aprenden con pocos ejemplos",
    authors: "Brown, Mann, Ryder, Subbiah, Kaplan, Dhariwal y otros 25 autores",
    org: "OpenAI",
    year: 2020,
    theme: "foundations",
    ...arxiv("2005.14165"),
    why: "Demuestra que escalar un modelo produce in-context learning: resolver tareas nuevas desde el prompt sin reentrenar. Es el puente directo hacia ChatGPT.",
    tldr: "GPT-3 es un modelo de 175 mil millones de parámetros. Sin ajustar sus pesos, solo leyendo una instrucción y unos cuantos ejemplos en el prompt, resuelve traducción, preguntas, aritmética sencilla y otras tareas, a veces al nivel de modelos ajustados específicamente.",
    problem:
      "El paradigma de GPT-1 y BERT seguía necesitando miles de ejemplos etiquetados por tarea. Las personas, en cambio, aprenden una tarea nueva con una instrucción y un par de ejemplos. ¿Puede un modelo de lenguaje hacer lo mismo si es suficientemente grande?",
    ideas: [
      { title: "Aprendizaje en contexto", text: "La tarea se especifica solo con texto: una descripción y, opcionalmente, ejemplos. El modelo no actualiza sus pesos; «aprende» la tarea dentro de la ventana de contexto." },
      { title: "Zero-, one- y few-shot", text: "El paper evalúa sistemáticamente tres escenarios: sin ejemplos, con uno y con unos pocos (típicamente de 10 a 100). El rendimiento sube con los ejemplos y, sobre todo, con el tamaño del modelo." },
      { title: "La escala como variable", text: "Se entrenan ocho modelos, de 125 millones a 175 mil millones de parámetros. La brecha entre zero-shot y few-shot crece con el tamaño: los modelos grandes aprovechan mucho mejor el contexto." },
      { title: "Límites y riesgos", text: "Los autores documentan dónde falla (inferencia entre frases, algunos problemas de comprensión lectora), el riesgo de contaminación de datos de evaluación y el impacto social de textos difíciles de distinguir de los humanos." },
    ],
    results: [
      "Resultados competitivos en preguntas y respuestas de dominio abierto (TriviaQA) sin ajuste fino.",
      "Aritmética de 2 y 3 dígitos, desordenar palabras y usar palabras inventadas en una frase, solo desde el prompt.",
      "Evaluadores humanos apenas distinguieron noticias generadas por GPT-3 de noticias reales.",
    ],
    legacy:
      "Convirtió el prompt en la interfaz principal de la IA y dio origen al prompt engineering. Sobre GPT-3 se construyeron la API de OpenAI, InstructGPT y, finalmente, ChatGPT.",
    concepts: ["in-context-learning", "few-shot-learning", "zero-shot-learning", "prompt", "llm", "emergent-capabilities", "data-contamination"],
  },

  // ── Leyes de escala ─────────────────────────────────────────────────
  {
    slug: "scaling-laws",
    n: 4,
    title: "Scaling Laws for Neural Language Models",
    titleEs: "Leyes de escala para modelos neuronales de lenguaje",
    authors: "Kaplan, McCandlish, Henighan, Brown, Chess, Child, Gray, Radford, Wu y Amodei",
    org: "OpenAI",
    year: 2020,
    theme: "scaling",
    ...arxiv("2001.08361"),
    why: "Quizá el paper económico más importante de la era LLM: el rendimiento sigue leyes de potencia en parámetros, datos y cómputo.",
    tldr: "La pérdida de un modelo de lenguaje baja de forma muy predecible, siguiendo leyes de potencia, conforme aumentan el número de parámetros (N), los datos (D) y el cómputo (C). Los detalles de arquitectura importan mucho menos que la escala.",
    problem:
      "Entrenar un modelo grande cuesta millones de dólares. Antes de gastar, los laboratorios necesitaban saber cuánto mejorarían con más parámetros, más datos o más cómputo, y cómo repartir un presupuesto fijo entre esas tres cosas.",
    ideas: [
      { title: "Leyes de potencia", text: "Al graficar la pérdida contra N, D o C en escala logarítmica aparecen líneas rectas que se mantienen a lo largo de más de siete órdenes de magnitud. Eso permite extrapolar el rendimiento de modelos que todavía no existen." },
      { title: "La forma importa poco", text: "Con el número de parámetros fijo, cambiar profundidad, ancho o número de cabezas de atención apenas altera la pérdida dentro de rangos amplios. Lo que manda es el tamaño total." },
      { title: "Sobreajuste predecible", text: "Una ecuación sencilla describe cuánto sobreajusta un modelo según la relación entre su tamaño y los datos disponibles, y cuántos datos hacen falta para evitarlo." },
      { title: "Modelos grandes, entrenamiento corto", text: "Los modelos grandes aprenden más por cada ejemplo. Con cómputo fijo, la recomendación del paper era entrenar modelos muy grandes con relativamente pocos datos y detenerse antes de la convergencia." },
    ],
    results: [
      "Tendencias estables de la pérdida en función de N, D y C a lo largo de más de siete órdenes de magnitud.",
      "Una regla para repartir el cómputo que priorizaba aumentar el tamaño del modelo más rápido que los datos (esta parte la corrigió Chinchilla).",
    ],
    legacy:
      "Convirtió el escalamiento en una estrategia de inversión predecible y justificó la carrera por modelos cada vez más grandes, empezando por GPT-3. El concepto de «leyes de escala» se extendió después a imagen, código, razonamiento y cómputo en inferencia.",
    concepts: ["scaling-laws", "compute", "flops", "parameters", "cross-entropy", "overfitting"],
  },
  {
    slug: "chinchilla",
    n: 5,
    title: "Training Compute-Optimal Large Language Models",
    titleEs: "Entrenar modelos de lenguaje grandes con cómputo óptimo",
    authors: "Hoffmann, Borgeaud, Mensch, Buchatskaya, Cai, Rutherford y otros 16 autores",
    org: "DeepMind",
    year: 2022,
    theme: "scaling",
    ...arxiv("2203.15556"),
    why: "Corrige cómo repartir el presupuesto de cómputo: muchos modelos estaban sobredimensionados y subentrenados.",
    tldr: "Con un presupuesto de cómputo fijo, el tamaño del modelo y la cantidad de tokens de entrenamiento deben crecer en la misma proporción. Chinchilla, con 70 mil millones de parámetros y cuatro veces más datos, supera a Gopher (280 mil millones) usando el mismo cómputo.",
    problem:
      "Siguiendo a Kaplan et al., la industria había hecho modelos cada vez más grandes pero entrenados con más o menos la misma cantidad de texto (unos 300 mil millones de tokens). DeepMind se preguntó si ese reparto era realmente el óptimo.",
    ideas: [
      { title: "Tres métodos, una conclusión", text: "Entrenaron más de 400 modelos, de 70 millones a más de 16 mil millones de parámetros, con 5 a 500 mil millones de tokens, y estimaron la frontera óptima de tres formas distintas. Las tres coincidieron." },
      { title: "Escalar parejo", text: "Por cada vez que se duplica el tamaño del modelo, hay que duplicar también los tokens de entrenamiento. En la práctica eso equivale a unos 20 tokens por parámetro." },
      { title: "Los modelos estaban subentrenados", text: "GPT-3, Gopher o Megatron-Turing tenían demasiados parámetros para los datos que habían visto: con el mismo cómputo habría sido mejor un modelo más pequeño entrenado con más texto." },
      { title: "Beneficio doble", text: "Un modelo más pequeño, además de ser mejor, es más barato de ajustar y de servir en inferencia, algo que importa tanto como el costo de entrenarlo." },
    ],
    results: [
      "Chinchilla (70B) supera de forma consistente a Gopher (280B), GPT-3 (175B), Jurassic-1 (178B) y Megatron-Turing NLG (530B).",
      "67.5 % de precisión promedio en MMLU, más de 7 puntos por encima de Gopher.",
    ],
    legacy:
      "Cambió la forma de entrenar: LLaMA y los modelos siguientes priorizaron más datos sobre más parámetros. Con el tiempo, la industria llegó a entrenar «más allá de Chinchilla» (muchos más tokens por parámetro) porque abarata la inferencia, que es donde se gasta la mayor parte del cómputo.",
    concepts: ["scaling-laws", "compute", "parameters", "dataset", "pretraining", "inference"],
  },

  // ── Eficiencia e ingeniería ─────────────────────────────────────────
  {
    slug: "switch-transformers",
    n: 6,
    title: "Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity",
    titleEs: "Switch Transformers: escalar a billones de parámetros con dispersión simple y eficiente",
    authors: "Fedus, Zoph y Shazeer",
    org: "Google Research",
    year: 2021,
    theme: "efficiency",
    ...arxiv("2101.03961"),
    why: "Una de las rutas fundamentales hacia Mixture-of-Experts: muchísimos parámetros sin activarlos todos en cada token.",
    tldr: "En lugar de usar la misma red para cada token, el Switch Transformer tiene muchas redes «expertas» y un router que envía cada token a una sola de ellas. El modelo puede tener un billón de parámetros pero gastar por token el cómputo de uno mucho más pequeño.",
    problem:
      "Los modelos densos usan todos sus parámetros para cada entrada, así que más capacidad significa proporcionalmente más cómputo. Mixture-of-Experts prometía romper esa relación, pero era complejo, inestable y costoso en comunicación entre máquinas.",
    ideas: [
      { title: "Un solo experto por token", text: "Los trabajos previos enviaban cada token a los dos mejores expertos o más. Switch simplifica: el router elige solo uno (top-1). Menos cómputo, menos comunicación y una implementación más sencilla." },
      { title: "Balance de carga", text: "Si el router manda casi todo a unos pocos expertos, los demás quedan ociosos y los populares se saturan. Una pérdida auxiliar penaliza la distribución desigual, y una «capacidad» máxima por experto limita cuántos tokens recibe cada uno." },
      { title: "Estabilidad en baja precisión", text: "Calcular el router en float32 mientras el resto usa bfloat16, inicializar con valores más pequeños y regularizar a los expertos permitió por primera vez entrenar modelos dispersos grandes en baja precisión." },
    ],
    results: [
      "Hasta 7 veces más rápido en preentrenamiento que T5-Base con los mismos recursos de cómputo.",
      "Mejoras sobre mT5-Base en los 101 idiomas evaluados.",
      "Modelos de hasta 1.6 billones de parámetros, con aceleración de 4 veces frente a T5-XXL.",
    ],
    legacy:
      "Mixture-of-Experts es hoy la arquitectura dominante en los modelos de frontera: Mixtral, DeepSeek-V3, Qwen-MoE y, según se reporta, varios modelos cerrados. El dilema entre parámetros totales y parámetros activos que se discute hoy nace aquí.",
    concepts: ["mixture-of-experts", "router", "sparse-model", "dense-model", "parameters", "compute"],
  },
  {
    slug: "deepseek-v3",
    n: 7,
    title: "DeepSeek-V3 Technical Report",
    titleEs: "Reporte técnico de DeepSeek-V3",
    authors: "DeepSeek-AI",
    org: "DeepSeek",
    year: 2024,
    theme: "efficiency",
    ...arxiv("2412.19437"),
    why: "Manual moderno de ingeniería de frontera: MoE, MLA, routing, predicción multi-token, FP8 y entrenamiento distribuido eficiente.",
    tldr: "DeepSeek-V3 es un modelo MoE de 671 mil millones de parámetros que activa solo 37 mil millones por token. Alcanza un nivel comparable al de los mejores modelos cerrados con unos 2.8 millones de horas de GPU H800, muy por debajo de lo que se asumía necesario.",
    problem:
      "Entrenar modelos de frontera parecía exigir presupuestos solo al alcance de unos pocos laboratorios. DeepSeek, con acceso a GPUs limitadas por restricciones de exportación, tuvo que optimizar cada capa: arquitectura, precisión numérica, comunicación y paralelismo.",
    ideas: [
      { title: "Multi-head Latent Attention (MLA)", text: "Comprime las claves y valores de la atención en un vector latente pequeño. La KV cache ocupa mucho menos memoria, lo que abarata servir contextos largos." },
      { title: "DeepSeekMoE sin pérdida auxiliar", text: "Usa muchos expertos pequeños más algunos expertos compartidos que siempre se activan. El balance de carga se logra ajustando un sesgo por experto en el router, sin la pérdida auxiliar que suele empeorar la calidad." },
      { title: "Predicción de varios tokens", text: "Además del siguiente token, el modelo aprende a predecir los siguientes en cadena. Eso densifica la señal de entrenamiento y los módulos extra pueden reutilizarse para decodificación especulativa." },
      { title: "Entrenamiento en FP8", text: "La mayor parte de las multiplicaciones se hace en precisión de 8 bits, con escalado fino por bloques para no perder exactitud. Reduce memoria y acelera el cómputo." },
      { title: "Ingeniería de sistemas", text: "El algoritmo DualPipe solapa cómputo y comunicación entre GPUs, y kernels a medida aprovechan al máximo la red entre nodos. El entrenamiento completo no tuvo picos de pérdida irrecuperables ni retrocesos." },
    ],
    results: [
      "671B de parámetros totales, 37B activos por token, preentrenado con 14.8 billones de tokens.",
      "Supera a los demás modelos abiertos de su momento y se acerca a los mejores cerrados en conocimiento, código y matemáticas.",
      "Costo total reportado de 2.788 millones de horas de GPU H800.",
    ],
    legacy:
      "Demostró que la eficiencia de ingeniería puede sustituir en parte a la fuerza bruta. Fue la base de DeepSeek-R1 y popularizó técnicas (MLA, FP8, MoE de grano fino) que muchos laboratorios adoptaron después.",
    concepts: ["mixture-of-experts", "router", "kv-cache", "quantization", "open-weights-model", "speculative-decoding", "cluster"],
  },
  {
    slug: "flashattention",
    n: 8,
    title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness",
    titleEs: "FlashAttention: atención exacta, rápida y eficiente en memoria, consciente de la E/S",
    authors: "Dao, Fu, Ermon, Rudra y Ré",
    org: "Stanford University · University at Buffalo",
    year: 2022,
    theme: "efficiency",
    ...arxiv("2205.14135"),
    why: "Enseña que el cuello de botella no son solo los FLOPs: importan la HBM, la SRAM y el ancho de banda de memoria.",
    tldr: "FlashAttention calcula exactamente la misma atención que el Transformer original, pero reorganiza el cálculo en bloques para no escribir nunca la enorme matriz de atención en la memoria lenta de la GPU. Resultado: más velocidad, mucho menos memoria y contextos más largos.",
    problem:
      "La atención crece de forma cuadrática con la longitud de la secuencia. Muchas propuestas aproximaban la atención para ahorrar operaciones, pero en la práctica no eran más rápidas: el tiempo se iba en mover datos entre la memoria grande y lenta (HBM) y la memoria pequeña y rápida dentro del chip (SRAM).",
    ideas: [
      { title: "Pensar en la E/S", text: "El costo real de un algoritmo en GPU depende de cuántas veces lee y escribe en HBM, no solo de cuántas operaciones hace. La atención estándar escribe y vuelve a leer una matriz de tamaño N×N varias veces." },
      { title: "Tiling", text: "Se parten Q, K y V en bloques que caben en SRAM y se procesan uno por uno, acumulando el resultado. La matriz completa de atención nunca se materializa en HBM." },
      { title: "Softmax en línea", text: "Un truco numérico permite calcular el softmax por bloques, llevando el máximo y la suma acumulados, y corregir el resultado al llegar cada bloque nuevo." },
      { title: "Recalcular en vez de guardar", text: "En la retropropagación, en lugar de guardar la matriz de atención, se recalcula por bloques. Se hacen más operaciones pero se leen muchos menos bytes, y el resultado es más rápido." },
    ],
    results: [
      "15 % más rápido de extremo a extremo en BERT-large que el récord de MLPerf 1.1; 3 veces más rápido en GPT-2.",
      "Memoria lineal, en lugar de cuadrática, respecto a la longitud de la secuencia.",
      "Primeros Transformers en superar el azar en Path-X (16 mil tokens) y Path-256 (64 mil tokens).",
    ],
    legacy:
      "FlashAttention y sus versiones 2 y 3 están integradas en PyTorch y en casi todos los motores de entrenamiento e inferencia. Son una razón directa de que hoy existan ventanas de contexto de cientos de miles de tokens.",
    concepts: ["attention", "gpu", "vram", "context-window", "inference-optimization", "cuda", "flops"],
  },
  {
    slug: "lora",
    n: 9,
    title: "LoRA: Low-Rank Adaptation of Large Language Models",
    titleEs: "LoRA: adaptación de bajo rango de modelos de lenguaje grandes",
    authors: "Hu, Shen, Wallis, Allen-Zhu, Li, Wang, Wang y Chen",
    org: "Microsoft",
    year: 2021,
    theme: "efficiency",
    ...arxiv("2106.09685"),
    why: "Base del ajuste fino eficiente en parámetros: adaptar modelos gigantes entrenando una fracción minúscula de parámetros.",
    tldr: "En lugar de reentrenar todos los pesos, LoRA congela el modelo y aprende, en cada capa, una pequeña corrección expresada como el producto de dos matrices delgadas. Se entrena hasta 10 000 veces menos parámetros con una calidad similar al ajuste fino completo.",
    problem:
      "Ajustar un modelo de 175 mil millones de parámetros para cada tarea implica guardar y servir una copia completa por tarea, algo impagable. Los métodos ligeros existentes añadían latencia en inferencia (adaptadores) o reducían el contexto útil (prefix tuning).",
    ideas: [
      { title: "El cambio es de bajo rango", text: "La hipótesis: la diferencia entre los pesos originales y los ajustados tiene una estructura simple. Una matriz grande de actualización puede aproximarse con dos matrices pequeñas, B·A, de rango r muy bajo (por ejemplo, 4 u 8)." },
      { title: "Pesos congelados", text: "Solo se entrenan A y B. Los pesos originales no cambian, así que no hace falta guardar sus gradientes ni estados del optimizador, lo que reduce drásticamente la memoria." },
      { title: "Sin latencia extra", text: "Al terminar, la corrección B·A se suma a los pesos originales. El modelo resultante tiene exactamente el mismo tamaño y velocidad que el original." },
      { title: "Intercambiable", text: "Un solo modelo base puede servir muchas tareas cargando distintos «parches» LoRA de unos pocos megabytes." },
    ],
    results: [
      "En GPT-3 175B: 10 000 veces menos parámetros entrenables y 3 veces menos memoria de GPU que el ajuste fino completo.",
      "Calidad igual o mejor que el ajuste completo en RoBERTa, DeBERTa, GPT-2 y GPT-3.",
    ],
    legacy:
      "LoRA y variantes como QLoRA son el estándar para personalizar modelos abiertos en una sola GPU, y también el formato con el que la comunidad comparte estilos para modelos de imagen como Stable Diffusion.",
    concepts: ["lora", "qlora", "peft", "fine-tuning", "matrix", "vram"],
  },

  // ── Alineación ──────────────────────────────────────────────────────
  {
    slug: "instructgpt",
    n: 10,
    title: "Training Language Models to Follow Instructions with Human Feedback",
    titleEs: "Entrenar modelos de lenguaje para seguir instrucciones con retroalimentación humana",
    authors: "Ouyang, Wu, Jiang, Almeida, Wainwright, Mishkin y otros 14 autores",
    org: "OpenAI",
    year: 2022,
    theme: "alignment",
    ...arxiv("2203.02155"),
    why: "El paper para entender SFT, modelos de recompensa y RLHF con PPO, y por qué un LLM preentrenado se transforma en un asistente.",
    tldr: "InstructGPT ajusta GPT-3 en tres pasos: ejemplos escritos por personas, un modelo de recompensa entrenado con comparaciones humanas y aprendizaje por refuerzo. El resultado sigue instrucciones mucho mejor: un modelo de 1.3 mil millones de parámetros se prefiere sobre GPT-3 de 175 mil millones.",
    problem:
      "Un modelo preentrenado solo completa texto de forma plausible. No distingue entre lo que el usuario quiere y lo que suele aparecer en internet, así que puede inventar, ser tóxico o simplemente no ayudar. Hacerlo más grande no resuelve eso: está desalineado con la intención del usuario.",
    ideas: [
      { title: "Paso 1: ajuste supervisado (SFT)", text: "Un equipo de etiquetadores escribe respuestas ideales a prompts reales de la API. GPT-3 se ajusta con esas demostraciones." },
      { title: "Paso 2: modelo de recompensa", text: "Para cada prompt se generan varias respuestas y las personas las ordenan de mejor a peor. Con esos rankings se entrena un modelo que predice qué respuesta preferiría un humano." },
      { title: "Paso 3: refuerzo con PPO", text: "El modelo se optimiza con aprendizaje por refuerzo para maximizar esa recompensa, con una penalización (KL) que impide alejarse demasiado del modelo supervisado y «hackear» la recompensa." },
      { title: "Costo de alineación", text: "El ajuste empeoraba un poco algunos benchmarks públicos. Mezclar gradientes de preentrenamiento durante el refuerzo (PPO-ptx) redujo esa regresión casi por completo." },
    ],
    results: [
      "Las respuestas de InstructGPT 1.3B se prefieren sobre las de GPT-3 175B, un modelo 100 veces más grande.",
      "Mejoras en veracidad y menos texto tóxico, con regresiones mínimas en tareas públicas.",
      "Sigue cometiendo errores simples y obedece instrucciones dañinas si se le piden.",
    ],
    legacy:
      "Es la receta que, meses después, se usó para crear ChatGPT. SFT seguido de RLHF se volvió el proceso estándar para convertir un modelo base en un asistente.",
    concepts: ["rlhf", "supervised-fine-tuning", "reward-model", "preference-data", "alignment", "instruction-tuning", "reinforcement-learning"],
  },
  {
    slug: "constitutional-ai",
    n: 11,
    title: "Constitutional AI: Harmlessness from AI Feedback",
    titleEs: "IA constitucional: inocuidad a partir de retroalimentación de IA",
    authors: "Bai, Kadavath, Kundu, Askell, Kernion, Jones y otros 45 autores",
    org: "Anthropic",
    year: 2022,
    theme: "alignment",
    ...arxiv("2212.08073"),
    why: "Introduce RLAIF: principios escritos (una «constitución») y modelos supervisando modelos. Clave para entender Claude y la alineación escalable.",
    tldr: "En lugar de pedir a personas que etiqueten miles de respuestas dañinas, se le da al modelo una lista de principios y se le enseña a criticarse y corregirse a sí mismo. Después, el propio modelo decide cuál respuesta es mejor y esas preferencias guían el aprendizaje por refuerzo.",
    problem:
      "Etiquetar contenido dañino es caro, lento y desgastante para las personas. Además, los asistentes entrenados para ser inofensivos tendían a volverse evasivos: se negaban a responder sin explicar por qué. Y a medida que los modelos mejoran, será cada vez más difícil que las personas supervisen todo directamente.",
    ideas: [
      { title: "Una constitución", text: "La única supervisión humana es una lista breve de principios en lenguaje natural (por ejemplo, elegir la respuesta menos dañina y más honesta). Eso hace explícitos y auditables los valores del modelo." },
      { title: "Fase supervisada: criticar y revisar", text: "El modelo responde a prompts difíciles, luego critica su propia respuesta según un principio elegido al azar y la reescribe. Se ajusta el modelo con las versiones revisadas." },
      { title: "Fase de refuerzo: RLAIF", text: "El modelo compara pares de respuestas y dice cuál cumple mejor la constitución. Con esas preferencias generadas por IA se entrena un modelo de preferencias que sirve como recompensa." },
      { title: "Inofensivo pero no evasivo", text: "El objetivo no es negarse más, sino responder con transparencia: explicar por qué algo es problemático. El razonamiento paso a paso durante la evaluación mejora la calidad y hace visibles las decisiones." },
    ],
    results: [
      "Un asistente más inofensivo y menos evasivo que uno entrenado con RLHF usando etiquetas humanas de daño.",
      "Resultados logrados sin ninguna etiqueta humana que identifique respuestas dañinas.",
    ],
    legacy:
      "Es parte central de cómo se entrena Claude y popularizó el RLAIF, hoy usado ampliamente para generar datos de preferencia a escala. También abrió la discusión sobre qué principios deben guiar a un modelo y quién los decide.",
    concepts: ["constitutional-ai", "rlaif", "rlhf", "alignment", "ai-safety", "reward-model", "chain-of-thought"],
  },
  {
    slug: "dpo",
    n: 12,
    title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model",
    titleEs: "Optimización directa de preferencias: tu modelo de lenguaje es, en secreto, un modelo de recompensa",
    authors: "Rafailov, Sharma, Mitchell, Ermon, Manning y Finn",
    org: "Stanford University",
    year: 2023,
    theme: "alignment",
    ...arxiv("2305.18290"),
    why: "Replantea la alineación con preferencias evitando buena parte de la complejidad de PPO y RLHF, con una función objetivo muy elegante.",
    tldr: "DPO demuestra que el problema que resuelve RLHF puede resolverse directamente, sin entrenar un modelo de recompensa aparte y sin aprendizaje por refuerzo: basta una pérdida de clasificación sobre pares de respuestas (la preferida y la rechazada).",
    problem:
      "RLHF funciona, pero es complicado: hay que entrenar un modelo de recompensa, generar muestras durante el entrenamiento, mantener varios modelos en memoria y ajustar muchos hiperparámetros de PPO, que es inestable.",
    ideas: [
      { title: "Solución cerrada", text: "El objetivo de RLHF (maximizar la recompensa sin alejarse del modelo de referencia) tiene una solución óptima conocida. Los autores despejan la recompensa en función de esa política óptima." },
      { title: "El modelo es la recompensa", text: "Así, la recompensa implícita de una respuesta es el logaritmo de cuánto más probable la hace el modelo ajustado frente al de referencia. No hace falta un modelo de recompensa separado." },
      { title: "Una pérdida sencilla", text: "Sustituyendo eso en el modelo de preferencias de Bradley-Terry queda una pérdida tipo regresión logística: subir la probabilidad relativa de la respuesta preferida y bajar la de la rechazada, con un parámetro β que controla cuánto puede alejarse del original." },
    ],
    results: [
      "Controla el sentimiento de las generaciones mejor que PPO.",
      "Iguala o mejora a RLHF en resumen y diálogo de un turno.",
      "Mucho más simple de implementar, estable y barato: no requiere muestrear del modelo durante el entrenamiento.",
    ],
    legacy:
      "DPO y sus variantes (IPO, KTO, ORPO, SimPO) se adoptaron rápidamente, sobre todo en modelos abiertos como Zephyr, Tulu o Llama 3, porque permiten alinear con recursos modestos.",
    concepts: ["dpo", "rlhf", "preference-data", "reward-model", "alignment", "loss-function"],
  },

  // ── Razonamiento ────────────────────────────────────────────────────
  {
    slug: "chain-of-thought",
    n: 13,
    title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
    titleEs: "La cadena de pensamiento en el prompt provoca razonamiento en modelos de lenguaje grandes",
    authors: "Wei, Wang, Schuurmans, Bosma, Ichter, Xia, Chi, Le y Zhou",
    org: "Google Research · Brain Team",
    year: 2022,
    theme: "reasoning",
    ...arxiv("2201.11903"),
    why: "Demuestra que generar pasos intermedios mejora mucho el razonamiento. Es el precursor intelectual de los modelos de razonamiento actuales.",
    tldr: "Si en los ejemplos del prompt se muestran respuestas que razonan paso a paso, el modelo imita ese estilo y resuelve mucho mejor problemas de matemáticas, sentido común y lógica simbólica. El efecto solo aparece en modelos suficientemente grandes.",
    problem:
      "Escalar los modelos mejoraba casi todo, pero no las tareas de varios pasos, como los problemas matemáticos con enunciado. Pedir la respuesta directa obligaba al modelo a «saltar» a la conclusión sin espacio para calcular.",
    ideas: [
      { title: "Mostrar el razonamiento", text: "En lugar de ejemplos pregunta → respuesta, el prompt incluye pregunta → pasos intermedios → respuesta. Bastan unos ocho ejemplos escritos a mano." },
      { title: "Cómputo proporcional al problema", text: "Generar pasos intermedios le da al modelo más tokens (y por lo tanto más cómputo) para los problemas que lo necesitan, y descompone un problema difícil en varios fáciles." },
      { title: "Una capacidad emergente", text: "En modelos pequeños la cadena de pensamiento no ayuda o incluso empeora los resultados. La ganancia aparece a partir de unos 100 mil millones de parámetros." },
      { title: "Interpretable", text: "Los pasos permiten ver cómo llegó el modelo a su respuesta y en qué se equivocó, aunque no garantizan que ese texto refleje fielmente su cálculo interno." },
    ],
    results: [
      "PaLM 540B con ocho ejemplos de cadena de pensamiento logró el estado del arte en GSM8K, superando a GPT-3 ajustado con un verificador.",
      "Mejoras en aritmética, sentido común (StrategyQA) y tareas simbólicas, incluida la generalización a problemas más largos que los ejemplos.",
    ],
    legacy:
      "Dio origen a «pensemos paso a paso», a la autoconsistencia, a Tree of Thoughts y, sobre todo, a los modelos de razonamiento como o1 y DeepSeek-R1, que se entrenan para producir cadenas de pensamiento largas por sí solos.",
    concepts: ["chain-of-thought", "few-shot-learning", "prompt-engineering", "reasoning-model", "emergent-capabilities"],
  },
  {
    slug: "lets-verify-step-by-step",
    n: 14,
    title: "Let's Verify Step by Step",
    titleEs: "Verifiquemos paso a paso",
    authors: "Lightman, Kosaraju, Burda, Edwards, Baker, Lee, Leike, Schulman, Sutskever y Cobbe",
    org: "OpenAI",
    year: 2023,
    theme: "reasoning",
    ...arxiv("2305.20050"),
    why: "Compara supervisar solo el resultado contra supervisar cada paso, y muestra el valor de los Process Reward Models.",
    tldr: "Para entrenar un verificador de soluciones matemáticas, es mucho mejor que las personas califiquen cada paso del razonamiento (supervisión del proceso) que solo si la respuesta final es correcta (supervisión del resultado). El verificador por pasos elige soluciones correctas el 78 % de las veces en MATH.",
    problem:
      "Los modelos cometen errores lógicos a mitad de un razonamiento. Un verificador entrenado solo con el resultado final no sabe dónde está el error y puede premiar soluciones que aciertan por casualidad con pasos incorrectos.",
    ideas: [
      { title: "Resultado contra proceso", text: "Un Outcome Reward Model aprende de si la respuesta final es correcta. Un Process Reward Model (PRM) aprende de etiquetas humanas en cada paso: positivo, negativo o neutral." },
      { title: "Buscar con el verificador", text: "El generador produce muchas soluciones y el PRM elige la mejor, puntuando la solución como la probabilidad de que todos sus pasos sean correctos." },
      { title: "Aprendizaje activo", text: "En lugar de etiquetar soluciones al azar, se priorizan las que engañan al verificador actual: respuestas convincentes pero incorrectas. Eso hace la anotación mucho más eficiente." },
      { title: "Alineación como beneficio", text: "Supervisar el proceso recompensa razonamientos que las personas pueden seguir y aprobar, no solo resultados. Los autores lo presentan como una rara ventaja de alineación sin costo de rendimiento." },
    ],
    results: [
      "El modelo con supervisión de proceso resuelve 78 % de un subconjunto representativo del benchmark MATH.",
      "La ventaja sobre la supervisión de resultado crece conforme se consideran más soluciones candidatas.",
      "Publicación de PRM800K: 800 000 etiquetas humanas a nivel de paso.",
    ],
    legacy:
      "Los Process Reward Models y la verificación por pasos se volvieron pieza central de la investigación sobre razonamiento y de las estrategias de cómputo en inferencia, como la que estudia Snell et al.",
    concepts: ["reward-model", "chain-of-thought", "reasoning-model", "human-evaluation", "test-time-compute"],
  },
  {
    slug: "test-time-compute",
    n: 15,
    title: "Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters",
    titleEs: "Escalar de forma óptima el cómputo en inferencia puede ser más efectivo que escalar los parámetros",
    authors: "Snell, Lee, Xu y Kumar",
    org: "UC Berkeley · Google DeepMind",
    year: 2024,
    theme: "reasoning",
    ...arxiv("2408.03314"),
    why: "Un cambio conceptual enorme: la inteligencia no solo escala en el entrenamiento; también puedes gastar más cómputo al responder.",
    tldr: "Si se permite que un modelo «piense más» al responder, ya sea generando y verificando muchas soluciones o revisando la suya, puede superar a un modelo 14 veces más grande. La clave es ajustar cuánto y cómo se gasta ese cómputo según la dificultad de cada pregunta.",
    problem:
      "Hasta entonces, la forma principal de mejorar era entrenar modelos más grandes. Pero una persona dedica más tiempo a los problemas difíciles. ¿Cuánto puede mejorar un modelo fijo si se le da más cómputo en el momento de la inferencia, y cuándo conviene eso más que un modelo más grande?",
    ideas: [
      { title: "Dos palancas", text: "Buscar: generar muchas soluciones y elegir con un verificador por pasos (best-of-N, beam search, lookahead). Revisar: que el modelo corrija iterativamente su propia respuesta." },
      { title: "Depende de la dificultad", text: "En preguntas fáciles conviene revisar secuencialmente la respuesta; en las difíciles, explorar en paralelo muchas alternativas. Ninguna estrategia gana siempre." },
      { title: "Estrategia óptima por prompt", text: "Estimando la dificultad de cada pregunta y eligiendo la estrategia en consecuencia, se obtiene el mismo rendimiento con unas 4 veces menos cómputo que best-of-N." },
      { title: "Intercambio con el preentrenamiento", text: "Con los mismos FLOPs totales, en problemas de dificultad baja o media sale más a cuenta un modelo pequeño que piensa más; en los más difíciles sigue ganando el preentrenamiento." },
    ],
    results: [
      "Más de 4 veces de mejora en eficiencia frente a best-of-N con la estrategia óptima por prompt.",
      "Con FLOPs equivalentes, un modelo pequeño con más cómputo en inferencia supera a uno 14 veces más grande en problemas donde el pequeño ya tiene cierto éxito.",
    ],
    legacy:
      "Dio fundamento empírico a la nueva ley de escala en inferencia que popularizaron o1, DeepSeek-R1 y los demás modelos de razonamiento: el presupuesto de «pensamiento» es ahora una perilla más, junto al tamaño del modelo.",
    concepts: ["test-time-compute", "scaling-laws", "reasoning-model", "reward-model", "inference", "compute"],
  },
  {
    slug: "deepseek-r1",
    n: 16,
    title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning",
    titleEs: "DeepSeek-R1: incentivar la capacidad de razonamiento en LLMs mediante aprendizaje por refuerzo",
    authors: "DeepSeek-AI",
    org: "DeepSeek",
    year: 2025,
    theme: "reasoning",
    ...arxiv("2501.12948"),
    url: "https://doi.org/10.1038/s41586-025-09422-z",
    why: "Imprescindible de la era del razonamiento: aprendizaje por refuerzo con recompensas verificables produce razonamiento sin depender solo de ejemplos humanos.",
    tldr: "Aplicando aprendizaje por refuerzo puro a DeepSeek-V3, recompensando solo que la respuesta final sea correcta y verificable, el modelo aprende por sí mismo a razonar largo, verificar y corregirse. El resultado, DeepSeek-R1, compite con los mejores modelos de razonamiento y se publicó con pesos abiertos.",
    problem:
      "Los modelos de razonamiento dependían de grandes cantidades de cadenas de pensamiento escritas o curadas por personas, caras de producir y limitadas por la forma de pensar humana. OpenAI había mostrado con o1 que era posible, pero no cómo.",
    ideas: [
      { title: "R1-Zero: refuerzo sin ejemplos", text: "Se parte del modelo base y se aplica RL directamente, sin ajuste supervisado previo. La recompensa es simple y verificable: ¿la respuesta matemática es correcta?, ¿el código pasa las pruebas?, ¿se respetó el formato?" },
      { title: "GRPO", text: "Un algoritmo de refuerzo que, en lugar de un modelo crítico, compara varias respuestas al mismo prompt entre sí y usa su puntaje relativo como ventaja. Ahorra memoria y cómputo frente a PPO." },
      { title: "Comportamientos emergentes", text: "Durante el entrenamiento las respuestas se alargan solas y aparecen la autoverificación, la reflexión («espera, revisemos esto») y el cambio de estrategia, sin que nadie los enseñe." },
      { title: "De R1-Zero a R1", text: "R1-Zero razonaba bien pero mezclaba idiomas y era poco legible. R1 añade un pequeño arranque supervisado, varias rondas de RL y ajuste, y alineación general para ser un asistente utilizable." },
      { title: "Destilación", text: "Las trazas de razonamiento de R1 se usan para ajustar modelos pequeños (Qwen y Llama de 1.5 a 70 mil millones de parámetros), que heredan buena parte de la capacidad." },
    ],
    results: [
      "Rendimiento comparable a OpenAI o1 en matemáticas (AIME, MATH-500), programación competitiva y ciencias.",
      "Los modelos destilados pequeños superan a modelos abiertos mucho más grandes en razonamiento.",
      "Pesos abiertos bajo licencia MIT; versión revisada por pares publicada en Nature en 2025.",
    ],
    legacy:
      "Abrió la receta del razonamiento con refuerzo y recompensas verificables, que desde entonces replican laboratorios y proyectos abiertos. Consolidó GRPO y la destilación de razonamiento como herramientas estándar.",
    concepts: ["reasoning-model", "reinforcement-learning", "reward-function", "chain-of-thought", "distillation", "open-weights-model", "test-time-compute"],
  },

  // ── RAG y agentes ───────────────────────────────────────────────────
  {
    slug: "rag",
    n: 17,
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    titleEs: "Generación aumentada por recuperación para tareas de PLN intensivas en conocimiento",
    authors: "Lewis, Perez, Piktus, Petroni, Karpukhin, Goyal y otros 6 autores",
    org: "Facebook AI Research · University College London · NYU",
    year: 2020,
    theme: "systems",
    ...arxiv("2005.11401"),
    why: "Origen conceptual del RAG moderno: separar el conocimiento guardado en los parámetros del conocimiento externo recuperable.",
    tldr: "RAG combina un generador de texto con un buscador: antes de responder, el sistema recupera pasajes relevantes de Wikipedia y genera la respuesta condicionada a ellos. Así responde con más precisión, puede citar su fuente y actualizar su conocimiento sin reentrenar.",
    problem:
      "Los modelos preentrenados guardan conocimiento en sus pesos, pero no pueden consultarlo con precisión, inventan hechos, no dicen de dónde sale lo que afirman y quedan desactualizados. Reentrenar para cada cambio no es viable.",
    ideas: [
      { title: "Dos memorias", text: "La memoria paramétrica es lo que el modelo aprendió en sus pesos. La memoria no paramétrica es un índice externo (21 millones de pasajes de Wikipedia) que se puede leer, auditar y reemplazar." },
      { title: "Recuperador denso", text: "Un codificador (DPR) convierte la pregunta y los pasajes en vectores; se recuperan los más cercanos con búsqueda de vecinos aproximados. El codificador de preguntas se ajusta junto con el generador." },
      { title: "RAG-Sequence y RAG-Token", text: "En la primera variante toda la respuesta se basa en los mismos documentos; en la segunda, cada token puede apoyarse en un documento distinto, lo que permite combinar información de varias fuentes." },
      { title: "Conocimiento intercambiable", text: "Cambiar el índice de Wikipedia por uno más reciente actualiza lo que el modelo «sabe», sin tocar sus pesos." },
    ],
    results: [
      "Estado del arte en tres benchmarks de preguntas de dominio abierto (Natural Questions, WebQuestions, CuratedTrec).",
      "Respuestas más específicas, diversas y factuales que un modelo solo paramétrico del mismo tipo (BART).",
    ],
    legacy:
      "El término y la idea se convirtieron en la arquitectura base de los productos empresariales con IA: buscadores conversacionales, asistentes sobre documentos internos y chatbots de soporte. Hoy suele implementarse con un LLM, una base de datos vectorial y búsqueda híbrida.",
    concepts: ["rag", "retrieval", "retriever", "vector-database", "embedding-model", "approximate-nearest-neighbor", "grounding", "hallucination"],
  },
  {
    slug: "react",
    n: 18,
    title: "ReAct: Synergizing Reasoning and Acting in Language Models",
    titleEs: "ReAct: sinergia entre razonar y actuar en modelos de lenguaje",
    authors: "Yao, Zhao, Yu, Du, Shafran, Narasimhan y Cao",
    org: "Princeton University · Google Research",
    year: 2022,
    theme: "systems",
    ...arxiv("2210.03629"),
    why: "Probablemente el paper más importante para entender agentes: razonar → actuar → observar → razonar. Es prácticamente el loop de los agentes modernos.",
    tldr: "ReAct hace que el modelo alterne pensamientos en lenguaje natural con acciones concretas (buscar en Wikipedia, hacer clic, comprar) y observaciones del resultado. Razonar ayuda a planear las acciones y actuar trae información real que corrige el razonamiento.",
    problem:
      "La cadena de pensamiento razona, pero solo con lo que el modelo ya sabe, así que alucina y arrastra errores. Los modelos que generan acciones interactúan con el mundo, pero sin razonar sobre sus objetivos ni sobre lo que observan. Se estudiaban por separado.",
    ideas: [
      { title: "Pensar, actuar, observar", text: "El modelo produce una traza intercalada: Pensamiento (qué necesito y por qué), Acción (una llamada a una herramienta) y Observación (lo que devuelve el entorno). El ciclo se repite hasta terminar." },
      { title: "El pensamiento guía la acción", text: "Los pensamientos sirven para descomponer la meta, seguir el avance, extraer datos de lo observado y manejar excepciones cuando algo no sale como se esperaba." },
      { title: "La acción ancla el pensamiento", text: "Consultar una fuente externa reemplaza la memoria del modelo por información verificable, lo que reduce alucinaciones y la propagación de errores." },
      { title: "Solo con prompts", text: "Basta con uno o dos ejemplos de trayectorias en el prompt; no se necesita entrenamiento. Además, las trazas son legibles, así que una persona puede inspeccionarlas y corregirlas." },
    ],
    results: [
      "En HotpotQA y FEVER, con una simple API de Wikipedia, supera los problemas de alucinación de la cadena de pensamiento pura; combinado con ella, logra los mejores resultados.",
      "En ALFWorld y WebShop supera a métodos de imitación y de aprendizaje por refuerzo por 34 y 10 puntos absolutos de tasa de éxito.",
    ],
    legacy:
      "El patrón ReAct es la base de LangChain, de los frameworks de agentes y del uso de herramientas (tool calling) en los asistentes actuales. Cuando un agente «piensa», llama a una herramienta y lee el resultado, está ejecutando este loop.",
    concepts: ["react-pattern", "ai-agent", "tool-calling", "chain-of-thought", "hallucination", "planning", "agentic-workflow"],
  },

  // ── Imagen y multimodalidad ─────────────────────────────────────────
  {
    slug: "clip",
    n: 19,
    title: "Learning Transferable Visual Models From Natural Language Supervision",
    titleEs: "Aprender modelos visuales transferibles a partir de supervisión en lenguaje natural",
    authors: "Radford, Kim, Hallacy, Ramesh, Goh, Agarwal y otros 6 autores",
    org: "OpenAI",
    year: 2021,
    theme: "multimodal",
    ...arxiv("2103.00020"),
    why: "Explica cómo conectar representaciones de imagen y texto mediante aprendizaje contrastivo. Piedra angular de la multimodalidad moderna.",
    tldr: "CLIP aprende de 400 millones de pares imagen-texto de internet con una tarea simple: adivinar qué descripción corresponde a qué imagen. El resultado es un espacio compartido donde imágenes y textos similares quedan cerca, y un clasificador que reconoce categorías nuevas solo con nombrarlas.",
    problem:
      "Los sistemas de visión se entrenaban para reconocer una lista fija de categorías etiquetadas a mano (como las 1000 de ImageNet). Para cualquier concepto nuevo hacían falta más datos etiquetados, lo que limitaba su generalidad.",
    ideas: [
      { title: "Dos codificadores", text: "Un codificador de imagen (ResNet o Vision Transformer) y uno de texto (Transformer) convierten cada imagen y cada descripción en un vector del mismo espacio." },
      { title: "Aprendizaje contrastivo", text: "En cada lote de N pares, el modelo maximiza la similitud coseno de los N pares correctos y minimiza la de los N² − N incorrectos. Es mucho más eficiente que intentar generar la descripción palabra por palabra." },
      { title: "Clasificación zero-shot", text: "Para clasificar, se convierten los nombres de las clases en frases («una foto de un perro») y se elige la más cercana a la imagen. No hace falta ningún ejemplo de entrenamiento de esa tarea." },
      { title: "Robustez", text: "Como aprende de datos muy variados, CLIP resiste mejor los cambios de distribución (dibujos, bocetos, imágenes adversarias) que los modelos entrenados solo con ImageNet." },
    ],
    results: [
      "Iguala la precisión del ResNet-50 original en ImageNet sin usar ninguno de sus 1.28 millones de ejemplos de entrenamiento.",
      "Transferencia no trivial en más de 30 conjuntos de datos: OCR, reconocimiento de acciones, geolocalización y clasificación fina.",
      "Código y pesos publicados.",
    ],
    legacy:
      "CLIP es el puente entre texto e imagen en DALL·E 2, Stable Diffusion (su codificador de texto), la búsqueda de imágenes por texto y muchos modelos multimodales de visión y lenguaje.",
    concepts: ["multimodal-model", "embedding-space", "embeddings", "cosine-similarity", "zero-shot-learning", "vision-transformer", "image-classification", "self-supervised-learning"],
  },
  {
    slug: "latent-diffusion",
    n: 20,
    title: "High-Resolution Image Synthesis with Latent Diffusion Models",
    titleEs: "Síntesis de imágenes de alta resolución con modelos de difusión latente",
    authors: "Rombach, Blattmann, Lorenz, Esser y Ommer",
    org: "LMU Múnich · IWR Heidelberg · Runway",
    year: 2022,
    theme: "multimodal",
    ...arxiv("2112.10752"),
    why: "Fundamento de Stable Diffusion y de gran parte de la revolución texto-a-imagen: hacer la difusión en un espacio latente en lugar de en píxeles.",
    tldr: "En vez de aplicar difusión directamente sobre millones de píxeles, primero se comprime la imagen con un autoencoder a una representación latente mucho más pequeña y la difusión se hace ahí. Con capas de atención cruzada, el modelo se puede guiar con texto. Así nació Stable Diffusion.",
    problem:
      "Los modelos de difusión generaban imágenes excelentes, pero trabajando en el espacio de píxeles: entrenarlos costaba cientos de días de GPU y generar cada imagen era lento, porque requiere muchos pasos secuenciales sobre la imagen completa.",
    ideas: [
      { title: "Dos etapas", text: "Primero un autoencoder aprende a comprimir imágenes a un espacio latente (por ejemplo, 8 veces más pequeño por lado) conservando los detalles perceptualmente importantes. Luego el modelo de difusión aprende a generar en ese espacio." },
      { title: "Separar percepción y semántica", text: "El autoencoder se encarga de los detalles finos de textura; la difusión se concentra en la composición y el significado. Así se gasta el cómputo donde importa." },
      { title: "Atención cruzada para condicionar", text: "La U-Net que elimina el ruido incorpora capas de atención cruzada que la conectan con un codificador del condicionamiento: texto, mapas semánticos o cajas delimitadoras." },
      { title: "Alta resolución por convolución", text: "Como el modelo es convolucional en el espacio latente, puede aplicarse a imágenes más grandes que las de entrenamiento, por ejemplo para superresolución o paisajes panorámicos." },
    ],
    results: [
      "Nuevo estado del arte en inpainting (rellenar regiones de una imagen).",
      "Resultados muy competitivos en generación incondicional, síntesis desde mapas semánticos, superresolución y texto-a-imagen.",
      "Requisitos de cómputo mucho menores que los modelos de difusión en píxeles.",
    ],
    legacy:
      "Con este método, Stability AI, Runway y LMU publicaron Stable Diffusion en 2022 con pesos abiertos, lo que desató el ecosistema de generación de imágenes: LoRAs, ControlNet, interfaces comunitarias y aplicaciones comerciales.",
    concepts: ["latent-diffusion", "diffusion-model", "latent-space", "image-generation", "encoder", "attention", "open-weights-model"],
  },
];

export function getPaper(slug: string): Paper | undefined {
  return papers.find((p) => p.slug === slug);
}
