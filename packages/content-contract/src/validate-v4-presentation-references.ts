import { ContractError, type ContractIssue } from "./errors.js";
import type { LoadedReleaseBundleV4 } from "./validate-v4-presentation-structure.js";

const HOME_GROUPS = ["featured", "current", "evergreen"] as const;
const BRAND_SLOTS = [
  "logoMediaId",
  "faviconMediaId",
  "socialImageMediaId",
] as const;

export function validateV4PresentationReferences<T extends LoadedReleaseBundleV4>(
  bundle: T,
): T {
  const issues: ContractIssue[] = [];
  const articles = new Map(bundle.articles.map((article) => [article.id, article]));
  const categoryIds = new Set(bundle.taxonomy.categories.map(({ id }) => id));
  const mediaIds = new Set(bundle.mediaManifest.items.map(({ id }) => id));

  for (const group of HOME_GROUPS) {
    bundle.presentation.home[`${group}ArticleIds`].forEach((articleId, index) => {
      if (!articles.has(articleId)) {
        issues.push({
          path: `/presentation/home/${group}ArticleIds/${index}`,
          message: `unknown article ID: ${articleId}`,
        });
      }
    });
  }

  bundle.presentation.categoryHighlights.forEach((highlight, highlightIndex) => {
    const base = `/presentation/categoryHighlights/${highlightIndex}`;
    if (!categoryIds.has(highlight.categoryId)) {
      issues.push({
        path: `${base}/categoryId`,
        message: `unknown category ID: ${highlight.categoryId}`,
      });
    }
    highlight.articleIds.forEach((articleId, articleIndex) => {
      const article = articles.get(articleId);
      if (!article) {
        issues.push({
          path: `${base}/articleIds/${articleIndex}`,
          message: `unknown article ID: ${articleId}`,
        });
      } else if (article.categoryId !== highlight.categoryId) {
        issues.push({
          path: `${base}/articleIds/${articleIndex}`,
          message: `article ${articleId} belongs to category ${article.categoryId}, not ${highlight.categoryId}`,
        });
      }
    });
  });

  for (const slot of BRAND_SLOTS) {
    const mediaId = bundle.presentation.brand[slot];
    if (mediaId !== null && !mediaIds.has(mediaId)) {
      issues.push({
        path: `/presentation/brand/${slot}`,
        message: `unknown media ID: ${mediaId}`,
      });
    }
  }

  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Presentation references do not resolve",
      issues,
    );
  }
  return bundle;
}
