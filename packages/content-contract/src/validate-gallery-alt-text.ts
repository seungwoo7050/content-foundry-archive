import { ContractError, type ContractIssue } from "./errors.js";
import type { ReleaseBundleDocumentsByVersion } from "./read-bundle-documents.js";

type ReleaseBundleDocumentsV3 = ReleaseBundleDocumentsByVersion["3.0.0"];
type ContentBlockV3 =
  ReleaseBundleDocumentsV3["articles"][number]["content"][number];

function collectGalleryMediaIds(
  mediaIds: Set<string>,
  content: readonly ContentBlockV3[],
) {
  for (const block of content) {
    if (block.type !== "gallery") continue;
    for (const item of block.items) mediaIds.add(item.mediaId);
  }
}

export function validateGalleryAltText(
  bundle: ReleaseBundleDocumentsV3,
): ReleaseBundleDocumentsV3 {
  const galleryMediaIds = new Set<string>();
  for (const article of bundle.articles) {
    collectGalleryMediaIds(galleryMediaIds, article.content);
  }
  for (const page of bundle.pages) {
    collectGalleryMediaIds(galleryMediaIds, page.content);
  }

  const issues: ContractIssue[] = [];
  bundle.mediaManifest.items.forEach((media, index) => {
    if (galleryMediaIds.has(media.id) && media.alt.trim().length === 0) {
      issues.push({
        path: `/media/items/${index}/alt`,
        message: "gallery media alt text must contain a non-whitespace character",
      });
    }
  });

  if (issues.length > 0) {
    throw new ContractError(
      "CONTRACT_INVALID",
      "Gallery media metadata is invalid",
      issues,
    );
  }
  return bundle;
}
