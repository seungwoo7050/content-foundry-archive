import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { resolveBuildTargetConfig } from "@content-foundry/site-core";
import { afterEach, describe, expect, it } from "vitest";

import { loadSiteRelease } from "./load-site-release";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const temporaryRoots: string[] = [];

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
    expect(context.canonicalOrigin).toBe("https://example.com");
    expect(context.config.noindex).toBe(true);
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
