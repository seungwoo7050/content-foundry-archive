import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ArticleEvidence } from "./article-evidence";

describe("ArticleEvidence", () => {
  it("omits every empty evidence section", () => {
    expect(
      renderToStaticMarkup(
        createElement(ArticleEvidence, {
          sources: [],
          updateTriggers: [],
          faq: [],
        }),
      ),
    ).toBe("");
  });

  it("renders safe sources, label-only sources, triggers, and escaped FAQ text", () => {
    const html = renderToStaticMarkup(
      createElement(ArticleEvidence, {
        sources: [
          { label: "공식 안내", href: "https://official.example/guide" },
          { label: "이메일 안내", href: null },
        ],
        updateTriggers: ["공식 절차가 바뀔 때"],
        faq: [
          {
            question: "무엇이 필요한가요?",
            answerText: '<script>alert("unsafe")</script> 신분증입니다.',
          },
        ],
      }),
    );

    expect(html).toContain('<h2 id="article-sources-title">공개 출처</h2>');
    expect(html).toContain('href="https://official.example/guide"');
    expect(html).toContain('rel="noreferrer noopener" target="_blank"');
    expect(html).toContain("<span>이메일 안내</span>");
    expect(html).not.toContain("mailto:");
    expect(html).toContain("<h2 id=\"article-update-triggers-title\">다시 확인하는 기준</h2>");
    expect(html).toContain("공식 절차가 바뀔 때");
    expect(html).toContain("&lt;script&gt;alert(&quot;unsafe&quot;)&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });
});
