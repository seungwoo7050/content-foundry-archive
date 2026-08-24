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
          <div className="personal-nav">
            <ThemeNavigation ariaLabel="주요 메뉴" items={shell.primaryNavigation} />
          </div>
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
