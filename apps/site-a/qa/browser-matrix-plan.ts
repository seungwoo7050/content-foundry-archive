import { lstatSync, readdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

import type { QaStaticBuildPlan } from "./build-matrix-plan";
import { QA_QUALITY_VARIANTS, type QaQualityVariant } from "./variants";

export interface QaBrowserSitePlan {
  readonly id: QaQualityVariant["id"];
  readonly theme: QaQualityVariant["theme"];
  readonly skin: QaQualityVariant["skin"];
  readonly staticDirectory: string;
}

export interface QaBrowserMatrixPlanOptions {
  readonly qualityDirectory: string;
  readonly buildPlans: readonly QaStaticBuildPlan[];
}

const reject = (message: string): never => {
  throw new Error(`Invalid QA browser matrix: ${message}`);
};

function isDirectory(path: string): boolean {
  try {
    return lstatSync(path).isDirectory();
  } catch {
    return false;
  }
}

export function planQaBrowserMatrix({
  qualityDirectory,
  buildPlans,
}: QaBrowserMatrixPlanOptions): readonly QaBrowserSitePlan[] {
  const qualityRoot = resolve(qualityDirectory);
  const sitesDirectory = join(qualityRoot, "sites");
  if (dirname(sitesDirectory) !== qualityRoot || !isDirectory(sitesDirectory)) {
    return reject("sites must be a real direct-child directory");
  }
  if (buildPlans.length !== QA_QUALITY_VARIANTS.length) {
    return reject("build plan count must match the QA registry");
  }

  const entries = readdirSync(sitesDirectory, { withFileTypes: true });
  const actualNames = entries.map(({ name }) => name).sort();
  const expectedNames = QA_QUALITY_VARIANTS.map(({ id }) => id).sort();
  if (entries.some((entry) => !entry.isDirectory())
    || actualNames.join("\n") !== expectedNames.join("\n")) {
    return reject("sites directory inventory must exactly match the QA registry");
  }

  const records = QA_QUALITY_VARIANTS.map((expected, index) => {
    const build = buildPlans[index];
    if (build?.id !== expected.id
      || build.theme !== expected.theme
      || build.skin !== expected.skin) {
      return reject(`build plan ${index} does not match ${expected.id}`);
    }
    const staticDirectory = resolve(sitesDirectory, expected.id);
    if (dirname(staticDirectory) !== sitesDirectory
      || basename(staticDirectory) !== expected.id
      || resolve(build.outputDirectory) !== staticDirectory
      || !isDirectory(staticDirectory)) {
      return reject(`static directory is missing or unsafe for ${expected.id}`);
    }
    return Object.freeze({
      id: expected.id,
      theme: expected.theme,
      skin: expected.skin,
      staticDirectory,
    });
  });
  return Object.freeze(records);
}
