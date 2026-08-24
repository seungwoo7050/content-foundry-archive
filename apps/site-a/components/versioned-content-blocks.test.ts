import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { VersionedContentBlocks } from "./versioned-content-blocks";

const mediaAssets = new Map([
  [
    "MED-000045",
    {
      fallback: {
        mediaId: "MED-000045",
        relativePath: "_media/MED-000045/source.png",
        publicPath: "/_media/MED-000045/source.png",
        sha256: "verified",
        mimeType: "image/png",
        width: 16,
        height: 9,
        alt: "v2 발급 화면",
        credit: null,
        license: null,
      },
      derivatives: [],
    },
  ],
]);

describe("VersionedContentBlocks", () => {
  it("dispatches v2 and v3 blocks through their matching renderer", () => {
    const v2 = renderToStaticMarkup(
      createElement(VersionedContentBlocks, {
        contractVersion: "2.0.0",
        blocks: [
          { type: "paragraph", markdown: "v2 본문" },
          { type: "image", mediaId: "MED-000045" },
        ],
        mediaAssets,
      }),
    );
    const v3 = renderToStaticMarkup(
      createElement(VersionedContentBlocks, {
        contractVersion: "3.0.0",
        blocks: [
          {
            type: "action-link",
            kind: "internal",
            label: "v3 소개",
            path: "/about",
          },
        ],
        context: {
          mediaAssets: new Map(),
          nicheComponents: new Map(),
          siteId: "site-a",
        },
      }),
    );

    expect(v2).toContain("v2 본문");
    expect(v2).toContain('src="/_media/MED-000045/source.png"');
    expect(v2).toContain('alt="v2 발급 화면"');
    expect(v3).toContain('href="/about"');
    expect(v3).toContain("v3 소개");
  });
});
