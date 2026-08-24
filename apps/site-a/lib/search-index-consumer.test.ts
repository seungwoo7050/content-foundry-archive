import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { createSearchIndexArtifact } from "./search-index-artifact";
import { validateSearchIndexEntries } from "./search-index-consumer";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const artifact = createSearchIndexArtifact(loadReleaseBundle(fixture));

describe("search index entry validation", () => {
  it("accepts the generated compact entries", () => {
    expect(validateSearchIndexEntries(artifact)).toBe(artifact.entries);
  });

  it.each([
    ["external path", { path: "https://evil.example/article/guide" }],
    ["malformed date", { updatedAt: "not-a-date" }],
    ["malformed category", { category: { id: "category" } }],
    ["malformed tags", { tags: [null] }],
    ["malformed headings", { headings: [{ id: "heading" }] }],
    ["malformed keywords", { keywords: [42] }],
  ])("rejects an entry with %s", (_label, change) => {
    const changed = {
      ...artifact,
      entries: [{ ...artifact.entries[0]!, ...change }],
    };

    expect(() => validateSearchIndexEntries(changed)).toThrow(
      "Search index entry shape is invalid",
    );
  });

  it("rejects duplicate entry identities and paths", () => {
    expect(() =>
      validateSearchIndexEntries({
        ...artifact,
        entries: [artifact.entries[0]!, { ...artifact.entries[0]! }],
      }),
    ).toThrow("Search index entries are duplicated");
  });
});
