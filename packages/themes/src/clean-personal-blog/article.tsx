import type { ArticleRouteViewModel } from "../content-route-view-model.js";
import {
  getThemeAdSlot,
  type ThemeAdSlotContext,
} from "../theme-ad-slot.js";
import { ThemeArticleList, ThemeArticleTopics } from "../theme-links.js";

function ArticleTrust({ route }: { readonly route: ArticleRouteViewModel }) {
  return (
    <section aria-labelledby="personal-trust-title" className="personal-article-meta">
      <h2 id="personal-trust-title">이 글의 정보</h2>
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
    <div className="personal-evidence">
      {route.sources.length > 0 ? (
        <section aria-labelledby="personal-sources-title">
          <h2 id="personal-sources-title">공개 출처</h2>
          <ul>{route.sources.map((source, index) => (
            <li key={`${source.label}:${index}`}>{source.href ? <a href={source.href}>{source.label}</a> : source.label}</li>
          ))}</ul>
        </section>
      ) : null}
      {route.updateTriggers.length > 0 ? (
        <section aria-labelledby="personal-triggers-title">
          <h2 id="personal-triggers-title">다시 확인하는 기준</h2>
          <ul>{route.updateTriggers.map((trigger, index) => <li key={`${trigger}:${index}`}>{trigger}</li>)}</ul>
        </section>
      ) : null}
      {route.faq.length > 0 ? (
        <section aria-labelledby="personal-faq-title">
          <h2 id="personal-faq-title">자주 묻는 질문</h2>
          <dl className="personal-faq">{route.faq.map((item, index) => (
            <div key={`${item.question}:${index}`}><dt>{item.question}</dt><dd>{item.answer}</dd></div>
          ))}</dl>
        </section>
      ) : null}
    </div>
  );
}

export function CleanPersonalArticle({
  context = {},
  route,
}: {
  readonly context?: ThemeAdSlotContext;
  readonly route: ArticleRouteViewModel;
}) {
  return (
    <article className="personal-article">
      <header className="personal-article-header">
        {route.category ? <p className="personal-category"><a href={route.category.href}>{route.category.label}</a></p> : null}
        <h1>{route.heading}</h1>
        <p className="personal-article-summary">{route.description}</p>
        {route.estimatedReadingTime ? (
          <p className="personal-article-reading-time">
            {route.estimatedReadingTime.label}
          </p>
        ) : null}
        <ThemeArticleTopics topics={route.topics} />
      </header>
      {route.advertisingEligible
        ? getThemeAdSlot(context, "article-after-summary")
        : null}
      <ArticleTrust route={route} />
      {route.hero ? <div className="personal-hero">{route.hero}</div> : null}
      {route.toc.length > 0 ? (
        <nav aria-labelledby="personal-toc-title" className="personal-toc">
          <h2 id="personal-toc-title">목차</h2>
          <ol>{route.toc.map((item) => <li data-level={item.level} key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>)}</ol>
        </nav>
      ) : null}
      <div className="personal-body">{route.body}</div>
      <ArticleEvidence route={route} />
      {route.readerActions !== null && route.readerActions !== undefined ? (
        <section aria-labelledby="personal-reader-actions-title" className="personal-section">
          <h2 id="personal-reader-actions-title">글 읽기 도구</h2>
          {route.readerActions}
        </section>
      ) : null}
      {route.relatedSectionHeading && route.relatedArticles.length > 0 ? (
        <section aria-labelledby="personal-related-title" className="personal-related personal-section">
          <h2 id="personal-related-title">{route.relatedSectionHeading}</h2>
          <ThemeArticleList articles={route.relatedArticles} headingLevel={3} />
        </section>
      ) : null}
      {route.advertisingEligible
        ? getThemeAdSlot(context, "article-end")
        : null}
    </article>
  );
}
