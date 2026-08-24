import type { Metadata } from "next";

import type { MetadataContext } from "./metadata-context";
import { getStaticListPagePath } from "./static-list-pagination";

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
  currentPage = 1,
): Metadata {
  const path = getStaticListPagePath(
    `/category/${category.slug}`,
    currentPage,
  );
  const canonical = new URL(path, context.canonicalOrigin).href;
  const title = currentPage === 1
    ? category.label
    : `${category.label} ${currentPage}페이지`;
  const baseDescription = getCategoryDescription(category);
  const description = currentPage === 1
    ? baseDescription
    : `${baseDescription} ${currentPage}페이지입니다.`;
  const index = !context.config.noindex;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index, follow: index },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [],
    },
  };
}
