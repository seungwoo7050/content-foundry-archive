import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it, vi } from "vitest";

import { createSearchIndexArtifact } from "./search-index-artifact";
import { loadSearchIndex } from "./load-search-index";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const artifact = createSearchIndexArtifact(loadReleaseBundle(fixture));

describe("search index loading", () => {
  it("fetches only the constant same-origin JSON artifact", async () => {
    const fetcher = vi.fn(async () => Response.json(artifact));

    await expect(
      loadSearchIndex(
        "/search-index.json",
        artifact.release,
        artifact.locale,
        fetcher,
      ),
    ).resolves.toEqual(artifact.entries);
    expect(fetcher).toHaveBeenCalledWith("/search-index.json", {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      cache: "force-cache",
    });
  });

  it("rejects failed, non-JSON, and identity-mismatched responses", async () => {
    await expect(
      loadSearchIndex(
        "/search-index.json",
        artifact.release,
        artifact.locale,
        async () => new Response("missing", { status: 404 }),
      ),
    ).rejects.toThrow("Search index request failed");
    await expect(
      loadSearchIndex(
        "/search-index.json",
        artifact.release,
        artifact.locale,
        async () => new Response("<html>not json</html>"),
      ),
    ).rejects.toThrow("Search index response is not JSON");
    await expect(
      loadSearchIndex(
        "/search-index.json",
        artifact.release,
        artifact.locale,
        async () =>
          Response.json({
            ...artifact,
            release: { ...artifact.release, releaseId: "REL-OTHER" },
          }),
      ),
    ).rejects.toThrow("Search index release mismatch: releaseId");
  });
});
