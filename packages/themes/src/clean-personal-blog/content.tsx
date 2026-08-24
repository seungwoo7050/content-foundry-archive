import type {
  ContentRouteViewModel,
  HomeRouteViewModel,
} from "../content-route-view-model.js";
import {
  getThemeAdSlot,
  type ThemeAdSlotContext,
} from "../theme-ad-slot.js";
import {
  ThemeArticleList,
  ThemeHomeAboutTeaser,
  ThemePagination,
} from "../theme-links.js";
import { CleanPersonalArticle } from "./article.js";

function RouteHeader({
  heading,
  description,
}: {
  readonly heading: string;
  readonly description: string;
}) {
  return <header className="personal-route-header"><h1>{heading}</h1><p>{description}</p></header>;
}

function PersonalHomeGroup({
  articles,
  className,
  heading,
  headingId,
}: {
  readonly articles: HomeRouteViewModel["articles"] | undefined;
  readonly className: string;
  readonly heading: string;
  readonly headingId: string;
}) {
  return articles && articles.length > 0 ? (
    <section aria-labelledby={headingId} className={`${className} personal-article-list personal-section`}>
      <h2 id={headingId}>{heading}</h2>
      <ThemeArticleList articles={articles} headingLevel={3} />
    </section>
  ) : null;
}

function unreachable(value: never): never {
  throw new Error(`Unsupported personal content route: ${JSON.stringify(value)}`);
}

export function CleanPersonalContent({
  context = {},
  route,
}: {
  readonly context?: ThemeAdSlotContext;
  readonly route: ContentRouteViewModel;
}) {
  switch (route.kind) {
    case "home": {
      const hasHomeGroups = route.featuredArticles !== undefined
        || route.currentArticles !== undefined
        || route.evergreenArticles !== undefined
        || route.latestArticles !== undefined
        || route.categoryHighlights !== undefined;
      return (
        <div className="personal-home">
          <RouteHeader heading={route.heading} description={route.description} />
          {route.searchLink ? <p><a className="personal-search-link" href={route.searchLink.href}>{route.searchLink.label}</a></p> : null}
          {route.categories.length > 0 ? (
            <section aria-labelledby="personal-categories-title" className="personal-section">
              <h2 id="personal-categories-title">카테고리</h2>
              <ul className="personal-categories">{route.categories.map((category) => (
                <li key={category.href}><a href={category.href}>{category.label}</a><p>{category.description}</p></li>
              ))}</ul>
            </section>
          ) : null}
          {hasHomeGroups ? <>
            <PersonalHomeGroup articles={route.featuredArticles} className="personal-home-featured" heading="먼저 읽을 글" headingId="personal-featured-title" />
            <PersonalHomeGroup articles={route.currentArticles} className="personal-home-current" heading="지금 살펴볼 글" headingId="personal-current-title" />
            <PersonalHomeGroup articles={route.evergreenArticles} className="personal-home-reference" heading="두고 읽을 글" headingId="personal-reference-title" />
            <PersonalHomeGroup articles={route.latestArticles} className="personal-home-latest" heading={route.articleSectionHeading} headingId="personal-group-latest-title" />
            {route.categoryHighlights?.map(({ category, articles }, index) => (
              <section aria-labelledby={`personal-highlight-${index}`} className="personal-home-category-highlight personal-article-list personal-section" key={category.href}>
                <h2 id={`personal-highlight-${index}`}><a href={category.href}>{category.label}</a></h2>
                <p>{category.description}</p>
                {articles.length > 0 ? <ThemeArticleList articles={articles} headingLevel={3} /> : null}
              </section>
            ))}
            {getThemeAdSlot(context, "home-feed")}
          </> : (
            <section aria-labelledby="personal-latest-title" className="personal-article-list personal-section">
              <h2 id="personal-latest-title">{route.articleSectionHeading}</h2>
              <ThemeArticleList articles={route.articles} headingLevel={3} />
              {getThemeAdSlot(context, "home-feed")}
            </section>
          )}
          <ThemeHomeAboutTeaser teaser={route.aboutTeaser} />
        </div>
      );
    }
    case "category":
      return (
        <div className="personal-category-route">
          <RouteHeader heading={route.heading} description={route.description} />
          <section aria-labelledby="personal-category-list" className="personal-article-list">
            <h2 id="personal-category-list">{route.articleSectionHeading}</h2>
            <ThemeArticleList articles={route.articles} headingLevel={3} />
            <ThemePagination pagination={route.pagination} />
          </section>
          {route.topicSectionHeading && route.topics.length > 0 ? (
            <section aria-labelledby="personal-topics-title" className="personal-section">
              <h2 id="personal-topics-title">{route.topicSectionHeading}</h2>
              <ul className="personal-topics">{route.topics.map((topic, index) => <li key={`${topic}:${index}`}>{topic}</li>)}</ul>
            </section>
          ) : null}
        </div>
      );
    case "article": return <CleanPersonalArticle context={context} route={route} />;
    case "static-page":
      return <article className="personal-static"><RouteHeader heading={route.heading} description={route.description} /><div className="personal-body">{route.body}</div></article>;
    case "archive":
      return (
        <div className="personal-archive">
          <RouteHeader heading={route.heading} description={route.description} />
          <section aria-label={route.heading} className="personal-article-list">
            <ThemeArticleList articles={route.articles} headingLevel={2} ordered />
            <ThemePagination pagination={route.pagination} />
          </section>
        </div>
      );
    default: return unreachable(route);
  }
}
