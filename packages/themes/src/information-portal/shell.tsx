import type { ReactNode } from "react";

import type { HtmlRouteKind, ThemeRenderContext } from "../html-route-view-model.js";
import type { SiteShellViewModel } from "../presentation-view-model.js";
import type { RouteBaseViewModel } from "../route-base-view-model.js";
import {
  ThemeBreadcrumbs,
  ThemeFooterNavigation,
  ThemeNavigation,
} from "../theme-links.js";
import {
  createPortalColorStyle,
  INFORMATION_PORTAL_STYLES,
} from "./styles.js";

export function PortalRouteIntro({
  route,
  showDescription = true,
}: {
  readonly route: RouteBaseViewModel<string>;
  readonly showDescription?: boolean;
}) {
  return (
    <div className="ip-stack ip-intro">
      <div className="ip-breadcrumbs">
        <ThemeBreadcrumbs
          ariaLabel="현재 위치"
          currentPath={route.path}
          items={route.breadcrumbs}
        />
      </div>
      <header>
        <h1>{route.heading}</h1>
        {showDescription ? <p>{route.description}</p> : null}
      </header>
    </div>
  );
}

export function InformationPortalShell({
  shell,
  routeKind,
  context,
  children,
}: {
  readonly shell: SiteShellViewModel;
  readonly routeKind: HtmlRouteKind;
  readonly context: ThemeRenderContext;
  readonly children: ReactNode;
}) {
  return (
    <div
      className="ip"
      data-skin={context.skinId}
      data-theme="information-portal"
      lang={shell.locale}
      style={createPortalColorStyle(context.colors)}
    >
      <style>{INFORMATION_PORTAL_STYLES}</style>
      <a className="ip-skip" href={shell.skipLink.href}>{shell.skipLink.label}</a>
      <header className="ip-masthead">
        <div className="ip-brand-row">
          <a className="ip-brand" href={shell.brand.href}>{shell.brand.label}</a>
          <p className="ip-description">{shell.description}</p>
        </div>
        <div className="ip-nav-row">
          <ThemeNavigation ariaLabel="주요 메뉴" items={shell.primaryNavigation} />
        </div>
      </header>
      <main className="ip-main" data-route-kind={routeKind} id="main-content">
        {children}
      </main>
      <footer className="ip-footer">
        <div className="ip-footer-inner">
          <p>{shell.footerText}</p>
          <ThemeFooterNavigation items={shell.footerNavigation ?? []} />
        </div>
      </footer>
    </div>
  );
}
