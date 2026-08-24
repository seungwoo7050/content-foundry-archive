import { ContractError, type ContractIssue } from "./errors.js";
import type { ReleaseBundleDocumentsByVersion } from "./read-bundle-documents.js";

export type LoadedReleaseBundleV4 = ReleaseBundleDocumentsByVersion["4.0.0"];

const HOME_GROUPS = ["featured", "current", "evergreen"] as const;

export function validateV4PresentationStructure<T extends LoadedReleaseBundleV4>(
  bundle: T,
): T {
  const issues: ContractIssue[] = [];
  const seenHomeArticles = new Map<string, (typeof HOME_GROUPS)[number]>();

  for (const group of HOME_GROUPS) {
    const articleIds = bundle.presentation.home[`${group}ArticleIds`];
    articleIds.forEach((articleId, index) => {
      const firstGroup = seenHomeArticles.get(articleId);
      if (firstGroup) {
        issues.push({
          path: `/presentation/home/${group}ArticleIds/${index}`,
          message: `article ID already appears in ${firstGroup}ArticleIds: ${articleId}`,
        });
      } else {
        seenHomeArticles.set(articleId, group);
      }
    });
  }

  const categoryIds = new Set<string>();
  bundle.presentation.categoryHighlights.forEach((highlight, index) => {
    if (categoryIds.has(highlight.categoryId)) {
      issues.push({
        path: `/presentation/categoryHighlights/${index}/categoryId`,
        message: `category ID appears more than once: ${highlight.categoryId}`,
      });
    }
    categoryIds.add(highlight.categoryId);
  });

  if (issues.length > 0) {
    throw new ContractError(
      "CONTRACT_INVALID",
      "Presentation selections contain duplicates",
      issues,
    );
  }
  return bundle;
}
