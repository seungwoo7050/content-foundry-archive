import type { Metadata } from "next";

import type { MetadataContext } from "./metadata-context";

export interface CategoryMetadataSource {
  readonly description: string;
  readonly label: string;
  readonly slug: string;
}

export function getCategoryDescription(category: CategoryMetadataSource) {
  return (
    category.description.trim() ||
    `${category.label} 카테고리의 안내 글을 모았습니다.`
  );
}

export function createCategoryMetadata(
  context: MetadataContext,
  category: CategoryMetadataSource,
): Metadata {
  const canonical = new URL(
    `/category/${category.slug}`,
    context.canonicalOrigin,
  ).href;
  const description = getCategoryDescription(category);
  const index = !context.config.noindex;

  return {
    title: category.label,
    description,
    alternates: { canonical },
    robots: { index, follow: index },
    openGraph: {
      type: "website",
      title: category.label,
      description,
      url: canonical,
      images: [],
    },
    twitter: {
      card: "summary",
      title: category.label,
      description,
      images: [],
    },
  };
}
