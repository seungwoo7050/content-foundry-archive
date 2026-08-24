import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import { readReleaseBundleDocumentsForVersion } from "./read-bundle-documents.js";
import { validateGalleryAltText } from "./validate-gallery-alt-text.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/3.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const reference = readReleaseBundleDocumentsForVersion("3.0.0", fixture);

describe("validateGalleryAltText", () => {
  it("accepts referenced gallery media with informative alt text", () => {
    const bundle = validateGalleryAltText(structuredClone(reference));
    expectTypeOf(bundle).toEqualTypeOf<typeof reference>();
    expect(bundle.mediaManifest.items).toHaveLength(2);
  });

  it("rejects whitespace alt text on gallery media", () => {
    const bundle = structuredClone(reference);
    bundle.mediaManifest.items[0]!.alt = "   ";

    expect(() => validateGalleryAltText(bundle)).toThrowError(
      expect.objectContaining({
        code: "CONTRACT_INVALID",
        issues: [expect.objectContaining({ path: "/media/items/0/alt" })],
      }),
    );
  });

  it("does not apply the gallery alt rule to unreferenced media", () => {
    const bundle = structuredClone(reference);
    bundle.articles[0]!.content = bundle.articles[0]!.content.filter(
      (block) => block.type !== "gallery",
    );
    bundle.mediaManifest.items[0]!.alt = "   ";

    expect(validateGalleryAltText(bundle)).toBeDefined();
  });
});
