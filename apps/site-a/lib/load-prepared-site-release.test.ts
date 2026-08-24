import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { projectResponsiveImageAsset } from "@content-foundry/media";
import type { BuildTargetConfig } from "@content-foundry/site-core";
import { afterEach, describe, expect, it } from "vitest";

import { loadPreparedSiteRelease } from "./load-prepared-site-release";
import { loadValidatedSiteReleaseV3 } from "./load-site-release";
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
  it("loads v2 without consulting a stale projection", () => {
    const path = projectionPath();
    writeFileSync(path, "stale projection");

    const context = loadPreparedSiteRelease(config(fixture("2.0.0")), {
      projectionPath: path,
    });

    expect(context.contractVersion).toBe("2.0.0");
    expect(context.bundle.release.releaseId).toBe("REL-2026-000042");
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
    expect(context.bundle).toEqual(validated.bundle);
  });

  it("fails closed when a v3 projection is unavailable", () => {
    expect(() =>
      loadPreparedSiteRelease(config(fixture("3.0.0")), {
        projectionPath: projectionPath(),
      }),
    ).toThrowError(expect.objectContaining({ code: "BUILD_FAILED" }));
  });
});
