import { ContractError, type ContractIssue } from "./errors.js";
import type { ReleaseBundleDocumentsByVersion } from "./read-bundle-documents.js";

type StructuredReleaseBundle =
  | ReleaseBundleDocumentsByVersion["3.0.0"]
  | ReleaseBundleDocumentsByVersion["4.0.0"];
type StructuredContentBlock =
  StructuredReleaseBundle["articles"][number]["content"][number];

function collectGalleryMediaIds(
  mediaIds: Set<string>,
  content: readonly StructuredContentBlock[],
) {
  for (const block of content) {
    if (block.type !== "gallery") continue;
    for (const item of block.items) mediaIds.add(item.mediaId);
  }
}

export function validateGalleryAltText<T extends StructuredReleaseBundle>(
  bundle: T,
): T {
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
