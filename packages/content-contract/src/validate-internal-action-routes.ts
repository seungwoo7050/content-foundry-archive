import { ContractError, type ContractIssue } from "./errors.js";
import type { ReleaseBundleDocumentsByVersion } from "./read-bundle-documents.js";

type ReleaseBundleDocumentsV3 = ReleaseBundleDocumentsByVersion["3.0.0"];
type ContentBlockV3 =
  ReleaseBundleDocumentsV3["articles"][number]["content"][number];

function validateContent(
  issues: ContractIssue[],
  generatedRoutes: ReadonlySet<string>,
  dispositionSources: ReadonlySet<string>,
  content: readonly ContentBlockV3[],
  base: string,
) {
  content.forEach((block, index) => {
    if (block.type !== "action-link" || block.kind !== "internal") return;
    if (
      !generatedRoutes.has(block.path) ||
      dispositionSources.has(block.path)
    ) {
      issues.push({
        path: `${base}/${index}/path`,
        message: `not a direct generated, non-gone route: ${block.path}`,
      });
    }
  });
}

export function validateInternalActionRoutes(
  bundle: ReleaseBundleDocumentsV3,
  generatedRoutes: ReadonlySet<string>,
): ReleaseBundleDocumentsV3 {
  const dispositionSources = new Set(
    bundle.redirects.items.map((item) =>
      item.type === "redirect" ? item.fromPath : item.path,
    ),
  );
  const issues: ContractIssue[] = [];

  bundle.articles.forEach((article, index) => {
    validateContent(
      issues,
      generatedRoutes,
      dispositionSources,
      article.content,
      `/articles/${index}/content`,
    );
  });
  bundle.pages.forEach((page, index) => {
    validateContent(
      issues,
      generatedRoutes,
      dispositionSources,
      page.content,
      `/pages/${index}/content`,
    );
  });

  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Internal action routes do not resolve directly",
      issues,
    );
  }
  return bundle;
}
