/**
 * Editorial metadata for model providers (Spanish, written for this site).
 * Keys are OpenRouter provider prefixes; `aliases` merges prefixes that belong to
 * the same organization. Websites were checked on 2026-09-27.
 */
export interface ProviderInfo {
  slug: string;
  name: string;
  description: string;
  website?: string;
  aliases?: string[];
  /** Shown first in the index. */
  featured?: boolean;
}

export const providers: ProviderInfo[] = [
  { slug: "openai", name: "OpenAI", featured: true, website: "https://openai.com", description: "Creadora de ChatGPT y de las familias GPT y o. Su catálogo va desde modelos pequeños y económicos hasta modelos de razonamiento de frontera, e incluye algunos modelos de pesos abiertos." },
  { slug: "anthropic", name: "Anthropic", featured: true, website: "https://www.anthropic.com", description: "Creadora de Claude. Sus modelos se ofrecen en varios tamaños (como Haiku, Sonnet y Opus) y destacan en programación, agentes y documentos largos. Pone énfasis en la seguridad y la alineación." },
  { slug: "google", name: "Google", featured: true, website: "https://deepmind.google", description: "Google DeepMind desarrolla la familia Gemini, multimodal desde su origen, y los modelos abiertos Gemma, además de modelos de imagen, video y música." },
  { slug: "meta-llama", name: "Meta", featured: true, website: "https://dev.meta.ai", aliases: ["meta"], description: "Meta desarrolla Llama, una de las familias de modelos de pesos abiertos más influyentes." },
  { slug: "mistralai", name: "Mistral AI", featured: true, website: "https://mistral.ai", description: "Laboratorio francés con modelos abiertos y comerciales: desde modelos pequeños y eficientes hasta modelos grandes y especializados en código." },
  { slug: "deepseek", name: "DeepSeek", featured: true, website: "https://www.deepseek.com", description: "Laboratorio chino conocido por modelos de pesos abiertos muy eficientes, como la serie V y el modelo de razonamiento R1." },
  { slug: "qwen", name: "Qwen (Alibaba)", featured: true, website: "https://qwen.ai", description: "Familia de modelos de Alibaba, con muchas versiones de pesos abiertos de distintos tamaños y variantes para código, visión y razonamiento." },
  { slug: "x-ai", name: "xAI", featured: true, website: "https://x.ai", description: "La empresa detrás de Grok, con modelos orientados a conversación, razonamiento y programación." },
  { slug: "moonshotai", name: "Moonshot AI", featured: true, website: "https://www.moonshot.ai", description: "Creadora de los modelos Kimi, con variantes de pesos abiertos orientadas a agentes y contextos largos." },
  { slug: "z-ai", name: "Z.ai", featured: true, website: "https://z.ai", description: "Antes Zhipu AI. Desarrolla la familia GLM, con varias versiones de pesos abiertos." },
  { slug: "minimax", name: "MiniMax", website: "https://www.minimax.io", description: "Empresa que desarrolla modelos de lenguaje y multimodales, varios de ellos con pesos abiertos." },
  { slug: "nvidia", name: "NVIDIA", website: "https://www.nvidia.com/en-us/ai/", description: "Publica modelos abiertos, como la familia Nemotron, optimizados para su hardware." },
  { slug: "cohere", name: "Cohere", website: "https://cohere.com", description: "Empresa canadiense enfocada en IA empresarial: modelos Command y herramientas para RAG." },
  { slug: "amazon", name: "Amazon", website: "https://aws.amazon.com/nova/", description: "Desarrolla la familia Nova, disponible en Amazon Bedrock." },
  { slug: "microsoft", name: "Microsoft", website: "https://www.microsoft.com/en-us/ai", description: "Modelos publicados por equipos de investigación de Microsoft." },
  { slug: "ibm-granite", name: "IBM", website: "https://www.ibm.com/granite", description: "Desarrolla Granite, modelos abiertos orientados a empresas." },
  { slug: "perplexity", name: "Perplexity", description: "Ofrece modelos Sonar, especializados en respuestas con búsqueda web y citas." },
  { slug: "tencent", name: "Tencent", website: "https://hunyuan.tencent.com", description: "Desarrolla la familia Hunyuan de modelos de lenguaje y multimodales." },
  { slug: "bytedance-seed", name: "ByteDance Seed", website: "https://seed.bytedance.com", aliases: ["bytedance"], description: "El equipo de investigación en modelos fundacionales de ByteDance." },
  { slug: "xiaomi", name: "Xiaomi", description: "Desarrolla la familia MiMo de modelos de lenguaje." },
  { slug: "baidu", name: "Baidu", description: "Desarrolla la familia ERNIE." },
  { slug: "nousresearch", name: "Nous Research", website: "https://nousresearch.com", description: "Colectivo de investigación que publica modelos abiertos, como la familia Hermes." },
  { slug: "liquid", name: "Liquid AI", website: "https://www.liquid.ai", description: "Diseña modelos eficientes pensados para ejecutarse en dispositivos." },
  { slug: "arcee-ai", name: "Arcee AI", website: "https://www.arcee.ai", description: "Desarrolla modelos abiertos y compactos para empresas." },
  { slug: "inception", name: "Inception", website: "https://www.inceptionlabs.ai", description: "Desarrolla modelos de lenguaje basados en difusión (Mercury), orientados a baja latencia." },
  { slug: "stepfun", name: "StepFun", website: "https://www.stepfun.com", description: "Empresa que desarrolla modelos de lenguaje y multimodales (Step)." },
  { slug: "upstage", name: "Upstage", website: "https://www.upstage.ai", description: "Empresa coreana creadora de los modelos Solar." },
  { slug: "writer", name: "Writer", website: "https://writer.com", description: "Plataforma de IA empresarial con sus propios modelos Palmyra." },
];

/** Generic text for providers without an editorial entry (often community fine-tunes). */
export const otherProvidersDescription =
  "Laboratorios más pequeños, startups y modelos de la comunidad (muchos son ajustes finos de modelos abiertos).";
