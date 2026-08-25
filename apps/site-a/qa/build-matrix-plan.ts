import { existsSync, lstatSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { QA_QUALITY_VARIANTS, type QaQualityVariant } from "./variants";

type MatrixRecord = Readonly<Record<string, unknown>>;

export interface QaStaticBuildPlan {
  readonly id: QaQualityVariant["id"];
  readonly theme: QaQualityVariant["theme"];
  readonly skin: QaQualityVariant["skin"];
  readonly origin: QaQualityVariant["origin"];
  readonly releaseDirectory: string;
  readonly outputDirectory: string;
  readonly environment: Readonly<{
    RELEASE_MODE: "preview";
    CONTENT_RELEASE_DIR: string;
    SITE_ORIGIN: QaQualityVariant["origin"];
    ENABLE_ANALYTICS: "false";
    ENABLE_ADS: "false";
  }>;
}

export interface QaStaticBuildPlanOptions {
  readonly matrixDirectory: string;
  readonly qualityDirectory: string;
  readonly manifest?: unknown;
}

const isRecord = (value: unknown): value is MatrixRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const reject = (message: string): never => {
  throw new Error(`Invalid QA build matrix: ${message}`);
};

function matchesVariant(entry: MatrixRecord, expected: QaQualityVariant): boolean {
  return entry.id === expected.id
    && entry.theme === expected.theme
    && entry.skin === expected.skin
    && entry.origin === expected.origin
    && entry.releaseDirectory === expected.id;
}

export function planQaStaticBuilds(
  options: QaStaticBuildPlanOptions,
): readonly QaStaticBuildPlan[] {
  const matrixDirectory = resolve(options.matrixDirectory);
  const qualityDirectory = resolve(options.qualityDirectory);
  const manifest = options.manifest ?? JSON.parse(
    readFileSync(join(matrixDirectory, "matrix.json"), "utf8"),
  );
  if (!isRecord(manifest) || manifest.nonOperational !== true) {
    return reject("nonOperational must be true");
  }
  const variants = manifest.variants;
  if (!Array.isArray(variants)
    || variants.length !== QA_QUALITY_VARIANTS.length) {
    return reject("variant count must match the QA registry");
  }
  const plans = QA_QUALITY_VARIANTS.map((expected, index) => {
    const entry = variants[index];
    if (!isRecord(entry) || !matchesVariant(entry, expected)) {
      return reject(`variant ${index} does not match ${expected.id}`);
    }
    const releaseDirectory = resolve(matrixDirectory, expected.id);
    if (dirname(releaseDirectory) !== matrixDirectory
      || !existsSync(releaseDirectory)
      || !lstatSync(releaseDirectory).isDirectory()) {
      return reject(`release directory is missing or unsafe for ${expected.id}`);
    }
    return Object.freeze({
      ...expected,
      releaseDirectory,
      outputDirectory: join(qualityDirectory, "sites", expected.id),
      environment: Object.freeze({
        RELEASE_MODE: "preview" as const,
        CONTENT_RELEASE_DIR: releaseDirectory,
        SITE_ORIGIN: expected.origin,
        ENABLE_ANALYTICS: "false" as const,
        ENABLE_ADS: "false" as const,
      }),
    });
  });
  return Object.freeze(plans);
}
