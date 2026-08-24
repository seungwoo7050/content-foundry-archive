import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import type { MediaManifestV3 } from "@content-foundry/content-contract";
import type { BuildTargetConfig } from "@content-foundry/site-core";
import { afterEach, describe, expect, it, vi } from "vitest";

const loaderOverride = vi.hoisted(() => ({
  mediaManifest: undefined as MediaManifestV3 | undefined,
}));

vi.mock("./load-site-release", async (importOriginal) => {
  const loader = await importOriginal<typeof import("./load-site-release")>();
  return {
    ...loader,
    loadValidatedSiteRelease: (config: BuildTargetConfig) => {
      const context = loader.loadValidatedSiteRelease(config);
      return loaderOverride.mediaManifest && context.contractVersion === "3.0.0"
        ? {
            ...context,
            bundle: { ...context.bundle, mediaManifest: loaderOverride.mediaManifest },
          }
        : context;
    },
  };
});

import { prepareSiteRelease } from "./prepare-site-release";

const fixture = (version: "2.0.0" | "3.0.0") =>
  resolve(
    process.cwd(),
    `../../packages/content-contract/vendor/${version}/fixtures/bundles/valid/site-a-minimal`,
  );
const payloads = [
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFklEQVR42mO4/erff0oww6gBowYAMQBJjx0/o2g2tAAAAABJRU5ErkJggg==",
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFklEQVR42mO48+f5f0oww6gBowYAMQDDohr/igFCLQAAAABJRU5ErkJggg==",
].map((value) => Buffer.from(value, "base64"));
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

function workspace() {
  const root = mkdtempSync(join(tmpdir(), "site-release-preparation-"));
  roots.push(root);
  return {
    root,
    dispositionPath: join(root, ".site-build/route-dispositions.json"),
    projectionPath: join(root, ".site-build/media-projection.json"),
    publicDirectory: join(root, "public"),
    immutableObjectDirectory: join(root, "immutable"),
  };
}

function writeV3Objects(root: string) {
  const releaseDirectory = fixture("3.0.0");
  const manifest = JSON.parse(
    readFileSync(join(releaseDirectory, "media/media-manifest.json"), "utf8"),
  ) as MediaManifestV3;
  manifest.items.forEach((media, index) => {
    const target = join(root, media.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, payloads[index]!);
  });
}

function writePriorArtifacts(paths: ReturnType<typeof workspace>) {
  mkdirSync(join(paths.publicDirectory, "_media"), { recursive: true });
  mkdirSync(dirname(paths.projectionPath), { recursive: true });
  writeFileSync(join(paths.publicDirectory, "_media/generated.webp"), "generated");
  writeFileSync(paths.projectionPath, "projection");
  writeFileSync(paths.dispositionPath, "prior dispositions");
}

afterEach(() => {
  loaderOverride.mediaManifest = undefined;
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("prepareSiteRelease", () => {
  it("validates v2 before clearing only its generated artifacts", async () => {
    const paths = workspace();
    writePriorArtifacts(paths);

    await expect(prepareSiteRelease(config(fixture("2.0.0")), paths)).resolves.toBe(
      "2.0.0",
    );
    expect(existsSync(join(paths.publicDirectory, "_media"))).toBe(false);
    expect(existsSync(paths.projectionPath)).toBe(false);
    expect(JSON.parse(readFileSync(paths.dispositionPath, "utf8"))).toMatchObject({
      release: { releaseId: "REL-2026-000042" },
      items: [],
    });
  });

  it("requires an immutable-object directory for a validated v3 release", async () => {
    const workspacePaths = workspace();
    writePriorArtifacts(workspacePaths);
    const paths = {
      dispositionPath: workspacePaths.dispositionPath,
      projectionPath: workspacePaths.projectionPath,
      publicDirectory: workspacePaths.publicDirectory,
    };

    await expect(prepareSiteRelease(config(fixture("3.0.0")), paths)).rejects.toThrow(
      "IMMUTABLE_MEDIA_DIR is required for contract 3.0.0",
    );
    expect(readFileSync(paths.projectionPath, "utf8")).toBe("projection");
    expect(
      readFileSync(join(paths.publicDirectory, "_media/generated.webp"), "utf8"),
    ).toBe("generated");
    expect(readFileSync(workspacePaths.dispositionPath, "utf8")).toBe(
      "prior dispositions",
    );
  });

  it("preserves prior artifacts when the selected release is invalid", async () => {
    const paths = workspace();
    writePriorArtifacts(paths);

    await expect(
      prepareSiteRelease(config(join(paths.root, "missing-release")), paths),
    ).rejects.toBeDefined();
    expect(readFileSync(paths.projectionPath, "utf8")).toBe("projection");
    expect(
      readFileSync(join(paths.publicDirectory, "_media/generated.webp"), "utf8"),
    ).toBe("generated");
    expect(readFileSync(paths.dispositionPath, "utf8")).toBe(
      "prior dispositions",
    );
  });

  it("preserves prior artifacts when production readiness fails", async () => {
    const paths = workspace();
    writePriorArtifacts(paths);
    const productionConfig: BuildTargetConfig = {
      ...config(fixture("2.0.0")),
      mode: "production",
      origin: "https://example.com",
      noindex: false,
    };

    await expect(prepareSiteRelease(productionConfig, paths)).rejects.toThrow(
      "production origin must not use reserved hostname example.com",
    );
    expect(readFileSync(paths.projectionPath, "utf8")).toBe("projection");
    expect(
      readFileSync(join(paths.publicDirectory, "_media/generated.webp"), "utf8"),
    ).toBe("generated");
    expect(readFileSync(paths.dispositionPath, "utf8")).toBe(
      "prior dispositions",
    );
  });

  it("restores prior dispositions when v3 media publication fails", async () => {
    const paths = workspace();
    writePriorArtifacts(paths);

    await expect(
      prepareSiteRelease(config(fixture("3.0.0")), paths),
    ).rejects.toMatchObject({ code: "TEMPORARY" });
    expect(readFileSync(paths.projectionPath, "utf8")).toBe("projection");
    expect(
      readFileSync(join(paths.publicDirectory, "_media/generated.webp"), "utf8"),
    ).toBe("generated");
    expect(readFileSync(paths.dispositionPath, "utf8")).toBe(
      "prior dispositions",
    );
  });

  it("publishes the complete v3 projection", async () => {
    const paths = workspace();
    writePriorArtifacts(paths);
    writeV3Objects(paths.immutableObjectDirectory);

    await expect(prepareSiteRelease(config(fixture("3.0.0")), paths)).resolves.toBe(
      "3.0.0",
    );
    expect(readFileSync(paths.projectionPath, "utf8")).toContain("REL-2026-000043");
    expect(existsSync(join(paths.publicDirectory, "_media"))).toBe(true);
    expect(JSON.parse(readFileSync(paths.dispositionPath, "utf8"))).toMatchObject({
      release: { releaseId: "REL-2026-000043" },
      items: [],
    });
  });

  it("prepares an empty v3 media manifest without an immutable-object root", async () => {
    const paths = workspace();
    loaderOverride.mediaManifest = { items: [] };

    await expect(
      prepareSiteRelease(config(fixture("3.0.0")), {
        dispositionPath: paths.dispositionPath,
        projectionPath: paths.projectionPath,
        publicDirectory: paths.publicDirectory,
      }),
    ).resolves.toBe("3.0.0");
    expect(JSON.parse(readFileSync(paths.projectionPath, "utf8"))).toMatchObject({
      contractVersion: "3.0.0",
      assets: [],
    });
    expect(JSON.parse(readFileSync(paths.dispositionPath, "utf8"))).toMatchObject({
      release: { releaseId: "REL-2026-000043" },
      items: [],
    });
  });
});
