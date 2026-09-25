import type { MetadataRoute } from "next";
import { getAllTerms, getCategories, getLearningPaths } from "@/lib/glossary";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["/", "/glossary", "/explore", "/learn", "/map", "/categories", "/about"].map((path) => ({
    url: absoluteUrl(path),
    lastModified: site.contentDate,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));
  return [
    ...staticPages,
    ...getAllTerms().map((t) => ({ url: absoluteUrl(`/glossary/${t.slug}`), lastModified: t.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...getCategories().map((c) => ({ url: absoluteUrl(`/categories/${c.slug}`), lastModified: site.contentDate, priority: 0.6 })),
    ...getLearningPaths().map((p) => ({ url: absoluteUrl(`/learn/${p.slug}`), lastModified: site.contentDate, priority: 0.6 })),
  ];
}
