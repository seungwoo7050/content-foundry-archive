import type {
  LoadedReleaseBundle,
  PublishedArticleProjection,
} from "@content-foundry/content-contract";

function compareByRecentUpdate(
  left: PublishedArticleProjection,
  right: PublishedArticleProjection,
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

export function getCategoryArticles(
  bundle: LoadedReleaseBundle,
  categoryId: string,
) {
  return bundle.articles
    .filter((article) => article.categoryId === categoryId)
    .sort(compareByRecentUpdate);
}
