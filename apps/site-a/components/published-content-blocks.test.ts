import type { PublishedContentBlockV3 } from "@content-foundry/content-contract";
import type { ResponsiveImageAsset } from "@content-foundry/media";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import canonicalContent from "../../../packages/content-contract/vendor/3.0.0/fixtures/valid/content.json";
import { type RegisteredNicheComponent } from "./niche-component-block";
import {
  PublishedContentBlocks,
  UnsupportedPublishedContentBlockError,
} from "./published-content-blocks";

function asset(mediaId: string): ResponsiveImageAsset {
  return {
    fallback: {
      mediaId,
      relativePath: `_media/${mediaId}/source.png`,
      publicPath: `/_media/${mediaId}/source.png`,
      sha256: mediaId,
      mimeType: "image/png",
      width: 16,
      height: 9,
      alt: `${mediaId} 설명`,
      credit: null,
      license: null,
    },
    derivatives: [{
      relativePath: `_media/${mediaId}/16w.webp`,
      publicPath: `/_media/${mediaId}/16w.webp`,
      mimeType: "image/webp",
      width: 16,
      height: 9,
    }],
  };
}

const blocks: PublishedContentBlockV3[] = [
  { type: "paragraph", markdown: "준비물을 확인합니다." },
  { type: "image", mediaId: "MED-000045" },
  {
    type: "gallery",
    items: [{ mediaId: "MED-000045" }, { mediaId: "MED-000046" }],
  },
  { type: "code", language: "html", code: "<strong>안전</strong>" },
  { type: "command", shell: "posix-sh", command: "git status --short" },
  { type: "action-link", kind: "internal", label: "소개", path: "/about" },
  {
    type: "niche-component",
    componentId: "implemented",
    label: "로컬 도구",
    fallbackText: "정적 대안",
  },
];

const Implementation = () => createElement("output", null, "구현 결과");
const implementation: RegisteredNicheComponent = createElement(Implementation);
const context = {
  mediaAssets: new Map([
    ["MED-000045", asset("MED-000045")],
    ["MED-000046", asset("MED-000046")],
  ]),
  nicheComponents: new Map([
    [
      "site-a",
      new Map([
        ["implemented", implementation],
        ["date-gap-calculator", implementation],
      ]),
    ],
  ]),
  siteId: "site-a",
};

describe("PublishedContentBlocks", () => {
  it("dispatches every renderer responsibility with shared context", () => {
    const html = renderToStaticMarkup(
      createElement(PublishedContentBlocks, { blocks, context }),
    );

    expect(html).toContain("준비물을 확인합니다.");
    expect(html.indexOf("/_media/MED-000045/source.png")).toBeLessThan(
      html.lastIndexOf("/_media/MED-000046/source.png"),
    );
    expect(html).toContain("&lt;strong&gt;안전&lt;/strong&gt;");
    expect(html).toContain("git status --short");
    expect(html).toContain('href="/about"');
    expect(html).toContain("정적 대안");
    expect(html).toContain("구현 결과");
  });

  it("renders the canonical complete v3 block vocabulary", () => {
    const canonicalBlocks = canonicalContent as PublishedContentBlockV3[];
    expect(new Set(canonicalBlocks.map((block) => block.type))).toEqual(
      new Set([
        "heading", "paragraph", "list", "quote", "callout", "image", "table",
        "embed", "gallery", "code", "command", "action-link", "niche-component",
      ]),
    );

    const html = renderToStaticMarkup(
      createElement(PublishedContentBlocks, { blocks: canonicalBlocks, context }),
    );
    const imageSources = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(
      (match) => match[1],
    );

    expect(imageSources).toEqual([
      "/_media/MED-000045/source.png",
      "/_media/MED-000045/source.png",
      "/_media/MED-000046/source.png",
    ]);
    expect(html).toContain("&lt;button type=&quot;button&quot;&gt;저장&lt;/button&gt;");
    expect(html).toContain("git status --short");
    expect(html).toContain('data-action-kind="internal"');
    expect(html).toContain('data-action-kind="official"');
    expect(html).toContain('data-action-kind="affiliate"');
    expect(html).toContain("공식 사이트 · 새 창");
    expect(html).toContain("제휴 링크 · 새 창");
    expect(html).toContain("구현 결과");
  });

  it("fails explicitly for an unknown runtime discriminator", () => {
    expect(() =>
      renderToStaticMarkup(
        createElement(PublishedContentBlocks, {
          blocks: [{ type: "future-block" }] as unknown as PublishedContentBlockV3[],
          context,
        }),
      ),
    ).toThrow(UnsupportedPublishedContentBlockError);
  });
});
