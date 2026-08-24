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
import { InformationPortalArticle } from "./article.js";
import { PortalRouteIntro } from "./shell.js";

export function renderInformationPortalContent(
  route: ContentRouteViewModel,
  context: ThemeAdSlotContext = {},
): ReactNode {
  switch (route.kind) {
    case "home": {
      const homeGroups = [
        [route.featuredArticles, "ip-home-featured", "ip-featured-heading", "주요 안내"],
        [route.currentArticles, "ip-home-current", "ip-current-heading", "지금 확인할 안내"],
        [route.evergreenArticles, "ip-home-reference", "ip-reference-heading", "기본 안내"],
        [route.latestArticles, "ip-home-latest", "ip-group-latest-heading", route.articleSectionHeading],
      ] as const;
      const hasPresentation = homeGroups.some(([articles]) => articles !== undefined)
        || route.categoryHighlights !== undefined;
      return (
        <div className="ip-stack">
          <PortalRouteIntro route={route} />
          {route.searchLink ? (
            <section aria-label="사이트 검색" className="ip-panel ip-muted">
              <a className="ip-search-action" href={route.searchLink.href}><span>{route.searchLink.label}</span><span aria-hidden="true">→</span></a>
            </section>
          ) : null}
          {route.categories.length > 0 ? (
            <section aria-labelledby="ip-directory-heading" className="ip-panel">
              <h2 id="ip-directory-heading">분야별 안내</h2>
              <div className="ip-directory">{route.categories.map((category) => (
                <article key={category.href}><h3><a href={category.href}>{category.label}</a></h3><p>{category.description}</p></article>
              ))}</div>
            </section>
          ) : null}
          {hasPresentation ? <>
            {homeGroups.map(([articles, className, headingId, heading]) => (
              articles && articles.length > 0 ? (
                <section aria-labelledby={headingId} className={`${className} ip-list`} key={className}>
                  <h2 id={headingId}>{heading}</h2>
                  <ThemeArticleList articles={articles} headingLevel={3} />
                </section>
              ) : null
            ))}
            {route.categoryHighlights?.map(({ category, articles }, index) => (
              <section aria-labelledby={`ip-highlight-${index}`} className="ip-home-category-highlight ip-panel ip-list" key={category.href}>
                <h2 id={`ip-highlight-${index}`}><a href={category.href}>{category.label}</a></h2>
                <p>{category.description}</p>
                {articles.length > 0 ? <ThemeArticleList articles={articles} headingLevel={3} /> : null}
              </section>
            ))}
            {getThemeAdSlot(context, "home-feed")}
          </> : (
            <section aria-labelledby="ip-latest-heading" className="ip-list">
              <h2 id="ip-latest-heading">{route.articleSectionHeading}</h2>
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
        <div className="ip-stack">
          <PortalRouteIntro route={route} />
          {route.topicSectionHeading && route.topics.length > 0 ? (
            <section aria-labelledby="ip-topics-heading" className="ip-panel ip-muted">
              <h2 id="ip-topics-heading">{route.topicSectionHeading}</h2>
              <ul className="ip-topics">{route.topics.map((topic, index) => <li key={`${topic}:${index}`}>{topic}</li>)}</ul>
            </section>
          ) : null}
          <section aria-labelledby="ip-category-list" className="ip-list">
            <h2 id="ip-category-list">{route.articleSectionHeading}</h2>
            <ThemeArticleList articles={route.articles} headingLevel={3} />
            <ThemePagination pagination={route.pagination} />
          </section>
        </div>
      );
    case "article":
      return <InformationPortalArticle context={context} route={route} />;
    case "static-page":
      return <article className="ip-stack"><PortalRouteIntro route={route} /><div className="ip-panel ip-body">{route.body}</div></article>;
    case "archive":
      return (
        <div className="ip-stack">
          <PortalRouteIntro route={route} />
          <section aria-label={route.heading} className="ip-list">
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
