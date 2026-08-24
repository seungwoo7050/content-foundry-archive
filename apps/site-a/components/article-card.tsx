import type { PublishedArticleProjection } from "@content-foundry/content-contract";

import { getArticleCardDate } from "../lib/article-card-date";

interface ArticleCardProps {
  readonly article: PublishedArticleProjection;
  readonly locale: string;
  readonly timeZone: string;
}

export function ArticleCard({ article, locale, timeZone }: ArticleCardProps) {
  const displayDate = getArticleCardDate(article);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone,
  });

  return (
    <article>
      <p>
        {displayDate.label}{" "}
        <time dateTime={displayDate.dateTime}>
          {dateFormatter.format(new Date(displayDate.dateTime))}
        </time>
      </p>
      <h3>
        <a href={article.seo.canonicalPath}>{article.title}</a>
      </h3>
      <p>{article.summary}</p>
    </article>
  );
}
