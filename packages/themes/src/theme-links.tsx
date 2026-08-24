import type {
  ArticleListItemViewModel,
  LinkViewModel,
  NavigationItemViewModel,
} from "./presentation-view-model.js";

function NavigationItems({
  items,
}: {
  readonly items: readonly NavigationItemViewModel[];
}) {
  return (
    <ul>
      {items.map(({ link, children }) => (
        <li key={link.href}>
          <a href={link.href}>{link.label}</a>
          {children.length > 0 ? <NavigationItems items={children} /> : null}
        </li>
      ))}
    </ul>
  );
}

export function ThemeNavigation({
  items,
  ariaLabel,
}: {
  readonly items: readonly NavigationItemViewModel[];
  readonly ariaLabel: string;
}) {
  return items.length > 0 ? (
    <nav aria-label={ariaLabel}>
      <NavigationItems items={items} />
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
  const List = ordered ? "ol" : "ul";
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <List>
      {articles.map(({ link, summary, date, category, topics }) => (
        <li key={link.href}>
          <article>
            <p>
              {category ? <><a href={category.href}>{category.label}</a>{" "}</> : null}
              <time dateTime={date.dateTime}>{date.label}</time>
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
