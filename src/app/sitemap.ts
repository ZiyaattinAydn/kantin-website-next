import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexableDeployment } from "@/lib/deployment/config";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexableDeployment()) return [];

  const baseUrl = getSiteUrl();
  const routes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/menu", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/events", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/careers", priority: 0.6, changeFrequency: "monthly" as const },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: new URL(path, baseUrl).toString(),
    priority,
    changeFrequency,
  }));
}
