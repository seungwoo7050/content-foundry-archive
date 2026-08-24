import type { MetadataRoute } from "next";

export interface SitemapSource {
  readonly articles: readonly {
    readonly updatedAt: string;
    readonly seo: { readonly canonicalPath: string; readonly index: boolean };
  }[];
  readonly taxonomy: {
    readonly categories: readonly { readonly slug: string }[];
  };
  readonly pages: readonly {
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

export function createSitemapEntries(
  canonicalOrigin: string,
  bundle: SitemapSource,
): MetadataRoute.Sitemap {
  const toUrl = (path: string) => new URL(path, canonicalOrigin).href;
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
    ...articles,
    ...categories,
    ...pages,
  ];
}
