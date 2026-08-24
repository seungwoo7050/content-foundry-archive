import { ContractError, type ContractIssue } from "./errors.js";
import type { ReleaseBundleDocumentsByVersion } from "./read-bundle-documents.js";

type ReleaseBundleDocumentsV3 = ReleaseBundleDocumentsByVersion["3.0.0"];
type ContentBlockV3 =
  ReleaseBundleDocumentsV3["articles"][number]["content"][number];

function parseSiteOrigin(
  issues: ContractIssue[],
  value: string,
): string | undefined {
  const url = URL.parse(value);
  if (url === null || url.origin === "null" || url.hostname.length === 0) {
    issues.push({
      path: "/site/origin",
      message: "site origin must identify a parseable network origin",
    });
    return undefined;
  }
  return url.origin;
}

function validateContent(
  issues: ContractIssue[],
  siteOrigin: string | undefined,
  content: readonly ContentBlockV3[],
  base: string,
) {
  content.forEach((block, index) => {
    if (block.type !== "action-link" || block.kind === "internal") return;

    const path = `${base}/${index}/url`;
    const url = URL.parse(block.url);
    if (
      url === null ||
      url.protocol !== "https:" ||
      url.hostname.length === 0
    ) {
      issues.push({
        path,
        message: "external action URL must be absolute HTTPS with a host",
      });
      return;
    }
    if (url.username.length > 0 || url.password.length > 0) {
      issues.push({
        path,
        message: "external action URL must not contain credentials",
      });
    }
    if (siteOrigin !== undefined && url.origin === siteOrigin) {
      issues.push({
        path,
        message: "same-origin action must use an internal path",
      });
    }
  });
}

export function validateExternalActionUrls(
  bundle: ReleaseBundleDocumentsV3,
): ReleaseBundleDocumentsV3 {
  const issues: ContractIssue[] = [];
  const siteOrigin = parseSiteOrigin(issues, bundle.site.origin);

  bundle.articles.forEach((article, index) => {
    validateContent(
      issues,
      siteOrigin,
      article.content,
      `/articles/${index}/content`,
    );
  });
  bundle.pages.forEach((page, index) => {
    validateContent(
      issues,
      siteOrigin,
      page.content,
      `/pages/${index}/content`,
    );
  });

  if (issues.length > 0) {
    throw new ContractError(
      "CONTRACT_INVALID",
      "External action URLs are invalid",
      issues,
    );
  }
  return bundle;
}
