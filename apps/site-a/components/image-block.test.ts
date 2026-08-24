import type { ResponsiveImageAsset } from "@content-foundry/media";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ImageBlock,
  MissingResponsiveImageAssetError,
} from "./image-block";

const mediaId = "MED-000045";
const asset: ResponsiveImageAsset = {
  fallback: {
    mediaId,
    relativePath: "_media/hash/source.png",
    publicPath: "/_media/hash/source.png",
    sha256: "hash",
    mimeType: "image/png",
    width: 16,
    height: 9,
    alt: "발급 <단계>",
    credit: "운영자 & 촬영",
    license: "승인 <범위>",
  },
  derivatives: [
    {
      relativePath: "_media/hash/webp-q82/16w.webp",
      publicPath: "/_media/hash/webp-q82/16w.webp",
      mimeType: "image/webp",
      width: 16,
      height: 9,
    },
  ],
};

function render(value = asset, priority = false) {
  return renderToStaticMarkup(
    createElement(ImageBlock, {
      block: { type: "image", mediaId, caption: "신청 <화면>" },
      assets: new Map([[mediaId, value]]),
      priority,
    }),
  );
}

describe("ImageBlock", () => {
  it("renders responsive verified paths, dimensions, and escaped attribution", () => {
    const html = render();

    expect(html).toContain('srcSet="/_media/hash/webp-q82/16w.webp 16w"');
    expect(html).toContain('src="/_media/hash/source.png"');
    expect(html).toContain('alt="발급 &lt;단계&gt;"');
    expect(html).toContain('width="16"');
    expect(html).toContain('height="9"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('fetchPriority="auto"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain("신청 &lt;화면&gt;");
    expect(html).toContain("출처: 운영자 &amp; 촬영");
    expect(html).toContain("이용 조건: 승인 &lt;범위&gt;");
  });

  it("prioritizes an explicitly designated lead image", () => {
    const html = render(asset, true);

    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchPriority="high"');
  });

  it("preserves an explicit empty alt attribute", () => {
    expect(render({ ...asset, fallback: { ...asset.fallback, alt: "" } })).toContain(
      'alt=""',
    );
  });

  it("fails closed when the registry has no asset", () => {
    expect(() =>
      renderToStaticMarkup(
        createElement(ImageBlock, {
          block: { type: "image", mediaId },
          assets: new Map(),
        }),
      ),
    ).toThrow(MissingResponsiveImageAssetError);
  });
});
