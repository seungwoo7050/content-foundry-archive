import type { CSSProperties } from "react";

import type { SemanticColorTokens } from "../skin.js";

type PortalColorProperty =
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

type PortalColorStyle = CSSProperties &
  Readonly<Record<PortalColorProperty, string>>;

export function createPortalColorStyle(
  colors: SemanticColorTokens,
): PortalColorStyle {
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

export const INFORMATION_PORTAL_STYLES = `
.ip,.ip *{box-sizing:border-box}.ip{min-height:100vh;background:var(--color-canvas);color:var(--color-text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.55}.ip a{color:var(--color-primary);text-underline-offset:.2em}.ip a:focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px}
.ip-skip{position:absolute;top:-5rem;left:1rem;z-index:3;padding:.65rem 1rem;background:var(--color-primary);color:var(--color-on-primary)!important}.ip-skip:focus{top:.5rem}.ip-masthead{background:var(--color-surface);border-bottom:1px solid var(--color-border)}
.ip-brand-row,.ip-nav-row,.ip-main,.ip-footer-inner{width:min(100%,76rem);margin-inline:auto}.ip-brand-row{display:flex;flex-wrap:wrap;align-items:baseline;gap:.5rem 1rem;padding:.9rem 1rem}.ip-brand{font-size:1.35rem;font-weight:850;text-decoration:none}.ip-description{margin:0;color:var(--color-text-muted);font-size:.9rem}
.ip-nav-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.5rem 1rem;padding:0 1rem .7rem}.ip-nav-row ul{display:flex;flex-wrap:wrap;gap:.25rem;margin:0;padding:0;list-style:none}.ip-nav-row ul ul{margin-left:.5rem}.ip-nav-row a,.ip-action{display:inline-flex;min-height:44px;align-items:center;padding:.45rem .75rem;border:1px solid var(--color-border);background:var(--color-surface-muted);font-weight:700;text-decoration:none}.ip-nav-row .ip-masthead-search{border-color:var(--color-primary);background:var(--color-primary);color:var(--color-on-primary)!important}
.ip-main{display:grid;gap:.8rem;padding:.8rem 1rem 1.25rem}.ip-panel{border:1px solid var(--color-border);background:var(--color-surface);padding:.85rem}.ip-muted{background:var(--color-surface-muted)}.ip-stack{display:grid;gap:.8rem}.ip-intro h1{margin:.15rem 0;font-size:clamp(1.65rem,5vw,2.4rem);line-height:1.2}.ip-intro p{margin:.25rem 0;color:var(--color-text-muted)}
.ip-breadcrumbs ol{display:flex;flex-wrap:wrap;gap:.25rem;margin:0;padding:0;list-style:none;font-size:.85rem}.ip-breadcrumbs li+li:before{content:"›";margin-right:.25rem;color:var(--color-text-muted)}
.ip-search-action{display:flex;min-height:56px;align-items:center;justify-content:space-between;width:100%;padding:.75rem 1rem;background:var(--color-primary);color:var(--color-on-primary)!important;font-size:1.05rem;font-weight:800;text-decoration:none}.ip-directory{display:grid;grid-template-columns:1fr;gap:.5rem}.ip-directory article{border-top:3px solid var(--color-primary);background:var(--color-surface);padding:.75rem}.ip-directory h3,.ip-directory p{margin:.2rem 0}
.ip-list>ul,.ip-list>ol{display:grid;grid-template-columns:1fr;gap:.55rem;margin:0;padding:0;list-style:none}.ip-list article{height:100%;border:1px solid var(--color-border);background:var(--color-surface);padding:.75rem}.ip-list article>p:first-child{color:var(--color-text-muted);font-size:.82rem}.ip-list h2,.ip-list h3{margin:.2rem 0}.ip-topics{display:flex;flex-wrap:wrap;gap:.4rem;margin:0;padding:0;list-style:none}.ip-topics li{border:1px solid var(--color-border);background:var(--color-surface-muted);padding:.3rem .55rem}
:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight)>ul{gap:.6rem}
:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight) article{min-width:0;overflow-wrap:anywhere}
:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight) article>p:first-of-type{margin:.1rem 0 .4rem;color:var(--color-text-muted);font-size:.76rem}
:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight) article>h3{line-height:1.25}
:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight) article>h3 a{color:var(--color-text)}
:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight) article>h3+p{margin:.5rem 0 0;color:var(--color-text-muted)}
:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight) article>ul{display:flex;flex-wrap:wrap;gap:.25rem;margin:.7rem 0 0;padding:0;list-style:none}
:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight) article>ul li{padding:.15rem .4rem;background:var(--color-surface-muted);border:1px solid var(--color-border);font-size:.7rem}
:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight) .content-image{margin:0 0 .65rem}
:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight) .content-image picture{display:block}
:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight) .content-image img{display:block;width:100%;max-width:100%;height:auto}
:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight) .content-image figcaption{margin-top:.3rem;color:var(--color-text-muted);font-size:.7rem}
.ip-home-featured>h2{padding-bottom:.45rem;border-bottom:3px solid var(--color-primary);font-size:1.35rem}
.ip-home-featured article{background:var(--color-surface-muted);border-top:4px solid var(--color-primary);padding:clamp(.75rem,2vw,1.15rem)}
.ip-home-featured article>h3{font-size:clamp(1.2rem,2.6vw,1.65rem)}
.ip-home-current article{border-left:3px solid var(--color-primary)}
.ip-home-current article>h3{font-size:1.08rem}
.ip-home-reference>ul{gap:.4rem}
.ip-home-reference article{padding:.6rem;background:var(--color-surface-muted);font-size:.9rem}
.ip-home-reference article>h3{font-size:.98rem}
.ip-home-latest article{border-top:2px solid var(--color-border)}
.ip-home-category-highlight{background:var(--color-surface-muted)}
.ip-home-category-highlight>h2{margin-top:0}
.ip-home-category-highlight>h2 a{color:var(--color-text)}
.ip-home-category-highlight>p{color:var(--color-text-muted);font-size:.88rem}
.ip-home-category-highlight article{background:var(--color-surface)}
.ip-article-reading-time{justify-self:start;margin:0;padding:.3rem .65rem;border:1px solid var(--color-border);border-left:3px solid var(--color-primary);background:var(--color-surface-muted);color:var(--color-text-muted);font-size:.85rem;font-weight:750}.ip-article-layout{display:grid;gap:.8rem}.ip-article-main,.ip-article-rail{display:grid;align-content:start;gap:.8rem}.ip-summary{border-left:4px solid var(--color-primary)}.ip-article-topics>.theme-article-topics{display:flex;flex-wrap:wrap;gap:.35rem;margin:0;padding:0;list-style:none}.ip-article-topics>.theme-article-topics li{padding:.25rem .55rem;background:var(--color-surface-muted);border:1px solid var(--color-border);font-size:.85rem}.ip-body{min-width:0;overflow-wrap:anywhere}.ip-body :where(img,video,iframe){max-width:100%;height:auto}.ip-body table{display:block;max-width:100%;overflow-x:auto}.ip-trust dl{display:grid;grid-template-columns:max-content 1fr;gap:.25rem .6rem;margin-bottom:0}.ip-trust dt{font-weight:800}.ip-trust dd{margin:0}.ip-toc ol{margin-bottom:0;padding-left:1.25rem}
.ip-state{max-width:46rem;margin-inline:auto;text-align:center;padding-block:2rem}.ip-code{color:var(--color-danger);font-weight:850}.ip-footer{border-top:1px solid var(--color-border);background:var(--color-surface);padding:1rem}.ip-footer p{margin:0;color:var(--color-text-muted);font-size:.9rem}
@media (min-width:44rem){.ip-directory{grid-template-columns:repeat(3,minmax(0,1fr))}.ip-list>ul,.ip-list>ol{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:64rem){
  .ip-article-layout{grid-template-columns:minmax(0,1fr) minmax(15rem,20rem)}
  .ip-article-main{grid-column:1;grid-row:1}
  .ip-article-rail{grid-column:2;grid-row:1}
  .ip-list>ul,.ip-list>ol{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media (max-width:30rem){:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight)>ul{grid-template-columns:1fr;gap:.4rem}:is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight) article{padding:.65rem}.ip-home-category-highlight{padding:.7rem}}
@media (min-width:64rem){.ip-home-featured>ul{grid-template-columns:repeat(2,minmax(0,1fr))}.ip-home-featured>ul>li:first-child{grid-column:1/-1}.ip-home-reference>ul{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (prefers-reduced-motion:reduce){.ip,.ip *{scroll-behavior:auto!important;animation-name:none!important;transition-duration:.01ms!important}}
@media print{
  .ip{min-height:auto;background:#fff;color:#000;font-family:ui-serif,Georgia,serif;font-size:11pt;line-height:1.55}
  .ip-masthead,.ip-footer,.ip-skip,.ip-breadcrumbs,.ip aside[aria-label="광고"],.ip button{display:none!important}
  .ip-main{display:block;width:100%;padding:0}.ip-article-layout,.ip-article-main{display:block}
  .ip-panel,.ip-list article{break-inside:avoid;border:1px solid #aaa;background:#fff}
  .ip-article-rail{display:block;margin-block:1rem;padding:.8rem;break-inside:avoid;border:1px solid #aaa;background:#fff}
  .ip-article-rail>.ip-panel{margin:0;border:0;background:#fff}
  .ip-article-rail>.ip-panel+.ip-panel{margin-top:.75rem;padding-top:.75rem;border-top:1px solid #aaa}
  .ip-body a[href^="http"]::after{content:" (" attr(href) ")";font-size:.8em;overflow-wrap:anywhere}
  :is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight)>ul{display:block}
  :is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight)>ul>li{margin-bottom:.8rem;break-inside:avoid}
  :is(.ip-home-featured,.ip-home-current,.ip-home-reference,.ip-home-latest,.ip-home-category-highlight) .content-image{max-width:30rem}
}
`;
