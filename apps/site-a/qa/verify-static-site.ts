import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { qaArticles } from "./articles";
import type { QaStaticBuildPlan } from "./build-matrix-plan";
import { qaMediaAssets } from "./media-assets";

type IdentityPlan = Pick<QaStaticBuildPlan, "outputDirectory" | "theme" | "skin">;
type ArtifactPlan = IdentityPlan & Pick<QaStaticBuildPlan, "origin">;
const checksumPattern = /^sha256:(?!0{64}$)[0-9a-f]{64}$/u;
const supportedVersions = ["2.0.0", "3.0.0", "4.0.0"];
export const QA_CORE_HTML_ARTIFACTS = Object.freeze([
  ["index.html", ""],
  ["archive.html", "/archive"],
  ["archive/page/2.html", "/archive/page/2"],
  ["category/field-notes.html", "/category/field-notes"],
  ["category/field-notes/page/2.html", "/category/field-notes/page/2"],
  ["search.html", "/search"],
  ["about.html", "/about"],
  ["contact.html", "/contact"],
  ["privacy.html", "/privacy"],
  ["advertising-disclosure.html", "/advertising-disclosure"],
  ["404.html", null],
  ["retired/qa-old-guide.html", null],
  [
    "article/qa-nonproduction-very-long-korean-title-layout-table-code-command-gallery-faq-source-update-related-action.html",
    "/article/qa-nonproduction-very-long-korean-title-layout-table-code-command-gallery-faq-source-update-related-action",
  ],
] as const);
export const QA_PAGINATION_ARTIFACTS = Object.freeze([
  ["archive/page/2.html", "/archive/page/2", "/archive"],
  ["category/field-notes/page/2.html", "/category/field-notes/page/2", "/category/field-notes"],
] as const);

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

export function verifyQaStaticHtmlCorpus(plan: ArtifactPlan) {
  const identity = JSON.parse(readArtifact(plan, "_release.json"));
  for (const [path, canonicalPath] of QA_CORE_HTML_ARTIFACTS) {
    const html = readArtifact(plan, path);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/iu)?.[1];
    const expected = canonicalPath === null ? undefined : `${plan.origin}${canonicalPath}`;
    if (canonical !== expected) return reject(`${path} canonical mismatch`);
    if (!/<meta name="robots" content="[^"]*noindex/iu.test(html)) {
      return reject(`${path} is indexable`);
    }
    for (const marker of [
      `data-theme="${plan.theme}"`,
      `data-skin="${plan.skin}"`,
      "QA 비운영",
      `<meta name="content-foundry-build-config-checksum" content="${identity.buildConfigChecksum}"`,
    ]) {
      if (!html.includes(marker)) return reject(`${path} is missing ${marker}`);
    }
  }
  return Object.freeze({ htmlCount: QA_CORE_HTML_ARTIFACTS.length });
}

function relAnchorHrefs(html: string, rel: "prev" | "next"): string[] {
  return [...html.matchAll(/<a\b([^>]*)>/giu)].flatMap((match) => {
    const attributes = match[1] ?? "";
    if (!attributes.includes(`rel="${rel}"`)) return [];
    const href = attributes.match(/\bhref="([^"]+)"/iu)?.[1];
    return href ? [href] : [];
  });
}

function listPaginationRoutes(root: string, directory = ""): string[] {
  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listPaginationRoutes(root, path);
    return /^(?:archive|category\/[^/]+)\/page\/(?:[2-9]|[1-9][0-9]+)\.html$/u.test(path)
      ? [`/${path.slice(0, -5)}`]
      : [];
  });
}

export function verifyQaStaticPagination(plan: ArtifactPlan) {
  for (const [path, route, previous] of QA_PAGINATION_ARTIFACTS) {
    const html = readArtifact(plan, path);
    if (!/<title>[^<]*2페이지/iu.test(html)) return reject(`${path} title mismatch`);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/iu)?.[1];
    if (canonical !== `${plan.origin}${route}`) return reject(`${path} canonical mismatch`);
    if (JSON.stringify(relAnchorHrefs(html, "prev")) !== JSON.stringify([previous])) {
      return reject(`${path} previous anchor mismatch`);
    }
    if (relAnchorHrefs(html, "next").length > 0) return reject(`${path} has a next anchor`);
  }
  const expected = QA_PAGINATION_ARTIFACTS.map(([, route]) => route).sort();
  const exported = listPaginationRoutes(plan.outputDirectory).sort();
  const sitemap = readArtifact(plan, "sitemap.xml");
  const indexed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)]
    .flatMap((match) => match[1] ? [new URL(match[1]).pathname] : [])
    .filter((route) => /\/page\/(?:[2-9]|[1-9][0-9]+)$/u.test(route))
    .sort();
  if (JSON.stringify(exported) !== JSON.stringify(expected)
    || JSON.stringify(indexed) !== JSON.stringify(expected)) {
    return reject("pagination route inventory mismatch");
  }
  return Object.freeze({ paginationCount: expected.length });
}
