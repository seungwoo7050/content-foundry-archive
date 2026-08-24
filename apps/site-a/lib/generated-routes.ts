import type { LoadedReleaseBundle } from "@content-foundry/content-contract";

export function getGeneratedRoutes(
  bundle: LoadedReleaseBundle,
): ReadonlySet<string> {
  return new Set([
    "/",
    ...bundle.articles.map((article) => article.seo.canonicalPath),
    ...bundle.pages.map((page) => page.path),
    ...bundle.taxonomy.categories.map(
      (category) => `/category/${category.slug}`,
    ),
  ]);
}
