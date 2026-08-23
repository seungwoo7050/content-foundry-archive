import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { findArticleBySlug, getArticleStaticParams } from "./article-route";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("article route selection", () => {
  it("enumerates only validated release slugs", () => {
    expect(getArticleStaticParams(bundle)).toEqual([
      { slug: "government24-resident-registration-guide" },
    ]);
  });

  it("returns no article for a missing slug", () => {
    expect(findArticleBySlug(bundle, "missing-article")).toBeUndefined();
  });
});
