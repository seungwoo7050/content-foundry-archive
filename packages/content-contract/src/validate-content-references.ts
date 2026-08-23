import { ContractError, type ContractIssue } from "./errors.js";
import type { PublishedContentBlock } from "./generated/content-block.js";
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

function validateMediaBlocks(
  issues: ContractIssue[],
  mediaIds: ReadonlySet<string>,
  content: readonly PublishedContentBlock[],
  base: string,
) {
  content.forEach((block, index) => {
    if (block.type === "image") {
      addMissing(
        issues,
        mediaIds,
        block.mediaId,
        `${base}/${index}/mediaId`,
        "media ID",
      );
    }
  });
}

export function validateContentReferences(
  bundle: ReleaseBundleDocuments,
): ReleaseBundleDocuments {
  const issues: ContractIssue[] = [];
  const categoryIds = new Set(bundle.taxonomy.categories.map(({ id }) => id));
  const tagIds = new Set(bundle.taxonomy.tags.map(({ id }) => id));
  const articleIds = new Set(bundle.articles.map(({ id }) => id));
  const mediaIds = new Set(bundle.mediaManifest.items.map(({ id }) => id));

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
    if (article.heroMediaId !== null) {
      addMissing(
        issues,
        mediaIds,
        article.heroMediaId,
        `${base}/heroMediaId`,
        "media ID",
      );
    }
    validateMediaBlocks(issues, mediaIds, article.content, `${base}/content`);
  });

  bundle.pages.forEach((page, pageIndex) => {
    validateMediaBlocks(
      issues,
      mediaIds,
      page.content,
      `/pages/${pageIndex}/content`,
    );
  });

  if (issues.length > 0) {
    throw new ContractError("REFERENCE_INVALID", "Content references do not resolve", issues);
  }
  return bundle;
}
