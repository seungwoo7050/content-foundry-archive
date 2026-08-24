import type { PublishedArticleProjection } from "@content-foundry/content-contract";

export function getArticleCardDate(article: PublishedArticleProjection) {
  if (Date.parse(article.updatedAt) > Date.parse(article.publishedAt)) {
    return { label: "업데이트", dateTime: article.updatedAt } as const;
  }
  return { label: "게시", dateTime: article.publishedAt } as const;
}
