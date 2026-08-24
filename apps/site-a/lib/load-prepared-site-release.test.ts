import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { projectResponsiveImageAsset } from "@content-foundry/media";
import type { BuildTargetConfig } from "@content-foundry/site-core";
import { afterEach, describe, expect, it } from "vitest";

import { loadPreparedSiteRelease } from "./load-prepared-site-release";
import {
  loadValidatedSiteRelease,
  loadValidatedSiteReleaseV3,
} from "./load-site-release";
import { writeSiteMediaProjection } from "./site-media-projection";

const fixture = (version: "2.0.0" | "3.0.0") =>
  resolve(
    process.cwd(),
    `../../packages/content-contract/vendor/${version}/fixtures/bundles/valid/site-a-minimal`,
  );
const roots: string[] = [];

function config(releaseDirectory: string): BuildTargetConfig {
  return {
    siteId: "site-a",
    mode: "template",
    releaseDirectory,
    origin: null,
    noindex: true,
    analyticsEnabled: false,
    adsEnabled: false,
  };
}

function projectionPath() {
  const root = mkdtempSync(join(tmpdir(), "prepared-site-release-"));
  roots.push(root);
  return join(root, "media-projection.json");
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("loadPreparedSiteRelease", () => {
  it("binds a verified v2 projection without adding niche components", async () => {
    const releaseConfig = config(fixture("2.0.0"));
    const validated = loadValidatedSiteRelease(releaseConfig);
    if (validated.contractVersion !== "2.0.0") throw new Error("expected v2");
    const path = projectionPath();
    await writeSiteMediaProjection(path, validated.bundle, []);

    const context = loadPreparedSiteRelease(releaseConfig, { projectionPath: path });

    expect(context.contractVersion).toBe("2.0.0");
    if (context.contractVersion !== "2.0.0") throw new Error("expected v2");
    expect(context.bundle.release.releaseId).toBe("REL-2026-000042");
    expect([...context.mediaAssets.keys()]).toEqual([]);
    expect("nicheComponents" in context).toBe(false);
  });

  it("binds a verified v3 projection to one validated release", async () => {
    const releaseConfig = config(fixture("3.0.0"));
    const validated = loadValidatedSiteReleaseV3(releaseConfig);
    const assets = validated.bundle.mediaManifest.items.map((media, index) =>
      projectResponsiveImageAsset(
        { media, mimeType: media.mimeType, width: media.width, height: media.height },
        `/media/items/${index}`,
      ),
    );
    const path = projectionPath();
    await writeSiteMediaProjection(path, validated.bundle, assets);

    const context = loadPreparedSiteRelease(releaseConfig, { projectionPath: path });

    expect(context.contractVersion).toBe("3.0.0");
    if (context.contractVersion !== "3.0.0") throw new Error("expected v3 context");
    expect([...context.mediaAssets.keys()]).toEqual(["MED-000045", "MED-000046"]);
    expect([...context.nicheComponents.get("site-a")!.keys()]).toEqual([]);
    expect(context.bundle).toEqual(validated.bundle);
  });

  it.each(["2.0.0", "3.0.0"] as const)(
    "fails closed when a %s projection is unavailable",
    (version) => {
      expect(() =>
        loadPreparedSiteRelease(config(fixture(version)), {
          projectionPath: projectionPath(),
        }),
      ).toThrowError(expect.objectContaining({ code: "BUILD_FAILED" }));
    },
  );
});
