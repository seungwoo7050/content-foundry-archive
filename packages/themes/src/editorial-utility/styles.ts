export const EDITORIAL_UTILITY_STYLES = `
.editorial-utility {
  min-height: 100vh;
  background: var(--editorial-canvas);
  color: var(--editorial-text);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.65;
}
.editorial-utility * { box-sizing: border-box; }
.editorial-utility a { color: var(--editorial-primary); text-underline-offset: .18em; }
.editorial-utility a:focus-visible { outline: 3px solid var(--editorial-focus-ring); outline-offset: 3px; }
.editorial-skip-link { position: absolute; left: 1rem; top: -5rem; z-index: 10; padding: .7rem 1rem; background: var(--editorial-primary); color: var(--editorial-on-primary) !important; }
.editorial-skip-link:focus { top: 1rem; }
.editorial-masthead { border-bottom: 1px solid var(--editorial-border); background: var(--editorial-surface); }
.editorial-masthead__identity, .editorial-category-strip, .editorial-main, .editorial-footer__inner { width: min(72rem, calc(100% - 2rem)); margin-inline: auto; }
.editorial-masthead__identity { display: flex; align-items: baseline; justify-content: space-between; gap: 2rem; padding-block: 1.5rem 1rem; }
.editorial-brand { color: var(--editorial-text) !important; font-family: ui-serif, Georgia, serif; font-size: clamp(1.65rem, 4vw, 2.35rem); font-weight: 800; text-decoration: none; }
.editorial-masthead__identity p { max-width: 40rem; margin: 0; color: var(--editorial-text-muted); text-align: right; }
.editorial-category-strip { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .65rem 1.25rem; border-top: 1px solid var(--editorial-border); padding-block: .65rem; }
.editorial-category-strip ul { display: flex; flex-wrap: wrap; gap: .6rem 1.35rem; margin: 0; padding: 0; list-style: none; }
.editorial-category-strip a { color: var(--editorial-text); font-size: .9rem; text-decoration: none; }
.editorial-category-strip .editorial-masthead-search { display: inline-flex; min-height: 44px; align-items: center; padding: .45rem .8rem; background: var(--editorial-primary); color: var(--editorial-on-primary) !important; font-weight: 750; }
.editorial-main { padding-block: 1rem 4rem; }
.editorial-breadcrumbs ol { display: flex; flex-wrap: wrap; gap: .35rem; margin: 0 0 2rem; padding: 0; color: var(--editorial-text-muted); font-size: .85rem; list-style: none; }
.editorial-breadcrumbs li:not(:last-child)::after { content: "/"; margin-left: .35rem; color: var(--editorial-border); }
.editorial-route-header { max-width: 52rem; margin-block: 2rem 2.5rem; }
.editorial-route-header h1, .editorial-article-header h1 { margin: 0; font-family: ui-serif, Georgia, serif; line-height: 1.12; letter-spacing: -.02em; }
.editorial-route-header h1 { font-size: clamp(2rem, 6vw, 3.4rem); }
.editorial-route-header p, .editorial-dek { color: var(--editorial-text-muted); font-size: 1.1rem; }
.editorial-home-tools { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; padding-block: 1rem; border-block: 1px solid var(--editorial-border); }
.editorial-home-tools ul { display: flex; flex-wrap: wrap; gap: .75rem; margin: 0; padding: 0; list-style: none; }
.editorial-home-lead { padding-block: 2rem; border-bottom: 1px solid var(--editorial-border); }
.editorial-home-lead > ul, .editorial-home-secondary > ul, .editorial-latest > ul, .editorial-related > ul, .editorial-category-list > ul { margin: 0; padding: 0; list-style: none; }
.editorial-home-lead article { max-width: 54rem; padding: clamp(1.4rem, 4vw, 3rem); background: var(--editorial-surface-muted); border-left: .35rem solid var(--editorial-primary); }
.editorial-home-lead h2 { margin-block: .5rem; font-family: ui-serif, Georgia, serif; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.08; }
.editorial-home-secondary > ul, .editorial-latest > ul { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; background: var(--editorial-border); }
.editorial-home-secondary article, .editorial-latest article { height: 100%; padding: 1.35rem; background: var(--editorial-surface); }
.editorial-home-secondary h2, .editorial-latest h3 { margin-block: .4rem; font-family: ui-serif, Georgia, serif; line-height: 1.25; }
:is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) > ul { display: grid; gap: 1rem; margin: 0; padding: 0; list-style: none; }
:is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) article { min-width: 0; height: 100%; overflow-wrap: anywhere; }
:is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) article > p:first-of-type { margin: 0 0 .55rem; color: var(--editorial-text-muted); font-size: .78rem; }
:is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) article > h3 { margin: 0; font-family: ui-serif, Georgia, serif; line-height: 1.2; }
:is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) article > h3 a { color: var(--editorial-text); text-decoration-thickness: .06em; }
:is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) article > h3 + p { margin: .7rem 0 0; color: var(--editorial-text-muted); }
:is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) article > ul { display: flex; flex-wrap: wrap; gap: .35rem; margin: 1rem 0 0; padding: 0; list-style: none; }
:is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) article > ul li { padding: .2rem .5rem; background: var(--editorial-surface-muted); border: 1px solid var(--editorial-border); color: var(--editorial-text-muted); font-size: .75rem; }
:is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) .content-image { min-width: 0; margin: 0 0 1rem; }
:is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) .content-image picture { display: block; }
:is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) .content-image img { display: block; width: 100%; max-width: 100%; height: auto; }
:is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) .content-image figcaption { margin-top: .45rem; color: var(--editorial-text-muted); font-size: .75rem; }
.editorial-home-featured > h2 { border-bottom-width: .3rem; font-size: clamp(1.65rem, 4vw, 2.4rem); }
.editorial-home-featured article { padding: clamp(1rem, 3vw, 2rem); background: var(--editorial-surface-muted); border: 1px solid var(--editorial-border); }
.editorial-home-featured article > h3 { font-size: clamp(1.45rem, 3vw, 2.35rem); }
.editorial-home-current > ul { gap: 1.15rem; }
.editorial-home-current article { padding: 1.25rem; background: var(--editorial-surface); border: 1px solid var(--editorial-border); border-top: .22rem solid var(--editorial-primary); }
.editorial-home-current article > h3 { font-size: clamp(1.2rem, 2.4vw, 1.55rem); }
.editorial-home-reference > ul { gap: .65rem; }
.editorial-home-reference article { padding: .9rem 1rem; background: var(--editorial-surface-muted); border-left: .18rem solid var(--editorial-border); font-size: .93rem; }
.editorial-home-reference article > h3 { font-size: 1.05rem; }
.editorial-home-latest article { padding: 1rem 0; border-bottom: 1px solid var(--editorial-border); }
.editorial-home-latest article > h3, .editorial-home-category-highlight article > h3 { font-size: 1.15rem; }
.editorial-home-category-highlight { padding: clamp(1rem, 3vw, 1.75rem); background: var(--editorial-surface-muted); border: 1px solid var(--editorial-border); }
.editorial-home-category-highlight > h2 { margin-top: 0; }
.editorial-home-category-highlight > h2 a { color: var(--editorial-text); }
.editorial-home-category-highlight > p { max-width: 46rem; color: var(--editorial-text-muted); }
.editorial-home-category-highlight article { padding: 1rem; background: var(--editorial-surface); border: 1px solid var(--editorial-border); }
.editorial-section { margin-block: 2.5rem; }
.editorial-section > h2 { padding-bottom: .65rem; border-bottom: 2px solid var(--editorial-text); font-family: ui-serif, Georgia, serif; }
.editorial-topic-list { display: flex; flex-wrap: wrap; gap: .5rem; padding: 0; list-style: none; }
.editorial-topic-list li { padding: .35rem .7rem; background: var(--editorial-surface-muted); border: 1px solid var(--editorial-border); }
.editorial-article-header { max-width: 62rem; margin: 2rem auto 2.5rem; }
.editorial-article-header h1 { font-size: clamp(2.4rem, 7vw, 4.8rem); }
.editorial-article-header > .theme-article-topics { display: flex; flex-wrap: wrap; gap: .45rem; margin: 1.25rem 0 0; padding: 0; list-style: none; }
.editorial-article-header > .theme-article-topics li { padding: .25rem .65rem; background: var(--editorial-surface-muted); border: 1px solid var(--editorial-border); color: var(--editorial-text-muted); font-size: .88rem; }
.editorial-article-meta { display: flex; flex-wrap: wrap; gap: .65rem 1.25rem; margin-block: 1.5rem; }
.editorial-article-meta div { display: flex; gap: .35rem; }
.editorial-article-meta dt { color: var(--editorial-text-muted); }
.editorial-article-meta dd { margin: 0; }
.editorial-trust-links ul, .editorial-evidence ul { margin: .5rem 0 0; padding-left: 1.2rem; }
.editorial-hero { max-width: 64rem; margin: 0 auto 2.5rem; }
.editorial-article-layout { display: grid; grid-template-columns: minmax(12rem, 16rem) minmax(0, 44rem); justify-content: center; gap: clamp(2rem, 5vw, 5rem); align-items: start; }
.editorial-evidence { padding: 1rem; background: var(--editorial-surface-muted); border-top: 3px solid var(--editorial-primary); font-size: .9rem; }
.editorial-evidence h2, .editorial-evidence h3 { font-family: ui-serif, Georgia, serif; }
.editorial-body { min-width: 0; max-width: 44rem; font-size: 1.05rem; line-height: 1.82; }
.editorial-body :is(h2, h3) { margin-top: 2.2em; font-family: ui-serif, Georgia, serif; line-height: 1.25; }
.editorial-faq details { padding-block: 1rem; border-bottom: 1px solid var(--editorial-border); }
.editorial-faq summary { cursor: pointer; font-weight: 700; }
.editorial-list-section > :is(ul, ol) { display: grid; gap: 1px; margin: 0; padding: 1px; background: var(--editorial-border); list-style-position: inside; }
.editorial-list-section article { padding: 1.25rem; background: var(--editorial-surface); }
.editorial-static-body { max-width: 46rem; }
.editorial-search-client { padding: 1.25rem; background: var(--editorial-surface); border: 1px solid var(--editorial-border); }
.editorial-state { max-width: 38rem; margin: 5rem auto; padding: clamp(1.5rem, 5vw, 3rem); background: var(--editorial-surface); border-top: .4rem solid var(--editorial-primary); text-align: center; }
.editorial-state__code { color: var(--editorial-text-muted); font-size: .85rem; letter-spacing: .12em; }
.editorial-state h1 { font-family: ui-serif, Georgia, serif; font-size: clamp(2rem, 6vw, 3.4rem); }
.editorial-state__action { display: inline-block; padding: .65rem 1rem; background: var(--editorial-primary); color: var(--editorial-on-primary) !important; }
.editorial-footer { border-top: 1px solid var(--editorial-border); background: var(--editorial-surface); color: var(--editorial-text-muted); }
.editorial-footer__inner { padding-block: 2rem; }
@media (max-width: 30rem) {
  :is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) > ul { gap: .75rem; }
  :is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest) article { padding: .9rem; }
  .editorial-home-category-highlight { padding: .9rem; }
}
@media (min-width: 52rem) {
  .editorial-home-featured article:has(> .content-image) { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(16rem, .75fr); align-items: start; column-gap: clamp(1.25rem, 3vw, 2.5rem); }
  .editorial-home-featured article:has(> .content-image) > .content-image { grid-column: 1; grid-row: 1 / span 5; margin: 0; }
  .editorial-home-featured article:has(> .content-image) > :not(.content-image) { grid-column: 2; }
  .editorial-home-current > ul { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .editorial-home-reference > ul { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .editorial-home-latest > ul, .editorial-home-category-highlight > ul { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 52rem) {
  .editorial-masthead__identity { align-items: flex-start; flex-direction: column; gap: .4rem; }
  .editorial-masthead__identity p { text-align: left; }
  .editorial-home-secondary > ul, .editorial-latest > ul { grid-template-columns: 1fr; }
  .editorial-article-layout { grid-template-columns: 1fr; }
  .editorial-evidence { order: 2; }
}
@media (prefers-reduced-motion: reduce) {
  .editorial-utility, .editorial-utility * { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
@media print {
  .editorial-utility { min-height: auto; background: #fff; color: #000; font-size: 11pt; line-height: 1.55; }
  .editorial-masthead, .editorial-footer, .editorial-skip-link, .editorial-breadcrumbs, .editorial-reader-actions, .editorial-utility aside[aria-label="광고"] { display: none !important; }
  .editorial-main { width: 100%; padding: 0; }
  .editorial-article-header { max-width: none; margin: 0 0 1rem; }
  .editorial-article-layout { display: block; }
  .editorial-evidence { margin-block: 1rem; break-inside: avoid; border: 1px solid #aaa; background: #fff; }
  .editorial-body { max-width: none; font-size: inherit; }
  .editorial-body a[href^="http"]::after { content: " (" attr(href) ")"; font-size: .8em; overflow-wrap: anywhere; }
  :is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) > ul { display: block; }
  :is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) > ul > li { margin-bottom: 1rem; break-inside: avoid; }
  .editorial-home-featured article:has(> .content-image) { display: block; }
  :is(.editorial-home-featured, .editorial-home-current, .editorial-home-reference, .editorial-home-latest, .editorial-home-category-highlight) .content-image { max-width: 32rem; }
}
`;
