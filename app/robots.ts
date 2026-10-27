import type { MetadataRoute } from "next";

// Keep the admin panel and its API out of search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }
  };
}
