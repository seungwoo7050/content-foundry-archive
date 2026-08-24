import type { ArticleTrustViewModel } from "../lib/article-trust-view-model";

type ArticleTrustSummaryProps = Pick<
  ArticleTrustViewModel,
  | "authorLabel"
  | "operatorLabel"
  | "published"
  | "updated"
  | "aboutPath"
  | "contactPath"
>;

export function ArticleTrustSummary({
  authorLabel,
  operatorLabel,
  published,
  updated,
  aboutPath,
  contactPath,
}: ArticleTrustSummaryProps) {
  return (
    <section className="article-trust" aria-labelledby="article-trust-title">
      <h2 id="article-trust-title">이 안내의 정보</h2>
      <dl>
        <div>
          <dt>작성</dt>
          <dd>{authorLabel}</dd>
        </div>
        <div>
          <dt>운영</dt>
          <dd>{operatorLabel}</dd>
        </div>
        <div>
          <dt>게시</dt>
          <dd>
            <time dateTime={published.dateTime}>{published.label}</time>
          </dd>
        </div>
        {updated ? (
          <div>
            <dt>수정</dt>
            <dd>
              <time dateTime={updated.dateTime}>{updated.label}</time>
            </dd>
          </div>
        ) : null}
      </dl>
      {aboutPath || contactPath ? (
        <p>
          {aboutPath ? <a href={aboutPath}>운영 방식 보기</a> : null}
          {aboutPath && contactPath ? " · " : null}
          {contactPath ? <a href={contactPath}>수정 요청하기</a> : null}
        </p>
      ) : null}
    </section>
  );
}
