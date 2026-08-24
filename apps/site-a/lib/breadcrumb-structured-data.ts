import type { ArticleBreadcrumbItem } from "./article-breadcrumbs";

export function createBreadcrumbStructuredData(
  canonicalOrigin: string,
  items: readonly ArticleBreadcrumbItem[],
): Readonly<Record<string, unknown>> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: new URL(item.path, canonicalOrigin).href,
    })),
  };
}
