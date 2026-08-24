import type {
  ArchiveRouteViewModel,
  CategoryRouteViewModel,
  ContentRouteViewModel,
  HomeRouteViewModel,
  StaticPageRouteViewModel,
} from "../content-route-view-model.js";
import type { ThemeAdSlotContext } from "../theme-ad-slot.js";
import {
  ThemeArticleList,
  ThemeHomeAboutTeaser,
  ThemePagination,
} from "../theme-links.js";
import { MinimalKnowledgeBaseArticle } from "./article-route.js";
import { KnowledgeBreadcrumbs } from "./route-chrome.js";

function KnowledgeHomeGroup({
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
    <section aria-labelledby={headingId} className={`${className} kb-home-article-group`}>
      <h2 id={headingId}>{heading}</h2>
      <ThemeArticleList articles={articles} headingLevel={3} />
    </section>
  ) : null;
}

function HomeRoute({ route }: { readonly route: HomeRouteViewModel }) {
  const hasPresentation = route.featuredArticles !== undefined
    || route.currentArticles !== undefined
    || route.evergreenArticles !== undefined
    || route.latestArticles !== undefined
    || route.categoryHighlights !== undefined;
  return (
    <div className="kb-home-route" data-route="home">
      <header><h1>{route.heading}</h1><p>{route.description}</p></header>
      {route.searchLink ? (
        <section className="kb-home-search">
          <h2><a href={route.searchLink.href}>{route.searchLink.label}</a></h2>
        </section>
      ) : null}
      {route.categories.length > 0 ? (
        <section
          aria-labelledby="kb-home-categories-title"
          className="kb-category-grid"
        >
          <h2 id="kb-home-categories-title">카테고리</h2>
          <ul>{route.categories.map((category) => (
            <li key={category.href}>
              <a href={category.href}>{category.label}</a>
              <p>{category.description}</p>
            </li>
          ))}</ul>
        </section>
      ) : null}
      {hasPresentation ? <>
        <KnowledgeHomeGroup articles={route.currentArticles} className="kb-home-current" heading="지금 확인할 안내" headingId="kb-home-current-title" />
        <KnowledgeHomeGroup articles={route.featuredArticles} className="kb-home-featured" heading="먼저 읽을 안내" headingId="kb-home-featured-title" />
        <KnowledgeHomeGroup articles={route.evergreenArticles} className="kb-home-reference" heading="기본 안내" headingId="kb-home-reference-title" />
        <KnowledgeHomeGroup articles={route.latestArticles} className="kb-home-latest" heading={route.articleSectionHeading} headingId="kb-home-latest-title" />
        {route.categoryHighlights?.map(({ category, articles }, index) => (
          <section aria-labelledby={`kb-home-highlight-${index}`} className="kb-home-category-highlight kb-home-article-group" key={category.href}>
            <h2 id={`kb-home-highlight-${index}`}><a href={category.href}>{category.label}</a></h2>
            <p>{category.description}</p>
            {articles.length > 0 ? <ThemeArticleList articles={articles} headingLevel={3} /> : null}
          </section>
        ))}
      </> : (
        <section className="kb-latest-articles">
          <h2>{route.articleSectionHeading}</h2>
          <ThemeArticleList articles={route.articles} headingLevel={3} />
        </section>
      )}
      <ThemeHomeAboutTeaser teaser={route.aboutTeaser} />
    </div>
  );
}

function CategoryRoute({ route }: { readonly route: CategoryRouteViewModel }) {
  return (
    <div className="kb-category-route" data-route="category">
      <KnowledgeBreadcrumbs route={route} />
      <header className="kb-category-scope">
        <h1>{route.heading}</h1><p>{route.description}</p>
      </header>
      <section className="kb-category-articles">
        <h2>{route.articleSectionHeading}</h2>
        <ThemeArticleList articles={route.articles} headingLevel={3} />
        <ThemePagination pagination={route.pagination} />
      </section>
      {route.topics.length > 0 ? (
        <section className="kb-category-topics">
          {route.topicSectionHeading ? <h2>{route.topicSectionHeading}</h2> : null}
          <ul>{route.topics.map((topic, index) => <li key={`${topic}:${index}`}>{topic}</li>)}</ul>
        </section>
      ) : null}
    </div>
  );
}

function StaticPageRoute({ route }: { readonly route: StaticPageRouteViewModel }) {
  return (
    <article className="kb-static-route" data-route="static-page">
      <KnowledgeBreadcrumbs route={route} />
      <header><h1>{route.heading}</h1><p>{route.description}</p></header>
      <div className="kb-static-body">{route.body}</div>
    </article>
  );
}

function ArchiveRoute({ route }: { readonly route: ArchiveRouteViewModel }) {
  return (
    <div className="kb-archive-route" data-route="archive">
      <KnowledgeBreadcrumbs route={route} />
      <header><h1>{route.heading}</h1><p>{route.description}</p></header>
      <ThemeArticleList articles={route.articles} headingLevel={2} ordered />
      <ThemePagination pagination={route.pagination} />
    </div>
  );
}

function unreachable(value: never): never {
  throw new Error(`Unsupported content route: ${JSON.stringify(value)}`);
}

export function MinimalKnowledgeBaseContentRoute({
  context = {},
  route,
}: {
  readonly context?: ThemeAdSlotContext;
  readonly route: ContentRouteViewModel;
}) {
  switch (route.kind) {
    case "home": return <HomeRoute route={route} />;
    case "category": return <CategoryRoute route={route} />;
    case "article": return <MinimalKnowledgeBaseArticle context={context} route={route} />;
    case "static-page": return <StaticPageRoute route={route} />;
    case "archive": return <ArchiveRoute route={route} />;
    default: return unreachable(route);
  }
}
