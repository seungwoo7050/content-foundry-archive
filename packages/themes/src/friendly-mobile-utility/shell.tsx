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
  createFriendlyColorStyle,
  FRIENDLY_MOBILE_STYLES,
} from "./styles.js";

export function FriendlyRouteIntro({
  route,
  eyebrow,
  showDescription = true,
}: {
  readonly route: RouteBaseViewModel<string>;
  readonly eyebrow?: string;
  readonly showDescription?: boolean;
}) {
  return (
    <div className="fmu-stack fmu-intro">
      <div className="fmu-breadcrumbs">
        <ThemeBreadcrumbs
          ariaLabel="현재 위치"
          currentPath={route.path}
          items={route.breadcrumbs}
        />
      </div>
      <header>
        {eyebrow ? <p className="fmu-eyebrow">{eyebrow}</p> : null}
        <h1>{route.heading}</h1>
        {showDescription ? <p>{route.description}</p> : null}
      </header>
    </div>
  );
}

export function FriendlyMobileShell({
  shell,
  routeKind,
  routePath,
  context,
  children,
}: {
  readonly shell: SiteShellViewModel;
  readonly routeKind: HtmlRouteKind;
  readonly routePath: string;
  readonly context: ThemeRenderContext;
  readonly children: ReactNode;
}) {
  return (
    <div
      className="fmu"
      data-skin={context.skinId}
      data-theme="friendly-mobile-utility"
      lang={shell.locale}
      style={createFriendlyColorStyle(context.colors)}
    >
      <style>{FRIENDLY_MOBILE_STYLES}</style>
      <a className="fmu-skip" href={shell.skipLink.href}>
        {shell.skipLink.label}
      </a>
      <header className="fmu-header">
        <div className="fmu-header-inner">
          <a className="fmu-brand" href={shell.brand.href}>
            {shell.brand.label}
          </a>
          <p className="fmu-tagline">{shell.description}</p>
          {shell.searchLink ? (
            <a className="fmu-header-search" href={shell.searchLink.href}>
              {shell.searchLink.label}
            </a>
          ) : null}
          {shell.primaryNavigation.length > 0 ? (
            <>
              <div className="fmu-nav fmu-nav-wide">
                <ThemeNavigation
                  ariaLabel="주요 메뉴"
                  currentPath={routePath}
                  items={shell.primaryNavigation}
                />
              </div>
              <details className="fmu-menu">
                <summary>메뉴</summary>
                <div className="fmu-nav">
                  <ThemeNavigation
                    ariaLabel="주요 메뉴"
                    currentPath={routePath}
                    items={shell.primaryNavigation}
                  />
                </div>
              </details>
            </>
          ) : null}
        </div>
      </header>
      <main
        className="fmu-main"
        data-route-kind={routeKind}
        id="main-content"
        tabIndex={-1}
      >
        {children}
      </main>
      <footer className="fmu-footer">
        <div className="fmu-footer-inner">
          <p>{shell.footerText}</p>
          <ThemeFooterNavigation items={shell.footerNavigation ?? []} />
        </div>
      </footer>
    </div>
  );
}
