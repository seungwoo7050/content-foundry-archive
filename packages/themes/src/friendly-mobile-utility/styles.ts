import type { CSSProperties } from "react";

import type { SemanticColorTokens } from "../skin.js";

type FriendlyColorProperty =
  | `--color-${
      | "canvas"
      | "surface"
      | "surface-muted"
      | "text"
      | "text-muted"
      | "primary"
      | "on-primary"
      | "border"
      | "success"
      | "warning"
      | "danger"}`
  | "--focus-ring";

type FriendlyColorStyle = CSSProperties &
  Readonly<Record<FriendlyColorProperty, string>>;

export function createFriendlyColorStyle(
  colors: SemanticColorTokens,
): FriendlyColorStyle {
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
  };
}

export const FRIENDLY_MOBILE_STYLES = `
.fmu,.fmu *{box-sizing:border-box}.fmu{min-height:100vh;background:var(--color-canvas);color:var(--color-text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6}
.fmu a{color:var(--color-primary);text-underline-offset:.2em}.fmu a:focus-visible{outline:3px solid var(--focus-ring);outline-offset:3px}
.fmu-skip{position:absolute;left:.75rem;top:-5rem;z-index:2;background:var(--color-primary);color:var(--color-on-primary)!important;padding:.75rem 1rem;border-radius:.75rem}.fmu-skip:focus{top:.75rem}
.fmu-header{background:var(--color-surface);border-bottom:1px solid var(--color-border);padding:1rem}.fmu-header-inner,.fmu-main,.fmu-footer-inner{width:min(100%,48rem);margin-inline:auto}
.fmu-brand{display:inline-flex;align-items:center;min-height:48px;font-size:1.25rem;font-weight:800;text-decoration:none}.fmu-tagline{margin:.15rem 0 .75rem;color:var(--color-text-muted)}
.fmu-nav ul{display:flex;flex-wrap:wrap;gap:.5rem;margin:0;padding:0;list-style:none}.fmu-nav ul ul{margin-top:.5rem}.fmu-nav a,.fmu-action{display:inline-flex;min-height:48px;align-items:center;justify-content:center;padding:.65rem 1rem;border-radius:.8rem;border:1px solid var(--color-border);background:var(--color-surface-muted);font-weight:700;text-decoration:none}
.fmu-main{display:grid;gap:1rem;padding:1rem}.fmu-stack{display:grid;gap:1rem}.fmu-panel{padding:1rem;border:1px solid var(--color-border);border-radius:1rem;background:var(--color-surface)}
.fmu-primary{background:var(--color-primary);color:var(--color-on-primary)!important;border-color:var(--color-primary)}.fmu-grid{display:grid;grid-template-columns:1fr;gap:.75rem}.fmu-grid .fmu-action{justify-content:flex-start}
.fmu-eyebrow{margin:0;color:var(--color-primary);font-weight:800}.fmu-intro h1{margin:.25rem 0;font-size:clamp(1.8rem,8vw,2.6rem);line-height:1.2}.fmu-intro>p:last-child{margin-bottom:0;color:var(--color-text-muted)}
.fmu-breadcrumbs ol{display:flex;flex-wrap:wrap;gap:.35rem;margin:0;padding:0;list-style:none;font-size:.9rem}.fmu-breadcrumbs li+li:before{content:"/";margin-right:.35rem;color:var(--color-text-muted)}
.fmu-list>ul,.fmu-list>ol{display:grid;gap:.75rem;margin:0;padding:0;list-style:none}.fmu-list article{padding:1rem;border:1px solid var(--color-border);border-radius:.9rem;background:var(--color-surface)}.fmu-list article>p:first-child{color:var(--color-text-muted);font-size:.9rem}.fmu-list h2,.fmu-list h3{margin:.3rem 0}
.fmu-stack>.theme-article-topics{display:flex;flex-wrap:wrap;gap:.4rem;margin:0;padding:0;list-style:none}.fmu-stack>.theme-article-topics li{padding:.25rem .65rem;background:var(--color-surface-muted);border:1px solid var(--color-border);border-radius:999px;color:var(--color-text-muted);font-size:.85rem}.fmu-summary{background:var(--color-surface-muted)}.fmu-trust dl{display:grid;grid-template-columns:max-content 1fr;gap:.35rem .75rem}.fmu-trust dt{font-weight:800}.fmu-trust dd{margin:0}.fmu-body{min-width:0;overflow-wrap:anywhere}.fmu-body :where(img,video,iframe){max-width:100%;height:auto}.fmu-body table{display:block;max-width:100%;overflow-x:auto}
.fmu-status{text-align:center;padding-block:2rem}.fmu-status-code{font-size:1rem;font-weight:800;color:var(--color-danger)}.fmu-footer{margin-top:1rem;border-top:1px solid var(--color-border);background:var(--color-surface);padding:1.25rem}.fmu-footer p{margin:0;color:var(--color-text-muted)}
@media (min-width:42rem){.fmu-header,.fmu-main{padding-inline:1.5rem}.fmu-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.fmu-panel{padding:1.35rem}}
@media (prefers-reduced-motion:reduce){.fmu,.fmu *{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
@media print{
  .fmu{min-height:auto;background:#fff;color:#000;font-family:ui-serif,Georgia,serif;font-size:11pt;line-height:1.55}
  .fmu-header,.fmu-footer,.fmu-skip,.fmu-nav,.fmu aside[aria-label="광고"],.fmu button{display:none!important}
  .fmu-main{display:block;width:100%;padding:0}
  .fmu-stack{display:block}.fmu-stack>*+*{margin-top:1rem}
  .fmu-panel,.fmu-list article{break-inside:avoid;border:1px solid #aaa;border-radius:0;background:#fff}
  .fmu a{color:inherit;text-decoration:underline}
  .fmu-body a[href^="http"]::after{content:" (" attr(href) ")";font-size:.8em;overflow-wrap:anywhere}
}
`;
