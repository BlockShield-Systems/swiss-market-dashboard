import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

const staticRoutes = [
  "",
  "/crypto",
  "/weather",
  "/about",
  "/settings",
  "/insights",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return staticRoutes.map((route) => ({
    url: `${SITE_CONFIG.url}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/about" ? 0.8 : 0.7,
  }));
}
