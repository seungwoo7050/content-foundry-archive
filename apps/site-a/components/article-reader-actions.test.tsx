import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ArticleBookmark } from "./article-bookmark";
import { ArticleFeedback } from "./article-feedback";
import {
  ArticleReaderActions,
  type ArticleReaderActionsProps,
} from "./article-reader-actions";
import { ArticleShareButton } from "./article-share-button";

const props = {
  siteId: "site-a",
  articleId: "ART-000123",
  canonicalUrl: "https://guides.example.kr/article/one",
  localBookmarksEnabled: true,
} satisfies ArticleReaderActionsProps;

function childrenOf(element: ReactElement): readonly ReactNode[] {
  return Children.toArray(
    (element.props as { readonly children: ReactNode }).children,
  );
}

describe("ArticleReaderActions", () => {
  it("wires stable IDs and the canonical URL to their controls", () => {
    const children = childrenOf(ArticleReaderActions(props));
    const bookmark = children.find(
      (child) => isValidElement(child) && child.type === ArticleBookmark,
    );
    const share = children.find(
      (child) => isValidElement(child) && child.type === ArticleShareButton,
    );
    const feedback = children.find(
      (child) => isValidElement(child) && child.type === ArticleFeedback,
    );

    expect(bookmark).toMatchObject({
      props: { siteId: "site-a", articleId: "ART-000123" },
    });
    expect(share).toMatchObject({
      props: {
        articleId: "ART-000123",
        canonicalUrl: "https://guides.example.kr/article/one",
      },
    });
    expect(feedback).toMatchObject({
      props: { articleId: "ART-000123" },
    });
  });

  it("omits only the local bookmark when it is not explicitly enabled", () => {
    const children = childrenOf(ArticleReaderActions({
      ...props,
      localBookmarksEnabled: false,
    }));

    expect(children.some(
      (child) => isValidElement(child) && child.type === ArticleBookmark,
    )).toBe(false);
    expect(children.some(
      (child) => isValidElement(child) && child.type === ArticleShareButton,
    )).toBe(true);
    expect(children.some(
      (child) => isValidElement(child) && child.type === ArticleFeedback,
    )).toBe(true);
  });

  it("renders reader controls without account or public comment fields", () => {
    const markup = renderToStaticMarkup(<ArticleReaderActions {...props} />);

    expect(markup).toContain("기사 저장 상태를 확인하고 있습니다.");
    expect(markup).toContain(">공유</button>");
    expect(markup).toContain("이 안내가 도움이 되었나요?");
    expect(markup).not.toMatch(/<(?:form|input|textarea)\b/);
    expect(markup).not.toMatch(/계정|로그인|댓글/);
  });
});
