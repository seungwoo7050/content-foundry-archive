import type {
  NotFoundRouteViewModel,
  RetiredRouteViewModel,
  SearchRouteViewModel,
  StateRouteViewModel,
} from "../state-route-view-model.js";
import { ThemeRecoveryLinks } from "../theme-links.js";
import { KnowledgeBreadcrumbs } from "./route-chrome.js";

function SearchRoute({ route }: { readonly route: SearchRouteViewModel }) {
  return (
    <div className="kb-search-route" data-route="search">
      <KnowledgeBreadcrumbs route={route} />
      <header><h1>{route.heading}</h1><p>{route.description}</p></header>
      <div className="kb-search-client">{route.client}</div>
    </div>
  );
}

function NotFoundRoute({ route }: { readonly route: NotFoundRouteViewModel }) {
  return (
    <section className="kb-not-found-route" data-route="not-found">
      <KnowledgeBreadcrumbs route={route} />
      <p>{route.statusCode}</p><h1>{route.heading}</h1><p>{route.description}</p>
      <p><a href={route.action.href}>{route.action.label}</a></p>
      <ThemeRecoveryLinks items={route.recoveryLinks} />
    </section>
  );
}

function RetiredRoute({ route }: { readonly route: RetiredRouteViewModel }) {
  return (
    <section className="kb-retired-route" data-route="retired">
      <KnowledgeBreadcrumbs route={route} />
      <p>{route.statusCode}</p><h1>{route.heading}</h1><p>{route.description}</p>
      <p><a href={route.action.href}>{route.action.label}</a></p>
      <ThemeRecoveryLinks items={route.recoveryLinks} />
    </section>
  );
}

function unreachable(value: never): never {
  throw new Error(`Unsupported state route: ${JSON.stringify(value)}`);
}

export function MinimalKnowledgeBaseStateRoute({
  route,
}: {
  readonly route: StateRouteViewModel;
}) {
  switch (route.kind) {
    case "search": return <SearchRoute route={route} />;
    case "not-found": return <NotFoundRoute route={route} />;
    case "retired": return <RetiredRoute route={route} />;
    default: return unreachable(route);
  }
}
