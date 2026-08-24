import type { PublishedContentBlockV3 } from "@content-foundry/content-contract";
import type { ResponsiveImageAsset } from "@content-foundry/media";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

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
  { type: "image", mediaId: "MED-1" },
  { type: "gallery", items: [{ mediaId: "MED-1" }, { mediaId: "MED-2" }] },
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
    ["MED-1", asset("MED-1")],
    ["MED-2", asset("MED-2")],
  ]),
  nicheComponents: new Map([
    ["site-a", new Map([["implemented", implementation]])],
  ]),
  siteId: "site-a",
};

describe("PublishedContentBlocks", () => {
  it("dispatches every renderer responsibility with shared context", () => {
    const html = renderToStaticMarkup(
      createElement(PublishedContentBlocks, { blocks, context }),
    );

    expect(html).toContain("준비물을 확인합니다.");
    expect(html.indexOf("/_media/MED-1/source.png")).toBeLessThan(
      html.lastIndexOf("/_media/MED-2/source.png"),
    );
    expect(html).toContain("&lt;strong&gt;안전&lt;/strong&gt;");
    expect(html).toContain("git status --short");
    expect(html).toContain('href="/about"');
    expect(html).toContain("정적 대안");
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
