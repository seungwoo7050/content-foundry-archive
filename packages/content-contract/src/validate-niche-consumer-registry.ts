import { ContractError, type ContractIssue } from "./errors.js";
import type { ReleaseBundleDocumentsByVersion } from "./read-bundle-documents.js";

type ReleaseBundleDocumentsV3 = ReleaseBundleDocumentsByVersion["3.0.0"];
type ContentBlockV3 =
  ReleaseBundleDocumentsV3["articles"][number]["content"][number];
type SiteComponentRegistry = Readonly<Record<string, readonly string[]>>;

function isRegistered(
  registry: SiteComponentRegistry,
  siteId: string,
  componentId: string,
) {
  const componentIds = Object.hasOwn(registry, siteId)
    ? registry[siteId]
    : undefined;
  return Array.isArray(componentIds) && componentIds.includes(componentId);
}

function validateContent(
  issues: ContractIssue[],
  registry: SiteComponentRegistry,
  siteId: string,
  content: readonly ContentBlockV3[],
  base: string,
) {
  content.forEach((block, index) => {
    if (block.type !== "niche-component") return;
    if (!isRegistered(registry, siteId, block.componentId)) {
      issues.push({
        path: `${base}/${index}/componentId`,
        message: `not registered by consumer for site ${siteId}: ${block.componentId}`,
      });
    }
  });
}

export function validateNicheConsumerRegistry(
  bundle: ReleaseBundleDocumentsV3,
  registry: SiteComponentRegistry,
): ReleaseBundleDocumentsV3 {
  const issues: ContractIssue[] = [];
  const siteId = bundle.release.siteId;

  bundle.articles.forEach((article, index) => {
    validateContent(
      issues,
      registry,
      siteId,
      article.content,
      `/articles/${index}/content`,
    );
  });
  bundle.pages.forEach((page, index) => {
    validateContent(
      issues,
      registry,
      siteId,
      page.content,
      `/pages/${index}/content`,
    );
  });

  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Niche components are missing from the consumer registry",
      issues,
    );
  }
  return bundle;
}
