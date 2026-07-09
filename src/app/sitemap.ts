import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.bodyshapersystem.com";
  const routes = [
    "",
    "/body-blueprint",
    "/systems",
    "/in-home-experience",
    "/transformations",
    "/about",
    "/tech-talks",
    "/reviews",
    "/faq",
    "/policies",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
