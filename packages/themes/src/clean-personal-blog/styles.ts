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
.personal-nav ul { display: flex; flex-wrap: wrap; gap: .4rem 1rem; margin: 0; padding: 0; list-style: none; }
.personal-nav ul ul { margin-left: .6rem; }
.personal-nav a { color: var(--personal-text); font-size: .92rem; }
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
.personal-topics { display: flex; flex-wrap: wrap; gap: .5rem; padding: 0; list-style: none; }
.personal-topics li { padding: .25rem .6rem; background: var(--personal-surface-muted); border-radius: 999px; }
.personal-article-header { margin-bottom: 1.5rem; }
.personal-article-header h1 { font-size: clamp(2.3rem, 8vw, 4rem); }
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
.personal-search-client { padding: 1.2rem; background: var(--personal-surface); border: 1px solid var(--personal-border); border-radius: .5rem; }
.personal-state { margin-block: 4rem; text-align: center; }
.personal-state__code { color: var(--personal-text-muted); font-size: .85rem; letter-spacing: .12em; }
.personal-state__action { display: inline-block; padding: .55rem .9rem; background: var(--personal-primary); color: var(--personal-on-primary) !important; }
.personal-footer { padding-block: 2rem; background: var(--personal-surface); border-top: 1px solid var(--personal-border); color: var(--personal-text-muted); }
@media (min-width: 44rem) { .personal-categories { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (prefers-reduced-motion: reduce) {
  .personal-blog, .personal-blog * { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
@media print {
  .personal-blog { min-height: auto; background: #fff; color: #000; font-family: ui-serif, Georgia, serif; font-size: 11pt; line-height: 1.55; }
  .personal-masthead, .personal-footer, .personal-skip, .personal-nav, .personal-breadcrumbs, .personal-search-link, .personal-blog aside[aria-label="광고"], .personal-blog button { display: none !important; }
  .personal-main { padding: 0; }
  .personal-reading-column { width: 100%; }
  .personal-article-meta, .personal-toc, .personal-evidence { break-inside: avoid; border: 1px solid #aaa; border-radius: 0; background: #fff; }
  .personal-body { font-size: inherit; }
  .personal-body a[href^="http"]::after { content: " (" attr(href) ")"; font-size: .8em; overflow-wrap: anywhere; }
}
`;
