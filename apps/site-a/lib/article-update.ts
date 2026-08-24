export interface ArticleUpdateSource {
  readonly publishedAt: string;
  readonly updatedAt: string;
}

export function hasMaterialArticleUpdate(
  article: ArticleUpdateSource,
): boolean {
  return Date.parse(article.updatedAt) > Date.parse(article.publishedAt);
}
