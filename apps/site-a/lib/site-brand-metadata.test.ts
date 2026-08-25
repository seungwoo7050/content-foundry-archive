import type { ResponsiveImageAsset } from "@content-foundry/media";
import { describe, expect, it } from "vitest";

import { createSiteBrandMetadata } from "./site-brand-metadata";

const asset: ResponsiveImageAsset = {
  fallback: {
    mediaId: "MED-BRAND",
    relativePath: "_media/brand/source.webp",
    publicPath: "/_media/brand/source.webp",
    sha256: "a".repeat(64),
    mimeType: "image/webp",
    width: 1200,
    height: 630,
    alt: "중립 소셜 이미지",
    credit: null,
    license: "QA only",
  },
  derivatives: [
    {
      relativePath: "_media/brand/webp-q82/960w.webp",
      publicPath: "/_media/brand/webp-q82/960w.webp",
      mimeType: "image/webp",
      width: 960,
      height: 504,
    },
    {
      relativePath: "_media/brand/webp-q82/480w.webp",
      publicPath: "/_media/brand/webp-q82/480w.webp",
      mimeType: "image/webp",
      width: 480,
      height: 252,
    },
  ],
};

describe("site brand metadata", () => {
  it("keeps absent brand slots absent", () => {
    expect(createSiteBrandMetadata("https://site.example", {
      logo: null,
      favicon: null,
      socialImage: null,
    })).toEqual({ favicon: null, socialImage: null });
  });

  it("projects absolute favicon and intrinsic social-image facts", () => {
    expect(createSiteBrandMetadata("https://site.example", {
      logo: null,
      favicon: asset,
      socialImage: asset,
    })).toEqual({
      favicon: {
        url: "https://site.example/_media/brand/webp-q82/480w.webp",
        type: "image/webp",
        sizes: "480x252",
      },
      socialImage: {
        url: "https://site.example/_media/brand/source.webp",
        width: 1200,
        height: 630,
        alt: "중립 소셜 이미지",
      },
    });
  });
});
