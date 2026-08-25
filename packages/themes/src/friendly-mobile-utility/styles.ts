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
.fmu-header{background:var(--color-surface);border-bottom:1px solid var(--color-border);padding:1rem}.fmu-header-inner,.fmu-main,.fmu-footer-inner{width:min(100%,48rem);margin-inline:auto}.fmu-header-inner{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:.15rem .75rem}
.fmu-brand{display:inline-flex;align-items:center;min-height:48px;font-size:1.25rem;font-weight:800;text-decoration:none}.fmu-tagline{grid-column:1;margin:0;color:var(--color-text-muted)}
.fmu-header-search{display:inline-flex;min-height:48px;grid-column:2;grid-row:1/3;align-items:center;justify-content:center;padding:.65rem 1rem;color:var(--color-on-primary)!important;background:var(--color-primary);border:1px solid var(--color-primary);border-radius:.8rem;font-weight:800;text-decoration:none}
.fmu-nav-wide{display:none}.fmu-menu{grid-column:1/-1;margin-top:.65rem}.fmu-menu>summary{display:flex;min-height:44px;align-items:center;justify-content:center;padding:.55rem .8rem;border:1px solid var(--color-border);border-radius:.8rem;background:var(--color-surface-muted);color:var(--color-primary);font-weight:800;cursor:pointer}.fmu-menu[open]>.fmu-nav{margin-top:.5rem}
.fmu-nav ul{display:flex;flex-wrap:wrap;gap:.5rem;margin:0;padding:0;list-style:none}.fmu-nav ul ul{margin-top:.5rem}.fmu-nav a,.fmu-action{display:inline-flex;min-height:48px;align-items:center;justify-content:center;padding:.65rem 1rem;border-radius:.8rem;border:1px solid var(--color-border);background:var(--color-surface-muted);font-weight:700;text-decoration:none}
.fmu-main{display:grid;gap:1rem;padding:1rem}.fmu-stack{display:grid;gap:1rem}.fmu-panel{padding:1rem;border:1px solid var(--color-border);border-radius:1rem;background:var(--color-surface)}
.fmu .search-controller{min-width:0}
.fmu .search-controller form{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:.65rem}
.fmu .search-controller label{grid-column:1/-1;font-weight:800}
.fmu .search-controller input{width:100%;min-width:0;min-height:48px;padding:.65rem .8rem;color:var(--color-text);background:var(--color-surface);border:1px solid var(--color-border);border-radius:.8rem}
.fmu .search-controller button{min-height:48px;padding:.65rem 1rem;color:var(--color-on-primary);background:var(--color-primary);border:1px solid var(--color-primary);border-radius:.8rem;font:inherit;font-weight:800;cursor:pointer}
.fmu .search-controller button:disabled{cursor:wait;opacity:.58}
.fmu .search-controller>#site-search-status{margin:.75rem 0 0;color:var(--color-text-muted);font-size:.9rem}
.fmu :is(.search-results,.search-fallback){min-width:0;overflow-wrap:anywhere}
.fmu .search-results,.fmu .search-fallback ul{display:grid;gap:.75rem;margin:1rem 0 0;padding:0;list-style:none}
.fmu .search-results article{min-width:0;padding:1rem;overflow-wrap:anywhere;border:1px solid var(--color-border);border-radius:.8rem;background:var(--color-surface-muted)}
.fmu .search-results h3{margin:.2rem 0}.fmu .search-results p{margin:.45rem 0 0}.fmu .search-results p:last-child{color:var(--color-text-muted);font-size:.82rem}
.fmu .search-fallback ul{display:flex;flex-wrap:wrap}.fmu .search-fallback a{display:inline-flex;min-height:48px;align-items:center;padding:.55rem .8rem;border:1px solid var(--color-border);border-radius:999px;background:var(--color-surface-muted);text-decoration:none}
.fmu-primary{background:var(--color-primary);color:var(--color-on-primary)!important;border-color:var(--color-primary)}.fmu-grid{display:grid;grid-template-columns:1fr;gap:.75rem}.fmu-grid .fmu-action{justify-content:flex-start}
.fmu-eyebrow{margin:0;color:var(--color-primary);font-weight:800}.fmu-article-reading-time{width:max-content;max-width:100%;margin:0;padding:.4rem .7rem;border:1px solid var(--color-border);border-radius:999px;background:var(--color-surface-muted);color:var(--color-text);font-size:.9rem;font-weight:800}.fmu-intro h1{margin:.25rem 0;font-size:clamp(1.8rem,8vw,2.6rem);line-height:1.2}.fmu-intro>p:last-child{margin-bottom:0;color:var(--color-text-muted)}
.fmu-breadcrumbs ol{display:flex;flex-wrap:wrap;gap:.35rem;margin:0;padding:0;list-style:none;font-size:.9rem}.fmu-breadcrumbs li+li:before{content:"/";margin-right:.35rem;color:var(--color-text-muted)}
.fmu-list>ul,.fmu-list>ol{display:grid;gap:.75rem;margin:0;padding:0;list-style:none}.fmu-list article{min-width:0;padding:1rem;overflow-wrap:anywhere;border:1px solid var(--color-border);border-radius:.9rem;background:var(--color-surface)}.fmu-list article>p:first-child{color:var(--color-text-muted);font-size:.9rem}.fmu-list h2,.fmu-list h3{margin:.3rem 0}
.fmu nav[aria-label="목록 페이지 이동"]{display:flex;min-width:0;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem;margin-top:1rem;padding:.75rem;border:1px solid var(--color-border);border-radius:.9rem;background:var(--color-surface-muted)}
.fmu nav[aria-label="목록 페이지 이동"] p{min-width:0;flex:1 1 12rem;margin:0;color:var(--color-text-muted);overflow-wrap:anywhere}
.fmu nav[aria-label="목록 페이지 이동"] [aria-current="page"]{display:inline-block;padding:.25rem .55rem;border-radius:999px;background:var(--color-surface);color:var(--color-primary);font-weight:800}
.fmu nav[aria-label="목록 페이지 이동"] ul{display:flex;flex:1 1 auto;flex-wrap:wrap;justify-content:flex-end;gap:.5rem;margin:0;padding:0;list-style:none}
.fmu nav[aria-label="목록 페이지 이동"] li{min-width:0}
.fmu nav[aria-label="목록 페이지 이동"] a{display:inline-flex;min-height:44px;max-width:100%;align-items:center;justify-content:center;padding:.55rem .85rem;overflow-wrap:anywhere;border:1px solid var(--color-border);border-radius:.75rem;background:var(--color-surface);font-weight:800;text-decoration:none}
.fmu nav[aria-label="목록 페이지 이동"] a:focus-visible{outline:3px solid var(--focus-ring);outline-offset:3px}
.fmu-list .content-image{min-width:0;margin:0 0 1rem}.fmu-list .content-image picture{display:block}.fmu-list .content-image img{display:block;width:100%;max-width:100%;height:auto}.fmu-list .content-image figcaption{margin-top:.4rem;color:var(--color-text-muted);font-size:.78rem}
:is(.fmu-list:has(>:is(#fmu-home-featured,#fmu-home-current,#fmu-home-evergreen,#fmu-home-latest)),.fmu-list:has(>h2>a[href^="/category/"])){min-width:0;padding:clamp(1rem,3vw,1.4rem);border:1px solid var(--color-border);border-radius:1rem}
:is(.fmu-list:has(>:is(#fmu-home-featured,#fmu-home-current,#fmu-home-evergreen,#fmu-home-latest)),.fmu-list:has(>h2>a[href^="/category/"])) article{min-width:0;overflow-wrap:anywhere}
.fmu-list:has(>#fmu-home-featured){background:var(--color-surface-muted);border-top:.3rem solid var(--color-primary)}.fmu-list:has(>#fmu-home-featured)>ul{gap:1rem}.fmu-list:has(>#fmu-home-featured) article{padding:clamp(1rem,4vw,1.6rem)}#fmu-home-featured{font-size:clamp(1.55rem,6vw,2.1rem)}
.fmu-list:has(>#fmu-home-current){border-left:.3rem solid var(--color-primary)}.fmu-list:has(>#fmu-home-current) article{background:var(--color-surface-muted)}
.fmu-list:has(>#fmu-home-evergreen){background:var(--color-surface-muted)}.fmu-list:has(>#fmu-home-evergreen)>ul{gap:.55rem}.fmu-list:has(>#fmu-home-evergreen) article{padding:.8rem;font-size:.94rem}.fmu-list:has(>#fmu-home-evergreen) h3{font-size:1.02rem}
.fmu-list:has(>#fmu-home-latest) article{border-width:0 0 1px;border-radius:0}
.fmu-list:has(>h2>a[href^="/category/"]){background:var(--color-surface-muted)}.fmu-list:has(>h2>a[href^="/category/"])>h2{margin-top:0}.fmu-list:has(>h2>a[href^="/category/"])>p{color:var(--color-text-muted)}.fmu-list:has(>h2>a[href^="/category/"]) article{background:var(--color-surface)}
.fmu-stack>.theme-article-topics{display:flex;flex-wrap:wrap;gap:.4rem;margin:0;padding:0;list-style:none}.fmu-stack>.theme-article-topics li{padding:.25rem .65rem;background:var(--color-surface-muted);border:1px solid var(--color-border);border-radius:999px;color:var(--color-text-muted);font-size:.85rem}.fmu-summary{background:var(--color-surface-muted)}.fmu-trust dl{display:grid;grid-template-columns:max-content 1fr;gap:.35rem .75rem}.fmu-trust dt{font-weight:800}.fmu-trust dd{margin:0}.fmu-body{min-width:0;overflow-wrap:anywhere}.fmu-body :where(img,video,iframe){max-width:100%;height:auto}.fmu-body table{display:block;max-width:100%;overflow-x:auto}
.fmu-status{text-align:center;padding-block:2rem}.fmu-status-code{font-size:1rem;font-weight:800;color:var(--color-danger)}.fmu-footer{margin-top:1rem;border-top:1px solid var(--color-border);background:var(--color-surface);padding:1.25rem}.fmu-footer p{margin:0;color:var(--color-text-muted)}
@media (min-width:42rem){.fmu-header,.fmu-main{padding-inline:1.5rem}.fmu-menu{display:none}.fmu-nav-wide{display:block;grid-column:1/-1;margin-top:.65rem}.fmu-nav a{min-height:40px;padding:.45rem .7rem;font-size:.9rem}.fmu-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.fmu-panel{padding:1.35rem}:is(.fmu-list:has(>:is(#fmu-home-current,#fmu-home-evergreen,#fmu-home-latest)),.fmu-list:has(>h2>a[href^="/category/"]))>ul{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:30rem){:is(.fmu-list:has(>:is(#fmu-home-featured,#fmu-home-current,#fmu-home-evergreen,#fmu-home-latest)),.fmu-list:has(>h2>a[href^="/category/"])){padding:.8rem}:is(#fmu-home-featured,#fmu-home-current,#fmu-home-evergreen,#fmu-home-latest){font-size:1.25rem;overflow-wrap:anywhere}}
@media (max-width:30rem){.fmu .search-controller form{grid-template-columns:1fr}.fmu .search-controller button{width:100%}}
@media (max-width:30rem){.fmu nav[aria-label="목록 페이지 이동"]{display:grid;align-items:stretch}.fmu nav[aria-label="목록 페이지 이동"] ul{display:grid;grid-template-columns:1fr;width:100%}.fmu nav[aria-label="목록 페이지 이동"] a{width:100%}}
@media (prefers-reduced-motion:reduce){.fmu,.fmu *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
@media print{
  .fmu{min-height:auto;background:#fff;color:#000;font-family:ui-serif,Georgia,serif;font-size:11pt;line-height:1.55}
  .fmu-header,.fmu-footer,.fmu-skip,.fmu-menu,.fmu aside[aria-label="광고"],.fmu button{display:none!important}
  .fmu-main{display:block;width:100%;padding:0}
  .fmu-stack{display:block}.fmu-stack>*+*{margin-top:1rem}
  .fmu-panel,.fmu-list article{break-inside:avoid;border:1px solid #aaa;border-radius:0;background:#fff}
  :is(.fmu-list:has(>:is(#fmu-home-featured,#fmu-home-current,#fmu-home-evergreen,#fmu-home-latest)),.fmu-list:has(>h2>a[href^="/category/"])){padding:0;border:0;background:#fff}
  :is(.fmu-list:has(>:is(#fmu-home-featured,#fmu-home-current,#fmu-home-evergreen,#fmu-home-latest)),.fmu-list:has(>h2>a[href^="/category/"]))>ul{display:block}
  :is(.fmu-list:has(>:is(#fmu-home-featured,#fmu-home-current,#fmu-home-evergreen,#fmu-home-latest)),.fmu-list:has(>h2>a[href^="/category/"]))>ul>li{margin-bottom:.8rem;break-inside:avoid}
  .fmu .search-controller form,.fmu .search-fallback{display:none!important}
  .fmu .search-results{display:block}.fmu .search-results>li+li{margin-top:.8rem}
  .fmu .search-results article{break-inside:avoid;border:1px solid #aaa;border-radius:0;background:#fff}
  .fmu nav[aria-label="목록 페이지 이동"]{display:none!important}
  .fmu a{color:inherit;text-decoration:underline}
  .fmu-body a[href^="http"]::after{content:" (" attr(href) ")";font-size:.8em;overflow-wrap:anywhere}
}
`;
