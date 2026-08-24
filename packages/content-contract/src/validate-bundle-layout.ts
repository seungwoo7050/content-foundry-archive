import { ContractError } from "./errors.js";

const REQUIRED_PAYLOAD_PATHS: ReadonlySet<string> = new Set([
  "site.json",
  "navigation.json",
  "taxonomy.json",
  "redirects.json",
  "media/media-manifest.json",
]);

const ARTICLE_PATH = /^articles\/ART-[A-Z0-9-]+\.json$/;
const PAGE_PATH = /^pages\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/;
const MEDIA_PATH = /^media\/.+$/;

const fail = (message: string): never => {
  throw new ContractError("INTEGRITY_FAILED", message);
};

export function validateBundleLayout(paths: readonly string[]): void {
  for (const required of REQUIRED_PAYLOAD_PATHS) {
    if (!paths.includes(required)) {
      fail(`Missing required bundle path: ${required}`);
    }
  }

  for (const path of paths) {
    if (
      REQUIRED_PAYLOAD_PATHS.has(path) ||
      ARTICLE_PATH.test(path) ||
      PAGE_PATH.test(path) ||
      MEDIA_PATH.test(path)
    ) {
      continue;
    }
    fail(`Noncanonical bundle path: ${path}`);
  }
}
