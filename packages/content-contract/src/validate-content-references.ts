import { ContractError, type ContractIssue } from "./errors.js";
import type { ReleaseBundleDocuments } from "./read-bundle-documents.js";

function addMissing(
  issues: ContractIssue[],
  known: ReadonlySet<string>,
  value: string,
  path: string,
  label: string,
) {
  if (!known.has(value)) {
    issues.push({ path, message: `unknown ${label}: ${value}` });
  }
}

export function validateContentReferences(
  bundle: ReleaseBundleDocuments,
): ReleaseBundleDocuments {
  const issues: ContractIssue[] = [];
  const categoryIds = new Set(bundle.taxonomy.categories.map(({ id }) => id));
  const tagIds = new Set(bundle.taxonomy.tags.map(({ id }) => id));
  const articleIds = new Set(bundle.articles.map(({ id }) => id));

  bundle.articles.forEach((article, articleIndex) => {
    const base = `/articles/${articleIndex}`;
    addMissing(issues, categoryIds, article.categoryId, `${base}/categoryId`, "category ID");
    article.tagIds.forEach((tagId, index) => {
      addMissing(issues, tagIds, tagId, `${base}/tagIds/${index}`, "tag ID");
    });
    article.relatedArticleIds.forEach((articleId, index) => {
      addMissing(
        issues,
        articleIds,
        articleId,
        `${base}/relatedArticleIds/${index}`,
        "article ID",
      );
    });
  });

  if (issues.length > 0) {
    throw new ContractError("REFERENCE_INVALID", "Content references do not resolve", issues);
  }
  return bundle;
}
