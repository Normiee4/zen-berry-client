import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://zen-berry.vercel.app"
  ).replace(/\/+$/, "")
  const lastModified = new Date()

  const secondaryRoutes = [
    "/reviews",
    "/privacy",
    "/terms",
    "/cookies",
  ]

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...secondaryRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
