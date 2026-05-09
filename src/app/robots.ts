import type { MetadataRoute } from "next";
import { sitemapUrl } from "@/lib/urls";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: sitemapUrl(),
  };
}
