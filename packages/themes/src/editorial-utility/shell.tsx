import type { CSSProperties, ReactNode } from "react";

import type {
  LinkViewModel,
  SiteShellViewModel,
} from "../presentation-view-model.js";
import type { SemanticColorTokens, SkinId } from "../skin.js";
import {
  ThemeBreadcrumbs,
  ThemeFooterNavigation,
  ThemeNavigation,
} from "../theme-links.js";
import { EDITORIAL_UTILITY_STYLES } from "./styles.js";

type EditorialVariables = CSSProperties & Record<`--editorial-${string}`, string>;

function createColorVariables(colors: SemanticColorTokens): EditorialVariables {
  return {
    "--editorial-canvas": colors.canvas,
    "--editorial-surface": colors.surface,
    "--editorial-surface-muted": colors.surfaceMuted,
    "--editorial-text": colors.text,
    "--editorial-text-muted": colors.textMuted,
    "--editorial-primary": colors.primary,
    "--editorial-on-primary": colors.onPrimary,
    "--editorial-border": colors.border,
    "--editorial-success": colors.success,
    "--editorial-warning": colors.warning,
    "--editorial-danger": colors.danger,
    "--editorial-focus-ring": colors.focusRing,
  };
}

interface EditorialShellProps {
  readonly shell: SiteShellViewModel;
  readonly path: string;
  readonly breadcrumbs: readonly LinkViewModel[];
  readonly skinId: SkinId;
  readonly colors: SemanticColorTokens;
  readonly children: ReactNode;
}

export function EditorialShell({
  shell,
  path,
  breadcrumbs,
  skinId,
  colors,
  children,
}: EditorialShellProps) {
  return (
    <div
      className="editorial-utility"
      data-theme="editorial-utility"
      data-skin={skinId}
      lang={shell.locale}
      style={createColorVariables(colors)}
    >
      <style>{EDITORIAL_UTILITY_STYLES}</style>
      <a className="editorial-skip-link" href={shell.skipLink.href}>
        {shell.skipLink.label}
      </a>
      <header className="editorial-masthead">
        <div className="editorial-masthead__identity">
          <a className="editorial-brand" href={shell.brand.href}>
            {shell.brand.label}
          </a>
          <p>{shell.description}</p>
        </div>
        <div className="editorial-category-strip">
          <ThemeNavigation
            items={shell.primaryNavigation}
            ariaLabel="카테고리 및 주요 메뉴"
          />
        </div>
      </header>
      <main className="editorial-main" id="main-content" tabIndex={-1}>
        {breadcrumbs.length > 0 ? (
          <div className="editorial-breadcrumbs">
            <ThemeBreadcrumbs
              items={breadcrumbs}
              currentPath={path}
              ariaLabel="현재 위치"
            />
          </div>
        ) : null}
        {children}
      </main>
      <footer className="editorial-footer">
        <div className="editorial-footer__inner">
          {shell.footerText}
          <ThemeFooterNavigation items={shell.footerNavigation ?? []} />
        </div>
      </footer>
    </div>
  );
}
