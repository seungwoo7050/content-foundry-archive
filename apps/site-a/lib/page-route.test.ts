import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { findPageByPathSegments, getPageStaticParams } from "./page-route";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("static page route selection", () => {
  it("enumerates canonical paths as catch-all segment arrays", () => {
    const nestedBundle = structuredClone(bundle);
    nestedBundle.pages[0]!.path = "/legal/privacy-policy";
    nestedBundle.pages[0]!.seo.canonicalPath = "/legal/privacy-policy";

    expect(getPageStaticParams(nestedBundle)).toEqual([
      { pagePath: ["legal", "privacy-policy"] },
    ]);
  });

  it("selects only an exact validated page path", () => {
    expect(findPageByPathSegments(bundle, ["about"])?.id).toBe("about");
    expect(findPageByPathSegments(bundle, ["about", "extra"])).toBeUndefined();
    expect(findPageByPathSegments(bundle, [])).toBeUndefined();
  });
});
