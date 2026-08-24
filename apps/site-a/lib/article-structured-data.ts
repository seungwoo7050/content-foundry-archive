import { hasMaterialArticleUpdate } from "./article-update";
import type { ResponsiveImageAssetRegistry } from "./responsive-image-asset-registry";

export interface ArticleStructuredDataSource {
  readonly heroMediaId: string | null;
  readonly title: string;
  readonly summary: string;
  readonly publishedAt: string;
  readonly updatedAt: string;
  readonly author: { readonly displayName: string };
  readonly seo: { readonly canonicalPath: string };
}

export interface ArticleStructuredDataContext {
  readonly canonicalOrigin: string;
  readonly mediaAssets?: ResponsiveImageAssetRegistry;
  readonly site: {
    readonly locale: string;
    readonly author: { readonly displayName: string };
  };
}

export function createArticleStructuredData(
  context: ArticleStructuredDataContext,
  article: ArticleStructuredDataSource,
): Readonly<Record<string, unknown>> {
  const hero = article.heroMediaId === null
    ? null
    : context.mediaAssets?.get(article.heroMediaId);
  if (article.heroMediaId !== null && hero === undefined) {
    throw new Error(`Prepared article structured-data asset is missing: ${article.heroMediaId}`);
  }
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    url: new URL(article.seo.canonicalPath, context.canonicalOrigin).href,
    inLanguage: context.site.locale,
    datePublished: article.publishedAt,
    ...(hasMaterialArticleUpdate(article)
      ? { dateModified: article.updatedAt }
      : {}),
    ...(hero
      ? {
          image: new URL(
            hero.fallback.publicPath,
            context.canonicalOrigin,
          ).href,
        }
      : {}),
    author: { "@type": "Person", name: article.author.displayName },
    publisher: { "@type": "Person", name: context.site.author.displayName },
  };
}
