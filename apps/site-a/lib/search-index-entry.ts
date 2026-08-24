import { ContractError, type ContractIssue } from "@content-foundry/content-contract";

import { normalizeSearchText } from "./search-text";

interface SearchTaxonRecord {
  readonly id: string;
  readonly slug: string;
  readonly label: string;
}

export interface SearchIndexArticleRecord {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly updatedAt: string;
  readonly categoryId: string;
  readonly tagIds: readonly string[];
  readonly toc: readonly { readonly id: string; readonly text: string }[];
  readonly seo: { readonly canonicalPath: string; readonly index: boolean };
}

export interface SearchIndexTaxonomy {
  readonly categories: readonly SearchTaxonRecord[];
  readonly tags: readonly SearchTaxonRecord[];
}

export interface SearchIndexEntry {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly path: string;
  readonly updatedAt: string;
  readonly category: SearchTaxonRecord;
  readonly tags: readonly SearchTaxonRecord[];
  readonly headings: readonly { readonly id: string; readonly text: string }[];
  readonly keywords: readonly string[];
}

function projectTaxon({ id, slug, label }: SearchTaxonRecord): SearchTaxonRecord {
  return { id, slug, label };
}

export function createSearchIndexEntry(
  article: SearchIndexArticleRecord,
  articleIndex: number,
  taxonomy: SearchIndexTaxonomy,
  locale: string,
): SearchIndexEntry {
  const issues: ContractIssue[] = [];
  const categoryRecord = taxonomy.categories.find(
    ({ id }) => id === article.categoryId,
  );
  if (!categoryRecord) {
    issues.push({
      path: `/articles/${articleIndex}/categoryId`,
      message: `unknown search category: ${article.categoryId}`,
    });
  }
  const tags = article.tagIds.flatMap((tagId, tagIndex) => {
    const tag = taxonomy.tags.find(({ id }) => id === tagId);
    if (tag) return [tag];
    issues.push({
      path: `/articles/${articleIndex}/tagIds/${tagIndex}`,
      message: `unknown search tag: ${tagId}`,
    });
    return [];
  });

  if (!categoryRecord || issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Search index entry references missing taxonomy",
      issues,
    );
  }

  const category = projectTaxon(categoryRecord);
  const projectedTags = tags.map(projectTaxon);
  const headings = article.toc.map(({ id, text }) => ({ id, text }));

  const keywordValues = [
    article.title,
    article.summary,
    category.label,
    category.slug,
    ...projectedTags.flatMap((tag) => [tag.label, tag.slug]),
    ...headings.map(({ text }) => text),
  ];

  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    path: article.seo.canonicalPath,
    updatedAt: article.updatedAt,
    category,
    tags: projectedTags,
    headings,
    keywords: [...new Set(keywordValues.map((value) => normalizeSearchText(value, locale)))].sort(),
  };
}
