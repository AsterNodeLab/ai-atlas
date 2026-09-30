import type { MetadataRoute } from "next";
import { getAllTerms, getCategories, getLearningPaths } from "@/lib/glossary";
import { papers } from "@/content/papers";
import { getAllModels, getProviders, modelPath, modelsSource } from "@/lib/models";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["/", "/glossary", "/explore", "/learn", "/map", "/categories", "/tools", "/models", "/prompts", "/prompts/factory", "/llms", "/papers", "/agents", "/workflows", "/about"].map((path) => ({
    url: absoluteUrl(path),
    lastModified: site.contentDate,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));
  return [
    ...staticPages,
    ...getAllTerms().map((t) => ({ url: absoluteUrl(`/glossary/${t.slug}`), lastModified: t.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...getCategories().map((c) => ({ url: absoluteUrl(`/categories/${c.slug}`), lastModified: site.contentDate, priority: 0.6 })),
    ...getProviders().map((p) => ({ url: absoluteUrl(`/models/${p.slug}`), lastModified: modelsSource.fetchedAt, priority: 0.5 })),
    ...getAllModels().map((m) => ({ url: absoluteUrl(modelPath(m)), lastModified: modelsSource.fetchedAt, priority: 0.4 })),
    ...papers.map((p) => ({ url: absoluteUrl(`/papers/${p.slug}`), lastModified: site.contentDate, priority: 0.6 })),
    ...getLearningPaths().map((p) => ({ url: absoluteUrl(`/learn/${p.slug}`), lastModified: site.contentDate, priority: 0.6 })),
  ];
}
