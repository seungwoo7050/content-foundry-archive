import { existsSync, lstatSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { qaArticles } from "./articles";
import type { QaStaticBuildPlan } from "./build-matrix-plan";
import { qaMediaAssets } from "./media-assets";

type IdentityPlan = Pick<QaStaticBuildPlan, "outputDirectory" | "theme" | "skin">;
type ArtifactPlan = IdentityPlan & Pick<QaStaticBuildPlan, "origin">;
const checksumPattern = /^sha256:(?!0{64}$)[0-9a-f]{64}$/u;
const supportedVersions = ["2.0.0", "3.0.0", "4.0.0"];

const reject = (message: string): never => {
  throw new Error(`Invalid QA static identity: ${message}`);
};

function readArtifact(plan: IdentityPlan, path: string): string {
  const target = join(plan.outputDirectory, path);
  if (!existsSync(target)) return reject(`missing ${path}`);
  if (!lstatSync(target).isFile()) return reject(`${path} is not a file`);
  return readFileSync(target, "utf8");
}

export function verifyQaStaticSiteIdentity(plan: IdentityPlan) {
  const identity = JSON.parse(readArtifact(plan, "_release.json"));
  if (identity.releaseId !== "REL-QA-20260825-000001"
    || identity.siteId !== "site-a"
    || identity.contractVersion !== "4.0.0"
    || identity.routeCount !== 33
    || !checksumPattern.test(identity.bundleChecksum)
    || !checksumPattern.test(identity.buildConfigChecksum)
    || JSON.stringify(identity.supportedContractVersions)
      !== JSON.stringify(supportedVersions)) return reject("release mismatch");

  const home = readArtifact(plan, "index.html");
  if (!/<meta name="robots" content="[^"]*noindex/iu.test(home)) {
    return reject("home is indexable");
  }
  for (const marker of [
    `data-theme="${plan.theme}"`,
    `data-skin="${plan.skin}"`,
    "QA 비운영",
    `<meta name="content-foundry-build-config-checksum" content="${identity.buildConfigChecksum}"`,
  ]) {
    if (!home.includes(marker)) return reject(`home is missing ${marker}`);
  }
  return Object.freeze({ routeCount: identity.routeCount as number });
}

export function verifyQaStaticSiteArtifacts(plan: ArtifactPlan) {
  const identity = JSON.parse(readArtifact(plan, "_release.json"));
  if (readArtifact(plan, "robots.txt") !== "User-Agent: *\nDisallow: /\n\n") {
    return reject("robots policy mismatch");
  }
  if (readArtifact(plan, "ads.txt") !== "") return reject("ads.txt is not empty");
  const sitemap = readArtifact(plan, "sitemap.xml");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)]
    .flatMap((match) => match[1] ? [match[1]] : []);
  if (locations.length === 0
    || locations.some((location) => !location.startsWith(`${plan.origin}/`))) {
    return reject("sitemap origin mismatch");
  }
  const search = JSON.parse(readArtifact(plan, "search-index.json"));
  const expectedArticle = qaArticles[0]!;
  const representative = search.entries?.find(
    ({ path }: { path?: unknown }) => path === expectedArticle.seo.canonicalPath,
  );
  if (search.schemaVersion !== "1.0.0" || search.locale !== "ko-KR"
    || search.release?.bundleChecksum !== identity.bundleChecksum
    || search.entries?.length !== 17
    || representative?.title !== expectedArticle.title) {
    return reject("search index mismatch");
  }
  if (qaMediaAssets.length !== 5) return reject("media catalog count mismatch");
  for (const asset of qaMediaAssets) {
    readArtifact(plan, `_media/${asset.sha256}/source.webp`);
  }
  return Object.freeze({ searchCount: search.entries.length, mediaCount: 5 });
}
