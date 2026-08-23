import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ContentBlocks, type TextContentBlock } from "./content-blocks";

describe("ContentBlocks", () => {
  it("renders text blocks with semantic elements", () => {
    const blocks: TextContentBlock[] = [
      { type: "heading", id: "prepare", level: 2, text: "준비하기" },
      { type: "paragraph", markdown: "인증 수단을 확인합니다." },
    ];

    const html = renderToStaticMarkup(createElement(ContentBlocks, { blocks }));

    expect(html).toContain('<h2 id="prepare">준비하기</h2>');
    expect(html).toContain("<p>인증 수단을 확인합니다.</p>");
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
