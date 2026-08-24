export interface HomePresentationArticle {
  readonly id: string;
  readonly updatedAt: string;
}

interface HomePresentationRecord {
  readonly home: {
    readonly featuredArticleIds: readonly string[];
    readonly currentArticleIds: readonly string[];
    readonly evergreenArticleIds: readonly string[];
  };
  readonly categoryHighlights: readonly {
    readonly categoryId: string;
    readonly articleIds: readonly string[];
  }[];
}

export interface HomePresentationSource<Article extends HomePresentationArticle> {
  readonly articles: readonly Article[];
  readonly presentation?: HomePresentationRecord;
}

export interface HomePresentationViewModel<Article> {
  readonly featuredArticles: readonly Article[];
  readonly currentArticles: readonly Article[];
  readonly evergreenArticles: readonly Article[];
  readonly latestArticles: readonly Article[];
  readonly categoryHighlights: readonly {
    readonly categoryId: string;
    readonly articles: readonly Article[];
  }[];
}

function compareLatest(
  left: HomePresentationArticle,
  right: HomePresentationArticle,
) {
  const updatedDifference = Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
  return updatedDifference || left.id.localeCompare(right.id);
}

export function createHomePresentationViewModel<
  Article extends HomePresentationArticle,
>(source: HomePresentationSource<Article>): HomePresentationViewModel<Article> {
  const byId = new Map(source.articles.map((article) => [article.id, article]));
  const resolve = (articleIds: readonly string[]) =>
    articleIds.map((articleId) => {
      const article = byId.get(articleId);
      if (!article) {
        throw new Error(`Validated presentation article is missing: ${articleId}`);
      }
      return article;
    });
  const presentation = source.presentation;
  if (!presentation) {
    return {
      featuredArticles: [],
      currentArticles: [],
      evergreenArticles: [],
      latestArticles: [...source.articles].sort(compareLatest),
      categoryHighlights: [],
    };
  }

  const featuredArticles = resolve(presentation.home.featuredArticleIds);
  const currentArticles = resolve(presentation.home.currentArticleIds);
  const evergreenArticles = resolve(presentation.home.evergreenArticleIds);
  const placedIds = new Set(
    [...featuredArticles, ...currentArticles, ...evergreenArticles].map(
      ({ id }) => id,
    ),
  );
  return {
    featuredArticles,
    currentArticles,
    evergreenArticles,
    latestArticles: source.articles
      .filter(({ id }) => !placedIds.has(id))
      .sort(compareLatest),
    categoryHighlights: presentation.categoryHighlights.map(
      ({ categoryId, articleIds }) => ({
        categoryId,
        articles: resolve(articleIds),
      }),
    ),
  };
}
