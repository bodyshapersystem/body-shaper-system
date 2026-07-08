import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/client-access", "/client-welcome", "/client-dashboard", "/client-settings"],
      },
    ],
    sitemap: "https://www.bodyshapersystem.com/sitemap.xml",
  };
}
