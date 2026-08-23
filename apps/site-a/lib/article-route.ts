import type { LoadedReleaseBundle } from "@content-foundry/content-contract";

export function getArticleStaticParams(bundle: LoadedReleaseBundle) {
  return bundle.articles.map((article) => ({ slug: article.slug }));
}

export function findArticleBySlug(bundle: LoadedReleaseBundle, slug: string) {
  return bundle.articles.find((article) => article.slug === slug);
}
