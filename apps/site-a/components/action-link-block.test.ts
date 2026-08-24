import type { PublishedActionLinkBlockV3 } from "@content-foundry/content-contract";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ActionLinkBlock } from "./action-link-block";

function render(block: PublishedActionLinkBlockV3) {
  return renderToStaticMarkup(createElement(ActionLinkBlock, { block }));
}

describe("ActionLinkBlock", () => {
  it("renders an internal action as a same-context canonical link", () => {
    const html = render({
      type: "action-link",
      kind: "internal",
      label: "운영자 <소개> 읽기",
      path: "/about",
    });

    expect(html).toContain('data-action-kind="internal"');
    expect(html).toContain(
      '<a href="/about">운영자 &lt;소개&gt; 읽기</a>',
    );
    expect(html).not.toContain("target=");
    expect(html).not.toContain("rel=");
  });

  it.each([
    {
      kind: "official" as const,
      label: "공식 안내 확인",
      url: "https://official.example/guide?source=site-a&mode=public",
      href: "https://official.example/guide?source=site-a&amp;mode=public",
      rel: "noreferrer noopener",
      disclosure: "공식 사이트 · 새 창",
    },
    {
      kind: "affiliate" as const,
      label: "제휴 요금 확인",
      url: "https://partner.example/plan",
      href: "https://partner.example/plan",
      rel: "sponsored noreferrer noopener",
      disclosure: "제휴 링크 · 새 창",
    },
  ])("renders a classified $kind action with safe attributes", (action) => {
    const html = render({
      type: "action-link",
      kind: action.kind,
      label: action.label,
      url: action.url,
    });

    expect(html).toContain(`data-action-kind="${action.kind}"`);
    expect(html).toContain(`href="${action.href}"`);
    expect(html).toContain(`rel="${action.rel}" target="_blank"`);
    expect(html).toContain(`${action.label} <span>(${action.disclosure})</span>`);
  });

  it("rejects action hrefs that bypass contract validation", () => {
    expect(() =>
      render({
        type: "action-link",
        kind: "internal",
        label: "외부로 이동",
        path: "//attacker.example",
      }),
    ).toThrow("Unsafe internal action path");

    for (const url of [
      "javascript:alert(1)",
      "https://user:secret@official.example/guide",
    ]) {
      expect(() =>
        render({
          type: "action-link",
          kind: "official",
          label: "안전하지 않은 링크",
          url,
        }),
      ).toThrow("Unsafe external action URL");
    }
  });
});
