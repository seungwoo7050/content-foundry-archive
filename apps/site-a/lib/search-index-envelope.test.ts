import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { createSearchIndexArtifact } from "./search-index-artifact";
import {
  MAX_SEARCH_INDEX_ENTRIES,
  validateSearchIndexEnvelope,
} from "./search-index-envelope";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const artifact = createSearchIndexArtifact(loadReleaseBundle(fixture));

describe("search index envelope validation", () => {
  it("accepts the exact release-bound artifact", () => {
    expect(
      validateSearchIndexEnvelope(artifact, artifact.release, artifact.locale),
    ).toBe(artifact);
  });

  it.each([
    "releaseId",
    "siteId",
    "contractVersion",
    "bundleChecksum",
  ] as const)("rejects a mismatched %s", (field) => {
    const changed = {
      ...artifact,
      release: { ...artifact.release, [field]: "mismatch" },
    };

    expect(() =>
      validateSearchIndexEnvelope(changed, artifact.release, artifact.locale),
    ).toThrow(`Search index release mismatch: ${field}`);
  });

  it("rejects unsupported schemas, locales, and oversized arrays", () => {
    expect(() =>
      validateSearchIndexEnvelope(
        { ...artifact, schemaVersion: "2.0.0" },
        artifact.release,
        artifact.locale,
      ),
    ).toThrow("Unsupported search index schema");
    expect(() =>
      validateSearchIndexEnvelope(artifact, artifact.release, "en-US"),
    ).toThrow("Search index locale mismatch");
    expect(() =>
      validateSearchIndexEnvelope(
        { ...artifact, entries: Array(MAX_SEARCH_INDEX_ENTRIES + 1) },
        artifact.release,
        artifact.locale,
      ),
    ).toThrow("Search index entry count is invalid");
  });
});
