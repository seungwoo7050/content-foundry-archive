export const CLEAN_PERSONAL_BLOG_STYLES = `
.personal-blog { min-height: 100vh; background: var(--personal-canvas); color: var(--personal-text); font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.75; }
.personal-blog * { box-sizing: border-box; }
.personal-blog a { color: var(--personal-primary); text-underline-offset: .2em; }
.personal-blog a:focus-visible { outline: 3px solid var(--personal-focus-ring); outline-offset: 3px; }
.personal-skip { position: absolute; top: -5rem; left: 1rem; padding: .7rem 1rem; background: var(--personal-primary); color: var(--personal-on-primary) !important; z-index: 10; }
.personal-skip:focus { top: 1rem; }
.personal-masthead { background: var(--personal-surface); border-bottom: 1px solid var(--personal-border); }
.personal-masthead__inner, .personal-reading-column, .personal-footer__inner { width: min(46rem, calc(100% - 2rem)); margin-inline: auto; }
.personal-masthead__inner { padding-block: 2rem 1.25rem; }
.personal-title { color: var(--personal-text) !important; font-family: ui-serif, Georgia, serif; font-size: clamp(1.8rem, 6vw, 2.7rem); font-weight: 700; text-decoration: none; }
.personal-tagline { margin: .2rem 0 1rem; color: var(--personal-text-muted); }
.personal-nav { display: flex; flex-wrap: wrap; align-items: center; gap: .65rem 1rem; }
.personal-nav ul { display: flex; flex-wrap: wrap; gap: .4rem 1rem; margin: 0; padding: 0; list-style: none; }
.personal-nav ul ul { margin-left: .6rem; }
.personal-nav a { color: var(--personal-text); font-size: .92rem; }
.personal-nav .personal-masthead-search { display: inline-flex; min-height: 44px; align-items: center; padding: .35rem .7rem; background: var(--personal-surface-muted); border: 1px solid var(--personal-border); border-radius: .35rem; font-weight: 700; text-decoration: none; }
.personal-main { padding-block: 2rem 5rem; }
.personal-breadcrumbs ol { display: flex; flex-wrap: wrap; gap: .35rem; margin: 0 0 2rem; padding: 0; color: var(--personal-text-muted); font-size: .82rem; list-style: none; }
.personal-breadcrumbs li:not(:last-child)::after { content: "·"; margin-left: .35rem; }
.personal-route-header { margin-bottom: 2.5rem; }
.personal-route-header h1, .personal-article-header h1 { margin: 0; font-family: ui-serif, Georgia, serif; line-height: 1.15; }
.personal-route-header h1 { font-size: clamp(2rem, 7vw, 3.25rem); }
.personal-route-header p, .personal-article-summary { color: var(--personal-text-muted); font-size: 1.08rem; }
.personal-search-link { display: inline-block; margin-top: .5rem; padding: .55rem .9rem; background: var(--personal-primary); color: var(--personal-on-primary) !important; border-radius: .35rem; }
.personal-section { margin-block: 3rem; }
.personal-section > h2 { font-family: ui-serif, Georgia, serif; font-size: 1.5rem; }
.personal-categories { display: grid; gap: 1rem; padding: 0; list-style: none; }
.personal-categories li { padding: 1rem 1.15rem; background: var(--personal-surface-muted); border: 1px solid var(--personal-border); border-radius: .5rem; }
.personal-categories p { margin: .25rem 0 0; color: var(--personal-text-muted); }
.personal-article-list > :is(ul, ol), .personal-related > ul { display: grid; gap: 1.2rem; padding: 0; list-style: none; }
.personal-article-list article, .personal-related article { padding-bottom: 1.2rem; border-bottom: 1px solid var(--personal-border); }
.personal-article-list article > p:first-child, .personal-related article > p:first-child { color: var(--personal-text-muted); font-size: .85rem; }
.personal-article-list h2, .personal-article-list h3, .personal-related h3 { margin-block: .25rem; font-family: ui-serif, Georgia, serif; }
.personal-blog nav[aria-label="목록 페이지 이동"] { display: flex; min-width: 0; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .8rem; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--personal-border); }
.personal-blog nav[aria-label="목록 페이지 이동"] p { min-width: 0; flex: 1 1 12rem; margin: 0; color: var(--personal-text-muted); overflow-wrap: anywhere; }
.personal-blog nav[aria-label="목록 페이지 이동"] [aria-current="page"] { display: inline-block; padding: .25rem .6rem; color: var(--personal-text); background: var(--personal-surface-muted); border-radius: 999px; font-family: ui-serif, Georgia, serif; font-weight: 700; }
.personal-blog nav[aria-label="목록 페이지 이동"] ul { display: flex; flex: 1 1 auto; flex-wrap: wrap; justify-content: flex-end; gap: .55rem; margin: 0; padding: 0; list-style: none; }
.personal-blog nav[aria-label="목록 페이지 이동"] li { min-width: 0; }
.personal-blog nav[aria-label="목록 페이지 이동"] a { display: inline-flex; min-height: 44px; max-width: 100%; align-items: center; justify-content: center; padding: .5rem .8rem; overflow-wrap: anywhere; color: var(--personal-text); background: var(--personal-surface); border: 1px solid var(--personal-border); border-radius: .4rem; font-family: ui-serif, Georgia, serif; font-weight: 700; text-decoration: none; }
.personal-blog nav[aria-label="목록 페이지 이동"] a:focus-visible { outline: 3px solid var(--personal-focus-ring); outline-offset: 3px; }
:is(.personal-home-featured, .personal-home-current, .personal-home-reference, .personal-home-latest, .personal-home-category-highlight) > ul { margin: 0; }
:is(.personal-home-featured, .personal-home-current, .personal-home-reference, .personal-home-latest, .personal-home-category-highlight) article { min-width: 0; overflow-wrap: anywhere; }
:is(.personal-home-featured, .personal-home-current, .personal-home-reference, .personal-home-latest, .personal-home-category-highlight) article > p:first-of-type { margin: 0 0 .45rem; color: var(--personal-text-muted); font-size: .8rem; }
:is(.personal-home-featured, .personal-home-current, .personal-home-reference, .personal-home-latest, .personal-home-category-highlight) article > h3 + p { margin: .65rem 0 0; color: var(--personal-text-muted); }
:is(.personal-home-featured, .personal-home-current, .personal-home-reference, .personal-home-latest, .personal-home-category-highlight) article > ul { display: flex; flex-wrap: wrap; gap: .35rem; margin: .85rem 0 0; padding: 0; list-style: none; }
:is(.personal-home-featured, .personal-home-current, .personal-home-reference, .personal-home-latest, .personal-home-category-highlight) article > ul li { padding: .15rem .5rem; background: var(--personal-surface-muted); border: 1px solid var(--personal-border); border-radius: 999px; color: var(--personal-text-muted); font-size: .74rem; }
:is(.personal-home-featured, .personal-home-current, .personal-home-reference, .personal-home-latest, .personal-home-category-highlight) .content-image { margin: 0 0 1rem; }
:is(.personal-home-featured, .personal-home-current, .personal-home-reference, .personal-home-latest, .personal-home-category-highlight) .content-image picture { display: block; }
:is(.personal-home-featured, .personal-home-current, .personal-home-reference, .personal-home-latest, .personal-home-category-highlight) .content-image img { display: block; width: 100%; max-width: 100%; height: auto; }
:is(.personal-home-featured, .personal-home-current, .personal-home-reference, .personal-home-latest, .personal-home-category-highlight) .content-image figcaption { margin-top: .45rem; color: var(--personal-text-muted); font-size: .75rem; }
.personal-home-featured { margin-block: clamp(3.5rem, 9vw, 5.5rem); }
.personal-home-featured > h2 { font-size: clamp(1.6rem, 5vw, 2.15rem); }
.personal-home-featured article { padding: clamp(1.2rem, 4vw, 2rem); background: var(--personal-surface-muted); border: 1px solid var(--personal-border); border-top: .25rem solid var(--personal-primary); }
.personal-home-featured article > h3 { font-size: clamp(1.45rem, 5vw, 2.15rem); line-height: 1.2; }
.personal-home-current > ul { gap: 1.5rem; }
.personal-home-current article { padding: 1.25rem; background: var(--personal-surface); border: 1px solid var(--personal-border); border-left: .2rem solid var(--personal-primary); }
.personal-home-current article > h3 { font-size: 1.3rem; }
.personal-home-reference > ul { gap: .75rem; }
.personal-home-reference article { padding: .9rem 0; font-size: .94rem; }
.personal-home-reference article > h3 { font-size: 1.05rem; }
.personal-home-latest article { padding-block: 1rem 1.3rem; }
.personal-home-category-highlight { padding: clamp(1rem, 4vw, 1.5rem); background: var(--personal-surface-muted); border: 1px solid var(--personal-border); border-radius: .5rem; }
.personal-home-category-highlight > h2 { margin-top: 0; }
.personal-home-category-highlight > h2 a { color: var(--personal-text); }
.personal-home-category-highlight > p { color: var(--personal-text-muted); }
.personal-home-category-highlight article { padding: 1rem; background: var(--personal-surface); border: 1px solid var(--personal-border); }
.personal-topics { display: flex; flex-wrap: wrap; gap: .5rem; padding: 0; list-style: none; }
.personal-topics li { padding: .25rem .6rem; background: var(--personal-surface-muted); border-radius: 999px; }
.personal-article-header { margin-bottom: 1.5rem; }
.personal-article-header h1 { font-size: clamp(2.3rem, 8vw, 4rem); }
.personal-article-reading-time { display: inline-block; margin: .25rem 0 0; padding: .25rem .65rem; background: var(--personal-surface-muted); border: 1px solid var(--personal-border); border-radius: 999px; color: var(--personal-text); font-size: .88rem; font-weight: 700; }
.personal-article-header > .theme-article-topics { display: flex; flex-wrap: wrap; gap: .4rem; margin: 1rem 0 0; padding: 0; list-style: none; }
.personal-article-header > .theme-article-topics li { padding: .2rem .6rem; background: var(--personal-surface-muted); border-radius: 999px; color: var(--personal-text-muted); font-size: .86rem; }
.personal-category { margin: 0 0 .5rem; font-size: .9rem; }
.personal-article-meta { margin-block: 1.5rem 2rem; padding: 1rem; background: var(--personal-surface-muted); border-left: .25rem solid var(--personal-primary); }
.personal-article-meta dl { display: grid; grid-template-columns: max-content 1fr; gap: .25rem .8rem; margin: 0; }
.personal-article-meta dd { margin: 0; }
.personal-article-meta ul { margin-bottom: 0; }
.personal-hero { margin-block: 2rem; }
.personal-toc, .personal-evidence { margin-block: 2rem; padding: 1rem 1.2rem; background: var(--personal-surface); border: 1px solid var(--personal-border); border-radius: .4rem; }
.personal-toc h2, .personal-evidence h2 { margin-top: 0; font-family: ui-serif, Georgia, serif; }
.personal-body { font-size: 1.05rem; }
.personal-body :is(h2, h3) { margin-top: 2.2em; font-family: ui-serif, Georgia, serif; line-height: 1.3; }
.personal-faq > div { padding-block: .75rem; border-bottom: 1px solid var(--personal-border); }
.personal-faq dt { font-weight: 700; }
.personal-faq dd { margin: .25rem 0 0; }
.personal-blog section[aria-labelledby="personal-reader-actions-title"] { margin-block: 3.5rem; padding-top: 1.5rem; border-top: 1px solid var(--personal-border); }
.personal-blog section[aria-labelledby="personal-reader-actions-title"] > h2 { font-family: ui-serif, Georgia, serif; font-size: 1.4rem; }
.personal-blog section[aria-labelledby="personal-reader-actions-title"] > section { display: grid; gap: .85rem; }
.personal-blog :is(.article-bookmark, .article-share-action, .article-feedback) { min-width: 0; margin: 0; padding: 1rem 1.1rem; background: var(--personal-surface); border: 1px solid var(--personal-border); border-radius: .5rem; }
.personal-blog :is(.article-bookmark, .article-share-action) { display: grid; grid-template-columns: max-content minmax(0, 1fr); align-items: center; gap: .5rem .8rem; }
.personal-blog .article-feedback { display: grid; gap: .75rem; }
.personal-blog .article-feedback h2 { margin: 0; font-family: ui-serif, Georgia, serif; font-size: 1.05rem; }
.personal-blog .article-feedback [role="group"] { display: flex; flex-wrap: wrap; gap: .55rem; }
.personal-blog :is(.article-bookmark, .article-share-action, .article-feedback) button { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; padding: .55rem .9rem; color: var(--personal-on-primary); background: var(--personal-primary); border: 1px solid var(--personal-primary); border-radius: .4rem; font: inherit; font-weight: 700; cursor: pointer; }
.personal-blog :is(.article-bookmark, .article-share-action, .article-feedback) button:focus-visible { outline: 3px solid var(--personal-focus-ring); outline-offset: 3px; }
.personal-blog :is(.article-bookmark, .article-share-action, .article-feedback) button:disabled { cursor: not-allowed; opacity: .55; }
.personal-blog :is(.article-bookmark, .article-share-action, .article-feedback) button[aria-pressed="true"] { color: var(--personal-primary); background: var(--personal-surface-muted); box-shadow: inset 0 0 0 2px var(--personal-primary); }
.personal-blog :is(.article-bookmark, .article-share-action, .article-feedback) :is([role="status"], [aria-live="polite"]) { min-width: 0; min-height: 1.5em; margin: 0; color: var(--personal-text-muted); font-size: .85rem; overflow-wrap: anywhere; }
.personal-search-client { padding: 1.2rem; background: var(--personal-surface); border: 1px solid var(--personal-border); border-radius: .5rem; }
.personal-search-client .search-controller { min-width: 0; }
.personal-search-client .search-controller form { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: .7rem; }
.personal-search-client .search-controller label { grid-column: 1 / -1; font-family: ui-serif, Georgia, serif; font-weight: 700; }
.personal-search-client .search-controller input { min-width: 0; min-height: 48px; padding: .7rem .85rem; color: var(--personal-text); background: var(--personal-canvas); border: 1px solid var(--personal-border); border-radius: .4rem; font: inherit; }
.personal-search-client .search-controller button { min-height: 48px; padding: .65rem 1rem; color: var(--personal-on-primary); background: var(--personal-primary); border: 1px solid var(--personal-primary); border-radius: .4rem; font: inherit; font-weight: 700; }
.personal-search-client .search-controller :is(input, button):focus-visible { outline: 3px solid var(--personal-focus-ring); outline-offset: 2px; }
.personal-search-client .search-controller button:disabled { cursor: wait; opacity: .58; }
.personal-search-client #site-search-status { margin: .75rem 0 0; color: var(--personal-text-muted); font-size: .9rem; }
.personal-search-client :is(.search-results, .search-fallback) { min-width: 0; overflow-wrap: anywhere; }
.personal-search-client :is(.search-results, .search-fallback ul) { display: grid; gap: .85rem; margin: 1rem 0 0; padding: 0; list-style: none; }
.personal-search-client .search-results article { min-width: 0; padding: 1rem; overflow-wrap: anywhere; background: var(--personal-canvas); border: 1px solid var(--personal-border); border-radius: .5rem; }
.personal-search-client .search-results h3 { margin: .1rem 0; font-family: ui-serif, Georgia, serif; }
.personal-search-client .search-results p { margin: .45rem 0 0; }
.personal-search-client .search-results p:last-child { color: var(--personal-text-muted); font-size: .85rem; }
.personal-search-client .search-fallback p { color: var(--personal-text-muted); }
.personal-search-client .search-fallback ul { display: flex; flex-wrap: wrap; }
.personal-search-client .search-fallback a { display: inline-flex; min-height: 44px; align-items: center; padding: .45rem .75rem; background: var(--personal-surface-muted); border: 1px solid var(--personal-border); border-radius: 999px; text-decoration: none; }
.personal-state { margin-block: 4rem; text-align: center; }
.personal-state__code { color: var(--personal-text-muted); font-size: .85rem; letter-spacing: .12em; }
.personal-state__action { display: inline-block; padding: .55rem .9rem; background: var(--personal-primary); color: var(--personal-on-primary) !important; }
.personal-footer { padding-block: 2rem; background: var(--personal-surface); border-top: 1px solid var(--personal-border); color: var(--personal-text-muted); }
@media (max-width: 30rem) {
  .personal-search-client .search-controller form { grid-template-columns: minmax(0, 1fr); }
  .personal-search-client .search-controller button { width: 100%; }
  .personal-blog nav[aria-label="목록 페이지 이동"] { display: grid; align-items: stretch; }
  .personal-blog nav[aria-label="목록 페이지 이동"] ul { display: grid; grid-template-columns: minmax(0, 1fr); width: 100%; }
  .personal-blog nav[aria-label="목록 페이지 이동"] a { width: 100%; }
  .personal-home-featured article, .personal-home-current article, .personal-home-category-highlight article { padding: .9rem; }
  .personal-home-category-highlight { padding: .9rem; }
  .personal-blog :is(.article-bookmark, .article-share-action) { grid-template-columns: minmax(0, 1fr); }
  .personal-blog :is(.article-bookmark, .article-share-action) > button, .personal-blog .article-feedback button { width: 100%; }
  .personal-blog .article-feedback [role="group"] { display: grid; grid-template-columns: minmax(0, 1fr); }
}
@media (min-width: 44rem) {
  .personal-categories, .personal-home-reference > ul { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) {
  .personal-blog, .personal-blog * { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
@media print {
  .personal-blog { min-height: auto; background: #fff; color: #000; font-family: ui-serif, Georgia, serif; font-size: 11pt; line-height: 1.55; }
  .personal-masthead, .personal-footer, .personal-skip, .personal-nav, .personal-breadcrumbs, .personal-search-link, .personal-blog aside[aria-label="광고"], .personal-blog button { display: none !important; }
  .personal-main { padding: 0; }
  .personal-reading-column { width: 100%; }
  .personal-search-client .search-controller form, .personal-search-client .search-fallback { display: none !important; }
  .personal-search-client .search-results { display: block; }
  .personal-search-client .search-results > li + li { margin-top: .8rem; }
  .personal-search-client .search-results article { break-inside: avoid; border-radius: 0; background: #fff; }
  .personal-blog nav[aria-label="목록 페이지 이동"] { display: none !important; }
  .personal-blog section[aria-labelledby="personal-reader-actions-title"] { display: none !important; }
  .personal-article-meta, .personal-toc, .personal-evidence { break-inside: avoid; border: 1px solid #aaa; border-radius: 0; background: #fff; }
  .personal-body { font-size: inherit; }
  .personal-body a[href^="http"]::after { content: " (" attr(href) ")"; font-size: .8em; overflow-wrap: anywhere; }
  :is(.personal-home-featured, .personal-home-current, .personal-home-reference, .personal-home-latest, .personal-home-category-highlight) > ul { display: block; }
  :is(.personal-home-featured, .personal-home-current, .personal-home-reference, .personal-home-latest, .personal-home-category-highlight) > ul > li { margin-bottom: 1rem; break-inside: avoid; }
  :is(.personal-home-featured, .personal-home-current, .personal-home-reference, .personal-home-latest, .personal-home-category-highlight) .content-image { max-width: 30rem; }
}
`;
