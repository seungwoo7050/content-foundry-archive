export interface ArticleCardDateSource {
  readonly publishedAt: string;
  readonly updatedAt: string;
}

export function getArticleCardDate(
  article: ArticleCardDateSource,
  strategy: "latest" | "published" = "latest",
) {
  if (strategy === "published") {
    return {
      kind: "published",
      label: "게시",
      dateTime: article.publishedAt,
    } as const;
  }
  if (Date.parse(article.updatedAt) > Date.parse(article.publishedAt)) {
    return {
      kind: "updated",
      label: "업데이트",
      dateTime: article.updatedAt,
    } as const;
  }
  return {
    kind: "published",
    label: "게시",
    dateTime: article.publishedAt,
  } as const;
}
