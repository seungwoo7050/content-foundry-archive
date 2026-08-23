import { ContractError, type ContractIssue } from "./errors.js";
import type { ReleaseBundleDocuments } from "./read-bundle-documents.js";

export function validateContentSemantics(
  bundle: ReleaseBundleDocuments,
): ReleaseBundleDocuments {
  const issues: ContractIssue[] = [];

  bundle.articles.forEach((article, articleIndex) => {
    const base = `/articles/${articleIndex}`;
    if (Date.parse(article.updatedAt) < Date.parse(article.publishedAt)) {
      issues.push({
        path: `${base}/updatedAt`,
        message: "updatedAt must not precede publishedAt",
      });
    }

    const canonicalPath = `/article/${article.slug}`;
    if (article.seo.canonicalPath !== canonicalPath) {
      issues.push({
        path: `${base}/seo/canonicalPath`,
        message: `expected ${canonicalPath}`,
      });
    }

  });

  bundle.pages.forEach((page, pageIndex) => {
    if (page.seo.canonicalPath !== page.path) {
      issues.push({
        path: `/pages/${pageIndex}/seo/canonicalPath`,
        message: `expected ${page.path}`,
      });
    }
  });

  if (issues.length > 0) {
    throw new ContractError("REFERENCE_INVALID", "Content semantics are inconsistent", issues);
  }
  return bundle;
}
