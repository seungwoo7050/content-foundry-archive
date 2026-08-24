import {
  getArticleCardDate,
  type ArticleCardDateSource,
} from "../lib/article-card-date";

export interface ArticleCardSource extends ArticleCardDateSource {
  readonly summary: string;
  readonly title: string;
  readonly seo: { readonly canonicalPath: string };
}

interface ArticleCardProps {
  readonly article: ArticleCardSource;
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
