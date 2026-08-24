import type { MediaManifestV3 } from "@content-foundry/content-contract";
import {
  projectResponsiveImageAsset,
  type ResponsiveImageAsset,
} from "@content-foundry/media";
import { describe, expect, it } from "vitest";

import { createResponsiveImageAssetRegistry } from "./responsive-image-asset-registry";

const manifest: MediaManifestV3 = {
  items: [
    {
      id: "MED-1", kind: "image", source: "immutable-object",
      path: "objects/one.png", sha256: "1".repeat(64), mimeType: "image/png",
      width: 16, height: 9, bytes: 79, alt: "첫 이미지", credit: null, license: null,
    },
    {
      id: "MED-2", kind: "image", source: "immutable-object",
      path: "objects/two.png", sha256: "2".repeat(64), mimeType: "image/png",
      width: 32, height: 18, bytes: 79, alt: "둘째 이미지", credit: "제작자", license: "CC",
    },
  ],
};

function asset(index: number): ResponsiveImageAsset {
  const media = manifest.items[index]!;
  return projectResponsiveImageAsset(
    { media, mimeType: media.mimeType, width: media.width, height: media.height },
    `/media/items/${index}`,
  );
}

describe("createResponsiveImageAssetRegistry", () => {
  it("indexes exact responsive assets in manifest order", () => {
    const registry = createResponsiveImageAssetRegistry(manifest, [asset(0), asset(1)]);

    expect([...registry.keys()]).toEqual(["MED-1", "MED-2"]);
    expect(registry.get("MED-2")?.fallback.alt).toBe("둘째 이미지");
  });

  it("aggregates incomplete and mismatched projections", () => {
    const first = asset(0);
    const wrong = {
      ...first,
      fallback: {
        ...first.fallback,
        mediaId: "MED-X",
        sha256: "f".repeat(64),
      },
    };

    expect(() => createResponsiveImageAssetRegistry(manifest, [wrong])).toThrowError(
      expect.objectContaining({
        code: "BUILD_FAILED",
        issues: [
          expect.objectContaining({ path: "/media/items" }),
          expect.objectContaining({ path: "/media/items/0/id" }),
          expect.objectContaining({ path: "/media/items/0/sha256" }),
        ],
      }),
    );
  });

  it("rejects missing and poisoned responsive derivative projections", () => {
    const first = asset(0);
    const derivative = first.derivatives[0]!;
    const staleAssets = [
      { ...first, derivatives: [] },
      {
        ...first,
        derivatives: [{ ...derivative, publicPath: "/_media/stale.webp" }],
      },
    ];

    for (const stale of staleAssets) {
      expect(() =>
        createResponsiveImageAssetRegistry(manifest, [stale, asset(1)]),
      ).toThrowError(
        expect.objectContaining({
          code: "BUILD_FAILED",
          issues: [
            expect.objectContaining({ path: "/media/items/0/projection" }),
          ],
        }),
      );
    }
  });
});
