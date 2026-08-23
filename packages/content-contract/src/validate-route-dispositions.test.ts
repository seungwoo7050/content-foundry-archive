import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { readReleaseBundleDocuments } from "./read-bundle-documents.js";
import { validateRouteDispositions } from "./validate-route-dispositions.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/2.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const reference = readReleaseBundleDocuments(fixture);

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
