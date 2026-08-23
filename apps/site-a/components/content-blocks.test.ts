import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ContentBlocks, type TextContentBlock } from "./content-blocks";

describe("ContentBlocks", () => {
  it("renders text blocks with semantic elements", () => {
    const blocks: TextContentBlock[] = [
      { type: "heading", id: "prepare", level: 2, text: "준비하기" },
      { type: "paragraph", markdown: "인증 수단을 확인합니다." },
      { type: "list", ordered: true, items: ["로그인", "신청"] },
      {
        type: "quote",
        markdown: "공식 안내를 확인하세요.",
        attribution: "정부24",
      },
      { type: "callout", tone: "warning", markdown: "마감일을 확인하세요." },
    ];

    const html = renderToStaticMarkup(createElement(ContentBlocks, { blocks }));

    expect(html).toContain('<h2 id="prepare">준비하기</h2>');
    expect(html).toContain("<ol><li>로그인</li><li>신청</li></ol>");
    expect(html).toContain("<blockquote><p>공식 안내를 확인하세요.</p></blockquote>");
    expect(html).toContain("<figcaption>정부24</figcaption>");
    expect(html).toContain('aria-label="주의" data-tone="warning"');
  });

  it("escapes markdown fields as plain text", () => {
    const html = renderToStaticMarkup(
      createElement(ContentBlocks, {
        blocks: [
          {
            type: "paragraph",
            markdown: '<script>alert("unsafe")</script> **그대로**',
          },
        ],
      }),
    );

    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("**그대로**");
    expect(html).not.toContain("<script>");
  });
});
