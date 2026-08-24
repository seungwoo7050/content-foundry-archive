import type { PublishedGalleryBlockV3 } from "@content-foundry/content-contract";
import type { ResponsiveImageAsset } from "@content-foundry/media";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GalleryBlock } from "./gallery-block";
import { MissingResponsiveImageAssetError } from "./image-block";

function asset(mediaId: string, color: string): ResponsiveImageAsset {
  return {
    fallback: {
      mediaId,
      relativePath: `_media/${color}/source.png`,
      publicPath: `/_media/${color}/source.png`,
      sha256: color,
      mimeType: "image/png",
      width: 16,
      height: 9,
      alt: `${color} 발급 단계`,
      credit: null,
      license: null,
    },
    derivatives: [
      {
        relativePath: `_media/${color}/webp-q82/16w.webp`,
        publicPath: `/_media/${color}/webp-q82/16w.webp`,
        mimeType: "image/webp",
        width: 16,
        height: 9,
      },
    ],
  };
}

const block: PublishedGalleryBlockV3 = {
  type: "gallery",
  caption: "전입신고 화면 순서",
  items: [
    { mediaId: "MED-000045", caption: "주소 입력" },
    { mediaId: "MED-000046", caption: null },
  ],
};
const assets = new Map([
  ["MED-000045", asset("MED-000045", "blue")],
  ["MED-000046", asset("MED-000046", "green")],
]);

describe("GalleryBlock", () => {
  it("renders group and item captions with images in source order", () => {
    const html = renderToStaticMarkup(createElement(GalleryBlock, { block, assets }));

    expect(html).toContain("<figcaption>전입신고 화면 순서</figcaption>");
    expect(html).toContain("<figcaption><span>주소 입력</span></figcaption>");
    expect(html).toContain('alt="blue 발급 단계"');
    expect(html).toContain('alt="green 발급 단계"');
    expect(html.indexOf("/_media/blue/source.png")).toBeLessThan(
      html.indexOf("/_media/green/source.png"),
    );
    expect(html.match(/width="16"/g)).toHaveLength(2);
    expect(html.match(/height="9"/g)).toHaveLength(2);
  });

  it("fails closed when a later gallery asset is missing", () => {
    expect(() =>
      renderToStaticMarkup(
        createElement(GalleryBlock, {
          block,
          assets: new Map([["MED-000045", assets.get("MED-000045")!]]),
        }),
      ),
    ).toThrow(MissingResponsiveImageAssetError);
  });
});
