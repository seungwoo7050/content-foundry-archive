/* Generated from contract 4.0.0. Do not edit. */

/**
 * @maxItems 3
 */
export type ArticleIds = [] | [ArticleId] | [ArticleId, ArticleId] | [ArticleId, ArticleId, ArticleId];
/**
 * This interface was referenced by `PublicSitePresentationProjection`'s JSON-Schema
 * via the `definition` "articleId".
 */
export type ArticleId = string;
/**
 * @maxItems 6
 */
export type ArticleIds1 =
  | []
  | [ArticleId]
  | [ArticleId, ArticleId]
  | [ArticleId, ArticleId, ArticleId]
  | [ArticleId, ArticleId, ArticleId, ArticleId]
  | [ArticleId, ArticleId, ArticleId, ArticleId, ArticleId]
  | [ArticleId, ArticleId, ArticleId, ArticleId, ArticleId, ArticleId];
/**
 * @maxItems 8
 */
export type ArticleIds2 =
  | []
  | [ArticleId]
  | [ArticleId, ArticleId]
  | [ArticleId, ArticleId, ArticleId]
  | [ArticleId, ArticleId, ArticleId, ArticleId]
  | [ArticleId, ArticleId, ArticleId, ArticleId, ArticleId]
  | [ArticleId, ArticleId, ArticleId, ArticleId, ArticleId, ArticleId]
  | [ArticleId, ArticleId, ArticleId, ArticleId, ArticleId, ArticleId, ArticleId]
  | [ArticleId, ArticleId, ArticleId, ArticleId, ArticleId, ArticleId, ArticleId, ArticleId];
/**
 * This interface was referenced by `PublicSitePresentationProjection`'s JSON-Schema
 * via the `definition` "taxonId".
 */
export type TaxonId = string;
/**
 * @maxItems 3
 */
export type ArticleIds3 = [] | [ArticleId] | [ArticleId, ArticleId] | [ArticleId, ArticleId, ArticleId];
/**
 * This interface was referenced by `PublicSitePresentationProjection`'s JSON-Schema
 * via the `definition` "mediaIdOrNull".
 */
export type MediaIdOrNull = string | null;
/**
 * This interface was referenced by `PublicSitePresentationProjection`'s JSON-Schema
 * via the `definition` "articleIds".
 */
export type ArticleIds4 = ArticleId[];

export interface PublicSitePresentationProjection {
  home: {
    featuredArticleIds: ArticleIds;
    currentArticleIds: ArticleIds1;
    evergreenArticleIds: ArticleIds2;
  };
  categoryHighlights: {
    categoryId: TaxonId;
    articleIds: ArticleIds3;
  }[];
  brand: {
    logoMediaId: MediaIdOrNull;
    faviconMediaId: MediaIdOrNull;
    socialImageMediaId: MediaIdOrNull;
  };
}
