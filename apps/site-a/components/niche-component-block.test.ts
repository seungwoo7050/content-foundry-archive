import type { PublishedNicheComponentBlockV3 } from "@content-foundry/content-contract";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  type NicheComponentRegistry,
  NicheComponentBlock,
  type RegisteredNicheComponent,
  UnregisteredNicheComponentError,
} from "./niche-component-block";

const block: PublishedNicheComponentBlockV3 = {
  type: "niche-component",
  componentId: "date-gap-calculator",
  label: "날짜 <간격> 계산기",
  fallbackText: "시작일과 종료일을 달력에서 확인하세요.\n<script>실행 금지</script>",
};

function render(
  siteId: string,
  registry: NicheComponentRegistry,
  value = block,
) {
  return renderToStaticMarkup(
    createElement(NicheComponentBlock, { block: value, registry, siteId }),
  );
}

describe("NicheComponentBlock", () => {
  it("renders the exact site registration with complete escaped fallback text", () => {
    const receivedProps: unknown[] = [];
    const SiteAImplementation = (props: Record<string, never>) => {
      receivedProps.push(props);
      return createElement("output", null, "고정 로컬 계산기");
    };
    const SiteBImplementation = () =>
      createElement("output", null, "다른 사이트 구현");
    const siteAElement: RegisteredNicheComponent = createElement(
      SiteAImplementation,
    );
    const registry: NicheComponentRegistry = new Map([
      ["site-a", new Map([[block.componentId, siteAElement]])],
      ["site-b", new Map([[block.componentId, createElement(SiteBImplementation)]])],
    ]);

    const html = render("site-a", registry);

    expect(html).toContain("<figcaption>날짜 &lt;간격&gt; 계산기</figcaption>");
    expect(html).toContain(
      "<p>시작일과 종료일을 달력에서 확인하세요.\n&lt;script&gt;실행 금지&lt;/script&gt;</p>",
    );
    expect(html).toContain("<output>고정 로컬 계산기</output>");
    expect(html).not.toContain("다른 사이트 구현");
    expect(receivedProps).toEqual([{}]);
  });

  it.each([
    ["wrong site", "site-b", block.componentId],
    ["unknown component", "site-a", "unknown-component"],
    ["prototype-like component", "site-a", "constructor"],
  ])("fails closed for a %s lookup", (_case, siteId, componentId) => {
    const Implementation = vi.fn(() =>
      createElement("output", null, "실행되면 안 됨"),
    );
    const registry: NicheComponentRegistry = new Map([
      ["site-a", new Map([[block.componentId, createElement(Implementation)]])],
    ]);

    expect(() => render(siteId, registry, { ...block, componentId })).toThrow(
      UnregisteredNicheComponentError,
    );
    expect(Implementation).not.toHaveBeenCalled();
  });
});
