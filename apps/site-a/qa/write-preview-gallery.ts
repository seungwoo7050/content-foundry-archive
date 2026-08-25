import { lstatSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import type { QaStaticBuildPlan } from "./build-matrix-plan";
import { renderQaPreviewGallery } from "./render-preview-gallery";
import { QA_QUALITY_VARIANTS } from "./variants";

const reject = (message: string): never => {
  throw new Error(`Invalid QA preview gallery: ${message}`);
};

const shellQuote = (value: string): string => `'${value.replaceAll("'", `'"'"'`)}'`;

function isReviewServeConfig(path: string): boolean {
  try {
    const value: unknown = JSON.parse(readFileSync(path, "utf8"));
    return typeof value === "object" && value !== null && !Array.isArray(value)
      && Object.keys(value).length === 1 && "cleanUrls" in value
      && value.cleanUrls === true;
  } catch {
    return false;
  }
}

interface QaPreviewGalleryOptions {
  readonly plans: readonly QaStaticBuildPlan[];
  readonly qualityDirectory: string;
  readonly repositoryDirectory: string;
}

export function writeQaPreviewGallery({
  plans,
  qualityDirectory,
  repositoryDirectory,
}: QaPreviewGalleryOptions): string {
  const repositoryRoot = resolve(repositoryDirectory);
  const qualityRoot = resolve(qualityDirectory);
  const serveConfig = join(repositoryRoot, "serve.json");
  const releasesDirectory = join(qualityRoot, "releases");
  const sitesDirectory = join(qualityRoot, "sites");
  const target = join(qualityRoot, "preview-gallery.html");
  if (!lstatSync(serveConfig).isFile() || !isReviewServeConfig(serveConfig)) {
    return reject("serve config must contain only cleanUrls true");
  }
  const entries = readdirSync(sitesDirectory, { withFileTypes: true });
  const expectedNames = QA_QUALITY_VARIANTS.map(({ id }) => id).sort();
  if (entries.some((entry) => !entry.isDirectory())
    || entries.map(({ name }) => name).sort().join("\n") !== expectedNames.join("\n")) {
    return reject("site inventory must exactly match the QA registry");
  }
  if (plans.length !== QA_QUALITY_VARIANTS.length) {
    return reject("plan count must exactly match the QA registry");
  }

  const cards = QA_QUALITY_VARIANTS.map((expected, index) => {
    const plan = plans[index];
    const releaseDirectory = join(releasesDirectory, expected.id);
    const outputDirectory = join(sitesDirectory, expected.id);
    if (plan?.id !== expected.id || plan.theme !== expected.theme
      || plan.skin !== expected.skin || plan.origin !== expected.origin
      || resolve(plan.releaseDirectory) !== releaseDirectory
      || resolve(plan.outputDirectory) !== outputDirectory
      || plan.environment.RELEASE_MODE !== "preview"
      || resolve(plan.environment.CONTENT_RELEASE_DIR) !== releaseDirectory
      || plan.environment.SITE_ORIGIN !== expected.origin
      || plan.environment.ENABLE_ANALYTICS !== "false"
      || plan.environment.ENABLE_ADS !== "false"
      || !lstatSync(outputDirectory).isDirectory()) {
      return reject(`plan ${index} does not match ${expected.id}`);
    }
    const homePath = join(outputDirectory, "index.html");
    if (!lstatSync(homePath).isFile()) return reject(`home is missing for ${expected.id}`);
    const home = readFileSync(homePath, "utf8");
    if (!/<meta name="robots" content="[^"]*noindex/iu.test(home)
      || !home.includes(`data-theme="${expected.theme}"`)
      || !home.includes(`data-skin="${expected.skin}"`)
      || !home.includes("QA 비운영")) {
      return reject(`home identity does not match ${expected.id}`);
    }
    const outputLocator = relative(repositoryRoot, outputDirectory);
    const configLocator = relative(outputDirectory, serveConfig);
    if (outputLocator.length === 0 || configLocator.length === 0) {
      return reject(`review paths are not relative for ${expected.id}`);
    }
    const command = `NO_UPDATE_CHECK=1 pnpm exec serve ${shellQuote(outputLocator)} `
      + `--config ${shellQuote(configLocator)} `
      + "--listen 'tcp://127.0.0.1:4173' --no-clipboard";
    return { command, origin: expected.origin, outputLocator, skin: expected.skin,
      theme: expected.theme };
  });
  const html = renderQaPreviewGallery(cards);
  writeFileSync(target, html, { encoding: "utf8", flag: "wx" });
  return target;
}
