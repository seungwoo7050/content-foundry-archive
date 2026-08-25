import type { ReactNode } from "react";

import type { ThemePageViewModel, ThemeRenderContext } from "../html-route-view-model.js";
import {
  ThemeBreadcrumbs,
  ThemeFooterNavigation,
  ThemeNavigation,
} from "../theme-links.js";
import { createPersonalColorStyle } from "./colors.js";
import { CLEAN_PERSONAL_BLOG_STYLES } from "./styles.js";

export function CleanPersonalBlogShell({
  model,
  context,
  children,
}: {
  readonly model: ThemePageViewModel;
  readonly context: ThemeRenderContext;
  readonly children: ReactNode;
}) {
  const { shell, route } = model;
  const mastheadNavigation = shell.primaryNavigation.length > 0 || shell.searchLink ? (
    <>
      <ThemeNavigation
        ariaLabel="주요 메뉴"
        currentPath={route.path}
        items={shell.primaryNavigation}
      />
      {shell.searchLink ? (
        <a className="personal-masthead-search" href={shell.searchLink.href}>
          {shell.searchLink.label}
        </a>
      ) : null}
    </>
  ) : null;
  return (
    <div
      className="personal-blog"
      data-skin={context.skinId}
      data-theme="clean-personal-blog"
      lang={shell.locale}
      style={createPersonalColorStyle(context.colors)}
    >
      <style>{CLEAN_PERSONAL_BLOG_STYLES}</style>
      <a className="personal-skip" href={shell.skipLink.href}>
        {shell.skipLink.label}
      </a>
      <header className="personal-masthead">
        <div className="personal-masthead__inner">
          <a className="personal-title" href={shell.brand.href}>
            {shell.brand.label}
          </a>
          <p className="personal-tagline">{shell.description}</p>
          {mastheadNavigation ? <>
            <div className="personal-nav personal-nav--wide">
              {mastheadNavigation}
            </div>
            <details className="personal-menu">
              <summary>메뉴</summary>
              <div className="personal-nav">{mastheadNavigation}</div>
            </details>
          </> : null}
        </div>
      </header>
      <main className="personal-main" data-route={route.kind} id="main-content" tabIndex={-1}>
        <div className="personal-reading-column">
          {route.breadcrumbs.length > 0 ? (
            <div className="personal-breadcrumbs">
              <ThemeBreadcrumbs
                ariaLabel="현재 위치"
                currentPath={route.path}
                items={route.breadcrumbs}
              />
            </div>
          ) : null}
          {children}
        </div>
      </main>
      <footer className="personal-footer">
        <div className="personal-footer__inner">
          {shell.footerText}
          <ThemeFooterNavigation items={shell.footerNavigation ?? []} />
        </div>
      </footer>
    </div>
  );
}
