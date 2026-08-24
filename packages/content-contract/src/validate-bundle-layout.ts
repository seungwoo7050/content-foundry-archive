import { ContractError } from "./errors.js";

const REQUIRED_PAYLOAD_PATHS = [
  "site.json",
  "navigation.json",
  "taxonomy.json",
  "redirects.json",
  "media/media-manifest.json",
] as const;
const PRESENTATION_PATH = "presentation.json";

const ARTICLE_PATH = /^articles\/ART-[A-Z0-9-]+\.json$/;
const PAGE_PATH = /^pages\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/;
const MEDIA_PATH = /^media\/.+$/;

const fail = (message: string): never => {
  throw new ContractError("INTEGRITY_FAILED", message);
};

export type BundleLayoutVersion = "2.0.0" | "3.0.0" | "4.0.0";

export function validateBundleLayoutForVersion(
  version: BundleLayoutVersion,
  paths: readonly string[],
): void {
  const requiredPaths = new Set<string>(REQUIRED_PAYLOAD_PATHS);
  if (version === "4.0.0") requiredPaths.add(PRESENTATION_PATH);

  for (const required of requiredPaths) {
    if (!paths.includes(required)) {
      fail(`Missing required bundle path: ${required}`);
    }
  }

  for (const path of paths) {
    if (
      requiredPaths.has(path) ||
      ARTICLE_PATH.test(path) ||
      PAGE_PATH.test(path) ||
      MEDIA_PATH.test(path)
    ) {
      continue;
    }
    fail(`Noncanonical bundle path: ${path}`);
  }
}

export function validateBundleLayout(paths: readonly string[]): void {
  validateBundleLayoutForVersion("2.0.0", paths);
}
