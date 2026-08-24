import type { LoadedReleaseBundleV4 } from "@content-foundry/content-contract";
import {
  projectResponsiveImageAsset,
  type ResponsiveImageAsset,
} from "@content-foundry/media";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  resolveBrandMediaAssets,
  type BrandPresentationSource,
} from "./brand-media-assets";

const mediaId = "MED-BRAND";
const asset: ResponsiveImageAsset = projectResponsiveImageAsset({
  media: {
    id: mediaId,
    kind: "image",
    source: "bundle",
    path: "media/brand.webp",
    sha256: "a".repeat(64),
    mimeType: "image/webp",
    width: 1200,
    height: 630,
    bytes: 1024,
    alt: "중립 브랜드 이미지",
    credit: null,
    license: "QA only",
  },
  mimeType: "image/webp",
  width: 1200,
  height: 630,
}, "/media/items/0");

describe("brand media assets", () => {
  it("accepts every supported release without inventing legacy slots", () => {
    expectTypeOf<LoadedReleaseBundleV4>().toExtend<BrandPresentationSource>();
    expect(resolveBrandMediaAssets({}, new Map())).toEqual({
      logo: null,
      favicon: null,
      socialImage: null,
    });
  });

  it("resolves only explicit v4 brand references", () => {
    const resolved = resolveBrandMediaAssets({ presentation: { brand: {
      logoMediaId: null,
      faviconMediaId: mediaId,
      socialImageMediaId: mediaId,
    } } }, new Map([[mediaId, asset]]));

    expect(resolved).toEqual({ logo: null, favicon: asset, socialImage: asset });
  });

  it("fails closed when a prepared brand asset is absent", () => {
    expect(() => resolveBrandMediaAssets({ presentation: { brand: {
      logoMediaId: mediaId,
      faviconMediaId: null,
      socialImageMediaId: null,
    } } }, new Map())).toThrow(
      "Prepared logo brand asset is missing: MED-BRAND",
    );
  });
});
