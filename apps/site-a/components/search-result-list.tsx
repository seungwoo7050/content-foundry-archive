import type { SearchResult } from "../lib/search-results";

export interface SearchFallbackCategory {
  readonly id: string;
  readonly href: string;
  readonly label: string;
}

interface SearchResultListProps {
  readonly results: readonly SearchResult[];
  readonly categories: readonly SearchFallbackCategory[];
  readonly locale: string;
  readonly timeZone: string;
}

export function SearchResultList({
  results,
  categories,
  locale,
  timeZone,
}: SearchResultListProps) {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone,
  });

  return (
    <section aria-labelledby="search-results-title">
      <h2 id="search-results-title">검색 결과</h2>
      <p role="status" aria-live="polite">
        {results.length}개의 안내를 찾았습니다.
      </p>
      {results.length > 0 ? (
        <ol className="search-results">
          {results.map(({ entry }) => (
            <li key={entry.id}>
              <article>
                <h3>
                  <a href={entry.path}>{entry.title}</a>
                </h3>
                <p>{entry.summary}</p>
                <p>
                  <span>{entry.category.label}</span>
                  {" · "}
                  <time dateTime={entry.updatedAt}>
                    {dateFormatter.format(new Date(entry.updatedAt))}
                  </time>
                </p>
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <div className="search-fallback">
          <p>검색어를 바꾸거나 카테고리와 전체 글에서 찾아보세요.</p>
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <a href={category.href}>{category.label}</a>
              </li>
            ))}
            <li>
              {/* Static export intentionally uses native navigation. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/archive">전체 글 보기</a>
            </li>
          </ul>
        </div>
      )}
    </section>
  );
}
