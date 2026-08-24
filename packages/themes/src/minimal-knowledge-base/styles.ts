export const MINIMAL_KNOWLEDGE_BASE_STYLES = `
.theme-minimal-knowledge-base{
  min-height:100vh;
  background:linear-gradient(180deg,var(--color-surface-muted) 0,var(--color-canvas) 24rem);
  color:var(--color-text);
  font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  font-size:1rem;
  line-height:1.7;
  letter-spacing:-.012em;
}
.theme-minimal-knowledge-base *{box-sizing:border-box}
.theme-minimal-knowledge-base ::selection{background:var(--color-primary);color:var(--color-on-primary)}
.theme-minimal-knowledge-base a{color:var(--color-primary);font-weight:650;text-decoration-thickness:.08em;text-underline-offset:.22em}
.theme-minimal-knowledge-base :is(a,button,input,select,textarea,summary):focus-visible{outline:3px solid var(--focus-ring);outline-offset:3px}
.theme-minimal-knowledge-base :is(button,input,select,textarea){font:inherit}
.theme-minimal-knowledge-base button{min-height:44px;cursor:pointer}
.theme-minimal-knowledge-base main:focus{outline:3px solid var(--focus-ring);outline-offset:-3px}
.kb-skip-link{position:absolute;top:-6rem;left:1rem;z-index:10;padding:.75rem 1rem;background:var(--color-primary);color:var(--color-on-primary)!important;border-radius:.5rem;box-shadow:0 .5rem 1.5rem rgba(19,33,58,.2)}
.kb-skip-link:focus{top:1rem}

.kb-knowledge-rail{position:relative;z-index:2;padding:1rem clamp(1rem,4vw,2rem);background:rgba(255,255,255,.92);border-bottom:1px solid var(--color-border);box-shadow:0 1px 0 rgba(19,33,58,.03)}
.kb-rail-header{display:grid;gap:.15rem}
.kb-rail-header>a{width:fit-content;color:var(--color-text);font-size:1.25rem;font-weight:850;letter-spacing:-.035em;text-decoration:none}
.kb-rail-header>a:before{display:inline-block;width:.62rem;height:.62rem;margin-right:.55rem;background:var(--color-primary);border-radius:.14rem;content:""}
.kb-rail-header p{max-width:34rem;margin:.2rem 0 .85rem;color:var(--color-text-muted);font-size:.88rem;line-height:1.55}
.kb-knowledge-rail nav>ul{display:flex;gap:.4rem;margin:0;padding:.15rem .15rem .45rem;overflow-x:auto;list-style:none;scrollbar-width:thin}
.kb-knowledge-rail ul ul{display:none}
.kb-knowledge-rail nav a{display:flex;align-items:center;min-height:44px;padding:.55rem .8rem;color:var(--color-text);white-space:nowrap;text-decoration:none;border:1px solid var(--color-border);border-radius:.55rem;background:var(--color-surface)}
.kb-knowledge-rail nav a:hover{color:var(--color-primary);background:var(--color-surface-muted);border-color:var(--color-primary)}

.theme-minimal-knowledge-base>main{min-width:0;width:min(100%,72rem);margin-inline:auto;padding:clamp(1.4rem,4vw,4.5rem)}
.theme-minimal-knowledge-base>footer{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;padding:1.4rem clamp(1rem,4vw,3rem);color:var(--color-text-muted);background:var(--color-surface);border-top:1px solid var(--color-border)}
.theme-minimal-knowledge-base>footer ul{display:flex;flex-wrap:wrap;gap:.45rem 1rem;margin:0;padding:0;list-style:none}
.theme-minimal-knowledge-base>footer a{color:var(--color-text-muted);font-size:.88rem}
.theme-minimal-knowledge-base :is(h1,h2,h3){color:var(--color-text);letter-spacing:-.035em;text-wrap:balance}
.theme-minimal-knowledge-base h1{margin:0;font-size:clamp(2.25rem,7vw,4.5rem);line-height:1.05}
.theme-minimal-knowledge-base h2{font-size:clamp(1.35rem,3vw,1.8rem);line-height:1.25}
.theme-minimal-knowledge-base h3{line-height:1.35}
.theme-minimal-knowledge-base nav[aria-label="현재 위치"] ol{display:flex;flex-wrap:wrap;gap:.4rem;margin:0 0 1.6rem;padding:0;color:var(--color-text-muted);font-size:.82rem;list-style:none}
.theme-minimal-knowledge-base nav[aria-label="현재 위치"] a{color:var(--color-text-muted);font-weight:600}
.theme-minimal-knowledge-base nav[aria-label="현재 위치"] li+li:before{margin-right:.4rem;color:var(--color-border);content:"/"}

.kb-home-route>header{max-width:50rem;padding:clamp(1.5rem,4vw,3.25rem) 0 1rem}
.kb-home-route>header h1{max-width:12ch}
.kb-home-route>header p{max-width:40rem;margin:1.15rem 0 0;color:var(--color-text-muted);font-size:clamp(1.05rem,2vw,1.25rem);line-height:1.65}
.kb-home-search{margin:1.75rem 0 3rem;padding:clamp(1.25rem,3vw,2rem);background:linear-gradient(135deg,var(--color-primary),var(--focus-ring));border-radius:1rem;box-shadow:0 1rem 2.5rem rgba(19,33,58,.14)}
.kb-home-search h2{margin:0}
.kb-home-search a{display:flex;align-items:center;justify-content:space-between;min-height:56px;color:var(--color-on-primary);text-decoration:none}
.kb-home-search a:after{display:grid;width:2.5rem;height:2.5rem;place-items:center;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);border-radius:.7rem;content:"→"}
.kb-category-grid>h2{margin-bottom:1rem}
.kb-category-grid>ul{display:grid;gap:1rem;margin:0;padding:0;list-style:none}
.kb-category-grid>ul>li{display:grid;align-content:start;min-height:9.5rem;padding:1.25rem;background:var(--color-surface);border:1px solid var(--color-border);border-radius:.8rem;box-shadow:0 .35rem 1.25rem rgba(19,33,58,.045);transition:border-color .18s ease,background-color .18s ease}
.kb-category-grid>ul>li:hover{background:var(--color-surface-muted);border-color:var(--color-primary)}
.kb-category-grid>ul>li:only-child{max-width:36rem}
.kb-category-grid a{font-size:1.1rem;text-decoration:none}
.kb-category-grid a:after{margin-left:.35rem;content:"→"}
.kb-category-grid p{margin:.5rem 0 0;color:var(--color-text-muted);font-size:.92rem;line-height:1.6}

.kb-category-scope{margin-bottom:2.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--color-border)}
.kb-latest-articles,.kb-category-articles,.kb-category-topics,.kb-related-articles{margin-block:clamp(2.5rem,6vw,4.5rem)}
.kb-latest-articles>h2,.kb-category-articles>h2,.kb-related-articles>h2{margin-bottom:1rem}
.kb-latest-articles>ul,.kb-category-articles>ul,.kb-related-articles>ul,.kb-archive-route>ol{display:grid;gap:1rem;margin:0;padding:0;list-style:none}
.kb-latest-articles>ul>li:only-child,.kb-category-articles>ul>li:only-child,.kb-related-articles>ul>li:only-child{max-width:44rem}
.kb-latest-articles article,.kb-category-articles article,.kb-related-articles article,.kb-archive-route article{height:100%;padding:1.25rem;background:var(--color-surface);border:1px solid var(--color-border);border-radius:.8rem;box-shadow:0 .35rem 1.25rem rgba(19,33,58,.04)}
.kb-latest-articles article>p:first-child,.kb-category-articles article>p:first-child,.kb-related-articles article>p:first-child,.kb-archive-route article>p:first-child{margin:0;color:var(--color-text-muted);font-size:.8rem}
.kb-latest-articles article h3,.kb-category-articles article h3,.kb-related-articles article h3,.kb-archive-route article h2{margin:.45rem 0}
.kb-latest-articles article h3 a,.kb-category-articles article h3 a,.kb-related-articles article h3 a,.kb-archive-route article h2 a{color:var(--color-text);text-decoration:none}
.kb-latest-articles article h3 a:hover,.kb-category-articles article h3 a:hover,.kb-related-articles article h3 a:hover,.kb-archive-route article h2 a:hover{color:var(--color-primary);text-decoration:underline}
.kb-latest-articles article>p:last-of-type,.kb-category-articles article>p:last-of-type,.kb-related-articles article>p:last-of-type,.kb-archive-route article>p:last-of-type{margin-bottom:0;color:var(--color-text-muted);font-size:.93rem}
.kb-latest-articles article>ul,.kb-category-articles article>ul,.kb-related-articles article>ul,.kb-archive-route article>ul{display:flex;flex-wrap:wrap;gap:.35rem;margin:1rem 0 0;padding:0;list-style:none}
.kb-latest-articles article>ul li,.kb-category-articles article>ul li,.kb-related-articles article>ul li,.kb-archive-route article>ul li{padding:.22rem .55rem;color:var(--color-text-muted);font-size:.76rem;background:var(--color-surface-muted);border-radius:999px}
.kb-home-route>section[aria-labelledby]:last-child{max-width:52rem;margin-top:4rem;padding:1.5rem;background:var(--color-surface);border:1px solid var(--color-border);border-radius:.8rem}
.kb-home-route>section[aria-labelledby]:last-child h2{margin-top:0}
.kb-home-route>section[aria-labelledby]:last-child p:last-child{margin-bottom:0}

.kb-static-route>header,.kb-archive-route>header,.kb-search-route>header{margin-bottom:2.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--color-border)}
.kb-category-scope h1,.kb-static-route>header h1,.kb-archive-route>header h1,.kb-search-route>header h1{font-size:clamp(2rem,6vw,3.5rem)}
.kb-category-scope p,.kb-static-route>header p,.kb-archive-route>header p,.kb-search-route>header p{max-width:44rem;margin:1rem 0 0;color:var(--color-text-muted);font-size:1.05rem}
.kb-category-topics ul{display:flex;flex-wrap:wrap;gap:.45rem;margin:0;padding:0;list-style:none}
.kb-category-topics li{padding:.35rem .7rem;color:var(--color-text-muted);background:var(--color-surface-muted);border:1px solid var(--color-border);border-radius:999px}
.kb-static-route,.kb-article-route{max-width:50rem;margin-inline:auto}
.kb-static-body{max-width:72ch;font-size:1.03rem;overflow-wrap:anywhere}
.kb-static-body :is(img,video,iframe){max-width:100%;height:auto}

.kb-answer-first{margin-bottom:1rem;padding:clamp(1.5rem,4vw,2.5rem);background:var(--color-surface);border:1px solid var(--color-border);border-top:4px solid var(--color-primary);border-radius:.9rem;box-shadow:0 .65rem 2rem rgba(19,33,58,.06)}
.kb-answer-first>p:first-child{margin:0 0 .75rem;font-size:.86rem}
.kb-answer-first h1{margin:0;font-size:clamp(2rem,6vw,3.45rem);line-height:1.12}
.kb-answer-first>p:last-child{max-width:42rem;margin:1rem 0 0;color:var(--color-text-muted);font-size:1.08rem;line-height:1.7}
.kb-article-route>article>.theme-article-topics{display:flex;flex-wrap:wrap;gap:.4rem;margin:1rem 0 1.5rem;padding:0;list-style:none}
.kb-article-route>article>.theme-article-topics li{padding:.25rem .65rem;color:var(--color-text-muted);font-size:.82rem;background:var(--color-surface);border:1px solid var(--color-border);border-radius:999px}
.kb-article-trust,.kb-article-toc,.kb-article-sources,.kb-update-triggers,.kb-faq,.kb-search-client{margin-block:1.25rem;padding:1.25rem;background:var(--color-surface);border:1px solid var(--color-border);border-radius:.75rem}
.kb-article-trust h2,.kb-article-toc h2,.kb-article-sources h2,.kb-update-triggers h2,.kb-faq h2{margin-top:0;font-size:1.05rem}
.kb-article-trust dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem;margin-bottom:.75rem}
.kb-article-trust dl>div{min-width:0}
.kb-article-trust dt{color:var(--color-text-muted);font-size:.75rem;font-weight:700}
.kb-article-trust dd{margin:0;font-size:.9rem;overflow-wrap:anywhere}
.kb-article-trust ul{margin-bottom:0;padding-left:1.2rem}
.kb-article-toc ol{display:grid;gap:.35rem;margin-bottom:0;padding-left:1.3rem}
.kb-article-toc li[data-level="3"]{margin-left:1rem}
.kb-article-hero{margin-block:1.75rem}
.kb-article-body{min-width:0;max-width:72ch;margin-inline:auto;font-size:1.05rem;line-height:1.85;overflow-wrap:anywhere}
.kb-article-body :is(img,video,iframe){max-width:100%;height:auto}
.kb-article-body :is(h2,h3){margin-top:2em;scroll-margin-top:1rem}
.kb-article-body h2{padding-top:.35rem;border-top:1px solid var(--color-border)}
.kb-article-body :is(ul,ol){padding-left:1.35rem}
.kb-article-body li+li{margin-top:.4rem}
.kb-article-body figure{margin:1.75rem 0}
.kb-article-body blockquote{margin:0;padding:.2rem 0 .2rem 1.25rem;border-left:4px solid var(--color-primary)}
.kb-article-body figcaption{display:grid;gap:.15rem;margin-top:.55rem;color:var(--color-text-muted);font-size:.8rem}
.kb-article-body .content-image img{display:block;width:100%;height:auto;border:1px solid var(--color-border);border-radius:.75rem}
.kb-article-body figure>div{display:grid;gap:1rem}
.kb-article-body .content-table-scroll{max-width:100%;margin:1.75rem 0;overflow-x:auto;border:1px solid var(--color-border);border-radius:.65rem}
.kb-article-body table{width:100%;border-collapse:collapse;background:var(--color-surface)}
.kb-article-body :is(th,td){padding:.7rem .8rem;text-align:left;border-bottom:1px solid var(--color-border)}
.kb-article-body th{background:var(--color-surface-muted);font-size:.86rem}
.kb-article-body aside[data-tone]{margin:1.5rem 0;padding:1rem 1.15rem;background:var(--color-surface-muted);border-left:4px solid var(--color-primary);border-radius:.35rem}
.kb-article-body aside[data-tone="warning"]{border-left-color:var(--color-warning)}
.kb-article-body aside[data-tone="danger"]{border-left-color:var(--color-danger)}
.kb-article-body aside[data-tone="tip"]{border-left-color:var(--color-success)}
.kb-article-body .content-code-command{overflow:hidden;background:#111827;color:#f8fafc;border-radius:.7rem}
.kb-article-body .content-code-command figcaption{margin:0;padding:.65rem 1rem;color:#cbd5e1;background:#1f2937}
.kb-article-body .content-code-command pre{margin:0;padding:1rem;overflow-x:auto}
.kb-article-body .content-action-link a,.kb-article-body .content-embed a{display:inline-flex;align-items:center;min-height:44px;padding:.65rem .9rem;background:var(--color-primary);color:var(--color-on-primary);text-decoration:none;border-radius:.55rem}
.kb-faq dl{margin-bottom:0}
.kb-faq dl>div{padding-block:.8rem;border-top:1px solid var(--color-border)}
.kb-faq dt{font-weight:750}
.kb-faq dd{margin:.3rem 0 0;color:var(--color-text-muted)}

.kb-reader-actions{margin-top:2.5rem;padding:1.25rem;background:var(--color-surface-muted);border:1px solid var(--color-border);border-radius:.8rem}
.kb-reader-actions>section{display:grid;gap:1rem}
.kb-reader-actions :is(.article-bookmark,.article-share-action,.article-feedback){margin:0}
.kb-reader-actions :is(.article-bookmark,.article-share-action){display:flex;flex-wrap:wrap;align-items:center;gap:.75rem}
.kb-reader-actions button,.kb-search-client button{padding:.6rem 1rem;color:var(--color-on-primary);font-weight:750;background:var(--color-primary);border:1px solid var(--color-primary);border-radius:.55rem}
.kb-reader-actions button[aria-pressed="true"]{color:var(--color-primary);background:var(--color-surface)}
.kb-reader-actions :is(p,span){color:var(--color-text-muted);font-size:.82rem}
.kb-reader-actions .article-feedback{padding-top:1rem;border-top:1px solid var(--color-border)}
.kb-reader-actions .article-feedback h2{font-size:1rem}
.kb-reader-actions .article-feedback div{display:flex;gap:.5rem}

.kb-search-client{padding:clamp(1rem,3vw,1.75rem)}
.kb-search-client .search-controller form{display:grid;gap:.6rem}
.kb-search-client .search-controller label{font-weight:750}
.kb-search-client .search-controller input{width:100%;min-height:50px;padding:.7rem .85rem;color:var(--color-text);background:var(--color-canvas);border:1px solid var(--color-border);border-radius:.55rem}
.kb-search-client .search-controller input:hover{border-color:var(--color-primary)}
.kb-search-client .search-controller button:disabled{cursor:wait;opacity:.58}
.kb-search-client .search-results,.kb-search-client .search-fallback ul{display:grid;gap:.75rem;margin:1rem 0 0;padding:0;list-style:none}
.kb-search-client .search-results article{padding:1rem;background:var(--color-canvas);border:1px solid var(--color-border);border-radius:.6rem}
.kb-search-client .search-results h3{margin-top:0}
.kb-search-client .search-results p:last-child{margin-bottom:0;color:var(--color-text-muted);font-size:.82rem}
.kb-search-client .search-fallback ul{display:flex;flex-wrap:wrap}
.kb-search-client .search-fallback a{display:inline-flex;min-height:44px;align-items:center;padding:.45rem .75rem;background:var(--color-surface-muted);border:1px solid var(--color-border);border-radius:999px;text-decoration:none}

.theme-minimal-knowledge-base aside[aria-label="광고"]{display:grid;place-items:center;margin-block:1.5rem;color:var(--color-text-muted);background:var(--color-surface);border:1px dashed var(--color-border);border-radius:.7rem}
.kb-not-found-route,.kb-retired-route{max-width:36rem;margin:clamp(3rem,10vw,7rem) auto;padding:clamp(1.5rem,4vw,2.5rem);text-align:center;background:var(--color-surface);border:1px solid var(--color-border);border-radius:1rem;box-shadow:0 .8rem 2rem rgba(19,33,58,.06)}
.kb-not-found-route>p:first-of-type,.kb-retired-route>p:first-of-type{margin:0;color:var(--color-primary);font-size:.85rem;font-weight:800;letter-spacing:.12em}
.kb-not-found-route h1,.kb-retired-route h1{margin:.5rem 0;font-size:clamp(2rem,7vw,3.5rem)}
.kb-not-found-route nav ul,.kb-retired-route nav ul{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;margin:1.25rem 0 0;padding:0;list-style:none}

@media(min-width:40rem){
  .kb-category-grid>ul,.kb-latest-articles>ul,.kb-category-articles>ul,.kb-related-articles>ul{grid-template-columns:repeat(2,minmax(0,1fr))}
  .kb-latest-articles>ul>li:only-child,.kb-category-articles>ul>li:only-child,.kb-related-articles>ul>li:only-child{grid-column:1/-1}
  .kb-search-client .search-controller form{grid-template-columns:minmax(0,1fr) auto;align-items:end}
  .kb-search-client .search-controller label{grid-column:1/-1}
  .kb-search-client .search-controller button{min-width:7rem}
  .kb-article-trust dl{grid-template-columns:repeat(4,minmax(0,1fr))}
  .kb-article-body figure>div{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(min-width:64rem){
  .theme-minimal-knowledge-base{display:grid;grid-template-columns:16rem minmax(0,1fr);background:var(--color-canvas)}
  .kb-knowledge-rail{position:sticky;top:0;align-self:start;min-height:100vh;padding:2rem 1.2rem;background:var(--color-surface);border-right:1px solid var(--color-border);border-bottom:0;box-shadow:none}
  .kb-rail-header{padding:.15rem .55rem 1.25rem;border-bottom:1px solid var(--color-border)}
  .kb-rail-header p{margin:.45rem 0 0}
  .kb-knowledge-rail nav>ul{display:grid;gap:.25rem;margin-top:1rem;padding:0;overflow:visible}
  .kb-knowledge-rail ul ul{display:grid;gap:.15rem;margin:.2rem 0 .4rem .7rem;padding-left:.65rem;border-left:1px solid var(--color-border)}
  .kb-knowledge-rail nav a{min-height:42px;padding:.45rem .6rem;border-color:transparent;background:transparent;border-radius:.4rem;white-space:normal}
  .theme-minimal-knowledge-base>footer{grid-column:2}
}
@media(prefers-reduced-motion:reduce){
  .theme-minimal-knowledge-base *{scroll-behavior:auto!important;transition:none!important}
}
@media print{
  .theme-minimal-knowledge-base{display:block;min-height:0;background:#fff;color:#000;font-size:10.5pt}
  .kb-skip-link,.kb-knowledge-rail,.theme-minimal-knowledge-base>footer,.kb-home-search,.kb-reader-actions,.theme-minimal-knowledge-base aside[aria-label="광고"]{display:none!important}
  .theme-minimal-knowledge-base>main{width:100%;max-width:none;margin:0;padding:0}
  .kb-article-route,.kb-static-route{max-width:none}
  .kb-answer-first,.kb-article-trust,.kb-article-toc,.kb-article-sources,.kb-update-triggers,.kb-faq{box-shadow:none;break-inside:avoid}
  .kb-article-body{max-width:none;font-size:10.5pt}
  .kb-article-body :is(figure,table,aside){break-inside:avoid}
  .kb-article-body a[href^="http"]:after{font-size:.8em;font-weight:400;content:" (" attr(href) ")"}
}
`;
