import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it, vi } from "vitest";

import {
  loadSupportedReleaseBundle,
  type LoadedSupportedReleaseBundle,
} from "./index.js";

const fixture = (version: "2.0.0" | "3.0.0" | "4.0.0") =>
  fileURLToPath(
    new URL(
      `../vendor/${version}/fixtures/bundles/valid/site-a-minimal/`,
      import.meta.url,
    ),
  );

const resolveV4ConsumerContext = (bundle: {
  readonly release: { readonly siteId: string };
}) => ({
  generatedRoutes: new Set([
    "/about",
    "/article/government24-resident-registration-guide",
  ]),
  nicheComponentRegistry: { [bundle.release.siteId]: [] },
  presentationReadiness: {
    releaseMode: "template" as const,
    siteWideNoindex: true,
  },
});

describe("loadSupportedReleaseBundle", () => {
  it("loads v2 without consulting the v3 consumer", () => {
    const resolveV3ConsumerContext = vi.fn(() => ({
      generatedRoutes: new Set<string>(),
      nicheComponentRegistry: {},
    }));
    const resolveV4 = vi.fn(resolveV4ConsumerContext);

    const bundle = loadSupportedReleaseBundle(fixture("2.0.0"), {
      expectedSiteId: "site-a",
      resolveV3ConsumerContext,
      resolveV4ConsumerContext: resolveV4,
    });

    expectTypeOf(bundle).toEqualTypeOf<LoadedSupportedReleaseBundle>();
    expect(bundle.release.contractVersion).toBe("2.0.0");
    expect(resolveV3ConsumerContext).not.toHaveBeenCalled();
    expect(resolveV4).not.toHaveBeenCalled();
  });

  it("loads v3 through its required consumer context", () => {
    const resolveV3ConsumerContext = vi.fn((bundle) => ({
      generatedRoutes: new Set([
        "/about",
        "/article/government24-resident-registration-guide",
      ]),
      nicheComponentRegistry: { [bundle.release.siteId]: [] },
    }));

    const bundle = loadSupportedReleaseBundle(fixture("3.0.0"), {
      resolveV3ConsumerContext,
      resolveV4ConsumerContext,
    });

    expect(bundle.release.contractVersion).toBe("3.0.0");
    expect(resolveV3ConsumerContext).toHaveBeenCalledOnce();
    expect(resolveV3ConsumerContext).toHaveBeenCalledWith(bundle);
  });

  it("loads v4 through its exact consumer and presentation context", () => {
    const resolveV3ConsumerContext = vi.fn(() => ({
      generatedRoutes: new Set<string>(),
      nicheComponentRegistry: {},
    }));
    const resolveV4 = vi.fn(resolveV4ConsumerContext);

    const bundle = loadSupportedReleaseBundle(fixture("4.0.0"), {
      resolveV3ConsumerContext,
      resolveV4ConsumerContext: resolveV4,
    });

    expect(bundle.release.contractVersion).toBe("4.0.0");
    expect(resolveV3ConsumerContext).not.toHaveBeenCalled();
    expect(resolveV4).toHaveBeenCalledOnce();
    expect(resolveV4).toHaveBeenCalledWith(bundle);
  });

  it("rejects incomplete v3 consumer routes", () => {
    expect(() =>
      loadSupportedReleaseBundle(fixture("3.0.0"), {
        resolveV3ConsumerContext: () => ({
          generatedRoutes: new Set([
            "/article/government24-resident-registration-guide",
          ]),
          nicheComponentRegistry: { "site-a": [] },
        }),
        resolveV4ConsumerContext,
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [expect.objectContaining({ path: "/articles/0/content/3/path" })],
      }),
    );
  });

  it("requires both structured consumer resolvers at runtime discovery", () => {
    if (false) {
      // @ts-expect-error Runtime discovery requires the v3 resolver for any input.
      loadSupportedReleaseBundle(fixture("2.0.0"), {});
    }
    expect(true).toBe(true);
  });
});
