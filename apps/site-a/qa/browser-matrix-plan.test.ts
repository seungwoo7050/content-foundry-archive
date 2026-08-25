import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { planQaBrowserMatrix } from "./browser-matrix-plan";
import { planQaStaticBuilds } from "./build-matrix-plan";
import { QA_QUALITY_VARIANTS } from "./variants";
import { writeQaReleaseMatrix } from "./write-release-matrix";

const roots: string[] = [];
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "public-sites-browser-plan-"));
  roots.push(root);
  const qualityDirectory = join(root, "quality");
  mkdirSync(qualityDirectory);
  const matrixDirectory = writeQaReleaseMatrix(qualityDirectory, "releases");
  const buildPlans = planQaStaticBuilds({ matrixDirectory, qualityDirectory });
  mkdirSync(join(qualityDirectory, "sites"));
  for (const { outputDirectory } of buildPlans) mkdirSync(outputDirectory);
  return { root, qualityDirectory, buildPlans };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true });
});

describe("planQaBrowserMatrix", () => {
  it("returns fifteen frozen static sites in exact registry order", () => {
    const { qualityDirectory, buildPlans } = fixture();
    const records = planQaBrowserMatrix({ qualityDirectory, buildPlans });

    expect(records).toHaveLength(15);
    expect(records.map(({ id, theme, skin }) => ({ id, theme, skin }))).toEqual(
      QA_QUALITY_VARIANTS.map(({ id, theme, skin }) => ({ id, theme, skin })),
    );
    expect(Object.isFrozen(records)).toBe(true);
    for (const record of records) {
      expect(Object.isFrozen(record)).toBe(true);
      expect(dirname(record.staticDirectory)).toBe(join(qualityDirectory, "sites"));
      expect(record.staticDirectory).toBe(join(qualityDirectory, "sites", record.id));
    }
  });

  it("rejects missing, extra, and symbolic-link site inventory", () => {
    const missing = fixture();
    rmSync(missing.buildPlans.at(-1)!.outputDirectory, { recursive: true });
    expect(() => planQaBrowserMatrix(missing)).toThrow(/directory inventory/u);

    const extra = fixture();
    mkdirSync(join(extra.qualityDirectory, "sites", "unexpected"));
    expect(() => planQaBrowserMatrix(extra)).toThrow(/directory inventory/u);

    const linked = fixture();
    const last = linked.buildPlans.at(-1)!.outputDirectory;
    rmSync(last, { recursive: true });
    symlinkSync(linked.buildPlans[0]!.outputDirectory, last, "dir");
    expect(() => planQaBrowserMatrix(linked)).toThrow(/directory inventory/u);
  });

  it("rejects incomplete, reordered, and escaped build plans", () => {
    const { root, qualityDirectory, buildPlans } = fixture();
    expect(() => planQaBrowserMatrix({
      qualityDirectory, buildPlans: buildPlans.slice(1),
    })).toThrow(/build plan count/u);
    expect(() => planQaBrowserMatrix({
      qualityDirectory, buildPlans: [...buildPlans].reverse(),
    })).toThrow(/build plan 0/u);
    expect(() => planQaBrowserMatrix({
      qualityDirectory,
      buildPlans: buildPlans.map((plan, index) => index === 0
        ? { ...plan, outputDirectory: join(root, "escape") }
        : plan),
    })).toThrow(/static directory is missing or unsafe/u);
  });
});
