import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://marketpulse.app";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/market`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/backtests`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Dynamic /learn/[slug] routes
  const contentDir = path.join(process.cwd(), "content", "learn");
  let articleRoutes: MetadataRoute.Sitemap = [];

  try {
    const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));
    articleRoutes = files.map((file) => {
      const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
      const { data } = matter(raw);
      return {
        url: `${baseUrl}/learn/${data.slug}`,
        lastModified: new Date(data.date),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    });
  } catch {
    // content dir may not exist yet
  }

  return [...staticRoutes, ...articleRoutes];
}
