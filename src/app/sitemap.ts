import type { MetadataRoute } from "next";
import { NEIGHBORHOODS } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://en-chakai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/experience",
    "/neighborhoods",
    "/itineraries",
    "/booking",
    "/faq",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1.0 : 0.8,
  }));

  const neighborhoodRoutes = NEIGHBORHOODS.map((n) => ({
    url: `${BASE_URL}/neighborhoods/${n.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...neighborhoodRoutes];
}
