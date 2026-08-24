import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { VersionedContentBlocks } from "./versioned-content-blocks";

describe("VersionedContentBlocks", () => {
  it("dispatches v2 and v3 blocks through their matching renderer", () => {
    const v2 = renderToStaticMarkup(
      createElement(VersionedContentBlocks, {
        contractVersion: "2.0.0",
        blocks: [{ type: "paragraph", markdown: "v2 본문" }],
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
    expect(v3).toContain('href="/about"');
    expect(v3).toContain("v3 소개");
  });
});
