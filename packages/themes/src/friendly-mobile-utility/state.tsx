import type { ReactNode } from "react";

import type { StateRouteViewModel } from "../state-route-view-model.js";
import { ThemeRecoveryLinks } from "../theme-links.js";
import { FriendlyRouteIntro } from "./shell.js";

export function renderFriendlyStateRoute(
  route: StateRouteViewModel,
): ReactNode {
  switch (route.kind) {
    case "search":
      return (
        <div className="fmu-stack">
          <FriendlyRouteIntro route={route} />
          <section aria-label="사이트 검색" className="fmu-panel">
            {route.client}
          </section>
        </div>
      );
    case "not-found":
      return (
        <section className="fmu-panel fmu-stack fmu-status">
          <FriendlyRouteIntro eyebrow={`${route.statusCode}`} route={route} />
          <p><a className="fmu-action fmu-primary" href={route.action.href}>{route.action.label}</a></p>
          <ThemeRecoveryLinks items={route.recoveryLinks} />
        </section>
      );
    case "retired":
      return (
        <section className="fmu-panel fmu-stack fmu-status">
          <FriendlyRouteIntro eyebrow={`${route.statusCode}`} route={route} />
          <p><a className="fmu-action fmu-primary" href={route.action.href}>{route.action.label}</a></p>
          <ThemeRecoveryLinks items={route.recoveryLinks} />
        </section>
      );
    default: {
      const unhandled: never = route;
      return unhandled;
    }
  }
}
