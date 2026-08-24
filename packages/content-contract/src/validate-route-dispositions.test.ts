import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import {
  type ReleaseBundleDocumentsByVersion,
  readReleaseBundleDocuments,
  readReleaseBundleDocumentsForVersion,
} from "./read-bundle-documents.js";
import { validateRouteDispositions } from "./validate-route-dispositions.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/2.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const reference = readReleaseBundleDocuments(fixture);
const referenceV3 = readReleaseBundleDocumentsForVersion(
  "3.0.0",
  fileURLToPath(
    new URL(
      "../vendor/3.0.0/fixtures/bundles/valid/site-a-minimal/",
      import.meta.url,
    ),
  ),
);

const expectInvalid = (bundle: typeof reference, message: string) => {
  expect(() => validateRouteDispositions(bundle)).toThrowError(
    expect.objectContaining({
      code: "REFERENCE_INVALID",
      issues: expect.arrayContaining([expect.objectContaining({ message })]),
    }),
  );
};

describe("validateRouteDispositions", () => {
  it("accepts the empty reference disposition list", () => {
    expect(validateRouteDispositions(structuredClone(reference))).toBeDefined();
  });

  it("preserves canonical v3 dispositions and rejects a v3 self-redirect", () => {
    const bundle = validateRouteDispositions(structuredClone(referenceV3));
    expectTypeOf(bundle).toEqualTypeOf<
      ReleaseBundleDocumentsByVersion["3.0.0"]
    >();
    bundle.redirects.items.push({
      type: "redirect",
      fromPath: "/old",
      toPath: "/old",
      status: 308,
    });

    expect(() => validateRouteDispositions(bundle)).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ message: "self-redirect is forbidden" })],
      }),
    );
  });

  it("rejects a self-redirect", () => {
    const bundle = structuredClone(reference);
    bundle.redirects.items.push({
      type: "redirect",
      fromPath: "/old",
      toPath: "/old",
      status: 308,
    });

    expectInvalid(bundle, "self-redirect is forbidden");
  });

  it("rejects a redirect cycle", () => {
    const bundle = structuredClone(reference);
    bundle.redirects.items.push(
      { type: "redirect", fromPath: "/old-a", toPath: "/old-b", status: 301 },
      { type: "redirect", fromPath: "/old-b", toPath: "/old-a", status: 308 },
    );

    expectInvalid(bundle, "redirect cycle reaches /old-a");
  });

  it("rejects duplicate redirect or gone source paths", () => {
    const bundle = structuredClone(reference);
    bundle.redirects.items.push(
      { type: "redirect", fromPath: "/retired", toPath: "/about", status: 301 },
      { type: "gone", path: "/retired", status: 410, replacementPath: null },
    );

    expectInvalid(
      bundle,
      "duplicate source path /retired; first declared at /redirects/items/0",
    );
  });
});
