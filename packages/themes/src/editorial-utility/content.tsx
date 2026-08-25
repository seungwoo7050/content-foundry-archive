import type {
  ArchiveRouteViewModel,
  CategoryRouteViewModel,
  ContentRouteViewModel,
  HomeRouteViewModel,
  StaticPageRouteViewModel,
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
import { EditorialArticle } from "./article.js";

function RouteHeader({
  heading,
  description,
}: {
  readonly heading: string;
  readonly description: string;
}) {
  return <header className="editorial-route-header"><h1>{heading}</h1><p>{description}</p></header>;
}

function HomeArticleGroup({
  articles,
  artworkPlacement,
  className,
  heading,
}: {
  readonly articles: HomeRouteViewModel["articles"] | undefined;
  readonly artworkPlacement?: "before" | "after";
  readonly className: string;
  readonly heading: string;
}) {
  return articles && articles.length > 0 ? (
    <section className={`${className} editorial-section`}>
      <h2>{heading}</h2>
      <ThemeArticleList
        articles={articles}
        headingLevel={3}
        {...(artworkPlacement ? { artworkPlacement } : {})}
      />
    </section>
  ) : null;
}

function Home({
  context,
  route,
}: {
  readonly context: ThemeAdSlotContext;
  readonly route: HomeRouteViewModel;
}) {
  const lead = route.articles.slice(0, 1);
  const secondary = route.articles.slice(1, 3);
  const latest = route.articles.slice(3);
  const hasEditorialGroups = route.featuredArticles !== undefined
    || route.currentArticles !== undefined
    || route.evergreenArticles !== undefined
    || route.latestArticles !== undefined
    || route.categoryHighlights !== undefined;
  return (
    <div className="editorial-home" data-route="home">
      <RouteHeader heading={route.heading} description={route.description} />
      {(route.categories.length > 0 || route.searchLink) ? (
        <div className="editorial-home-tools">
          {route.categories.length > 0 ? (
            <ul>{route.categories.map((category) => (
              <li key={category.href}>
                <a href={category.href}>{category.label}</a>
                <p>{category.description}</p>
              </li>
            ))}</ul>
          ) : <span />}
          {route.searchLink ? <a href={route.searchLink.href}>{route.searchLink.label}</a> : null}
        </div>
      ) : null}
      {hasEditorialGroups ? <>
        <HomeArticleGroup articles={route.featuredArticles} artworkPlacement="after" className="editorial-home-featured" heading="선정 안내" />
        <HomeArticleGroup articles={route.currentArticles} className="editorial-home-current" heading="지금 확인할 안내" />
        <HomeArticleGroup articles={route.evergreenArticles} className="editorial-home-reference" heading="기본 안내" />
        <HomeArticleGroup articles={route.latestArticles} className="editorial-home-latest" heading={route.articleSectionHeading} />
        {route.categoryHighlights?.map(({ category, articles }) => (
          <section className="editorial-home-category-highlight editorial-section" key={category.href}>
            <h2><a href={category.href}>{category.label}</a></h2>
            <p>{category.description}</p>
            {articles.length > 0 ? <ThemeArticleList articles={articles} headingLevel={3} /> : null}
          </section>
        ))}
        {getThemeAdSlot(context, "home-feed")}
      </> : <>
        {lead.length > 0 ? (
          <section className="editorial-home-lead" aria-label="첫 안내">
            <ThemeArticleList articles={lead} headingLevel={2} />
          </section>
        ) : null}
        {secondary.length > 0 ? (
          <section className="editorial-home-secondary editorial-section" aria-label="이어지는 안내">
            <ThemeArticleList articles={secondary} headingLevel={2} />
          </section>
        ) : null}
        <section className="editorial-latest editorial-section">
          <h2>{route.articleSectionHeading}</h2>
          <ThemeArticleList articles={latest} headingLevel={3} />
          {getThemeAdSlot(context, "home-feed")}
        </section>
      </>}
      <ThemeHomeAboutTeaser teaser={route.aboutTeaser} />
    </div>
  );
}

function Category({ route }: { readonly route: CategoryRouteViewModel }) {
  return (
    <div data-route="category">
      <RouteHeader heading={route.heading} description={route.description} />
      <section className="editorial-list-section editorial-section">
        <h2>{route.articleSectionHeading}</h2>
        <ThemeArticleList articles={route.articles} headingLevel={3} />
        <ThemePagination pagination={route.pagination} />
      </section>
      {route.topicSectionHeading && route.topics.length > 0 ? (
        <section className="editorial-section">
          <h2>{route.topicSectionHeading}</h2>
          <ul className="editorial-topic-list">{route.topics.map((topic, index) => (
            <li key={`${topic}:${index}`}>{topic}</li>
          ))}</ul>
        </section>
      ) : null}
    </div>
  );
}

function StaticPage({ route }: { readonly route: StaticPageRouteViewModel }) {
  return (
    <article data-route="static-page">
      <RouteHeader heading={route.heading} description={route.description} />
      <div className="editorial-static-body">{route.body}</div>
    </article>
  );
}

function Archive({ route }: { readonly route: ArchiveRouteViewModel }) {
  return (
    <div data-route="archive">
      <RouteHeader heading={route.heading} description={route.description} />
      <section className="editorial-list-section">
        <ThemeArticleList articles={route.articles} headingLevel={2} ordered />
        <ThemePagination pagination={route.pagination} />
      </section>
    </div>
  );
}

function unreachable(value: never): never {
  throw new Error(`Unsupported editorial content route: ${JSON.stringify(value)}`);
}

export function EditorialContent({
  context = {},
  route,
}: {
  readonly context?: ThemeAdSlotContext;
  readonly route: ContentRouteViewModel;
}) {
  switch (route.kind) {
    case "home": return <Home context={context} route={route} />;
    case "category": return <Category route={route} />;
    case "article": return <EditorialArticle context={context} route={route} />;
    case "static-page": return <StaticPage route={route} />;
    case "archive": return <Archive route={route} />;
    default: return unreachable(route);
  }
}
