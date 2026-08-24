import type { StateRouteViewModel } from "../state-route-view-model.js";
import { ThemeRecoveryLinks } from "../theme-links.js";

function unreachable(value: never): never {
  throw new Error(`Unsupported personal state route: ${JSON.stringify(value)}`);
}

export function CleanPersonalState({ route }: { readonly route: StateRouteViewModel }) {
  switch (route.kind) {
    case "search":
      return (
        <div className="personal-search">
          <header className="personal-route-header"><h1>{route.heading}</h1><p>{route.description}</p></header>
          <div className="personal-search-client">{route.client}</div>
        </div>
      );
    case "not-found":
    case "retired":
      return (
        <section className={`personal-state personal-state--${route.kind}`}>
          <p className="personal-state__code">{route.statusCode}</p>
          <h1>{route.heading}</h1><p>{route.description}</p>
          <p><a className="personal-state__action" href={route.action.href}>{route.action.label}</a></p>
          <ThemeRecoveryLinks items={route.recoveryLinks} />
        </section>
      );
    default: return unreachable(route);
  }
}
