import type { PublicSiteTaxonomy } from "@content-foundry/content-contract";
import type { Metadata } from "next";

import type { SiteReleaseContext } from "./load-site-release";

type Category = PublicSiteTaxonomy["categories"][number];

function getCategoryDescription(category: Category) {
  return (
    category.description.trim() ||
    `${category.label} 카테고리의 안내 글을 모았습니다.`
  );
}

export function createCategoryMetadata(
  context: SiteReleaseContext,
  category: Category,
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
