import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import type { MediaManifestV3 } from "@content-foundry/content-contract";
import {
  projectResponsiveImageAsset,
  type ResponsiveImageAsset,
} from "@content-foundry/media";
import { resolveBuildTargetConfig } from "@content-foundry/site-core";
import { afterEach, describe, expect, it } from "vitest";

import {
  bindValidatedSiteReleaseV3,
  loadSiteRelease,
  loadSiteReleaseV3,
  loadValidatedSiteReleaseV3,
} from "./load-site-release";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const v3Fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/3.0.0/fixtures/bundles/valid/site-a-minimal",
);
const temporaryRoots: string[] = [];

function mediaAssets(): ResponsiveImageAsset[] {
  const manifest = JSON.parse(
    readFileSync(join(v3Fixture, "media/media-manifest.json"), "utf8"),
  ) as MediaManifestV3;
  return manifest.items.map((media, index) =>
    projectResponsiveImageAsset(
      { media, mimeType: media.mimeType, width: media.width, height: media.height },
      `/media/items/${index}`,
    ),
  );
}

function templateConfig(releaseDirectory = fixture) {
  return resolveBuildTargetConfig(
    { CONTENT_RELEASE_DIR: releaseDirectory },
    {
      siteId: "site-a",
      templateReleaseDirectory: fixture,
      allowedProductionOrigins: [],
    },
  );
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true });
  }
});

describe("loadSiteRelease", () => {
  it("loads the validated Site A template release", () => {
    const context = loadSiteRelease(templateConfig());

    expect(context.bundle.release.releaseId).toBe("REL-2026-000042");
    expect(context.contractVersion).toBe("2.0.0");
    expect(context.canonicalOrigin).toBe("https://example.com");
    expect(context.config.noindex).toBe(true);
  });

  it("assembles a fully validated synchronous v3 release context", () => {
    const config = templateConfig(v3Fixture);
    const validated = loadValidatedSiteReleaseV3(config);
    const bound = bindValidatedSiteReleaseV3(validated, mediaAssets());
    const context = loadSiteReleaseV3(config, {
      mediaAssets: mediaAssets(),
    });

    expect(bound).toEqual(context);
    expect(validated.bundle).toEqual(context.bundle);
    expect(validated.nicheComponents).toEqual(context.nicheComponents);
    expect(context.contractVersion).toBe("3.0.0");
    expect(context.bundle.release.releaseId).toBe("REL-2026-000043");
    expect([...context.mediaAssets.keys()]).toEqual(["MED-000045", "MED-000046"]);
    expect([...context.nicheComponents.get("site-a")!.keys()]).toEqual([]);
    expect(context.canonicalOrigin).toBe("https://example.com");
  });

  it("rejects an unsupported contract before integrity validation", () => {
    const root = mkdtempSync(join(tmpdir(), "site-a-release-"));
    cpSync(fixture, root, { recursive: true });
    temporaryRoots.push(root);
    const manifest = join(root, "release.json");
    const release = JSON.parse(readFileSync(manifest, "utf8")) as Record<
      string,
      unknown
    >;
    release.contractVersion = "3.0.0";
    writeFileSync(manifest, `${JSON.stringify(release, null, 2)}\n`);

    expect(() => loadSiteRelease(templateConfig(root))).toThrowError(
      expect.objectContaining({ code: "CONTRACT_UNSUPPORTED" }),
    );
  });

  it("rejects a production origin that differs from the bundle", () => {
    expect(() =>
      loadSiteRelease({
        ...templateConfig(),
        mode: "production",
        origin: "https://site-a.example.org",
        noindex: false,
      }),
    ).toThrow("Production origin does not match bundle origin");
  });
});
