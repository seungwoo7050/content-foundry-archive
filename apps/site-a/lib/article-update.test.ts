import { describe, expect, it } from "vitest";

import { hasMaterialArticleUpdate } from "./article-update";

describe("material article updates", () => {
  it("requires the update timestamp to be later than publication", () => {
    expect(
      hasMaterialArticleUpdate({
        publishedAt: "2026-08-20T01:00:00Z",
        updatedAt: "2026-08-24T02:30:00Z",
      }),
    ).toBe(true);
  });

  it("does not relabel publication as an update", () => {
    expect(
      hasMaterialArticleUpdate({
        publishedAt: "2026-08-20T01:00:00Z",
        updatedAt: "2026-08-20T01:00:00Z",
      }),
    ).toBe(false);
  });
});
