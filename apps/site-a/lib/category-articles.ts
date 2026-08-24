export interface CategoryArticleRecord {
  readonly id: string;
  readonly categoryId: string;
  readonly tagIds: readonly string[];
  readonly updatedAt: string;
}

export interface CategoryTagRecord {
  readonly id: string;
}

export interface CategoryArticleSource<
  TArticle extends CategoryArticleRecord = CategoryArticleRecord,
> {
  readonly articles: readonly TArticle[];
}

export interface CategoryTagSource<
  TTag extends CategoryTagRecord = CategoryTagRecord,
> {
  readonly taxonomy: { readonly tags: readonly TTag[] };
}

function compareByRecentUpdate(
  left: CategoryArticleRecord,
  right: CategoryArticleRecord,
) {
  const updatedDifference =
    Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
  if (updatedDifference !== 0) {
    return updatedDifference;
  }
  if (left.id < right.id) {
    return -1;
  }
  if (left.id > right.id) {
    return 1;
  }
  return 0;
}

export function getCategoryArticles<TArticle extends CategoryArticleRecord>(
  bundle: CategoryArticleSource<TArticle>,
  categoryId: string,
): TArticle[] {
  return bundle.articles
    .filter((article) => article.categoryId === categoryId)
    .sort(compareByRecentUpdate);
}

export function getCategoryTags<TTag extends CategoryTagRecord>(
  bundle: CategoryTagSource<TTag>,
  articles: readonly CategoryArticleRecord[],
): TTag[] {
  const tagIds = new Set(articles.flatMap((article) => article.tagIds));
  return bundle.taxonomy.tags.filter((tag) => tagIds.has(tag.id));
}
