import {
  ContractError,
  type ContractIssue,
} from "@content-foundry/content-contract";

import {
  getGoneCategoryStaticParams,
  type GoneRouteSource,
} from "./gone-route";
import {
  getStaticListAdditionalPages,
  resolveStaticListAdditionalPage,
} from "./static-list-pagination";

export interface CategoryRouteRecord {
  readonly id: string;
  readonly slug: string;
}

export interface CategorizedArticleRouteRecord {
  readonly categoryId: string;
}

export interface CategoryRouteSource<
  TCategory extends CategoryRouteRecord = CategoryRouteRecord,
  TArticle extends CategorizedArticleRouteRecord = CategorizedArticleRouteRecord,
> {
  readonly articles: readonly TArticle[];
  readonly taxonomy: { readonly categories: readonly TCategory[] };
}

function validateCategoryRouteReadiness(bundle: CategoryRouteSource) {
  const articleCategoryIds = new Set(
    bundle.articles.map((article) => article.categoryId),
  );
  const issues: ContractIssue[] = [];
  bundle.taxonomy.categories.forEach((category, index) => {
    if (!articleCategoryIds.has(category.id)) {
      issues.push({
        path: `/taxonomy/categories/${index}/id`,
        message: `category ${category.id} has no published articles`,
      });
    }
  });

  if (issues.length > 0) {
    throw new ContractError(
      "REFERENCE_INVALID",
      "Category routes are not publishable",
      issues,
    );
  }
}

export function getCategoryStaticParams(bundle: CategoryRouteSource) {
  validateCategoryRouteReadiness(bundle);
  return bundle.taxonomy.categories.map((category) => ({
    category: category.slug,
  }));
}

export function getCategoryPageStaticParams(
  bundle: CategoryRouteSource & GoneRouteSource,
) {
  return [
    ...getCategoryStaticParams(bundle),
    ...getGoneCategoryStaticParams(bundle),
  ];
}

export function getCategoryAdditionalPageStaticParams(
  bundle: CategoryRouteSource,
) {
  validateCategoryRouteReadiness(bundle);
  return bundle.taxonomy.categories.flatMap((category) => {
    const articleCount = bundle.articles.filter(
      (article) => article.categoryId === category.id,
    ).length;
    return getStaticListAdditionalPages(articleCount).map((page) => ({
      category: category.slug,
      page: String(page),
    }));
  });
}

export function resolveCategoryAdditionalPage<
  TCategory extends CategoryRouteRecord,
>(
  bundle: CategoryRouteSource<TCategory>,
  categorySlug: string,
  pageValue: string,
): { readonly category: TCategory; readonly page: number } | null {
  validateCategoryRouteReadiness(bundle);
  const category = findCategoryBySlug(bundle, categorySlug);
  if (!category) return null;
  const articleCount = bundle.articles.filter(
    (article) => article.categoryId === category.id,
  ).length;
  const page = resolveStaticListAdditionalPage(pageValue, articleCount);
  return page === null ? null : { category, page };
}

export function findCategoryBySlug<TCategory extends CategoryRouteRecord>(
  bundle: CategoryRouteSource<TCategory>,
  category: string,
): TCategory | undefined {
  return bundle.taxonomy.categories.find((entry) => entry.slug === category);
}
