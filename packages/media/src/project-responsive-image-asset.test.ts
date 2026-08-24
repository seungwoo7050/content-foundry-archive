import { describe, expect, it } from "vitest";

import {
  projectResponsiveImageAsset,
  RESPONSIVE_WEBP_QUALITY,
} from "./project-responsive-image-asset.js";
import { type ImageProjectionSource } from "./project-static-image-asset.js";
import { type VerifiedImageSource } from "./verify-image-source.js";

const sha256 = "216154d9fcffafb56f3bd8d846eebdb9ae1b5dc8aaeeea88ce621d1ceb5798e7";
const source: VerifiedImageSource = {
  media: {
    id: "MED-000045",
    kind: "image",
    source: "immutable-object",
    path: "objects/source.png",
    sha256,
    mimeType: "image/png",
    width: 16,
    height: 9,
    bytes: 79,
    alt: "발급 단계",
    credit: null,
    license: null,
  },
  bytes: Buffer.alloc(79),
  mimeType: "image/png",
  width: 16,
  height: 9,
};
const recordPath = "/media/items/0";

describe("projectResponsiveImageAsset", () => {
  it("projects deterministic assets from verified metadata without source bytes", () => {
    const metadata: ImageProjectionSource = {
      media: source.media,
      mimeType: source.mimeType,
      width: source.width,
      height: source.height,
    };

    expect(projectResponsiveImageAsset(metadata, recordPath)).toEqual(
      projectResponsiveImageAsset(source, recordPath),
    );
  });

  it("keeps a small image intrinsic and adds one modern derivative", () => {
    const asset = projectResponsiveImageAsset(source, recordPath);

    expect(asset.fallback.publicPath).toBe(`/_media/${sha256}/source.png`);
    expect(asset.derivatives).toEqual([
      {
        relativePath: `_media/${sha256}/webp-q${RESPONSIVE_WEBP_QUALITY}/16w.webp`,
        publicPath: `/_media/${sha256}/webp-q${RESPONSIVE_WEBP_QUALITY}/16w.webp`,
        mimeType: "image/webp",
        width: 16,
        height: 9,
      },
    ]);
  });

  it("projects increasing widths without enlargement or duplicates", () => {
    const asset = projectResponsiveImageAsset(
      {
        ...source,
        media: { ...source.media, width: 1280, height: 720 },
        width: 1280,
        height: 720,
      },
      recordPath,
    );

    expect(asset.derivatives.map(({ width, height }) => [width, height])).toEqual([
      [480, 270],
      [960, 540],
      [1280, 720],
    ]);
    expect(asset.derivatives.every(({ publicPath }) => publicPath.includes(sha256))).toBe(true);
  });

  it("uses the intrinsic width once when it matches a target", () => {
    const asset = projectResponsiveImageAsset(
      {
        ...source,
        media: { ...source.media, width: 960, height: 540 },
        width: 960,
        height: 540,
      },
      recordPath,
    );

    expect(asset.derivatives.map(({ width }) => width)).toEqual([480, 960]);
  });
});
