import type { MetadataRoute } from "next";

import {
  getRouteClaims,
  type GeneratedRouteSource,
  type RouteClaimKind,
} from "./route-claims";

export interface SitemapSource extends GeneratedRouteSource {
  readonly articles: readonly {
    readonly categoryId: string;
    readonly id: string;
    readonly publishedAt: string;
    readonly updatedAt: string;
    readonly seo: { readonly canonicalPath: string; readonly index: boolean };
  }[];
  readonly pages: readonly {
    readonly path: string;
    readonly seo: { readonly canonicalPath: string; readonly index: boolean };
  }[];
}

function comparePath(
  left: { readonly path: string },
  right: { readonly path: string },
) {
  if (left.path < right.path) return -1;
  if (left.path > right.path) return 1;
  return 0;
}

function getClaimedSitemapEntries(
  canonicalOrigin: string,
  claims: ReadonlyMap<string, { readonly kind: RouteClaimKind }>,
  kind: RouteClaimKind,
) {
  return [...claims]
    .filter(([, claim]) => claim.kind === kind)
    .map(([path]) => ({ path }))
    .sort(comparePath)
    .map(({ path }) => ({ url: new URL(path, canonicalOrigin).href }));
}

export function createSitemapEntries(
  canonicalOrigin: string,
  bundle: SitemapSource,
): MetadataRoute.Sitemap {
  const toUrl = (path: string) => new URL(path, canonicalOrigin).href;
  const routeClaims = getRouteClaims(bundle);
  const archivePages = getClaimedSitemapEntries(
    canonicalOrigin,
    routeClaims,
    "archive-page",
  );
  const categoryPages = getClaimedSitemapEntries(
    canonicalOrigin,
    routeClaims,
    "category-page",
  );
  const articles = bundle.articles
    .filter(({ seo }) => seo.index)
    .map((article) => ({
      path: article.seo.canonicalPath,
      lastModified: article.updatedAt,
    }))
    .sort(comparePath)
    .map(({ path, lastModified }) => ({ url: toUrl(path), lastModified }));
  const categories = bundle.taxonomy.categories
    .map(({ slug }) => ({ path: `/category/${slug}` }))
    .sort(comparePath)
    .map(({ path }) => ({ url: toUrl(path) }));
  const pages = bundle.pages
    .filter(({ seo }) => seo.index)
    .map(({ seo }) => ({ path: seo.canonicalPath }))
    .sort(comparePath)
    .map(({ path }) => ({ url: toUrl(path) }));

  return [
    { url: toUrl("/") },
    { url: toUrl("/archive") },
    ...archivePages,
    ...articles,
    ...categories,
    ...categoryPages,
    ...pages,
  ];
}
