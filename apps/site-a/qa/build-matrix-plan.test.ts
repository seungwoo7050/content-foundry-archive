import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { planQaStaticBuilds } from "./build-matrix-plan";
import { QA_QUALITY_VARIANTS } from "./variants";
import { writeQaReleaseMatrix } from "./write-release-matrix";

type MatrixRecord = Readonly<Record<string, unknown>>;

const roots: string[] = [];
function fixture() {
  const parent = mkdtempSync(join(tmpdir(), "public-sites-qa-plan-"));
  roots.push(parent);
  const matrixDirectory = writeQaReleaseMatrix(parent, "releases");
  const manifest = JSON.parse(
    readFileSync(join(matrixDirectory, "matrix.json"), "utf8"),
  );
  return { parent, matrixDirectory, manifest };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true });
});

describe("planQaStaticBuilds", () => {
  it("returns the exact ordered preview and provider-free build plan", () => {
    const { parent, matrixDirectory } = fixture();
    const qualityDirectory = join(parent, "quality");
    const plans = planQaStaticBuilds({
      matrixDirectory,
      qualityDirectory,
    });
    expect(plans.map(({ id, theme, skin, origin }) => ({
      id, theme, skin, origin,
    }))).toEqual(QA_QUALITY_VARIANTS);
    for (const plan of plans) {
      expect([
        plan.releaseDirectory,
        plan.outputDirectory,
      ].every(isAbsolute)).toBe(true);
      expect(plan.releaseDirectory).toBe(join(matrixDirectory, plan.id));
      expect(plan.outputDirectory).toBe(join(qualityDirectory, "sites", plan.id));
      expect(plan.environment).toEqual({
        RELEASE_MODE: "preview",
        CONTENT_RELEASE_DIR: plan.releaseDirectory,
        SITE_ORIGIN: plan.origin,
        ENABLE_ANALYTICS: "false",
        ENABLE_ADS: "false",
      });
    }
  });

  it("rejects operational, reordered, and unsafe manifest entries", () => {
    const { parent, matrixDirectory, manifest } = fixture();
    const variants = manifest.variants as MatrixRecord[];
    const inputs = [
      { ...manifest, nonOperational: false },
      { ...manifest, variants: [...variants].reverse() },
      {
        ...manifest,
        variants: variants.map((entry, index) => index === 0
          ? { ...entry, releaseDirectory: "../escape" }
          : entry),
      },
    ];
    for (const input of inputs) {
      expect(() => planQaStaticBuilds({
        matrixDirectory,
        qualityDirectory: join(parent, "quality"),
        manifest: input,
      })).toThrow(/Invalid QA build matrix/u);
    }
  });

  it("rejects a registered release whose directory is absent", () => {
    const { parent, matrixDirectory, manifest } = fixture();
    const missing = QA_QUALITY_VARIANTS.at(-1)!.id;
    rmSync(join(matrixDirectory, missing), { recursive: true });
    expect(() => planQaStaticBuilds({
      matrixDirectory,
      qualityDirectory: join(parent, "quality"),
      manifest,
    })).toThrow(/release directory is missing/u);
  });
});
