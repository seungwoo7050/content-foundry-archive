import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { declaresV3SiteRelease } from "./site-release-version";

const fixture = (version: "2.0.0" | "3.0.0") =>
  resolve(
    process.cwd(),
    `../../packages/content-contract/vendor/${version}/fixtures/bundles/valid/site-a-minimal`,
  );

describe("declaresV3SiteRelease", () => {
  it("identifies only a readable release declaring contract 3.0.0", () => {
    expect(declaresV3SiteRelease(fixture("3.0.0"))).toBe(true);
    expect(declaresV3SiteRelease(fixture("2.0.0"))).toBe(false);
    expect(declaresV3SiteRelease(resolve("missing-release"))).toBe(false);
  });
});
