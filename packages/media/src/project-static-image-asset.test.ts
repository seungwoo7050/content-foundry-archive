import { describe, expect, it } from "vitest";

import { projectStaticImageAsset } from "./project-static-image-asset.js";
import { type VerifiedImageSource } from "./verify-image-source.js";

const source: VerifiedImageSource = {
  media: {
    id: "MED-000045",
    kind: "image",
    source: "immutable-object",
    path: "objects/sha256/216154d9.png",
    sha256: "216154d9fcffafb56f3bd8d846eebdb9ae1b5dc8aaeeea88ce621d1ceb5798e7",
    mimeType: "image/png",
    width: 16,
    height: 9,
    bytes: 79,
    alt: "파란색으로 표시된 발급 화면 순서 1단계",
    credit: "Content Foundry",
    license: "Approved public use",
  },
  bytes: Buffer.alloc(79),
  mimeType: "image/png",
  width: 16,
  height: 9,
};
const recordPath = "/media/items/0";

describe("projectStaticImageAsset", () => {
  it.each([
    ["image/avif", "avif"],
    ["image/gif", "gif"],
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ])("projects %s to a content-addressed .%s path", (mimeType, extension) => {
    const asset = projectStaticImageAsset(
      { ...source, media: { ...source.media, mimeType }, mimeType },
      recordPath,
    );
    const relativePath = `_media/${source.media.sha256}/source.${extension}`;

    expect(asset).toEqual({
      mediaId: source.media.id,
      relativePath,
      publicPath: `/${relativePath}`,
      sha256: source.media.sha256,
      mimeType,
      width: 16,
      height: 9,
      alt: source.media.alt,
      credit: source.media.credit,
      license: source.media.license,
    });
  });

  it("does not derive output paths from producer IDs or paths", () => {
    const asset = projectStaticImageAsset(
      {
        ...source,
        media: { ...source.media, id: "../MED-ESCAPE", path: "../../outside.png" },
      },
      recordPath,
    );

    expect(asset.relativePath).toBe(`_media/${source.media.sha256}/source.png`);
  });

  it("rejects a MIME type outside the explicit public allowlist", () => {
    expect(() =>
      projectStaticImageAsset(
        {
          ...source,
          media: { ...source.media, mimeType: "image/svg+xml" },
          mimeType: "image/svg+xml",
        },
        recordPath,
      ),
    ).toThrowError(
      expect.objectContaining({
        code: "BUILD_FAILED",
        issues: [{ path: `${recordPath}/mimeType`, message: "cannot publish image/svg+xml" }],
      }),
    );
  });
});
