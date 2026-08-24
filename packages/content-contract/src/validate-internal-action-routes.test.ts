import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import { readReleaseBundleDocumentsForVersion } from "./read-bundle-documents.js";
import { validateInternalActionRoutes } from "./validate-internal-action-routes.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/3.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const reference = readReleaseBundleDocumentsForVersion("3.0.0", fixture);
const generatedRoutes = new Set([
  "/about",
  "/article/government24-resident-registration-guide",
]);

function expectInvalidAt(
  bundle: typeof reference,
  routes: ReadonlySet<string>,
  path: string,
) {
  expect(() => validateInternalActionRoutes(bundle, routes)).toThrowError(
    expect.objectContaining({
      code: "REFERENCE_INVALID",
      issues: [expect.objectContaining({ path })],
    }),
  );
}

describe("validateInternalActionRoutes", () => {
  it("accepts direct reciprocal article and page routes", () => {
    const bundle = validateInternalActionRoutes(
      structuredClone(reference),
      generatedRoutes,
    );
    expectTypeOf(bundle).toEqualTypeOf<typeof reference>();
  });

  it("rejects an article action with a missing route", () => {
    const bundle = structuredClone(reference);
    const action = bundle.articles[0]!.content[3]!;
    if (action.type !== "action-link" || action.kind !== "internal") {
      throw new TypeError("Expected canonical internal action fixture");
    }
    action.path = "/missing-route";

    expectInvalidAt(bundle, generatedRoutes, "/articles/0/content/3/path");
  });

  it("rejects a redirect source even if it appears in the route inventory", () => {
    const bundle = structuredClone(reference);
    const action = bundle.articles[0]!.content[3]!;
    if (action.type !== "action-link" || action.kind !== "internal") {
      throw new TypeError("Expected canonical internal action fixture");
    }
    action.path = "/old-about";
    bundle.redirects.items.push({
      type: "redirect",
      fromPath: "/old-about",
      toPath: "/about",
      status: 308,
    });

    expectInvalidAt(
      bundle,
      new Set([...generatedRoutes, "/old-about"]),
      "/articles/0/content/3/path",
    );
  });

  it("rejects a gone source even if it appears in the route inventory", () => {
    const bundle = structuredClone(reference);
    const action = bundle.articles[0]!.content[3]!;
    if (action.type !== "action-link" || action.kind !== "internal") {
      throw new TypeError("Expected canonical internal action fixture");
    }
    action.path = "/expired-about";
    bundle.redirects.items.push({
      type: "gone",
      path: "/expired-about",
      status: 410,
      replacementPath: null,
    });

    expectInvalidAt(
      bundle,
      new Set([...generatedRoutes, "/expired-about"]),
      "/articles/0/content/3/path",
    );
  });

  it("validates internal actions in static pages", () => {
    const bundle = structuredClone(reference);
    const action = bundle.pages[0]!.content[1]!;
    if (action.type !== "action-link" || action.kind !== "internal") {
      throw new TypeError("Expected canonical page action fixture");
    }
    action.path = "/missing-page-target";

    expectInvalidAt(bundle, generatedRoutes, "/pages/0/content/1/path");
  });
});
