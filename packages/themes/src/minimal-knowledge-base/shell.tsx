import type { CSSProperties, ReactNode } from "react";

import type { SiteShellViewModel } from "../presentation-view-model.js";
import type { ThemeRenderContext } from "../html-route-view-model.js";
import { ThemeFooterNavigation, ThemeNavigation } from "../theme-links.js";
import { MINIMAL_KNOWLEDGE_BASE_STYLES } from "./styles.js";

function semanticColorProperties(
  colors: ThemeRenderContext["colors"],
): CSSProperties {
  return {
    "--color-canvas": colors.canvas,
    "--color-surface": colors.surface,
    "--color-surface-muted": colors.surfaceMuted,
    "--color-text": colors.text,
    "--color-text-muted": colors.textMuted,
    "--color-primary": colors.primary,
    "--color-on-primary": colors.onPrimary,
    "--color-border": colors.border,
    "--color-success": colors.success,
    "--color-warning": colors.warning,
    "--color-danger": colors.danger,
    "--focus-ring": colors.focusRing,
  } as CSSProperties;
}

export function MinimalKnowledgeBaseShell({
  shell,
  context,
  children,
}: {
  readonly shell: SiteShellViewModel;
  readonly context: ThemeRenderContext;
  readonly children: ReactNode;
}) {
  return (
    <div
      className="theme-minimal-knowledge-base"
      data-skin={context.skinId}
      data-theme="minimal-knowledge-base"
      lang={shell.locale}
      style={semanticColorProperties(context.colors)}
    >
      <style>{MINIMAL_KNOWLEDGE_BASE_STYLES}</style>
      <a className="kb-skip-link" href={shell.skipLink.href}>
        {shell.skipLink.label}
      </a>
      <aside className="kb-knowledge-rail">
        <header className="kb-rail-header">
          <a href={shell.brand.href}>{shell.brand.label}</a>
          <p>{shell.description}</p>
        </header>
        <ThemeNavigation
          ariaLabel={shell.brand.label}
          items={shell.primaryNavigation}
        />
      </aside>
      <main id="main-content">{children}</main>
      <footer className="kb-footer">
        <small>{shell.footerText}</small>
        <ThemeFooterNavigation items={shell.footerNavigation ?? []} />
      </footer>
    </div>
  );
}
