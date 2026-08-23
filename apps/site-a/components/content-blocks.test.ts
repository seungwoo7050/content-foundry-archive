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

  it("renders tables and embeds as semantic static fallbacks", () => {
    const html = renderToStaticMarkup(
      createElement(ContentBlocks, {
        blocks: [
          {
            type: "table",
            caption: "준비 항목",
            columns: ["항목", "상태"],
            rows: [["인증서", "필수"]],
          },
          {
            type: "embed",
            provider: "정부24 영상",
            url: "https://example.com/video",
          },
        ],
      }),
    );

    expect(html).toContain("<caption>준비 항목</caption><thead>");
    expect(html).toContain('<th scope="col">항목</th>');
    expect(html).toContain("<tbody><tr><td>인증서</td><td>필수</td></tr></tbody>");
    expect(html).toContain('href="https://example.com/video"');
    expect(html).not.toContain("<iframe");
  });

  it("rejects unsafe embeds", () => {
    expect(() =>
      renderToStaticMarkup(
        createElement(ContentBlocks, {
          blocks: [{ type: "embed", provider: "unsafe", url: "javascript:alert(1)" }],
        }),
      ),
    ).toThrow("Unsafe embed URL protocol");
  });
});
