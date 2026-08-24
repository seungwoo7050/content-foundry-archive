import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createSearchRouteViewModel,
  type SearchRouteSource,
} from "./search-route-view-model";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("search route view model", () => {
  it("accepts v3 releases and exposes only client search facts", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<SearchRouteSource>();
    expect(createSearchRouteViewModel(bundle)).toEqual({
      release: {
        releaseId: "REL-2026-000042",
        siteId: "site-a",
        contractVersion: "2.0.0",
        bundleChecksum:
          "sha256:0a8f03190b0a5d63fefc52e3efab08080a08263a6c8d716f0e4936382eee6f27",
      },
      locale: "ko-KR",
      timeZone: "Asia/Seoul",
      searchIndexPath: "/search-index.json",
      categories: [
        {
          id: "daily-admin",
          href: "/category/daily-admin",
          label: "생활·행정",
        },
      ],
    });
  });

  it("orders fallback categories by their canonical href", () => {
    const viewModel = createSearchRouteViewModel({
      ...bundle,
      taxonomy: {
        ...bundle.taxonomy,
        categories: [
          { id: "z", slug: "z", label: "Z" },
          { id: "a", slug: "a", label: "A" },
        ],
      },
    });

    expect(viewModel.categories.map(({ href }) => href)).toEqual([
      "/category/a",
      "/category/z",
    ]);
  });
});
