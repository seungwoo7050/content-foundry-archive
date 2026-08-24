export interface ArticleRouteRecord {
  readonly slug: string;
}

export interface ArticleRouteSource<
  TArticle extends ArticleRouteRecord = ArticleRouteRecord,
> {
  readonly articles: readonly TArticle[];
}

export function getArticleStaticParams(bundle: ArticleRouteSource) {
  return bundle.articles.map((article) => ({ slug: article.slug }));
}

export function findArticleBySlug<TArticle extends ArticleRouteRecord>(
  bundle: ArticleRouteSource<TArticle>,
  slug: string,
) {
  return bundle.articles.find((article) => article.slug === slug);
}
