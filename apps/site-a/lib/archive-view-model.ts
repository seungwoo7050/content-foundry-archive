import { ContractError, type ContractIssue } from "@content-foundry/content-contract";

export interface ArchiveArticleRecord {
  readonly id: string;
  readonly categoryId: string;
  readonly publishedAt: string;
  readonly seo: { readonly canonicalPath: string };
}

export interface ArchiveCategoryRecord {
  readonly id: string;
  readonly label: string;
}

export interface ArchiveSource<
  TArticle extends ArchiveArticleRecord = ArchiveArticleRecord,
  TCategory extends ArchiveCategoryRecord = ArchiveCategoryRecord,
> {
  readonly articles: readonly TArticle[];
  readonly taxonomy: { readonly categories: readonly TCategory[] };
}

export interface ArchiveEntry<
  TArticle extends ArchiveArticleRecord = ArchiveArticleRecord,
  TCategory extends ArchiveCategoryRecord = ArchiveCategoryRecord,
> {
  readonly article: TArticle;
  readonly category: TCategory;
}

function compareEntries(left: ArchiveEntry, right: ArchiveEntry): number {
  const publishedDifference =
    Date.parse(right.article.publishedAt) -
    Date.parse(left.article.publishedAt);
  if (publishedDifference !== 0) return publishedDifference;
  const idDifference = left.article.id.localeCompare(right.article.id);
  if (idDifference !== 0) return idDifference;
  return left.article.seo.canonicalPath.localeCompare(
    right.article.seo.canonicalPath,
  );
}

export function getArchiveEntries<
  TArticle extends ArchiveArticleRecord,
  TCategory extends ArchiveCategoryRecord,
>(bundle: ArchiveSource<TArticle, TCategory>): ArchiveEntry<TArticle, TCategory>[] {
  const categories = new Map(
    bundle.taxonomy.categories.map((category) => [category.id, category]),
  );
  const issues: ContractIssue[] = [];
  const entries = bundle.articles.flatMap((article, index) => {
    const category = categories.get(article.categoryId);
    if (!category) {
      issues.push({
        path: `/articles/${index}/categoryId`,
        message: `unknown archive category: ${article.categoryId}`,
      });
      return [];
    }
    return [{ article, category }];
  });

  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Archive entries reference missing categories",
      issues,
    );
  }
  return entries.sort(compareEntries);
}
