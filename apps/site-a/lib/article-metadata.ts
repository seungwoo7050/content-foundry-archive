import type { PublishedArticleProjection } from "@content-foundry/content-contract";
import type { Metadata } from "next";

import type { SiteReleaseContext } from "./load-site-release";

export function createArticleMetadata(
  context: SiteReleaseContext,
  article: PublishedArticleProjection,
): Metadata {
  const canonical = new URL(
    article.seo.canonicalPath,
    context.canonicalOrigin,
  ).href;
  const index = !context.config.noindex && article.seo.index;
  const follow = !context.config.noindex && article.seo.follow;

  return {
    title: article.seo.title,
    description: article.seo.description,
    alternates: { canonical },
    robots: { index, follow },
    openGraph: {
      type: "article",
      title: article.seo.title,
      description: article.seo.description,
      url: canonical,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: "summary",
      title: article.seo.title,
      description: article.seo.description,
    },
  };
}
