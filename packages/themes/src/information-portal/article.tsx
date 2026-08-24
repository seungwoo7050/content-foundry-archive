import type { ArticleRouteViewModel } from "../content-route-view-model.js";
import {
  getThemeAdSlot,
  type ThemeAdSlotContext,
} from "../theme-ad-slot.js";
import { ThemeArticleList } from "../theme-links.js";
import { PortalRouteIntro } from "./shell.js";

function PortalTrust({ route }: { readonly route: ArticleRouteViewModel }) {
  return (
    <section aria-labelledby="ip-trust" className="ip-panel ip-trust">
      <h2 id="ip-trust">안내 정보</h2>
      <dl>
        <dt>작성</dt><dd>{route.authorLabel}</dd>
        <dt>운영</dt><dd>{route.operatorLabel}</dd>
        <dt>게시</dt><dd><time dateTime={route.published.dateTime}>{route.published.label}</time></dd>
        {route.updated ? <><dt>수정</dt><dd><time dateTime={route.updated.dateTime}>{route.updated.label}</time></dd></> : null}
      </dl>
      {route.trustLinks.length > 0 ? <ul>{route.trustLinks.map((link) => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul> : null}
    </section>
  );
}

function PortalEvidence({ route }: { readonly route: ArticleRouteViewModel }) {
  return (
    <>
      {route.sources.length > 0 ? (
        <section aria-labelledby="ip-sources" className="ip-panel">
          <h2 id="ip-sources">출처</h2>
          <ul>{route.sources.map((source, index) => <li key={`${source.label}:${index}`}>{source.href ? <a href={source.href}>{source.label}</a> : source.label}</li>)}</ul>
        </section>
      ) : null}
      {route.updateTriggers.length > 0 ? (
        <section aria-labelledby="ip-triggers" className="ip-panel">
          <h2 id="ip-triggers">업데이트 기준</h2>
          <ul>{route.updateTriggers.map((trigger, index) => <li key={`${trigger}:${index}`}>{trigger}</li>)}</ul>
        </section>
      ) : null}
      {route.faq.length > 0 ? (
        <section aria-labelledby="ip-faq" className="ip-panel">
          <h2 id="ip-faq">자주 묻는 질문</h2>
          <dl>{route.faq.map((item, index) => <div key={`${item.question}:${index}`}><dt>{item.question}</dt><dd>{item.answer}</dd></div>)}</dl>
        </section>
      ) : null}
    </>
  );
}

export function InformationPortalArticle({
  context = {},
  route,
}: {
  readonly context?: ThemeAdSlotContext;
  readonly route: ArticleRouteViewModel;
}) {
  return (
    <article className="ip-stack">
      <PortalRouteIntro route={route} showDescription={false} />
      {route.category ? <p><a href={route.category.href}>{route.category.label}</a></p> : null}
      <section aria-labelledby="ip-summary" className="ip-panel ip-summary">
        <h2 id="ip-summary">핵심 안내</h2><p>{route.description}</p>
      </section>
      {route.advertisingEligible
        ? getThemeAdSlot(context, "article-after-summary")
        : null}
      {route.hero ? <div className="ip-panel ip-body">{route.hero}</div> : null}
      <div className="ip-article-layout">
        <div className="ip-article-main">
          <div className="ip-panel ip-body">{route.body}</div>
          <PortalEvidence route={route} />
        </div>
        <aside aria-label="글 탐색과 안내 정보" className="ip-article-rail">
          <PortalTrust route={route} />
          {route.toc.length > 0 ? (
            <nav aria-labelledby="ip-toc" className="ip-panel ip-toc">
              <h2 id="ip-toc">목차</h2>
              <ol>{route.toc.map((item) => <li data-level={item.level} key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>)}</ol>
            </nav>
          ) : null}
          {route.advertisingEligible
            ? getThemeAdSlot(context, "desktop-sidebar")
            : null}
        </aside>
      </div>
      {route.relatedSectionHeading && route.relatedArticles.length > 0 ? (
        <section aria-labelledby="ip-related" className="ip-list">
          <h2 id="ip-related">{route.relatedSectionHeading}</h2>
          <ThemeArticleList articles={route.relatedArticles} headingLevel={3} />
        </section>
      ) : null}
      {route.advertisingEligible
        ? getThemeAdSlot(context, "article-end")
        : null}
    </article>
  );
}
