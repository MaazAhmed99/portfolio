import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { SITE_URL } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, priority: 1 },
    ...projects.map((p) => ({
      url: `${SITE_URL}/work/${p.slug}`,
      lastModified: now,
      priority: p.featured ? 0.8 : 0.5,
    })),
  ];
}
