import { ArticleBookmark } from "./article-bookmark";
import { ArticleFeedback } from "./article-feedback";
import { ArticleShareButton } from "./article-share-button";

export interface ArticleReaderActionsProps {
  readonly siteId: string;
  readonly articleId: string;
  readonly canonicalUrl: string;
  readonly localBookmarksEnabled: boolean;
}

export function ArticleReaderActions({
  siteId,
  articleId,
  canonicalUrl,
  localBookmarksEnabled,
}: ArticleReaderActionsProps) {
  return (
    <section aria-label="기사 독자 기능">
      {localBookmarksEnabled ? (
        <ArticleBookmark siteId={siteId} articleId={articleId} />
      ) : null}
      <ArticleShareButton articleId={articleId} canonicalUrl={canonicalUrl} />
      <ArticleFeedback />
    </section>
  );
}
