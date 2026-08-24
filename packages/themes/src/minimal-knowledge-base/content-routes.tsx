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
} from "../theme-links.js";
import { MinimalKnowledgeBaseArticle } from "./article-route.js";
import { KnowledgeBreadcrumbs } from "./route-chrome.js";

function HomeRoute({ route }: { readonly route: HomeRouteViewModel }) {
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
      <section className="kb-latest-articles">
        <h2>{route.articleSectionHeading}</h2>
        <ThemeArticleList articles={route.articles} headingLevel={3} />
      </section>
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
