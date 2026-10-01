import type { MetadataRoute } from "next"

const BASE = "https://docs.t1f1.com"
const routes = [
  "",
  "/docs",
  "/docs/concepts",
  "/docs/endpoints",
  "/docs/playground",
  "/docs/account",
  "/docs/recipes",
  "/docs/schemas",
  "/docs/migration",
  "/docs/changelog",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${BASE}${r}`,
    changeFrequency: r === "/docs/changelog" ? "weekly" : "monthly",
    priority: r === "" ? 1 : r === "/docs" || r === "/docs/endpoints" ? 0.9 : 0.7,
  }))
}
