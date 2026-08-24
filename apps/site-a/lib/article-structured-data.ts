import { hasMaterialArticleUpdate } from "./article-update";

export interface ArticleStructuredDataSource {
  readonly title: string;
  readonly summary: string;
  readonly publishedAt: string;
  readonly updatedAt: string;
  readonly author: { readonly displayName: string };
  readonly seo: { readonly canonicalPath: string };
}

export interface ArticleStructuredDataContext {
  readonly canonicalOrigin: string;
  readonly site: {
    readonly locale: string;
    readonly author: { readonly displayName: string };
  };
}

export function createArticleStructuredData(
  context: ArticleStructuredDataContext,
  article: ArticleStructuredDataSource,
): Readonly<Record<string, unknown>> {
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
    author: { "@type": "Person", name: article.author.displayName },
    publisher: { "@type": "Person", name: context.site.author.displayName },
  };
}
