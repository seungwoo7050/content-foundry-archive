import type { Metadata } from "next";

import { hasMaterialArticleUpdate } from "./article-update";
import type { MetadataContext } from "./metadata-context";

export interface ArticleMetadataSource {
  readonly publishedAt: string;
  readonly updatedAt: string;
  readonly seo: {
    readonly canonicalPath: string;
    readonly title: string;
    readonly description: string;
    readonly index: boolean;
    readonly follow: boolean;
  };
}

export function createArticleMetadata(
  context: MetadataContext,
  article: ArticleMetadataSource,
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
      ...(hasMaterialArticleUpdate(article)
        ? { modifiedTime: article.updatedAt }
        : {}),
      images: [],
    },
    twitter: {
      card: "summary",
      title: article.seo.title,
      description: article.seo.description,
      images: [],
    },
  };
}
