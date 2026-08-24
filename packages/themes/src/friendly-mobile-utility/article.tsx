import type { ArticleRouteViewModel } from "../content-route-view-model.js";
import { ThemeArticleList } from "../theme-links.js";
import { FriendlyRouteIntro } from "./shell.js";

function ArticleTrust({ route }: { readonly route: ArticleRouteViewModel }) {
  return (
    <section aria-labelledby="fmu-article-trust" className="fmu-panel fmu-trust">
      <h2 id="fmu-article-trust">안내 정보</h2>
      <dl>
        <dt>작성</dt><dd>{route.authorLabel}</dd>
        <dt>운영</dt><dd>{route.operatorLabel}</dd>
        <dt>게시</dt><dd><time dateTime={route.published.dateTime}>{route.published.label}</time></dd>
        {route.updated ? <><dt>수정</dt><dd><time dateTime={route.updated.dateTime}>{route.updated.label}</time></dd></> : null}
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
        <section aria-labelledby="fmu-sources" className="fmu-panel">
          <h2 id="fmu-sources">출처</h2>
          <ul>{route.sources.map((source, index) => <li key={`${source.label}:${index}`}>{source.href ? <a href={source.href}>{source.label}</a> : source.label}</li>)}</ul>
        </section>
      ) : null}
      {route.updateTriggers.length > 0 ? (
        <section aria-labelledby="fmu-update-triggers" className="fmu-panel">
          <h2 id="fmu-update-triggers">업데이트 기준</h2>
          <ul>{route.updateTriggers.map((trigger, index) => <li key={`${trigger}:${index}`}>{trigger}</li>)}</ul>
        </section>
      ) : null}
      {route.faq.length > 0 ? (
        <section aria-labelledby="fmu-faq" className="fmu-panel">
          <h2 id="fmu-faq">자주 묻는 질문</h2>
          <dl>{route.faq.map((item, index) => <div key={`${item.question}:${index}`}><dt>{item.question}</dt><dd>{item.answer}</dd></div>)}</dl>
        </section>
      ) : null}
    </>
  );
}

export function FriendlyArticle({ route }: { readonly route: ArticleRouteViewModel }) {
  return (
    <article className="fmu-stack">
      <FriendlyRouteIntro route={route} showDescription={false} />
      {route.category ? <p className="fmu-eyebrow"><a href={route.category.href}>{route.category.label}</a></p> : null}
      {route.hero ? <div className="fmu-panel fmu-body">{route.hero}</div> : null}
      <section aria-labelledby="fmu-summary" className="fmu-panel fmu-summary">
        <h2 id="fmu-summary">이 글에서 확인할 내용</h2>
        <p>{route.description}</p>
      </section>
      <ArticleTrust route={route} />
      {route.toc.length > 0 ? (
        <nav aria-labelledby="fmu-toc" className="fmu-panel">
          <h2 id="fmu-toc">목차</h2>
          <ol>{route.toc.map((item) => <li data-level={item.level} key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>)}</ol>
        </nav>
      ) : null}
      <div className="fmu-panel fmu-body">{route.body}</div>
      <ArticleEvidence route={route} />
      {route.relatedSectionHeading && route.relatedArticles.length > 0 ? (
        <section aria-labelledby="fmu-related" className="fmu-list">
          <h2 id="fmu-related">{route.relatedSectionHeading}</h2>
          <ThemeArticleList articles={route.relatedArticles} headingLevel={3} />
        </section>
      ) : null}
    </article>
  );
}
