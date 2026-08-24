import type { ContentRouteViewModel } from "../content-route-view-model.js";
import {
  getThemeAdSlot,
  type ThemeAdSlotContext,
} from "../theme-ad-slot.js";
import {
  ThemeArticleList,
  ThemeHomeAboutTeaser,
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
    case "home":
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
          <section aria-labelledby="personal-latest-title" className="personal-article-list personal-section">
            <h2 id="personal-latest-title">{route.articleSectionHeading}</h2>
            <ThemeArticleList articles={route.articles} headingLevel={3} />
            {getThemeAdSlot(context, "home-feed")}
          </section>
          <ThemeHomeAboutTeaser teaser={route.aboutTeaser} />
        </div>
      );
    case "category":
      return (
        <div className="personal-category-route">
          <RouteHeader heading={route.heading} description={route.description} />
          <section aria-labelledby="personal-category-list" className="personal-article-list">
            <h2 id="personal-category-list">{route.articleSectionHeading}</h2>
            <ThemeArticleList articles={route.articles} headingLevel={3} />
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
          </section>
        </div>
      );
    default: return unreachable(route);
  }
}
