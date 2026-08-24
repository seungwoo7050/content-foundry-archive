import type { ReactNode } from "react";

import type { ContentRouteViewModel } from "../content-route-view-model.js";
import {
  getThemeAdSlot,
  type ThemeAdSlotContext,
} from "../theme-ad-slot.js";
import {
  ThemeArticleList,
  ThemeHomeAboutTeaser,
  ThemePagination,
} from "../theme-links.js";
import { FriendlyArticle } from "./article.js";
import { FriendlyRouteIntro } from "./shell.js";

export function renderFriendlyContentRoute(
  route: ContentRouteViewModel,
  context: ThemeAdSlotContext = {},
): ReactNode {
  switch (route.kind) {
    case "home":
      return (
        <div className="fmu-stack">
          <section className="fmu-panel fmu-summary">
            <FriendlyRouteIntro route={route} />
            {route.searchLink ? <p><a className="fmu-action fmu-primary" href={route.searchLink.href}>{route.searchLink.label}</a></p> : null}
          </section>
          {route.categories.length > 0 ? (
            <section aria-labelledby="fmu-home-categories" className="fmu-panel">
              <h2 id="fmu-home-categories">할 일로 찾기</h2>
              <div className="fmu-grid">
                {route.categories.map((category) => (
                  <article key={category.href}>
                    <h3><a className="fmu-action" href={category.href}>{category.label}</a></h3>
                    <p>{category.description}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
          <section aria-labelledby="fmu-home-latest" className="fmu-list">
            <h2 id="fmu-home-latest">{route.articleSectionHeading}</h2>
            <ThemeArticleList articles={route.articles} headingLevel={3} />
            {getThemeAdSlot(context, "home-feed")}
          </section>
          <ThemeHomeAboutTeaser teaser={route.aboutTeaser} />
        </div>
      );
    case "category":
      return (
        <div className="fmu-stack">
          <FriendlyRouteIntro route={route} />
          <section aria-labelledby="fmu-category-articles" className="fmu-list">
            <h2 id="fmu-category-articles">{route.articleSectionHeading}</h2>
            <ThemeArticleList articles={route.articles} headingLevel={3} />
            <ThemePagination pagination={route.pagination} />
          </section>
          {route.topicSectionHeading && route.topics.length > 0 ? (
            <section aria-labelledby="fmu-category-topics" className="fmu-panel">
              <h2 id="fmu-category-topics">{route.topicSectionHeading}</h2>
              <ul>{route.topics.map((topic, index) => <li key={`${topic}:${index}`}>{topic}</li>)}</ul>
            </section>
          ) : null}
        </div>
      );
    case "article":
      return <FriendlyArticle context={context} route={route} />;
    case "static-page":
      return <article className="fmu-stack"><FriendlyRouteIntro route={route} /><div className="fmu-panel fmu-body">{route.body}</div></article>;
    case "archive":
      return (
        <div className="fmu-stack">
          <FriendlyRouteIntro route={route} />
          <section aria-label={route.heading} className="fmu-list">
            <ThemeArticleList articles={route.articles} headingLevel={2} ordered />
            <ThemePagination pagination={route.pagination} />
          </section>
        </div>
      );
    default: {
      const unhandled: never = route;
      return unhandled;
    }
  }
}
