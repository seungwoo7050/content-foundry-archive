import type { ArticleTrustViewModel } from "../lib/article-trust-view-model";

type ArticleEvidenceProps = Pick<
  ArticleTrustViewModel,
  "sources" | "updateTriggers" | "faq"
>;

export function ArticleEvidence({
  sources,
  updateTriggers,
  faq,
}: ArticleEvidenceProps) {
  if (sources.length === 0 && updateTriggers.length === 0 && faq.length === 0) {
    return null;
  }

  return (
    <div className="article-evidence">
      {sources.length > 0 ? (
        <section aria-labelledby="article-sources-title">
          <h2 id="article-sources-title">공개 출처</h2>
          <ul>
            {sources.map((source, index) => (
              <li key={`${source.label}-${index}`}>
                {source.href ? (
                  <a href={source.href} rel="noreferrer noopener" target="_blank">
                    {source.label} (새 창)
                  </a>
                ) : (
                  <span>{source.label}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {updateTriggers.length > 0 ? (
        <section aria-labelledby="article-update-triggers-title">
          <h2 id="article-update-triggers-title">다시 확인하는 기준</h2>
          <ul>
            {updateTriggers.map((trigger, index) => (
              <li key={`${trigger}-${index}`}>{trigger}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {faq.length > 0 ? (
        <section aria-labelledby="article-faq-title">
          <h2 id="article-faq-title">자주 묻는 질문</h2>
          <dl>
            {faq.map((item, index) => (
              <div key={`${item.question}-${index}`}>
                <dt>{item.question}</dt>
                <dd>
                  <p>{item.answerText}</p>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}
