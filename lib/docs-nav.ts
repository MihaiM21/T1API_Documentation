import { GROUPS } from "@/lib/catalog"

export interface NavItem {
  label: string
  href: string
  badge?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
  defaultOpen?: boolean
}

export const docsNav: NavSection[] = [
  {
    title: "Getting Started",
    defaultOpen: true,
    items: [
      { label: "Introduction", href: "/docs" },
      { label: "Quick start", href: "/docs#quick-start" },
      { label: "Authentication", href: "/docs#authentication" },
      { label: "Rate limits", href: "/docs#rate-limits" },
      { label: "Playground", href: "/docs/playground", badge: "Live" },
    ],
  },
  {
    title: "Concepts",
    items: [
      { label: "Sessions & identifiers", href: "/docs/concepts#sessions" },
      { label: "Plots, JSON & CSV", href: "/docs/concepts#formats" },
      { label: "Social canvases", href: "/docs/concepts#canvases" },
      { label: "Caching & ETags", href: "/docs/concepts#caching" },
      { label: "Errors & retries", href: "/docs/concepts#errors" },
      { label: "Versioning", href: "/docs/concepts#versioning" },
    ],
  },
  {
    title: "Endpoints",
    items: [
      { label: "All endpoints", href: "/docs/endpoints" },
      ...GROUPS.map((g) => ({ label: g.title, href: `/docs/endpoints#group-${g.id}` })),
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Keys & usage", href: "/docs/account" },
      { label: "Sign up & sign in", href: "/docs/account#auth" },
      { label: "Usage dashboards", href: "/docs/account#usage" },
    ],
  },
  {
    title: "Guides",
    items: [
      { label: "Recipes", href: "/docs/recipes" },
      { label: "Live data & polling", href: "/docs/recipes#live-data" },
      { label: "Migrating from V1", href: "/docs/migration", badge: "Sunset" },
    ],
  },
  {
    title: "Reference",
    items: [
      { label: "Response schemas", href: "/docs/schemas" },
      { label: "TypeScript types", href: "/docs/schemas#typescript" },
      { label: "Changelog", href: "/docs/changelog" },
    ],
  },
]

/** Linear reading order, used for prev/next links on top-level pages. */
export const pageOrder = [
  { label: "Introduction", href: "/docs" },
  { label: "Concepts", href: "/docs/concepts" },
  { label: "Endpoints", href: "/docs/endpoints" },
  { label: "Playground", href: "/docs/playground" },
  { label: "Account & keys", href: "/docs/account" },
  { label: "Recipes", href: "/docs/recipes" },
  { label: "Response schemas", href: "/docs/schemas" },
  { label: "Migrating from V1", href: "/docs/migration" },
  { label: "Changelog", href: "/docs/changelog" },
]

export function neighbours(href: string) {
  const i = pageOrder.findIndex((p) => p.href === href)
  return {
    prev: i > 0 ? pageOrder[i - 1] : undefined,
    next: i >= 0 && i < pageOrder.length - 1 ? pageOrder[i + 1] : undefined,
  }
}
