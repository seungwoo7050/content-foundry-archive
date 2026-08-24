import type { Metadata } from "next";

import { getArchiveEntries } from "../../lib/archive-view-model";
import { getVersionedSiteReleaseContext } from "../../lib/site-release";

export function generateMetadata(): Metadata {
  const context = getVersionedSiteReleaseContext();
  const canonical = new URL("/archive", context.canonicalOrigin).href;
  const title = "전체 글";
  const description = `${context.bundle.site.name}에 게시된 안내 글을 최신순으로 모았습니다.`;
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
    twitter: { card: "summary", title, description, images: [] },
  };
}

export default function ArchivePage() {
  const { bundle } = getVersionedSiteReleaseContext();
  const entries = getArchiveEntries(bundle);
  const dateFormatter = new Intl.DateTimeFormat(bundle.site.locale, {
    dateStyle: "long",
    timeZone: bundle.site.timeZone,
  });

  return (
    <div className="archive-page">
      <header>
        <h1>전체 글</h1>
        <p>{bundle.site.name}의 안내 글을 게시일 최신순으로 모았습니다.</p>
      </header>
      <ol className="article-list">
        {entries.map(({ article, category }) => (
          <li key={article.id}>
            <article>
              <p>
                <a href={`/category/${category.slug}`}>{category.label}</a>{" "}
                <time dateTime={article.publishedAt}>
                  {dateFormatter.format(new Date(article.publishedAt))}
                </time>
              </p>
              <h2>
                <a href={article.seo.canonicalPath}>{article.title}</a>
              </h2>
              <p>{article.summary}</p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
