import {
  ContractError,
  type ContractIssue,
  type LoadedReleaseBundle,
} from "@content-foundry/content-contract";

function validateCategoryRouteReadiness(bundle: LoadedReleaseBundle) {
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

export function getCategoryStaticParams(bundle: LoadedReleaseBundle) {
  validateCategoryRouteReadiness(bundle);
  return bundle.taxonomy.categories.map((category) => ({
    category: category.slug,
  }));
}

export function findCategoryBySlug(
  bundle: LoadedReleaseBundle,
  category: string,
) {
  return bundle.taxonomy.categories.find((entry) => entry.slug === category);
}
