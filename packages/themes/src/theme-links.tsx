import type {
  ArticleListItemViewModel,
  LinkViewModel,
  NavigationItemViewModel,
  PaginationViewModel,
} from "./presentation-view-model.js";
import type { HomeAboutTeaserViewModel } from "./content-route-view-model.js";
import type { StateRecoveryLinkViewModel } from "./state-route-view-model.js";

function NavigationItems({
  items,
  currentPath,
}: {
  readonly items: readonly NavigationItemViewModel[];
  readonly currentPath?: string | undefined;
}) {
  return (
    <ul>
      {items.map(({ link, children }) => (
        <li key={link.href}>
          <a
            aria-current={link.href === currentPath ? "page" : undefined}
            href={link.href}
          >
            {link.label}
          </a>
          {children.length > 0 ? (
            <NavigationItems currentPath={currentPath} items={children} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function ThemeNavigation({
  items,
  ariaLabel,
  currentPath,
}: {
  readonly items: readonly NavigationItemViewModel[];
  readonly ariaLabel: string;
  readonly currentPath?: string | undefined;
}) {
  return items.length > 0 ? (
    <nav aria-label={ariaLabel}>
      <NavigationItems currentPath={currentPath} items={items} />
    </nav>
  ) : null;
}

export function ThemeFooterNavigation({
  items,
}: {
  readonly items: readonly LinkViewModel[];
}) {
  return items.length > 0 ? (
    <nav aria-label="운영 및 정책">
      <ul>
        {items.map((item) => (
          <li key={item.href}><a href={item.href}>{item.label}</a></li>
        ))}
      </ul>
    </nav>
  ) : null;
}

export function ThemeRecoveryLinks({
  items,
}: {
  readonly items?: readonly StateRecoveryLinkViewModel[] | undefined;
}) {
  return items && items.length > 0 ? (
    <nav aria-label="페이지 복구 경로">
      <ul>
        {items.map(({ href, label, kind }) => (
          <li key={`${kind}:${href}`} data-recovery-kind={kind}>
            <a href={href}>{label}</a>
          </li>
        ))}
      </ul>
    </nav>
  ) : null;
}

export function ThemeHomeAboutTeaser({
  teaser,
}: {
  readonly teaser?: HomeAboutTeaserViewModel | null | undefined;
}) {
  return teaser ? (
    <section aria-labelledby="home-about-teaser-heading">
      <h2 id="home-about-teaser-heading">운영자와 사이트 소개</h2>
      <p>{teaser.description}</p>
      <p><a href={teaser.href}>{teaser.label}</a></p>
    </section>
  ) : null;
}

export function ThemeArticleTopics({
  topics,
}: {
  readonly topics?: readonly string[] | undefined;
}) {
  return topics && topics.length > 0 ? (
    <ul aria-label="관련 주제" className="theme-article-topics">
      {topics.map((topic, index) => (
        <li key={`${topic}:${index}`}>{topic}</li>
      ))}
    </ul>
  ) : null;
}

export function ThemeBreadcrumbs({
  items,
  currentPath,
  ariaLabel,
}: {
  readonly items: readonly LinkViewModel[];
  readonly currentPath: string;
  readonly ariaLabel: string;
}) {
  const currentIndex = items.findLastIndex(({ href }) => href === currentPath);
  if (currentIndex < 0) {
    throw new Error(`Breadcrumbs do not include current path: ${currentPath}`);
  }
  return (
    <nav aria-label={ariaLabel}>
      <ol>
        {items.slice(0, currentIndex + 1).map((item, index) => (
          <li key={`${item.href}:${index}`}>
            {index === currentIndex ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <a href={item.href}>{item.label}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ThemeArticleList({
  articles,
  ordered = false,
  headingLevel,
}: {
  readonly articles: readonly ArticleListItemViewModel[];
  readonly ordered?: boolean;
  readonly headingLevel: 2 | 3;
}) {
  if (articles.length === 0) {
    return <p className="theme-article-list-empty">표시할 글이 없습니다.</p>;
  }

  const List = ordered ? "ol" : "ul";
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <List>
      {articles.map(({
        artwork,
        link,
        summary,
        date,
        estimatedReadingTime,
        category,
        topics,
      }) => (
        <li key={link.href}>
          <article>
            {artwork ?? null}
            <p>
              {category ? <><a href={category.href}>{category.label}</a>{" "}</> : null}
              <span>{date.kind === "published" ? "게시" : "업데이트"}</span>{" "}
              <time dateTime={date.dateTime}>{date.label}</time>{" "}
              <span>{estimatedReadingTime.label}</span>
            </p>
            <Heading><a href={link.href}>{link.label}</a></Heading>
            <p>{summary}</p>
            {topics.length > 0 ? (
              <ul>{topics.map((topic, index) => <li key={`${topic}:${index}`}>{topic}</li>)}</ul>
            ) : null}
          </article>
        </li>
      ))}
    </List>
  );
}

export function ThemePagination({
  pagination,
}: {
  readonly pagination: PaginationViewModel;
}) {
  if (pagination.pageCount <= 1) return null;
  return (
    <nav aria-label="목록 페이지 이동">
      <p>
        <span aria-current="page">{pagination.currentPage}페이지</span>
        {` / 전체 ${pagination.pageCount}페이지`}
      </p>
      <ul>
        {pagination.previous ? (
          <li><a href={pagination.previous.href} rel="prev">{pagination.previous.label}</a></li>
        ) : null}
        {pagination.next ? (
          <li><a href={pagination.next.href} rel="next">{pagination.next.label}</a></li>
        ) : null}
      </ul>
    </nav>
  );
}
