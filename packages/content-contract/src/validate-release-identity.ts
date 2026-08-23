import { ContractError, type ContractIssue } from "./errors.js";
import type { ReleaseBundleDocuments } from "./read-bundle-documents.js";

function addMismatch(
  issues: ContractIssue[],
  path: string,
  actual: unknown,
  expected: unknown,
) {
  if (actual !== expected) {
    issues.push({ path, message: `expected ${String(expected)}, got ${String(actual)}` });
  }
}

export function validateReleaseIdentity(
  bundle: ReleaseBundleDocuments,
): ReleaseBundleDocuments {
  const issues: ContractIssue[] = [];
  addMismatch(issues, "/site/id", bundle.site.id, bundle.release.siteId);
  addMismatch(
    issues,
    "/site/defaultTheme",
    bundle.site.defaultTheme,
    bundle.release.defaultTheme,
  );
  addMismatch(
    issues,
    "/site/defaultSkin",
    bundle.site.defaultSkin,
    bundle.release.defaultSkin,
  );
  addMismatch(
    issues,
    "/release/articleCount",
    bundle.release.articleCount,
    bundle.articles.length,
  );
  addMismatch(
    issues,
    "/release/pageCount",
    bundle.release.pageCount,
    bundle.pages.length,
  );

  if (issues.length > 0) {
    throw new ContractError("REFERENCE_INVALID", "Release identity is inconsistent", issues);
  }
  return bundle;
}
