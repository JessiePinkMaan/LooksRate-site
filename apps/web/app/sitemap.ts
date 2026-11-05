import type { MetadataRoute } from "next";

import { legal } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const paths = [
    "",
    "/manifest",
    "/ranks",
    "/access",
    "/lore",
    ...legal.docs.map((doc) => `/legal/${doc.slug}`),
  ];

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
