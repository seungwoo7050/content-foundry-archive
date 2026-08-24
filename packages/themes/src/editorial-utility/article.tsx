import type { ArticleRouteViewModel } from "../content-route-view-model.js";
import {
  getThemeAdSlot,
  type ThemeAdSlotContext,
} from "../theme-ad-slot.js";
import { ThemeArticleList } from "../theme-links.js";

function ArticleMetadata({ route }: { readonly route: ArticleRouteViewModel }) {
  return (
    <>
      <dl className="editorial-article-meta">
        <div><dt>작성</dt><dd>{route.authorLabel}</dd></div>
        <div><dt>운영</dt><dd>{route.operatorLabel}</dd></div>
        <div><dt>게시</dt><dd><time dateTime={route.published.dateTime}>{route.published.label}</time></dd></div>
        {route.updated ? (
          <div><dt>수정</dt><dd><time dateTime={route.updated.dateTime}>{route.updated.label}</time></dd></div>
        ) : null}
      </dl>
      {route.trustLinks.length > 0 ? (
        <nav className="editorial-trust-links" aria-label="운영 및 신뢰 정보">
          <ul>{route.trustLinks.map((link) => (
            <li key={link.href}><a href={link.href}>{link.label}</a></li>
          ))}</ul>
        </nav>
      ) : null}
    </>
  );
}

function EvidenceRail({
  context,
  route,
}: {
  readonly context: ThemeAdSlotContext;
  readonly route: ArticleRouteViewModel;
}) {
  return (
    <aside className="editorial-evidence" aria-labelledby="editorial-evidence-title">
      <h2 id="editorial-evidence-title">이 안내의 정보</h2>
      <p>작성 {route.authorLabel}</p>
      <p>운영 {route.operatorLabel}</p>
      {route.toc.length > 0 ? (
        <nav aria-labelledby="editorial-toc-title">
          <h3 id="editorial-toc-title">목차</h3>
          <ol>{route.toc.map((item) => (
            <li data-level={item.level} key={item.id}>
              <a href={`#${item.id}`}>{item.label}</a>
            </li>
          ))}</ol>
        </nav>
      ) : null}
      {route.sources.length > 0 ? (
        <section aria-labelledby="editorial-sources-title">
          <h3 id="editorial-sources-title">공개 출처</h3>
          <ul>{route.sources.map((source, index) => (
            <li key={`${source.label}:${index}`}>
              {source.href ? <a href={source.href}>{source.label}</a> : source.label}
            </li>
          ))}</ul>
        </section>
      ) : null}
      {route.updateTriggers.length > 0 ? (
        <section aria-labelledby="editorial-triggers-title">
          <h3 id="editorial-triggers-title">다시 확인하는 기준</h3>
          <ul>{route.updateTriggers.map((trigger, index) => (
            <li key={`${trigger}:${index}`}>{trigger}</li>
          ))}</ul>
        </section>
      ) : null}
      {route.advertisingEligible
        ? getThemeAdSlot(context, "desktop-sidebar")
        : null}
    </aside>
  );
}

export function EditorialArticle({
  context = {},
  route,
}: {
  readonly context?: ThemeAdSlotContext;
  readonly route: ArticleRouteViewModel;
}) {
  return (
    <article className="editorial-article" data-route="article">
      <header className="editorial-article-header">
        {route.category ? <p><a href={route.category.href}>{route.category.label}</a></p> : null}
        <h1>{route.heading}</h1>
        <p className="editorial-dek">{route.description}</p>
        <ArticleMetadata route={route} />
      </header>
      {route.advertisingEligible
        ? getThemeAdSlot(context, "article-after-summary")
        : null}
      {route.hero ? <div className="editorial-hero">{route.hero}</div> : null}
      {route.advertisingEligible
        ? getThemeAdSlot(context, "article-mid-1")
        : null}
      <div className="editorial-article-layout">
        <EvidenceRail context={context} route={route} />
        <div className="editorial-body">{route.body}</div>
      </div>
      {route.faq.length > 0 ? (
        <section className="editorial-faq editorial-section" aria-labelledby="editorial-faq-title">
          <h2 id="editorial-faq-title">자주 묻는 질문</h2>
          {route.faq.map((item, index) => (
            <details key={`${item.question}:${index}`}>
              <summary>{item.question}</summary><p>{item.answer}</p>
            </details>
          ))}
        </section>
      ) : null}
      {route.advertisingEligible
        ? getThemeAdSlot(context, "article-mid-2")
        : null}
      {route.relatedSectionHeading && route.relatedArticles.length > 0 ? (
        <section className="editorial-related editorial-section">
          <h2>{route.relatedSectionHeading}</h2>
          <ThemeArticleList articles={route.relatedArticles} headingLevel={3} />
        </section>
      ) : null}
      {route.advertisingEligible
        ? getThemeAdSlot(context, "article-end")
        : null}
    </article>
  );
}
