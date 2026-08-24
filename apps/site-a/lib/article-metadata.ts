import type { Metadata } from "next";

import { hasMaterialArticleUpdate } from "./article-update";
import type { MetadataContext } from "./metadata-context";

export interface ArticleMetadataSource {
  readonly heroMediaId: string | null;
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
  const hero = article.heroMediaId === null
    ? null
    : context.mediaAssets?.get(article.heroMediaId);
  if (article.heroMediaId !== null && hero === undefined) {
    throw new Error(`Prepared article metadata asset is missing: ${article.heroMediaId}`);
  }
  const image = hero
    ? {
        url: new URL(hero.fallback.publicPath, context.canonicalOrigin).href,
        width: hero.fallback.width,
        height: hero.fallback.height,
        alt: hero.fallback.alt,
      }
    : null;

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
      images: image ? [image] : [],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: article.seo.title,
      description: article.seo.description,
      images: image ? [image.url] : [],
    },
  };
}
