import type { ArticleRouteViewModel } from "../content-route-view-model.js";
import { ThemeArticleList } from "../theme-links.js";
import { KnowledgeBreadcrumbs } from "./route-chrome.js";

function ArticleTrust({ route }: { readonly route: ArticleRouteViewModel }) {
  return (
    <section className="kb-article-trust" aria-labelledby="kb-trust-title">
      <h2 id="kb-trust-title">이 안내의 정보</h2>
      <dl>
        <div><dt>작성</dt><dd>{route.authorLabel}</dd></div>
        <div><dt>운영</dt><dd>{route.operatorLabel}</dd></div>
        <div><dt>게시</dt><dd><time dateTime={route.published.dateTime}>{route.published.label}</time></dd></div>
        {route.updated ? (
          <div><dt>수정</dt><dd><time dateTime={route.updated.dateTime}>{route.updated.label}</time></dd></div>
        ) : null}
      </dl>
      {route.trustLinks.length > 0 ? (
        <ul>{route.trustLinks.map((link) => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul>
      ) : null}
    </section>
  );
}

function ArticleEvidence({ route }: { readonly route: ArticleRouteViewModel }) {
  return (
    <>
      {route.sources.length > 0 ? (
        <section className="kb-article-sources" aria-labelledby="kb-sources-title">
          <h2 id="kb-sources-title">공개 출처</h2>
          <ul>{route.sources.map((source, index) => (
            <li key={`${source.label}:${index}`}>
              {source.href ? <a href={source.href}>{source.label}</a> : source.label}
            </li>
          ))}</ul>
        </section>
      ) : null}
      {route.updateTriggers.length > 0 ? (
        <section className="kb-update-triggers" aria-labelledby="kb-triggers-title">
          <h2 id="kb-triggers-title">다시 확인하는 기준</h2>
          <ul>{route.updateTriggers.map((trigger, index) => <li key={`${trigger}:${index}`}>{trigger}</li>)}</ul>
        </section>
      ) : null}
      {route.faq.length > 0 ? (
        <section className="kb-faq" aria-labelledby="kb-faq-title">
          <h2 id="kb-faq-title">자주 묻는 질문</h2>
          <dl>{route.faq.map((item, index) => (
            <div key={`${item.question}:${index}`}><dt>{item.question}</dt><dd>{item.answer}</dd></div>
          ))}</dl>
        </section>
      ) : null}
    </>
  );
}

function ArticleContents({ route }: { readonly route: ArticleRouteViewModel }) {
  return route.toc.length > 0 ? (
    <nav className="kb-article-toc" aria-labelledby="kb-toc-title">
      <h2 id="kb-toc-title">문서 목차</h2>
      <ol>{route.toc.map((item) => (
        <li data-level={item.level} key={item.id}>
          <a href={`#${item.id}`}>{item.label}</a>
        </li>
      ))}</ol>
    </nav>
  ) : null;
}

export function MinimalKnowledgeBaseArticle({
  route,
}: {
  readonly route: ArticleRouteViewModel;
}) {
  return (
    <div className="kb-article-route" data-route="article">
      <KnowledgeBreadcrumbs route={route} />
      <article>
        <header className="kb-answer-first">
          {route.category ? <p><a href={route.category.href}>{route.category.label}</a></p> : null}
          <h1>{route.heading}</h1>
          <p>{route.description}</p>
        </header>
        <ArticleTrust route={route} />
        <ArticleContents route={route} />
        {route.hero ? <div className="kb-article-hero">{route.hero}</div> : null}
        <div className="kb-article-body">{route.body}</div>
        <ArticleEvidence route={route} />
        {route.relatedArticles.length > 0 ? (
          <section className="kb-related-articles">
            {route.relatedSectionHeading ? <h2>{route.relatedSectionHeading}</h2> : null}
            <ThemeArticleList articles={route.relatedArticles} headingLevel={3} />
          </section>
        ) : null}
      </article>
    </div>
  );
}
