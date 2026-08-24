import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  ArticleShareButton,
  requestArticleShare,
  requestArticleShareWithAnalytics,
} from "./article-share-button";

describe("article share action", () => {
  it("uses the native share target without sending article text", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    await expect(
      requestArticleShare({ share }, "https://guides.example.kr/article/one"),
    ).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith({
      url: "https://guides.example.kr/article/one",
    });
  });

  it("copies the canonical URL when native sharing is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(
      requestArticleShare(
        { clipboard: { writeText } },
        "https://guides.example.kr/article/one",
      ),
    ).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith(
      "https://guides.example.kr/article/one",
    );
  });

  it("fails closed for unsafe URLs and unavailable browser features", async () => {
    await expect(
      requestArticleShare({}, "javascript:alert(1)"),
    ).resolves.toBe("unavailable");
    await expect(
      requestArticleShare({}, "https://guides.example.kr/article/one"),
    ).resolves.toBe("unavailable");
  });

  it("records successful channels without recording cancelled attempts", async () => {
    const emit = vi.fn().mockReturnValue(true);

    await expect(requestArticleShareWithAnalytics(
      { share: vi.fn().mockResolvedValue(undefined) },
      "https://guides.example.kr/article/one",
      "ART-000123",
      emit,
    )).resolves.toBe("shared");
    expect(emit).toHaveBeenCalledWith({
      eventName: "share_click",
      articleId: "ART-000123",
      channel: "native",
    });

    await expect(requestArticleShareWithAnalytics(
      {},
      "https://guides.example.kr/article/one",
      "ART-000123",
      emit,
    )).resolves.toBe("unavailable");
    expect(emit).toHaveBeenCalledTimes(1);
  });

  it("renders one labeled button and a polite result region", () => {
    const markup = renderToStaticMarkup(
      <ArticleShareButton
        articleId="ART-000123"
        canonicalUrl="https://guides.example.kr/article/one"
      />,
    );

    expect(markup).toContain('<button type="button">공유</button>');
    expect(markup).toContain('aria-live="polite"');
  });
});
