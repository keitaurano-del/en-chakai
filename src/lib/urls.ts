import type { NeighborhoodSlug } from "@/lib/constants";

export const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://en-chakai.com"
).replace(/\/$/, "");

export const STATIC_PATHS = [
  "/",
  "/experience",
  "/neighborhoods",
  "/booking",
  "/faq",
] as const;

export type StaticPath = (typeof STATIC_PATHS)[number];

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function absoluteUrl(path: string): string {
  const normalized = normalizePath(path);
  return normalized === "/" ? BASE_URL : `${BASE_URL}${normalized}`;
}

export function neighborhoodPath(slug: NeighborhoodSlug): string {
  return `/neighborhoods/${slug}`;
}

export function neighborhoodUrl(slug: NeighborhoodSlug): string {
  return absoluteUrl(neighborhoodPath(slug));
}

export function sitemapUrl(): string {
  return absoluteUrl("/sitemap.xml");
}
