import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it, vi } from "vitest";

import {
  loadSupportedReleaseBundle,
  type LoadedSupportedReleaseBundle,
} from "./index.js";

const fixture = (version: "2.0.0" | "3.0.0") =>
  fileURLToPath(
    new URL(
      `../vendor/${version}/fixtures/bundles/valid/site-a-minimal/`,
      import.meta.url,
    ),
  );

describe("loadSupportedReleaseBundle", () => {
  it("loads v2 without consulting the v3 consumer", () => {
    const resolveV3ConsumerContext = vi.fn(() => ({
      generatedRoutes: new Set<string>(),
      nicheComponentRegistry: {},
    }));

    const bundle = loadSupportedReleaseBundle(fixture("2.0.0"), {
      expectedSiteId: "site-a",
      resolveV3ConsumerContext,
    });

    expectTypeOf(bundle).toEqualTypeOf<LoadedSupportedReleaseBundle>();
    expect(bundle.release.contractVersion).toBe("2.0.0");
    expect(resolveV3ConsumerContext).not.toHaveBeenCalled();
  });

  it("keeps v3 closed before the support tuple is activated", () => {
    const resolveV3ConsumerContext = vi.fn(() => ({
      generatedRoutes: new Set<string>(),
      nicheComponentRegistry: {},
    }));

    expect(() =>
      loadSupportedReleaseBundle(fixture("3.0.0"), {
        resolveV3ConsumerContext,
      }),
    ).toThrowError(expect.objectContaining({ code: "CONTRACT_UNSUPPORTED" }));
    expect(resolveV3ConsumerContext).not.toHaveBeenCalled();
  });

  it("requires the v3 consumer resolver on the dual-version boundary", () => {
    if (false) {
      // @ts-expect-error The supported loader must fail closed for a v3 input.
      loadSupportedReleaseBundle(fixture("2.0.0"), {});
    }
    expect(true).toBe(true);
  });
});
