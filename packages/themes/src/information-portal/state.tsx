import type { ReactNode } from "react";

import type { StateRouteViewModel } from "../state-route-view-model.js";
import { ThemeRecoveryLinks } from "../theme-links.js";
import { PortalRouteIntro } from "./shell.js";

export function renderInformationPortalState(
  route: StateRouteViewModel,
): ReactNode {
  switch (route.kind) {
    case "search":
      return (
        <div className="ip-stack">
          <PortalRouteIntro route={route} />
          <section aria-label="사이트 검색 결과" className="ip-panel">{route.client}</section>
        </div>
      );
    case "not-found":
    case "retired":
      return (
        <section className="ip-panel ip-stack ip-state">
          <p className="ip-code">{route.statusCode}</p>
          <PortalRouteIntro route={route} />
          <p><a className="ip-action" href={route.action.href}>{route.action.label}</a></p>
          <ThemeRecoveryLinks items={route.recoveryLinks} />
        </section>
      );
    default: {
      const unhandled: never = route;
      return unhandled;
    }
  }
}
