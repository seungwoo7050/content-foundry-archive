import type { LoadedReleaseBundle } from "@content-foundry/content-contract";

export function getCategoryStaticParams(bundle: LoadedReleaseBundle) {
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
