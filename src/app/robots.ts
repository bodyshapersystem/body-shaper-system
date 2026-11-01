import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/hub",
          "/hub/",
          "/portal",
          "/portal/",
          "/architecture",
          "/architecture/",
          "/emergency-",
          // Private client proposals — also noindex via meta + header.
          "/p/",
          // Legacy routes, kept in case any external link still points here.
          "/client-access",
          "/client-welcome",
          "/client-dashboard",
          "/client-settings",
        ],
      },
    ],
    sitemap: "https://www.bodyshapersystem.com/sitemap.xml",
  };
}
