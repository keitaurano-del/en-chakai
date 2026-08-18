import type { MetadataRoute } from "next";
import { NEIGHBORHOODS } from "@/lib/constants";
import { STATIC_PATHS, absoluteUrl, neighborhoodUrl } from "@/lib/urls";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1.0 : 0.8,
  }));

  const neighborhoodRoutes = NEIGHBORHOODS.map((n) => ({
    url: neighborhoodUrl(n.slug),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const jaStaticRoutes = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path === "/" ? "/ja" : `/ja${path}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 0.9 : 0.7,
  }));

  const jaNeighborhoodRoutes = NEIGHBORHOODS.map((n) => ({
    url: absoluteUrl(`/ja/neighborhoods/${n.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...neighborhoodRoutes,
    ...jaStaticRoutes,
    ...jaNeighborhoodRoutes,
  ];
}
