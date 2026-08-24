import { getVersionedSiteReleaseContext } from "../lib/site-release";

export default function HomePage() {
  const { bundle } = getVersionedSiteReleaseContext();
  const dateFormatter = new Intl.DateTimeFormat(bundle.site.locale, {
    dateStyle: "long",
    timeZone: bundle.site.timeZone,
  });

  return (
    <>
      <section aria-labelledby="home-title" className="home-intro">
        <p>실생활에 필요한 정보를 차분하게 정리합니다.</p>
        <h1 id="home-title">{bundle.site.name}</h1>
        <p>{bundle.site.description}</p>
      </section>

      {bundle.site.search.enabled ? (
        <section aria-labelledby="home-search" className="home-search">
          <h2 id="home-search">필요한 안내 찾기</h2>
          <p>
            제목, 카테고리, 주제로 게시된 안내를 찾아보세요. 검색어는 외부로
            전송하지 않습니다.
          </p>
          <p>
            {/* Static export intentionally uses native navigation. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/search">사이트 검색</a>
          </p>
        </section>
      ) : null}

      <section aria-labelledby="latest-articles" className="home-feed">
        <h2 id="latest-articles">최근 안내</h2>
        <ul className="article-list">
          {bundle.articles.map((article) => (
            <li key={article.id}>
              <article>
                <p>
                  <time dateTime={article.publishedAt}>
                    {dateFormatter.format(new Date(article.publishedAt))}
                  </time>
                </p>
                <h3>
                  <a href={article.seo.canonicalPath}>{article.title}</a>
                </h3>
                <p>{article.summary}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
