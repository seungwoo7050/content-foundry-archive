import type { StateRouteViewModel } from "../state-route-view-model.js";
import { ThemeRecoveryLinks } from "../theme-links.js";

function Search({ route }: { readonly route: Extract<StateRouteViewModel, { kind: "search" }> }) {
  return (
    <div data-route="search">
      <header className="editorial-route-header"><h1>{route.heading}</h1><p>{route.description}</p></header>
      <div className="editorial-search-client">{route.client}</div>
    </div>
  );
}

function Status({
  route,
}: {
  readonly route: Exclude<StateRouteViewModel, { kind: "search" }>;
}) {
  return (
    <section className={`editorial-state editorial-state--${route.kind}`} data-route={route.kind}>
      <p className="editorial-state__code">{route.statusCode}</p>
      <h1>{route.heading}</h1>
      <p>{route.description}</p>
      <p><a className="editorial-state__action" href={route.action.href}>{route.action.label}</a></p>
      <ThemeRecoveryLinks items={route.recoveryLinks} />
    </section>
  );
}

function unreachable(value: never): never {
  throw new Error(`Unsupported editorial state route: ${JSON.stringify(value)}`);
}

export function EditorialState({ route }: { readonly route: StateRouteViewModel }) {
  switch (route.kind) {
    case "search": return <Search route={route} />;
    case "not-found": return <Status route={route} />;
    case "retired": return <Status route={route} />;
    default: return unreachable(route);
  }
}
