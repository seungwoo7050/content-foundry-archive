import { ContractError, type ContractIssue } from "./errors.js";
import type { ReleaseBundleDocumentsByVersion } from "./read-bundle-documents.js";

type ReleaseBundleDocumentsV3 = ReleaseBundleDocumentsByVersion["3.0.0"];
type ContentBlockV3 =
  ReleaseBundleDocumentsV3["articles"][number]["content"][number];
type SiteComponentPolicy = Readonly<Record<string, readonly string[]>>;

function isEnabled(
  policy: SiteComponentPolicy,
  siteId: string,
  componentId: string,
) {
  const componentIds = Object.hasOwn(policy, siteId)
    ? policy[siteId]
    : undefined;
  return Array.isArray(componentIds) && componentIds.includes(componentId);
}

function validateContent(
  issues: ContractIssue[],
  policy: SiteComponentPolicy,
  siteId: string,
  content: readonly ContentBlockV3[],
  base: string,
) {
  content.forEach((block, index) => {
    if (block.type !== "niche-component") return;
    if (!isEnabled(policy, siteId, block.componentId)) {
      issues.push({
        path: `${base}/${index}/componentId`,
        message: `not enabled by producer policy for site ${siteId}: ${block.componentId}`,
      });
    }
  });
}

export function validateNicheProducerPolicy(
  bundle: ReleaseBundleDocumentsV3,
  policy: SiteComponentPolicy,
): ReleaseBundleDocumentsV3 {
  const issues: ContractIssue[] = [];
  const siteId = bundle.release.siteId;

  bundle.articles.forEach((article, index) => {
    validateContent(
      issues,
      policy,
      siteId,
      article.content,
      `/articles/${index}/content`,
    );
  });
  bundle.pages.forEach((page, index) => {
    validateContent(
      issues,
      policy,
      siteId,
      page.content,
      `/pages/${index}/content`,
    );
  });

  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Niche components are disabled by producer policy",
      issues,
    );
  }
  return bundle;
}
