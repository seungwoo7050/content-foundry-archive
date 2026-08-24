import { ContractError, type ContractIssue } from "./errors.js";
import type { ReleaseBundleDocumentsByVersion } from "./read-bundle-documents.js";

type SemanticBundle =
  ReleaseBundleDocumentsByVersion[keyof ReleaseBundleDocumentsByVersion];

export function validateContentSemantics<T extends SemanticBundle>(bundle: T): T {
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

    const headings = new Map<
      string,
      { readonly index: number; readonly level: number; readonly text: string }
    >();
    article.content.forEach((block, blockIndex) => {
      if (block.type !== "heading") return;
      const first = headings.get(block.id);
      if (first) {
        issues.push({
          path: `${base}/content/${blockIndex}/id`,
          message: `duplicate heading ID; first declared at ${base}/content/${first.index}/id`,
        });
      } else {
        headings.set(block.id, {
          index: blockIndex,
          level: block.level,
          text: block.text,
        });
      }
    });

    article.toc.forEach((entry, tocIndex) => {
      const heading = headings.get(entry.id);
      const path = `${base}/toc/${tocIndex}`;
      if (!heading) {
        issues.push({ path: `${path}/id`, message: `unknown heading ID: ${entry.id}` });
      } else if (entry.text !== heading.text || entry.level !== heading.level) {
        issues.push({
          path,
          message: `TOC entry must match heading ${entry.id}`,
        });
      }
    });
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
